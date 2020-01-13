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
    name = request.form.get('name', "")

    if pid is None:
        raise BadRequest()

    map_service.create_map(pid, file, 0, 0, name=name)
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
    if map is None:
        return {
            "success": False,
            "error": "This map does not exist."
        }

    children = map_service.get_children(map)

    markers = []
    for child in children:
        markers.append({"x": child.x, "y": child.y, "id": child.id, "name": child.name})

    return {
        "success": True,
        "id": map.id,
        "map_name": map.name,
        "map_story": map.story,
        "parent_id": map.parent_map_id,
        "image": os.path.join("/static/images/uploads", map.map_url),
        "markers": markers
    }


@api.route('/updatemapdata', methods=["POST"])
@json_api()
@require_login()
def set_map_data():
    data = request.get_json()

    required_fields = ["map_id"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    image_id = name = story = x = y = parent_id = None

    if "name" in data:
        name = data["name"]
    if "story" in data:
        story = data["story"]
    if "x" in data:
        x = data["x"]
    if "y" in data:
        y = data["y"]
    if "parent_id" in data:
        parent_id = data["parent_id"]
    if "image_id" in data:
        image_id = data["image_id"]

    error = map_service.update_map(data["map_id"], x, y, parent_id, name, story, image_id)

    success = error == ""

    return {
        "success": success,
        "error": error
    }


@api.route('/getmaps', methods=["POST"])
@json_api()
@require_login()
def get_all_maps():
    data = request.get_json()

    required_fields = ["playthrough_id"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    maps = map_service.get_all_maps(data["playthrough_id"])

    maps_list = []
    for map in maps:
        if map.parent_map is None:
            continue

        maps_list.append({
            "map_id": map.id,
            "map_name": map.name
        })

    return {
        "success": True,
        "maps": maps_list
    }


@api.route('/uploadbattlemap', methods=["POST"])
@json_api()
@require_login()
def create_battlemap():
    data = request.get_json()

    required_fields = ["playthrough_id", "battlemap", "name"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    user = session_user()

    error = map_service.create_battlemap(user, data["playthrough_id"], data["name"], data["battlemap"])
    success = error == ""
    return {
        "success": success,
        "error": error
    }


@api.route('/getbattlemaps', methods=["POST"])
@json_api()
@require_login()
def get_all_battlemaps():
    data = request.get_json()

    required_fields = ["playthrough_id"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    maps = map_service.get_all_battlemaps(data["playthrough_id"])

    maps_list = []
    for map in maps:
        maps_list.append({
            "name": map.name,
            "data": map.data
        })

    return {
        "success": True,
        "maps": maps_list
    }
