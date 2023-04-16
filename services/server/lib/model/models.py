from __future__ import annotations

import copy
import datetime
import os
from typing import Any

import qrcode
from sqlalchemy import Column, Integer, String, ForeignKey, LargeBinary, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship, deferred

from lib.database import OrmModelBase, request_session


class JSONAble:
    def to_json(self, default_response=None):
        if default_response is None:
            response = {}
        else:
            response = copy.deepcopy(default_response)

        def _is_valid(k, v):
            allowed_types = [str, int, bool, float, datetime, dict]
            return (
                    not k.startswith("_") and
                    type(v) in allowed_types
            )

        response.update({k: v for k, v in self.__dict__.items() if _is_valid(k, v)})
        return response


class UserModel(OrmModelBase, JSONAble):
    """
    A user login model.
    """

    __tablename__ = 'user'

    id = Column(Integer(), primary_key=True)

    name = Column(String(), unique=True, nullable=False)
    password = deferred(Column(LargeBinary(), nullable=False))
    email = Column(String(), unique=True, nullable=True)


class EmailResetModel(OrmModelBase, JSONAble):
    """
    A model where codes for users are stored for the purpose of resetting the user's password.
    """

    __tablename__ = 'email_reset'

    id = Column(Integer(), primary_key=True)

    user_id = Column(Integer(), ForeignKey("user.id"))
    user = relationship("UserModel")

    code = Column(String(), unique=True, nullable=False)
    date = Column(DateTime(), default=datetime.datetime.now())


class EnemyModel(OrmModelBase, JSONAble):
    """
    An enemy for a campaign, which may be used in a game.
    """

    __tablename__ = 'enemy'

    id = Column(Integer(), primary_key=True)

    user_id = Column(Integer(), ForeignKey("user.id"))
    user = relationship("UserModel")

    name = Column(String(), unique=True, nullable=False)
    max_hp = Column(Integer(), nullable=False)
    armor_class = Column(Integer(), nullable=False)

    strength = Column(Integer, nullable=True)
    dexterity = Column(Integer, nullable=True)
    constitution = Column(Integer, nullable=True)
    intelligence = Column(Integer, nullable=True)
    wisdom = Column(Integer, nullable=True)
    charisma = Column(Integer, nullable=True)


class EnemyAbilityModel(OrmModelBase, JSONAble):
    """
    An enemy for a campaign, which may be used in a game.
    """

    __tablename__ = 'enemy_ability'

    id = Column(Integer(), primary_key=True)

    enemy_id = Column(Integer(), ForeignKey("enemy.id"), nullable=False)
    enemy: EnemyModel = relationship("EnemyModel")

    owner_id = Column(Integer(), ForeignKey("user.id"), nullable=False)
    owner: UserModel = relationship("UserModel")

    text = Column(String(), nullable=False)


class CampaignModel(OrmModelBase, JSONAble):
    """
    A campaign which contains data about a game.
    """

    __tablename__ = "campaign"

    id = Column(Integer(), primary_key=True)

    user_id = Column(Integer(), ForeignKey("user.id"))
    user = relationship("UserModel")

    name = Column(String(), nullable=False, default="New Campaign")

    date = Column(DateTime(), nullable=False, default=datetime.datetime.now())
    code = Column(String(), nullable=True, unique=True)

    def code_url(self):
        from services.server import app
        return "%s:5000/join/%s" % (app.host, self.code)

    def code_qr(self):
        """
        Checks if the qr code image already exists, if not, creates the image.

        :return:
        """
        from services.server import app

        qr_filename = "../client/public/static/images/qr_codes/%s.png" % self.code
        qr_filename = os.path.join(app.root_path, qr_filename)
        if not os.path.isfile(qr_filename):
            img = qrcode.make(self.code)
            img.get_image().save(qr_filename)

        return "/static/images/qr_codes/%s.png" % self.code


class MapModel(OrmModelBase, JSONAble):
    """
    The mapmodel contains data about maps regarding their location on their parent maps.
    """

    __tablename__ = 'map'

    id = Column(Integer(), primary_key=True)

    campaign_id = Column(Integer(), ForeignKey("campaign.id"), nullable=False)
    campaign = relationship("CampaignModel")

    parent_map_id = Column(Integer(), ForeignKey("map.id"), nullable=True)
    parent_map = relationship("MapModel")

    filename = Column(String(), nullable=False, default="default.png")
    x = Column(Integer(), nullable=False, default=0)
    y = Column(Integer(), nullable=False, default=0)

    name = Column(String(), nullable=True, default="New Map")
    story = Column(String(), nullable=True, default="")

    visible = Column(Boolean(), nullable=False, default=True)

    def to_json(self, recursive=False):
        response = super().to_json()

        children = []
        if recursive:
            children = [m.to_json(recursive=True) for m in self.children()]
        response["children"] = children

        return response

    def children(self):
        # TODO: Define this with one-to-many database definition in sqlaclhemy
        # https://docs.sqlalchemy.org/en/20/orm/basic_relationships.html
        db = request_session()
        return db.query(MapModel).filter(MapModel.parent_map_id == self.id).all()


