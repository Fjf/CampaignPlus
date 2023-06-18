import {makeStyles} from "@mui/styles";
import React from "react";
import {characterCreationService} from "../../services/characterCreationService";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel/InputLabel";
import Select from "@mui/material/Select/Select";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import ReactMarkdown from "react-markdown";
import {useTheme} from "@mui/material/styles";

const useStyles = makeStyles(() => ({
    formControl: {
        margin: useTheme().spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: useTheme().spacing(2),
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