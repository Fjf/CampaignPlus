import json

from flask import request

from server import socketio
from flask_socketio import emit
from flask_socketio import join_room, leave_room


@socketio.on('join')
def on_join(data):
    username = data['username']
    room = data['campaign']
    join_room(room)

    message = {
        "message": username + ' has joined the room.'
    }

    emit("message", json.dumps(message), json=True, room=room)


@socketio.on('leave')
def on_leave(data):
    username = data['username']
    room = data['campaign']
    leave_room(room)

    message = {
        "message": username + ' has left the room.'
    }

    emit("message", json.dumps(message), json=True, room=room)


@socketio.on('message')
def handle_message(message):
    room = message.get("campaign")

    message = {
        "message": message.get("username") + ": " + message.get("message")
    }
    emit("message", json.dumps(message), json=True, room=room)