class CreatorMapModel(OrmModelBase, JSONAble):
    """
    The CreatorMapModel contains information from the map_creation tool in the dnd site.
    For example, grid size, and drawn image.
    For now, clipboard and previous states are not saved on server.
    """
    __tablename__ = 'created_map'

    id = Column(Integer(), primary_key=True)

    campaign_id = Column(Integer(), ForeignKey("campaign.id"), nullable=False)
    campaign = relationship("CampaignModel")

    map_base64 = Column(String(), nullable=False)
    name = Column(String(), nullable=False)
    grid_size = Column(Integer(), nullable=True, default=1)
    grid_type = Column(String(), nullable=True, default="none")

    creator_id = Column(Integer(), ForeignKey("user.id"), nullable=False)
    creator = relationship("UserModel")


class MessageModel(OrmModelBase, JSONAble):
    """
    The map-model contanis data about maps regarding their location on their parent maps.
    """

    __tablename__ = 'message'

    id = Column(Integer(), primary_key=True)

    campaign_id = Column(Integer(), ForeignKey("campaign.id"), nullable=False)
    campaign = relationship("CampaignModel")

    sender_id = Column(Integer(), ForeignKey("player.id"), nullable=True)
    sender = relationship("PlayerModel")

    message = Column(String(), nullable=False)
    time = Column(DateTime(), default=datetime.datetime.now())


class LogModel(OrmModelBase, JSONAble):
    """
    The map-model contanis data about maps regarding their location on their parent maps.
    """

    __tablename__ = 'log'

    id = Column(Integer(), primary_key=True)

    campaign_id = Column(Integer(), ForeignKey("campaign.id"), nullable=False)
    campaign = relationship("CampaignModel")

    creator_id = Column(Integer(), ForeignKey("player.id"), nullable=True)
    creator = relationship("PlayerModel")

    title = Column(String(), nullable=False)
    text = Column(String(), nullable=False)

    time = Column(DateTime(), default=datetime.datetime.now())


class BattlemapModel(OrmModelBase, JSONAble):
    """
    The mapmodel contanis data about maps regarding their location on their parent maps.
    """

    __tablename__ = 'battlemap'

    id = Column(Integer(), primary_key=True)

    campaign_id = Column(Integer(), ForeignKey("campaign.id"), nullable=False)
    campaign = relationship("CampaignModel")

    creator_id = Column(Integer(), ForeignKey("player.id"), nullable=True)
    creator = relationship("PlayerModel")

    name = Column(String(), nullable=False)
    data = Column(String(), nullable=False)


class PlayerModel(OrmModelBase, JSONAble):
    """
    A player character for a user, which may be used in a game.
    """

    __tablename__ = 'player'

    id = Column(Integer(), primary_key=True)

    campaign_id = Column(Integer(), ForeignKey("campaign.id"), default=-1)
    campaign = relationship("CampaignModel")

    owner_id = Column(Integer(), ForeignKey("user.id"))
    owner = relationship("UserModel")

    name = Column(String(), nullable=False)
    race = Column(String(), nullable=False, default="Human")

    backstory = Column(String(), nullable=True, default="")

    copper = Column(Integer(), nullable=False, default=0)
    silver = Column(Integer(), nullable=False, default=0)
    electron = Column(Integer(), nullable=False, default=0)
    gold = Column(Integer(), nullable=False, default=0)
    platinum = Column(Integer(), nullable=False, default=0)

    @staticmethod
    def get_default_info():
        player_stats = {
            "strength": 0,
            "dexterity": 0,
            "constitution": 0,
            "intelligence": 0,
            "wisdom": 0,
            "charisma": 0,
            "saving_throws_str": False,
            "saving_throws_dex": False,
            "saving_throws_con": False,
            "saving_throws_int": False,
            "saving_throws_wis": False,
            "saving_throws_cha": False,
            "max_hp": 1,
            "armor_class": 0,
            "speed": 30,
            "level": 1,
        }
        player_proficiencies = {
            "acrobatics": 0,
            "animal_handling": 0,
            "arcana": 0,
            "athletics": 0,
            "deception": 0,
            "history": 0,
            "insight": 0,
            "intimidation": 0,
            "investigation": 0,
            "medicine": 0,
            "nature": 0,
            "perception": 0,
            "performance": 0,
            "persuasion": 0,
            "religion": 0,
            "sleight_of_hand": 0,
            "stealth": 0,
            "survival": 0
        }
        return {
            "stats": player_stats,
            "proficiencies": player_proficiencies,
            "class_ids": [],
            "subclass_ids": [],
        }

    def to_json(self, **kwargs):
        data = super().to_json(kwargs)
        data["owner"] = self.owner.name
        return data

    info = Column(JSON(), default=get_default_info())


