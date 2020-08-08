import re
from typing import List, Optional, Tuple

from werkzeug.exceptions import BadRequest, Unauthorized

from lib.database import request_session
from lib.model.class_models import ClassModel, ClassAbilityModel, SubClassModel, PlayerClassModel
from lib.model.models import PlayerInfoModel, PlayerEquipmentModel, SpellModel, PlayerSpellModel, WeaponModel, \
    PlayerProficiencyModel, PlayerModel, UserModel, CampaignModel
from lib.repository import player_repository, repository
from lib.service import item_service


def get_players(playthrough: CampaignModel) -> List[PlayerModel]:
    if playthrough.name == "test--":
        return player_repository.get_all_players()
    players = player_repository.get_players(playthrough.id)
    for player in players:
        player.backstory = striphtml(player.backstory)
    return players


def striphtml(data):
    p = re.compile(r'<.*?>')
    return p.sub('', data)


def add_classes_to_player(player, class_ids):
    # Add classes to player
    for class_id in class_ids:
        playable_class = player_repository.get_class_by_id(class_id)
        if playable_class is None:
            raise BadRequest("Undefined player class id '%d'" % class_id)

        pcm = PlayerClassModel.from_player_class(player, playable_class)
        player_repository.add_and_commit(pcm)


def create_player(user: UserModel, name: str, race: str = "", class_ids=None, backstory: str = "",
                  playthrough: CampaignModel = None):
    if class_ids is None:
        class_ids = []

    player = PlayerModel.from_name_playthrough_user(name, playthrough, user)

    player.race_name = race
    player.backstory = backstory
    player.class_name = "dummy"
    player_repository.add_and_commit(player)

    error = add_classes_to_player(player, class_ids)

    return player


def find_player(pid: int) -> Optional[PlayerModel]:
    return player_repository.find_player(pid)


def delete_player(player: PlayerModel):
    player_repository.delete_player(player)


def update_player(player: PlayerModel, name: str = None, race: str = None, class_ids=None,
                  backstory: str = None):
    """
    Updates the given PlayerModel to contain the new given data.

    :param player: The PlayerModel to update.
    :param [Optional] name: The new name for the player.
    :param [Optional] race: The new race for the player.
    :param [Optional] class_ids: List of class ids the player uses.
    :param [Optional] backstory: The new backstory for the player.
    :return:
    """
    if class_ids is None:
        class_ids = []

    player.backstory = backstory or player.backstory
    player.name = name or player.name
    player.race_name = race or player.race_name

    player_repository.add_and_commit(player)

    # Add new player classes to db
    player_repository.remove_classes_from_player(player)
    add_classes_to_player(player, class_ids)


def get_player(user: UserModel):
    pass


def get_user_players(user: UserModel) -> List[PlayerModel]:
    return player_repository.get_user_players(user)


def get_user_players_by_id(user: UserModel, playthrough_id: int) -> List[PlayerModel]:
    players = player_repository.get_players(playthrough_id)
    user_players = []
    for player in players:
        if player.user == user:
            user_players.append(player)
    return user_players


def get_player_info(player: PlayerModel) -> PlayerInfoModel:
    result = player_repository.get_player_info(player)
    if result is None:
        player_info = PlayerInfoModel.from_player(player)

        player_info.strength = 1
        player_info.dexterity = 1
        player_info.constitution = 1
        player_info.intelligence = 1
        player_info.wisdom = 1
        player_info.charisma = 1

        player_info.saving_throws_str = False
        player_info.saving_throws_dex = False
        player_info.saving_throws_con = False
        player_info.saving_throws_int = False
        player_info.saving_throws_wis = False
        player_info.saving_throws_cha = False

        player_info.max_hp = 10
        player_info.armor_class = 10
        player_info.speed = 60
        player_info.level = 1

        player_repository.add_and_commit(player_info)

        result = player_repository.get_player_info(player)

    return result


def get_player_items(player: PlayerModel) -> List[PlayerEquipmentModel]:
    db = request_session()

    return db.query(PlayerEquipmentModel) \
        .filter(PlayerEquipmentModel.player_id == player.id) \
        .all()

def check_backstory(backstory: str) -> bool:
    return True


