from endpoints import api, json_api
from lib.repository import race_repository


@api.route('/races', methods=["GET"])
@json_api()
def get_races():
    races = race_repository.get_races()
    return [race.to_json() for race in races]

