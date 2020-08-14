from typing import List

from lib.database import request_session
from lib.model.class_models import ClassModel


def get_classes() -> List[ClassModel]:
    db = request_session()
    return db.query(ClassModel).all()


def get_class_by_name(class_name) -> ClassModel:
    db = request_session()
    return db.query(ClassModel).filter_by(name=class_name.capitalize()).one()


def get_class_by_id(class_id) -> ClassModel:
    db = request_session()
    return db.query(ClassModel).get(class_id)
