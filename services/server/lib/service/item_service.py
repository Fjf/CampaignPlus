from sqlalchemy import or_

from lib.database import request_session
from lib.model.models import ItemModel, UserModel
from lib.repository import player_repository


def get_item(user, item_id: int = None, item_name: str = None):
    db = request_session()

    if item_id is not None:
        return (db.query(ItemModel)
                .filter(ItemModel.id == item_id)
                .filter(or_(ItemModel.owner_id == None, ItemModel.owner_id == user.id))
                .one_or_none())
    if item_name is not None:
        return (db.query(ItemModel)
                .filter(ItemModel.name == item_name)
                .filter(or_(ItemModel.owner_id == None, ItemModel.owner_id == user.id))
                .one_or_none())


def get_items(user: UserModel):
    db = request_session()

    return db.query(ItemModel) \
        .filter(or_(ItemModel.owner_id == None, ItemModel.owner_id == user.id)) \
        .order_by(ItemModel.name).all()


def create_item(user: UserModel, json_object):
    name = json_object.get("name")
    item = get_item(user, item_name=name)

    if item is not None and item.owner_id != user.id:
        raise ValueError("Cannot change an item not belonging to you.")

    db = request_session()
    if item is None:
        item = ItemModel()
        db.add(item)

    item.name = name
    item.owner_id = user.id
    item.category = json_object.get("category")
    item.weight = json_object.get("weight")
    item.cost = json_object.get("cost")
    item.description = json_object.get("description")
    item.item_info = json_object.get("item_info")

    db.commit()
    db.refresh(item)
    return item
