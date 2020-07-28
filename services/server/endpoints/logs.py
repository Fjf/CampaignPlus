from flask import request
from werkzeug.exceptions import BadRequest

from lib.service import log_service
from lib.user_session import session_user, session_user_set
from endpoints import api, json_api, require_login



@api.route('/createlog', methods=["POST"])
@json_api()
@require_login()
def create_log():
    data = request.get_json()

    required_fields = ["playthrough_code", "title", "text"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    user = session_user()

    error = log_service.create_log(user, data["playthrough_code"], data["title"], data["text"])

    success = error == ""

    return {
        "success": success,
        "error": error
    }


@api.route('/getlogs', methods=["POST"])
@json_api()
@require_login()
def get_logs():
    data = request.get_json()

    required_fields = ["playthrough_code"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    user = session_user()

    (error, logs) = log_service.get_logs(data["playthrough_code"], user)
    success = error == ""

    if not success:
        return {
            "success": success,
            "error": error
        }

    log_list = []
    for log in logs:
        log_list.append({
            "id": log.id,
            "text": log.text,
            "title": log.title,
            "time": log.time,
            "creator_name": log.creator.name,
            "creator_user_name": log.creator.user.name
        })

    return {
        "success": success,
        "error": error,
        "logs": log_list
    }


@api.route('/deletelog', methods=["POST"])
@json_api()
@require_login()
def delete_log():
    data = request.get_json()

    required_fields = ["playthrough_code", "log_id"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    user = session_user()

    error = log_service.delete_log(user, data["playthrough_code"], data["log_id"])
    success = error == ""

    return {
        "success": success,
        "error": error
    }

