from flask import request, jsonify
from werkzeug.exceptions import BadRequest
from server.lib.service import player_service

from server.views.api import api, json_api


@api.route('/createplayer', methods=["POST"])
@json_api()
def create_player():
    data = request.get_json()

    if not data or "name" not in data or "class" not in data:
        raise BadRequest()

    player_service.create_player(data["name"], data["class"])
    return


@api.route('/getplayers', methods=["GET"])
@json_api()
def get_players():
    players = player_service.get_players()

    data = []
    for player in players:
        data.append({
            "name": player.name,
            "class": player.class_name
        })

    return data
