"""
Shoutout to Floens.

This file contains all the function used for setting up the database and database routines.
"""

from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session

OrmModelBase = declarative_base()

_scoped_session = None
_session_cls = None
_engine = None


@contextmanager
def session():
    """
    A scoped database session that is alive only during the scopes lifetime.
    It is closed when it goes out of scope, possibly after an exception.
    For example:

    with session() as s:
        # s is only valid here

        s.add(some_obj)
        s.commit()
    """

    global _session_cls

    s = _session_cls()
    try:
        yield s
    except Exception:
        s.rollback()
        raise
    finally:
        s.close()


def request_session():
    """
    A database instance with a lifetime tied to the user request.
    The connection is closed when the response is sent.
    """
    return _scoped_session


def register_teardown(flask_app):
    @flask_app.teardown_appcontext
    def teardown_request(exception):
        # Called when the app context is destroyed, most often when the
        # request was completed.
        # It clears the scope that could be used in this request.
        global _scoped_session
        _scoped_session.remove()


def init_db(connect_string):
    """
    Initialise the database with the given connection string.
    :param connect_string: the connection string passed to create_engine,
    in the form of sqlite:///dblocation.db, could be another database engine
    such as postgres.
    """

    global _scoped_session
    global _session_cls
    global _engine
    global OrmModelBase

    _engine = create_engine(connect_string, echo=False)

    _session_cls = sessionmaker(autocommit=False, autoflush=False, bind=_engine)

    _scoped_session = scoped_session(_session_cls)


def metadata_create_all():
    """
    Create the tables for the database model.
    """

    OrmModelBase.metadata.create_all(_engine)
