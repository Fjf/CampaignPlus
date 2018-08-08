from typing import Optional

from server.lib.database import request_session
from server.lib.model.models import PlayerModel, PlaythroughModel


def get_players(playthrough_id: int):
    db = request_session()

    return db.query(PlayerModel) \
        .join(PlaythroughModel) \
        .filter(PlaythroughModel.id == playthrough_id) \
        .all()


def create_player(player):
    db = request_session()

    db.add(player)
    db.commit()


def find_player(pid: int) -> Optional[PlayerModel]:
    db = request_session()

    return db.query(PlayerModel) \
        .filter(PlayerModel.id == pid) \
        .one_or_none()


def delete_player(player: PlayerModel):
    db = request_session()

    db.delete(player)
    db.commit()


def get_all_players():
    db = request_session()

    return db.query(PlayerModel) \
        .join(PlaythroughModel) \
        .all()
