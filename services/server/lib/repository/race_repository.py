from typing import List

from lib.database import request_session
from lib.model.models import RaceModel


def get_races() -> List[RaceModel]:
    db = request_session()
    return db.query(RaceModel).all()
