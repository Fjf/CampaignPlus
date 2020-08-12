from endpoints import api, json_api, require_login
from lib.repository import class_repository


@api.route('/classes', methods=["GET"])
@json_api()
@require_login()
def get_classes():
    classes = class_repository.get_classes()
    return [class_.to_json() for class_ in classes]


@api.route('classes/<string:class_name>', methods=["GET"])
@json_api()
@require_login()
def get_class_by_name(class_name):
    print(class_name, type(class_name))
    class_ = class_repository.get_class_by_name(class_name)
    return class_.to_json()

@api.route('classes/<int:class_id>', methods=["GET"])
@json_api()
@require_login()
def get_class_by_id(class_id):
    class_ = class_repository.get_class_by_id(class_id)
    return class_.to_json()



