from flask import render_template

from server import app
from server.lib.user_session import session_is_authed, session_user_set


@app.route('/')
def index():
    if not session_is_authed():
        return login()
    return render_template('index.html')


@app.route('/login')
def login():
    return render_template('login.html')


@app.route('/register')
def register():
    return login()


@app.route('/logout')
def logout():
    session_user_set(None)
    return login()


print("Loaded index successfully.")

