from typing import List, Optional

from server.lib.model.models import UserModel, LogModel
from server.lib.repository import log_repository
from server.lib.service import campaign_service, player_service


def get_logs(playthrough_code: str, user: UserModel) -> (str, List[LogModel]):
    """
    Returns all logs for a specific playthrough ID.

    :param playthrough_code:
    :param user:
    :return: A tuple (Error message, List with messages)
    """
    playthrough = campaign_service.find_playthrough_with_code(playthrough_code)
    if playthrough is None:
        return "This playthrough does not exist.", []

    return "", log_repository.get_logs(playthrough.id)


def create_log(user: UserModel, playthrough_code: str, title: str, text: str) -> str:
    playthrough = campaign_service.find_playthrough_with_code(playthrough_code)
    if playthrough is None:
        return "This playthrough does not exist."

    player = player_service.get_user_players_by_id(user, playthrough.id)[0]
    message_model = LogModel.from_playthrough_creator_content(playthrough, player, title, text)

    log_repository.create_log(message_model)
    return ""


def get_log(log_id: int) -> Optional[LogModel]:
    return log_repository.get_log(log_id)


def delete_log(user: UserModel, playthrough_code: str, log_id: int):
    log = get_log(int(log_id))
    playthrough = campaign_service.find_playthrough_with_code(playthrough_code)

    if log is None:
        return "This log does not exist."

    if log.creator.user != user:
        return "This is not your log to delete."

    if log.playthrough_id != playthrough.id:
        return "This log does not belong to this playthrough."

    log_repository.delete_log(log)
    return ""
