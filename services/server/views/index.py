from flask import render_template, send_from_directory

from services.server import app
from lib.user_session import session_is_authed, session_user_set, session_user
from endpoints import require_login
from lib.service import campaign_service


@app.route('/', defaults={"text": ""})
@app.route('/<path:text>')
def index(text):
    return render_template('index.html')


@app.route('/register')
def register():
    return index("")


@app.route('/logout')
def logout():
    session_user_set(None)
    return index("")


@app.route('/join/<code>', methods=["GET"])
def join_campaign(code):
    try:
        user = session_user()
    except ValueError:
        from lib.service.user_service import login
        return login(refer="join/" + code)

    campaign = campaign_service.find_campaign_with_code(code)
    campaign_service.join_campaign(user, campaign)

    return render_template('create_pc.html', id=campaign.id, code=code, username=user.name)



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
