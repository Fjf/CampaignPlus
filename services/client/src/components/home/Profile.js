import React from "react";
import {profileService} from "../services/profileService";
import CharacterOverview from "./CharacterOverview";
import {makeStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from "@material-ui/core/IconButton";
import {FaPlusCircle} from "react-icons/all";
import CharacterCreation from "./CharacterCreation";

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
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
                    setSelectedCharacter("new");
                }} variant="outlined" color="primary">
                    Create new
                </Button>
            </div>


        </div>
        {selectedCharacter === null ?
            <div className={"main-content"}>Select a character to show information here.</div> :
            (selectedCharacter === "new" ?
                    <CharacterCreation user={user}/> :
                    <CharacterOverview character={selectedCharacter} reset={() => {
                        setSelectedCharacter(null)
                        updateCharacters()
                    }}
                    />
            )
        }

    </>
}