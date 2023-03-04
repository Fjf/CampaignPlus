import time
from datetime import datetime

from flask import request
from werkzeug.exceptions import BadRequest, NotFound, Unauthorized

from lib.model.models import PlayerModel
from lib.repository import campaign_repository
from lib.user_session import session_user, session_user_set
from endpoints import api, json_api, require_login
from lib.service import player_service, campaign_service


def check_player(player: PlayerModel):
    user = session_user()

    if player is None:
        raise NotFound("This player does not exist.")
    if player.user is not user and not campaign_service.is_user_dm(user, player):
        raise Unauthorized("This player is not yours.")


@api.route('/campaigns', methods=["PUT"])
@json_api()
@require_login()
def create_campaign():
    user = session_user()
    return campaign_service.create_campaign(user).to_json(user)


@api.route('/campaigns/<int:campaign_id>', methods=["POST"])
@json_api()
@require_login()
def update_campaign(campaign_id):
    user = session_user()
    data = request.get_json()

    name = data.get("name")

    return campaign_service.update_campaign(user, campaign_id, name).to_json(user)


@api.route('/campaigns/<int:campaign_id>', methods=["DELETE"])
@require_login()
def delete_campaign(campaign_id):
    user = session_user()
    campaign_service.delete_campaign(user, campaign_id)
    return get_campaigns()


@api.route('/campaigns', methods=["GET"])
@require_login()
@json_api()
def get_campaigns():
    user = session_user()

    m_campaigns = campaign_service.get_campaigns(user)
    p_campaigns = campaign_service.get_joined_campaigns(user)

    campaigns = []
    for campaign in m_campaigns + p_campaigns:
        if campaign not in campaigns:
            campaigns.append(campaign)

    return [campaign.to_json(user) for campaign in campaigns]


@api.route('/campaigns/join/<campaign_code>', methods=["POST"])
@require_login()
def join_campaign(campaign_code):
    user = session_user()

    campaign = campaign_service.find_campaign_with_code(campaign_code.upper())
    if campaign is None:
        raise NotFound("This campaign code is not linked to any existing campaign.")

    error = campaign_service.join_campaign(user, campaign)
    success = error == ""
    return {
        "success": success,
        "error": error
    }


@api.route('/campaigns/<int:campaign_id>/players', methods=["POST"])
@json_api()
@require_login()
def create_player_campaign(campaign_id):
    data = request.get_json()
    required_fields = ["name", "class", "backstory", "race"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    user = session_user()
    campaign = campaign_service.get_campaign(campaign_id)
    if campaign is None:
        raise NotFound("This campaign does not exist.")

    player, error = player_service.create_player(user, data["name"], data["race"], data["class_ids"], data["backstory"],
                                                 campaign)

    return {
        "success": True,
        "player_id": player.id,
        "error": error
    }


@api.route('/campaigns/<int:campaign_id>/players', methods=["GET"])
@json_api()
@require_login()
def get_players(campaign_id):
    user = session_user()
    campaign = campaign_service.get_campaign(campaign_id)

    if not campaign_service.user_in_campaign(user, campaign) and campaign.user != user:
        raise Unauthorized("You do not have any players in this campaign.")

    if campaign is None:
        raise NotFound("This campaign does not exist.")

    players = player_service.get_players(campaign)
    data = []
    for player in players:
        # Make sure you can only see your own backstory, or if you are the dm.
        if player.user_id == user.id or campaign.user_id == user.id:
            backstory = player.backstory
        else:
            backstory = ""

        player_classes = player_service.get_classes(player)

        data.append({
            "id": player.id,
            "user_name": player.user.name,
            "name": player.name,
            "race": player.race_name,
            "backstory": backstory,
            "class": player_classes[0].name if len(player_classes) > 0 else "Classless"
        })

    return data


@api.route('/campaigns/<int:campaign_id>/players/<int:player_id>', methods=["DELETE"])
@json_api()
@require_login()
def delete_player_campaign(campaign_id: int, player_id: int):
    user = session_user()
    campaign = campaign_service.get_campaign(campaign_id)
    if campaign is None:
        raise NotFound("This campaign does not exist.")

    player = player_service.get_player(player_id)
    check_player(player)

    if player.campaign is not campaign:
        raise BadRequest("This player is not in this campaign")

    player_service.update_player_campaign(player, -1)

    return {
        "success": True,
        "player_id": player.id
    }


@api.route('/campaigns/<int:campaign_id>/spells', methods=["GET"])
@json_api()
@require_login()
def get_spells(campaign_id):
    campaign = campaign_service.get_campaign(campaign_id)

    if campaign is None:
        raise NotFound("This campaign does not exist.")

    spells = []
    spells_list = player_service.get_spells(campaign)

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
