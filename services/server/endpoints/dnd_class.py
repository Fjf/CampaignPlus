from endpoints import api, json_api, require_login
from lib.repository import class_repository


@api.route('/classes', methods=["GET"])
@json_api()
@require_login()
def get_classes():
    classes = class_repository.get_classes()
    return [cls.to_json() for cls in classes]


@api.route('classes/<string:class_name>', methods=["GET"])
@json_api()
@require_login()
def get_class_by_name(class_name):
    cls = class_repository.get_class_by_name(class_name)
    return cls.to_json()


@api.route('classes/<int:class_id>', methods=["GET"])
@json_api()
@require_login()
def get_class_by_id(class_id):
    cls = class_repository.get_class_by_id(class_id)
    return cls.to_json()



