from flask import Blueprint, jsonify
from functools import wraps

from werkzeug.exceptions import BadRequest, Unauthorized

from lib import user_session

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
                raise Unauthorized("User is not logged in.")

            return f(*args, **kwargs)

        return decorated_function

    return decorator


import endpoints.user  # noqa
import endpoints.player  # noqa
import endpoints.enemy  # noqa
import endpoints.player  # noqa
import endpoints.campaign  # noqa
import endpoints.map  # noqa
import endpoints.messages  # noqa
import endpoints.logs  # noqa
import endpoints.items  # noqa
import endpoints.socket  # noqa
import endpoints.race   # noqa

