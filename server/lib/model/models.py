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


class PlayerModel(OrmModelBase):
    """
    A player character for a user, which may be used in a game.
    """

    __tablename__ = 'player'

    id = Column(Integer(), primary_key=True)

    """
    The user to whom this player character belongs.
    """

    user_id = Column(Integer(), ForeignKey("user.id"))
    user = relationship("UserModel")

    name = Column(String(), unique=True, nullable=False)
    class_name = Column(String(), nullable=False)

    @classmethod
    def from_name(cls, player: str, player_class: str, user_id: int):
        c = cls()
        c.name = player
        c.class_name = player_class
        c.user_id = user_id
        return c


class EnemyModel(OrmModelBase):
    """
    A player character for a user, which may be used in a game.
    """

    __tablename__ = 'enemy'

    id = Column(Integer(), primary_key=True)

    """
    The user to whom this player character belongs.
    """

    user_id = Column(Integer(), ForeignKey("user.id"))
    user = relationship("UserModel")

    name = Column(String(), unique=True, nullable=False)
    max_hp = Column(String(), nullable=False)

    @classmethod
    def from_name(cls, player: str, max_hp: int, user_id: int):
        c = cls()
        c.name = player
        c.max_hp = max_hp
        c.user_id = user_id
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

