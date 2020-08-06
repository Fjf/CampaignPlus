import React from "react";
import "../styles/dice-roller.scss";
import Button from "@material-ui/core/Button";
import {TextField} from "@material-ui/core";

export default function DiceRoller(props) {
    const [isRolling, setIsRolling] = React.useState(false);


    return <>
        <div className={"dice-bar"}>
            <div className={"dice-counter"} id="dice-counter"/>

            <TextField type="text" id="set" value="4d6" style={{width: "6em"}}/><br/>
            <Button id="clear">Clear Result</Button>
            <Button onClick={() => {
                setIsRolling(!isRolling);
            }}>Roll Dice</Button>
        </div>

        <div id="canvas" className={"dice-canvas"}>
            <canvas className={"dice-canvas"}/>
        </div>
    </>
}
