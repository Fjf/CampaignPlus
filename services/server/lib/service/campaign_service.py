import string
from random import randint
from sqlite3 import IntegrityError
from typing import List, Optional

from werkzeug.exceptions import Unauthorized, BadRequest

from lib.database import request_session
from lib.model.models import CampaignModel, UserModel, PlayerModel
from lib.repository import campaign_repository
from lib.service import player_service

ALLOWED_CHARS = string.ascii_uppercase + string.digits


def _create_random_string(length: int):
    return "".join(ALLOWED_CHARS[randint(0, len(ALLOWED_CHARS) - 1)] for _ in range(length))


def create_campaign(user: UserModel):
    campaign = CampaignModel(user_id=user.id)

    db = request_session()
    while True:
        try:
            campaign.code = _create_random_string(6)

            db.add(campaign)
            db.commit()
            break
        except IntegrityError:
            print("A key had to be regenerated.")

    # Create QR code on campaign selection
    campaign.code_qr()
    return campaign


def get_campaigns(user: UserModel) -> List[CampaignModel]:
    return campaign_repository.get_campaigns(user)


def get_joined_campaigns(user) -> List[CampaignModel]:
    return campaign_repository.get_joined_campaigns(user)


def join_campaign(user: UserModel, campaign: CampaignModel):
    players = player_service.get_user_players_by_id(user, campaign.id)
    print("Joining with code " + campaign.id)
    # Only create a new player if no players are yet created for this campaign.
    if len(players) == 0:
        # Create an empty player character for the user and refer them to a new page
        player = player_service.create_player(user, user.name + "'s character")


def find_campaign_with_code(code: str) -> Optional[CampaignModel]:
    return campaign_repository.get_campaign(code=code)


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


def user_in_campaign(user: UserModel, campaign: CampaignModel):
    """
    Checks if the user has any players in the given campaign.

    :param user: The user which is logged in
    :param campaign: The campaign model
    :return: A boolean. True if the user has 1 or more players in the given campaign, False if not.
    """
    players = player_service.get_user_players(user)
    for player in players:
        if player.campaign == campaign:
            return True

    return False


def is_user_dm(user: UserModel, player: PlayerModel):
    """
        Checks if the user owns a campaign the player is in.

        :param user: The user which is logged in
        :param campaign: The campaign model
        :return: A boolean. True if the user has 1 or more players in the given campaign, False if not.
        """
    campaigns = get_campaigns(user)
    for campaign in campaigns:
        if player.campaign == campaign:
            return True

    return False


def update_campaign(user: UserModel, campaign_id: int, name: str = None) -> CampaignModel:
    campaign = get_campaign(campaign_id=campaign_id)

    if campaign.user_id != user.id:
        raise Unauthorized("You may not change another player's campaign.")

    if name is not None:
        campaign.name = name

    db = request_session()
    db.commit()

    return get_campaign(campaign_id=campaign_id)


def delete_campaign(user, campaign_id):
    campaign = get_campaign(campaign_id=campaign_id)
    if campaign is None:
        raise BadRequest("Campaign with this id does not exist.")
    if campaign.user_id != user.id:
        raise Unauthorized("You may not delete another player's campaign.")

    db = request_session()
    db.delete(campaign)
    db.commit()
