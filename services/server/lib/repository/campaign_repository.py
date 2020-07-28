import string
from datetime import datetime
from random import randint
from typing import List, Optional, Tuple

from sqlalchemy.exc import IntegrityError

from services.server import app
from lib.database import request_session
from lib.model.models import CampaignModel, CampaignJoinCodeModel, UserModel, PlayerModel

ALLOWED_CHARS = string.ascii_uppercase + string.digits


def get_campaign_url(campaign: CampaignModel) -> Optional[str]:
    model = get_campaign_code(campaign.id)

    return app.host + ":5000/join/" + model.code


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


def get_campaign_code(pid: int) -> Optional[CampaignJoinCodeModel]:
    """
    Returns a campaign code, or creates one if none exist.

    :param pid:
    :return:
    """
    db = request_session()
    model = db.query(CampaignJoinCodeModel) \
        .filter(CampaignJoinCodeModel.playthrough_id == pid) \
        .one_or_none()

    if not model:
        model = CampaignJoinCodeModel.from_campaign_id(pid)
        model.date = datetime.now()

        while True:
            try:
                model.code = _create_random_string(6)

                db.add(model)
                db.commit()
                break
            except IntegrityError:
                print("A key had to be regenerated.")

    return model



def find_playthrough_with_code(code: str) -> Optional[CampaignModel]:
    db = request_session()

    return db.query(CampaignModel) \
        .join(CampaignJoinCodeModel) \
        .filter(CampaignJoinCodeModel.code == code) \
        .one_or_none()


def _create_random_string(length: int):
    return "".join(ALLOWED_CHARS[randint(0, len(ALLOWED_CHARS)-1)] for _ in range(length))
