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
    const [dndclasses, setClasses] = React.useState('')
    const classes = useStyles();
    const [selectedClass, setSelectedClass] = React.useState(null)


    const handleChange = (event) => {
        setSelectedClass(event.target.value);
    };

    React.useEffect(() => {
        getClasses();
    }, []);


    function getClasses() {
        characterCreationService.getClasses().then(r => {
            setClasses(r);
        })
    }

    return <FormControl className={classes.formControl}>
        <InputLabel id="race-simple-select-label">Class</InputLabel>
        <Select
            labelId="class-select-label"
            id="class-select"
            value={selectedClass}
            onChange={handleChange}
        >
            {
                classes.map((selectedClass, i) => {
                    return <MenuItem key={i} value={selectedClass.name}>
                        {selectedClass.name}
                    </MenuItem>;
                })
            }
        </Select>
    </FormControl>;
}