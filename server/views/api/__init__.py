from flask import Blueprint, jsonify
from functools import wraps

from werkzeug.exceptions import BadRequest

from server.lib import user_session

api = Blueprint('api', __name__, url_prefix='/api')


def json_api():
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            res = f(*args, **kwargs)
            return jsonify(res)

        return decorated_function

    return decorator


def require_login():
    """
    Add this decorator to an end point to require that a user is logged in.

    For example:
    @app.route('/secure_endpoint_sample')
    @require_login()
    def secure():
        return 'this endpoint is secure'

    """

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not user_session.session_is_authed():
                raise BadRequest()

            return f(*args, **kwargs)

        return decorated_function

    return decorator


import server.views.api.player  # noqa
import server.views.api.user  # noqa
import server.views.api.enemy  # noqa
import server.views.api.playthrough  # noqa
import server.views.api.map  # noqa
import server.views.api.messages  # noqa
import server.views.api.logs  # noqa
import server.views.api.items  # noqa

