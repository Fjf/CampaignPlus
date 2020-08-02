import os
from typing import List, Optional, Tuple

import qrcode

from lib.database import request_session
from services.server import app
from lib.model.models import CampaignModel, UserModel, CampaignJoinCodeModel, PlayerModel
from lib.repository import campaign_repository
from lib.service import player_service


def create_playthrough(name, datetime, user: UserModel):
    model = CampaignModel.from_name_date(name, datetime, user.id)
    return campaign_repository.create_playthrough(model)


def get_campaigns(user: UserModel) -> List[CampaignModel]:
    return campaign_repository.get_playthroughs(user)


def get_joined_campaigns(user) -> List[CampaignModel]:
    return campaign_repository.get_joined_playthroughs(user)


def get_playthrough_url(id: int, user: UserModel) -> Optional[str]:
    playthrough = campaign_repository.get_playthrough_by_id(id)

    if playthrough.user != user:
        return None

    return campaign_repository.get_campaign_url(playthrough)


def join_playthrough(user: UserModel, playthrough: CampaignModel):
    players = player_service.get_user_players_by_id(user, playthrough.id)

    # Only create a new player if no players are yet created for this playthrough.
    if len(players) == 0:
        # Create an empty player character for the user and refer them to a new page
        player_service.create_player(user, user.name + "'s character", playthrough=playthrough)

    return ""


def find_playthrough_with_code(code: str) -> Optional[CampaignModel]:
    return campaign_repository.find_playthrough_with_code(code)


def get_campaign(campaign_id: int = None, campaign_code: str = None) -> Optional[CampaignModel]:
    """
    Gets the campaign from the database from either campaign ID or campaign code.
    :param campaign_id:
    :param campaign_code:
    :return:
    """

    db = request_session()

    sub = db.query(CampaignModel)

    # Filter if one of the inputs is not None
    if campaign_id is not None:
        sub = sub.filter(CampaignModel.id == campaign_id)
    elif campaign_code is not None:
        sub = sub.filter(CampaignModel.code == campaign_code)
    else:
        return None

    return sub.one_or_none()


def user_in_campaign(user: UserModel, playthrough: CampaignModel):
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
    playthroughs = get_campaigns(user)
    for playthrough in playthroughs:
        if player.playthrough == playthrough:
            return True

    return False
