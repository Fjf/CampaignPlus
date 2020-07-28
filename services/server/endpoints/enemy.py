from flask import request
from werkzeug.exceptions import BadRequest
from lib.user_session import session_user, session_user_set

from endpoints import api, json_api, require_login
from lib.service import enemy_service


@api.route('/createenemy', methods=["POST"])
@json_api()
@require_login()
def create_enemy():
    data = request.get_json()

    required_fields = ["name", "maxhp", "ac", "stre", "dex", "con", "inte", "wis", "cha"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    user = session_user()

    error = enemy_service.create_enemy(data["name"], data["maxhp"], data["ac"], data["stre"], data["dex"], data["con"], data["inte"], data["wis"], data["cha"], user)
    success = error == ""
    return {
        "success": success,
        "error": error
    }


@api.route('/enemies', methods=["GET"])
@json_api()
@require_login()
def get_enemies():
    user = session_user()

    enemies = enemy_service.get_enemies(user)

    data = []
    for enemy in enemies:
        data.append(enemy.to_json())

    return data


@api.route('/addability', methods=["POST"])
@json_api()
@require_login()
def add_ability():
    data = request.get_json()

    required_fields = ["id", "text"]

    if not data or (False in [x in required_fields for x in data]):
        raise BadRequest()

    user = session_user()
    error = enemy_service.add_ability(data["id"], data["text"], user)

    success = error == ""
    return {
        "success": success,
        "error": error
    }


@api.route('/editability', methods=["POST"])
@json_api()
@require_login()
def edit_ability():
    data = request.get_json()

    required_fields = ["ability_id", "text"]

    if not data or (False in [x in required_fields for x in data]):
        raise BadRequest()

    user = session_user()
    error = enemy_service.edit_ability(data["ability_id"], data["text"], user)

    success = error == ""
    return {
        "success": success,
        "error": error
    }


@api.route('/getabilities', methods=["POST"])
@json_api()
@require_login()
def get_abilities():
    data = request.get_json()

    required_fields = ["id"]

    if not data or (False in [x in required_fields for x in data]):
        raise BadRequest()

    user = session_user()

    fields = []
    data = enemy_service.get_abilities(data["id"], user)
    success = data is not None

    for field in data:
        fields.append({
            "text": field.text,
            "id": field.id
        })

    return {
        "success": success,
        "fields": fields
    }


@api.route('/deleteability', methods=["POST"])
@json_api()
@require_login()
def delete_ability():
    data = request.get_json()

    required_fields = ["id", "enemy_id"]

    if not data or (False in [x in required_fields for x in data]):
        raise BadRequest()

    user = session_user()

    error = enemy_service.delete_ability(data["id"], data["enemy_id"], user)
    success = error == ""

    return {
        "success": success,
        "error": error
    }


@api.route('/deleteenemy', methods=["POST"])
@json_api()
@require_login()
def delete_enemy():
    data = request.get_json()

    required_fields = ["enemy_id"]

    if not data or (False in [x in required_fields for x in data]):
        raise BadRequest()

    user = session_user()

    error = enemy_service.delete_enemy(data["enemy_id"], user)
    success = error == ""

    return {
        "success": success,
        "error": error
    }
