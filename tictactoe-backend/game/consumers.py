import contextlib
import random

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from game.helpers import *
from game.models import Room, User
from asgiref.sync import sync_to_async


class GameConsumer(AsyncJsonWebsocketConsumer):
    board = {
        0: '', 1: '', 2: '',
        3: '', 4: '', 5: '',
        6: '', 7: '', 8: '',
    }

    async def connect(self):
        self.room_id = self.scope["url_route"]["kwargs"]["id"]
        self.group_name = f"group_{self.room_id}"

        with contextlib.suppress(KeyError):
            if len(self.channel_layer.groups[self.group_name]) >= 2:
                await self.accept()
                await self.send_json({
                    "event": "show_error",
                    "error": "Room is full."
                })

                return await self.close(3001)

        await self.accept()
        await self.channel_layer.group_add(self.group_name, self.channel_name)

        if len(self.channel_layer.groups[self.group_name]) == 2:
            tmp_group = list(self.channel_layer.groups[self.group_name])
            first_player = random.choice(tmp_group)
            final_group = [first_player, tmp_group[0] if tmp_group[1] == first_player else tmp_group[1]]
            for i, channel in enumerate(final_group):
                players = await sync_to_async(Room.objects.get, thread_sensitive=True)(id=self.room_id)
                players = await sync_to_async(players.get_players, thread_sensitive=True)()
                await self.channel_layer.send(
                    channel,
                    {
                        "type": "gameData.send",
                        "data": {
                            "event": "game_start",
                            "board": self.board,
                            "my_turn": True if i == 0 else False,
                            "players": [player.username for player in players]
                        }
                    }
                )

    async def disconnect(self, close_code):
        if close_code == 3001:
            return
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "gameData.send",
                "data": {
                    "event": "opponent_left",
                    "my_turn": False,
                }
            }
        )

    async def receive_json(self, content, **kwargs):
        if content["event"] == "boardData_send":
            player = content["player"]

            winner = check_winner(content["board"])
            if winner:
                room = await sync_to_async(Room.objects.get, thread_sensitive=True)(id=self.room_id)
                user = await sync_to_async(User.objects.get, thread_sensitive=True)(username=player)
                room.who_won = user
                await sync_to_async(room.save, thread_sensitive=True)()

                return await self.channel_layer.group_send(
                    self.group_name,
                    {
                        "type": "gameData.send",
                        "data": {
                            "event": "won",
                            "board": content["board"],
                            "winner": winner,
                            "my_turn": False,
                        }
                    }
                )
            elif check_draw(content["board"]):
                return await self.channel_layer.group_send(
                    self.group_name,
                    {
                        "type": "gameData.send",
                        "data": {
                            "event": "draw",
                            "board": content["board"],
                            "my_turn": False,
                        }
                    }
                )
            else:
                for channel in self.channel_layer.groups[self.group_name]:
                    await self.channel_layer.send(
                        channel,
                        {
                            "type": "gameData.send",
                            "data": {
                                "event": "boardData_send",
                                "board": content["board"],
                                "my_turn": False if channel == self.channel_name else True,
                            }
                        }
                    )

    async def gameData_send(self, context):
        await self.send_json(context["data"])
