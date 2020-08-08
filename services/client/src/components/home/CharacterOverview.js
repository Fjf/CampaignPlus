import React from "react";
import {characterService} from "../services/characterService";
import {Checkbox, SvgIcon, TextField} from "@material-ui/core";
import "../../styles/profile.scss";
import {
    BsDiamond,
    BsDiamondFill,
    FaPlusCircle,
    FaTrash, GoArrowDown,
    GoArrowLeft,
    GoArrowRight, GoArrowSmallDown, GoArrowSmallUp, GoArrowUp,
    MdClose,
    MdSave
} from "react-icons/all";
import IconButton from "@material-ui/core/IconButton";
import {campaignService} from "../services/campaignService";
import DoubleCheckbox from "./DoubleCheckbox";
import SpellInfo from "./infoComponents/SpellInfo";
import SpellsList from "./infoComponents/SpellsList";

export default function CharacterOverview(props) {
    const character = props.character;
    const [characterInfo, setCharacterInfo] = React.useState(null);
    const [characterSpells, setCharacterSpells] = React.useState([]);
    const [notEditing, setNotEditing] = React.useState(false);
    const [selectedSpell, setSelectedSpell] = React.useState(null);
    const [showSpellsList, setShowSpellsList] = React.useState(false);

    React.useEffect(() => {
        characterService.getCharacterInfo(character.id).then(r => {
            setCharacterInfo(r);
        });
        characterService.getCharacterSpells(character.id).then(r => {
            setCharacterSpells(r);
        }, e => {
            console.error(e);
        })
    }, [character]);

    function deleteCharacter() {
        if (prompt("Are you sure you want to delete this character? Type the name of the character to continue deleting.") === character.name) {
            characterService.del(character.id).then(r => {
                // props.setCampaigns(r);
                // setSelectedCampaign(null);
                // getPlayers();
                props.reset();
            })
        }
    }

    function getBonus(value) {
        return Math.floor((value - 10) / 2);
    }

    function getProficiencyBonus() {
        return Math.round((characterInfo.info.level - 1) / 4) + 2;
    }

    function getSkillModifier(stat, prof) {
        if (characterInfo === null) return 0;
        let bonus;
        if (stat === "int") bonus = getBonus(characterInfo.info.intelligence);
        if (stat === "cha") bonus = getBonus(characterInfo.info.charisma);
        if (stat === "str") bonus = getBonus(characterInfo.info.strength);
        if (stat === "dex") bonus = getBonus(characterInfo.info.dexterity);
        if (stat === "con") bonus = getBonus(characterInfo.info.constitution);
        if (stat === "wis") bonus = getBonus(characterInfo.info.wisdom);
        return bonus + prof * getProficiencyBonus();
    }

    function saveChanges() {
        characterService.save(characterInfo).then(r => {
            console.log(r);
        })
    }

    return <div className={"main-content"}>
        <div className={"icon-bar"} style={{top: "8px", right: "8px", position: "absolute"}}>
            <IconButton
                onClick={saveChanges}
            >
                <MdSave/>
            </IconButton>
            <IconButton
                onClick={deleteCharacter}
            >
                <FaTrash/>
            </IconButton>
        </div>
        {characterInfo === null ? null :
            <>
                <div className={"stats-column"}>
                    <div className={"standard-bar-entry"}>
                        <IconButton size={"small"} onClick={e => setCharacterInfo({
                            ...characterInfo,
                            info: {
                                ...characterInfo.info,
                                level: Math.max(1, characterInfo.info.level - 1)
                            }
                        })}><GoArrowDown/></IconButton>
                        <h3>lvl</h3>
                        <IconButton size={"small"} onClick={e => setCharacterInfo({
                            ...characterInfo,
                            info: {
                                ...characterInfo.info,
                                level: Math.min(20, characterInfo.info.level + 1)
                            }
                        })}><GoArrowUp/></IconButton>
                    </div>
                    <div className={"level-stat"}>
                        {characterInfo.info.level}
                    </div>
                    <div><h3>Proficiency</h3></div>
                    <div className={"proficiency-stat"}>
                        {getProficiencyBonus()}
                    </div>
                    <div>Strength</div>
                    <div className={"stats-duo"}>
                        <TextField
                            disabled={notEditing}
                            value={characterInfo.info.strength}
                            onChange={(e) => setCharacterInfo({
                                ...characterInfo,
                                info: {
                                    ...characterInfo.info,
                                    strength: e.target.value
                                }
                            })}
                        />
                        <Checkbox
                            disabled={notEditing}
                            value={characterInfo.saving_throws_str}
                            size={"small"}
                            icon={<BsDiamond/>}
                            checkedIcon={<BsDiamondFill/>}
                            onChange={(e) => setCharacterInfo({
                                ...characterInfo,
                                info: {
                                    ...characterInfo.info,
                                    saving_throws_str: e.target.value
                                }
                            })}
                        />
                    </div>
                    <div>Dexterity</div>
                    <div className={"stats-duo"}>
                        <TextField
                            disabled={notEditing}
                            value={characterInfo.info.dexterity}
                            onChange={(e) => setCharacterInfo({
                                ...characterInfo,
                                info: {
                                    ...characterInfo.info,
                                    dexterity: e.target.value
                                }
                            })}
                        />
                        <Checkbox
                            disabled={notEditing}
                            value={characterInfo.saving_throws_dex}
                            size={"small"}
                            icon={<BsDiamond/>}
                            checkedIcon={<BsDiamondFill/>}
                            onChange={(e) => setCharacterInfo({
                                ...characterInfo,
                                info: {
                                    ...characterInfo.info,
                                    saving_throws_dex: e.target.value
                                }
                            })}
                        />
                    </div>
                    <div>Constitution</div>
                    <div className={"stats-duo"}>
                        <TextField
                            disabled={notEditing}
                            value={characterInfo.info.constitution}
                            onChange={(e) => setCharacterInfo({
                                ...characterInfo,
                                info: {
                                    ...characterInfo.info,
                                    constitution: e.target.value
                                }
                            })}
                        />
                        <Checkbox
                            disabled={notEditing}
                            value={characterInfo.saving_throws_con}
                            size={"small"}
                            icon={<BsDiamond/>}
                            checkedIcon={<BsDiamondFill/>}
                            onChange={(e) => setCharacterInfo({
                                ...characterInfo,
                                info: {
                                    ...characterInfo.info,
                                    saving_throws_con: e.target.value
                                }
                            })}
                        />
                    </div>
                    <div>Intelligence</div>
                    <div className={"stats-duo"}>
                        <TextField
                            disabled={notEditing}
                            value={characterInfo.info.intelligence}
                            onChange={(e) => setCharacterInfo({
                                ...characterInfo,
                                info: {
                                    ...characterInfo.info,
                                    intelligence: e.target.value
                                }
                            })}
                        />
                        <Checkbox
                            disabled={notEditing}
                            value={characterInfo.saving_throws_int}
                            size={"small"}
                            icon={<BsDiamond/>}
                            checkedIcon={<BsDiamondFill/>}
                            onChange={(e) => setCharacterInfo({
                                ...characterInfo,
                                info: {
                                    ...characterInfo.info,
                                    saving_throws_int: e.target.value
                                }
                            })}
                        />
                    </div>
                    <div>Wisdom</div>
                    <div className={"stats-duo"}>
                        <TextField
                            disabled={notEditing}
                            value={characterInfo.info.wisdom}
                            onChange={(e) => setCharacterInfo({
                                ...characterInfo,
                                info: {
                                    ...characterInfo.info,
                                    wisdom: e.target.value
                                }
                            })}
                        />
                        <Checkbox
                            disabled={notEditing}
                            value={characterInfo.saving_throws_wis}
                            size={"small"}
                            icon={<BsDiamond/>}
                            checkedIcon={<BsDiamondFill/>}
                            onChange={(e) => setCharacterInfo({
                                ...characterInfo,
                                info: {
                                    ...characterInfo.info,
                                    saving_throws_wis: e.target.value
                                }
                            })}
                        />
                    </div>
                    <div>Charisma</div>
                    <div className={"stats-duo"}>
                        <TextField
                            disabled={notEditing}
                            value={characterInfo.info.charisma}
                            onChange={(e) => setCharacterInfo({
                                ...characterInfo,
                                info: {
                                    ...characterInfo.info,
                                    charisma: e.target.value
                                }
                            })}
                        />
                        <Checkbox
                            disabled={notEditing}
                            value={characterInfo.saving_throws_cha}
                            size={"small"}
                            icon={<BsDiamond/>}
                            checkedIcon={<BsDiamondFill/>}
                            onChange={(e) => setCharacterInfo({
                                ...characterInfo,
                                info: {
                                    ...characterInfo.info,
                                    saving_throws_cha: e.target.value
                                }
                            })}
                        />
                    </div>
                </div>
                <div className={"proficiencies-column"}>
                    <div className={"stats-duo"}>
                        <span
                            title={"Dexterity"}>Acrobatics ({getSkillModifier("dex", characterInfo.proficiencies.acrobatics)})</span>
                        <DoubleCheckbox
                            value={characterInfo.proficiencies.acrobatics}
                            onClick={(e) => {
                                setCharacterInfo({
                                    ...characterInfo,
                                    proficiencies: {
                                        ...characterInfo.proficiencies,
                                        acrobatics: e.target.value
                                    }
                                })
                            }}
                        />
                    </div>
                    <div className={"stats-duo"}>
                        <span
                            title={"Wisdom"}>Animal Handling ({getSkillModifier("wis", characterInfo.proficiencies.animal_handling)})</span>
                        <DoubleCheckbox
                            value={characterInfo.proficiencies.animal_handling}
                            onClick={(e) => {
                                setCharacterInfo({
                                    ...characterInfo,
                                    proficiencies: {
                                        ...characterInfo.proficiencies,
                                        animal_handling: e.target.value
                                    }
                                })
                            }}
                        />
                    </div>
                    <div className={"stats-duo"}>
                        <span
                            title={"Intelligence"}>Arcana ({getSkillModifier("int", characterInfo.proficiencies.arcana)})</span>
                        <DoubleCheckbox
                            value={characterInfo.proficiencies.arcana}
                            onClick={(e) => {
                                setCharacterInfo({
                                    ...characterInfo,
                                    proficiencies: {
                                        ...characterInfo.proficiencies,
                                        arcana: e.target.value
                                    }
                                })
                            }}
                        />
                    </div>
                    <div className={"stats-duo"}>
                        <span
                            title={"Strength"}>Athletics ({getSkillModifier("str", characterInfo.proficiencies.athletics)})</span>
                        <DoubleCheckbox
                            value={characterInfo.proficiencies.athletics}
                            onClick={(e) => {
                                setCharacterInfo({
                                    ...characterInfo,
                                    proficiencies: {
                                        ...characterInfo.proficiencies,
                                        athletics: e.target.value
                                    }
                                })
                            }}
                        />
                    </div>
                    <div className={"stats-duo"}>
                        <span
                            title={"Charisma"}>Deception ({getSkillModifier("cha", characterInfo.proficiencies.deception)})</span>
                        <DoubleCheckbox
                            value={characterInfo.proficiencies.deception}
                            onClick={(e) => {
                                setCharacterInfo({
                                    ...characterInfo,
                                    proficiencies: {
                                        ...characterInfo.proficiencies,
                                        deception: e.target.value
                                    }
                                })
                            }}
                        />
                    </div>
                    <div className={"stats-duo"}>
                        <span
                            title={"Intelligence"}>History ({getSkillModifier("int", characterInfo.proficiencies.history)})</span>
                        <DoubleCheckbox
                            value={characterInfo.proficiencies.history}
                            onClick={(e) => {
                                setCharacterInfo({
                                    ...characterInfo,
                                    proficiencies: {
                                        ...characterInfo.proficiencies,
                                        history: e.target.value
                                    }
                                })
                            }}
                        />
                    </div>
                    <div className={"stats-duo"}>
                        <span
                            title={"Wisdom"}>Insight ({getSkillModifier("wis", characterInfo.proficiencies.insight)})</span>
                        <DoubleCheckbox
                            value={characterInfo.proficiencies.insight}
                            onClick={(e) => {
                                setCharacterInfo({
                                    ...characterInfo,
                                    proficiencies: {
                                        ...characterInfo.proficiencies,
                                        insight: e.target.value
                                    }
                                })
                            }}
                        />
                    </div>
                    <div className={"stats-duo"}>
                        <span
                            title={"Charisma"}>Intimidation ({getSkillModifier("cha", characterInfo.proficiencies.intimidation)})</span>
                        <DoubleCheckbox
                            value={characterInfo.proficiencies.intimidation}
                            onClick={(e) => {
                                setCharacterInfo({
                                    ...characterInfo,
                                    proficiencies: {
                                        ...characterInfo.proficiencies,
                                        intimidation: e.target.value
                                    }
                                })
                            }}
                        />
                    </div>
                    <div className={"stats-duo"}>
                        <span
                            title={"Intelligence"}>Investigation ({getSkillModifier("int", characterInfo.proficiencies.investigation)})</span>
                        <DoubleCheckbox
                            value={characterInfo.proficiencies.investigation}
                            onClick={(e) => {
                                setCharacterInfo({
                                    ...characterInfo,
                                    proficiencies: {
                                        ...characterInfo.proficiencies,
                                        investigation: e.target.value
                                    }
                                })
                            }}
                        />
                    </div>
                    <div className={"stats-duo"}>
                        <span
                            title={"Wisdom"}>Medicine ({getSkillModifier("wis", characterInfo.proficiencies.medicine)})</span>
                        <DoubleCheckbox
                            value={characterInfo.proficiencies.medicine}
                            onClick={(e) => {
                                setCharacterInfo({
                                    ...characterInfo,
                                    proficiencies: {
                                        ...characterInfo.proficiencies,
                                        medicine: e.target.value
                                    }
                                })
                            }}
                        />
                    </div>
                    <div className={"stats-duo"}>
                        <span
                            title={"Intelligence"}>Nature ({getSkillModifier("int", characterInfo.proficiencies.nature)})</span>
                        <DoubleCheckbox
                            value={characterInfo.proficiencies.nature}
                            onClick={(e) => {
                                setCharacterInfo({
                                    ...characterInfo,
                                    proficiencies: {
                                        ...characterInfo.proficiencies,
                                        nature: e.target.value
                                    }
                                })
                            }}
                        />
                    </div>
                    <div className={"stats-duo"}>
                        <span
                            title={"Wisdom"}>Perception ({getSkillModifier("wis", characterInfo.proficiencies.perception)})</span>
                        <DoubleCheckbox
                            value={characterInfo.proficiencies.perception}
                            onClick={(e) => {
                                setCharacterInfo({
                                    ...characterInfo,
                                    proficiencies: {
                                        ...characterInfo.proficiencies,
                                        perception: e.target.value
                                    }
                                })
                            }}
                        />
                    </div>
                    <div className={"stats-duo"}>
                        <span
                            title={"Charisma"}>Performance ({getSkillModifier("cha", characterInfo.proficiencies.performance)})</span>
                        <DoubleCheckbox
                            value={characterInfo.proficiencies.performance}
                            onClick={(e) => {
                                setCharacterInfo({
                                    ...characterInfo,
                                    proficiencies: {
                                        ...characterInfo.proficiencies,
                                        performance: e.target.value
                                    }
                                })
                            }}
                        />
                    </div>

                    <div className={"stats-duo"}>
                        <span
                            title={"Charisma"}>Persuasion ({getSkillModifier("cha", characterInfo.proficiencies.persuasion)})</span>
                        <DoubleCheckbox
                            value={characterInfo.proficiencies.persuasion}
                            onClick={(e) => {
                                setCharacterInfo({
                                    ...characterInfo,
                                    proficiencies: {
                                        ...characterInfo.proficiencies,
                                        persuasion: e.target.value
                                    }
                                })
                            }}
                        />

                    </div>
                    <div className={"stats-duo"}>
                        <span
                            title={"Intelligence"}>Religion ({getSkillModifier("int", characterInfo.proficiencies.religion)})</span>
                        <DoubleCheckbox
                            value={characterInfo.proficiencies.religion}
                            onClick={(e) => {
                                setCharacterInfo({
                                    ...characterInfo,
                                    proficiencies: {
                                        ...characterInfo.proficiencies,
                                        religion: e.target.value
                                    }
                                })
                            }}
                        />

                    </div>
                    <div className={"stats-duo"}>
                        <span
                            title={"Dexterity"}>Sleight of Hand({getSkillModifier("dex", characterInfo.proficiencies.sleight_of_hand)})</span>
                        <DoubleCheckbox
                            value={characterInfo.proficiencies.sleight_of_hand}
                            onClick={(e) => {
                                setCharacterInfo({
                                    ...characterInfo,
                                    proficiencies: {
                                        ...characterInfo.proficiencies,
                                        sleight_of_hand: e.target.value
                                    }
                                })
                            }}
                        />

                    </div>


                    <div className={"stats-duo"}>
                        <span
                            title={"Dexterity"}>Stealth ({getSkillModifier("dex", characterInfo.proficiencies.stealth)})</span>
                        <DoubleCheckbox
                            value={characterInfo.proficiencies.stealth}
                            onClick={(e) => {
                                setCharacterInfo({
                                    ...characterInfo,
                                    proficiencies: {
                                        ...characterInfo.proficiencies,
                                        stealth: e.target.value
                                    }
                                })
                            }}
                        />
                    </div>
                    <div className={"stats-duo"}>
                        <span
                            title={"Wisdom"}>Survival ({getSkillModifier("wis", characterInfo.proficiencies.survival)})</span>
                        <DoubleCheckbox
                            value={characterInfo.proficiencies.survival}
                            onClick={(e) => {
                                setCharacterInfo({
                                    ...characterInfo,
                                    proficiencies: {
                                        ...characterInfo.proficiencies,
                                        survival: e.target.value
                                    }
                                })
                            }}
                        />
                    </div>
                </div>
                <div className={"spells-wrapper"}>
                    <div className={"icon-bar"} style={{top: "8px", right: "8px", position: "absolute"}}>
                        <IconButton size={"small"} onClick={() => {
                            setShowSpellsList(!showSpellsList);
                        }}>
                            <FaPlusCircle/>
                        </IconButton>
                    </div>
                    <h3>Spells</h3>
                    <div className={"spells-list"}>
                        {characterSpells.map((spell, i) => {
                            return <div key={i} className={"standard-bar-entry"}>
                                <div style={{flex: 1}} onClick={() => setSelectedSpell(spell)}>
                                    {spell.name} ({spell.level})
                                </div>
                                <div className={"icon-bar"}><IconButton size={"small"} onClick={(e) => {
                                    characterService.deleteSpell(character.id, spell.id).then(r => {
                                        setCharacterSpells(r);
                                    });
                                    e.preventDefault();
                                }}><FaTrash/></IconButton></div>
                            </div>
                        })}
                    </div>
                </div>
                {selectedSpell === null ? null :
                    <SpellInfo spell={selectedSpell} onClose={() => setSelectedSpell(null)}/>
                }
                {showSpellsList ? <SpellsList character={character} onSelect={(spell) => {
                    setCharacterSpells([...characterSpells, spell]);
                    setShowSpellsList(false);
                }} onClose={() => setShowSpellsList(false)}/> : null}
            </>
        }
    </div>
}