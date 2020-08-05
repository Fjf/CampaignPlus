import React from "react";
import {profileServices} from "../services/profileServices";
import CharacterOverview from "./CharacterOverview";

export default function Profile(props) {
    const user = props.user
    const [characters, setCharacters] = React.useState([]);
    const [selectedCharacter, setSelectedCharacter] = React.useState(null);

    React.useEffect(() => {
        profileServices.get().then(r => {
            setCharacters(r);
        });
    }, []);

    return <>
        <div className={"left-content-bar"}>
            <h3>Character Overview for {user.name}</h3>
            {console.log(characters)}
            {
                characters.map((character, i) => {
                    return <div key={i}
                                className={"campaign-list-entry"}
                                onClick={() => setSelectedCharacter(characters[i])}>
                        <div>{character.name} - {character.race}</div>
                    </div>
                })
            }
        </div>
        {selectedCharacter === null ?
            <div className={"main-content"}>Select a character to show information here.</div> :
            <CharacterOverview character={selectedCharacter}/>
        }
    </>


}