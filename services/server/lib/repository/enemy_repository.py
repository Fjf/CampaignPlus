from typing import Optional

from lib.database import request_session
from lib.model.models import EnemyModel, EnemyAbilityModel


def get_enemies(user_id: int):
    db = request_session()

    return db.query(EnemyModel)\
        .filter(EnemyModel.user_id == user_id)\
        .all()



def get_enemy(enemy_id: int) -> Optional[EnemyModel]:
    db = request_session()

    return db.query(EnemyModel) \
        .filter(EnemyModel.id == enemy_id) \
        .one_or_none()


def get_enemy_abilities(enemy: EnemyModel):
    db = request_session()

    return db.query(EnemyAbilityModel) \
        .filter(EnemyAbilityModel.enemy == enemy) \
        .all()


def get_ability(ability_id: int) -> Optional[EnemyAbilityModel]:
    db = request_session()

    return db.query(EnemyAbilityModel) \
        .filter(EnemyAbilityModel.id == ability_id) \
        .one_or_none()


def delete_ability(ability: EnemyAbilityModel):
    db = request_session()

    db.delete(ability)
    db.commit()