import {apiUrl, handleResponse} from "./constants";

export const characterCreationService = {
    getRaces,
    getClasses,
}

function getRaces() {
    const requestOptions = {
        method: 'GET',
        headers: {'Content-Type': 'text/html'},
    };

    return fetch(`${apiUrl}/races`, requestOptions)
        .then(handleResponse);
}

function getClasses() {
    const requestOptions = {
        method: 'GET',
        headers: {'Content-Type': 'text/html'},
    };

    return fetch(`${apiUrl}/classes`, requestOptions)
        .then(handleResponse);
}