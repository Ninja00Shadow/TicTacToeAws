"""
ASGI config for TicTacToe project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path

from game.consumers import GameConsumer

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TicTacToe.settings')

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter(
    {
        'http': django_asgi_app,
        'websocket': URLRouter([
            path("ws/game/<int:id>/", GameConsumer.as_asgi())
        ]
        )
    }
)
