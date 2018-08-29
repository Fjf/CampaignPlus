from flask import request
from werkzeug.exceptions import BadRequest

from server.lib.user_session import session_user
from server.views.api import api, json_api, require_login
from server.lib.service import enemy_service


@api.route('/createenemy', methods=["POST"])
@json_api()
@require_login()
def create_enemy():
    data = request.get_json()

    required_fields = ["name", "maxhp", "ac", "stre", "dex", "con", "inte", "wis", "cha"]

    if not data or (False in [x in required_fields for x in data]):
        raise BadRequest()

    user = session_user()

    enemy_service.create_enemy(data["name"], data["maxhp"], data["ac"], data["stre"], data["dex"], data["con"], data["inte"], data["wis"], data["cha"], user)
    return


@api.route('/getenemies', methods=["GET"])
@json_api()
@require_login()
def get_enemies():
    user = session_user()

    enemies = enemy_service.get_enemies(user)

    data = []
    for enemy in enemies:
        data.append({
            "id": enemy.id,
            "name": enemy.name,
            "hp": enemy.max_hp,
            "ac": enemy.armor_class,
            "stre": enemy.strength,
            "dex": enemy.dexterity,
            "con": enemy.constitution,
            "inte": enemy.intelligence,
            "wis": enemy.wisdom,
            "cha": enemy.charisma
        })

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
