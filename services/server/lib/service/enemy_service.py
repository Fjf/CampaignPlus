from typing import List

from lib.database import request_session
from lib.model.models import EnemyModel, EnemyAbilityModel, UserModel
from lib.repository import enemy_repository, repository


def get_enemies(user: UserModel):
    return enemy_repository.get_enemies(user.id)


def create_enemy(name, max_hp, ac, stre, dex, con, inte, wis, cha, user):
    enemies = get_enemies(user)
    for enemy in enemies:
        if enemy.name == name:
            return "You have already used this enemy name."

    enemy = EnemyModel.from_name_hp_ac(name, max_hp, ac, user.id)

    enemy.strength = stre
    enemy.dexterity = dex
    enemy.constitution = con
    enemy.intelligence = inte
    enemy.wisdom = wis
    enemy.charisma = cha

    enemy_repository.create_enemy(enemy)
    return ""


def delete_enemy(enemy_id: int, user: UserModel):
    enemy = get_enemy(enemy_id)
    if not enemy:
        return "This enemy does not exist"

    if enemy.user != user:
        return "This enemy does not belong to this user"

    enemy_repository.delete_enemy(enemy)
    return ""


def get_enemy(enemy_id: int):
    return enemy_repository.get_enemy(enemy_id)


def add_ability(enemy_id: int, text: str, user: UserModel):
    enemy = get_enemy(enemy_id)

    if enemy is None:
        return "This enemy does not exist."

    if enemy.user != user:
        return "This enemy does not belong to this user."

    ability = EnemyAbilityModel.from_id_text(enemy.id, text)
    enemy_repository.add_ability(ability)
    return ""


def get_abilities(user: UserModel, enemy_id=None) -> List[EnemyAbilityModel]:
    db = request_session()
    sub = db.query(EnemyAbilityModel) \
        .join(EnemyModel) \
        # .filter(EnemyModel.user_id == user.id)

    if enemy_id is not None:
        sub = sub.filter(EnemyModel.id == enemy_id)

    return sub.all()


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


def edit_ability(ability_id, text, user):
    ability = enemy_repository.get_ability(ability_id)
    if ability.enemy.user != user:
        return "The ability you are trying to edit does not belong to an enemy created by you."

    ability.text = text
    repository.add_and_commit(ability)

    return ""