class ItemModel(OrmModelBase, JSONAble):
    """
    The datamodel which stores items.
    """

    __tablename__ = 'item'

    id = Column(Integer(), primary_key=True)

    owner_id = Column(Integer(), ForeignKey("user.id"), primary_key=False)
    owner = relationship("UserModel", foreign_keys=[owner_id])

    name = Column(String(), nullable=False)

    # Weapon or item
    category = Column(String(), nullable=False)
    # More info about gear category
    gear_category = Column(String(), nullable=True)

    # Price of item in copper pieces
    # A value of 100+ is then silver, 10000+ is gold
    cost = Column(Integer(), nullable=False)

    # Weight in lbs, as defined in the phb.
    weight = Column(Integer(), nullable=True)

    # Additional information about the item.
    description = Column(String(), nullable=True)
    # Add variable fields on the item (e.g., weapon/armor specific stats)
    item_info = Column(JSON(), nullable=True, default=dict)


class PlayerEquipmentModel(OrmModelBase, JSONAble):
    """
    The player data model contains information about weapons and items,
    and is linked via a player_id.

    """

    __tablename__ = 'player_equipment'

    id = Column(Integer(), primary_key=True)

    player_id = Column(Integer(), ForeignKey("player.id"), nullable=False)
    player = relationship("PlayerModel")

    item_id = Column(Integer(), ForeignKey("item.id"), nullable=False)
    item: ItemModel = relationship("ItemModel")

    amount = Column(Integer(), nullable=False, default=0)
    description = Column(String(), nullable=True, default="")

    def to_json(self):
        return {
            "id": self.id,
            "amount": self.amount,
            "description": self.description,
            "info": self.item.to_json()
        }


class SpellModel(OrmModelBase, JSONAble):
    """
    Contains all information about a spell.
    All spells with campaign id of -1 are from the base game.
    """

    __tablename__ = 'spell'

    id = Column(Integer(), primary_key=True)

    campaign_id = Column(Integer(), ForeignKey("campaign.id"), nullable=True)
    campaign = relationship("CampaignModel")

    name = Column(String(), nullable=True)
    phb_page = Column(Integer(), nullable=True)

    description = Column(String(), nullable=False)
    higher_level = Column(String(), nullable=True)
    level = Column(Integer(), nullable=True)

    spell_range = Column(String(), nullable=False)

    components = Column(String(), nullable=False)
    material = Column(String(), nullable=True)

    ritual = Column(Boolean(), nullable=False)
    concentration = Column(Boolean(), nullable=False)

    duration = Column(String(), nullable=False)
    casting_time = Column(String(), nullable=False)

    school = Column(String(), nullable=False)


class PlayerSpellModel(OrmModelBase, JSONAble):
    """
    The player data model contains the spells a player knows.
    It refers to the SpellModel by id.
    """

    __tablename__ = 'player_spell'

    id = Column(Integer(), primary_key=True)

    player_id = Column(Integer(), ForeignKey("player.id"), nullable=False)
    player = relationship("PlayerModel")

    spell_id = Column(Integer(), ForeignKey("spell.id"), nullable=False)
    spell: SpellModel = relationship("SpellModel")


class RaceModel(OrmModelBase, JSONAble):
    __tablename__ = 'race'
    id = Column(Integer(), primary_key=True)
    name = Column(String(), nullable=False)

    owner_id = Column(Integer(), ForeignKey(UserModel.id), nullable=True)
    owner = relationship("UserModel")

    speed = Column(Integer())
    desc = Column(String())
    speed_desc = Column(String())
    age = Column(String())
    alignment = Column(String())
    size = Column(String())
    languages = Column(String())
    vision = Column(String())
    traits = Column(String())


class BackgroundModel(OrmModelBase, JSONAble):
    __tablename__ = 'background'
    id = Column(Integer(), primary_key=True)
    name = Column(String(), nullable=False)

    owner_id = Column(Integer(), ForeignKey(UserModel.id), nullable=True)
    owner = relationship("UserModel")

    desc = Column(String())
    skills = Column(String())
    tools = Column(String())
    languages = Column(String())
    equipment = Column(String())
    feature = Column(String())
    feature_desc = Column(String())
    extra = Column(String())
