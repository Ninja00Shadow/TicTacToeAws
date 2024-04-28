from django.shortcuts import render, HttpResponse, redirect
from rest_framework import status

from game.models import *
from django.contrib import messages
from rest_framework.views import APIView
from rest_framework.response import Response

from rest_framework.generics import GenericAPIView
from rest_framework.mixins import RetrieveModelMixin
from rest_framework.permissions import IsAuthenticated

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
            room = Room.objects.create(player1=playerName)
        else:
            room = Room.objects.filter(closed__exact=False).first()
            room.player2 = playerName
            room.closed = True
            room.save()

        return Response(data={"id": room.id, "name": playerName}, status=status.HTTP_200_OK)


class GameView(APIView):
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
