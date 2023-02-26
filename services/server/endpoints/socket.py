import json

from services.server import socketio
from flask_socketio import emit
from flask_socketio import join_room, leave_room

from lib.user_session import session_user, session_user_set
from endpoints import api, json_api, require_login


@socketio.on('join')
@require_login()
def on_join(data):
    user = session_user()

    room = data['campaign']
    join_room(room)

    message = {
        "message": user.name + ' has joined the room.'
    }

    emit("message", json.dumps(message), json=True, room=room)


@socketio.on('leave')
@require_login()
def on_leave(data):
    user = session_user()
    room = data['campaign']
    leave_room(room)

    message = {
        "message": user.name + ' has left the room.'
    }

    emit("message", json.dumps(message), json=True, room=room)


@socketio.on('message')
@require_login()
def handle_message(message):
    user = session_user()
    room = message.get("campaign")

    message = {
        "message": user.name + ": " + message.get("message")
    }
    emit("message", json.dumps(message), json=True, room=room)


@socketio.on('update')
@require_login()
def on_update(data):
    room = data['campaign']
    user = session_user()

    if room == "Testing" and user.name != "duncan":
        return

    emit("update", data, json=True, room=room, include_self=False)
