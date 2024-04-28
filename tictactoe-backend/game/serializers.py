from rest_framework import serializers
from .models import Room, User


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    """ Used to retrieve user info """

    class Meta:
        model = User
        fields = '__all__'
