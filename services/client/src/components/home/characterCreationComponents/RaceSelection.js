import React from "react";
import ReactMarkdown from "react-markdown";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {makeStyles} from "@mui/styles";
import {characterCreationService} from "../../services/characterCreationService";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import red from "@mui/material/colors/red";
import Grid from "@mui/material/Grid";
import {useTheme} from "@mui/material/styles"
import "../../../styles/creation.scss";


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
export default function RaceSelection(props) {
    const [races, setRaces] = React.useState([]);
    const classes = useStyles();
    const [selectedRace, setSelectedRace] = React.useState(props.race);

    const handleChange = (event) => {
        setSelectedRace(event.target.value);
    };

    React.useEffect(() => {
        console.log(stateStorage);
        if (stateStorage !== null) {
            setRaces(stateStorage.races);

            if (props.race === "") return;
            setSelectedRace(stateStorage.races.filter(e => {
                return e.name === props.race.name
            })[0]);
        } else {
            characterCreationService.getRaces().then(r => {
                setRaces(r);
            });
        }
    }, []);

    React.useEffect(() => {
        stateStorage = {
            races: [...races],
        };
        props.setRace(selectedRace.name);
    }, [races, selectedRace]);

    return <>
        <FormControl variant="standard" className={classes.formControl}>
            <InputLabel id="race-simple-select-label">Race</InputLabel>
            <Select
                variant="standard"
                labelId="race-select-label"
                id="race-select"
                value={selectedRace}
                onChange={handleChange}>
                {

                    races.map((race, i) => {
                        return <MenuItem key={i} value={race}>
                            {race.name}
                        </MenuItem>;

                    })
                }
            </Select>
        </FormControl>
        {selectedRace === "" ? null :
            <Grid container spacing={1} className={"card-container"}>
                <Grid item xs={3} className={"creation-card"}>
                    <Card>
                        <CardMedia
                            className={classes.media}
                            image="/static/images/races/dwarf.jpg"
                            title={selectedRace.name}
                        />
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="h2">
                                {selectedRace.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="div">
                                <ReactMarkdown source={selectedRace.desc}/>
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="div">
                                <ReactMarkdown source={selectedRace.traits}/>
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={3} className={"creation-card"}>
                    <Card>
                        <CardContent>
                            <Typography variant="body2" color="textSecondary" component="div">
                                <ReactMarkdown source={selectedRace.speed_desc}/>
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="div">
                                <ReactMarkdown source={selectedRace.age}/>
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={3} className={"creation-card"}>
                    <Card>
                        <CardContent>
                            <Typography variant="body2" color="textSecondary" component="div">
                                <ReactMarkdown source={selectedRace.alignment}/>
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="div">
                                <ReactMarkdown source={selectedRace.size}/>
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={3} className={"creation-card"}>
                    <Card>
                        <CardContent>
                            <Typography variant="body2" color="textSecondary" component="div">
                                <ReactMarkdown source={selectedRace.languages}/>
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="div">
                                <ReactMarkdown source={selectedRace.vision}/>
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        }
    </>;
}