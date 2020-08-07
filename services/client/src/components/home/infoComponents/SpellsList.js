import React from "react";
import {characterService} from "../../services/characterService";
import {userService} from "../../services/userService";
import {TextField} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import {MdClose} from "react-icons/all";

export default function SpellsList(props) {
    const [query, setQuery] = React.useState("");
    const [filteredSpells, setFilteredSpells] = React.useState([]);
    const [spells, setSpells] = React.useState([]);

    React.useEffect(() => {
        characterService.getSpells().then(r => {
            setSpells(r);
        });
    }, []);

    React.useEffect(() => {
        console.log("Filtering spells.");
        setFilteredSpells(spells.filter((val) => val.name.toLowerCase().includes(query.toLowerCase())));
    }, [query, spells]);

    return <div className={"right-content-bar"}>
        <div>
            <h3>Spells</h3>
            <IconButton size={"small"} onClick={props.onClose}
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