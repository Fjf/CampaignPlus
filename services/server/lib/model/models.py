import datetime
import os
import time

import qrcode
from sqlalchemy import Column, Integer, String, ForeignKey, LargeBinary, DateTime, Boolean
from sqlalchemy.orm import relationship, deferred

from lib.database import OrmModelBase, request_session
from services.server import app


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
    def from_name_password(cls, name: str, password: str, email: str = None):
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
    An enemy for a playthrough, which may be used in a game.
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
    An enemy for a playthrough, which may be used in a game.
    """

    __tablename__ = 'enemy_ability'

    id = Column(Integer(), primary_key=True)

    """
    The user to whom this player character belongs.
    """

    enemy_id = Column(Integer(), ForeignKey("enemy.id"), nullable=False)
    enemy: EnemyModel = relationship("EnemyModel")

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
    A playthrough which contains data about a game.
    """

    __tablename__ = 'playthrough'

    id = Column(Integer(), primary_key=True)

    """
    The user to whom this player character belongs.
    """

    user_id = Column(Integer(), ForeignKey("user.id"))
    user = relationship("UserModel")

    name = Column(String(), nullable=False, default="New Campaign")

    date = Column(DateTime(), nullable=False, default=datetime.datetime.now())
    code = Column(String(), nullable=True, unique=True)

    def __init__(self, user: UserModel):
        self.user_id = user.id

    def code_url(self):
        return "%s:5000/join/%s" % (app.host, self.code)

    def code_qr(self):
        """
        Checks if the qr code image already exists, if not, creates the image.

        :return:
        """
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


class PlayerModel(OrmModelBase):
    """
    A player character for a user, which may be used in a game.
    """

    __tablename__ = 'player'

    id = Column(Integer(), primary_key=True)

    """
    The user to whom this player character belongs.
    """

    playthrough_id = Column(Integer(), ForeignKey("playthrough.id"), default=-1)
    playthrough = relationship("CampaignModel")

    user_id = Column(Integer(), ForeignKey("user.id"))
    user = relationship("UserModel")

    name = Column(String(), nullable=False)
    race_name = Column(String(), nullable=False)
    class_name = Column(String(), nullable=False)
    backstory = Column(String(), nullable=True)

    @classmethod
    def from_name_playthrough_user(cls, name: str, playthrough: CampaignModel, user: UserModel):
        c = cls()
        c.name = name
        c.user_id = user.id

        if playthrough is not None:
            c.playthrough_id = playthrough.id
        return c

    def to_json(self):
        from lib.service import player_service
        class_ids = [cls.id for cls in player_service.get_classes(self)]

        return {
            "name": self.name,
            "owner": self.user.name,
            "owner_id": self.user.id,
            "id": self.id,
            "race_name": self.race_name,
            "class_name": self.class_name,
            "backstory": self.backstory,
            "class_ids": class_ids
        }


