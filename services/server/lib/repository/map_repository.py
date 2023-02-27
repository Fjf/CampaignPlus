from typing import Optional, List

from lib.database import request_session
from lib.model.models import MapModel, BattlemapModel, CreatorMapModel



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


def get_all_maps(campaign_id: str) -> List[MapModel]:
    db = request_session()

    return db.query(MapModel) \
        .filter(MapModel.campaign_id == campaign_id) \
        .all()


def get_all_battlemaps(campaign_id: int):
    db = request_session()

    return db.query(BattlemapModel) \
        .filter(BattlemapModel.campaign_id == campaign_id) \
        .all()


def get_editor_map(map_id) -> Optional[CreatorMapModel]:
    db = request_session()

    return db.query(CreatorMapModel) \
        .filter(CreatorMapModel.id == map_id) \
        .one_or_none()