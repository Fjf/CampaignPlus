from endpoints import api, json_api, require_login
from lib.service import item_service
from lib.user_session import session_user


@api.route('/items', methods=["GET"])
@json_api()
@require_login()
def get_items():
    user = session_user()
    item_objects = item_service.get_items(user)
    return [item.to_json() for item in item_objects]
