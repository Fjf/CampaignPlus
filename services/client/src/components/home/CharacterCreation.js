import React from "react";
import {makeStyles} from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import {characterCreationService} from "../services/characterCreationService";
import ListSubheader from "@material-ui/core/ListSubheader";
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import RaceSelection from "./characterCreationComponents/RaceSelection";
import ClassSelection from "./characterCreationComponents/ClassSelection";


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

function getSteps() {
    return ['Race', 'Class', 'Skills', 'Equipment'];
}


export default function CharacterCreation(props) {
    const user = props.user

    const [activeStep, setActiveStep] = React.useState(0);
    const steps = getSteps()
    const classes = useStyles();

    const getStepContent = (stepIndex) => {
        switch (stepIndex) {
            case 0:
                return <RaceSelection/>;
            case 1:
                return <ClassSelection/>;
            case 2:
                return 'This is where your skills are selected';
            case 3:
                return 'This is where the equipment is selected';
            default:
                return 'Unknown stepIndex';
        }
    };

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
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
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            {getStepContent(activeStep)}
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