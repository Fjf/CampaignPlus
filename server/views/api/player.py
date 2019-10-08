from flask import request
from werkzeug.exceptions import BadRequest, Unauthorized, NotFound

from server import app
from server.lib.model.models import PlayerEquipmentModel, SpellModel, WeaponModel, PlayerProficiencyModel, PlayerModel
from server.lib.service import player_service, playthrough_service
from server.lib.user_session import session_user
from server.views.api import api, json_api, require_login


def check_player(player: PlayerModel):
    user = session_user()

    if player is None:
        raise NotFound("This player does not exist.")
    if player.user is not user and not playthrough_service.is_user_dm(user, player):
        raise Unauthorized("This player is not yours.")


@api.route('/player', methods=["POST"])
@json_api()
@require_login()
def create_player():
    """
        Creates a player character

        Optional POST parameters:
         - name: The name of your PC
         - race: The race of your PC
         - class: The class of your PC
         - backstory: The backstory for your PC
        :return: A json object containing the newly created player's id.
    """

    user = session_user()
    data = request.get_json()

    name = data.get("name", "New PC")
    race = data.get("race", "")
    class_name = data.get("class", "")
    backstory = data.get("backstory", "")

    # TODO: Check if the player's chosen race or class actually exist and is visible to the user.

    player = player_service.create_player(user, name, race=race, class_name=class_name, backstory=backstory)

    return {
        "success": True,
        "player_id": player.id
    }


@api.route('/player/<int:player_id>', methods=["PUT"])
@json_api()
@require_login()
def update_player(player_id):
    """
        Updates a specified player character

        Required URL parameter:
         - player_id: The player id for which to update their information.

        Optional POST parameters:
         - name: The new name of your PC
         - race: The new race of your PC
         - class: The new class of your PC
         - backstory: The new backstory for your PC
        :return: A json object containing the updated player's id.
    """

    data = request.get_json()

    player = player_service.find_player(player_id)
    check_player(player)

    name = data.get("name", None)
    race = data.get("race", None)
    class_name = data.get("class", None)
    backstory = data.get("backstory", None)

    player_service.update_player(player, name=name, race=race, class_name=class_name, backstory=backstory)

    return {
        "success": True,
        "player_id": player.id
    }


@api.route('/player/<int:player_id>', methods=["DELETE"])
@json_api()
@require_login()
def delete_player(player_id):
    """
        Deletes a player with the given player_id in the URL.

        :param player_id: The id of the player that will be deleted.
        :return:
    """
    player = player_service.find_player(player_id)
    check_player(player)

    player_service.delete_player(player)

    return {
        "success": True,
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

    player_service.update_player_playthrough(player, playthrough.id)

    return {
        "success": True
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
        "speed": player_info.speed,
        "level": player_info.level,
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
                                           data.get("speed", None),
                                           data.get("level", None))

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
