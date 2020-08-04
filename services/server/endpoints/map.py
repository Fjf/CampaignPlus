import os

from flask import request
from werkzeug.exceptions import BadRequest

from lib.user_session import session_user, session_user_set
from endpoints import api, json_api, require_login
from lib.service import map_service


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


@api.route("/campaigns/<int:campaign_id>/maps", methods=["GET"])
@json_api()
@require_login()
def get_maps(campaign_id):
    user = session_user()
    map_model = map_service.get_root_map(user, campaign_id)
    if map_model is None:
        return map_service.create_map(user, campaign_id, 0, 0, None).to_json()
    return map_model.to_json(recursive=True)


@api.route("/campaigns/<int:campaign_id>/maps", methods=["PUT"])
@json_api()
@require_login()
def create_map(campaign_id):
    data = request.get_json()

    if "parent_map_id" not in data:
        raise BadRequest("Must specify a parent map.")
    if "x" not in data:
        raise BadRequest("Must specify an x coordinate for created map.")
    if "y" not in data:
        raise BadRequest("Must specify an y coordinate for created map.")

    parent_map_id = data.get("parent_map_id")
    x = data.get("x")
    y = data.get("y")

    user = session_user()
    map_model = map_service.create_map(user, campaign_id, x, y, parent_map_id)
    return map_model.to_json()


@api.route("/maps/<int:map_id>", methods=["POST"])
@json_api()
@require_login()
def alter_map(map_id):
    data = request.get_json()

    name = data.get("name", None)
    story = data.get("story", None)
    x = data.get("x", None)
    y = data.get("y", None)

    user = session_user()
    map_model = map_service.alter_map(user, map_id, None, name, story, x, y)
    return map_model.to_json()


@api.route("/maps/<int:map_id>/image", methods=["POST"])
@json_api()
@require_login()
def alter_map_image(map_id):
    img = request.files.get('image', None)
    user = session_user()
    map_model = map_service.alter_map(user, map_id, img)
    return map_model.to_json()


@api.route("/maps/<int:map_id>", methods=["DELETE"], defaults={"campaign_id": ""})
@api.route("/campaigns/<int:campaign_id>/maps/<int:map_id>", methods=["DELETE"])
@json_api()
@require_login()
def delete_map(campaign_id, map_id):
    user = session_user()
    deleted_map = map_service.delete_map(user, map_id)

    # Return the updated root map
    return map_service.get_root_map(user, deleted_map.campaign_id).to_json(recursive=True)


@api.route("/<int:campaign_id>/maps", methods=["POST"])
@json_api()
@require_login()
def create_editor_map(campaign_id):
    user = session_user()

    data = request.get_json()

    map_base64 = data.get("map_base64", None)
    name = data.get("name", "New Map")
    grid_size = data.get("grid_size", 1)
    grid_type = data.get("grid_type", "none")

    if campaign_id is None or map_base64 is None:
        raise BadRequest("Missing parameters to upload map; `campaign_id` or `map_base64`.")

    success, error, map_id = map_service.create_editor_map(user, campaign_id, map_base64, name, grid_size, grid_type)

    return {
        "success": success,
        "error": error,
        "map_id": map_id
    }


@api.route("/maps/<int:map_id>", methods=["POST"])
@json_api()
@require_login()
def update_editor_maps(map_id):
    return
