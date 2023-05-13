from flask import render_template, send_from_directory

from services.server import app
from lib.user_session import session_is_authed, session_user_set, session_user
from endpoints import require_login
from lib.service import campaign_service


@app.route('/', defaults={"text": ""})
@app.route('/<path:text>')
def index(text):
    return render_template('index.html')


@app.route('/api/<path:text>')
def api_error(text):
    return "Invalid API url.", 404


@app.route('/logout')
def logout():
    session_user_set(None)
    return index("")


@app.route('/app', methods=['GET'])
def download():
    import os
    uploads = os.path.join(app.root_path, "app")
    print(uploads)
    return send_from_directory(directory=uploads, path="app-debug.apk", as_attachment=True)


print("Loaded index successfully.")
