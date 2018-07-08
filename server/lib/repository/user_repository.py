from pip._vendor.pyparsing import Optional

from server.lib.database import request_session
from server.lib.model.models import UserModel


def register(user: UserModel):
    db = request_session()

    db.add(user)
    db.commit()


def find_user_by_id(user_id: int):
    db = request_session()

    return db.query(UserModel)\
        .filter(UserModel.id == user_id).one_or_none()


def find_user_by_name(user_name: str):
    db = request_session()

    return db.query(UserModel)\
        .filter(UserModel.name == user_name).one_or_none()
