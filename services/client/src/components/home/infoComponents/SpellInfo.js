import IconButton from "@material-ui/core/IconButton";
import {MdClose} from "react-icons/all";
import {Checkbox} from "@material-ui/core";
import React from "react";


export default function SpellInfo(props) {
    const spell = props.spell;

    return <div className={"right-content-bar"}>
        <div><h3>{spell.name}</h3>
            <IconButton size={"small"} onClick={props.onClose}
                        style={{top: "8px", left: "8px", position: "absolute"}}><MdClose/></IconButton>
        </div>
        <div>Level: {spell.level}</div>
        <div>Components: {spell.components}</div>
        <div>Material: {spell.material}</div>
        <div>Duration: {spell.duration}</div>
        <div>Higher Level: {spell.higher_level}</div>
        <div>Casting Time: {spell.casting_time}</div>
        <div>Concentration: <Checkbox checked={spell.concentration} disabled/></div>
        <div>Ritual: <Checkbox checked={spell.ritual} disabled/></div>
        <div>Spell Range: {spell.spell_range}</div>
        <div>Description: {spell.description}</div>
        <div>School: {spell.school}</div>
        <div>Phb Page: {spell.phb_page}</div>
    </div>
}