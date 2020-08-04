import configparser
import os
import sys

from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO

from lib.exceptions import JSONExceptionHandler

global app
global socketio


def create_app(config) -> Flask:
    app = Flask(__name__, template_folder='../client/public',
                static_folder='../client/public/static')

    app_section = config['app']
    app.config['DEBUG'] = app_section.getboolean('debug')
    app.port = app_section['port']
    app.host = app_section['host']
    app.database_name = 'database.db'
    app.map_storage = 'services/client/public/static/images/uploads/'

    app.secret_key = app_section['secret'].encode()

    email_section = config['email']
    app.email_server = email_section['server']
    app.email_address = email_section['address']
    app.email_password = email_section['password']

    return app


def setup_directories():
    os.makedirs('storage', exist_ok=True)
    os.makedirs("services/client/public/static/images/uploads/", exist_ok=True)


def init():
    print('Initialising')

    global app
    global socketio

    config_file = os.getenv('CONFIG_FILE', 'config.ini')

    config_parser = configparser.ConfigParser()
    if not config_parser.read(config_file):
        print('Error reading config.ini. Please copy config.ini.sample to '
              'config.ini and adjust it.')
        sys.exit(1)

    setup_directories()

    app = create_app(config_parser)

    # I dont care about cross origin requests
    CORS(app)

    # Wrap app in JSON response to parse exceptions to JSON instead of HTML.
    handler = JSONExceptionHandler(app)

    # Wrap app in socketIO to support socket communication
    socketio = SocketIO(app)

    # Import blueprints
    from endpoints import api
    app.register_blueprint(api)

    # Import views to automatically set up routes.
    import views.index

    # Import database and set it up.
    import lib.database
    lib.database.register_teardown(app)
    lib.database.init_db(config_parser['database']['url'])

    # Create model
    lib.database.metadata_create_all()

    print('Setup done.')


init()


