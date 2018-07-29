import os
import string
from random import randint
from typing import Optional

from server import app
from server.lib.model.models import MapModel
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

    return map_repository.create_map(mapmodel)


def get_map(map_id: int) -> Optional[MapModel]:
    return map_repository.get_map(map_id)


def _create_random_string(length: int):
    return "".join(ALLOWED_CHARS[randint(0, len(ALLOWED_CHARS)-1)] for _ in range(length))