from typing import Optional, List, Tuple

from server.lib.database import request_session
from server.lib.model.class_models import ClassModel, ClassAbilityModel, SubClassModel, PlayerClassModel
from server.lib.model.models import PlayerModel, PlaythroughModel, PlayerInfoModel, PlayerEquipmentModel, ItemModel, \
    PlayerSpellModel, SpellModel, UserModel, WeaponModel, PlayerProficiencyModel


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


def get_spells(playthrough: PlaythroughModel) -> List[PlayerSpellModel]:
    db = request_session()

    return db.query(SpellModel) \
        .filter(playthrough.id == SpellModel.playthrough_id or SpellModel.playthrough_id == -1) \
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


def player_get_item(player, item_id):
    db = request_session()

    return db.query(ItemModel) \
        .filter(player.playthrough_id == ItemModel.playthrough_id or ItemModel.playthrough_id == -1) \
        .filter(ItemModel.id == item_id) \
        .one_or_none()


def delete_item(player: PlayerModel, item: ItemModel):
    db = request_session()

    pim_list = db.query(PlayerEquipmentModel) \
        .filter(PlayerEquipmentModel.item_id == item.id and PlayerEquipmentModel.player_id == player.id) \
        .all()

    for pim in pim_list:
        db.delete(pim)

    db.commit()


def get_player_proficiencies(player: PlayerModel) -> Optional[PlayerProficiencyModel]:
    db = request_session()

    return db.query(PlayerProficiencyModel) \
        .filter(PlayerProficiencyModel.player_id == player.id) \
        .one_or_none()


def get_classes(player: PlayerModel) -> List[ClassModel]:
    """
    Returns all main classes which are linked to a player.

    :param player: The player for which to show what classes linked.
    :return: A list of classes which the player has linked.
    """
    db = request_session()

    return db.query(ClassModel) \
        .join(PlayerClassModel, PlayerClassModel.main_class_id == ClassModel.id) \
        .filter(PlayerClassModel.player_id == player.id) \
        .all()


def get_visible_classes(user: UserModel) -> List[ClassModel]:
    """
    Returns all classes which can be seen by a user.
    A class is visible when it is the owner of a class, or if the class has no owner (default class)

    :param user: The user for which to get the visible classes.
    :return: A list of classes which the user can see.
    """
    db = request_session()

    # Make sure it does not crash for not logged in users.
    user_id = user.id if user is not None else -1

    return db.query(ClassModel) \
        .filter(ClassModel.owner_id == user_id or ClassModel.owner_id.is_(None)) \
        .all()


def get_class_abilities(class_model: ClassModel = None, subclass_model: SubClassModel = None) -> List[ClassAbilityModel]:
    db = request_session()

    intermediate = db.query(ClassAbilityModel)

    if class_model is not None:
        return intermediate.filter(ClassAbilityModel.main_class_id == class_model.id) \
            .all()
    else:
        return intermediate.filter(ClassAbilityModel.sub_class_id == subclass_model.id) \
            .all()


def get_class_by_id(class_id: int) -> Optional[ClassModel]:
    db = request_session()

    return db.query(ClassModel).filter(ClassModel.id == class_id).one_or_none()


def remove_classes_from_player(player: PlayerModel):
    db = request_session()

    db.query(PlayerClassModel).filter(PlayerClassModel.player_id == player.id).delete()


