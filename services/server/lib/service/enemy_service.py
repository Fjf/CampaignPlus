from typing import List

from sqlalchemy import or_
from werkzeug.exceptions import BadRequest, Unauthorized, NotFound

from lib.database import request_session
from lib.model.models import EnemyModel, EnemyAbilityModel, UserModel
from lib.repository import enemy_repository, repository
from lib.repository.enemy_repository import get_ability


def get_enemies(user: UserModel):
    return enemy_repository.get_enemies(user.id)


def create_enemy(name, max_hp, armor_class, strength, dex, con, intelligence, wis, cha, user):
    enemies = get_enemies(user)
    for enemy in enemies:
        if enemy.name == name:
            raise BadRequest("You have already used this enemy name.")

    enemy = EnemyModel(name=name, max_hp=max_hp, armor_class=armor_class, user_id=user.id)

    enemy.strength = strength
    enemy.dexterity = dex
    enemy.constitution = con
    enemy.intelligence = intelligence
    enemy.wisdom = wis
    enemy.charisma = cha

    db = request_session()
    db.add(enemy)
    db.commit()
    return enemy_repository.get_enemy(enemy.id)


def delete_enemy(enemy_id: int, user: UserModel):
    """
    Deletes an enemy from the db, and returns the updated enemy list.

    :param enemy_id:
    :param user:
    :return:
    """
    enemy = get_enemy(enemy_id)
    if not enemy:
        raise BadRequest("This enemy does not exist")

    if enemy.user.id != user.id:
        raise Unauthorized("This enemy does not belong to this user")

    db = request_session()
    db.delete(enemy)
    db.commit()
    return enemy_repository.get_enemies(user.id)


def get_enemy(enemy_id: int):
    return enemy_repository.get_enemy(enemy_id)


def add_ability(enemy_id: int, text: str, user: UserModel):
    enemy = get_enemy(enemy_id)

    if enemy is None:
        raise NotFound("This enemy does not exist.")

    if enemy.user != user:
        raise Unauthorized("This enemy does not belong to this user.")

    ability = EnemyAbilityModel(enemy_id=enemy.id, owner_id=user.id, text=text)
    db = request_session()

    db.add(ability)
    db.commit()
    return ability


def get_abilities(user: UserModel, enemy_id=None) -> List[EnemyAbilityModel]:
    db = request_session()
    sub = db.query(EnemyAbilityModel) \
        .filter(or_(EnemyAbilityModel.owner_id == user.id, EnemyAbilityModel.owner_id == -1))

    if enemy_id is not None:
        sub = sub.filter(EnemyAbilityModel.enemy_id == enemy_id)

    return sub.distinct(EnemyAbilityModel.text).all()


def delete_ability(ability_id: int, user: UserModel):
    ability = enemy_repository.get_ability(ability_id)
    if ability.owner_id != user.id:
        raise Unauthorized("You cannot delete abilities which are not yours.")

    session = request_session()
    session.delete(ability)
    session.commit()


def edit_ability(ability_id, text, user):
    ability = enemy_repository.get_ability(ability_id)
    if ability.enemy.user != user:
        return "The ability you are trying to edit does not belong to an enemy created by you."

    ability.text = text
    repository.add_and_commit(ability)

    return ""


def edit_enemy(user, enemy_id: int, data: dict):
    enemy = get_enemy(enemy_id)
    if enemy is None:
        raise NotFound("This enemy does not exist.")

    if enemy.user_id != user.id:
        raise Unauthorized("This enemy does not belong to you.")

    for key, value in data.items():
        try:
            getattr(enemy, key)
            setattr(enemy, key, value)
        except AttributeError as e:
            # Ignore mismatch in keys
            continue

    abilities = data.get("abilities")
    for ability in abilities:
        ability_model = get_ability(ability.get("id"))

        # Skip all abilities that are not connected to this enemy.
        if ability_model.enemy_id != enemy.id:
            continue

        ability_model.text = ability.get("text")

    db = request_session()
    db.commit()

    return get_enemy(enemy_id)
