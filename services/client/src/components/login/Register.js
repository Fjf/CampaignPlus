import Input from "@mui/material/Input/Input";
import React from "react";
import "../../styles/authentication.scss"
import Button from "@mui/material/Button";
import {userService} from "../services/userService";
import TextField from "@mui/material/TextField";
import {useNavigate} from "react-router-dom";


export default function Register(props) {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [cfPassword, setCfPassword] = React.useState("");
    const [email, setEmail] = React.useState("");
    const history = useNavigate()
    const [errors, setErrors] = React.useState({username: null, password: null, cfPassword: null, email: null})

    function register() {
        let e = {...errors};
        if (username === "") {
            e.username = "Please fill in a username."
        }

        if (password !== cfPassword || cfPassword === "") {
            e.password = "Passwords do not match";
            e.cfPassword = "Passwords do not match";
        }

        if (password === "") {
            e.password = "Please fill in a password.";
        }

        if (email === "") {
            e.email = "Please fill in your email address.";
        }

        setErrors(e);

        if (!Object.values(e).every(i => i === null)) return;

        userService.registerUser(username, password, email).then(
            r => {
                history.push(r.refer)
            }, error => {
                if (error.includes("username")) {
                    setErrors({
                        ...errors,
                        username: error
                    })
                }
                if (error.includes("email")) {
                    setErrors({
                        ...errors,
                        email: error
                    })
                }
            });
    }

    return <div className={"authenticationInput"}>
        <h3>Register</h3>
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
                    password: null,
                    cfPassword: null
                })

            }}
            label={"Password"}
            color={"secondary"}
            error={errors.password !== null}
            helperText={errors.password}
        />
        <TextField
            type={"password"}
            value={cfPassword}
            onChange={(e) => {
                setCfPassword(e.target.value);
                setErrors({
                    ...errors,
                    password: null,
                    cfPassword: null
                })
            }}
            label={"Confirm Password"}
            color={"secondary"}
            error={errors.cfPassword !== null}
            helperText={errors.cfPassword}
        />
        <TextField
            type={"email"}
            value={email}
            onChange={(e) => {
                setEmail(e.target.value);
                setErrors({
                    ...errors,
                    email: null
                })
            }}
            label={"Email"}
            color={"secondary"}
            error={errors.email !== null}
            helperText={errors.email}
        />
        <Button
            onClick={() => register()}
        >Submit</Button>
    </div>
}

