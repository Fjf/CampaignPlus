from server.lib.model.models import PlayerModel, UserModel
from server.lib.repository import player_repository
from server.lib.service import playthrough_service


def get_players(playthrough_id: int):
    return player_repository.get_players(playthrough_id)


def create_player(name: str, race: str, class_name: str, backstory: str, code: str, user: UserModel):
    playthrough = playthrough_service.find_playthrough_with_code(code)

    if not playthrough:
        return "This playthrough does not exist."

    player = PlayerModel.from_name_playthrough_user(name, playthrough, user)

    player.race_name = race
    player.backstory = backstory
    player.class_name = class_name

    player_repository.create_player(player)
    return ""