def set_player_info(player, strength, dexterity, constitution, intelligence, wisdom, charisma,
                    saving_throws_str, saving_throws_dex, saving_throws_con, saving_throws_int,
                    saving_throws_wis, saving_throws_cha, max_hp, armor_class, speed, level):
    player_info = get_player_info(player)

    player_info.strength = strength or player_info.strength
    player_info.dexterity = dexterity or player_info.dexterity
    player_info.constitution = constitution or player_info.constitution
    player_info.intelligence = intelligence or player_info.intelligence
    player_info.wisdom = wisdom or player_info.wisdom
    player_info.charisma = charisma or player_info.charisma

    player_info.strength = min(player_info.strength, 30)
    player_info.dexterity = min(player_info.dexterity, 30)
    player_info.constitution = min(player_info.constitution, 30)
    player_info.intelligence = min(player_info.intelligence, 30)
    player_info.wisdom = min(player_info.wisdom, 30)
    player_info.charisma = min(player_info.charisma, 30)

    player_info.saving_throws_str = saving_throws_str or player_info.saving_throws_str
    player_info.saving_throws_dex = saving_throws_dex or player_info.saving_throws_dex
    player_info.saving_throws_con = saving_throws_con or player_info.saving_throws_con
    player_info.saving_throws_int = saving_throws_int or player_info.saving_throws_int
    player_info.saving_throws_wis = saving_throws_wis or player_info.saving_throws_wis
    player_info.saving_throws_cha = saving_throws_cha or player_info.saving_throws_cha

    player_info.max_hp = max_hp or player_info.max_hp
    player_info.armor_class = armor_class or player_info.armor_class
    player_info.speed = speed or player_info.speed
    player_info.level = level or player_info.level
    # Fix value within range 1..20
    player_info.level = max(min(player_info.level, 20), 1)

    player_repository.add_and_commit(player_info)


def player_add_item(player, item_id, amount: int):
    item = item_service.get_item(item_id)

    if item is None:
        raise BadRequest("This item does not exist.")

    try:
        amount = int(amount)
    except ValueError:
        amount = 1

    db = request_session()

    player_item = player_repository.get_player_item(item, player)
    if player_item is None:
        player_item = PlayerEquipmentModel.from_player(player, item)
        db.add(player_item)

    player_item.amount += amount

    db.commit()
    return player_item


def get_player_spells(player: PlayerModel) -> List[PlayerSpellModel]:
    db = request_session()

    return db.query(PlayerSpellModel) \
        .filter(PlayerSpellModel.player_id == player.id) \
        .all()


def get_spells(playthrough=None):
    db = request_session()

    campaign_id = playthrough.id if playthrough is not None else -1

    return db.query(SpellModel) \
        .filter(campaign_id == SpellModel.playthrough_id or SpellModel.playthrough_id == -1) \
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

    item = get_item(player, item_id)
    if item is None:
        return "This item does not exist."

    player_repository.delete_item(player, item)

    return ""


def update_player_playthrough(player: PlayerModel, playthrough_id: int):
    player.playthrough_id = playthrough_id
    repository.add_and_commit(player)


def get_player_proficiencies(player: PlayerModel) -> PlayerProficiencyModel:
    proficiencies = player_repository.get_player_proficiencies(player)

    if proficiencies is None:
        proficiencies = PlayerProficiencyModel.from_player(player)
        repository.add_and_commit(proficiencies)

    return proficiencies


def update_proficiencies(player, data) -> None:
    """
    Updates the player proficiencies given an input json object. This json object needs to have the correct naming
     schemes for all proficiencies.

    :param player: The player object for which to update the stored information.
    :param data: The data which will be used to overwrite player information.
    :return:
    """
    pp: PlayerProficiencyModel = get_player_proficiencies(player)

    pp.acrobatics = data.get("acrobatics", pp.acrobatics)
    pp.animal_handling = data.get("animal_handling", pp.animal_handling)
    pp.arcana = data.get("arcana", pp.arcana)
    pp.athletics = data.get("athletics", pp.athletics)
    pp.deception = data.get("deception", pp.deception)
    pp.history = data.get("history", pp.history)
    pp.insight = data.get("insight", pp.insight)
    pp.intimidation = data.get("intimidation", pp.intimidation)
    pp.investigation = data.get("investigation", pp.investigation)
    pp.medicine = data.get("medicine", pp.medicine)
    pp.nature = data.get("nature", pp.nature)
    pp.perception = data.get("perception", pp.perception)
    pp.performance = data.get("performance", pp.performance)
    pp.persuasion = data.get("persuasion", pp.persuasion)
    pp.religion = data.get("religion", pp.religion)
    pp.sleight_of_hand = data.get("sleight_of_hand", pp.sleight_of_hand)
    pp.stealth = data.get("stealth", pp.stealth)
    pp.survival = data.get("survival", pp.survival)

    repository.add_and_commit(pp)


def get_classes(player: PlayerModel) -> List[ClassModel]:
    return player_repository.get_classes(player)


def get_class_abilities(class_model: ClassModel) -> List[ClassAbilityModel]:
    return player_repository.get_class_abilities(class_model=class_model)


def get_subclass_abilities(sub_class_model: SubClassModel) -> List[ClassAbilityModel]:
    return player_repository.get_class_abilities(subclass_model=sub_class_model)


def get_visible_classes(user: UserModel) -> List[ClassModel]:
    return player_repository.get_visible_classes(user)
