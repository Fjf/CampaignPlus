from server.lib.model.models import PlayerModel
from server.lib.repository import player_repository


def get_players():
    return player_repository.get_players()


def create_player(name, class_name):
    player = PlayerModel.from_name(name, class_name)
    player_repository.create_player(player)