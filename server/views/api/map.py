import os

from flask import request, send_from_directory
from werkzeug.exceptions import BadRequest

from server import app
from server.lib.user_session import session_user
from server.views.api import api, json_api, require_login
from server.lib.service import enemy_service, map_service, playthrough_service


@api.route('/uploadmap', methods=["POST"])
@json_api()
@require_login()
def create_map():
    try:
        file = request.files["file"]
    except:
        return {
            "success": 0,
            "error": "No file was uploaded."
        }

    pid = request.form.get('playthrough_id', None)
    x = request.form.get('x', None)
    y = request.form.get('y', None)
    parent_id = request.form.get('parent_id', None)

    if pid is None or x is None or y is None or parent_id is None:
        raise BadRequest()

    parent = map_service.get_map(pid)

    map_service.create_map(pid, file, x, y, parent)
    return {
        "success": True
    }


@api.route('/getmap', methods=["POST"])
@json_api()
@require_login()
def get_map():
    map = map_service.get_map(3)
    return {
        "success": True,
        "id": 3,
        "image": os.path.join("/static/images/uploads", map.map_url)
    }

