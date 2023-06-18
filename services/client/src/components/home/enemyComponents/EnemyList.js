import IconButton from "@mui/material/IconButton";
import {FaPlusCircle} from "react-icons/fa";
import TextField from "@mui/material/TextField/TextField";
import React from "react";


export default function EnemyList(props) {
    const enemies = props.enemies;
    const [filteredEnemies, setFilteredEnemies] = React.useState([]);
    const [query, setQuery] = React.useState("");

    React.useEffect(() => {
        setFilteredEnemies(enemies.filter((val) => val.name.toLowerCase().includes(query.toLowerCase())));
    }, [query, enemies]);

    return <>
        <div className={"basic-list-entry"}>
            <h3>Enemies ({filteredEnemies.length} / {enemies.length})</h3>
            <div className={"icon-bar"}>
                {props.onCreate === undefined ? null :
                    <IconButton size={"small"} onClick={props.onCreate}>
                        <FaPlusCircle/>
                    </IconButton>
                }
            </div>
        </div>
        <TextField
            onChange={(e) => setQuery(e.target.value)}
            label={"Filter"}
        />
        <div className={"list-wrapper"}>
            {
                filteredEnemies.map((enemy, i) => {
                    return <div key={i} className={"enemy-list-entry"} onClick={() => props.onClick(enemy)}>
                        <div><b>{enemy.name}</b></div>
                    </div>
                })
            }
        </div>
    </>
}