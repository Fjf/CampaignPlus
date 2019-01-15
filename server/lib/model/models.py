import datetime

from sqlalchemy import Column, Integer, String, ForeignKey, LargeBinary, DateTime
from sqlalchemy.orm import relationship, deferred

from server.lib.database import OrmModelBase


class UserModel(OrmModelBase):
    """
    A user login model.
    """

    __tablename__ = 'user'

    id = Column(Integer(), primary_key=True)

    name = Column(String(), unique=True, nullable=False)
    password = deferred(Column(LargeBinary(), nullable=False))

    @classmethod
    def from_name_password(cls, name: str, password: str):
        c = cls()
        c.name = name
        c.password = password
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
    enemy = relationship("EnemyModel")

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
    def from_playthrough_creator_content(cls, playthrough: PlaythroughModel, creator: PlayerModel, title: str, text: str):
        c = cls()
        c.playthrough_id = playthrough.id
        c.creator_id = creator.id
        c.title = title
        c.text = text
        c.time = datetime.datetime.now()
        return c
