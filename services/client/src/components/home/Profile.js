import React from "react";
import {profileService} from "../services/profileService";
import CharacterOverview from "./CharacterOverview";
import IconButton from "@material-ui/core/IconButton";
import {FaPlusCircle} from "react-icons/all";
import CharacterCreation from "./CharacterCreation";

export default function Profile(props) {
    const user = props.user
    const [characters, setCharacters] = React.useState([]);
    const [selectedCharacter, setSelectedCharacter] = React.useState(null);

    React.useEffect(() => {
        updateCharacters()
    }, []);

    function updateCharacters() {
        profileService.get().then(r => {
            setCharacters(r);
        });
    }

    return <>
        <div className={"left-content-bar"}>
            <div className={"basic-list-entry"}><h3>Characters</h3>
                <div className={"icon-bar"}>

                    {/*<IconButton aria-label="add" size={"small"} onClick={() => {*/}
                    {/*    setSelectedCharacter(null);*/}
                    {/*    console.log("got here");*/}
                    {/*    <CharacterCreation user={user}/>;*/}
                    {/*}}>*/}
                    {/*    <FaPlusCircle/>*/}
                    {/*</IconButton>*/}
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
        Add new character

        </div>
        {selectedCharacter === null ?
            <div className={"main-content"}>Select a character to show information here.</div> :
            <CharacterOverview character={selectedCharacter} reset={() => {
                setSelectedCharacter(null)
                updateCharacters()
            }}
            />
        }
    </>
}