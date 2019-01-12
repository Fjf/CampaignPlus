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

    pid = int(request.form.get('playthrough_id', None))
    x = int(request.form.get('x', None))
    y = int(request.form.get('y', None))
    parent_id = int(request.form.get('parent_id', None))

    if pid is None or x is None or y is None or parent_id is None:
        raise BadRequest()

    parent = map_service.get_map(parent_id)

    map_service.create_map(pid, file, x, y, parent)
    return {
        "success": True
    }


@api.route('/getmap', methods=["POST"])
@json_api()
@require_login()
def get_map():
    data = request.get_json()

    required_fields = ["map_id", "playthrough_id"]

    if not data or (False in [x in required_fields for x in data]):
        raise BadRequest()

    map = map_service.get_map(data["map_id"])
    mapdata = map_service.get_map_data(map)

    mapname = mapdata.name if mapdata is not None else None

    children = map_service.get_children(map)

    markers = []
    for child in children:
        mapdata = map_service.get_map_data(child)
        name = mapdata.name if mapdata is not None else None

        markers.append({"x": child.x, "y": child.y, "id": child.id, "name": name})

    return {
        "success": True,
        "id": data["map_id"],
        "mapdata": mapname,
        "parent_id": map.parent_map_id,
        "image": os.path.join("/static/images/uploads", map.map_url),
        "markers": markers
    }


@api.route('/getmapdata', methods=["POST"])
@json_api()
@require_login()
def get_map_data():
    data = request.get_json()

    required_fields = ["map_id", "playthrough_id"]

    if not data or (False in [x in required_fields for x in data]):
        raise BadRequest()

    map = map_service.get_map(data["map_id"])

    if map is None:
        return {
            "success": False,
            "error": "This map does not exist."
        }

    mapdata = map_service.get_map_data(map)

    if mapdata is None:
        return {
            "success": False,
            "error": "This map does not have additional data."
        }

    return {
        "success": True,
        "id": mapdata.map.id,
        "story": mapdata.story,
        "name": mapdata.name
    }


@api.route('/setmapdata', methods=["POST"])
@json_api()
@require_login()
def set_map_data():
    data = request.get_json()

    required_fields = ["map_id", "playthrough_id", "story", "name"]

    if not data or (False in [x in required_fields for x in data]):
        raise BadRequest()

    print(data)

    map = map_service.get_map(data["map_id"])

    error = map_service.set_map_data(map, data["name"], data["story"])

    success = error == ""

    return {
        "success": success,
        "error": error
    }

