import React from "react";
import {makeStyles} from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import {characterCreationService} from "../services/characterCreationService";
import ListSubheader from "@material-ui/core/ListSubheader";
import Alignment from "../util/Alignment";


const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));

export default function CharacterCreation(props) {
    const user = props.user
    const [races, setRaces] = React.useState([])

    const classes = useStyles();
    const [race, setRace] = React.useState('');

    const handleChange = (event) => {
        console.log(event.target.value);
        setRace(event.target.value);
    };

    React.useEffect(() => {
        getRaces()
    }, []);

    function getRaces() {
        characterCreationService.getRaces().then(r => {
            setRaces(r);
        })
    }

    console.log(races)

    return <div className={"main-content"}>
        <FormControl className={classes.formControl}>
            <InputLabel id="race-simple-select-label">Race</InputLabel>
            <Select
                labelId="race-select-label"
                id="race-select"
                value={race}
                onChange={handleChange}
            >
                {
                    races.map((race, i) => {
                        return <MenuItem key={i} value={race.name}>
                            {race.name}
                        </MenuItem>;

                    })
                }
            </Select>
        </FormControl>
    </div>
}