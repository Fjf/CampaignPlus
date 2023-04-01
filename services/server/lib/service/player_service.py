import copy
import re
from typing import List, Optional, Tuple

from werkzeug.exceptions import BadRequest, Unauthorized

from lib.database import request_session
from lib.model.class_models import ClassModel, SubClassModel
from lib.model.models import PlayerEquipmentModel, SpellModel, PlayerSpellModel, \
    PlayerModel, UserModel, CampaignModel
from lib.repository import player_repository, repository
from lib.service import item_service


def get_players(campaign: CampaignModel) -> List[PlayerModel]:
    if campaign.name == "test--":
        return player_repository.get_all_players()
    players = player_repository.get_players(campaign.id)
    for player in players:
        player.backstory = striphtml(player.backstory)
    return players


def striphtml(data):
    p = re.compile(r'<.*?>')
    return p.sub('', data)


def add_classes_to_player(player, class_ids):
    player.info["class_ids"] = list(set(player.info["class_ids"] + class_ids))


def create_player(user: UserModel, name: str, race: str = "", campaign: CampaignModel = None):
    player = PlayerModel(name, campaign, user)
    player.race_name = race

    db = request_session()
    db.add(player)
    db.commit()
    return player


def get_player(pid: int) -> Optional[PlayerModel]:
    db = request_session()
    model = db.query(PlayerModel) \
        .filter(PlayerModel.id == pid) \
        .one_or_none()

    # This is to catch old models which had no info yet
    if model.info is None:
        model.info = PlayerModel.get_default_info()
        db.commit()

    return model


def delete_player(player: PlayerModel):
    player_repository.delete_player(player)


def update_player(player: PlayerModel, data: dict):
    """
    Updates the given PlayerModel to contain the new given data.
    :return:
    """
    db = request_session()

    name, race, backstory, money, info = (
        data.get("name"), data.get("race"), data.get("backstory"), data.get("money"), data.get("info"))

    player.backstory = backstory or player.backstory
    player.name = name or player.name
    player.race_name = race or player.race_name

    # Update currency
    if money is not None:
        player.copper = money["copper"]
        player.silver = money["silver"]
        player.gold = money["gold"]
        player.electron = money["electron"]
        player.platinum = money["platinum"]

    if info is not None:
        if len(set(info.keys()) - set(player.info.keys())) > 0:
            return {"error:": "Invalid JSON format passed."}, 403

        print(info)
        # Create deepcopy so that sqlalchemy commits the changes
        stats = copy.deepcopy(player.info)

        # Iterate fields in the info and update them in the destination data fields
        for key in info.keys():
            if type(stats.get(key)) == dict:
                stats.get(key).update(info.get(key))
            else:
                stats[key] = info.get(key)

        player.info = stats

    db.commit()

    return player.to_json()


def get_user_players(user: UserModel) -> List[PlayerModel]:
    return player_repository.get_user_players(user)


def get_user_players_by_id(user: UserModel, campaign_id: int) -> List[PlayerModel]:
    players = player_repository.get_players(campaign_id)
    user_players = []
    for player in players:
        if player.user == user:
            user_players.append(player)
    return user_players


def get_player_items(player: PlayerModel) -> List[PlayerEquipmentModel]:
    db = request_session()

    return db.query(PlayerEquipmentModel) \
        .filter(PlayerEquipmentModel.player_id == player.id) \
        .all()


def check_backstory(backstory: str) -> bool:
    return True


def add_equipment(user, player, item_id, amount: int, extra_info: str = None):
    item = item_service.get_item(user, item_id)

    if item is None:
        raise BadRequest("This item does not exist.")

    try:
        amount = int(amount)
    except ValueError:
        amount = 1

    db = request_session()

    player_item = player_repository.get_player_item(item, player)
    if player_item is None:
        player_item = PlayerEquipmentModel(player, item)
        db.add(player_item)

    player_item.amount = amount
    player_item.extra_info = extra_info

    if player_item.amount == 0:
        db.delete(player_item)

    db.commit()
    return player_item


