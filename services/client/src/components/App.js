import React from "react";
import Input from "@material-ui/core/Input";
import Authenticate from "./login/Authenticate";
import "../styles/base.scss"
import {Route, BrowserRouter, Switch} from "react-router-dom";
import Home from "./home/Home";
import Profile from "./home/Profile"
import {userService} from "./services/userService";
require('typeface-roboto');

export default function App(props) {

    return <BrowserRouter>
        <Switch>
            <Route path="/login">
                <Authenticate isRegister={false}/>
            </Route>
            <Route path="/register">
                <Authenticate isRegister={true}/>
            </Route>
            <Route path="/">
                <Home/>
            </Route>
        </Switch>
    </BrowserRouter>
}