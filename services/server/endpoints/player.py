from flask import request
from werkzeug.exceptions import BadRequest, Unauthorized, NotFound

from endpoints import api, json_api, require_login
from lib.model.models import PlayerModel
from lib.service import player_service, campaign_service
from lib.user_session import session_user


def check_player_ownership(player: PlayerModel):
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
    player = player_service.get_player(player_id)
    check_player_ownership(player)

    player_service.delete_player(player)
    return player.to_json()


@api.route('/player/<int:player_id>', methods=["GET"])
@json_api()
@require_login()
def get_player(player_id):
    """
        Fetches a player with the given player_id in the URL.

        :param player_id: The id of the player that will be deleted.
        :return:
    """
    player = player_service.get_player(player_id)
    check_player_ownership(player)
    return player.to_json()


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
        :return: The updated player model
    """
    data = request.get_json()

    player = player_service.get_player(player_id)
    check_player_ownership(player)

    return player_service.update_player(player, data)


@api.route('/player/<int:player_id>/campaign', methods=["PUT"])
@json_api()
@require_login()
def set_player_campaign(player_id):
    player = player_service.get_player(player_id)
    check_player_ownership(player)

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


@api.route('/player/<int:player_id>/item', methods=["POST"])
@json_api()
@require_login()
def add_player_item(player_id):
    data = request.get_json()

    item_id = data.get("item_id")
    if item_id is None:
        raise BadRequest("No item_id specified.")

    user = session_user()
    player = player_service.get_player(player_id)
    check_player_ownership(player)

    player_item = player_service.add_equipment(user, player, item_id, data.get("amount", 1))

    return player_item.to_json()


@api.route('/player/<int:player_id>/item/<int:item_id>', methods=["PUT"])
@json_api()
@require_login()
def update_player_item(player_id, item_id):
    data = request.get_json()

    user = session_user()
    player = player_service.get_player(player_id)
    check_player_ownership(player)

    player_item = player_service.set_equipment(player, item_id, data.get("amount"), data.get("description"))

    return player_item


@api.route('/player/<int:player_id>/spells', methods=["POST"])
@json_api()
@require_login()
def add_player_spell(player_id):
    data = request.get_json()
    spell_id = data.get("spell_id", None)

    player = player_service.get_player(player_id)
    check_player_ownership(player)

    player_spell = player_service.player_add_spell(player, spell_id)
    return player_spell.spell.to_json()


@api.route('/player/<int:player_id>/items', methods=["GET"])
@json_api()
@require_login()
def get_player_items(player_id):
    player = player_service.get_player(player_id)
    check_player_ownership(player)

    player_items = player_service.get_player_items(player)

    return [player_item.to_json() for player_item in player_items]


@api.route('/player/<int:player_id>/spells/<int:spell_id>', methods=["DELETE"])
@json_api()
@require_login()
def delete_player_spell(player_id, spell_id):
    user = session_user()

    player = player_service.get_player(player_id)
    check_player_ownership(player)

    player_spells = player_service.delete_player_spell(user, player, spell_id)
    return [player_spell.spell.to_json() for player_spell in player_spells]


@api.route('/player/<int:player_id>/item/<int:item_id>', methods=["DELETE"])
@json_api()
@require_login()
def delete_player_item(player_id, item_id):
    user = session_user()

    player = player_service.get_player(player_id)
    check_player_ownership(player)

    error = player_service.delete_player_item(user, player, item_id)

    return {
        "success": True,
        "error": error
    }


@api.route('/player/<int:player_id>/spells', methods=["GET"])
@json_api()
@require_login()
def get_player_spells(player_id):
    player = player_service.get_player(player_id)
    check_player_ownership(player)

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
    player = player_service.get_player(player_id)
    check_player_ownership(player)
    return player.info.get("proficiencies")


@api.route('/player/<int:player_id>/proficiencies', methods=["PUT"])
@json_api()
@require_login()
def set_player_proficiencies(player_id: int):
    data = request.get_json()
    player = player_service.get_player(player_id)
    check_player_ownership(player)

    # Ensure it's wrapped correctly
    proficiencies = {
        "proficiencies": data
    }
    # TODO: Fix
    player_service.update_player(player, data)
    return player.info.get("proficiencies")


@api.route('/player/<int:player_id>/classes', methods=["GET"])
@json_api()
@require_login()
def get_player_class(player_id):
    player = player_service.get_player(player_id)
    check_player_ownership(player)

    class_models = player_service.get_classes(player)

    return [cls.to_json() for cls in class_models]


print("Loaded player endpoints")
