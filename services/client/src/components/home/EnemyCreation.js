import IconButton from "@mui/material/IconButton";
import React from "react";
import {dataService} from "../services/dataService";
import "../../styles/enemy.scss"
import TextField from "@mui/material/TextField";
import {FaPlusCircle, FaTrash} from "react-icons/fa";
import {MdCreate, MdSave} from "react-icons/md";
import EnemyAbilityList from "./enemyComponents/EnemyAbilityList";
import EnemyList from "./enemyComponents/EnemyList";


export default function EnemyCreation(props) {
    const [selectedEnemy, setSelectedEnemy] = React.useState(null);
    const [selectedEnemyAbilities, setSelectedEnemyAbilities] = React.useState([]);

    const [enemies, setEnemies] = React.useState([]);

    const [selectingAbility, isSelectingAbility] = React.useState(false);

    React.useEffect(() => {
        // Load your enemies on initialization
        dataService.getEnemies().then(r => {
            setEnemies(r);
        });
    }, []);


    function openEditEnemy(enemy) {
        setSelectedEnemy(enemy);
        dataService.getAbilities(enemy.id).then(r => {
            setSelectedEnemyAbilities(r);
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
            openEditEnemy(r);
        });
    }

    function stopSelecting() {
        isSelectingAbility(false)
    }

    function createAbility() {
        const ability = prompt("Type your ability here.");
        if (ability === null) return;
        dataService.addAbility(selectedEnemy.id, ability).then((a) => {
            setSelectedEnemyAbilities([...selectedEnemyAbilities, a]);
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
                    <IconButton onClick={() => dataService.saveEnemy({
                        ...selectedEnemy,
                        abilities: selectedEnemyAbilities
                    }).then(r => {
                        const updatedEnemies = enemies.map((item) => {
                            if (item.id === r.id)
                                return r;
                            return item;
                        });

                        setEnemies(updatedEnemies);
                        alert("Saved!");
                    })}>
                        <MdSave/>
                    </IconButton>
                </div>
                <div className={"enemy-stats-column"}>
                    <h3>Info</h3>
                    <TextField
                        variant="standard"
                        value={selectedEnemy.name}
                        onChange={(e) => {
                            setSelectedEnemy({
                                ...selectedEnemy,
                                name: e.target.value
                            });
                        }}
                        label={"Name"} />
                    <TextField
                        variant="standard"
                        value={selectedEnemy.armor_class}
                        onChange={(e) => {
                            setSelectedEnemy({
                                ...selectedEnemy,
                                armor_class: e.target.value
                            });
                        }}
                        label={"Armor Class"} />
                    <TextField
                        variant="standard"
                        value={selectedEnemy.max_hp}
                        onChange={(e) => {
                            setSelectedEnemy({
                                ...selectedEnemy,
                                max_hp: e.target.value
                            });
                        }}
                        label={"Max HP"} />
                    <TextField
                        variant="standard"
                        value={selectedEnemy.speed}
                        onChange={(e) => {
                            setSelectedEnemy({
                                ...selectedEnemy,
                                speed: e.target.value
                            });
                        }}
                        label={"Speed"} />
                    <h3>Stats</h3>
                    <TextField
                        variant="standard"
                        value={selectedEnemy.strength}
                        onChange={(e) => {
                            setSelectedEnemy({
                                ...selectedEnemy,
                                strength: e.target.value
                            });
                        }}
                        label={"Strength"} />
                    <TextField
                        variant="standard"
                        value={selectedEnemy.dexterity}
                        onChange={(e) => {
                            setSelectedEnemy({
                                ...selectedEnemy,
                                dexterity: e.target.value
                            });
                        }}
                        label={"Dexterity"} />
                    <TextField
                        variant="standard"
                        value={selectedEnemy.constitution}
                        onChange={(e) => {
                            setSelectedEnemy({
                                ...selectedEnemy,
                                constitution: e.target.value
                            });
                        }}
                        label={"Constitution"} />
                    <TextField
                        variant="standard"
                        value={selectedEnemy.intelligence}
                        onChange={(e) => {
                            setSelectedEnemy({
                                ...selectedEnemy,
                                intelligence: e.target.value
                            });
                        }}
                        label={"Intelligence"} />
                    <TextField
                        variant="standard"
                        value={selectedEnemy.wisdom}
                        onChange={(e) => {
                            setSelectedEnemy({
                                ...selectedEnemy,
                                wisdom: e.target.value
                            });
                        }}
                        label={"Wisdom"} />
                    <TextField
                        variant="standard"
                        value={selectedEnemy.charisma}
                        onChange={(e) => {
                            setSelectedEnemy({
                                ...selectedEnemy,
                                charisma: e.target.value
                            });
                        }}
                        label={"Charisma"} />
                </div>
                <div className={"abilities-column"}>
                    <div style={{display: "flex", flexDirection: "row"}}>

                        <h3>Abilities</h3>
                        <div className={"icon-bar"}>
                            <IconButton size="small" onClick={() => isSelectingAbility(true)}>
                                <FaPlusCircle/>
                            </IconButton>
                            <IconButton size="small" onClick={createAbility}>
                                <MdCreate/>
                            </IconButton>
                        </div>
                    </div>
                    <div className={"abilities-list"}>
                        {
                            selectedEnemyAbilities.map((ability, i) => {
                                return (
                                    <div key={i} style={{display: "flex", flexDirection: "row"}}>
                                        <TextField
                                            variant="standard"
                                            rows={3}
                                            fullWidth={true}
                                            multiline={true}
                                            value={ability.text}
                                            onChange={(e) => {
                                                let a = [...selectedEnemyAbilities];
                                                a[i].text = e.target.value;
                                                setSelectedEnemyAbilities([...a])
                                            }}
                                            key={ability.id} />
                                        <IconButton style={{width: "48px", height: "48px"}} onClick={e => {
                                            dataService.deleteAbility(ability.id, selectedEnemy.id)
                                                .then(d => {
                                                    setSelectedEnemyAbilities(d)
                                                });
                                        }}><FaTrash/></IconButton>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            </div>
        }
        {selectingAbility ? <EnemyAbilityList onClose={stopSelecting} onSelect={(ability) => {
            dataService.addAbility(selectedEnemy.id, ability.text).then((a) => {
                setSelectedEnemyAbilities([
                    ...selectedEnemyAbilities,
                    a
                ]);
                stopSelecting();
            })
        }}/> : null}

    </>;
}