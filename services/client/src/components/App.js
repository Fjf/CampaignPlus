import React from "react";
import Input from "@material-ui/core/Input";
import Authenticate from "./login/Authenticate";
import "../styles/base.scss"
import {Route, BrowserRouter, Switch} from "react-router-dom";
import Home from "./home/Home";

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