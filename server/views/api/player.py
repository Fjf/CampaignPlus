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

    if not data or "name" not in data or "class" not in data:
        raise BadRequest()

    user = session_user()

    player_service.create_player(data["name"], data["class"], user.id)
    return


@api.route('/getplayers', methods=["GET"])
@json_api()
@require_login()
def get_players():
    players = player_service.get_players()

    data = []
    for player in players:
        data.append({
            "name": player.name,
            "class": player.class_name
        })

    return data
