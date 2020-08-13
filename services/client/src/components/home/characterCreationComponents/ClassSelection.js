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
import {Checkbox} from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import FormGroup from "@material-ui/core/FormGroup";

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
    const [selectedClass, setSelectedClass] = React.useState(props.cls);


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

    let selectedCls = {
        "name": "Barbarian",
        "hit_die": 12,
        "proficiency_choices": [{
            "choose": 2,
            "type": "proficiencies",
            "from": [{"name": "Skill: Animal Handling"}, {"name": "Skill: Athletics"}, {"name": "Skill: Intimidation"}, {"name": "Skill: Nature"}, {"name": "Skill: Perception"}, {"name": "Skill: Survival"}]
        }],
        "proficiencies": [{"name": "Light armor"}, {"name": "Medium armor"}, {"name": "Shields"}, {"name": "Simple weapons"}, {"name": "Martial weapons"}],
        "saving_throws": [{"name": "STR"}, {"name": "CON"}],
        "starting_equipment": {
            "class": {"name": "Barbarian"},
            "index": 1,
            "starting_equipment": [{
                "equipment": {"name": "Explorer's Pack"},
                "quantity": 1
            }, {"equipment": {"name": "Javelin"}, "quantity": 4}],
            "starting_equipment_options": [{
                "choose": 1,
                "type": "equipment",
                "from": [{"equipment": {"name": "Greataxe"}, "quantity": 1}, {
                    "equipment_option": {
                        "choose": 1,
                        "type": "equipment",
                        "from": {"equipment_category": {"name": "Martial Melee Weapons"}}
                    }
                }]
            }, {
                "choose": 1,
                "type": "equipment",
                "from": [{"equipment": {"name": "Handaxe"}, "quantity": 2}, {
                    "equipment_option": {
                        "choose": 1,
                        "type": "equipment",
                        "from": {"equipment_category": {"name": "Simple Weapons"}}
                    }
                }]
            }]
        },
        "class_levels": [
            {
                "level": 1,
                "ability_score_bonuses": 0,
                "prof_bonus": 2,
                "feature_choices": [],
                "features": [{"name": "Rage"}, {"name": "Unarmored Defense"}],
                "class_specific": {"rage_count": 2, "rage_damage_bonus": 2, "brutal_critical_dice": 0},
                "index": 1,
                "class": {"name": "Barbarian"}
            }, {
                "level": 2,
                "ability_score_bonuses": 0,
                "prof_bonus": 2,
                "feature_choices": [],
                "features": [{"name": "Reckless Attack"}, {"name": "Danger Sense"}],
                "class_specific": {"rage_count": 2, "rage_damage_bonus": 2, "brutal_critical_dice": 0},
                "index": 2,
                "class": {"name": "Barbarian"}
            }, {
                "level": 3,
                "feature_choices": [],
                "features": [{"name": "Primal Path"}, {"name": "Frenzy"}],
                "class": {"name": "Barbarian"},
                "subclass": {"name": "Berserker"},
                "index": 241
            }, {
                "level": 3,
                "ability_score_bonuses": 0,
                "prof_bonus": 2,
                "feature_choices": [],
                "features": [{"name": "Primal Path"}],
                "class_specific": {"rage_count": 3, "rage_damage_bonus": 2, "brutal_critical_dice": 0},
                "index": 3,
                "class": {"name": "Barbarian"}
            }, {
                "level": 4,
                "ability_score_bonuses": 1,
                "prof_bonus": 2,
                "feature_choices": [],
                "features": [{"name": "Ability Score Improvement 1"}],
                "class_specific": {"rage_count": 3, "rage_damage_bonus": 2, "brutal_critical_dice": 0},
                "index": 4,
                "class": {"name": "Barbarian"}
            }, {
                "level": 5,
                "ability_score_bonuses": 1,
                "prof_bonus": 3,
                "feature_choices": [],
                "features": [{"name": "Extra Attack"}, {"name": "Fast Movement"}],
                "class_specific": {"rage_count": 3, "rage_damage_bonus": 2, "brutal_critical_dice": 0},
                "index": 5,
                "class": {"name": "Barbarian"}
            }, {
                "level": 6,
                "ability_score_bonuses": 1,
                "prof_bonus": 3,
                "feature_choices": [],
                "features": [],
                "class_specific": {"rage_count": 4, "rage_damage_bonus": 2, "brutal_critical_dice": 0},
                "index": 6,
                "class": {"name": "Barbarian"}
            }, {
                "level": 6,
                "feature_choices": [],
                "features": [{"name": "Mindless Rage"}],
                "index": 242,
                "class": {"name": "Barbarian"},
                "subclass": {"name": "Berserker"}
            }, {
                "level": 7,
                "ability_score_bonuses": 1,
                "prof_bonus": 3,
                "feature_choices": [],
                "features": [{"name": "Feral Instinct"}],
                "class_specific": {"rage_count": 4, "rage_damage_bonus": 2, "brutal_critical_dice": 0},
                "index": 7,
                "class": {"name": "Barbarian"}
            }, {
                "level": 8,
                "ability_score_bonuses": 2,
                "prof_bonus": 3,
                "feature_choices": [],
                "features": [{"name": "Ability Score Improvement 2"}],
                "class_specific": {"rage_count": 4, "rage_damage_bonus": 2, "brutal_critical_dice": 0},
                "index": 8,
                "class": {"name": "Barbarian"}
            }, {
                "level": 9,
                "ability_score_bonuses": 2,
                "prof_bonus": 4,
                "feature_choices": [],
                "features": [{"name": "Brutal Critical (1 die)"}],
                "class_specific": {"rage_count": 4, "rage_damage_bonus": 3, "brutal_critical_dice": 1},
                "index": 9,
                "class": {"name": "Barbarian"}
            }, {
                "level": 10,
                "ability_score_bonuses": 2,
                "prof_bonus": 4,
                "feature_choices": [],
                "features": [],
                "class_specific": {"rage_count": 4, "rage_damage_bonus": 3, "brutal_critical_dice": 1},
                "index": 10,
                "class": {"name": "Barbarian"}
            }, {
                "level": 10,
                "feature_choices": [],
                "features": [{"name": "Intimidating Presence"}],
                "class": {"name": "Barbarian"},
                "subclass": {"name": "Berserker"},
                "index": 243
            }, {
                "level": 11,
                "ability_score_bonuses": 2,
                "prof_bonus": 4,
                "feature_choices": [],
                "features": [{"name": "Relentless Rage"}],
                "class_specific": {"rage_count": 4, "rage_damage_bonus": 3, "brutal_critical_dice": 1},
                "index": 11,
                "class": {"name": "Barbarian"}
            }, {
                "level": 12,
                "ability_score_bonuses": 3,
                "prof_bonus": 4,
                "feature_choices": [],
                "features": [{"name": "Ability Score Improvement 3"}],
                "class_specific": {"rage_count": 5, "rage_damage_bonus": 3, "brutal_critical_dice": 1},
                "index": 12,
                "class": {"name": "Barbarian"}
            }, {
                "level": 13,
                "ability_score_bonuses": 3,
                "prof_bonus": 5,
                "feature_choices": [],
                "features": [{"name": "Brutal Critical (2 dice)"}],
                "class_specific": {"rage_count": 5, "rage_damage_bonus": 3, "brutal_critical_dice": 2},
                "index": 13,
                "class": {"name": "Barbarian"}
            }, {
                "level": 14,
                "ability_score_bonuses": 3,
                "prof_bonus": 5,
                "feature_choices": [],
                "features": [],
                "class_specific": {"rage_count": 5, "rage_damage_bonus": 3, "brutal_critical_dice": 2},
                "index": 14,
                "class": {"name": "Barbarian"}
            }, {
                "level": 14,
                "feature_choices": [],
                "features": [{"name": "Retaliation"}],
                "class": {"name": "Barbarian"},
                "subclass": {"name": "Berserker"},
                "index": 244
            }, {
                "level": 15,
                "ability_score_bonuses": 3,
                "prof_bonus": 5,
                "feature_choices": [],
                "features": [{"name": "Persistent Rage"}],
                "class_specific": {"rage_count": 5, "rage_damage_bonus": 3, "brutal_critical_dice": 2},
                "index": 15,
                "class": {"name": "Barbarian"}
            }, {
                "level": 16,
                "ability_score_bonuses": 4,
                "prof_bonus": 5,
                "feature_choices": [],
                "features": [{"name": "Ability Score Improvement 4"}],
                "class_specific": {"rage_count": 5, "rage_damage_bonus": 4, "brutal_critical_dice": 2},
                "index": 16,
                "class": {"name": "Barbarian"}
            }, {
                "level": 17,
                "ability_score_bonuses": 4,
                "prof_bonus": 6,
                "feature_choices": [],
                "features": [{"name": "Brutal Critical (3 dice)"}],
                "class_specific": {"rage_count": 6, "rage_damage_bonus": 4, "brutal_critical_dice": 3},
                "index": 17,
                "class": {"name": "Barbarian"}
            }, {
                "level": 18,
                "ability_score_bonuses": 4,
                "prof_bonus": 6,
                "feature_choices": [],
                "features": [{"name": "Indomitable Might"}],
                "class_specific": {"rage_count": 6, "rage_damage_bonus": 4, "brutal_critical_dice": 3},
                "index": 18,
                "class": {"name": "Barbarian"}
            }, {
                "level": 19,
                "ability_score_bonuses": 5,
                "prof_bonus": 6,
                "feature_choices": [],
                "features": [{"name": "Ability Score Improvement 5"}],
                "class_specific": {"rage_count": 6, "rage_damage_bonus": 4, "brutal_critical_dice": 3},
                "index": 19,
                "class": {"name": "Barbarian"}
            }, {
                "level": 20,
                "ability_score_bonuses": 5,
                "prof_bonus": 6,
                "feature_choices": [],
                "features": [{"name": "Primal Champion"}],
                "class_specific": {"rage_count": 9999, "rage_damage_bonus": 4, "brutal_critical_dice": 3},
                "index": 20,
                "class": {"name": "Barbarian"}
            }],
        "subclasses": [{"name": "Berserker"}]
    };

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
        {selectedCls === "" ? null :
            <Grid className={"card-container"} container spacing={1}>
                <Grid item xs={4} className={"creation-card"}>
                    <Card>
                        <CardContent>
                            <Typography gutterBottom variant="h5"
                                        component="h2">{selectedCls.name}</Typography>
                            <Typography color="textSecondary" component="span" className={"basic-list-entry"}>
                                <div>Hit Die:</div>
                                <div>{selectedCls.hit_die}</div>
                            </Typography>
                            <Typography color="textSecondary" component="span">
                                <div>Saving throws:</div>
                                {selectedCls.saving_throws.map((value, i) => {
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
                                {selectedCls.proficiency_choices.map((choice, i) => {
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
                                {selectedCls.proficiencies.map((choice, i) => {
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
                                        component="h2">{selectedCls.name}</Typography>
                            <Typography color="textSecondary" component="span" className={"basic-list-entry"}>
                                <div>Hit Die:</div>
                                <div>{selectedCls.hit_die}</div>
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>}

    </>
}