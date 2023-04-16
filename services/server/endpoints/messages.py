from flask import request
from werkzeug.exceptions import BadRequest

from lib.service import message_service
from lib.user_session import session_user, session_user_set
from endpoints import api, json_api, require_login


@api.route('/createmessage', methods=["POST"])
@json_api()
@require_login()
def create_message():
    data = request.get_json()

    required_fields = ["campaign_code", "message"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    user = session_user()

    error = message_service.create_message(data["campaign_code"], user, data["message"])
    success = error == ""

    return {
        "success": success,
        "error": error
    }


@api.route('/getmessages', methods=["POST"])
@json_api()
@require_login()
def get_messages():
    data = request.get_json()

    required_fields = ["campaign_id"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    user = session_user()

    (error, messages) = message_service.get_messages(data["campaign_id"], user)
    success = error == ""

    if not success:
        return {
            "success": success,
            "error": error
        }

    message_list = []
    for message in messages:
        if message.sender is None:
            continue

        message_list.append({
            "time": message.time,
            "message": message.message,
            "sender_name": message.sender.owner.name,
            "player_name": message.sender.name
        })

    return {
        "success": success,
        "error": error,
        "messages": message_list
    }
