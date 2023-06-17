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
import {TextareaAutosize, TextField} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    }
}));


export default function CharacterFinalization(props) {
    return <>
        <Grid className={"card-container"} container spacing={1}>
            <Grid item xs={12} className={"creation-card"}>
                <Card>
                    <CardContent>
                        <Typography variant="body2" color="textSecondary" component="div">
                            <div>Name</div>
                        </Typography>
                        <TextField
                            value={props.character.name}
                            onChange={(e) => {
                                props.setCharacter({
                                    ...props.character,
                                    name: e.target.value
                                })
                            }}
                        />
                        <Typography variant="body2" color="textSecondary" component="div">
                            <div>Backstory</div>
                        </Typography>
                        <TextareaAutosize
                            value={props.character.backstory}
                            onChange={(e) => {
                                props.setCharacter({
                                    ...props.character,
                                    backstory: e.target.value
                                })
                            }}
                        />
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    </>
}