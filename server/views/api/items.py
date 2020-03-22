from flask import request
from werkzeug.exceptions import BadRequest

from server.lib.service import item_service, player_service
from server.lib.user_session import session_user
from server.views.api import json_api, api, require_login


@api.route('/items', methods=["GET"])
@json_api()
@require_login()
def get_items():
    user = session_user()

    player_id = request.args.get("player_id", -1)
    player = player_service.find_player(player_id)

    item_objects = item_service.get_items(user, player)
    items = []
    for item in item_objects:
        items.append({
            "id": item.id,
            "campaign_id": item.playthrough_id,
            "name": item.name,
            "category": item.category,
            "weight": item.weight,
            "value": item.cost
        })

    print(items)

    return {
        "success": True,
        "items": items,
        "error": ""
    }
