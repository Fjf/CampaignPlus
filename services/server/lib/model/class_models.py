import json
from typing import Any

from sqlalchemy import Integer, Column, String, ForeignKey, JSON
from sqlalchemy.orm import relationship

from lib.database import OrmModelBase
from lib.model.models import UserModel


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

    name = Column(String())
    data = Column(JSON())

    def __init__(self, owner: UserModel = None, *args: Any, **kwargs: Any):
        super().__init__(*args, **kwargs)
        if owner:
            self.owner_id = owner.id
        else:
            self.owner_id = None

    def to_json(self):
        if type(self.data) == dict:
            data = self.data
        else:
            data = json.loads(self.data)
        data["name"] = self.name
        data["id"] = self.id
        data["owner_id"] = self.owner_id
        data["owner_name"] = self.owner.name if self.owner is not None else ""
        return data


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

    main_class_name = Column(String(), ForeignKey(ClassModel.name), nullable=False)
    main_class = relationship("ClassModel")

    name = Column(String(), nullable=False)

    info = Column(String(), nullable=True)

    def to_json(self):
        if type(self.info) == dict:
            data = self.info
        else:
            data = json.loads(self.info)
        data["id"] = self.id
        data["owner_id"] = self.owner_id
        data["main_class_name"] = self.main_class_name
        data["main_class_id"] = self.main_class.id
        data["owner_name"] = self.owner.name if self.owner is not None else ""
        return data


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
