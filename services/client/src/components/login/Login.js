import Input from "@material-ui/core/Input/Input";
import React from "react";
import "../../styles/authentication.scss"
import Button from "@material-ui/core/Button";
import {userService} from "../services/userService";
import TextField from "@material-ui/core/TextField";
import {useHistory} from "react-router-dom";

export default function Login(props) {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const history = useHistory();
    const [errors, setErrors] = React.useState({username: null, password: null});

    function handleLogin(event) {
        event.preventDefault();

        let e = {...errors};
        if (username === "") {
            e.username = "Please fill in a username.";
        }
        if (password === "") {
            e.password = "Please fill in a password.";
        }

        if (!Object.values(e).every(i => i === null)) {
            setErrors(e);
            return;
        }

        userService.login(username, password).then(r => {
            history.push(r.refer);
        }, error => {
            console.log("Error:", error);
            if (error.toLowerCase().includes("password")) {
                setErrors({
                    ...errors,
                    password: error
                })
            }
            if (error.toLowerCase().includes("username")) {
                setErrors({
                    ...errors,
                    username: error
                })
            }
        });

        return false;
    }



    return <form className={"authenticationInput"} onSubmit={handleLogin} action='#'>
        <h3>Login</h3>
        <TextField
            type={"text"}
            value={username}
            onChange={(e) => {
                setUsername(e.target.value);
                setErrors({
                    ...errors,
                    username: null
                })
            }}
            label={"Username"}
            color={"secondary"}
            error={errors.username !== null}
            helperText={errors.username}
        />
        <TextField
            type={"password"}
            value={password}
            onChange={(e) => {
                setPassword(e.target.value);
                setErrors({
                    ...errors,
                    password: null
                })
            }}
            label={"Password"}
            color={"secondary"}
            error={errors.password !== null}
            helperText={errors.password}
        />
        <Button type="submit">Submit</Button>
    </form>
}

