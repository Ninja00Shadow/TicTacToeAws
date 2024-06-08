from django.contrib import admin
from django.urls import path
from .views import *

urlpatterns = [
    path("", IndexView.as_view(), name="index"),
    path("game/<int:id>/<str:name>/", GameView.as_view(), name="game"),
    path('v1/me', UserProfileAPIView.as_view(), name='my_profile'),
    path('signup', SignupUser.as_view(), name='signup'),
    path('avatar/<str:username>', GetAvatar.as_view(), name='avatar'),
    path('matches', GetAllMatches.as_view(), name='matches'),
]