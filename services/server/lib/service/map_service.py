import os
import string
from random import randint
from typing import Optional, List, Tuple

from werkzeug.exceptions import BadRequest, Unauthorized

from services.server import app
from lib.database import request_session
from lib.model.models import MapModel, UserModel, BattlemapModel, CreatorMapModel
from lib.repository import map_repository
from lib.service import campaign_service

ALLOWED_CHARS = string.digits + string.ascii_letters

import exifread
from PIL import Image


def rotate_file(filename: str) -> None:
    """
    Rotates a file to match its image orientation as specified by the camera.

    :param filename:
    :return:
    """

    f = open(filename, "rb")
    tags = exifread.process_file(f, details=False, stop_tag='Image Orientation')
    f.close()

    tag = tags.get("Image Orientation", None)
    if tag is None:
        return

    rot = str(tag)
    if not rot.startswith("Rotated "):
        return

    data = rot.split(" ")

    image = Image.open(filename)

    r = 0
    if data[1] == "90":
        r = Image.ROTATE_270
    elif data[1] == "180":
        r = Image.ROTATE_180
    elif data[1] == "270":
        r = Image.ROTATE_90
    else:
        raise ValueError("Something went wrong reading EXIF data.")

    image = image.transpose(r)

    image.save(filename)


def create_map(user: UserModel, campaign_id: int, x: int, y: int, parent_map_id: int = None):
    """
    Creates a map on the defined x,y coordinates and a parent map.
    If parent map is None, it is assumed this map to be the root map for the campaign.
    :param parent_map_id:
    :param user:
    :param campaign_id:
    :param x:
    :param y:
    :return:
    """
    campaign = campaign_service.get_campaign(campaign_id=campaign_id)

    if campaign is None:
        raise BadRequest("This campaign does not exist.")

    map_model = MapModel(campaign_id, x, y)
    if not (parent_map_id is None and get_root_map(user, campaign_id) is None):
        # This will become a child model
        parent_map = get_map(parent_map_id)
        if parent_map is None:
            raise BadRequest("Parent map id does not exist.")

        if parent_map_id is not None:
            map_model.parent_map_id = parent_map_id

    db = request_session()
    db.add(map_model)
    db.commit()

    return map_model


def alter_map(user: UserModel, map_id: int, map_img=None, name: str = None, story: str = None, x: int = None,
              y: int = None):
    """
    Alters the map specified by the supplied map_id, returns the altered map.
    All parameters are optional, only non-null parameters will be altered.

    :param user:
    :param map_id:
    :param map_img:
    :param name:
    :param story:
    :param x:
    :param y:
    :return:
    """
    map_model = get_map(map_id)

    # TODO: Decide if we want this
    # if map_model.campaign.user_id != user.id:
    #     raise Unauthorized("You cannot alter maps of which you are not the campaign owner.")

    if map_img is not None:
        # Generate random file names until you get a unique one in the uploads.
        print(os.getcwd())
        while True:
            extension = os.path.splitext(map_img.filename)[1]
            filename = _create_random_string(15) + extension  # 15 seems like a large enough number for files.

            path = os.path.join(app.map_storage, filename)
            if not os.path.isfile(path):
                break

        map_img.save(path)
        rotate_file(path)
        map_model.filename = filename
    if x is not None:
        map_model.x = x
    if y is not None:
        map_model.y = y
    if story is not None:
        map_model.story = story
    if name is not None:
        map_model.name = name

    # Push changes.
    db = request_session()
    db.commit()

    return map_model


def get_map(map_id: int) -> Optional[MapModel]:
    db = request_session()

    return db.query(MapModel) \
        .filter(MapModel.id == map_id) \
        .one_or_none()


def _create_random_string(length: int):
    return "".join(ALLOWED_CHARS[randint(0, len(ALLOWED_CHARS) - 1)] for _ in range(length))


def get_children(map: MapModel) -> Optional[List[MapModel]]:
    return map_repository.get_children(map.id)


def get_all_maps(playthrough_id: str) -> List[MapModel]:
    return map_repository.get_all_maps(playthrough_id)


