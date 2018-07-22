from flask import request
from werkzeug.exceptions import BadRequest
from server.lib.service import player_service
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


@api.route('/getplayers', methods=["POST"])
@json_api()
@require_login()
def get_players():
    data = request.get_json()

    if not data or "playthrough_id" not in data:
        raise BadRequest()

    if data["playthrough_id"] is None:
        raise BadRequest()

    players = player_service.get_players(data["playthrough_id"])

    data = []
    for player in players:
        data.append({
            "name": player.name,
            "class": player.class_name
        })

    return data
