import IconButton from "@material-ui/core/IconButton";
import {Collapse} from "@material-ui/core";
import React from "react";
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import {dataService} from "../services/dataService";
import "../../styles/enemy.scss"
import TextField from "@material-ui/core/TextField";

let timeout = null;
let filteredEnemies = [];
export default function EnemyCreation(props) {
    const [enemies, setEnemies] = React.useState([]);
    const [abilities, setAbilities] = React.useState([]);
    const [selectedEnemy, setSelectedEnemy] = React.useState(null);
    const [filter, setFilter] = React.useState("");

    React.useEffect(() => {
        // Load your enemies on initialization
        dataService.getEnemies().then(r => {
            setEnemies(r);
        });

        dataService.getAbilities().then(r => {
            setAbilities(r);
        })
    }, []);

    React.useEffect(() => {
        filteredEnemies = enemies.filter((enemy) => enemy.name.includes(filter));
    }, [filter, enemies]);

    function setFilterInput(event)  {
        clearTimeout(timeout);
        let val = event.target.value;
        timeout = setTimeout(() => {
            setFilter(val);
        }, 150);
    }

    function openEditEnemy(i) {
        dataService.getAbilities(filteredEnemies[i].id).then(r => {
            setSelectedEnemy({
                ...filteredEnemies[i],
                abilities: r
            })
        })
    }

    function deleteEnemy(id) {

    }

    return <div className={"main-content"}>
        <div className={"left-content-bar"}>
            <div className={"enemy-list-entry"}>
                <h3>Enemies ({filteredEnemies.length} / {enemies.length})</h3>
            </div>
            <div className={"enemy-list-entry"}>
                <TextField
                    onChange={setFilterInput}
                    label={"Filter"}
                />
            </div>
            <div className={"list-wrapper"}>
                {
                    filteredEnemies.map((enemy, i) => {
                        return <div key={i} className={"enemy-list-entry"}>
                            <div><b>{enemy.name}</b></div>
                            <div className={"icon-bar"}>
                                <IconButton size="small" onClick={() => openEditEnemy(i)}>
                                    <EditIcon fontSize="inherit"/>
                                </IconButton>
                                <IconButton size="small" onClick={() => deleteEnemy(enemy.id)}>
                                    <DeleteIcon fontSize="inherit"/>
                                </IconButton>
                            </div>
                        </div>
                    })
                }
            </div>
        </div>
        {selectedEnemy === null ?
            <div className={"main-content"}>Click an enemy to show editor.</div> :
            <div className={"main-content"}>
                <div className={"stats-column"}>
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
                    <h3>Abilities</h3>
                    <div className={"abilities-list"}>
                        {
                            selectedEnemy.abilities.map((ability, i) => {
                                return <div key={i}>
                                    {ability.text}
                                </div>
                            })
                        }
                    </div>
                </div>
            </div>
        }
        <div className={"right-content-bar"}>
            <div className={"ability-list-entry"}>
                <h3>Enemies ({filteredEnemies.length} / {enemies.length})</h3>
            </div>
            <div className={"ability-list-entry"}>
                <TextField
                    onChange={setFilterInput}
                    label={"Filter"}
                />
            </div>
            <div className={"list-wrapper"}>
                {
                    abilities.map((ability, i) => {
                        return <div key={i} className={"ability-list-entry"}>
                            <div><b>{ability.text}</b></div>
                            <div className={"icon-bar"}>
                                <IconButton size="small" onClick={() => deleteEnemy(ability.id)}>
                                    <DeleteIcon fontSize="inherit"/>
                                </IconButton>
                            </div>
                        </div>
                    })
                }
            </div>
        </div>
    </div>
}