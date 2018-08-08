from typing import List, Optional

from server.lib.model.models import EnemyModel, EnemyAbilityModel, UserModel
from server.lib.repository import enemy_repository


def get_enemies():
    return enemy_repository.get_enemies()


def create_enemy(name, max_hp, ac, stre, dex, con, inte, wis, cha, user):
    enemy = EnemyModel.from_name_hp_ac(name, max_hp, ac, user.id)

    enemy.strength = stre
    enemy.dexterity = dex
    enemy.constitution = con
    enemy.intelligence = inte
    enemy.wisdom = wis
    enemy.charisma = cha

    enemy_repository.create_enemy(enemy)


def get_enemy(enemy_id: int):
    return enemy_repository.get_enemy(enemy_id)


def add_ability(enemy_id: int, text: str, user: UserModel):
    enemy = get_enemy(enemy_id)

    print(enemy_id)

    if enemy is None:
        return "This enemy does not exist."

    if enemy.user != user:
        return "This enemy does not belong to this user."

    ability = EnemyAbilityModel.from_id_text(enemy.id, text)
    enemy_repository.add_ability(ability)
    return ""


def get_abilities(eid: int, user: UserModel) -> List[EnemyAbilityModel]:
    enemy = get_enemy(eid)

    if enemy.user != user:
        return []

    return enemy_repository.get_enemy_abilities(enemy)


def delete_ability(ability_id: int, enemy_id: int, user: UserModel):
    enemy = get_enemy(enemy_id)
    if not enemy:
        return "This enemy does not exist"

    if enemy.user != user:
        return "This enemy does not belong to this user"

    ability = enemy_repository.get_ability(ability_id)

    # This should never happen when the front end works correctly.
    if ability.enemy != enemy:
        return "This ability does not belong to this enemy"

    enemy_repository.delete_ability(ability)
    return ""