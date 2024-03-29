import React from "react";
import {characterService} from "../services/characterService";
import "../../styles/profile.scss";
import {MdSave} from "react-icons/md";
import {FaTrash} from "react-icons/fa";
import IconButton from "@mui/material/IconButton";
import CharacterInventory from "./characterComponents/CharacterInventory";
import CharacterStats from "./characterComponents/CharacterStats";
import CharacterSpells from "./characterComponents/CharacterSpells";
import CharacterProficiencies from "./characterComponents/CharacterProficiencies";

export default function CharacterOverview(props) {
    const basicCharacter = props.character;

    const [character, setCharacter] = React.useState(null);
    const [characterStats, setCharacterStats] = React.useState(null);
    const [characterProficiencies, setCharacterProficiencies] = React.useState(null);

    const [notEditing, setNotEditing] = React.useState(false);

    React.useEffect(() => {
        characterService.getCharacterInfo(basicCharacter.id).then(r => {
            setCharacterStats(r.info.stats);
            setCharacterProficiencies(r.info.proficiencies);
            setCharacter(r);
        });
    }, [basicCharacter]);

    function deleteCharacter() {
        if (prompt("Are you sure you want to delete this character? Type the name of the character to continue deleting.") === basicCharacter.name) {
            characterService.del(basicCharacter.id).then(r => {
                props.reset();
            })
        }
    }

    function saveChanges() {
        character.info.stats = characterStats;
        character.info.proficiencies = characterProficiencies;
        console.log(character);
        characterService.save(character).then(r => {
            console.log(r);
        })
    }

    return <div className={"main-content"} style={{paddingRight: 48}}>
        <div className={"icon-bar"} style={{flexDirection: "column", top: 0, right: 0, position: "absolute", zIndex: 1}}>
            <IconButton
                onClick={saveChanges}
            >
                <MdSave/>
            </IconButton>
            <IconButton
                onClick={deleteCharacter}
            >
                <FaTrash/>
            </IconButton>
        </div>
        {character === null ? null :
            <>
                <CharacterStats info={characterStats} setInfo={setCharacterStats} notEditing={notEditing}/>
                <CharacterProficiencies info={characterStats} proficiencies={characterProficiencies} setProficiencies={setCharacterProficiencies}/>
                <CharacterSpells basicCharacter={basicCharacter}/>
                <CharacterInventory character={character} setCharacter={setCharacter}/>
            </>
        }
    </div>
}