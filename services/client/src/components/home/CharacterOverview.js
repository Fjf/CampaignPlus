import React from "react";
import {characterService} from "../services/characterService";
import {Checkbox, SvgIcon, TextField} from "@material-ui/core";
import "../../styles/profile.scss";
import {
    BsDiamond,
    BsDiamondFill,
    FaPlusCircle,
    FaTrash, GoArrowDown,
    GoArrowLeft,
    GoArrowRight, GoArrowSmallDown, GoArrowSmallUp, GoArrowUp,
    MdClose,
    MdSave
} from "react-icons/all";
import IconButton from "@material-ui/core/IconButton";
import {campaignService} from "../services/campaignService";
import DoubleCheckbox from "./DoubleCheckbox";
import SpellInfo from "./infoComponents/SpellInfo";
import SpellsList from "./infoComponents/SpellsList";
import CharacterInventory from "./infoComponents/CharacterInventory";
import CharacterStats from "./infoComponents/CharacterStats";
import CharacterSpells from "./infoComponents/CharacterSpells";
import CharacterProficiencies from "./infoComponents/CharacterProficiencies";

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
                // props.setCampaigns(r);
                // setSelectedCampaign(null);
                // getPlayers();
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

    return <div className={"main-content"}>
        <div className={"icon-bar"} style={{top: "8px", right: "8px", position: "absolute", zIndex: 1}}>
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