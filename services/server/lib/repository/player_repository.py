from typing import Optional, List

from sqlalchemy import or_, and_

from lib.database import request_session
from lib.model.class_models import ClassModel, SubclassModel
from lib.model.models import PlayerModel, CampaignModel, PlayerEquipmentModel, ItemModel, \
    PlayerSpellModel, SpellModel, UserModel


def get_players(campaign_id: int):
    db = request_session()

    return db.query(PlayerModel) \
        .join(CampaignModel) \
        .filter(CampaignModel.id == campaign_id) \
        .all()



def get_player_item(item: ItemModel, player: Optional[PlayerModel]) -> Optional[ItemModel]:
    db = request_session()

    intermediate = db.query(PlayerEquipmentModel) \
        .filter(PlayerEquipmentModel.item_id == item.id)

    if player is not None:
        intermediate = intermediate.filter(PlayerEquipmentModel.player_id == player.id)

    return intermediate.one_or_none()


def delete_player(player: PlayerModel):
    db = request_session()

    db.delete(player)
    db.commit()


def get_all_players():
    db = request_session()

    return db.query(PlayerModel) \
        .join(CampaignModel) \
        .all()




def get_spell(player: PlayerModel, spell_id: int) -> Optional[SpellModel]:
    db = request_session()

    return db.query(SpellModel) \
        .filter(or_(player.campaign_id == SpellModel.campaign_id, SpellModel.campaign_id == -1)) \
        .filter(SpellModel.id == spell_id) \
        .one_or_none()


def delete_spell(player: PlayerModel, spell: SpellModel):
    db = request_session()

    psm_list = db.query(PlayerSpellModel) \
        .filter(and_(PlayerSpellModel.spell_id == spell.id, PlayerSpellModel.player_id == player.id)) \
        .all()

    for psm in psm_list:
        db.delete(psm)

    db.commit()


def get_player(player_id: int) -> PlayerModel:
    db = request_session()

    return db.query(PlayerModel) \
        .filter(PlayerModel.id == player_id) \
        .one_or_none()


def player_get_item(player, item_id):
    db = request_session()

    return db.query(ItemModel) \
        .filter((player.campaign_id == ItemModel.campaign_id) or (ItemModel.campaign_id == -1)) \
        .filter(ItemModel.id == item_id) \
        .one_or_none()


def delete_equipment(player: PlayerModel, item_id: int):
    db = request_session()

    pim_list = db.query(PlayerEquipmentModel) \
        .filter(PlayerEquipmentModel.id == item_id and PlayerEquipmentModel.player_id == player.id) \
        .all()

    for pim in pim_list:
        db.delete(pim)

    db.commit()


def get_class_by_id(class_id: int) -> Optional[ClassModel]:
    db = request_session()

    return db.query(ClassModel).filter(ClassModel.id == class_id).one_or_none()


def remove_classes_from_player(player: PlayerModel):
    db = request_session()
    new_info = player.info
    new_info["class_ids"].clear()
    player.info = new_info
    db.commit()
