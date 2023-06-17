import React from "react";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import {makeStyles} from "@material-ui/core/styles";

import {characterCreationService} from "../../services/characterCreationService";
import Typography from "@material-ui/core/Typography";
import CardContent from "@material-ui/core/CardContent";
import ReactMarkdown from "react-markdown";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card/Card";
import "../../../styles/creation.scss";
import {Button, Checkbox, IconButton} from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import FormGroup from "@material-ui/core/FormGroup";
import ItemsList from "../characterComponents/ItemsList";
import {MdCreate} from "react-icons/md";

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
        <FormControl className={styles.formControl}>
            <InputLabel id="class-simple-select-label">Class</InputLabel>
            <Select
                labelId="class-select-label"
                id="class-select"
                value={selectedClass === null ? "" : selectedClass}
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
    </>
}
