import argparse


def get_args():
    parser = argparse.ArgumentParser(description="Start a server")

    parser.add_argument("--port", type=int, help="Force a port to run the sever on.", default=5000)
    parser.add_argument("--host", type=str, help="Change host to run the server on.", default='127.0.0.1')
    return parser.parse_args()


if __name__ == "__main__":
    args = get_args()

    import server

    server.app.run(threaded=True, host=args.host, port=args.port)
