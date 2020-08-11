import React from "react";
import {characterService} from "../services/characterService";
import "../../styles/profile.scss";
import {FaTrash, MdSave} from "react-icons/all";
import IconButton from "@material-ui/core/IconButton";
import CharacterInventory from "./characterComponents/CharacterInventory";
import CharacterStats from "./characterComponents/CharacterStats";
import CharacterSpells from "./characterComponents/CharacterSpells";
import CharacterProficiencies from "./characterComponents/CharacterProficiencies";

export default function CharacterOverview(props) {
    const basicCharacter = props.character;

    // Have a separate money state as to reduce the amount of re-renders required when updating the money.
    const [character, setCharacter] = React.useState(null);
    const [money, setMoney] = React.useState(null);
    const [characterInfo, setCharacterInfo] = React.useState(null);
    const [characterProficiencies, setCharacterProficiencies] = React.useState(null);

    const [notEditing, setNotEditing] = React.useState(false);

    React.useEffect(() => {
        characterService.getCharacterInfo(basicCharacter.id).then(r => {
            setMoney(r.money);
            setCharacterInfo(r.info);
            setCharacterProficiencies(r.proficiencies);
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
        character.money = money;
        character.info = characterInfo;
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
                <CharacterStats info={characterInfo} setInfo={setCharacterInfo} notEditing={notEditing}/>
                <CharacterProficiencies info={characterInfo} proficiencies={characterProficiencies} setProficiencies={setCharacterProficiencies}/>
                <CharacterSpells basicCharacter={basicCharacter}/>
                <CharacterInventory character={character} money={money} setMoney={setMoney}/>
            </>
        }
    </div>
}