import os
from typing import List, Optional, Tuple

import qrcode

from server import app
from server.lib.model.models import PlaythroughModel, UserModel, PlaythroughJoinCodeModel, PlayerModel
from server.lib.repository import playthrough_repository, player_repository
from server.lib.service import player_service


def create_playthrough(name, datetime, user: UserModel):
    model = PlaythroughModel.from_name_date(name, datetime, user.id)
    return playthrough_repository.create_playthrough(model)


def get_playthroughs(user) -> List[PlaythroughModel]:
    return playthrough_repository.get_playthroughs(user)


def get_joined_playthroughs(user) -> List[PlaythroughModel]:
    return playthrough_repository.get_joined_playthroughs(user)


def get_playthrough_url(id: int, user: UserModel) -> Optional[str]:
    playthrough = playthrough_repository.get_playthrough_by_id(id)

    if playthrough.user != user:
        return None

    return playthrough_repository.get_playthrough_url(playthrough)


def join_playthrough(user: UserModel, playthrough: PlaythroughModel):
    players = player_service.get_user_players_by_id(user, playthrough.id)

    # Only create a new player if no players are yet created for this playthrough.
    if len(players) == 0:
        # Create an empty player character for the user and refer them to a new page
        player_service.create_player(playthrough, user.name + "'s character", "-", "-", "-", user)

    return ""


def find_playthrough_with_code(code: str) -> Optional[PlaythroughModel]:
    return playthrough_repository.find_playthrough_with_code(code)


def find_playthrough_with_id(pid: int) -> Optional[PlaythroughModel]:
    return playthrough_repository.find_playthrough_with_id(pid)


def get_playthrough_code(pid: int) -> Optional[Tuple[PlaythroughModel, PlaythroughJoinCodeModel]]:
    return playthrough_repository.get_playthrough_code(pid)


def generate_qr(code: str):
    qr_filename = "views/static/images/qr_codes/%s.png" % code
    qr_filename = os.path.join(app.root_path, qr_filename)
    if not os.path.isfile(qr_filename):
        img = qrcode.make(code)
        img.get_image().save(qr_filename)


def user_in_playthrough(user: UserModel, playthrough: PlaythroughModel):
    """
    Checks if the user has any players in the given playthrough.

    :param user: The user which is logged in
    :param playthrough: The playthrough model
    :return: A boolean. True if the user has 1 or more players in the given playthrough, False if not.
    """
    players = player_service.get_user_players(user)
    for player in players:
        if player.playthrough == playthrough:
            return True

    return False


def is_user_dm(user: UserModel, player: PlayerModel):
    """
        Checks if the user owns a playthrough the player is in.

        :param user: The user which is logged in
        :param playthrough: The playthrough model
        :return: A boolean. True if the user has 1 or more players in the given playthrough, False if not.
        """
    playthroughs = get_playthroughs(user)
    for playthrough in playthroughs:
        if player.playthrough == playthrough:
            return True

    return False
