import React from "react";
import ReactMarkdown from "react-markdown";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import {makeStyles} from "@material-ui/core/styles";
import {characterCreationService} from "../../services/characterCreationService";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import Collapse from "@material-ui/core/Collapse";
import red from "@material-ui/core/colors/red";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import IconButton from "@material-ui/core/IconButton";
import clsx from "clsx";
import Grid from "@material-ui/core/Grid";


const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },

    root: {
        height: "100%",
        overflowY: "auto"
    },
    media: {
        height: 0,
        paddingTop: '56.25%', // 16:9
    },
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
    avatar: {
        backgroundColor: red[500],
    },

}));

let stateStorage = null;
export default function RaceSelection(props) {
    const [races, setRaces] = React.useState([]);
    const classes = useStyles();
    const [selectedRace, setSelectedRace] = React.useState("");

    const handleChange = (event) => {
        setSelectedRace(event.target.value);
    };

    React.useEffect(() => {
        if (stateStorage !== null) {
            console.log(stateStorage);
            setRaces(stateStorage.races);
            setSelectedRace(stateStorage.races.filter(e => {return e.name === stateStorage.raceName})[0]);
        } else {
            characterCreationService.getRaces().then(r => {
                setRaces(r);
            });
        }
    }, []);

    React.useEffect(() => {
        stateStorage = {
            races: [...races],
            raceName: selectedRace === "" ? "" : selectedRace.name
        }
    }, [races, selectedRace]);

    return <>
        <FormControl className={classes.formControl}>
            <InputLabel id="race-simple-select-label">Race</InputLabel>
            <Select
                labelId="race-select-label"
                id="race-select"
                value={selectedRace}
                onChange={handleChange}
            >
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
            <Grid style={{flex: 1, display: "flex", minHeight: 0}} container spacing={1}>
                <Grid item xs={3} className={classes.root}>
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
                <Grid item xs={3} className={classes.root}>
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
                <Grid item xs={3} className={classes.root}>
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
                <Grid item xs={3} className={classes.root}>
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
    </>
}