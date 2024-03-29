import IconButton from "@mui/material/IconButton";
import {MdClose} from "react-icons/md";
import {Checkbox} from "@mui/material";
import React, {useRef} from "react";
import {toggleRightContentBar} from "../../services/constants";


function SpellInfo(props) {
    const spell = props.spell;
    const bar = useRef(null);

    React.useEffect(() => {
        toggleRightContentBar(bar);
    }, []);

    return <div ref={bar} className={"right-content-bar right-content-bar-invisible"}>
        <div><h3>{spell.name}</h3>
            <IconButton
                size={"small"} onClick={() => {
                    toggleRightContentBar(bar, props.onClose)
                }}
                style={{top: "8px", left: "8px", position: "absolute"}}><MdClose/></IconButton>
        </div>
        <div className={"basic-list"}>
            <div className={"spell-prop-title"}>Level</div>
            <div>{spell.level}</div>
            <div className={"spell-prop-title"}>Components</div>
            <div>{spell.components}</div>
            <div className={"spell-prop-title"}>Material</div>
            <div>{spell.material}</div>
            <div className={"spell-prop-title"}>Duration</div>
            <div>{spell.duration}</div>
            <div className={"spell-prop-title"}>Higher Level</div>
            <div>{spell.higher_level}</div>
            <div className={"spell-prop-title"}>Casting Time</div>
            <div>{spell.casting_time}</div>
            <div className={"spell-prop-title"}>Concentration</div>
            <div><Checkbox checked={spell.concentration} disabled/></div>
            <div className={"spell-prop-title"}>Ritual</div>
            <div><Checkbox checked={spell.ritual} disabled/></div>
            <div className={"spell-prop-title"}>Spell Range</div>
            <div>{spell.spell_range}</div>
            <div className={"spell-prop-title"}>Description</div>
            <div>{spell.description}</div>
            <div className={"spell-prop-title"}>School</div>
            <div>{spell.school}</div>
            <div className={"spell-prop-title"}>Phb Page</div>
            <div>{spell.phb_page}</div>
        </div>
    </div>
}

export default React.memo(SpellInfo);