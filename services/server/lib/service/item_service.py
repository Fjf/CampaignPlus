from typing import Optional

from sqlalchemy import or_
from werkzeug.exceptions import Unauthorized

from lib.database import request_session
from lib.model.models import ItemModel, PlayerModel, WeaponModel, UserModel
from lib.repository import item_repository, player_repository, repository


def add_weapon(user, player: PlayerModel, name, category, weight, cost, dice_amount, dice_type, damage_type,
               range_normal, range_long=0, throw_range_normal=0, throw_range_long=0):
    item = add_item(user, player, name, category, weight, cost)

    weapon = WeaponModel.from_item(item)

    weapon.dice_amount = dice_amount
    weapon.dice_type = dice_type
    weapon.damage_type = damage_type

    weapon.range_normal = range_normal
    weapon.range_long = range_long

    weapon.throw_range_normal = throw_range_normal
    weapon.throw_range_long = throw_range_long

    repository.add_and_commit(weapon)
    return weapon


def add_item(user, player: PlayerModel, name, category, weight, cost):
    if player.user is not user:
        return "This player does not belong to you."

    item = ItemModel.from_name(name)
    item.playthrough_id = player.playthrough_id
    item.category = category
    item.weight = weight
    item.cost = cost

    repository.add_and_commit(item)

    return item


def get_item(item_id: int):
    return player_repository.get_item(item_id)


def get_items(user: UserModel, player: Optional[PlayerModel]):
    if player is not None and player.user is not user:
        raise Unauthorized("This player does not belong to you.")

    db = request_session()

    campaign_id = -1 if player is None else player.playthrough_id

    return db.query(ItemModel) \
        .filter(or_(ItemModel.campaign_id == campaign_id, ItemModel.campaign_id == None)) \
        .order_by(ItemModel.name).all()


