from endpoints import api, json_api, require_login
from lib.repository import race_repository


@api.route('/races', methods=["GET"])
@json_api()
@require_login()
def get_races():
    races = race_repository.get_races()
    return [race.to_json() for race in races]


@api.route('/races/<string:race_name>', methods=["GET"])
@json_api()
@require_login()
def get_race_by_name(race_name):
    race = race_repository.get_race_by_name(race_name)
    return race.to_json()


@api.route('/races/<int:race_id>', methods=["GET"])
@json_api()
@require_login()
def get_race_by_id(race_id):
    race = race_repository.get_race_by_id(race_id)
    return race.to_json()
