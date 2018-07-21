from flask import request
from werkzeug.exceptions import BadRequest

from server.lib.service import player_service
from server.lib.user_session import session_user, session_user_set

from server.views.api import api, json_api
from server.lib.service import user_service


@api.route('/register', methods=["POST"])
@json_api()
def register():
    data = request.get_json()

    if not data or "name" not in data or "password" not in data:
        raise BadRequest()

    name = data["name"]
    pw = data["password"]
    user_data = user_service.create_user(name, pw)

    error = ""
    if user_data == 0:
        error = "Username already in use"

    # Do this to set session to the registered user.
    if user_data == 1:
        user_data = user_service.login(name, pw)

    return {
        "success": user_data,
        "error": error
    }


@api.route('/login', methods=["POST"])
@json_api()
def login():
    data = request.get_json()

    if not data or "name" not in data or "password" not in data:
        raise BadRequest()

    data = user_service.login(data["name"], data["password"])

    return {
        "success": data
    }


@api.route('/session', methods=["GET"])
@json_api()
def session():
    user = session_user()

    data = ""
    if user is not None:
        data = user.name

    return {
        "name": data
    }
