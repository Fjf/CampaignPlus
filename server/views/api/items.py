from flask import request
from werkzeug.exceptions import BadRequest

from server.lib.service import item_service, player_service
from server.lib.user_session import session_user
from server.views.api import json_api, api, require_login


@api.route('/getitems', methods=["POST"])
@json_api()
@require_login()
def get_items():
    data = request.get_json()
    user = session_user()

    required_fields = ["player_id"]

    if not data or (False in [x in required_fields for x in data]):
        raise BadRequest()

    player_id = data.get("player_id")

    player = player_service.find_player(player_id)
    if player is None:
        return {
            "success": False,
            "error": "This player does not exist."
        }

    item_objects = item_service.get_items(user, player)
    items = []
    for item in item_objects:
        items.append({
            "item_id": item.id,
            "playthrough_id": item.playthrough_id,
            "name": item.name,
            "category": item.category,
            "weight": item.weight,
            "cost": item.cost
        })

    print(items)

    return {
        "success": True,
        "items": items
    }
