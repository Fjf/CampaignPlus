import React from "react";
import {profileService} from "../services/profileService";
import CharacterOverview from "./CharacterOverview";
import {makeStyles} from '@mui/styles';
import Button from '@mui/material/Button';
import CharacterCreation from "./CharacterCreation";
import {useTheme} from "@mui/material/styles";

const useStyles = makeStyles(() => ({
    root: {
        '& > *': {
            margin: useTheme().spacing(1),
        },
    },
}));

export default function Profile(props) {
    const user = props.user
    const [characters, setCharacters] = React.useState([]);
    const [selectedCharacter, setSelectedCharacter] = React.useState(null);
    const [newCharacterCreation, setNewCharacterCreation] = React.useState(false);
    const classes = useStyles();

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
            <div className={classes.root}>
                <Button onClick={() => {
                    setNewCharacterCreation(true);
                }} variant="outlined" color="primary">
                    Create new
                </Button>
            </div>


        </div>
        {newCharacterCreation ?
            <CharacterCreation user={user} onCreate={(character) => {
                setSelectedCharacter(character);
                setCharacters([...characters, character]);
                setNewCharacterCreation(false);
            }}/> : (selectedCharacter === null ?
                <div className={"main-content"}>Select a character to show information here.</div>

                :
                <CharacterOverview character={selectedCharacter} reset={() => {
                    setSelectedCharacter(null)
                    updateCharacters()
                }}/>)
        }

    </>
}