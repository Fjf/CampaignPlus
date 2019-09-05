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

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    user = session_user()

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
    else:
        pt = playthrough_service.find_playthrough_with_id(pid)

    if pt is None:
        raise BadRequest("Invalid code/id.")

    players = player_service.get_players(pt)
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


@api.route('/setplayerinfo', methods=["POST"])
@json_api()
@require_login()
def set_player_info():
    data = request.get_json()
    user = session_user()

    required_fields = ["player_id"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    error = player_service.set_player_info(user, data["player_id"], data["strength"], data["dexterity"], data["constitution"],
                                   data["intelligence"], data["wisdom"], data["charisma"], data["saving_throws_str"],
                                   data["saving_throws_dex"], data["saving_throws_con"], data["saving_throws_int"],
                                   data["saving_throws_wis"], data["saving_throws_cha"], data["max_hp"],
                                   data["armor_class"], data["speed"])

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

    if success:
        player_info = player_service.get_player_info(player)
        info = {
            "strength": player_info.strength,
            "dexterity": player_info.dexterity,
            "constitution": player_info.constitution,
            "intelligence": player_info.intelligence,
            "wisdom": player_info.wisdom,
            "charisma": player_info.charisma,
            "saving_throws_str": player_info.saving_throws_str,
            "saving_throws_dex": player_info.saving_throws_dex,
            "saving_throws_con": player_info.saving_throws_con,
            "saving_throws_int": player_info.saving_throws_int,
            "saving_throws_wis": player_info.saving_throws_wis,
            "saving_throws_cha": player_info.saving_throws_cha,
            "max_hp": player_info.max_hp,
            "armor_class": player_info.armor_class,
            "speed": player_info.speed
        }
    else:
        info = None

    if not success:
        return {"success": success}
    else:
        return {
            "success": success,
            "name": player.name,
            "class": player.class_name,
            "race": player.race_name,
            "user_name": player.user.name,
            "backstory": player.backstory,
            "info": info
        }
