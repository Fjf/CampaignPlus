import datetime
import re
import string
from random import randint
from typing import Optional

import bcrypt as bcrypt
import flask
from werkzeug.exceptions import BadRequest

from lib.database import request_session
from services.server import app
from lib.model.models import UserModel, EmailResetModel, SpellModel
from lib.repository import user_repository
from lib.user_session import session_user_set

ALLOWED_CHARS = string.digits + string.ascii_letters


def login(username, password):
    user = find_user_by_username(username)
    if user is None:
        raise BadRequest("This username does not exist.")

    if not (user.name == username and bcrypt.checkpw(password.encode(), user.password)):
        raise BadRequest("Password incorrect.")

    session_user_set(user)
    return user


def create_user(username, password, email):
    if not is_valid_username(username):
        raise BadRequest(
            "Your username contains invalid characters. Allowed characters are alphanumeric and underscores.")

    if find_user_by_username(username) is not None:
        raise BadRequest("This username is already in use.")

    if not _check_email(email):
        raise BadRequest("This email address is invalid.")

    if find_user_by_email(email) is not None:
        raise BadRequest("This email address is already in use.")

    hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

    user = UserModel(name=username, email=email)
    user.password = hashed_pw

    user_repository.add(user)
    return user


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

    reset_model = EmailResetModel(user=user, code=code)
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


def create_spell(user, data):
    """
    Creates a new spell with the given data.
    If a spell already exists by this user, it will update the existing spell data instead.
    :param user:
    :param data:
    :return:
    """
    session = request_session()
    name = data.get("name")

    spell = session.query(SpellModel).filter(SpellModel.name == name and SpellModel.owner_id == user.id).one_or_none()
    if spell is None:
        spell = SpellModel()

    spell.owner_id = user.id
    spell.name = name
    spell.description = data.get("description")
    spell.higher_level = data.get("higher_level")
    spell.level = data.get("level")
    spell.spell_range = data.get("spell_range")
    spell.components = data.get("components")
    spell.material = data.get("material")
    spell.ritual = data.get("ritual")
    spell.concentration = data.get("concentration")
    spell.duration = data.get("duration")
    spell.casting_time = data.get("casting_time")
    spell.school = data.get("school")

    session.add(spell)
    session.commit()
    return spell
