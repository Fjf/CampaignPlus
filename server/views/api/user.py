from flask import request
from werkzeug.exceptions import BadRequest
from werkzeug.utils import redirect

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
    error = user_service.create_user(name, pw)

    success = error == ""

    # Do this to set session to the registered user.
    if success == 1:
        error = user_service.login(name, pw)

    success = error == ""

    refer = "/"
    if "redirect" in data:
        refer += data["redirect"]

    return {
        "success": success,
        "error": error,
        "refer": refer
    }


@api.route('/login', methods=["POST"])
@json_api()
def login():
    data = request.get_json()

    if not data or "name" not in data or "password" not in data:
        raise BadRequest()

    error = user_service.login(data["name"], data["password"])

    success = error == ""

    refer = "/"
    if "redirect" in data:
        refer += data["redirect"]

    return {
        "success": success,
        "error": error,
        "refer": refer
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
