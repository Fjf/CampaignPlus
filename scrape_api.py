import re
from collections import defaultdict

import requests

from server.lib.model.class_models import ClassModel, ClassAbilityModel, SubClassModel
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
        item = requests.get("http://www.dnd5eapi.co" + elem["url"]).json()

        # All unknown elements will return None instead of error.
        item_model = ItemModel.from_name(item["name"])

        item_model.category = item["equipment_category"]
        item_model.cost = convert_copper(item["cost"])
        item_model.weight = item.get("weight", 0)

        player_repository.add_and_commit(item_model)

        # Add extra weapon properties
        if item_model.category == "Weapon":
            weapon_model = WeaponModel.from_item(item_model)

            # Not all items have all sub-JSON objects, so continue with the next item if that is the case.
            dmg = item.get("damage", None)
            if dmg is not None:
                weapon_model.dice = dmg["damage_dice"]
                weapon_model.damage_bonus = dmg["damage_bonus"]
                weapon_model.damage_type = dmg["damage_type"]["name"]

            dmg = item.get("2h_damage", None)
            if dmg is not None:
                weapon_model.two_dice = dmg["damage_dice"]
                weapon_model.two_damage_bonus = dmg["damage_bonus"]
                weapon_model.two_damage_type = dmg["damage_type"]["name"]

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
        spell = requests.get("http://www.dnd5eapi.co" + elem["url"]).json()

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


def get_classes():
    result = requests.get("http://api.open5e.com/classes/")
    obj = result.json()

    for ctype in obj["results"]:
        classmodel = ClassModel.from_owner(owner=None)

        classmodel.name = ctype.get("name")
        classmodel.hit_die = ctype.get("hit_dice")
        classmodel.info = ""

        repository.add_and_commit(classmodel)

        abilities = ctype.get("desc")

        groups = re.split("\n### ", abilities)

        for group in groups:
            if len(group.strip()) == 0:
                continue

            d = group.split(sep=" \n", maxsplit=1)
            name = d[0]
            text = d[1]

            ability_model = ClassAbilityModel.from_main_class(classmodel)
            ability_model.info = text
            ability_model.name = name
            ability_model.level = 0

            repository.add_and_commit(ability_model)

        for archetype in ctype.get("archetypes"):
            subclass = SubClassModel.from_class_user(classmodel, owner=None)

            subclass.name = archetype.get("name")
            subclass.info = ""

            repository.add_and_commit(subclass)

            abilities = archetype.get("desc")

            groups = re.split("##### ", abilities)

            for group in groups:
                if len(group.strip()) == 0:
                    continue

                d = group.split(sep=" \n", maxsplit=1)
                name = d[0]
                text = d[1]

                ability_model = ClassAbilityModel.from_sub_class(subclass)
                ability_model.info = text
                ability_model.name = name
                ability_model.level = 0

                repository.add_and_commit(ability_model)


def update_class_levels():
    from server.lib.database import request_session
    from typing import List
    db = request_session()

    abilities: List[ClassAbilityModel] = db.query(ClassAbilityModel).all()

    for ability in abilities:
        levels = re.findall("(\d+).. level", ability.info)
        if not levels:
            continue

        level = int(levels[0])
        ability.level = level

        repository.add_and_commit(ability)


def get_table():
    result = requests.get("http://api.open5e.com/classes/")
    obj = result.json()

    from server.lib.database import request_session
    db = request_session()

    from typing import List
    models: List[ClassModel] = db.query(ClassModel).all()

    for result in obj['results']:
        tbl = result.get("table")
        name = result.get("name")

        model = next(model for model in models if model.name == name)

        rows = tbl.split("\n")
        headers = rows[0].split("|")
        rows = [row.split("|") for row in rows[2:]]

        data = dict()
        for i, header in enumerate(headers):
            data[header.strip()] = [row[i].strip() for row in rows]

        model.table = str(data)

    db.commit()


def main():
    # get_equipment()
    # get_spells()
    # get_classes()
    # update_class_levels()
    # get_table()
    pass


if __name__ == "__main__":
    main()
