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

export default function EnemyCreation(props) {
    const [enemies, setEnemies] = React.useState([]);
    const [enemyToggled, setEnemyToggled] = React.useState([]);
    const [selectedEnemy, setSelectedEnemy] = React.useState(null);


    React.useEffect(() => {
        // Load your enemies on initialization
        dataService.get().then(r => {
            setEnemies(r);
            setEnemyToggled(new Array(r.length).fill(true));
        });
    }, []);

    function toggleEnemyList(i) {
        let p;
        if (i === undefined) {
            p = new Array(enemyToggled.length).fill(!enemyToggled.some((i) => i));
        } else {
            p = [...enemyToggled];
            p[i] = !p[i];
        }
        setEnemyToggled(p);
    }

    function openEditEnemy(i) {
        setSelectedEnemy(enemies[i]);
    }

    function deleteEnemy(id) {

    }

    return <div className={"main-content"}>
        <div className={"left-content-bar"}>
            <div className={"enemy-list-entry"}>
                <h3>Enemies ({enemies.length})</h3>
            </div>

            {
                enemies.map((enemy, i) => {
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
        {selectedEnemy === null ?
            <div className={"main-content"}>Click an enemy to show editor.</div> :
            <div className={"main-content"}>
                <div className={"stats-bar"}>
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
                </div>
            </div>
        }
    </div>
}