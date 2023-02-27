from typing import List, Optional

from lib.database import request_session
from lib.model.models import CampaignModel, UserModel, PlayerModel


def create_campaign(model: CampaignModel):
    db = request_session()

    db.add(model)
    db.commit()
    return 0


def get_campaigns(user: UserModel) -> List[CampaignModel]:
    db = request_session()

    return db.query(CampaignModel) \
        .filter(CampaignModel.user == user) \
        .all()


def get_joined_campaigns(user: UserModel):
    db = request_session()

    return db.query(CampaignModel) \
        .join(PlayerModel) \
        .filter(PlayerModel.user_id == user.id) \
        .all()


def get_campaign(pid: int = None, code: str = None) -> Optional[CampaignModel]:
    db = request_session()
    if pid is not None:
        return (
            db.query(CampaignModel)
            .filter(CampaignModel.id == pid)
            .one_or_none()
        )
    if code is not None:
        return (
            db.query(CampaignModel)
            .filter(CampaignModel.code == code)
            .one_or_none()
        )


