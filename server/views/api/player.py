from flask import request
from werkzeug.exceptions import BadRequest, Unauthorized, NotFound

from server.lib.model.models import PlayerEquipmentModel, SpellModel, WeaponModel, PlayerProficiencyModel
from server.lib.service import player_service, playthrough_service
from server.lib.user_session import session_user
from server.views.api import api, json_api, require_login


def check_player(player):
    user = session_user()

    if player is None:
        raise NotFound("This player does not exist.")
    if player.user is not user and not playthrough_service.is_user_dm(user, player):
        raise Unauthorized("This player is not yours.")


@api.route('/playthrough/<int:playthrough_id>/players', methods=["POST"])
@json_api()
@require_login()
def create_player(playthrough_id):
    data = request.get_json()

    required_fields = ["name", "class", "code", "backs tory", "race"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    user = session_user()
    playthrough = playthrough_service.find_playthrough_with_id(playthrough_id)
    if playthrough is None:
        raise NotFound("This playthrough does not exist.")

    error = player_service.create_player(playthrough, data["name"], data["race"], data["class"], data["backstory"], user)

    success = error == ""
    return {
        "success": success,
        "error": error
    }


@api.route('/player/<int:player_id>', methods=["PUT"])
@json_api()
@require_login()
def update_player(player_id):
    player = player_service.find_player(player_id)
    check_player(player)

    data = request.get_json()

    required_fields = ["name", "class", "backstory", "race"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    player_service.update_player(player, data["name"], data["race"], data["class"], data["backstory"])

    return {
        "success": True
    }


@api.route('/playthrough/<int:playthrough_id>/players', methods=["GET"])
@json_api()
@require_login()
def get_players(playthrough_id):
    user = session_user()
    playthrough = playthrough_service.find_playthrough_with_id(playthrough_id)

    if not playthrough_service.user_in_playthrough(user, playthrough):
        raise Unauthorized("You do not have any players in this playthrough.")

    if playthrough is None:
        raise NotFound("This playthrough does not exist.")

    players = player_service.get_players(playthrough)
    data = []
    for player in players:
        data.append({
            "id": player.id,
            "user_name": player.user.name,
            "name": player.name,
            "race": player.race_name,
            "backstory": player.backstory,
            "class": player.class_name
        })

    return {
        "success": True,
        "players": data
    }


@api.route('/user/players', methods=["GET"])
@json_api()
@require_login()
def get_user_players():
    user = session_user()

    data = []

    players = player_service.get_user_players(user)
    for player in players:
        data.append({
            "id": player.id,
            "user_name": player.user.name,
            "name": player.name,
            "race": player.race_name,
            "class": player.class_name
        })

    return {
        "success": True,
        "players": data
    }


@api.route('/player/<int:player_id>/playthrough', methods=["PUT"])
@json_api()
@require_login()
def set_player_playthrough(player_id):
    player = player_service.find_player(player_id)
    check_player(player)

    data = request.get_json()

    required_fields = ["playthrough_code"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    playthrough = playthrough_service.find_playthrough_with_code(data.get("playthrough_code"))
    if playthrough is None:
        raise NotFound("This playthrough does not exist.")

    player_service.update_player_playthrough(player, playthrough)

    return {
        "success": True
    }


@api.route('/player/<int:player_id>', methods=["DELETE"])
@json_api()
@require_login()
def delete_player(player_id):
    player = player_service.find_player(player_id)
    check_player(player)

    player_service.delete_player(player)

    return {
        "success": True,
    }


@api.route('/player/<int:player_id>/data', methods=["GET"])
@json_api()
@require_login()
def get_player(player_id):
    player = player_service.find_player(player_id)
    check_player(player)

    player_info = player_service.get_player_info(player)
    info = {
        "strength": player_info.strength,
        "dexterity": player_info.dexterity,
        "constitution": player_info.constitution,
        "intelligence": player_info.intelligence,
        "wisdom": player_info.wisdom,
        "charisma": player_info.charisma,
        "saving_throws_str": player_info.saving_throws_str,
        "saving_throws_dex": player_info.saving_throws_dex,
        "saving_throws_con": player_info.saving_throws_con,
        "saving_throws_int": player_info.saving_throws_int,
        "saving_throws_wis": player_info.saving_throws_wis,
        "saving_throws_cha": player_info.saving_throws_cha,
        "max_hp": player_info.max_hp,
        "armor_class": player_info.armor_class,
        "speed": player_info.speed
    }

    return {
        "success": True,
        "name": player.name,
        "class": player.class_name,
        "race": player.race_name,
        "user_name": player.user.name,
        "backstory": player.backstory,
        "info": info
    }


@api.route('/player/<int:player_id>/data', methods=["PUT"])
@json_api()
@require_login()
def set_player_info(player_id):
    data = request.get_json()

    player = player_service.find_player(player_id)
    check_player(player)

    error = player_service.set_player_info(player,
                                           data.get("strength", None),
                                           data.get("dexterity", None),
                                           data.get("constitution", None),
                                           data.get("intelligence", None),
                                           data.get("wisdom", None),
                                           data.get("charisma", None),
                                           data.get("saving_throws_str", None),
                                           data.get("saving_throws_dex", None),
                                           data.get("saving_throws_con", None),
                                           data.get("saving_throws_int", None),
                                           data.get("saving_throws_wis", None),
                                           data.get("saving_throws_cha", None),
                                           data.get("max_hp", None),
                                           data.get("armor_class", None),
                                           data.get("speed", None))

    success = error == ""

    return {
        "success": success,
        "error": error
    }


@api.route('/player/<int:player_id>/item', methods=["POST"])
@json_api()
@require_login()
def add_player_item(player_id):
    data = request.get_json()

    required_fields = ["item_id"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    player = player_service.find_player(player_id)

    check_player(player)

    player_service.player_add_item(player, data.get("item_id"), data.get("amount", 1))

    return {
        "success": True
    }


@api.route('/player/<int:player_id>/spell', methods=["POST"])
@json_api()
@require_login()
def add_player_spell(player_id):
    data = request.get_json()

    required_fields = ["spell_id"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    player = player_service.find_player(player_id)

    check_player(player)

    player_service.player_add_spell(player, data.get("spell_id"))

    return {
        "success": True,
    }


@api.route('/player/<int:player_id>/item', methods=["GET"])
@json_api()
@require_login()
def get_player_items(player_id):
    player = player_service.find_player(player_id)
    check_player(player)

    items = []

    data = player_service.get_player_items(player)
    player_item: PlayerEquipmentModel
    weapon: WeaponModel
    for player_item, weapon in data:
        data = {
            "id": player_item.item.id,
            "category": player_item.item.category,

            "name": player_item.item.name,
            "amount": int(player_item.amount),
            "weight": int(player_item.item.weight),
            "value": player_item.item.cost
        }

        if weapon is not None:
            data.update({
                "dice_amount": weapon.dice_amount,
                "dice_type": weapon.dice_type,
                "damage_type": weapon.damage_type,
                "range_normal": weapon.range_normal,
                "range_long": weapon.range_long,
                "throw_range_normal": weapon.throw_range_normal,
                "throw_range_long": weapon.throw_range_long
            })

        items.append(data)

    return {
        "success": True,
        "items": items
    }


@api.route('/player/<int:player_id>/spell/<int:spell_id>', methods=["DELETE"])
@json_api()
@require_login()
def delete_player_spell(player_id, spell_id):
    user = session_user()

    player = player_service.find_player(player_id)
    check_player(player)

    error = player_service.delete_player_spell(user, player, spell_id)
    success = error == ""

    return {
        "success": success,
        "error": error
    }


@api.route('/player/<int:player_id>/item/<int:item_id>', methods=["DELETE"])
@json_api()
@require_login()
def delete_player_item(player_id, item_id):
    user = session_user()

    player = player_service.find_player(player_id)
    check_player(player)

    error = player_service.delete_player_item(user, player, item_id)

    return {
        "success": True,
        "error": error
    }


@api.route('/player/<int:player_id>/spell', methods=["GET"])
@json_api()
@require_login()
def get_player_spells(player_id):
    player = player_service.find_player(player_id)
    check_player(player)

    spells = []
    player_spells = player_service.get_player_spells(player)

    for player_spell in player_spells:
        spell: SpellModel = player_spell.spell
        spells.append({
            "id": spell.id,
            "name": spell.name,
            "level": int(spell.level),
            "duration": spell.duration,
            "higher_level": spell.higher_level,
            "casting_time": spell.casting_time,
            "concentration": spell.concentration,
            "ritual": spell.ritual,
            "material": spell.material,
            "components": spell.components,
            "spell_range": spell.spell_range,
            "description": spell.description,
            "school": spell.school,
            "phb_page": int(spell.phb_page)
        })

    return {
        "success": True,
        "spells": spells
    }


@api.route('/playthrough/<int:playthrough_id>/spells', methods=["GET"])
@json_api()
@require_login()
def get_spells(playthrough_id):
    playthrough = playthrough_service.find_playthrough_with_id(playthrough_id)

    if playthrough is None:
        raise NotFound("This playthrough does not exist.")

    spells = []
    spells_list = player_service.get_spells(playthrough)

    for spell in spells_list:
        spells.append({
            "id": spell.id,
            "name": spell.name,
            "level": int(spell.level),
            "phb_page": int(spell.phb_page)
        })

    return {
        "success": True,
        "spells": spells
    }


@api.route('/player/<int:player_id>/proficiencies', methods=["GET"])
@json_api()
@require_login()
def get_player_proficiencies(player_id: int):
    player = player_service.find_player(player_id)
    check_player(player)

    player_proficiencies: PlayerProficiencyModel = player_service.get_player_proficiencies(player)

    return {
        "success": True,
        "proficiencies": player_proficiencies.to_json()
    }


@api.route('/player/<int:player_id>/proficiencies', methods=["PUT"])
@json_api()
@require_login()
def set_player_proficiencies(player_id: int):
    data = request.get_json()

    player = player_service.find_player(player_id)
    check_player(player)

    error = player_service.update_proficiencies(player, data)

    return {
        "success": True,
        "error": error
    }
