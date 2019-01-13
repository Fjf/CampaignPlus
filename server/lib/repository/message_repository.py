from typing import List

from server.lib.database import request_session
from server.lib.model.models import MessageModel


def get_messages(playthrough_id: int) -> List[MessageModel]:
    db = request_session()

    return db.query(MessageModel) \
        .filter(MessageModel.playthrough_id == playthrough_id) \
        .all()


def create_message(message_model: MessageModel):
    db = request_session()

    db.add(message_model)
    db.commit()
