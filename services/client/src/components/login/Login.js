import Input from "@material-ui/core/Input/Input";
import React from "react";
import "../../styles/authentication.scss"
import Button from "@material-ui/core/Button";
import {userService} from "../services/userService";
import TextField from "@material-ui/core/TextField";

export default function Login(props) {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");

    function handleLogin() {
        if (username === "" || password === "")
            return;

        userService.login(username, password).then(r => {
            console.log(r);
        });
    }

    return <div className={"authenticationInput"}>
        <h3>Login</h3>

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
        <Button
            onClick={handleLogin}
        >Submit</Button>
    </div>
}

