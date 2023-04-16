from typing import List

from lib.database import request_session
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

    message_model = MessageModel(campaign_id=campaign.id, sender_id=user.id, message=message)
    db = request_session()
    db.add(message_model)
    db.commit()
    return message_model
