from typing import List, Optional

from server.lib.model.models import PlaythroughModel, UserModel
from server.lib.repository import playthrough_repository


def create_playthrough(name, datetime, user: UserModel):
    model = PlaythroughModel.from_name_date(name, datetime, user.id)
    return playthrough_repository.create_playthrough(model)


def get_playthroughs(user) -> List[PlaythroughModel]:
    return playthrough_repository.get_playthroughs(user)


def get_playthrough_url(id: int, user: UserModel) -> Optional[str]:
    playthrough = playthrough_repository.get_playthrough_by_id(id)

    if playthrough.user != user:
        return None

    return playthrough_repository.get_playthrough_url(playthrough)


def join_playthrough(user: UserModel, code: str):
    # Check if user already joined the playthrough, if so, do not let the player add a new player character.

    # Create an empty player character for the user and refer them to a new page
    return None


def find_playthrough_with_code(code: str) -> Optional[PlaythroughModel]:
    return playthrough_repository.find_playthrough_with_code(code)