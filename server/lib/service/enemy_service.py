from server.lib.model.models import EnemyModel
from server.lib.repository import enemy_repository


def get_enemies():
    return enemy_repository.get_enemies()


def create_enemy(name, max_hp, user_id):
    player = EnemyModel.from_name(name, max_hp, user_id)
    enemy_repository.create_enemy(player)
