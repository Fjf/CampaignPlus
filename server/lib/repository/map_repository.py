from typing import Optional, List

from server.lib.database import request_session
from server.lib.model.models import EnemyModel, MapModel


def get_map(map_id: int) -> Optional[MapModel]:
    db = request_session()

    return db.query(MapModel) \
        .filter(MapModel.id == map_id) \
        .one_or_none()


def create_map(mapmodel: MapModel):
    db = request_session()

    db.add(mapmodel)
    db.commit()


def get_children(id: int) -> Optional[List[MapModel]]:
    db = request_session()

    return db.query(MapModel) \
        .filter(MapModel.parent_map_id == id) \
        .all()
