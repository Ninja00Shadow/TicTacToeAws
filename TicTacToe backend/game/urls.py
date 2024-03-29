from django.contrib import admin
from django.urls import path
from .views import *

urlpatterns = [
    path("", IndexView.as_view(), name="index"),
    path("game/<int:id>/<str:name>/", GameView.as_view(), name="game"),
]