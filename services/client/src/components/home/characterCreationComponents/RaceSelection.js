import React from "react";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import {makeStyles} from "@material-ui/core/styles";
import {characterCreationService} from "../../services/characterCreationService";

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },

}));

export default function RaceSelection(props) {
    const [races, setRaces] = React.useState([])
    const classes = useStyles();
    const [race, setRace] = React.useState('');


    const handleChange = (event) => {
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

    return <FormControl className={classes.formControl}>
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
    </FormControl>;
}