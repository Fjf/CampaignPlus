from typing import List

from lib.database import request_session
from lib.model.models import MessageModel


def get_messages(campaign_id: int) -> List[MessageModel]:
    db = request_session()

    return db.query(MessageModel) \
        .filter(MessageModel.campaign_id == campaign_id) \
        .all()
