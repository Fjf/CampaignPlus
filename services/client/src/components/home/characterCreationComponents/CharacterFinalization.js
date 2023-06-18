import {makeStyles} from "@mui/styles";
import React from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import {TextareaAutosize, TextField} from "@mui/material";
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
                            variant="standard"
                            value={props.character.name}
                            onChange={(e) => {
                                props.setCharacter({
                                    ...props.character,
                                    name: e.target.value
                                })
                            }} />
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
    </>;
}