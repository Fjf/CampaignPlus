from flask import request, Response
from werkzeug.exceptions import BadRequest

from endpoints import api, json_api, require_login
from lib.service import player_service, user_service, item_service
from lib.user_session import session_user, session_user_set


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

    user = user_service.create_user(name, pw, email)

    # Do this to set session to the registered user.
    if user is not None:
        user = user_service.login(name, pw)

    refer = "/"
    if "redirect" in data:
        refer += data["redirect"]

    return {
        "user": user.to_json() if user is not None else None,
        "refer": refer
    }


@api.route('/login', methods=["POST"])
def api_login():
    data = request.get_json()

    username = data.get("username", None)
    password = data.get("password", None)

    if username is None:
        raise BadRequest("No username specified.")
    if password is None:
        raise BadRequest("No password specified.")

    user = user_service.login(username, password)

    refer = "/"
    if "redirect" in data:
        refer += data["redirect"]

    result = {
        "user": user.to_json() if user is not None else None,
        "refer": refer
    }
    return result


@api.route('/logout', methods=["POST"])
@json_api()
@require_login()
def logout():
    session_user_set(None)

    return {
        "success": True
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

    players = player_service.get_user_players(user)

    return [player.to_json() for player in players]


@api.route('/user/classes', methods=["GET"])
@json_api()
@require_login()
def get_user_classes():
    user = session_user()
    class_models = player_service.get_visible_classes(user)
    return [cls.to_json() for cls in class_models]


@api.route('/user/subclasses', methods=["GET"])
@json_api()
@require_login()
def get_user_subclasses():
    user = session_user()
    class_models = player_service.get_visible_subclasses(user)
    return [cls.to_json() for cls in class_models]


@api.route('/user/items', methods=["POST"])
@json_api()
@require_login()
def create_user_item():
    """
    Creates a new item for this user
    """
    user = session_user()
    try:
        item = item_service.create_item(user, request.get_json())
    except KeyError as e:
        return "Missing JSON key values.", 400

    return item.to_json(), 201


@api.route('/user/items', methods=["GET"])
@json_api()
@require_login()
def get_items():
    user = session_user()
    item_objects = item_service.get_items(user)
    return [item.to_json() for item in item_objects]


@api.route('/user/spells', methods=["GET"])
@json_api()
@require_login()
def get_available_spells():
    user = session_user()
    spells_list = player_service.get_spells(user)
    return [spell.to_json() for spell in spells_list]


@api.route('/user/spells', methods=["POST"])
@json_api()
@require_login()
def create_new_spell():
    """
    Creates a new spell for this user
    """
    user = session_user()
    spell = user_service.create_spell(user, request.get_json())

    return spell.to_json(), 201


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

    player = player_service.create_player(user, name, race)
    player = player_service.update_player(player, data)

    return player


print("Registered user api endpoints.")
