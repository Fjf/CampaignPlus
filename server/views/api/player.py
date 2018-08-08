from flask import request
from werkzeug.exceptions import BadRequest
from server.lib.service import player_service, playthrough_service
from server.lib.user_session import session_user

from server.views.api import api, json_api, require_login


@api.route('/createplayer', methods=["POST"])
@json_api()
@require_login()
def create_player():
    data = request.get_json()

    required_fields = ["name", "class_name", "code", "backstory", "race"]

    if not data or (False in [x in required_fields for x in data]):
        raise BadRequest()

    user = session_user()

    error = player_service.create_player(data["name"], data["race"], data["class_name"], data["backstory"], data["code"], user)

    success = error == ""
    return {
        "success": success,
        "error": error
    }


@api.route('/updateplayer', methods=["POST"])
@json_api()
@require_login()
def update_player():
    data = request.get_json()

    required_fields = ["pid", "name", "class_name", "code", "backstory", "race"]

    if not data or (False in [x in required_fields for x in data]):
        raise BadRequest()

    user = session_user()

    print(data)

    error = player_service.update_player(data["pid"], data["name"], data["race"], data["class_name"], data["backstory"], data["code"], user)

    success = error == ""
    return {
        "success": success,
        "error": error
    }


@api.route('/getplayers', methods=["POST"])
@json_api()
@require_login()
def get_players():
    data = request.get_json()

    if not data or ("playthrough_id" not in data and "playthrough_code" not in data):
        raise BadRequest()

    pid = data["playthrough_id"] if "playthrough_id" in data else None

    if pid is None:
        pt = playthrough_service.find_playthrough_with_code(data["playthrough_code"])
        if pt is None:
            raise BadRequest("Invalid code.")

        pid = pt.id

    players = player_service.get_players(pid)
    data = []
    for player in players:
        data.append({
            "id": player.id,
            "user_name": player.user.name,
            "name": player.name,
            "class": player.class_name
        })

    return data


@api.route('/deleteplayer', methods=["POST"])
@json_api()
@require_login()
def delete_player():
    data = request.get_json()
    user = session_user()

    if not data or "id" not in data:
        raise BadRequest()

    error = player_service.delete_player(data["id"], user)

    success = error == ""

    return {
        "success": success,
        "error": error
    }


@api.route('/getplayerdata', methods=["POST"])
@json_api()
@require_login()
def get_player():
    data = request.get_json()

    if not data or "player_id" not in data:
        raise BadRequest()

    player = player_service.find_player(data["player_id"])

    success = player is not None

    if not success:
        return {"success": success}
    else:
        return {
            "success": success,
            "name": player.name,
            "class": player.class_name,
            "race": player.race_name,
            "user_name": player.user.name,
            "backstory": player.backstory
        }
