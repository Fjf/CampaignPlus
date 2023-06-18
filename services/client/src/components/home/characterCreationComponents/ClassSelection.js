import React from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {makeStyles} from "@mui/styles";

import {characterCreationService} from "../../services/characterCreationService";
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";
import ReactMarkdown from "react-markdown";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card/Card";
import "../../../styles/creation.scss";
import {Button, Checkbox, IconButton} from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import FormGroup from "@mui/material/FormGroup";
import ItemsList from "../characterComponents/ItemsList";
import {MdCreate} from "react-icons/md";
import {useTheme} from "@mui/material/styles";

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: useTheme().spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: useTheme().spacing(2),
    },
}));

let stateStorage = null;
let itemFilter = null;
let onSelect = () => {
};
export default function classSelection(props) {
    const [classes, setClasses] = React.useState([]);
    const styles = useStyles();
    const [selectedClass, setSelectedClass] = React.useState(null);
    const [equipment, setEquipment] = React.useState([]);

    const [selectingItem, setSelectingItem] = React.useState(false);
    const handleChange = (event) => {
        setSelectedClass(event.target.value);
    };

    React.useEffect(() => {
        if (stateStorage !== null) {
            setClasses(stateStorage.classes);

            if (props.cls === "") return;
            setSelectedClass(stateStorage.classes.filter(e => {
                return e.name === props.cls.name
            })[0]);
        } else {
            characterCreationService.getClasses().then(r => {
                setClasses(r);
            });
        }
    }, []);

    React.useEffect(() => {
        stateStorage = {
            classes: [...classes]
        };
        props.setClass(selectedClass);
    }, [classes, selectedClass]);

    return <>
        <FormControl variant="standard" className={styles.formControl}>
            <InputLabel id="class-simple-select-label">Class</InputLabel>
            <Select
                variant="standard"
                labelId="class-select-label"
                id="class-select"
                value={selectedClass === null ? "" : selectedClass}
                onChange={handleChange}>
                {
                    classes.map((cls, i) => {
                        return <MenuItem key={i} value={cls}>
                            {cls.name}
                        </MenuItem>;
                    })
                }
            </Select>
        </FormControl>
        {selectedClass === null ? null :
            <Grid className={"card-container"} container spacing={1}>
                <Grid item xs={4} className={"creation-card"}>
                    <Card>
                        <CardContent>
                            <Typography gutterBottom variant="h5"
                                        component="h2">{selectedClass.name}</Typography>
                            <Typography color="textSecondary" component="span" className={"basic-list-entry"}>
                                <div>Hit Dice:</div>
                                <div>{selectedClass.hit_dice}</div>
                            </Typography>
                            <Typography color="textSecondary" component="span">
                                <div>Saving throws: {selectedClass.proficiencies.saving_throws}</div>
                            </Typography>
                            <Typography color="textSecondary" variant="h6"
                                        component="h2">Proficiencies</Typography>
                            <Typography component={"span"} color="textSecondary">
                                <div>{selectedClass.proficiencies.skills}</div>

                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={4} className={"creation-card"}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" variant="h6"
                                        component="h2">Equipment Info</Typography>
                            <ReactMarkdown source={selectedClass.equipment}/>
                            <Typography color="textSecondary" variant="h6"
                                        component="h2">Equipment</Typography>
                            <IconButton onClick={e => {
                                onSelect = (item) => {
                                    setEquipment([...equipment, item]);
                                };
                                setSelectingItem(true);
                            }}><MdCreate/></IconButton>
                            {
                                equipment.map((item, i) => {
                                    return <div key={i}>{item.name}</div>
                                })
                            }
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={4} className={"creation-card"}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" variant="h6"
                                        component="h2">Armor Proficiency</Typography>
                            <Typography component="span" color="textSecondary">
                                <ReactMarkdown source={selectedClass.proficiencies.armor}/>
                            </Typography>
                            <Typography color="textSecondary" variant="h6"
                                        component="h2">Tool Proficiency</Typography>
                            <Typography component="span" color="textSecondary">
                                <ReactMarkdown source={selectedClass.proficiencies.tools}/>
                            </Typography>
                            <Typography color="textSecondary" variant="h6"
                                        component="h2">Weapon Proficiency</Typography>
                            <Typography component="span" color="textSecondary">
                                <ReactMarkdown source={selectedClass.proficiencies.weapons}/>
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

            </Grid>}
        {selectingItem ? <ItemsList
            closeOnSelect={true}
            filter={itemFilter}
            onSelect={onSelect}
            onClose={() => {
                setSelectingItem(false);
            }}
        /> : null}
    </>;
}
