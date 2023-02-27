from sqlalchemy import or_

from lib.database import request_session
from lib.model.models import ItemModel, UserModel
from lib.repository import player_repository


def get_item(item_id: int):
    return player_repository.get_item(item_id)


def get_items(user: UserModel):
    db = request_session()

    return db.query(ItemModel) \
        .filter(or_(ItemModel.owner_id == None, ItemModel.owner_id == user.id)) \
        .order_by(ItemModel.name).all()


def create_item(user: UserModel, json_object):
    item = ItemModel()

    item.name = json_object.get("name")
    item.owner_id = user.id
    item.category = json_object.get("category")
    item.weight = json_object.get("weight")
    item.cost = json_object.get("cost")
    item.description = json_object.get("description")
    item.item_info = json_object.get("item_info")

    db = request_session()
    db.add(item)
    db.commit()

    return item
