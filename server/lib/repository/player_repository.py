from typing import Optional, List

from server.lib.database import request_session
from server.lib.model.models import PlayerModel, PlaythroughModel, PlayerInfoModel, PlayerEquipmentModel


def get_players(playthrough_id: int):
    db = request_session()

    return db.query(PlayerModel) \
        .join(PlaythroughModel) \
        .filter(PlaythroughModel.id == playthrough_id) \
        .all()


def add_and_commit(player):
    db = request_session()

    db.add(player)
    db.commit()


def find_player(pid: int) -> Optional[PlayerModel]:
    db = request_session()

    return db.query(PlayerModel) \
        .filter(PlayerModel.id == pid) \
        .one_or_none()


def get_player_info(player: PlayerModel) -> Optional[PlayerInfoModel]:
    db = request_session()

    return db.query(PlayerInfoModel) \
        .filter(PlayerInfoModel.player_id == player.id) \
        .one_or_none()


def get_player_items(player: PlayerModel) -> List[PlayerEquipmentModel]:
    db = request_session()

    return db.query(PlayerEquipmentModel) \
        .filter(PlayerEquipmentModel.player_id == player.id) \
        .all()


def delete_player(player: PlayerModel):
    db = request_session()

    db.delete(player)
    db.commit()


def get_all_players():
    db = request_session()

    return db.query(PlayerModel) \
        .join(PlaythroughModel) \
        .all()
