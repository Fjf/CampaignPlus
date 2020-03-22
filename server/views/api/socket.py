from flask import request

from server import app
from flask_socketio import send
from flask_socketio import join_room, leave_room


@app.on('join')
def on_join(data):
    username = data['username']
    room = data['campaign']
    join_room(room)
    send(username + ' has entered the room.', room=room)


@app.on('leave')
def on_leave(data):
    username = data['username']
    room = data['campaign']
    leave_room(room)
    send(username + ' has left the room.', room=room)


@app.on('json')
def handle_json(json):
    room = json.get("campaign")
    send(json, json=True, room=room)
