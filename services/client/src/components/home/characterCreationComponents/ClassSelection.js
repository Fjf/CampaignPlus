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
import {Button, Checkbox} from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import FormGroup from "@material-ui/core/FormGroup";
import ItemsList from "../characterComponents/ItemsList";

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
    const [selectedClass, setSelectedClass] = React.useState(props.cls);

    const [selectingItem, setSelectingItem] = React.useState(false);
    const handleChange = (event) => {
        setSelectedClass(event.target.value);
    };

    function EquipmentOptions(props) {
        const item = props.item;
        if (item === undefined) return null;  // TODO: How the fuck is their json formatted AAAAAAAAAAAAAAAAAHH

        const li = item.from.equipment_category.name.lastIndexOf(" ");
        let categoryRange = item.from.equipment_category.name.substring(0, li);

        // TODO: Fix the database to reduce the amount of nested objects, and set the weapon type correctly.
        return <Typography color="textSecondary" component="span"
                           className={"basic-list-entry"}>
            <div>{item.selected}</div>
            <Button onClick={() => {
                itemFilter = (item) => {
                    if (item.weapon === null) return false;
                    return item.gear_category.includes(categoryRange)
                };
                onSelect = (result) => {
                    item.selected = result.name
                };
                setSelectingItem(true);
            }}>Select {item.from.equipment_category.name}</Button>
        </Typography>
    }

    function Equipment(props) {
        const entry = props.item;
        return <Typography color="textSecondary" component="span"
                           className={"basic-list-entry"}>
            <div>{entry.equipment.name}</div>
            <div>{entry.quantity}</div>
        </Typography>
    }

    function itemRepresentation(item) {
        if ("equipment" in item) return <Equipment item={item}/>;
        else {
            return <EquipmentOptions item={item.equipment_option}/>;
        }
    }


    function EquipmentChoiceSelector(props) {
        const entry = props.item;

        if (Array.isArray(entry.from)) {
            return <>
                {entry.from.map((item, j) => {
                    console.log(item);
                    return <div key={j}>{itemRepresentation(item)}</div>
                })}
            </>
        } else {
            let d = {equipment_option: entry};
            return <div>{itemRepresentation(d)}</div>
        }
    }

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
        </FormControl>
        {selectedClass === "" ? null :
            <Grid className={"card-container"} container spacing={1}>
                <Grid item xs={4} className={"creation-card"}>
                    <Card>
                        <CardContent>
                            <Typography gutterBottom variant="h5"
                                        component="h2">{selectedClass.name}</Typography>
                            <Typography color="textSecondary" component="span" className={"basic-list-entry"}>
                                <div>Hit Die:</div>
                                <div>{selectedClass.hit_die}</div>
                            </Typography>
                            <Typography color="textSecondary" component="span">
                                <div>Saving throws:</div>
                                {selectedClass.saving_throws.map((value, i) => {
                                    return <div key={i} style={{marginLeft: 8}}>{value.name}</div>
                                })}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={4} className={"creation-card"}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" variant="h6"
                                        component="h2">Optional Proficiencies</Typography>
                            <Typography component="span" color="textSecondary">
                                {selectedClass.proficiency_choices.map((choice, i) => {
                                    return <div key={i}><FormControl component="fieldset">
                                        <FormLabel component="legend">Pick {choice.choose}</FormLabel>
                                        <FormGroup>
                                            {choice.from.map((entry, j) => {
                                                return <FormControlLabel
                                                    key={j}
                                                    control={<Checkbox name="checkedA"/>}
                                                    label={entry.name}
                                                />
                                            })}
                                        </FormGroup>
                                    </FormControl></div>
                                })}
                            </Typography>
                            <Typography color="textSecondary" variant="h6"
                                        component="h2">Fixed Proficiencies</Typography>
                            <Typography component={"span"} color="textSecondary">
                                {selectedClass.proficiencies.map((choice, i) => {
                                    return <div key={i}>{choice.name}</div>
                                })}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={4} className={"creation-card"}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" variant="h6"
                                        component="h2">Equipment</Typography>
                            {selectedClass.starting_equipment.starting_equipment.map((entry, i) => {
                                return <Equipment key={i} item={entry}/>
                            })}
                            <Typography color="textSecondary" variant="h6"
                                        component="h2">Equipment Options</Typography>
                            {selectedClass.starting_equipment.starting_equipment_options.map((entry, i) => {
                                return <Typography key={i} color="textSecondary" component="span">
                                    <div>Pick {entry.choose}</div>
                                    <EquipmentChoiceSelector item={entry}/>
                                </Typography>
                            })}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>}
        {selectingItem ? <ItemsList
            filter={itemFilter}
            onSelect={onSelect}
            onClose={() => {
                setSelectingItem(false);
            }}
        /> : null}
    </>
}