class MapModel(OrmModelBase):
    """
    The mapmodel contanis data about maps regarding their location on their parent maps.
    """

    __tablename__ = 'map'

    id = Column(Integer(), primary_key=True)

    campaign_id = Column(Integer(), ForeignKey("playthrough.id"), nullable=False)
    campaign = relationship("CampaignModel")

    parent_map_id = Column(Integer(), ForeignKey("map.id"), nullable=True)
    parent_map = relationship("MapModel")

    filename = Column(String(), nullable=False, default="default.png")
    x = Column(Integer(), nullable=False, default=0)
    y = Column(Integer(), nullable=False, default=0)

    name = Column(String(), nullable=True, default="New Map")
    story = Column(String(), nullable=True, default="")

    visible = Column(Boolean(), nullable=False, default=True)

    def __init__(self, campaign_id: int, x: int, y: int):
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

    campaign_id = Column(Integer(), ForeignKey("playthrough.id"), nullable=False)
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
    The mapmodel contanis data about maps regarding their location on their parent maps.
    """

    __tablename__ = 'message'

    id = Column(Integer(), primary_key=True)

    playthrough_id = Column(Integer(), ForeignKey("playthrough.id"), nullable=False)
    playthrough = relationship("CampaignModel")

    sender_id = Column(Integer(), ForeignKey("player.id"), nullable=True)
    sender = relationship("PlayerModel")

    message = Column(String(), nullable=False)
    time = Column(DateTime(), nullable=False)

    @classmethod
    def from_playthrough_sender_msg(cls, playthrough: CampaignModel, sender: PlayerModel, msg: str):
        c = cls()
        c.playthrough_id = playthrough.id
        c.sender_id = sender.id
        c.message = msg
        c.time = datetime.datetime.now()
        return c


class LogModel(OrmModelBase):
    """
    The mapmodel contanis data about maps regarding their location on their parent maps.
    """

    __tablename__ = 'log'

    id = Column(Integer(), primary_key=True)

    playthrough_id = Column(Integer(), ForeignKey("playthrough.id"), nullable=False)
    playthrough = relationship("CampaignModel")

    creator_id = Column(Integer(), ForeignKey("player.id"), nullable=True)
    creator = relationship("PlayerModel")

    title = Column(String(), nullable=False)
    text = Column(String(), nullable=False)

    time = Column(DateTime(), nullable=False)

    @classmethod
    def from_playthrough_creator_content(cls, playthrough: CampaignModel, creator: PlayerModel, title: str,
                                         text: str):
        c = cls()
        c.playthrough_id = playthrough.id
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

    playthrough_id = Column(Integer(), ForeignKey("playthrough.id"), nullable=False)
    playthrough = relationship("CampaignModel")

    creator_id = Column(Integer(), ForeignKey("player.id"), nullable=True)
    creator = relationship("PlayerModel")

    name = Column(String(), nullable=False)
    data = Column(String(), nullable=False)

    @classmethod
    def from_name_data(cls, playthrough: CampaignModel, creator: PlayerModel, name: str, data: str):
        c = cls()
        c.playthrough_id = playthrough.id
        c.creator_id = creator.id
        c.name = name
        c.data = data
        return c


class PlayerInfoModel(OrmModelBase):
    """
    The player info model contains all additional data about a player.
    This only refers to static information like HP/Speed etc.

    Player spells, items and weapons are linked by playerID in a different table.
    """

    __tablename__ = 'player_info'

    id = Column(Integer(), primary_key=True)

    player_id = Column(Integer(), ForeignKey("player.id"), nullable=False)
    player = relationship("PlayerModel")

    strength = Column(Integer(), nullable=True)
    dexterity = Column(Integer(), nullable=True)
    constitution = Column(Integer(), nullable=True)
    intelligence = Column(Integer(), nullable=True)
    wisdom = Column(Integer(), nullable=True)
    charisma = Column(Integer(), nullable=True)

    saving_throws_str = Column(Boolean(), nullable=True)
    saving_throws_dex = Column(Boolean(), nullable=True)
    saving_throws_con = Column(Boolean(), nullable=True)
    saving_throws_int = Column(Boolean(), nullable=True)
    saving_throws_wis = Column(Boolean(), nullable=True)
    saving_throws_cha = Column(Boolean(), nullable=True)

    max_hp = Column(Integer(), nullable=True)
    armor_class = Column(Integer(), nullable=True)
    speed = Column(Integer(), nullable=True)
    level = Column(Integer(), nullable=True)

    @classmethod
    def from_player(cls, player: PlayerModel):
        c = cls()
        c.player_id = player.id
        return c

    def to_json(self):
        return {
            "strength": self.strength,
            "dexterity": self.dexterity,
            "constitution": self.constitution,
            "intelligence": self.intelligence,
            "wisdom": self.wisdom,
            "charisma": self.charisma,
            "saving_throws_str": self.saving_throws_str,
            "saving_throws_dex": self.saving_throws_dex,
            "saving_throws_con": self.saving_throws_con,
            "saving_throws_int": self.saving_throws_int,
            "saving_throws_wis": self.saving_throws_wis,
            "saving_throws_cha": self.saving_throws_cha,
            "max_hp": self.max_hp,
            "armor_class": self.armor_class,
            "speed": self.speed,
            "level": self.level,
        }


class ItemModel(OrmModelBase):
    """
    The datamodel which stores items.

    Left join with WeaponModel to add possible weapon attributes to the items.
    """

    __tablename__ = 'item'

    id = Column(Integer(), primary_key=True)

    name = Column(String(), nullable=False)

    playthrough_id = Column(Integer(), ForeignKey("playthrough.id"), nullable=True)
    playthrough = relationship("CampaignModel")

    # Weapon or item
    category = Column(String(), nullable=False)

    # Price of item in copper pieces
    # A value of 100+ is then silver, 10000+ is gold
    cost = Column(Integer(), nullable=False)

    # Weight in lbs, as defined in the phb.
    weight = Column(Integer(), nullable=True)

    @classmethod
    def from_name(cls, name: String):
        c = cls()
        c.name = name
        return c


class WeaponModel(OrmModelBase):
    """
        The player data model contains information about weapons and items,
        and is linked via a player_id.

        """

    __tablename__ = 'weapon'

    id = Column(Integer(), primary_key=True)

    item_id = Column(Integer(), ForeignKey("item.id"), nullable=False)
    item = relationship("ItemModel")

    dice = Column(Integer(), nullable=True)
    damage_bonus = Column(Integer, nullable=True)
    damage_type = Column(String(), nullable=True)

    # Two handed information
    two_dice = Column(Integer(), nullable=True)
    two_damage_bonus = Column(Integer, nullable=True)
    two_damage_type = Column(String(), nullable=True)

    range_normal = Column(Integer(), nullable=True)
    range_long = Column(Integer(), nullable=True)

    throw_range_normal = Column(Integer(), nullable=True)
    throw_range_long = Column(Integer(), nullable=True)

    # flat_damage = Column(Integer(), nullable=True)

    @classmethod
    def from_item(cls, item: ItemModel):
        c = cls()
        c.item_id = item.id
        return c


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
    extra_info = Column(String(), nullable=True)

    @classmethod
    def from_player(cls, player: PlayerModel, item: ItemModel):
        c = cls()
        c.player_id = player.id
        c.item_id = item.id
        return c


class SpellModel(OrmModelBase):
    """
    Contains all information about a spell.
    All spells with playthrough id of -1 are from the base game.
    """

    __tablename__ = 'spell'

    id = Column(Integer(), primary_key=True)

    playthrough_id = Column(Integer(), ForeignKey("playthrough.id"), nullable=True)
    playthrough = relationship("CampaignModel")

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


class PlayerProficiencyModel(OrmModelBase):
    """
    A data container for player proficiencies
    """

    __tablename__ = 'proficiencies'

    id = Column(Integer(), primary_key=True)

    """
    The user to whom this player character belongs.
    """

    player_id = Column(Integer(), ForeignKey("player.id"))
    player = relationship("PlayerModel")

    acrobatics = Column(Integer(), default=0)
    animal_handling = Column(Integer(), default=0)
    arcana = Column(Integer(), default=0)
    athletics = Column(Integer(), default=0)
    deception = Column(Integer(), default=0)
    history = Column(Integer(), default=0)
    insight = Column(Integer(), default=0)
    intimidation = Column(Integer(), default=0)
    investigation = Column(Integer(), default=0)
    medicine = Column(Integer(), default=0)
    nature = Column(Integer(), default=0)
    perception = Column(Integer(), default=0)
    performance = Column(Integer(), default=0)
    persuasion = Column(Integer(), default=0)
    religion = Column(Integer(), default=0)
    sleight_of_hand = Column(Integer(), default=0)
    stealth = Column(Integer(), default=0)
    survival = Column(Integer(), default=0)

    def to_json(self):
        return {
            "acrobatics": self.acrobatics,
            "animal_handling": self.animal_handling,
            "arcana": self.arcana,
            "athletics": self.athletics,
            "deception": self.deception,
            "history": self.history,
            "insight": self.insight,
            "intimidation": self.intimidation,
            "investigation": self.investigation,
            "medicine": self.medicine,
            "nature": self.nature,
            "perception": self.perception,
            "performance": self.performance,
            "persuasion": self.persuasion,
            "religion": self.religion,
            "sleight_of_hand": self.sleight_of_hand,
            "stealth": self.stealth,
            "survival": self.survival
        }

    @classmethod
    def from_player(cls, player: PlayerModel):
        c = cls()
        c.player_id = player.id
        return c
