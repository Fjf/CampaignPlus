from flask import request

from lib.service import player_service, item_service
from lib.user_session import session_user, session_user_set
from endpoints import api, json_api, require_login


@api.route('/items', methods=["GET"])
@json_api()
@require_login()
def get_items():
    user = session_user()

    player_id = request.args.get("player_id", -1)
    player = player_service.find_player(player_id)

    item_objects = item_service.get_items(user, player)
    return [item.to_json() for item in item_objects]
