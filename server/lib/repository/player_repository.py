from server.lib.database import request_session
from server.lib.model.models import PlayerModel, PlaythroughModel


def get_players(playthrough_id: int):
    db = request_session()

    return db.query(PlayerModel) \
        .join(PlaythroughModel) \
        .filter(PlaythroughModel.id == playthrough_id) \
        .all()


def create_player(player):
    db = request_session()

    db.add(player)
    db.commit()
