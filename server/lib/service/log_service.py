from typing import List

from server.lib.model.models import UserModel, LogModel
from server.lib.repository import log_repository
from server.lib.service import playthrough_service


def get_logs(playthrough_code: str, user: UserModel) -> (str, List[LogModel]):
    """
    Returns all logs for a specific playthrough ID.

    :param playthrough_code:
    :param user:
    :return: A tuple (Error message, List with messages)
    """
    playthrough = playthrough_service.find_playthrough_with_code(playthrough_code)
    if playthrough is None:
        return "This playthrough does not exist.", []

    if playthrough.user_id != user.id:
        return "This is not your playthrough.", []

    return "", log_repository.get_logs(playthrough.id)


def create_log(user: UserModel, playthrough_code: str, title: str, text: str) -> str:
    playthrough = playthrough_service.find_playthrough_with_code(playthrough_code)
    if playthrough is None:
        return "This playthrough does not exist."

    message_model = LogModel.from_playthrough_creator_content(playthrough, user, title, text)

    log_repository.create_log(message_model)
    return ""
