from typing import Optional, List

from server.lib.database import request_session
from server.lib.model.models import EnemyModel, MapModel, MapDataModel


def get_map(map_id: int) -> Optional[MapModel]:
    db = request_session()

    return db.query(MapModel) \
        .filter(MapModel.id == map_id) \
        .one_or_none()


def create_map(mapmodel: MapModel):
    db = request_session()

    db.add(mapmodel)
    db.commit()


def create_mapdata_from_map(mapmodel: MapModel) -> MapDataModel:
    db = request_session()

    map_data = MapDataModel.from_map(mapmodel)
    db.add(map_data)
    db.commit()

    return map_data


def get_mapdata_from_map(mapmodel: MapModel):
    db = request_session()

    return db.query(MapDataModel) \
        .filter(MapDataModel.map_id == mapmodel.id) \
        .one_or_none()


def get_children(id: int) -> Optional[List[MapModel]]:
    db = request_session()

    return db.query(MapModel) \
        .filter(MapModel.parent_map_id == id) \
        .all()


def set_map_data(map_data: MapDataModel):
    db = request_session()

    db.add(map_data)
    db.commit()