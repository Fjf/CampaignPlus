from typing import List

from sqlalchemy import or_

from lib.database import request_session
from lib.model.class_models import ClassModel
from lib.model.models import UserModel


def get_classes() -> List[ClassModel]:
    db = request_session()
    return db.query(ClassModel).all()


def get_class_by_name(class_name, owner_id=None) -> ClassModel:
    db = request_session()
    return (db.query(ClassModel)
            .filter(ClassModel.name == class_name.capitalize())
            .filter(or_(ClassModel.owner_id == None, ClassModel.owner_id == owner_id))
            .one_or_none())


def get_class_by_id(class_id) -> ClassModel:
    db = request_session()
    return db.query(ClassModel).get(class_id)


def create_classes(user: UserModel, obj_dicts: List[dict]) -> List[ClassModel]:
    """
    Creates a list of dnd classes, or updates an existing one by this user if it already exists.
    :param obj_dicts:
    :param user:
    :return:
    """
    models = []
    db = request_session()
    for obj_dict in obj_dicts:
        model = get_class_by_name(class_name=obj_dict.get("name"), owner_id=user.id)

        # Override old data, or create new object if current one doesn't exist.
        if model is not None:
            model.data = obj_dict
        else:
            model = ClassModel(owner=user, name=obj_dict.get("name"), data=obj_dict)
            db.add(model)

        models.append(model)
    db.commit()

    return sorted(list(set(models)), key=lambda x: x.name)
