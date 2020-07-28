import datetime
import re
import string
from random import randint
from typing import Optional

import bcrypt as bcrypt
import flask

from services.server import app
from lib.model.models import UserModel, EmailResetModel
from lib.repository import user_repository
from lib.user_session import session_user_set

ALLOWED_CHARS = string.digits + string.ascii_letters


def login(username, password):
    user = find_user_by_username(username)
    if user is None:
        # raise BadRequest("This username does not exist")
        return "This username does not exist."

    if not (user.name == username and bcrypt.checkpw(password.encode(), user.password)):
        print("Something went wrong logging in user {}".format(username))
        return "Password incorrect."

    session_user_set(user)
    return ""


def create_user(username, password, email):
    if not is_valid_username(username):
        return "Your username contains invalid characters. Allowed characters are alphanumeric and underscores."

    if find_user_by_username(username) is not None:
        return "This username is already in use."

    if not _check_email(email):
        return "This email address is invalid."

    if find_user_by_email(email) is not None:
        return "This email address is already in use."

    hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

    user = UserModel.from_name_password(username, hashed_pw)
    user.email = email

    user_repository.add(user)
    return ""


def find_user_by_username(username: str):
    return user_repository.find_user_by_name(username)


def is_valid_username(username: str) -> bool:
    if re.match(r'^[\w.-]+$', username):
        return True
    return False


def find_user_by_email(email: str):
    return user_repository.find_user_by_email(email)


def reset_password(email: str) -> str:
    user = find_user_by_email(email)
    if user is None:
        return "This email is not linked to any account."

    code = _generate_reset_code()

    reset_model = EmailResetModel.from_user_code_date(user, code, datetime.datetime.now())
    user_repository.add(reset_model)

    content = flask.render_template("reset_email.html", code=code, host=app.host, port=app.port)

    user_repository.send_email(user, content, "Reset your password")
    return ""


def _generate_reset_code() -> str:
    return "".join(ALLOWED_CHARS[randint(0, len(ALLOWED_CHARS) - 1)] for _ in range(8))


def _check_email(email: str) -> bool:
    regex = re.compile(r'[^@]+@[^@]+\.[^@]+')
    return regex.match(email) is not None


def find_usermodel_with_code(code: str) -> (str, Optional[UserModel]):
    reset_model = user_repository.find_reset_with_code(code)

    if reset_model is None:
        return "This reset code is not in use.", None

    timedelta = datetime.datetime.now() - reset_model.date
    if timedelta.seconds > 60 * 60:
        return "This password reset code has expired.", None

    user = reset_model.user

    return "", user


def set_password(user: UserModel, password: str) -> str:
    hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    user.password = hashed_pw

    user_repository.add(user)
    return ""
