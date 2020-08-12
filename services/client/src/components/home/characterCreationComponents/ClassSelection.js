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

let stateStorage = null;
export default function classSelection(props) {
    const [classes, setClasses] = React.useState([]);
    const styles = useStyles();
    const [selectedClass, setSelectedClass] = React.useState("");


    const handleChange = (event) => {
        setSelectedClass(event.target.value);
    };

    React.useEffect(() => {
        if (stateStorage !== null) {
            setClasses(stateStorage.classes);
            setSelectedClass(stateStorage.classes.filter(e => {
                return e.name === stateStorage.className
            })[0]);
        } else {
            characterCreationService.getClasses().then(r => {
                setClasses(r);
            });
        }
    }, []);

    React.useEffect(() => {
        stateStorage = {
            classes: [...classes],
            className: selectedClass === "" ? "" : selectedClass.name
        }
    }, [classes, selectedClass]);


    return <>
        <FormControl className={styles.formControl}>
            <InputLabel id="class-simple-select-label">Class</InputLabel>
            <Select
                labelId="class-select-label"
                id="class-select"
                value={selectedClass}
                onChange={handleChange}
            >
                {
                    classes.map((cls, i) => {
                        return <MenuItem key={i} value={cls}>
                            {cls.name}
                        </MenuItem>;
                    })
                }
            </Select>
            {selectedClass === "" ? null :
                <div>
                    ashidoashdoihasdiohadsoi
                    {JSON.stringify(selectedClass.name)}
                </div>}
        </FormControl>

    </>
}