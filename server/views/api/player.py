from flask import request
from werkzeug.exceptions import BadRequest

from server.lib.model.models import PlayerEquipmentModel, SpellModel, ItemModel, WeaponModel
from server.lib.service import player_service, playthrough_service, item_service
from server.lib.user_session import session_user

from server.views.api import api, json_api, require_login


@api.route('/createplayer', methods=["POST"])
@json_api()
@require_login()
def create_player():
    data = request.get_json()

    required_fields = ["name", "class_name", "code", "backstory", "race"]

    if not data or (False in [x in required_fields for x in data]):
        raise BadRequest()

    user = session_user()

    error = player_service.create_player(data["name"], data["race"], data["class_name"], data["backstory"],
                                         data["code"], user)

    success = error == ""
    return {
        "success": success,
        "error": error
    }


@api.route('/updateplayer', methods=["POST"])
@json_api()
@require_login()
def update_player():
    data = request.get_json()

    required_fields = ["pid", "name", "class_name", "code", "backstory", "race"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    user = session_user()

    error = player_service.update_player(data["pid"], data["name"], data["race"], data["class_name"], data["backstory"],
                                         user)

    success = error == ""
    return {
        "success": success,
        "error": error
    }


@api.route('/getplayers', methods=["POST"])
@json_api()
@require_login()
def get_players():
    data = request.get_json()

    if not data or ("playthrough_id" not in data and "playthrough_code" not in data):
        raise BadRequest()

    pid = data["playthrough_id"] if "playthrough_id" in data else None

    if pid is None:
        pt = playthrough_service.find_playthrough_with_code(data["playthrough_code"])
    else:
        pt = playthrough_service.find_playthrough_with_id(pid)

    if pt is None:
        raise BadRequest("Invalid code/id.")

    players = player_service.get_players(pt)
    data = []
    for player in players:
        data.append({
            "id": player.id,
            "user_name": player.user.name,
            "name": player.name,
            "class": player.class_name
        })

    return data


@api.route('/getuserplayers', methods=["GET"])
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
            "class": player.class_name
        })

    return {
        "success": True,
        "players": data
    }


@api.route('/setplayerplaythrough', methods=["POST"])
@json_api()
@require_login()
def set_player_playthrough():
    user = session_user()
    data = request.get_json()

    required_fields = ["player_id", "playthrough_code"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    error = player_service.update_player_playthrough(user, data.get("player_id"), data.get("playthrough_code"))

    success = error == ""
    return {
        "success": success,
        "error": error
    }


@api.route('/deleteplayer', methods=["POST"])
@json_api()
@require_login()
def delete_player():
    data = request.get_json()
    user = session_user()

    if not data or "id" not in data:
        raise BadRequest()

    error = player_service.delete_player(data["id"], user)

    success = error == ""

    return {
        "success": success,
        "error": error
    }


@api.route('/setplayerinfo', methods=["POST"])
@json_api()
@require_login()
def set_player_info():
    data = request.get_json()
    user = session_user()

    required_fields = ["player_id"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    error = player_service.set_player_info(user,
                                           data["player_id"],
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


@api.route('/addplayeritem', methods=["POST"])
@json_api()
@require_login()
def add_player_item():
    data = request.get_json()
    user = session_user()

    required_fields = ["player_id", "item_id"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    player = player_service.find_player(data["player_id"])

    success = player is not None

    error = player_service.player_add_item(
        user,
        player,
        data.get("item_id"),
        data.get("amount", 1)
    )

    return {
        "success": success,
        "error": error
    }


@api.route('/addplayerspell', methods=["POST"])
@json_api()
@require_login()
def add_player_spell():
    data = request.get_json()
    user = session_user()

    required_fields = ["player_id", "spell_id"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    player = player_service.find_player(data["player_id"])

    success = player is not None
    error = "Player is not found."

    if success:
        error = player_service.player_add_spell(
            user,
            player,
            data.get("spell_id")
        )

    success = error == ""
    return {
        "success": success,
        "error": error
    }


@api.route('/getplayeritems', methods=["POST"])
@json_api()
@require_login()
def get_player_items():
    data = request.get_json()

    required_fields = ["player_id"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    player = player_service.find_player(data["player_id"])

    success = player is not None

    items = []
    if success:
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
        "success": success,
        "items": items
    }


@api.route('/deleteplayerspell', methods=["POST"])
@json_api()
@require_login()
def delete_player_spell():
    data = request.get_json()
    user = session_user()

    required_fields = ["player_id", "spell_id"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    player = player_service.find_player(data["player_id"])

    success = player is not None

    if success:
        error = player_service.delete_player_spell(user, player, data.get("spell_id", -1))
    else:
        error = "This player does not exist."

    return {
        "success": success,
        "error": error
    }


@api.route('/getplayerspells', methods=["POST"])
@json_api()
@require_login()
def get_player_spells():
    data = request.get_json()
    user = session_user()

    required_fields = ["player_id"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    player = player_service.find_player(data["player_id"])

    success = player is not None

    spells = []
    if success:
        error, player_spells = player_service.get_player_spells(user, player)
        success = error == ""
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
        "success": success,
        "spells": spells
    }


@api.route('/getspells', methods=["POST"])
@json_api()
@require_login()
def get_spells():
    data = request.get_json()
    user = session_user()

    required_fields = ["player_id"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    player = player_service.find_player(data["player_id"])

    success = player is not None

    spells = []
    if success:
        error, spells_list = player_service.get_spells(user, player)
        success = error == ""
        for spell in spells_list:
            spells.append({
                "id": spell.id,
                "name": spell.name,
                "level": int(spell.level),
                "phb_page": int(spell.phb_page)
            })

    return {
        "success": success,
        "spells": spells
    }


@api.route('/getplayerdata', methods=["POST"])
@json_api()
@require_login()
def get_player():
    data = request.get_json()
    user = session_user()

    if not data or "player_id" not in data:
        raise BadRequest()

    player = player_service.find_player(data["player_id"])

    success = player is not None

    if success:
        player_info = player_service.get_player_info(user, player)
        if player_info is not None:
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
        else:
            info = None

    if not success:
        return {"success": success}
    else:
        return {
            "success": success,
            "name": player.name,
            "class": player.class_name,
            "race": player.race_name,
            "user_name": player.user.name,
            "backstory": player.backstory,
            "info": info
        }
