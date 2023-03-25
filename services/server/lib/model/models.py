from __future__ import annotations

import datetime
import os
import time
from typing import Any

import qrcode
from sqlalchemy import Column, Integer, String, ForeignKey, LargeBinary, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship, deferred

from lib.database import OrmModelBase, request_session


class UserModel(OrmModelBase):
    """
    A user login model.
    """

    __tablename__ = 'user'

    id = Column(Integer(), primary_key=True)

    name = Column(String(), unique=True, nullable=False)
    password = deferred(Column(LargeBinary(), nullable=False))
    email = Column(String(), unique=True, nullable=True)

    @classmethod
    def from_name_password(cls, name: str, password: bytes, email: str = None):
        c = cls()
        c.name = name
        c.password = password
        c.email = email
        return c

    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email
        }


class EmailResetModel(OrmModelBase):
    """
    A model where codes for users are stored for the purpose of resetting the user's password.
    """

    __tablename__ = 'email_reset'

    id = Column(Integer(), primary_key=True)

    user_id = Column(Integer(), ForeignKey("user.id"))
    user = relationship("UserModel")

    code = Column(String(), unique=True, nullable=False)
    date = Column(DateTime(), nullable=False)

    @classmethod
    def from_user_code_date(cls, user: UserModel, code: str, date: datetime):
        c = cls()
        c.user_id = user.id
        c.code = code
        c.date = date
        return c


class EnemyModel(OrmModelBase):
    """
    An enemy for a campaign, which may be used in a game.
    """

    __tablename__ = 'enemy'

    id = Column(Integer(), primary_key=True)

    """
    The user to whom this player character belongs.
    """

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

    @classmethod
    def from_name_hp_ac(cls, player: str, max_hp: int, ac: int, user_id: int):
        c = cls()
        c.name = player
        c.max_hp = max_hp
        c.armor_class = ac
        c.user_id = user_id
        return c

    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "max_hp": self.max_hp,
            "armor_class": self.armor_class,
            "str": self.strength,
            "dex": self.dexterity,
            "con": self.constitution,
            "int": self.intelligence,
            "wis": self.wisdom,
            "cha": self.charisma
        }


class EnemyAbilityModel(OrmModelBase):
    """
    An enemy for a campaign, which may be used in a game.
    """

    __tablename__ = 'enemy_ability'

    id = Column(Integer(), primary_key=True)

    """
    The user to whom this player character belongs.
    """

    enemy_id = Column(Integer(), ForeignKey("enemy.id"), nullable=False)
    enemy: EnemyModel = relationship("EnemyModel")

    owner_id = Column(Integer(), ForeignKey("user.id"), nullable=False)
    owner: UserModel = relationship("UserModel")

    text = Column(String(), nullable=False)

    @classmethod
    def from_id_text(cls, enemy_id: int, text: str):
        c = cls()
        c.enemy_id = enemy_id
        c.text = text
        return c

    def to_json(self):
        return {
            "id": self.id,
            "enemy_name": self.enemy.name,
            "text": self.text
        }


class CampaignModel(OrmModelBase):
    """
    A campaign which contains data about a game.
    """

    __tablename__ = 'campaign'

    id = Column(Integer(), primary_key=True)

    """
    The user to whom this player character belongs.
    """

    user_id = Column(Integer(), ForeignKey("user.id"))
    user = relationship("UserModel")

    name = Column(String(), nullable=False, default="New Campaign")

    date = Column(DateTime(), nullable=False, default=datetime.datetime.now())
    code = Column(String(), nullable=True, unique=True)

    def __init__(self, user: UserModel, *args: Any, **kwargs: Any):
        super().__init__(*args, **kwargs)
        self.user_id = user.id

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

    def to_json(self, user: UserModel = None):
        return {
            "is_owner": self.user == user,
            "owner": self.user.name,
            "id": self.id,
            "code": self.code,
            "url": self.code_url(),
            "qr_image": self.code_qr(),
            "name": self.name,
            "time": time.mktime(self.date.timetuple()) * 1000  # Python does time in seconds.
        }


