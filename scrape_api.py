import json
import os
import pprint
import re
from typing import List

import requests

from lib.database import request_session
from lib.model.class_models import ClassModel, ClassAbilityModel, SubClassModel
from lib.model.models import ItemModel, SpellModel, RaceModel, BackgroundModel
from lib.repository import player_repository, repository
from services.server import app


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
    db = request_session()

    for elem in obj["results"]:
        # item = requests.get("http://www.dnd5eapi.co/api/equipment/dagger").json()
        item = requests.get("http://www.dnd5eapi.co" + elem["url"]).json()

        # All unknown elements will return None instead of error.
        item_model = ItemModel(item["name"])

        item_model.category = item["equipment_category"]["name"]
        item_model.cost = convert_copper(item["cost"])
        item_model.weight = item.get("weight", 0)
        item_model.description = str(item.get("desc", []))

        if item_model.category == "Adventuring Gear":
            item_model.gear_category = item["gear_category"]

        db.add(item_model)
        db.commit()

        db.commit()


def get_spells():
    result = requests.get("http://www.dnd5eapi.co/api/spells/")
    obj = result.json()

    for elem in obj["results"]:
        spell = requests.get("http://www.dnd5eapi.co" + elem["url"]).json()

        spell_model = SpellModel.from_name(spell["name"])

        spell_model.campaign_id = -1

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


def clean_object(data):
    if type(data) == list:
        return [clean_object(entry) for entry in data]
    elif type(data) == dict:
        new_data = {}
        for key in data.keys():
            if key == "url" or key == "_id" or key == "index" or key == "class":
                continue
            new_data[key] = clean_object(data[key])
        return new_data
    else:
        return data


def get_classes():
    results = requests.get("https://www.dnd5eapi.co/api/classes").json()
    db = request_session()
    for result in results["results"]:
        data = requests.get("https://www.dnd5eapi.co" + result["url"]).json()

        eq = requests.get("https://www.dnd5eapi.co" + data["starting_equipment"]["url"]).json()
        data.update(clean_object(eq))

        eq = requests.get("https://www.dnd5eapi.co" + data["class_levels"]["url"]).json()
        data["class_levels"] = clean_object(eq)

        if "spellcasting" in data:
            eq = requests.get("https://www.dnd5eapi.co" + data["spellcasting"]["url"]).json()
            data["spellcasting"] = clean_object(eq)

        clean_data = clean_object(data)
        del clean_data["name"]
        clean_data = json.dumps(clean_data)

        class_model = ClassModel()
        class_model.name = data["name"]
        class_model.data = clean_data

        db.add(class_model)
    db.commit()


def get_table():
    result = requests.get("http://api.open5e.com/classes/")
    obj = result.json()

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


def get_races():
    result = requests.get("http://api.open5e.com/races/")
    obj = result.json()

    for result in obj['results']:
        racemodel = RaceModel.from_owner(owner=None)
        racemodel.name = result.get("name")
        racemodel.desc = result.get("desc")
        racemodel.age = result.get("age")
        racemodel.alignment = result.get("alignment")
        racemodel.size = result.get("size")
        racemodel.speed = result.get("speed")['walk']
        racemodel.speed_desc = result.get("speed_desc")
        racemodel.languages = result.get("languages")
        racemodel.vision = result.get("vision")
        racemodel.traits = result.get("traits")
        repository.add_and_commit(racemodel)

        # TODO handle subraces, asi, asi_desc and traits better


def get_backgrounds():
    result = requests.get("https://api.open5e.com/backgrounds/")
    obj = result.json()
    db = request_session()

    for result in obj["results"]:
        background_model = BackgroundModel(result.get("name"))

        background_model.desc = result.get("desc")
        background_model.skills = result.get("skill_proficiencies")
        background_model.tools = result.get("tool_proficiencies")
        background_model.languages = result.get("languages")
        background_model.equipment = result.get("equipment")
        background_model.feature = result.get("feature")
        background_model.feature_desc = result.get("feature_desc")

        db.add(background_model)
    db.commit()


def convert_class_abilities():
    db = request_session()

    for filename in os.listdir("storage/dnd_classes/"):
        fname = os.path.join("storage/dnd_classes/", filename)
        # checking if it is a file
        if not os.path.isfile(fname):
            continue

        with open(fname, "r") as f:
            class_dict = json.load(f)

        print("Loading", class_dict.get("name"))

        main_class = db.query(ClassModel).filter(ClassModel.name == class_dict.get("name")).one_or_none()
        main_class.data = class_dict
        db.commit()


def main():
    # get_equipment()
    # get_spells()
    # get_classes()
    # get_table()
    # get_races()
    # get_backgrounds()

    convert_class_abilities()
    pass


if __name__ == "__main__":
    main()
