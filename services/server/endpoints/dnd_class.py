import json
from io import BytesIO
from json import JSONDecodeError

from flask import request

from endpoints import api, json_api, require_login
from lib.service import background_service, class_service
from lib.user_session import session_user
import zipfile


@api.route('/classes', methods=["GET"])
@json_api()
@require_login()
def get_classes():
    classes = class_service.get_classes()
    return [cls.to_json() for cls in classes]


@api.route('/classes', methods=["POST"])
@json_api()
@require_login()
def update_classes():
    user = session_user()

    archive = request.files.get("archive", None)

    if archive is None:
        data = [request.get_json()]
    else:
        zip_binary = BytesIO(archive.read())
        assert zipfile.is_zipfile(zip_binary)
        zf = zipfile.ZipFile(zip_binary, "r")

        data = []
        for class_file in zf.filelist:
            if not class_file.filename.endswith(".json"):
                continue
            data_str = zf.read(class_file)
            try:
                data.append(json.loads(data_str.decode("utf8")))
            except JSONDecodeError as e:
                return e, 403

    class_objects = class_service.create_classes(user, data)
    return [cls.to_json() for cls in class_objects], 201


@api.route('classes/<string:class_name>', methods=["GET"])
@json_api()
@require_login()
def get_class_by_name(class_name):
    cls = class_service.get_class_by_name(class_name)
    return cls.to_json()


@api.route('classes/<int:class_id>', methods=["GET"])
@json_api()
@require_login()
def get_class_by_id(class_id):
    cls = class_service.get_class_by_id(class_id)
    return cls.to_json()


@api.route('/backgrounds', methods=["GET"])
@json_api()
@require_login()
def get_backgrounds():
    backgrounds = background_service.get_backgrounds()
    return [background.to_json() for background in backgrounds]
