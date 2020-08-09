import IconButton from "@material-ui/core/IconButton";
import {FaPlusCircle, FaTrash} from "react-icons/all";
import {characterService} from "../../services/characterService";
import React from "react";
import SpellsList from "./SpellsList";
import SpellInfo from "./SpellInfo";


function CharacterSpells(props) {
    const basicCharacter = props.basicCharacter;

    const [characterSpells, setCharacterSpells] = React.useState([]);
    const [showSpellsList, setShowSpellsList] = React.useState(false);
    const [selectedSpell, setSelectedSpell] = React.useState(null);

    React.useEffect(() => {
        characterService.getCharacterSpells(basicCharacter.id).then(r => {
            setCharacterSpells(r);
        }, e => {
            console.error(e);
        });
    }, [basicCharacter]);

    return <>
        <div className={"spells-wrapper"}>
            <div className={"icon-bar"} style={{top: "8px", right: "8px", position: "absolute"}}>
                <IconButton size={"small"} onClick={() => {
                    setShowSpellsList(!showSpellsList);
                }}>
                    <FaPlusCircle/>
                </IconButton>
            </div>
            <h3>Spells</h3>
            <div className={"spells-list"}>
                {characterSpells.map((spell, i) => {
                    return <div key={i} className={"basic-list-entry"}>
                        <div style={{flex: 1}} onClick={() => setSelectedSpell(spell)}>
                            {spell.name} ({spell.level})
                        </div>
                        <div className={"icon-bar"}><IconButton size={"small"} onClick={(e) => {
                            characterService.deleteSpell(basicCharacter.id, spell.id).then(r => {
                                setCharacterSpells(r);
                            });
                            e.preventDefault();
                        }}><FaTrash/></IconButton></div>
                    </div>
                })}
            </div>
        </div>
        {selectedSpell === null ? null :
            <SpellInfo spell={selectedSpell} onClose={() => setSelectedSpell(null)}/>
        }
        {showSpellsList ? <SpellsList character={basicCharacter} onSelect={(spell) => {
            setCharacterSpells([...characterSpells, spell]);
            setShowSpellsList(false);
        }} onClose={() => setShowSpellsList(false)}/> : null}
    </>
}

export default React.memo(CharacterSpells);