def update_map(map_id: int, x=None, y=None, parent_id=None, name=None, story=None, image_id=None):
    map = get_map(map_id)
    if map is None:
        return "This map id does not exist."

    if name is not None:
        map.name = name
    if story is not None:
        map.story = story
    if x is not None:
        map.x = x
    if y is not None:
        map.y = y
    if parent_id is not None:
        map.parent_map_id = parent_id
    if image_id is not None:
        # image =
        map.filename = ""

    map_repository.commit()
    return ""


def create_battlemap(user: UserModel, playthrough_id: int, name: str, data: str):
    playthrough = campaign_service.get_campaign(playthrough_id)
    if playthrough is None:
        return "This playthrough does not exist."

    battlemap = BattlemapModel.from_name_data(playthrough, user, name, data)

    map_repository.create_map(battlemap)
    return ""


def get_all_battlemaps(playthrough_id: int):
    return map_repository.get_all_battlemaps(playthrough_id)


def create_editor_map(user: UserModel, campaign_id: int, map_base64: str, name: str, grid_size=1, grid_type="none") -> \
        Tuple[bool, str, int]:
    """
    Creates an editable map to be stored on the server.
    Returns a tuple containing (Success, Error)
    If the request was successful, error is an empty string.

    :param grid_type:
    :param grid_size:
    :param user:
    :param campaign_id:
    :param map_base64:
    :param name:
    :return:
    """
    campaign = campaign_service.get_campaign(campaign_id)
    if campaign is None:
        return False, "This campaign does not exist.", -1

    if not campaign_service.user_in_campaign(user, campaign):
        return False, "This user is not currently in this campaign.", -1

    cmm = CreatorMapModel.from_name_base64(campaign_id, map_base64, name)

    cmm.grid_size = grid_size
    cmm.grid_type = grid_type
    cmm.creator_id = user.id

    # There cannot be a problem with duplicate maps, because they contain an unique id.
    db = request_session()
    db.add(cmm)
    db.commit()

    return True, "", cmm.id


def get_editor_maps(user: UserModel, campaign_id: int) -> Tuple[bool, str, Optional[List]]:
    """
    Gets all editor maps of the campaign if the user is in this campaign.
    :param user:
    :param campaign_id:
    :return:
    """
    campaign = campaign_service.get_campaign(campaign_id)
    if campaign is None:
        return False, "This campaign does not exist.", None

    if not campaign_service.user_in_campaign(user, campaign):
        return False, "This user is not currently in this campaign.", None

    db = request_session()
    return True, "", db.query(CreatorMapModel).filter(CreatorMapModel.campaign_id == campaign_id).all()


def delete_editor_map(user, campaign_id, map_id):
    """
        Deletes the edited map from the campaign if the user is in this campaign.
        Additionally, checks whether or not the map exists, and if the user made this map.

        :param user:
        :param campaign_id:
        :return:
        """
    campaign = campaign_service.get_campaign(campaign_id)
    if campaign is None:
        raise BadRequest("This campaign does not exist.")
    if not campaign_service.user_in_campaign(user, campaign):
        raise BadRequest("This user is not currently in this campaign.")

    editor_map = map_repository.get_editor_map(map_id)

    if editor_map is None:
        raise BadRequest("A map with map id `%d` does not exist." % map_id)
    if editor_map.creator_id != user.id:
        raise Unauthorized("Deleting another users map is not allowed.")

    # Delete the record.
    db = request_session()
    db.delete(editor_map)
    db.commit()


def get_root_map(user, campaign_id):
    """
    Gets the root map for the campaign.

    :param user:
    :param campaign_id:
    :return:
    """
    db = request_session()

    return db.query(MapModel) \
        .filter(MapModel.campaign_id == campaign_id) \
        .filter(MapModel.parent_map_id == None) \
        .one_or_none()


def delete_map(user, map_id):
    """
    Deletes a map given a map id.
    Requires there to be no child maps of the to-be-deleted map
    :param user:
    :param map_id:
    :return:
    """

    map_model = get_map(map_id)

    if map_model is None:
        raise BadRequest("This map id does not exist.")

    if len(map_model.children()) > 0:
        raise BadRequest("You cannot delete a map with children. First delete sub-maps before deleting this map.")

    db = request_session()
    db.delete(map_model)
    db.commit()

    return map_model
