import datetime

from sqlalchemy import Column, Integer, String, ForeignKey, LargeBinary, DateTime, Boolean
from sqlalchemy.orm import relationship, deferred
from sqlalchemy.util import symbol

from server.lib.database import OrmModelBase


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


class PlaythroughModel(OrmModelBase):
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

    name = Column(String(), nullable=False)
    date = Column(DateTime(), nullable=False)

    @classmethod
    def from_name_date(cls, name: str, date: datetime, user_id: int):
        c = cls()
        c.name = name
        c.date = date
        c.user_id = user_id
        return c


class PlaythroughJoinCodeModel(OrmModelBase):
    """
    A code for users to join a game.
    This should be cleaned up regularly.
    """

    __tablename__ = "playthrough_code"

    playthrough_id = Column(Integer(), ForeignKey("playthrough.id"), primary_key=True)
    playthrough = relationship("PlaythroughModel")

    code = Column(String(), nullable=True, unique=True)
    date = Column(DateTime(), nullable=True)

    @classmethod
    def from_playthrough_id(cls, playthrough_id: int):
        c = cls()
        c.playthrough_id = playthrough_id
        return c


class PlayerModel(OrmModelBase):
    """
    A player character for a user, which may be used in a game.
    """

    __tablename__ = 'player'

    id = Column(Integer(), primary_key=True)

    """
    The user to whom this player character belongs.
    """

    playthrough_id = Column(Integer(), ForeignKey("playthrough.id"))
    playthrough = relationship("PlaythroughModel")

    user_id = Column(Integer(), ForeignKey("user.id"))
    user = relationship("UserModel")

    name = Column(String(), nullable=False)
    race_name = Column(String(), nullable=False)
    class_name = Column(String(), nullable=False)
    backstory = Column(String(), nullable=True)

    @classmethod
    def from_name_playthrough_user(cls, name: str, playthrough: PlaythroughModel, user: UserModel):
        c = cls()
        c.name = name
        c.playthrough_id = playthrough.id
        c.user_id = user.id
        return c


class MapModel(OrmModelBase):
    """
    The mapmodel contanis data about maps regarding their location on their parent maps.
    """

    __tablename__ = 'map'

    id = Column(Integer(), primary_key=True)

    playthrough_id = Column(Integer(), ForeignKey("playthrough.id"), nullable=False)
    playthrough = relationship("PlaythroughModel")

    parent_map_id = Column(Integer(), ForeignKey("map.id"), nullable=True)
    parent_map = relationship("MapModel")

    map_url = Column(String(), nullable=False)
    x = Column(Integer(), nullable=False)
    y = Column(Integer(), nullable=False)

    name = Column(String(), nullable=False)
    story = Column(String(), nullable=True)

    @classmethod
    def from_name_date(cls, playthrough_id: int, map_url: str, x: int, y: int, name: str):
        c = cls()
        c.playthrough_id = playthrough_id
        c.map_url = map_url
        c.x = x
        c.y = y
        c.name = name
        return c


class MessageModel(OrmModelBase):
    """
    The mapmodel contanis data about maps regarding their location on their parent maps.
    """

    __tablename__ = 'message'

    id = Column(Integer(), primary_key=True)

    playthrough_id = Column(Integer(), ForeignKey("playthrough.id"), nullable=False)
    playthrough = relationship("PlaythroughModel")

    sender_id = Column(Integer(), ForeignKey("player.id"), nullable=True)
    sender = relationship("PlayerModel")

    message = Column(String(), nullable=False)
    time = Column(DateTime(), nullable=False)

    @classmethod
    def from_playthrough_sender_msg(cls, playthrough: PlaythroughModel, sender: PlayerModel, msg: str):
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
    playthrough = relationship("PlaythroughModel")

    creator_id = Column(Integer(), ForeignKey("player.id"), nullable=True)
    creator = relationship("PlayerModel")

    title = Column(String(), nullable=False)
    text = Column(String(), nullable=False)

    time = Column(DateTime(), nullable=False)

    @classmethod
    def from_playthrough_creator_content(cls, playthrough: PlaythroughModel, creator: PlayerModel, title: str,
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
    playthrough = relationship("PlaythroughModel")

    creator_id = Column(Integer(), ForeignKey("player.id"), nullable=True)
    creator = relationship("PlayerModel")

    name = Column(String(), nullable=False)
    data = Column(String(), nullable=False)

    @classmethod
    def from_name_data(cls, playthrough: PlaythroughModel, creator: PlayerModel, name: str, data: str):
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

    @classmethod
    def from_player(cls, player: PlayerModel):
        c = cls()
        c.player_id = player.id
        return c


class ItemModel(OrmModelBase):
    """
    The datamodel which stores items.

    Left join with WeaponModel to add possible weapon attributes to the items.
    """

    __tablename__ = 'item'

    id = Column(Integer(), primary_key=True)

    name = Column(String(), nullable=False)

    playthrough_id = Column(Integer(), ForeignKey("playthrough.id"), nullable=True)
    playthrough = relationship("PlaythroughModel")

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

    dice_amount = Column(Integer(), nullable=True)
    dice_type = Column(Integer(), nullable=True)
    damage_type = Column(String(), nullable=True)

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
    item = relationship("ItemModel")

    amount = Column(Integer(), nullable=False)
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
    playthrough = relationship("PlaythroughModel")

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
    def from_player(cls, player: PlayerModel, spell: SpellModel):
        c = cls()
        c.player_id = player.id
        c.spell_id = spell.id
        return c
