from server.lib.database import request_session


def add_and_commit(generic):
    db = request_session()

    db.add(generic)
    db.commit()
