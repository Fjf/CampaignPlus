from sqlalchemy import Column, Integer, String

from server.lib.database import OrmModelBase


class PlayerModel(OrmModelBase):
    """
    A User local to this server.
    It is for this server, so also has the credentials required for logging in and verification.
    """

    __tablename__ = 'players'

    id = Column(Integer(), primary_key=True)

    name = Column(String(), unique=True, nullable=False)
    class_name = Column(String(), nullable=False)

    @classmethod
    def from_name(cls, player: str, player_class: str):
        c = cls()
        c.name = player
        c.name = player
        c.class_name = player_class
        return c
