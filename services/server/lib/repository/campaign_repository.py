import string
from datetime import datetime
from random import randint
from typing import List, Optional, Tuple

from sqlalchemy.exc import IntegrityError

from services.server import app
from lib.database import request_session
from lib.model.models import CampaignModel, UserModel, PlayerModel


def create_playthrough(model: CampaignModel):
    db = request_session()

    db.add(model)
    db.commit()
    return 0


def get_playthroughs(user: UserModel) -> List[CampaignModel]:
    db = request_session()

    return db.query(CampaignModel) \
        .filter(CampaignModel.user == user) \
        .all()


def get_joined_playthroughs(user: UserModel):
    db = request_session()

    return db.query(CampaignModel) \
        .join(PlayerModel) \
        .filter(PlayerModel.user_id == user.id) \
        .all()


def get_playthrough_by_id(pid: int) -> Optional[CampaignModel]:
    db = request_session()

    return db.query(CampaignModel) \
        .filter(CampaignModel.id == pid) \
        .one_or_none()


def find_playthrough_with_id(pid: int) -> Optional[CampaignModel]:
    db = request_session()

    return db.query(CampaignModel) \
        .filter(CampaignModel.id == pid) \
        .one_or_none()


def find_playthrough_with_code(code: str) -> Optional[CampaignModel]:
    db = request_session()

    return db.query(CampaignModel) \
        .filter(CampaignModel.code == code) \
        .one_or_none()
