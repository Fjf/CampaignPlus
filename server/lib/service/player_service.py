from typing import List, Optional

from server.lib.database import request_session
from server.lib.model.models import PlayerModel, UserModel, PlayerInfoModel
from server.lib.model.models import PlayerModel, UserModel, PlaythroughModel
from server.lib.repository import player_repository
from server.lib.service import playthrough_service


def get_players(playthrough: PlaythroughModel) -> List[PlayerModel]:
    if playthrough.name == "test--":
        return player_repository.get_all_players()
    return player_repository.get_players(playthrough.id)


def create_player(name: str, race: str, class_name: str, backstory: str, code: str, user: UserModel):
    playthrough = playthrough_service.find_playthrough_with_code(code)

    if not playthrough:
        return "This playthrough does not exist."

    player = PlayerModel.from_name_playthrough_user(name, playthrough, user)

    player.race_name = race
    player.backstory = backstory
    player.class_name = class_name

    player_repository.create_player(player)
    return ""


def find_player(pid: int) -> Optional[PlayerModel]:
    return player_repository.find_player(pid)


def delete_player(pid: int, user: UserModel) -> str:
    player = find_player(pid)
    if not player:
        return "Player not found."

    if player.user != user:
        return "This player does not belong to you."

    player_repository.delete_player(player)
    return ""


def update_player(pid: int, name: str, race: str, class_name: str, backstory: str, code: str, user: UserModel):
    player = find_player(pid)
    if not player:
        return "This player was not found."

    if player.user != user:
        return "This player does not belong to you."

    # TODO: Use the code??

    player.backstory = backstory
    player.name = name
    player.race_name = race
    player.class_name = class_name

    player_repository.create_player(player)
    return ""


def get_player(user: UserModel, playthrough_id: int) -> Optional[PlayerModel]:
    players = player_repository.get_players(playthrough_id)
    for player in players:
        if player.user == user:
            return player
    return None


def get_player_info(player: PlayerModel) -> Optional[PlayerInfoModel]:
    return player_repository.get_player_info(player)


def check_backstory(backstory: str) -> bool:
    return True


def set_player_info(user, player_id, strength, dexterity, constitution, intelligence, wisdom, charisma,
                    saving_throws_str, saving_throws_dex, saving_throws_con, saving_throws_int,
                    saving_throws_wis, saving_throws_cha, max_hp, armor_class, speed):
    player = find_player(player_id)
    if player is None:
        return "This player character does not exist."
    if player.user != user:
        return "This player character does not belong to you."

    player_info = get_player_info(player)
    if player_info is None:
        player_info = PlayerInfoModel.from_player(player)

    player_info.strength = strength if strength is not None else player_info.strength
    player_info.dexterity = dexterity if dexterity is not None else player_info.dexterity
    player_info.constitution = constitution if constitution is not None else player_info.constitution
    player_info.intelligence = intelligence if intelligence is not None else player_info.intelligence
    player_info.wisdom = wisdom if wisdom is not None else player_info.wisdom
    player_info.charisma = charisma if charisma is not None else player_info.charisma

    player_info.saving_throws_str = saving_throws_str if saving_throws_str is not None else player_info.saving_throws_str
    player_info.saving_throws_dex = saving_throws_dex if saving_throws_dex is not None else player_info.saving_throws_dex
    player_info.saving_throws_con = saving_throws_con if saving_throws_con is not None else player_info.saving_throws_con
    player_info.saving_throws_int = saving_throws_int if saving_throws_int is not None else player_info.saving_throws_int
    player_info.saving_throws_wis = saving_throws_wis if saving_throws_wis is not None else player_info.saving_throws_wis
    player_info.saving_throws_cha = saving_throws_cha if saving_throws_cha is not None else player_info.saving_throws_cha

    player_info.max_hp = max_hp if max_hp is not None else player_info.max_hp
    player_info.armor_class = armor_class if armor_class is not None else player_info.armor_class
    player_info.speed = speed if speed is not None else player_info.speed

    player_repository.create_player(player_info)

    return ""
