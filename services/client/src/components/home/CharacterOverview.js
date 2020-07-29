import React from "react";
import {characterServices} from "../services/characterServices";

export default function CharacterOverview(props) {
    const character = props.character;
    const [characterInfo, setCharacterInfo] = React.useState(null);

    React.useEffect(() => {
        console.log(typeof(character.id))
        characterServices.getCharacterInfo(character.id).then(r => {
            setCharacterInfo(r);
        });
    }, []);
    return <div className={"main-content"}>

        {console.log(characterInfo)}
    </div>
}