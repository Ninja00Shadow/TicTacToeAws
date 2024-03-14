from django.db import models


# Create your models here.

class Room(models.Model):
    id = models.AutoField(primary_key=True)
    closed = models.BooleanField(default=False, null=False, blank=False)
    player1 = models.CharField(max_length=100, null=False, blank=False)
    player2 = models.CharField(max_length=100, null=True, blank=True)

    def get_players(self):
        return [self.player1, self.player2]

    def __str__(self) -> str:
        return f"{self.id} ({'Closed' if self.closed else 'Open'}) - {self.player1} vs {self.player2 if self.player2 else 'Waiting...'}"
