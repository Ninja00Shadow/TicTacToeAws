from django.core.files.storage import default_storage
from django.shortcuts import render, HttpResponse, redirect
from rest_framework import status

from game.models import *
from django.contrib import messages
from rest_framework.views import APIView
from rest_framework.response import Response

from rest_framework.generics import GenericAPIView
from rest_framework.mixins import RetrieveModelMixin
from rest_framework.permissions import IsAuthenticated, AllowAny

from game.serializers import UserSerializer


class IndexView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        return Response(status=status.HTTP_200_OK)

    def post(self, request):
        playerName = request.data.get("player-name", "Unknown Player")
        print(playerName)

        if playerName == "":
            return Response(status=status.HTTP_400_BAD_REQUEST, data={"error": "Please enter a valid name."})

        if len(Room.objects.filter(closed__exact=False)) <= 0:
            user = User.objects.get(username=playerName)
            room = Room.objects.create(player1=user)
        else:
            room = Room.objects.filter(closed__exact=False).first()
            user = User.objects.get(username=playerName)
            room.player2 = user
            room.closed = True
            room.save()

        return Response(data={"id": room.id, "name": playerName}, status=status.HTTP_200_OK)


class GameView(APIView):
    permission_classes = (IsAuthenticated,)

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
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user

    def get(self, request, *args, **kwargs):
        """
        User profile
        Get profile of current logged in user.
        """
        return self.retrieve(request, *args, **kwargs)


class SignupUser(APIView):
    def post(self, request, *args, **kwargs):
        print(request.data)

        file = request.FILES.get('avatar')
        username = request.data.get('username')
        email = request.data.get('email')

        user = User.objects.create(username=username, email=email, avatar=file)

        return Response(status=status.HTTP_201_CREATED)


class GetAvatar(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = []

    def get(self, request, username=None):
        try:
            user = User.objects.get(username=username)
            if user.avatar:
                return HttpResponse(user.avatar, content_type='image/png')
            else:
                return HttpResponse("No avatar available", status=404)
        except User.DoesNotExist:
            return HttpResponse("User not found", status=404)


class GetMatches(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, username=None):
        try:
            user = User.objects.get(username=username)
            rooms = Room.objects.filter(player1=user) | Room.objects.filter(player2=user)

            matches = []
            for room in rooms:
                opponent = room.player2.username if room.player1 == user else room.player1.username
                outcome = room.who_won
                matches.append({"opponent": opponent, "outcome": outcome})

            return Response(data={"matches": matches}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
