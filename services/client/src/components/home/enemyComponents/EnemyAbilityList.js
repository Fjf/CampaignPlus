import IconButton from "@material-ui/core/IconButton";
import {toggleRightContentBar} from "../../services/constants";
import {FaTrash, MdClose} from "react-icons/all";
import TextField from "@material-ui/core/TextField/TextField";
import DeleteIcon from "@material-ui/core/SvgIcon/SvgIcon";
import React, {useRef} from "react";
import {dataService} from "../../services/dataService";

let timeout = null;
function EnemyAbilityList(props) {
    const abilities = props.abilities;
    const bar = useRef(null);
    const [filteredAbilities, setFilteredAbilities] = React.useState(abilities.slice(0, 50));

    React.useEffect(() => {
        toggleRightContentBar(bar);
    }, []);

    function setFilterAbility(event) {
        clearTimeout(timeout);
        let val = event.target.value.toLowerCase();
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
                onChange={setFilterAbility}
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
                            <IconButton size="small" onClick={() => console.log("Deleting enemy ability.")}>
                                <FaTrash fontSize="inherit"/>
                            </IconButton>
                        </div>
                    </div>
                })
            }
        </div>
    </div>
}

export default React.memo(EnemyAbilityList);