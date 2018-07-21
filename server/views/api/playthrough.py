import time
from datetime import datetime

from flask import request
from werkzeug.exceptions import BadRequest

from server.lib.user_session import session_user
from server.views.api import api, json_api, require_login
from server.lib.service import playthrough_service


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

    id = data["id"]
    url = playthrough_service.get_playthrough_url(id, user)

    return {"url": url}


@api.route('/join/<code>', methods=["GET"])
@json_api()
@require_login()
def join_playthrough(code):
    user = session_user()

    playthrough_service.join_playthrough(code)

    return
