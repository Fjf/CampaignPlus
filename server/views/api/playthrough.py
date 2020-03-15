import time
from datetime import datetime

from flask import request
from werkzeug.exceptions import BadRequest, NotFound, Unauthorized

from server.lib.model.models import PlayerModel
from server.lib.user_session import session_user
from server.views.api import api, json_api, require_login
from server.lib.service import playthrough_service, player_service


def check_player(player: PlayerModel):
    user = session_user()

    if player is None:
        raise NotFound("This player does not exist.")
    if player.user is not user and not playthrough_service.is_user_dm(user, player):
        raise Unauthorized("This player is not yours.")


@api.route('/createplaythrough', methods=["POST"])
@json_api()
@require_login()
def create_playthrough():
    data = request.get_json()

    if not data or "name" not in data:
        raise BadRequest()

    user = session_user()

    return playthrough_service.create_playthrough(data['name'], datetime.now(), user)


@api.route('/getplaythroughs', methods=["GET"])
@json_api()
@require_login()
def get_playthrough():
    user = session_user()

    playthroughs = playthrough_service.get_playthroughs(user)

    data = []
    for playthrough in playthroughs:
        data.append({
            "id": playthrough.id,
            "name": playthrough.name,
            "time": time.mktime(playthrough.date.timetuple()) * 1000  # Python does time in seconds.
        })

    return data


@api.route('/getplaythroughurl', methods=["POST"])
@json_api()
@require_login()
def get_playthrough_url():
    user = session_user()
    data = request.get_json()

    if not data or "id" not in data:
        raise BadRequest()

    pid = data["id"]
    url = playthrough_service.get_playthrough_url(pid, user)
    playthrough, code_model = playthrough_service.get_playthrough_code(pid)
    playthrough_service.generate_qr(code_model.code)

    return {
        "url": url,
        "image_src": "/static/images/qr_codes/" + code_model.code + ".png"
    }


@api.route('/getplaythroughname', methods=["POST"])
@json_api()
@require_login()
def get_playthrough_name():
    data = request.get_json()

    if not data or "code" not in data:
        raise BadRequest()

    code = data["code"]
    playthrough = playthrough_service.find_playthrough_with_code(code)

    success = playthrough is not None
    name = ""
    if success:
        name = playthrough.name

    return {
        "success": success,
        "name": name
    }


@api.route('/joinplaythrough', methods=["POST"])
@json_api()
@require_login()
def join_playthrough():
    user = session_user()
    data = request.get_json()

    required_fields = ["playthrough_code"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    playthrough = playthrough_service.find_playthrough_with_code(data.get("playthrough_code").upper())
    if playthrough is None:
        raise NotFound("This playthrough code is not linked to any existing playthrough.")

    error = playthrough_service.join_playthrough(user, playthrough)
    success = error == ""
    return {
        "success": success,
        "error": error
    }


@api.route('/getjoinedplaythroughs', methods=["GET"])
@json_api()
@require_login()
def get_joined_playthroughs():
    user = session_user()

    playthroughs = playthrough_service.get_joined_playthroughs(user)

    data = []
    for playthrough, playthrough_code in playthroughs:
        data.append({
            "id": playthrough.id,
            "code": playthrough_code.code,
            "name": playthrough.name,
            "time": time.mktime(playthrough.date.timetuple()) * 1000  # Python does time in seconds.
        })

    return data


@api.route('/playthrough/<int:playthrough_id>/players', methods=["POST"])
@json_api()
@require_login()
def create_player_playthrough(playthrough_id):
    data = request.get_json()
    required_fields = ["name", "class", "backstory", "race"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    user = session_user()
    playthrough = playthrough_service.find_playthrough_with_id(playthrough_id)
    if playthrough is None:
        raise NotFound("This playthrough does not exist.")

    player, error = player_service.create_player(user, data["name"], data["race"], data["class_ids"], data["backstory"],
                                         playthrough)

    return {
        "success": True,
        "player_id": player.id,
        "error": error
    }


@api.route('/playthrough/<int:playthrough_id>/players', methods=["GET"])
@json_api()
@require_login()
def get_players(playthrough_id):
    user = session_user()
    playthrough = playthrough_service.find_playthrough_with_id(playthrough_id)

    if not playthrough_service.user_in_playthrough(user, playthrough):
        raise Unauthorized("You do not have any players in this playthrough.")

    if playthrough is None:
        raise NotFound("This playthrough does not exist.")

    players = player_service.get_players(playthrough)
    data = []
    for player in players:
        data.append({
            "id": player.id,
            "user_name": player.user.name,
            "name": player.name,
            "race": player.race_name,
            "backstory": player.backstory,
            "class": player.class_name
        })

    return {
        "success": True,
        "players": data
    }


@api.route('/playthrough/<int:playthrough_id>/players/<int:player_id>', methods=["DELETE"])
@json_api()
@require_login()
def delete_player_playthrough(playthrough_id: int, player_id: int):
    user = session_user()
    playthrough = playthrough_service.find_playthrough_with_id(playthrough_id)
    if playthrough is None:
        raise NotFound("This playthrough does not exist.")

    player = player_service.find_player(player_id)
    check_player(player)

    if player.playthrough is not playthrough:
        raise BadRequest("This player is not in this playthrough")

    player_service.update_player_playthrough(player, -1)

    return {
        "success": True,
        "player_id": player.id
    }


@api.route('/playthrough/<int:playthrough_id>/spells', methods=["GET"])
@json_api()
@require_login()
def get_spells(playthrough_id):
    playthrough = playthrough_service.find_playthrough_with_id(playthrough_id)

    if playthrough is None:
        raise NotFound("This playthrough does not exist.")

    spells = []
    spells_list = player_service.get_spells(playthrough)

    for spell in spells_list:
        spells.append({
            "id": spell.id,
            "name": spell.name,
            "level": int(spell.level),
            "phb_page": int(spell.phb_page)
        })

    return {
        "success": True,
        "spells": spells
    }
