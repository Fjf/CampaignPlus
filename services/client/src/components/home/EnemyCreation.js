import IconButton from "@material-ui/core/IconButton";
import React from "react";
import {dataService} from "../services/dataService";
import "../../styles/enemy.scss"
import TextField from "@material-ui/core/TextField";
import {FaPlusCircle, FaTrash, MdCreate, MdSave} from "react-icons/all";
import EnemyAbilityList from "./enemyComponents/EnemyAbilityList";
import EnemyList from "./enemyComponents/EnemyList";


export default function EnemyCreation(props) {
    const [selectedEnemy, setSelectedEnemy] = React.useState(null);
    const [enemies, setEnemies] = React.useState([]);

    const [abilities, setAbilities] = React.useState([]);

    const [selectingAbility, isSelectingAbility] = React.useState(false);

    React.useEffect(() => {
        // Load your enemies on initialization
        dataService.getEnemies().then(r => {
            setEnemies(r);
        });
        // Store abilities here between renders of the list to reduce traffic.
        dataService.getAbilities().then(r => {
            setAbilities(r);
        });
    }, []);




    function openEditEnemy(enemy) {
        dataService.getAbilities(enemy.id).then(r => {
            console.log(r);
            setSelectedEnemy({
                ...enemy,
                abilities: r
            })
        })
    }

    function deleteEnemy() {
        if (prompt("Are you sure you want to delete this enemy? Type the name of the enemy to continue deleting.") === selectedEnemy.name) {
            dataService.deleteEnemy(selectedEnemy.id).then(r => {
                setEnemies(r);
                setSelectedEnemy(null);
            });
        }
    }

    function createEnemy() {
        let name = prompt("Set an enemy name.");
        dataService.createEnemy({name: name}).then(r => {
            setEnemies([...enemies, r]);
            openEditEnemy(enemies.length);
        });
    }

    function stopSelecting() {
        isSelectingAbility(false)
    }

    function createAbility() {
        const ability = prompt("Type your ability here.");
        if (ability === null) return;
        dataService.addAbility(selectedEnemy.id, ability).then((a) => {
            setSelectedEnemy({
                ...selectedEnemy,
                abilities: [
                    ...selectedEnemy.abilities,
                    a
                ]
            });
            stopSelecting();
        })
    }

    return <>
        <div className={"left-content-bar"}>
            <EnemyList enemies={enemies} onCreate={createEnemy} onClick={(enemy) => openEditEnemy(enemy)}/>
        </div>
        {selectedEnemy === null ?
            <div className={"main-content"}>Click an enemy to show editor.</div> :
            <div className={"main-content"} style={{paddingRight: 48}}>
                <div className={"icon-bar"} style={{flexDirection: "column", position: "absolute", top: 0, right: 0}}>
                    <IconButton onClick={() => deleteEnemy()}>
                        <FaTrash fontSize="inherit"/>
                    </IconButton>
                    <IconButton onClick={() => dataService.saveEnemy(selectedEnemy).then(r => alert("Saved!"))}>
                        <MdSave/>
                    </IconButton>
                </div>
                <div className={"enemy-stats-column"}>
                    <h3>Info</h3>
                    <TextField
                        value={selectedEnemy.name}
                        onChange={(e) => {
                            setSelectedEnemy({
                                ...selectedEnemy,
                                name: e.target.value
                            });
                        }}
                        label={"Name"}
                    />
                    <TextField
                        value={selectedEnemy.armor_class}
                        onChange={(e) => {
                            setSelectedEnemy({
                                ...selectedEnemy,
                                armor_class: e.target.value
                            });
                        }}
                        label={"Armor Class"}
                    />
                    <TextField
                        value={selectedEnemy.max_hp}
                        onChange={(e) => {
                            setSelectedEnemy({
                                ...selectedEnemy,
                                max_hp: e.target.value
                            });
                        }}
                        label={"Max HP"}
                    />
                    <h3>Stats</h3>
                    <TextField
                        value={selectedEnemy.str}
                        onChange={(e) => {
                            setSelectedEnemy({
                                ...selectedEnemy,
                                str: e.target.value
                            });
                        }}
                        label={"Strength"}
                    />
                    <TextField
                        value={selectedEnemy.dex}
                        onChange={(e) => {
                            setSelectedEnemy({
                                ...selectedEnemy,
                                dex: e.target.value
                            });
                        }}
                        label={"Dexterity"}
                    />
                    <TextField
                        value={selectedEnemy.con}
                        onChange={(e) => {
                            setSelectedEnemy({
                                ...selectedEnemy,
                                con: e.target.value
                            });
                        }}
                        label={"Constitution"}
                    />
                    <TextField
                        value={selectedEnemy.int}
                        onChange={(e) => {
                            setSelectedEnemy({
                                ...selectedEnemy,
                                int: e.target.value
                            });
                        }}
                        label={"Intelligence"}
                    />
                    <TextField
                        value={selectedEnemy.wis}
                        onChange={(e) => {
                            setSelectedEnemy({
                                ...selectedEnemy,
                                wis: e.target.value
                            });
                        }}
                        label={"Wisdom"}
                    />
                    <TextField
                        value={selectedEnemy.cha}
                        onChange={(e) => {
                            setSelectedEnemy({
                                ...selectedEnemy,
                                cha: e.target.value
                            });
                        }}
                        label={"Charisma"}
                    />
                </div>
                <div className={"abilities-column"}>
                    <div style={{display: "flex", flexDirection: "row"}}>
                        <div className={"icon-bar"}>
                            <IconButton size="small" onClick={() => isSelectingAbility(true)}>
                                <FaPlusCircle/>
                            </IconButton>
                            <IconButton size="small" onClick={createAbility}>
                                <MdCreate/>
                            </IconButton>
                        </div>
                        <h3>Abilities</h3>
                    </div>
                    <div className={"abilities-list"}>
                        {
                            selectedEnemy.abilities.map((ability, i) => {
                                return <TextField
                                    rows={3}
                                    fullWidth={true}
                                    multiline={true}
                                    value={ability.text}
                                    onChange={(e) => {
                                        let a = [...selectedEnemy.abilities];
                                        a[i].text = e.target.value;
                                        setSelectedEnemy({
                                            ...selectedEnemy,
                                            abilities: a
                                        })
                                    }}
                                    key={ability.id}/>
                            })
                        }
                    </div>
                </div>
            </div>
        }
        {selectingAbility ? <EnemyAbilityList onClose={stopSelecting} onSelect={(ability) => {
            dataService.addAbility(selectedEnemy.id, ability.text).then((a) => {
                setSelectedEnemy({
                    ...selectedEnemy,
                    abilities: [
                        ...selectedEnemy.abilities,
                        a
                    ]
                });
                stopSelecting();
            })
        }} abilities={abilities}/> : null}
    </>
}