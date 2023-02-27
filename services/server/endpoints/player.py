from flask import request
from werkzeug.exceptions import BadRequest, Unauthorized, NotFound

from lib.model.models import PlayerEquipmentModel, SpellModel, PlayerProficiencyModel, PlayerModel
from lib.service import player_service, campaign_service
from lib.user_session import session_user, session_user_set
from endpoints import api, json_api, require_login


def check_player(player: PlayerModel):
    """
    Checks whether or not a player exists, and whether or not it belongs to the logged in user.

    :param player:
    :return:
    """
    user = session_user()

    if player is None:
        raise NotFound("This player does not exist.")
    if player.user is not user and not campaign_service.is_user_dm(user, player):
        raise Unauthorized("This player is not yours.")


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


@api.route('/player/<int:player_id>/campaign', methods=["PUT"])
@json_api()
@require_login()
def set_player_campaign(player_id):
    player = player_service.find_player(player_id)
    check_player(player)

    data = request.get_json()

    required_fields = ["campaign_code"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    campaign = campaign_service.find_campaign_with_code(data.get("campaign_code"))
    if campaign is None:
        raise NotFound("This campaign does not exist.")

    player_service.update_player_campaign(player, campaign.id)

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
    player_proficiencies = player_service.get_player_proficiencies(player)

    data = player.to_json()
    data["info"] = player_info.to_json()
    data["proficiencies"] = player_proficiencies.to_json()

    return data


@api.route('/player/<int:player_id>', methods=["PUT"])
@json_api()
@require_login()
def set_player_info(player_id):
    """
        Updates a specified player character

        Required URL parameter:
         - player_id: The player id for which to update their information.

        Optional POST parameters:
         - name: The new name of your PC
         - race: The new race of your PC
         - class_ids: The new class ids for your PC
         - backstory: The new backstory for your PC
         - info: Json containing player info
         - proficiencies: Json containing player proficiencies
        :return: A json object containing the updated player's id.
    """
    data = request.get_json()

    player = player_service.find_player(player_id)
    check_player(player)

    # Update main player information
    player_service.update_player(player, data.get("name"), data.get("race"), data.get("class_ids"),
                                 data.get("backstory"), data.get("money"))

    info = data.get("info")
    if info is not None:
        player_service.set_player_info(player, info.get("strength"), info.get("dexterity"), info.get("constitution"),
                                       info.get("intelligence"), info.get("wisdom"), info.get("charisma"),
                                       info.get("saving_throws_str"), info.get("saving_throws_dex"),
                                       info.get("saving_throws_con"), info.get("saving_throws_int"),
                                       info.get("saving_throws_wis"), info.get("saving_throws_cha"), info.get("max_hp"),
                                       info.get("armor_class"), info.get("speed"), info.get("level"))

    profs = data.get("proficiencies")
    if profs is not None:
        player_service.update_proficiencies(player, profs)

    # TODO: Maybe return something more useful here.
    return {
        "success": True,
        "updated_info": info is not None,
        "updated_proficiencies": profs is not None
    }


@api.route('/player/<int:player_id>/item', methods=["POST"])
@json_api()
@require_login()
def add_player_item(player_id):
    data = request.get_json()

    item_id = data.get("item_id")
    if item_id is None:
        raise BadRequest("No item_id specified.")

    player = player_service.find_player(player_id)
    check_player(player)

    player_item = player_service.player_set_item(player, item_id, data.get("amount", 1))

    return player_item.to_json()


@api.route('/player/<int:player_id>/item/<int:item_id>', methods=["PUT"])
@json_api()
@require_login()
def update_player_item(player_id, item_id):
    data = request.get_json()

    player = player_service.find_player(player_id)
    check_player(player)

    player_item = player_service.player_set_item(player, item_id, data.get("amount"), data.get("extra_info"))

    return player_item.to_json()


@api.route('/player/<int:player_id>/spells', methods=["POST"])
@json_api()
@require_login()
def add_player_spell(player_id):
    data = request.get_json()
    spell_id = data.get("spell_id", None)

    player = player_service.find_player(player_id)
    check_player(player)

    player_spell = player_service.player_add_spell(player, spell_id)
    return player_spell.spell.to_json()


@api.route('/player/<int:player_id>/items', methods=["GET"])
@json_api()
@require_login()
def get_player_items(player_id):
    player = player_service.find_player(player_id)
    check_player(player)

    player_items = player_service.get_player_items(player)

    return [player_item.to_json() for player_item in player_items]


@api.route('/player/<int:player_id>/spells/<int:spell_id>', methods=["DELETE"])
@json_api()
@require_login()
def delete_player_spell(player_id, spell_id):
    user = session_user()

    player = player_service.find_player(player_id)
    check_player(player)

    player_spells = player_service.delete_player_spell(user, player, spell_id)
    return [player_spell.spell.to_json() for player_spell in player_spells]


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


@api.route('/player/<int:player_id>/spells', methods=["GET"])
@json_api()
@require_login()
def get_player_spells(player_id):
    player = player_service.find_player(player_id)
    check_player(player)

    player_spells = player_service.get_player_spells(player)

    return [player_spell.spell.to_json() for player_spell in player_spells]


@api.route('/user/spells', methods=["GET"])
@json_api()
@require_login()
def get_available_spells():
    spells_list = player_service.get_spells()
    return [spell.to_json() for spell in spells_list]


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

    player_service.update_proficiencies(player, data)

    return {
        "success": True
    }


@api.route('/player/<int:player_id>/classes', methods=["GET"])
@json_api()
@require_login()
def get_player_class(player_id):
    player = player_service.find_player(player_id)
    check_player(player)

    class_models = player_service.get_classes(player)
    classes = []
    for class_model in class_models:
        abilities = player_service.get_class_abilities(class_model)
        classes.append({
            "id": class_model.id,
            "name": class_model.name,
            "info": class_model.info,
            "table": class_model.table,
            "abilities": [ability.to_json() for ability in abilities]
        })
    return {
        "success": True,
        "classes": classes
    }


print("Loaded player endpoints")
