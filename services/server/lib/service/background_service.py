from typing import List

from lib.database import request_session
from lib.model.models import BackgroundModel


def get_backgrounds() -> List[BackgroundModel]:
    db = request_session()
    return db.query(BackgroundModel).all()
