import os
import string
from random import randint
from typing import Optional, List

from server import app
from server.lib.model.models import MapModel, UserModel, BattlemapModel
from server.lib.repository import map_repository
from server.lib.service import playthrough_service

ALLOWED_CHARS = string.digits + string.ascii_letters


def create_map(playthrough_id: int, map_img, x: int, y: int, name: str, parent_map: MapModel=None):
    # Generate random file names until you get a unique one in the uploads.
    while True:
        extension = os.path.splitext(map_img.filename)[1]
        filename = _create_random_string(15) + extension  # 15 seems like a large enough number for files.

        path = os.path.join(app.map_storage, filename)
        if not os.path.isfile(path):
            break

    map_img.save(path)
    # TODO: Check if the given image is an allowed image format.

    mapmodel = MapModel.from_name_date(playthrough_id, filename, x, y, name)
    if parent_map is not None:
        mapmodel.parent_map_id = parent_map.id

    success = map_repository.create_map(mapmodel)
    return success


def get_map(map_id: int) -> Optional[MapModel]:
    return map_repository.get_map(map_id)


def _create_random_string(length: int):
    return "".join(ALLOWED_CHARS[randint(0, len(ALLOWED_CHARS)-1)] for _ in range(length))


def get_children(map: MapModel) -> Optional[List[MapModel]]:
    return map_repository.get_children(map.id)


def get_all_maps(playthrough_id: str) -> List[MapModel]:
    return map_repository.get_all_maps(playthrough_id)


def update_map(map_id: int, x=None, y=None, parent_id=None, name=None, story=None):
    map = get_map(map_id)
    if map is None:
        return "This map id does not exist."

    if name is not None:
        map.name = name
    if story is not None:
        map.story = story
    if x is not None:
        map.x = x
    if y is not None:
        map.y = y
    if parent_id is not None:
        map.parent_map_id = parent_id

    map_repository.commit()
    return ""


def create_battlemap(user: UserModel, playthrough_id: int, name: str, data: str):
    playthrough = playthrough_service.find_playthrough_with_id(playthrough_id)
    if playthrough is None:
        return "This playthrough does not exist."

    battlemap = BattlemapModel.from_name_data(playthrough, user, name, data)

    map_repository.create_map(battlemap)
    return ""


def get_all_battlemaps(playthrough_id: int):
    return map_repository.get_all_battlemaps(playthrough_id)
