from typing import Optional, List

from lib.database import request_session
from lib.model.models import MapModel, BattlemapModel, CreatorMapModel


def get_map(map_id: int) -> Optional[MapModel]:
    db = request_session()

    return db.query(MapModel) \
        .filter(MapModel.id == map_id) \
        .one_or_none()


def create_map(mapmodel: MapModel):
    db = request_session()

    db.add(mapmodel)
    db.commit()


def commit():
    db = request_session()
    db.commit()


def get_children(map_id: int) -> Optional[List[MapModel]]:
    db = request_session()

    return db.query(MapModel) \
        .filter(MapModel.parent_map_id == map_id) \
        .all()


def get_all_maps(playthrough_id: str) -> List[MapModel]:
    db = request_session()

    return db.query(MapModel) \
        .filter(MapModel.campaign_id == playthrough_id) \
        .all()


def get_all_battlemaps(playthrough_id: int):
    db = request_session()

    return db.query(BattlemapModel) \
        .filter(BattlemapModel.playthrough_id == playthrough_id) \
        .all()


def get_editor_map(map_id) -> Optional[CreatorMapModel]:
    db = request_session()

    return db.query(CreatorMapModel) \
        .filter(CreatorMapModel.id == map_id) \
        .one_or_none()