def set_equipment(player, equipment_id, amount, description=None):
    db = request_session()

    equipment: PlayerEquipmentModel = (
        db.query(PlayerEquipmentModel)
        .filter(PlayerEquipmentModel.id == equipment_id and PlayerEquipmentModel.player_id == player.id)
        .one_or_none())

    equipment.amount = amount
    if description is not None:
        equipment.description = description

    if equipment.amount == 0:
        db.delete(equipment)
        db.commit()
        return {}
    else:
        db.commit()
        return equipment.to_json()


def get_player_spells(player: PlayerModel) -> List[PlayerSpellModel]:
    db = request_session()

    return db.query(PlayerSpellModel) \
        .filter(PlayerSpellModel.player_id == player.id) \
        .all()


def get_spells(campaign=None):
    db = request_session()

    campaign_id = campaign.id if campaign is not None else -1

    return db.query(SpellModel) \
        .filter(campaign_id == SpellModel.campaign_id or SpellModel.campaign_id == -1) \
        .all()


def get_spell(player: PlayerModel, spell_id: int):
    return player_repository.get_spell(player, spell_id)


def get_item(player: PlayerModel, item_id: int):
    return player_repository.player_get_item(player, item_id)


def player_add_spell(player: PlayerModel, spell_id: int):
    spell = get_spell(player, spell_id)
    if spell is None:
        raise BadRequest("This spell does not exist.")

    player_spell = PlayerSpellModel.from_player_spell(player, spell)
    repository.add_and_commit(player_spell)

    return player_spell


def delete_player_spell(user: UserModel, player: PlayerModel, spell_id: int):
    """
    Deletes the spell from a player, then returns the updated list of spells.

    :param user:
    :param player:
    :param spell_id:
    :return:
    """
    if player.user is not user:
        raise Unauthorized("This player does not belong to you.")

    spell = get_spell(player, spell_id)
    if spell is None:
        raise BadRequest("This spell does not exist.")

    player_repository.delete_spell(player, spell)

    return get_player_spells(player)


def delete_player_item(user, player, item_id):
    if player.user is not user:
        return "This player does not belong to you."

    player_repository.delete_equipment(player, item_id)

    return ""


def update_player_campaign(player: PlayerModel, campaign_id: int):
    session = request_session()
    player.campaign_id = campaign_id
    session.commit()



def get_classes(player: PlayerModel) -> List[ClassModel]:
    """
    Returns all main classes which are linked to a player.

    :param player: The player for which to show what classes linked.
    :return: A list of classes which the player has linked.
    """
    db = request_session()

    return (db.query(ClassModel)
            .filter(ClassModel.id.in_(player.info["class_ids"]))
            .all())


def get_visible_classes(user: UserModel) -> List[ClassModel]:
    """
        Returns all classes which can be seen by a user.
        A class is visible when it is the owner of a class, or if the class has no owner (default class)

        :param user: The user for which to get the visible classes.
        :return: A list of classes which the user can see.
        """
    db = request_session()

    # Make sure it does not crash for not logged in users.
    user_id = user.id if user is not None else -1

    return (db.query(ClassModel)
            .filter(ClassModel.owner_id == user_id or ClassModel.owner_id.is_(None))
            .all())


def get_visible_subclasses(user: UserModel) -> List[ClassModel]:
    """
        Returns all classes which can be seen by a user.
        A class is visible when it is the owner of a class, or if the class has no owner (default class)

        :param user: The user for which to get the visible classes.
        :return: A list of classes which the user can see.
        """
    db = request_session()

    # Make sure it does not crash for not logged in users.
    user_id = user.id if user is not None else -1

    return (db.query(SubClassModel)
            .filter(SubClassModel.owner_id == user_id or SubClassModel.owner_id.is_(None))
            .all())
