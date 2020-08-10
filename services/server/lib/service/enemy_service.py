from typing import List

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

    enemy = EnemyModel.from_name_hp_ac(name, max_hp, armor_class, user.id)

    enemy.strength = strength
    enemy.dexterity = dex
    enemy.constitution = con
    enemy.intelligence = intelligence
    enemy.wisdom = wis
    enemy.charisma = cha

    db = request_session()
    db.add(enemy)
    db.commit()
    return enemy


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

    ability = EnemyAbilityModel.from_id_text(enemy.id, text)
    ability.owner_id = user.id
    db = request_session()

    db.add(ability)
    db.commit()
    return ability


def get_abilities(user: UserModel, enemy_id=None) -> List[EnemyAbilityModel]:
    db = request_session()
    sub = db.query(EnemyAbilityModel) \
        .filter(EnemyAbilityModel.owner_id == user.id)

    if enemy_id is not None:
        sub = sub.filter(EnemyAbilityModel.enemy_id == enemy_id)

    return sub.distinct(EnemyAbilityModel.text).all()


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


def edit_enemy(user, data):
    enemy_id = data.get("id")
    enemy = get_enemy(enemy_id)
    if enemy is None:
        raise NotFound("This enemy does not exist.")

    if enemy.user_id != user.id:
        raise Unauthorized("This enemy does not belong to you.")

    enemy.name = data.get("name")
    enemy.armor_class = data.get("armor_class")
    enemy.max_hp = data.get("max_hp")

    enemy.strength = data.get("str")
    enemy.dexterity = data.get("dex")
    enemy.constitution = data.get("con")
    enemy.intelligence = data.get("int")
    enemy.wisdom = data.get("wis")
    enemy.charisma = data.get("cha")

    abilities = data.get("abilities")
    for ability in abilities:
        ability_model = get_ability(ability.get("id"))

        # Skip all abilities that are not connected to this enemy.
        if ability_model.enemy_id != enemy.id:
            continue

        ability_model.text = ability.get("text")

    db = request_session()
    db.commit()




