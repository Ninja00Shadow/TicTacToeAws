from pathlib import Path

from django.conf import settings
from django.contrib import messages
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.http import FileResponse
from django.shortcuts import HttpResponse, redirect
from django.utils.text import get_valid_filename
from rest_framework import status

from game.models import *
from rest_framework.views import APIView
from rest_framework.response import Response

from rest_framework.generics import GenericAPIView
from rest_framework.mixins import RetrieveModelMixin
from rest_framework.permissions import IsAuthenticated, AllowAny

from game.serializers import UserSerializer


def auth_permissions():
    return (AllowAny,) if settings.AUTH_MODE == 'local' else (IsAuthenticated,)


def local_avatar_path(username, uploaded_file=None):
    safe_username = get_valid_filename(username)
    extension = Path(uploaded_file.name).suffix.lower() if uploaded_file else '.png'
    return settings.MEDIA_ROOT / 'avatars' / f'{safe_username}{extension}'


class IndexView(APIView):
    permission_classes = auth_permissions()

    def get(self, request):
        return Response(status=status.HTTP_200_OK)

    def post(self, request):
        playerName = request.data.get("player-name", "Unknown Player")
        print(playerName)

        if playerName == "":
            return Response(status=status.HTTP_400_BAD_REQUEST, data={"error": "Please enter a valid name."})

        if len(Room.objects.filter(closed__exact=False)) <= 0:
            user, _ = User.objects.get_or_create(username=playerName, defaults={'email': ''})
            room = Room.objects.create(player1=user)
        else:
            room = Room.objects.filter(closed__exact=False).first()
            user, _ = User.objects.get_or_create(username=playerName, defaults={'email': ''})
            room.player2 = user
            room.closed = True
            room.save()

        return Response(data={"id": room.id, "name": playerName}, status=status.HTTP_200_OK)


class GameView(APIView):
    permission_classes = auth_permissions()

    def get(self, request, id=None, name=None):
        try:
            room = Room.objects.get(id=id)
        except Room.DoesNotExist:
            messages.error(request, "Wrong url, please don't try to break the game.")
            return redirect("/")

        if room.closed and (room.player2 != name):
            return redirect("/")
        else:
            return Response({"name": name}, status=status.HTTP_200_OK)

    def post(self, request):
        pass


# def index(request):
#     if request.method == "GET":
#         return render(request, "index.html")
#     elif request.method == "POST":
#         playerName = request.POST.get("player-name", "Unknown Player")
#
#         if playerName == "":
#             messages.error(request, "Please enter a valid name.")
#             return redirect("/")
#
#         if len(Room.objects.filter(closed__exact=False)) <= 0:
#             room = Room.objects.create(player1=playerName)
#         else:
#             room = Room.objects.filter(closed__exact=False).first()
#             room.player2 = playerName
#             room.closed = True
#             room.save()
#
#         return redirect(f"/game/{room.id}/{playerName}/")


# def game(request, id=None, name=None):
#     print(id)
#     try:
#         room = Room.objects.get(id=id)
#     except Room.DoesNotExist:
#         messages.error(request, "Wrong url, please don't try to break the game.")
#         return redirect("/")
#
#     if room.closed and (room.player2 != name):
#         print("Room is closed")
#         return redirect("/")
#     else:
#         return render(request, "game.html", {"room": room, "name": name})


class UserProfileAPIView(RetrieveModelMixin, GenericAPIView):
    serializer_class = UserSerializer
    permission_classes = auth_permissions()

    def get_object(self):
        return self.request.user

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)


class LoginUser(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        if settings.AUTH_MODE != 'local':
            return Response({'error': 'Local login is disabled.'}, status=status.HTTP_400_BAD_REQUEST)

        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Invalid username or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        return Response({
            'username': user.username,
            'accessToken': {'jwtToken': 'local-demo-token'},
        }, status=status.HTTP_200_OK)


class SignupUser(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        file = request.FILES.get('avatar')
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        if not username:
            return Response({'error': 'Username is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if settings.AUTH_MODE == 'local' and not password:
            return Response({'error': 'Password is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if settings.AUTH_MODE != 'local' and password:
            return Response({'error': 'Password must not be sent to this endpoint outside local mode.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create(username=username, email=email)
        if password:
            try:
                validate_password(password, user)
            except ValidationError as error:
                user.delete()
                return Response({'error': list(error.messages)}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()

        bucket_name = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', None)
        if file and settings.AUTH_MODE == 'local':
            avatar_path = local_avatar_path(username, file)
            avatar_path.parent.mkdir(parents=True, exist_ok=True)
            with avatar_path.open('wb+') as destination:
                for chunk in file.chunks():
                    destination.write(chunk)
        elif file and bucket_name:
            from boto3 import client

            s3_client = client('s3', region_name=getattr(settings, 'AWS_REGION', 'us-east-1'))
            s3_client.upload_fileobj(file, bucket_name, f"avatars/{username}.png")

        return Response(status=status.HTTP_201_CREATED)


class GetAvatar(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = []

    def get(self, request, username=None):
        if settings.AUTH_MODE == 'local':
            avatar_dir = settings.MEDIA_ROOT / 'avatars'
            safe_username = get_valid_filename(username)
            avatar = next(avatar_dir.glob(f'{safe_username}.*'), None) if avatar_dir.exists() else None
            if avatar:
                return FileResponse(avatar.open('rb'))
            return HttpResponse('No avatar available', status=404)

        return HttpResponse('Avatar endpoint is not configured for this auth mode', status=404)


class GetAllMatches(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = []

    def get(self, request):
        rooms = Room.objects.all()

        matches = []
        for room in rooms:
            if room.player2 is not None:
                matches.append({"player1": room.player1.username, "player2": room.player2.username, "winner": room.who_won.username if room.who_won else None})

        return Response(data={"matches": matches}, status=status.HTTP_200_OK)
