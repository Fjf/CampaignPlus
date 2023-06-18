import React from "react";
import Authenticate from "./login/Authenticate";
import "../styles/base.scss"
import {Route, BrowserRouter, Routes} from "react-router-dom";
import Home from "./home/Home";

require('@fontsource/lato');

export default function App(props) {

    return <BrowserRouter>
        <Routes>
            <Route path="/login" element={<Authenticate isRegister={false}/>}/>
            <Route path="/register" element={<Authenticate isRegister={true}/>}/>
            <Route path="/*" element={<Home/>}/>
        </Routes>
    </BrowserRouter>
}