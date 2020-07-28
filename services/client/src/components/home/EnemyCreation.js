import IconButton from "@material-ui/core/IconButton";
import {Collapse} from "@material-ui/core";
import React from "react";
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Edit';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import {dataService} from "../services/dataService";
import "../../styles/enemy.scss"

export default function EnemyCreation(props) {
    const [enemies, setEnemies] = React.useState([]);
    const [enemyToggled, setEnemyToggled] = React.useState([]);

    let enemy = {
        id: 1,
        name: "skelet",
        data: {
            stats: {
                con: 1
            },
            sv_throws: {
                con: 0,
            },
        }
    };

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
        let enemy = enemies[i];
    }

    return <div className={"main-content"}>
            <div className={"enemy-list-wrapper"}>
                <div className={"enemy-list-entry"}>
                    <div>
                        <h3>Enemies ({enemies.length})</h3>
                        <IconButton size="small" onClick={() => toggleEnemyList()}>
                            {enemyToggled.some((i) => i) ? <ArrowUpwardIcon fontSize="inherit"/>
                                : <ArrowDownwardIcon fontSize="inherit"/>}
                        </IconButton>
                    </div>
                </div>
            </div>

            <div className={"enemy-list"}>

                {
                    enemies.map((enemy, i) => {
                        return <Collapse
                            in={enemyToggled[i]}
                            key={i}
                            collapsedHeight={"24px"}
                        >
                            <div className={"enemy-list-entry"}>
                                <div>
                                    <div><b>{enemy.name}</b></div>
                                    <div className={"icon-bar"}>
                                        <IconButton size="small" onClick={() => deleteEnemy(enemy.id)}>
                                            <EditIcon fontSize="inherit"/>
                                        </IconButton>
                                        <IconButton size="small" onClick={() => openEditEnemy(i)}>
                                            <DeleteIcon fontSize="inherit"/>
                                        </IconButton>
                                        <IconButton size="small" onClick={() => toggleEnemyList(i)}>
                                            {enemyToggled[i] ? <ArrowUpwardIcon fontSize="inherit"/>
                                                : <ArrowDownwardIcon fontSize="inherit"/>}
                                        </IconButton>
                                    </div>
                                </div>
                                <div>Max HP: {enemy.max_hp}</div>
                                <div>Armor Class: {enemy.armor_class}</div>
                                <div>Strength: {enemy.str}</div>
                                <div>Dexterity: {enemy.dex}</div>
                                <div>Constitution: {enemy.con}</div>
                                <div>Wisdom: {enemy.wis}</div>
                                <div>Intelligence: {enemy.int}</div>
                                <div>Charisma: {enemy.cha}</div>
                            </div>
                        </Collapse>
                    })
                }
            </div>
        </div>
}