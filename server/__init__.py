import configparser
import os
import sys

from flask import Flask

global app


def create_app(config) -> Flask:
    app = Flask(__name__, template_folder='views/templates',
                static_folder='views/static')

    app_section = config['app']
    app.config['DEBUG'] = app_section.getboolean('debug')
    app.port = app_section['port']
    app.host = app_section['host']
    app.database_name = 'database.db'
    app.map_storage = 'server/views/static/images/uploads/'

    app.secret_key = app_section['secret'].encode()

    email_section = config['email']
    app.email_server = email_section['server']
    app.email_address = email_section['address']
    app.email_password = email_section['password']

    return app


def setup_directories():
    os.makedirs('storage', exist_ok=True)
    os.makedirs('server/views/static/images/uploads', exist_ok=True)


def init():
    print('Initialising')

    global app

    config_file = os.getenv('CONFIG_FILE', 'config.ini')

    config_parser = configparser.ConfigParser()
    if not config_parser.read(config_file):
        print('Error reading config.ini. Please copy config.ini.sample to '
              'config.ini and adjust it.')
        sys.exit(1)

    setup_directories()

    app = create_app(config_parser)

    # Import blueprints
    from server.views.api import api
    app.register_blueprint(api)

    # Import views to automatically set up routes.
    import server.views

    # Import database and set it up.
    import server.lib.database
    server.lib.database.register_teardown(app)
    server.lib.database.init_db(config_parser['database']['url'])

    # Create model
    server.lib.database.metadata_create_all()

    print('Setup done.')


init()


