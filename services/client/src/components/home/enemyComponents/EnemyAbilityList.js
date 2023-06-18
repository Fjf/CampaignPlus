import IconButton from "@mui/material/IconButton";
import {toggleRightContentBar} from "../../services/constants";
import {FaTrash} from "react-icons/fa";
import {MdClose} from "react-icons/md";
import TextField from "@mui/material/TextField/TextField";
import React, {useRef} from "react";
import {dataService} from "../../services/dataService";

let timeout = null;
export default function EnemyAbilityList(props) {
    // TODO: We can cache this if we explicitly manage enemyability access, to ensure we only fetch when a delete update
    //  occurred.
    const [abilities, setAbilities] = React.useState([]);
    const bar = useRef(null);
    const [filteredAbilities, setFilteredAbilities] = React.useState([]);

    React.useEffect(() => {
        toggleRightContentBar(bar);
        // Store abilities here between renders of the list to reduce traffic.
        dataService.getAbilities().then(r => {
            setAbilities(r);
            setFilteredAbilities(r.slice(0, 50));
        });
    }, []);

    function setFilterAbility(value) {
        clearTimeout(timeout);
        let val = value.toLowerCase();
        timeout = setTimeout(() => {
            setFilteredAbilities(abilities.filter((ability) => ability.text.toLowerCase().includes(val)).slice(0, 50));
        }, 500);
    }

    return <div ref={bar} className={"right-content-bar right-content-bar-invisible"}>
        <div className={"icon-bar"} style={{top: "0px", left: "0px", position: "absolute"}}>
            <IconButton onClick={() => toggleRightContentBar(bar, props.onClose)}>
                <MdClose/>
            </IconButton>
        </div>
        <div>
            <h3>Abilities ({filteredAbilities.length} / {abilities.length})</h3>
        </div>
        <div>
            <TextField
                onChange={e => setFilterAbility(e.target.value)}
                label={"Filter"}
            />
        </div>
        <div className={"list-wrapper"}>
            {
                filteredAbilities.map((ability, i) => {
                    return <div key={ability.id} className={"ability-list-entry"} onClick={() => {
                        props.onSelect(ability);
                    }}>
                        <div>{ability.text}</div>
                        <div className={"icon-bar"}>
                            <IconButton size="small" onClick={() => {
                                dataService.deleteAbility(ability.id).then(r => toggleRightContentBar(bar, props.onClose));
                            }}>
                                <FaTrash fontSize="inherit"/>
                            </IconButton>
                        </div>
                    </div>
                })
            }
        </div>
    </div>
}

