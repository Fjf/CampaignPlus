import Input from "@material-ui/core/Input/Input";
import React from "react";
import "../../styles/authentication.scss"
import Button from "@material-ui/core/Button";
import {userService} from "../services/userService";
import TextField from "@material-ui/core/TextField";

export default function Register(props) {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [cfPassword, setCfPassword] = React.useState("");
    const [email, setEmail] = React.useState("");

    function register() {
        if (username === "" || password === "" || cfPassword === "" || email === "")
            return;
        if (password !== cfPassword)
            return;

        userService.registerUser(username, password, email).then(
            // Go to main index.
        );
    }

    return <div className={"authenticationInput"}>
        <h3>Register</h3>
        <TextField
            type={"text"}
            value={username}
            onChange={(e) => {
                setUsername(e.target.value);
            }}
            label={"Username"}
            color={"secondary"}
        />
        <TextField
            type={"password"}
            value={password}
            onChange={(e) => {
                setPassword(e.target.value);
            }}
            label={"Password"}
            color={"secondary"}
        />
        <TextField
            type={"password"}
            value={cfPassword}
            onChange={(e) => {
                setCfPassword(e.target.value);
            }}
            label={"Confirm Password"}
            color={"secondary"}
        />
        <TextField
            type={"email"}
            value={email}
            onChange={(e) => {
                setEmail(e.target.value);
            }}
            label={"Email"}
            color={"secondary"}
        />
        <Button
            onClick={() => register()}
        >Submit</Button>
    </div>
}

