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


@api.route('/createplaythrough', methods=["POST"])
@json_api()
@require_login()
def create_playthrough():
    data = request.get_json()

    if not data or "name" not in data:
        raise BadRequest()

    user = session_user()

    return campaign_service.create_playthrough(data['name'], datetime.now(), user)


@api.route('/campaigns', methods=["GET"])
@require_login()
@json_api()
def get_playthrough():
    user = session_user()

    campaigns = campaign_service.get_campaigns(user)
    p_campaigns = campaign_service.get_joined_campaigns(user)

    data = []
    for campaign in campaigns + p_campaigns:
        code_model = campaign_repository.get_campaign_code(campaign.id)

        data.append({
            "is_owner": campaign.user_id == user.id,
            "owner": campaign.user.name,
            "id": campaign.id,
            "code": code_model.code,
            "url": code_model.to_url(),
            "qr_image": code_model.qr_code(),
            "name": campaign.name,
            "time": time.mktime(campaign.date.timetuple()) * 1000  # Python does time in seconds.
        })

    return data


@api.route('/campaigns/join/<campaign_code>', methods=["POST"])
@require_login()
def join_playthrough(campaign_code):
    user = session_user()

    playthrough = campaign_service.find_playthrough_with_code(campaign_code.upper())
    if playthrough is None:
        raise NotFound("This campaign code is not linked to any existing campaign.")

    error = campaign_service.join_playthrough(user, playthrough)
    success = error == ""
    return {
        "success": success,
        "error": error
    }


@api.route('/campaigns/<int:playthrough_id>/players', methods=["POST"])
@json_api()
@require_login()
def create_player_playthrough(playthrough_id):
    data = request.get_json()
    required_fields = ["name", "class", "backstory", "race"]

    if not data or (False in [x in data for x in required_fields]):
        raise BadRequest()

    user = session_user()
    playthrough = campaign_service.get_campaign(playthrough_id)
    if playthrough is None:
        raise NotFound("This campaign does not exist.")

    player, error = player_service.create_player(user, data["name"], data["race"], data["class_ids"], data["backstory"],
                                                 playthrough)

    return {
        "success": True,
        "player_id": player.id,
        "error": error
    }


@api.route('/campaigns/<int:playthrough_id>/players', methods=["GET"])
@json_api()
@require_login()
def get_players(playthrough_id):
    user = session_user()
    campaign = campaign_service.get_campaign(playthrough_id)

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

        data.append({
            "id": player.id,
            "user_name": player.user.name,
            "name": player.name,
            "race": player.race_name,
            "backstory": backstory,
            "class": player.class_name
        })

    return data


@api.route('/campaigns/<int:playthrough_id>/players/<int:player_id>', methods=["DELETE"])
@json_api()
@require_login()
def delete_player_playthrough(playthrough_id: int, player_id: int):
    user = session_user()
    playthrough = campaign_service.get_campaign(playthrough_id)
    if playthrough is None:
        raise NotFound("This campaign does not exist.")

    player = player_service.find_player(player_id)
    check_player(player)

    if player.playthrough is not playthrough:
        raise BadRequest("This player is not in this campaign")

    player_service.update_player_playthrough(player, -1)

    return {
        "success": True,
        "player_id": player.id
    }


@api.route('/campaigns/<int:playthrough_id>/spells', methods=["GET"])
@json_api()
@require_login()
def get_spells(playthrough_id):
    playthrough = campaign_service.get_campaign(playthrough_id)

    if playthrough is None:
        raise NotFound("This campaign does not exist.")

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
