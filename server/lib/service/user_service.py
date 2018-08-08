import bcrypt as bcrypt
from pip._vendor.pyparsing import Optional
from werkzeug.security import generate_password_hash

from server.lib.model.models import UserModel
from server.lib.repository import user_repository
from server.lib.user_session import session_user_set


def login(username, password):
    user = find_user_by_username(username)
    if user is None:
        return 0

    if not(user.name == username and bcrypt.checkpw(password.encode(), user.password)):
        print("Something went wrong logging in user {}".format(username))
        return 0

    session_user_set(user)
    return 1


def create_user(username, password):
    if find_user_by_username(username) is not None:
        return 0

    hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

    user = UserModel.from_name_password(username, hashed_pw)

    user_repository.register(user)
    return 1


def find_user_by_username(username: str):
    return user_repository.find_user_by_name(username)
