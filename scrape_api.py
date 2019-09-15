from collections import defaultdict

import requests

from server.lib.model.models import ItemModel, WeaponModel
from server.lib.repository import player_repository


def convert_copper(obj):
    if obj["unit"] == "gp":
        return obj["quantity"] * 100 * 100
    if obj["unit"] == "sp":
        return obj["quantity"] * 100
    if obj["unit"] == "cp":
        return obj["quantity"]


def main():
    result = requests.get("http://www.dnd5eapi.co/api/equipment/")
    obj = result.json()

    for elem in obj["results"]:
        item = requests.get(elem["url"]).json()

        # All unknown elements will return None instead of error.
        item_model = ItemModel.from_name(item["name"])

        item_model.category = item["equipment_category"]
        item_model.cost = convert_copper(item["cost"])
        item_model.weight = item.get("weight", 0)

        player_repository.add_and_commit(item_model)

        # Add extra weapon properties
        if item_model.category == "Weapon":
            weapon_model = WeaponModel.from_item(item_model)

            dmg = item.get("damage", None)

            # Not all items have all sub-JSON objects, so continue with the next item if that is the case.
            if dmg is not None:
                weapon_model.dice_amount = dmg["dice_count"]
                weapon_model.dice_type = dmg["dice_value"]
                weapon_model.damage_type = dmg["damage_type"]["name"]

            item_range = item.get("range", None)
            if item_range is not None:
                weapon_model.range_normal = item_range["normal"]
                weapon_model.range_long = item_range["long"]

            throw_range = item.get("throw_range", None)
            if throw_range is not None:
                weapon_model.throw_range_normal = throw_range["normal"]
                weapon_model.throw_range_long = throw_range["long"]

            player_repository.add_and_commit(weapon_model)


if __name__ == "__main__":
    main()
