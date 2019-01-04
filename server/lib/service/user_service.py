import re

import bcrypt as bcrypt
from pip._vendor.pyparsing import Optional
from werkzeug.security import generate_password_hash

from server.lib.model.models import UserModel
from server.lib.repository import user_repository
from server.lib.user_session import session_user_set


def login(username, password):
    user = find_user_by_username(username)
    if user is None:
        return "This username is not in use."

    if not(user.name == username and bcrypt.checkpw(password.encode(), user.password)):
        print("Something went wrong logging in user {}".format(username))
        return "Password incorrect."

    session_user_set(user)
    return ""


def create_user(username, password):
    if not is_valid_username(username):
        return "Your username contains invalid characters. Allowed characters are alphanumeric and underscores."

    if find_user_by_username(username) is not None:
        return "This username is already in use."

    hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

    user = UserModel.from_name_password(username, hashed_pw)

    user_repository.register(user)
    return ""


def find_user_by_username(username: str):
    return user_repository.find_user_by_name(username)


def is_valid_username(username: str) -> bool:
    if re.match(r'^[\w.-]+$', username):
        return True
    return False
