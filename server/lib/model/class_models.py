from sqlalchemy import Integer, Column, String, ForeignKey
from sqlalchemy.orm import relationship

from server.lib.database import OrmModelBase
from server.lib.model.models import UserModel, PlayerModel


class ClassModel(OrmModelBase):
    """
    This class data model which contains all information about a playable dnd class.

    A class may have an owner, if it has no owner it is visible by default for everybody.
    If a class does have an owner, only they may edit the custom class.
    """

    __tablename__ = 'class'

    id = Column(Integer(), primary_key=True)

    owner_id = Column(Integer(), ForeignKey(UserModel.id), nullable=True)
    owner = relationship("UserModel")

    name = Column(String(), nullable=False)
    hit_die = Column(Integer(), nullable=False)

    table = Column(String(), nullable=True)

    info = Column(String(), nullable=True)

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

        }


class SubClassModel(OrmModelBase):
    """
    This subclass data model which contains all information about a playable dnd subclass .

    A subclass may have an owner, if it has no owner it is visible by default for everybody.
    If a subclass does have an owner, only they may edit the custom subclass.
    """

    __tablename__ = 'subclass'

    id = Column(Integer(), primary_key=True)

    owner_id = Column(Integer(), ForeignKey(UserModel.id), nullable=True)
    owner = relationship("UserModel")

    main_class_id = Column(Integer(), ForeignKey(ClassModel.id), nullable=False)
    main_class = relationship("ClassModel")

    name = Column(String(), nullable=False)

    info = Column(String(), nullable=True)

    @classmethod
    def from_class_user(cls, main_class: ClassModel, owner: UserModel = None):
        c = cls()
        c.main_class_id = main_class.id
        c.owner_id = owner.id if owner else None
        return c


class PlayerClassModel(OrmModelBase):
    """
    This class data model which contains all information about a playable dnd class.

    A class may have an owner, if it has no owner it is visible by default for everybody.
    If a class does have an owner, only they may edit the custom class.
    """

    __tablename__ = 'player_class'

    id = Column(Integer(), primary_key=True)

    player_id = Column(Integer(), ForeignKey(PlayerModel.id), nullable=False)
    player = relationship("PlayerModel")

    main_class_id = Column(Integer(), ForeignKey(ClassModel.id), nullable=False)
    main_class = relationship("ClassModel")

    @classmethod
    def from_player_class(cls, player: PlayerModel, main_class: ClassModel):
        c = cls()
        c.player_id = player.id
        c.main_class_id = main_class.id
        return c


class PlayerSubClassModel(OrmModelBase):
    """
    This subclass data model which contains all information about a playable dnd subclass .

    A subclass may have an owner, if it has no owner it is visible by default for everybody.
    If a subclass does have an owner, only they may edit the custom subclass.
    """

    __tablename__ = 'player_subclass'

    id = Column(Integer(), primary_key=True)

    player_id = Column(Integer(), ForeignKey(PlayerModel.id), nullable=False)
    player = relationship("PlayerModel")

    subclass_id = Column(Integer(), ForeignKey(SubClassModel.id), nullable=False)
    subclass = relationship("SubClassModel")

    @classmethod
    def from_subclass_player(cls, player: PlayerModel, sub_class: SubClassModel):
        c = cls()
        c.player_id = player.id
        c.subclass_id = sub_class.id
        return c


class ClassAbilityModel(OrmModelBase):
    """
    A class ability model stores all information about class abilities.
    Class abilities contain a level, and information about the ability itself.

    A class ability model may be linked to either a main class, or a subclass.
    """

    __tablename__ = 'class_abilities'

    id = Column(Integer(), primary_key=True)

    main_class_id = Column(Integer(), ForeignKey(ClassModel.id), nullable=True)
    main_class = relationship("ClassModel")

    sub_class_id = Column(Integer(), ForeignKey(SubClassModel.id), nullable=True)
    sub_class = relationship("SubClassModel")

    name = Column(String(), nullable=False)

    level = Column(Integer(), nullable=False)

    info = Column(String(), nullable=True)

    @classmethod
    def from_main_class(cls, main_class: ClassModel):
        c = cls()
        c.main_class_id = main_class.id
        return c

    @classmethod
    def from_sub_class(cls, sub_class: SubClassModel):
        c = cls()
        c.sub_class_id = sub_class.id
        return c

    def to_json(self):
        return {
            "id": self.id,
            "main_class_id": self.main_class_id,
            "sub_class_id": self.sub_class_id,
            "level": self.level,
            "name": self.name,
            "info": self.info
        }


class ClassShareModel(OrmModelBase):
    """
    To have a custom class show to more than one user, an entry to the class share table has to be made.
    The class share table links a user to a custom class.
    """

    __tablename__ = 'class_share'

    id = Column(Integer(), primary_key=True)

    main_class_id = Column(Integer(), ForeignKey(ClassModel.id), nullable=False)
    main_class = relationship("ClassModel")

    user_id = Column(Integer(), ForeignKey(UserModel.id), nullable=False)
    user = relationship("UserModel")

    @classmethod
    def from_class_user(cls, main_class: ClassModel, user: UserModel):
        c = cls()
        c.main_class_id = main_class.id
        c.user_id = user.id
        return c


class SubClassShareModel(OrmModelBase):
    """
    To have a custom subclass show to more than one user, an entry to the subclass share table has to be made.
    The subclass share table links a user to a custom subclass.
    """

    __tablename__ = 'subclass_share'

    id = Column(Integer(), primary_key=True)

    sub_class_id = Column(Integer(), ForeignKey(SubClassModel.id), nullable=False)
    sub_class = relationship("SubClassModel")

    user_id = Column(Integer(), ForeignKey(UserModel.id), nullable=False)
    user = relationship("UserModel")

    @classmethod
    def from_subclass_user(cls, sub_class: SubClassModel, user: UserModel):
        c = cls()
        c.sub_class_id = sub_class.id
        c.user_id = user.id
        return c
