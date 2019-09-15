from collections import defaultdict

import requests

from server.lib.model.models import ItemModel, WeaponModel, SpellModel
from server.lib.repository import player_repository, repository


def convert_copper(obj):
    if obj["unit"] == "gp":
        return obj["quantity"] * 100 * 100
    if obj["unit"] == "sp":
        return obj["quantity"] * 100
    if obj["unit"] == "cp":
        return obj["quantity"]


def get_equipment():
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


def get_spells():
    result = requests.get("http://www.dnd5eapi.co/api/spells/")
    obj = result.json()

    for elem in obj["results"]:
        spell = requests.get(elem["url"]).json()

        spell_model = SpellModel.from_name(spell["name"])

        spell_model.playthrough_id = -1

        description = ""
        # TODO: Maybe make a better database structure to support multi line descriptions.
        for desc in spell["desc"]:
            description += desc + "\n"
        spell_model.description = description

        spell_model.phb_page = int(spell["page"].split(" ")[1])
        spell_model.spell_range = spell["range"]
        spell_model.components = ", ".join([component for component in spell["components"]])

        spell_model.material = spell.get("material", None)
        spell_model.level = spell["level"]
        spell_model.ritual = spell["ritual"] == "yes"
        spell_model.duration = spell["duration"]
        spell_model.concentration = spell["concentration"] == "yes"
        spell_model.casting_time = spell["casting_time"]
        spell_model.higher_level = "\n".join([text for text in spell.get("higher_level", [])])

        spell_model.school = spell["school"]["name"]
        repository.add_and_commit(spell_model)


def main():
    # get_equipment()
    get_spells()


if __name__ == "__main__":
    main()
