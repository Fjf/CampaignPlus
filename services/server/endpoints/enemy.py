from flask import request
from werkzeug.exceptions import BadRequest
from lib.user_session import session_user, session_user_set

from endpoints import api, json_api, require_login
from lib.service import enemy_service


@api.route('/enemies', methods=["PUT"])
@json_api()
@require_login()
def create_enemy():
    data = request.get_json()

    name = data.get("name", "New Enemy")
    max_hp = data.get("max_hp", 0)
    armor_class = data.get("armor_class", 0)
    strength = data.get("str", 0)
    dex = data.get("dex", 0)
    con = data.get("con", 0)
    intelligence = data.get("int", 0)
    wisdom = data.get("wis", 0)
    cha = data.get("cha", 0)

    user = session_user()

    enemy = enemy_service.create_enemy(name, max_hp, armor_class, strength, dex, con, intelligence, wisdom, cha, user)
    print(enemy, enemy.to_json())
    return enemy.to_json()


@api.route('/enemies', methods=["GET"])
@json_api()
@require_login()
def get_enemies():
    user = session_user()
    enemies = enemy_service.get_enemies(user)
    return [d.to_json() for d in enemies]


@api.route('/enemies/<int:enemy_id>', methods=["POST"])
@json_api()
@require_login()
def edit_ability(enemy_id):
    data = request.get_json()

    user = session_user()
    enemy = enemy_service.edit_enemy(user, enemy_id=enemy_id, data=data)

    return enemy.to_json()


@api.route('/enemies/<int:enemy_id>/abilities', methods=["GET"])
@json_api()
@require_login()
def get_enemy_abilities(enemy_id):
    user = session_user()
    data = enemy_service.get_abilities(user, enemy_id=enemy_id)
    return [d.to_json() for d in data]


@api.route('/enemies/<int:enemy_id>/abilities/<int:ability_id>', methods=["DELETE"])
@json_api()
@require_login()
def delete_ability_from_enemy(enemy_id, ability_id):
    user = session_user()
    enemy_service.delete_ability(ability_id=ability_id, user=user)
    return [x.to_json() for x in enemy_service.get_abilities(user, enemy_id=enemy_id)]


@api.route('/abilities/<int:ability_id>', methods=["DELETE"])
@json_api()
@require_login()
def delete_ability(ability_id):
    user = session_user()
    enemy_service.delete_ability(ability_id=ability_id, user=user)


@api.route('/enemies/<int:enemy_id>', methods=["DELETE"])
@json_api()
@require_login()
def delete_enemy(enemy_id):
    user = session_user()

    new_enemies = enemy_service.delete_enemy(enemy_id, user)
    return [enemy.to_json() for enemy in new_enemies]


@api.route('/enemies/<int:enemy_id>/abilities', methods=["PUT"])
@json_api()
@require_login()
def add_ability(enemy_id):
    data = request.get_json()

    ability = data.get("ability")

    user = session_user()
    ability = enemy_service.add_ability(enemy_id, ability, user)
    return ability.to_json()


@api.route('/abilities', methods=["GET"])
@json_api()
@require_login()
def get_abilities():
    user = session_user()

    data = enemy_service.get_abilities(user)
    return [d.to_json() for d in data]


