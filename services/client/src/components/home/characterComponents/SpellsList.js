import React, {useRef} from "react";
import {characterService} from "../../services/characterService";
import {userService} from "../../services/userService";
import {TextField} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import {MdClose} from "react-icons/md";
import {toggleRightContentBar} from "../../services/constants";

function SpellsList(props) {
    const [query, setQuery] = React.useState("");
    const [filteredSpells, setFilteredSpells] = React.useState([]);
    const [spells, setSpells] = React.useState([]);
    const bar = useRef(null);

    React.useEffect(() => {
        characterService.getSpells().then(r => {
            setSpells(r);
        });
        toggleRightContentBar(bar);
    }, []);

    React.useEffect(() => {
        setFilteredSpells(spells.filter((val) => val.name.toLowerCase().includes(query.toLowerCase())));
    }, [query, spells]);

    return <div ref={bar} className={"right-content-bar right-content-bar-invisible"}>
        <div>
            <h3>Spells</h3>
            <IconButton size={"small"} onClick={() => {
                toggleRightContentBar(bar, props.onClose)
            }}
                        style={{top: "8px", left: "8px", position: "absolute"}}><MdClose/></IconButton>
        </div>
        <TextField
            label={"Search"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
        />
        <div className={"spells-list"}>
            {filteredSpells.map((spell, i) => {
                return <div key={i} onClick={() => {
                    characterService.addSpell(props.character.id, spell.id).then(r => {
                        props.onSelect(r);
                    })
                }}>
                    {spell.name}
                </div>
            })}
        </div>
    </div>

}

export default React.memo(SpellsList);