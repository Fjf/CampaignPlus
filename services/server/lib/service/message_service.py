from typing import List

from lib.model.models import UserModel, MessageModel
from lib.repository import message_repository
from lib.service import campaign_service


def get_messages(campaign_id: int, user: UserModel) -> (str, List[MessageModel]):
    """
    Returns all messages for a specific campaign ID.

    :param campaign_id:
    :param user:
    :return: A tuple (Error message, List with messages)
    """
    campaign = campaign_service.get_campaign(campaign_id)
    if campaign is None:
        return "This campaign does not exist.", []

    if campaign.user_id != user.id:
        return "This is not your campaign.", []

    return "", message_repository.get_messages(campaign_id)


def create_message(campaign_code: str, user: UserModel, message: str):
    campaign = campaign_service.find_campaign_with_code(campaign_code)
    if campaign is None:
        return "This campaign does not exist."

    message_model = MessageModel.from_campaign_sender_msg(campaign, user, message)

    message_repository.create_message(message_model)
    return ""
