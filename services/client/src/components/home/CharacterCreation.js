import React from "react";
import {makeStyles} from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import RaceSelection from "./characterCreationComponents/RaceSelection";
import ClassSelection from "./characterCreationComponents/ClassSelection";
import {characterService} from "../services/characterService";
import CharacterFinalization from "./characterCreationComponents/CharacterFinalization";


const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        display: "flex",
        flexDirection: "column",
    },
    backButton: {
        marginRight: theme.spacing(1),
    },
    instructions: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
}));


const blankCharacter = {
    "backstory": "",
    "info": {
        "class_ids": [],
        "subclass_ids": []
    },
    "name": "",
    "race": "",
};

export default function CharacterCreation(props) {
    const user = props.user;
    const onCreate = props.onCreate

    const [activeStep, setActiveStep] = React.useState(0);
    const [character, setCharacter] = React.useState(blankCharacter);

    function getSteps() {
        return [
            character.race === "" ? "Race" : character.race,
            "Class",
            "Finalize Character"
        ]
    }

    const steps = getSteps();
    const classes = useStyles();

    const getStepContent = (stepIndex) => {
        switch (stepIndex) {
            // TODO: Add player name and backstory input fields
            case 0:
                return <RaceSelection
                    race={character.race}
                    setRace={(race) => setCharacter({...character, race: race})}/>;
            case 1:
                return <ClassSelection
                    cls={character.info.class_ids}
                    setClass={(cls) => setCharacter({...character, info: {class_ids: [cls], subclass_ids: []}})}/>;
            case 2:
                return <CharacterFinalization
                    character={character}
                    setCharacter={setCharacter}/>;
            default:
                return 'Unknown stepIndex';
        }
    };

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);

        if (activeStep === 2) {
            // Finalize character creation.
            console.log(character);
            characterService.create(character).then(data => {
                console.log(data);
                onCreate(data);
            });
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    return <div className={"main-content"}>
        <div className={classes.root}>
            <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label, i) => (
                    <Step key={i}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            <div style={{
                padding: 8,
                display: "flex",
                flexDirection: "column",
                minHeight: 0
            }}>{getStepContent(activeStep)}</div>
            <div style={{display: "flex", justifyContent: "end", padding: 8}}>
                {activeStep === steps.length ? (
                    <>
                        <Typography className={classes.instructions}>All steps completed</Typography>
                        <Button onClick={handleReset}>Reset</Button>
                    </>
                ) : (
                    <>
                        <Button
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            className={classes.backButton}
                        >
                            Back
                        </Button>
                        <Button variant="contained" color="primary" onClick={handleNext}>
                            {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                        </Button>
                    </>
                )}
            </div>
        </div>
    </div>
}