import os
import string
from random import randint
from typing import Optional, List

from server import app
from server.lib.model.models import MapModel, MapDataModel
from server.lib.repository import map_repository

ALLOWED_CHARS = string.digits + string.ascii_letters


def create_map(playthrough_id: int, map_img, x: int, y: int, parent_map: MapModel=None):
    # Generate random file names until you get a unique one in the folder.
    while True:
        extension = os.path.splitext(map_img.filename)[1]
        filename = _create_random_string(15) + extension  # 15 seems like a large enough number for files.

        path = os.path.join(app.map_storage, filename)
        if not os.path.isfile(path):
            break

    map_img.save(path)
    # TODO: Check if the given image is an allowed image format.

    mapmodel = MapModel.from_name_date(playthrough_id, filename, x, y)
    if parent_map is not None:
        mapmodel.parent_map_id = parent_map.id

    success = map_repository.create_map(mapmodel)
    success &= map_repository.create_mapdata_from_map(mapmodel) is not None
    return success


def get_map(map_id: int) -> Optional[MapModel]:
    return map_repository.get_map(map_id)


def get_map_data(map: MapModel) -> Optional[MapDataModel]:
    return map_repository.get_mapdata_from_map(map)


def _create_random_string(length: int):
    return "".join(ALLOWED_CHARS[randint(0, len(ALLOWED_CHARS)-1)] for _ in range(length))


def get_children(map: MapModel) -> Optional[List[MapModel]]:
    return map_repository.get_children(map.id)


def set_map_data(map, name, story):
    """
    Updates the existing map data, or creates a map data entry in the database if it does not exist yet.
    :param map:
    :param name: 
    :param story: 
    :return: 
    """
    map_data = get_map_data(map)
    if map_data is None:
        map_data = map_repository.create_mapdata_from_map(map)

    map_data.name = name
    map_data.story = story

    map_repository.set_map_data(map_data)
    return ""
