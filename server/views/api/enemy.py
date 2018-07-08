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

    if not data or "name" not in data or "maxhp" not in data:
        raise BadRequest()

    user = session_user()

    enemy_service.create_enemy(data["name"], data["maxhp"], user.id)
    return


@api.route('/getenemies', methods=["GET"])
@json_api()
@require_login()
def get_enemies():
    enemies = enemy_service.get_enemies()

    data = []
    for enemy in enemies:
        data.append({
            "name": enemy.name,
            "hp": enemy.max_hp
        })

    return data
