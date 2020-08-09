import DoubleCheckbox from "../DoubleCheckbox";
import React from "react";


function CharacterProficiencies(props) {
    const characterInfo = props.info;
    const proficiencies = props.proficiencies;
    const setProficiencies = props.setProficiencies;

    function getBonus(value) {
        return Math.floor((value - 10) / 2);
    }

    function getProficiencyBonus() {
        return Math.round((characterInfo.level - 1) / 4) + 2;
    }

    function getSkillModifier(stat, prof) {
        let bonus;
        if (stat === "int") bonus = getBonus(characterInfo.intelligence);
        if (stat === "cha") bonus = getBonus(characterInfo.charisma);
        if (stat === "str") bonus = getBonus(characterInfo.strength);
        if (stat === "dex") bonus = getBonus(characterInfo.dexterity);
        if (stat === "con") bonus = getBonus(characterInfo.constitution);
        if (stat === "wis") bonus = getBonus(characterInfo.wisdom);
        return bonus + prof * getProficiencyBonus();
    }


    return <div className={"proficiencies-column"}>
        <div className={"stats-duo"}>
                        <span
                            title={"Dexterity"}>Acrobatics ({getSkillModifier("dex", proficiencies.acrobatics)})</span>
            <DoubleCheckbox
                value={proficiencies.acrobatics}
                onClick={(e) => {
                    setProficiencies({
                        ...proficiencies,
                        acrobatics: e.target.value
                    })
                }}
            />
        </div>
        <div className={"stats-duo"}>
                        <span
                            title={"Wisdom"}>Animal Handling ({getSkillModifier("wis", proficiencies.animal_handling)})</span>
            <DoubleCheckbox
                value={proficiencies.animal_handling}
                onClick={(e) => {
                    setProficiencies({
                        ...proficiencies,
                        animal_handling: e.target.value

                    })
                }}
            />
        </div>
        <div className={"stats-duo"}>
                        <span
                            title={"Intelligence"}>Arcana ({getSkillModifier("int", proficiencies.arcana)})</span>
            <DoubleCheckbox
                value={proficiencies.arcana}
                onClick={(e) => {
                    setProficiencies({
                        ...proficiencies,
                        arcana: e.target.value

                    })
                }}
            />
        </div>
        <div className={"stats-duo"}>
                        <span
                            title={"Strength"}>Athletics ({getSkillModifier("str", proficiencies.athletics)})</span>
            <DoubleCheckbox
                value={proficiencies.athletics}
                onClick={(e) => {
                    setProficiencies({
                        ...proficiencies,
                        athletics: e.target.value

                    })
                }}
            />
        </div>
        <div className={"stats-duo"}>
                        <span
                            title={"Charisma"}>Deception ({getSkillModifier("cha", proficiencies.deception)})</span>
            <DoubleCheckbox
                value={proficiencies.deception}
                onClick={(e) => {
                    setProficiencies({
                        ...proficiencies,
                        deception: e.target.value

                    })
                }}
            />
        </div>
        <div className={"stats-duo"}>
                        <span
                            title={"Intelligence"}>History ({getSkillModifier("int", proficiencies.history)})</span>
            <DoubleCheckbox
                value={proficiencies.history}
                onClick={(e) => {
                    setProficiencies({
                        ...proficiencies,
                        history: e.target.value

                    })
                }}
            />
        </div>
        <div className={"stats-duo"}>
                        <span
                            title={"Wisdom"}>Insight ({getSkillModifier("wis", proficiencies.insight)})</span>
            <DoubleCheckbox
                value={proficiencies.insight}
                onClick={(e) => {
                    setProficiencies({
                        ...proficiencies,
                        insight: e.target.value

                    })
                }}
            />
        </div>
        <div className={"stats-duo"}>
                        <span
                            title={"Charisma"}>Intimidation ({getSkillModifier("cha", proficiencies.intimidation)})</span>
            <DoubleCheckbox
                value={proficiencies.intimidation}
                onClick={(e) => {
                    setProficiencies({
                        ...proficiencies,
                        intimidation: e.target.value

                    })
                }}
            />
        </div>
        <div className={"stats-duo"}>
                        <span
                            title={"Intelligence"}>Investigation ({getSkillModifier("int", proficiencies.investigation)})</span>
            <DoubleCheckbox
                value={proficiencies.investigation}
                onClick={(e) => {
                    setProficiencies({
                        ...proficiencies,
                        investigation: e.target.value

                    })
                }}
            />
        </div>
        <div className={"stats-duo"}>
                        <span
                            title={"Wisdom"}>Medicine ({getSkillModifier("wis", proficiencies.medicine)})</span>
            <DoubleCheckbox
                value={proficiencies.medicine}
                onClick={(e) => {
                    setProficiencies({
                        ...proficiencies,
                        medicine: e.target.value

                    })
                }}
            />
        </div>
        <div className={"stats-duo"}>
                        <span
                            title={"Intelligence"}>Nature ({getSkillModifier("int", proficiencies.nature)})</span>
            <DoubleCheckbox
                value={proficiencies.nature}
                onClick={(e) => {
                    setProficiencies({
                        ...proficiencies,
                        nature: e.target.value

                    })
                }}
            />
        </div>
        <div className={"stats-duo"}>
                        <span
                            title={"Wisdom"}>Perception ({getSkillModifier("wis", proficiencies.perception)})</span>
            <DoubleCheckbox
                value={proficiencies.perception}
                onClick={(e) => {
                    setProficiencies({
                        ...proficiencies,
                        perception: e.target.value

                    })
                }}
            />
        </div>
        <div className={"stats-duo"}>
                        <span
                            title={"Charisma"}>Performance ({getSkillModifier("cha", proficiencies.performance)})</span>
            <DoubleCheckbox
                value={proficiencies.performance}
                onClick={(e) => {
                    setProficiencies({
                        ...proficiencies,
                        performance: e.target.value

                    })
                }}
            />
        </div>

        <div className={"stats-duo"}>
                        <span
                            title={"Charisma"}>Persuasion ({getSkillModifier("cha", proficiencies.persuasion)})</span>
            <DoubleCheckbox
                value={proficiencies.persuasion}
                onClick={(e) => {
                    setProficiencies({
                        ...proficiencies,
                        persuasion: e.target.value

                    })
                }}
            />

        </div>
        <div className={"stats-duo"}>
                        <span
                            title={"Intelligence"}>Religion ({getSkillModifier("int", proficiencies.religion)})</span>
            <DoubleCheckbox
                value={proficiencies.religion}
                onClick={(e) => {
                    setProficiencies({
                        ...proficiencies,
                        religion: e.target.value

                    })
                }}
            />

        </div>
        <div className={"stats-duo"}>
                        <span
                            title={"Dexterity"}>Sleight of Hand({getSkillModifier("dex", proficiencies.sleight_of_hand)})</span>
            <DoubleCheckbox
                value={proficiencies.sleight_of_hand}
                onClick={(e) => {
                    setProficiencies({
                        ...proficiencies,
                        sleight_of_hand: e.target.value

                    })
                }}
            />

        </div>


        <div className={"stats-duo"}>
                        <span
                            title={"Dexterity"}>Stealth ({getSkillModifier("dex", proficiencies.stealth)})</span>
            <DoubleCheckbox
                value={proficiencies.stealth}
                onClick={(e) => {
                    setProficiencies({
                        ...proficiencies,
                        stealth: e.target.value

                    })
                }}
            />
        </div>
        <div className={"stats-duo"}>
                        <span
                            title={"Wisdom"}>Survival ({getSkillModifier("wis", proficiencies.survival)})</span>
            <DoubleCheckbox
                value={proficiencies.survival}
                onClick={(e) => {
                    setProficiencies({
                        ...proficiencies,
                        survival: e.target.value

                    })
                }}
            />
        </div>
    </div>
}

export default React.memo(CharacterProficiencies);