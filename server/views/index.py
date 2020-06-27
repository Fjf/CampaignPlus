import qrcode
import os

from flask import render_template, send_from_directory

from server import app
from server.lib.user_session import session_is_authed, session_user_set, session_user
from server.views.api import require_login
from server.lib.service import campaign_service, user_service


@app.route('/')
def index():
    if not session_is_authed():
        return login()
    return render_template('index.html', host=app.host + ":" + app.port)


@app.route('/login')
def login(refer=""):
    return render_template('login.html', redirect=refer)


@app.route('/register')
def register():
    return login()


@app.route('/logout')
def logout():
    session_user_set(None)
    return login()


@app.route('/join/<code>', methods=["GET"])
def join_playthrough(code):
    try:
        user = session_user()
    except ValueError:
        return login(refer="join/" + code)

    playthrough = campaign_service.find_playthrough_with_code(code)
    campaign_service.join_playthrough(user, playthrough)
    campaign_service.generate_qr(code)

    return render_template('create_pc.html', id=playthrough.id, code=code, username=user.name)


@app.route('/map/<code>', methods=["GET"])
def show_map(code):
    try:
        user = session_user()
    except ValueError:
        return login(refer="map/" + code)

    playthrough = campaign_service.find_playthrough_with_code(code)
    return render_template('map.html', pid=playthrough.id, mid=1)


@app.route('/battlemap/<code>', methods=["GET"])
def battlemap(code):
    try:
        session_user()
    except ValueError:
        return login(refer="battlemap/" + code)

    playthrough = campaign_service.find_playthrough_with_code(code)
    return render_template('battlemap.html', pid=playthrough.id)


@app.route('/reset/<code>', methods=["GET"])
def reset(code):
    return render_template('reset.html', code=code)


@app.route('/settings', methods=["GET"])
@require_login()
def settings():
    return render_template("settings.html")


@app.route('/testbattlemap', methods=["GET"])
@require_login()
def testbattlemap():
    user = session_user()
    return render_template("testbattlemap.html", pid=1, username=user.name)


@app.route('/app', methods=['GET'])
def download():
    import os
    uploads = os.path.join(app.root_path, "app")
    print(uploads)
    return send_from_directory(directory=uploads, filename="app-debug.apk", as_attachment=True)


print("Loaded index successfully.")
