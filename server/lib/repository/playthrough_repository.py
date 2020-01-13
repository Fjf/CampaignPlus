import string
from datetime import datetime
from random import randint
from typing import List, Optional, Tuple

from sqlalchemy.exc import IntegrityError

from server import app
from server.lib.database import request_session
from server.lib.model.models import PlaythroughModel, PlaythroughJoinCodeModel, UserModel, PlayerModel

ALLOWED_CHARS = string.ascii_uppercase + string.digits


def get_playthrough_url(playthrough: PlaythroughModel) -> Optional[str]:
    if not playthrough:
        return None

    db = request_session()
    model = db.query(PlaythroughJoinCodeModel).filter(PlaythroughJoinCodeModel.playthrough == playthrough).one_or_none()
    if not model:
        model = PlaythroughJoinCodeModel.from_playthrough_id(playthrough.id)
        model.date = datetime.now()

        while True:
            try:
                model.code = _create_random_string(6)

                db.add(model)
                db.commit()
                break
            except IntegrityError:
                print("A key had to be regenerated.")

    return app.host + ":5000/join/" + model.code


def create_playthrough(model: PlaythroughModel):
    db = request_session()

    db.add(model)
    db.commit()
    return 0


def get_playthroughs(user: str) -> List[PlaythroughModel]:
    db = request_session()

    return db.query(PlaythroughModel) \
        .filter(PlaythroughModel.user == user) \
        .all()


def get_joined_playthroughs(user: UserModel):
    db = request_session()

    return db.query(PlaythroughModel, PlaythroughJoinCodeModel) \
        .join(PlayerModel) \
        .filter(PlaythroughModel.id == PlaythroughJoinCodeModel.playthrough_id) \
        .filter(PlayerModel.playthrough_id == PlaythroughModel.id) \
        .filter(PlayerModel.user == user) \
        .all()


def get_playthrough_by_id(id: int) -> Optional[PlaythroughModel]:
    db = request_session()

    return db.query(PlaythroughModel) \
        .filter(PlaythroughModel.id == id) \
        .one_or_none()


def find_playthrough_with_id(pid: int) -> Optional[PlaythroughModel]:
    db = request_session()

    return db.query(PlaythroughModel) \
        .filter(PlaythroughModel.id == pid) \
        .one_or_none()


def get_playthrough_code(pid: int) -> Optional[Tuple[PlaythroughModel, PlaythroughJoinCodeModel]]:
    db = request_session()

    return db.query(PlaythroughModel, PlaythroughJoinCodeModel) \
        .join(PlaythroughJoinCodeModel) \
        .filter(PlaythroughModel.id == pid) \
        .one_or_none()


def find_playthrough_with_code(code: str) -> Optional[PlaythroughModel]:
    db = request_session()

    return db.query(PlaythroughModel) \
        .join(PlaythroughJoinCodeModel) \
        .filter(PlaythroughJoinCodeModel.code == code) \
        .one_or_none()


def _create_random_string(length: int):
    return "".join(ALLOWED_CHARS[randint(0, len(ALLOWED_CHARS)-1)] for _ in range(length))
