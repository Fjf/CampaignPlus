from flask import request
from werkzeug.exceptions import BadRequest
from werkzeug.utils import redirect

from server.lib.service import player_service
from server.lib.user_session import session_user, session_user_set

from server.views.api import api, json_api, require_login
from server.lib.service import user_service


@api.route('/register', methods=["POST"])
@json_api()
def register():
    data = request.get_json()

    required_fields = ["name", "password", "email"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    name = data["name"]
    email = data["email"].lower().strip(" \n\t")
    pw = data["password"]
    error = user_service.create_user(name, pw, email)

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

    required_fields = ["name", "password"]

    if not data or (False in [x in data for x in required_fields]):
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


@api.route('/forgot_password', methods=["POST"])
@json_api()
def forgot_password():
    data = request.get_json()

    required_fields = ["email"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    error = user_service.reset_password(data["email"])

    success = error == ""

    return {
        "success": success,
        "error": error
    }


@api.route('/reset_password', methods=["POST"])
@json_api()
def reset_password():
    data = request.get_json()

    required_fields = ["password", "code"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    error, user = user_service.find_usermodel_with_code(data["code"])

    success = error == ""
    if not success:
        return {
            "success": success,
            "error": error
        }

    error = user_service.set_password(user, data["password"])

    return {
        "success": success,
        "error": error
    }


@api.route('/user/players', methods=["GET"])
@json_api()
@require_login()
def get_user_players():
    user = session_user()

    data = []

    players = player_service.get_user_players(user)
    for player in players:
        class_ids = [cls.id for cls in player_service.get_classes(player)]

        data.append({
            "id": player.id,
            "user_name": player.user.name,
            "name": player.name,
            "race": player.race_name,
            "class_ids": class_ids,
            "backstory": player.backstory,
        })

    return {
        "success": True,
        "players": data
    }


@api.route('/user/classes', methods=["GET"])
@json_api()
@require_login()
def get_user_classes():
    user = session_user()

    class_models = player_service.get_visible_classes(user)

    classes = []
    for class_model in class_models:
        abilities = player_service.get_class_abilities(class_model)
        classes.append({
            "id": class_model.id,
            "name": class_model.name,
            "info": class_model.info,
            "abilities": [ability.to_json() for ability in abilities]
        })

    return {
        "success": True,
        "classes": classes
    }


@api.route('/user/player', methods=["POST"])
@json_api()
@require_login()
def create_player():
    """
        Creates a player character

        Optional POST parameters:
         - name: The new name of your PC
         - race: The new race of your PC
         - class_ids: The new class ids (array) of your PC
         - backstory: The new backstory for your PC
        :return: A json object containing the updated player's id.
    """
    user = session_user()
    data = request.get_json()

    name = data.get("name", user.name)
    race = data.get("race", "Human")
    class_ids = data.get("class_ids", [])
    backstory = data.get("backstory", "")

    player, error = player_service.create_player(user, name, race, class_ids, backstory)

    return {
        "success": error == "",
        "player_id": player.id,
        "error": error
    }
