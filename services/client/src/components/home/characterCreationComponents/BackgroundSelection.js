import {makeStyles} from "@material-ui/core/styles";
import React from "react";
import {characterCreationService} from "../../services/characterCreationService";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel/InputLabel";
import Select from "@material-ui/core/Select/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import ReactMarkdown from "react-markdown";

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    }
}));


let stateStorage = null;
export default function BackgroundSelection(props) {
    const [backgrounds, setBackgrounds] = React.useState([]);
    const classes = useStyles();
    const [selectedBackground, setSelectedBackground] = React.useState(props.background);

    const handleChange = (event) => {
        setSelectedBackground(event.target.value);
    };

    React.useEffect(() => {
        if (stateStorage !== null) {
            setBackgrounds(stateStorage.backgrounds);

            if (props.background === "") return;
            setSelectedBackground(stateStorage.backgrounds.filter(e => {
                return e.name === props.background.name
            })[0]);
        } else {
            characterCreationService.getBackgrounds().then(r => {
                setBackgrounds(r);
            });
        }
    }, []);

    React.useEffect(() => {
        stateStorage = {
            backgrounds: [...backgrounds],
        };
        props.setBackground(selectedBackground);
    }, [backgrounds, selectedBackground]);

    return <>
        <FormControl className={classes.formControl}>
            <InputLabel>Background</InputLabel>
            <Select
                labelId="background-select-label"
                id="backround-select"
                value={selectedBackground}
                onChange={handleChange}
            >
                {

                    backgrounds.map((background, i) => {
                        return <MenuItem key={i} value={background}>
                            {background.name}
                        </MenuItem>;

                    })
                }
            </Select>
        </FormControl>
        {selectedBackground === "" ? null :
            <Grid container spacing={1} className={"card-container"}>
                <Grid item xs={4} className={"creation-card"}>
                    <Card>
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="h2">
                                {selectedBackground.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="div">
                                <ReactMarkdown source={selectedBackground.desc}/>
                            </Typography>
                            <Typography color="textSecondary" variant="h6"
                                        component="h2">Skill proficiencies</Typography>
                            <Typography variant="body2" color="textSecondary" component="div">

                                <ReactMarkdown source={selectedBackground.skills}/>
                            </Typography>
                            <Typography color="textSecondary" variant="h6"
                                        component="h2">Tool proficiencies</Typography>
                            <Typography variant="body2" color="textSecondary" component="div">
                                <ReactMarkdown source={(selectedBackground.tools === null) ? "None" : selectedBackground.tools}/>
                            </Typography>
                            <Typography color="textSecondary" variant="h6"
                                        component="h2">Languages </Typography>
                            <Typography variant="body2" color="textSecondary" component="div">
                                <ReactMarkdown source={ (selectedBackground.languages === null) ? "None" : selectedBackground.languages} />
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={4} className={"creation-card"}>
                    <Card>
                        <CardContent>
                              <Typography color="textSecondary" variant="h6"
                                        component="h2">Equipment </Typography>
                            <Typography variant="body2" color="textSecondary" component="div">
                                <ReactMarkdown source={selectedBackground.equipment}/>
                            </Typography>
                              <Typography color="textSecondary" variant="h6"
                                        component="h2">Feature </Typography>
                            <Typography variant="body2" color="textSecondary" component="div">
                                <ReactMarkdown source={`**${selectedBackground.feature}**`}/>
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="div">
                                <ReactMarkdown source={selectedBackground.feature_desc}/>
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={4} className={"creation-card"}>
                    <Card>
                        <CardContent>
                            <Typography variant="body2" color="textSecondary" component="div">
                                <ReactMarkdown source={selectedBackground.extra}/>
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        }
    </>
}