from __future__ import unicode_literals, absolute_import

import argparse


def get_args():
    parser = argparse.ArgumentParser(description="Start a server")

    parser.add_argument("--port", type=int, help="Force a port to run the sever on.", default=5000)
    parser.add_argument("--host", type=str, help="Change host to run the server on.", default='127.0.0.1')
    parser.add_argument("--context", type=str, help="Allows to add ssl certificate.", default=None)
    return parser.parse_args()


def create_schema():
    from lib.model import models
    from sqlalchemy_schemadisplay import create_uml_graph
    from sqlalchemy.orm import class_mapper

    # lets find all the mappers in our model
    mappers = []
    for attr in dir(models):
        if attr[0] == '_':
            continue
        try:
            cls = getattr(models, attr)
            mappers.append(class_mapper(cls))
        except:
            pass

    # pass them to the function and set some formatting options
    graph = create_uml_graph(mappers,
                             show_operations=False,  # not necessary in this case
                             show_multiplicity_one=False  # some people like to see the ones, some don't
                             )
    graph.write_png('schema/schema.png')  # write out the file


def create_documentation():
    pass


if __name__ == "__main__":
    args = get_args()

    from services import server

    try:
        create_schema()
    except:
        pass

    create_documentation()

    # server.app.run(ssl_context='adhoc', threaded=True, host=args.host, port=args.port)
    server.app.run(threaded=True, host="0.0.0.0", port=args.port)
