from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from server.lib.database import OrmModelBase


class UserModel(OrmModelBase):
    """
    A user login model.
    """

    __tablename__ = 'user'

    id = Column(Integer(), primary_key=True)

    name = Column(String(), unique=True, nullable=False)
    password = Column(String(), nullable=False)

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
