from typing import List

from lib.database import request_session
from lib.model.models import RaceModel


def get_races() -> List[RaceModel]:
    db = request_session()
    return db.query(RaceModel).all()


def get_race_by_name(race_name) -> RaceModel:
    db = request_session()
    return db.query(RaceModel).filter_by(name=race_name.capitalize()).one()


def get_race_by_id(race_id) -> RaceModel:
    db = request_session()
    return db.query(RaceModel).get(race_id)