class MapModel(OrmModelBase):
    """
    The mapmodel contanis data about maps regarding their location on their parent maps.
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

    def __init__(self, campaign_id: int, x: int, y: int, *args: Any, **kwargs: Any):
        super().__init__(*args, **kwargs)
        self.campaign_id = campaign_id
        self.x = x
        self.y = y

    def to_json(self, recursive=False):
        children = []

        if recursive:
            children = [m.to_json(recursive=True) for m in self.children()]

        return {
            "id": self.id,
            "campaign_id": self.campaign_id,
            "parent_map_id": self.parent_map_id,
            "map_url": "/static/images/uploads/" + self.filename,
            "x": self.x,
            "y": self.y,
            "name": self.name,
            "visible": self.visible,
            "story": self.story,
            "children": children
        }

    def children(self):
        db = request_session()
        return db.query(MapModel).filter(MapModel.parent_map_id == self.id).all()


class CreatorMapModel(OrmModelBase):
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

    @classmethod
    def from_name_base64(cls, campaign_id: int, map_base64: str, name: str):
        c = cls()
        c.campaign_id = campaign_id
        c.map_base64 = map_base64
        c.name = name
        return c

    def to_json(self):
        return {
            "id": self.id,
            "campaign_id": self.campaign_id,
            "map_base64": self.map_base64,
            "name": self.name,
            "grid_size": self.grid_size,
            "grid_type": self.grid_type,
            "creator_id": self.creator_id
        }


class MessageModel(OrmModelBase):
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
    time = Column(DateTime(), nullable=False)

    @classmethod
    def from_campaign_sender_msg(cls, campaign: CampaignModel, sender: PlayerModel, msg: str):
        c = cls()
        c.campaign_id = campaign.id
        c.sender_id = sender.id
        c.message = msg
        c.time = datetime.datetime.now()
        return c


class LogModel(OrmModelBase):
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

    time = Column(DateTime(), nullable=False)

    @classmethod
    def from_campaign_creator_content(cls, campaign: CampaignModel, creator: PlayerModel, title: str,
                                      text: str):
        c = cls()
        c.campaign_id = campaign.id
        c.creator_id = creator.id
        c.title = title
        c.text = text
        c.time = datetime.datetime.now()
        return c


class BattlemapModel(OrmModelBase):
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

    @classmethod
    def from_name_data(cls, campaign: CampaignModel, creator: PlayerModel, name: str, data: str):
        c = cls()
        c.campaign_id = campaign.id
        c.creator_id = creator.id
        c.name = name
        c.data = data
        return c


class PlayerModel(OrmModelBase):
    """
    A player character for a user, which may be used in a game.
    """

    __tablename__ = 'player'

    id = Column(Integer(), primary_key=True)

    campaign_id = Column(Integer(), ForeignKey("campaign.id"), default=-1)
    campaign = relationship("CampaignModel")

    user_id = Column(Integer(), ForeignKey("user.id"))
    user = relationship("UserModel")

    name = Column(String(), nullable=False)
    race_name = Column(String(), nullable=False, default="Human")

    backstory = Column(String(), nullable=True, default="")

    copper = Column(Integer(), nullable=False, default=0)
    silver = Column(Integer(), nullable=False, default=0)
    electron = Column(Integer(), nullable=False, default=0)
    gold = Column(Integer(), nullable=False, default=0)
    platinum = Column(Integer(), nullable=False, default=0)

    info = Column(JSON(), nullable=True)

    def __init__(self, name: str, campaign: CampaignModel, user: UserModel, *args: Any, **kwargs: Any):
        super().__init__(*args, **kwargs)
        self.info = self.get_default_info()
        self.name = name
        self.user_id = user.id
        self.campaign_id = campaign.id if campaign is not None else -1

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

    def to_json(self):
        return {
            "name": self.name,
            "owner": self.user.name,
            "owner_id": self.user.id,
            "id": self.id,
            "race": self.race_name,
            "backstory": self.backstory,
            "money": {
                "gold": self.gold,
                "silver": self.silver,
                "electron": self.electron,
                "platinum": self.platinum,
                "copper": self.copper
            },
            "info": self.info
        }


class ItemModel(OrmModelBase):
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

    def to_json(self):
        def to_gp_sp_cp(value):
            if value % 10000 == 0:
                return "%sgp" % (value // 10000)
            if value % 100 == 0:
                return "%ssp" % (value // 100)
            return "%scp" % value

        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "gear_category": self.gear_category,
            "weight": self.weight,
            "raw_value": self.cost,
            "value": to_gp_sp_cp(self.cost),
            "description": self.description,
            "item_info": self.item_info,
        }


class PlayerEquipmentModel(OrmModelBase):
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

    def __init__(self, player: PlayerModel, item: ItemModel, *args: Any, **kwargs: Any):
        super().__init__(*args, **kwargs)
        self.player_id = player.id
        self.item_id = item.id

    def to_json(self):
        return {
            "id": self.id,
            "amount": self.amount,
            "description": self.description,
            "info": self.item.to_json()
        }


class SpellModel(OrmModelBase):
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

    @classmethod
    def from_name(cls, name: String):
        c = cls()
        c.name = name
        return c

    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "level": self.level,
            "duration": self.duration,
            "higher_level": self.higher_level,
            "casting_time": self.casting_time,
            "concentration": self.concentration,
            "ritual": self.ritual,
            "material": self.material,
            "components": self.components,
            "self_range": self.spell_range,
            "description": self.description,
            "school": self.school,
            "phb_page": self.phb_page
        }


class PlayerSpellModel(OrmModelBase):
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

    @classmethod
    def from_player_spell(cls, player: PlayerModel, spell: SpellModel):
        c = cls()
        c.player_id = player.id
        c.spell_id = spell.id
        return c


class RaceModel(OrmModelBase):
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

    # ability_bonuses 1:many
    # starting_proficiencies 1:*
    # languages 1:1/many
    # language_desc string 1:1
    # traits 1:many
    # trait_options 1:many
    # subraces 1:*

    @classmethod
    def from_owner(cls, owner: UserModel = None):
        c = cls()
        if owner:
            c.owner_id = owner.id
        else:
            c.owner_id = None
        return c

    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "speed": self.speed,
            "desc": self.desc,
            "speed_desc": self.speed_desc,
            "age": self.age,
            "alignment": self.alignment,
            "size": self.size,
            "languages": self.languages,
            "vision": self.vision,
            "traits": self.traits
        }


class BackgroundModel(OrmModelBase):
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

    def __init__(self, name, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self.name = name

    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "desc": self.desc,
            "skills": self.skills,
            "tools": self.tools,
            "languages": self.languages,
            "equipment": self.equipment,
            "feature": self.feature,
            "feature_desc": self.feature_desc,
        }
