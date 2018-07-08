from server.lib.database import request_session
from server.lib.model.models import EnemyModel


def get_enemies():
    db = request_session()

    return db.query(EnemyModel).all()


def create_enemy(enemy):
    db = request_session()

    db.add(enemy)
    db.commit()
