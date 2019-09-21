from typing import Optional, List, Tuple

from server.lib.database import request_session
from server.lib.model.models import PlayerModel, PlaythroughModel, PlayerInfoModel, PlayerEquipmentModel, ItemModel, \
    PlayerSpellModel, SpellModel, UserModel, WeaponModel


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


def get_player_items(player: PlayerModel) -> List[Tuple[PlayerEquipmentModel, WeaponModel]]:
    db = request_session()

    return db.query(PlayerEquipmentModel, WeaponModel) \
        .filter(PlayerEquipmentModel.player_id == player.id) \
        .join(WeaponModel, PlayerEquipmentModel.item_id == WeaponModel.item_id, isouter=True) \
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


def get_item(item_id: int) -> Optional[ItemModel]:
    db = request_session()

    return db.query(ItemModel) \
        .filter(ItemModel.id == item_id) \
        .one_or_none()


def get_player_spells(player: PlayerModel) -> List[PlayerSpellModel]:
    db = request_session()

    return db.query(PlayerSpellModel) \
        .filter(PlayerSpellModel.player_id == player.id) \
        .all()


def get_spells(player: PlayerModel) -> List[PlayerSpellModel]:
    db = request_session()

    return db.query(SpellModel) \
        .filter(player.playthrough_id == SpellModel.playthrough_id or SpellModel.playthrough_id == -1) \
        .all()


def get_spell(player: PlayerModel, spell_id: int) -> Optional[SpellModel]:
    db = request_session()

    return db.query(SpellModel) \
        .filter(player.playthrough_id == SpellModel.playthrough_id or SpellModel.playthrough_id == -1) \
        .filter(SpellModel.id == spell_id) \
        .one_or_none()


def delete_spell(player: PlayerModel, spell: SpellModel):
    db = request_session()

    psm_list = db.query(PlayerSpellModel) \
        .filter(PlayerSpellModel.spell_id == spell.id and PlayerSpellModel.player_id == player.id) \
        .all()

    for psm in psm_list:
        db.delete(psm)

    db.commit()


def get_user_players(user: UserModel) -> List[PlayerModel]:
    db = request_session()

    return db.query(PlayerModel) \
        .filter(PlayerModel.user_id == user.id) \
        .all()


def get_player(player_id: int) -> PlayerModel:
    db = request_session()

    return db.query(PlayerModel) \
        .filter(PlayerModel.id == player_id) \
        .one_or_none()
