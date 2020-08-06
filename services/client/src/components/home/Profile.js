import React from "react";
import {profileServices} from "../services/profileServices";
import CharacterOverview from "./CharacterOverview";
import IconButton from "@material-ui/core/IconButton";
import {FaPlusCircle} from "react-icons/all";

export default function Profile(props) {
    const user = props.user
    const [characters, setCharacters] = React.useState([]);
    const [selectedCharacter, setSelectedCharacter] = React.useState(null);

    React.useEffect(() => {
        profileServices.get().then(r => {
            console.log(r)
            setCharacters(r);
        });
    }, []);

    return <>
        <div className={"left-content-bar"}>
            <div className={"standard-bar-entry"}><h3>Characters</h3>
                <div className={"icon-bar"}>
                    <IconButton aria-label="add" size={"small"} onClick={() => {
                        profileServices.create({"name": "test", "race_name": "Human"}).then(r => {
                                setCharacters([
                                    ...characters,
                                    r
                                ]);
                            },
                            error => {
                                console.log(error)
                            });
                    }}>
                        <FaPlusCircle/>
                    </IconButton>
                </div>
            </div>
            {
                characters.map((character, i) => {
                    return <div key={i}
                                className={"campaign-list-entry"}
                                onClick={() => {
                                    setSelectedCharacter(characters[i])
                                }}>
                        <div>{character.name} - {character.race}</div>
                    </div>
                })
            }
        </div>
        {selectedCharacter === null ?
            <div className={"main-content"}>Select a character to show information here.</div> :
            <CharacterOverview character={selectedCharacter} reset={() => setSelectedCharacter(null)}/>
        }
    </>
}