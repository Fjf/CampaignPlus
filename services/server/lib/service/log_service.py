from typing import List, Optional

from lib.model.models import UserModel, LogModel
from lib.repository import log_repository
from lib.service import player_service, campaign_service


def get_logs(campaign_code: str, user: UserModel) -> (str, List[LogModel]):
    """
    Returns all logs for a specific campaign ID.

    :param campaign_code:
    :param user:
    :return: A tuple (Error message, List with messages)
    """
    campaign = campaign_service.find_campaign_with_code(campaign_code)
    if campaign is None:
        return "This campaign does not exist.", []

    return "", log_repository.get_logs(campaign.id)


def create_log(user: UserModel, campaign_code: str, title: str, text: str) -> str:
    campaign = campaign_service.find_campaign_with_code(campaign_code)
    if campaign is None:
        return "This campaign does not exist."

    player = player_service.get_user_players_by_id(user, campaign.id)[0]
    message_model = LogModel(campaign_id=campaign.id, creator_id=player.id, title=title, text=text)

    log_repository.create_log(message_model)
    return ""


def get_log(log_id: int) -> Optional[LogModel]:
    return log_repository.get_log(log_id)


def delete_log(user: UserModel, campaign_code: str, log_id: int):
    log = get_log(int(log_id))
    campaign = campaign_service.find_campaign_with_code(campaign_code)

    if log is None:
        return "This log does not exist."

    if log.creator.owner != user:
        return "This is not your log to delete."

    if log.campaign_id != campaign.id:
        return "This log does not belong to this campaign."

    log_repository.delete_log(log)
    return ""
