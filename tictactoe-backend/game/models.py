import uuid
from django.db import models

from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin, UserManager
from django.contrib.auth.validators import UnicodeUsernameValidator

from core.models import AbstractBaseModel


class Room(models.Model):
    id = models.AutoField(primary_key=True)
    closed = models.BooleanField(default=False, null=False, blank=False)
    player1 = models.ForeignKey('User', on_delete=models.CASCADE, related_name='player1', null=True, blank=True)
    player2 = models.ForeignKey('User', on_delete=models.CASCADE, related_name='player2', null=True, blank=True)
    who_won = models.ForeignKey('User', on_delete=models.CASCADE, related_name='who_won', null=True, blank=True)

    def get_players(self):
        return [self.player1, self.player2]

    def get_player_names(self):
        return [self.player1.username, self.player2.username if self.player2 else None]

    def __str__(self) -> str:
        return f"{self.id} ({'Closed' if self.closed else 'Open'}) - {self.player1} vs {self.player2 if self.player2 else 'Waiting...'}"


class User(PermissionsMixin, AbstractBaseUser, AbstractBaseModel):
    username_validator = UnicodeUsernameValidator()

    username = models.CharField('Username', max_length=255, unique=True, validators=[username_validator])
    # cognito_sub = models.UUIDField('Cognito Sub', default=uuid.uuid4, unique=True)
    is_active = models.BooleanField('Active', default=True)

    email = models.EmailField('Email address', blank=True)
    is_staff = models.BooleanField(
        'staff status',
        default=False,
        help_text='Designates whether the user can log into this admin site.'
    )

    objects = UserManager()

    USERNAME_FIELD = 'username'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = ['email']

    @property
    def is_django_user(self):
        return self.has_usable_password()

    def __str__(self) -> str:
        return self.username

    def __repr__(self) -> str:
        return self.username
