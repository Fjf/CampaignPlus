from server.lib.database import request_session
from server.lib.model.models import PlayerModel


def get_players():
    db = request_session()

    return db.query(PlayerModel).all()


def create_player(player):
    db = request_session()

    db.add(player)
    db.commit()
