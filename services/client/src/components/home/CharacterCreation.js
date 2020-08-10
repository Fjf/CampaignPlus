import React from "react";
import Dropdown from 'react-dropdown';
import {characterCreationService} from "../services/characterCreationService";


export default function CharacterCreation(props) {
    const user = props.user
    const [races, setRaces] = React.useState([])

    function getRaces() {
        characterCreationService.getRaces().then(r => {
            setRaces(r);
        })
    }
    console.log('got here')
    return <div className={"main-content"}>
        <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
                Dropdown Button
            </Dropdown.Toggle>

            <Dropdown.Menu>
                <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    </div>
}