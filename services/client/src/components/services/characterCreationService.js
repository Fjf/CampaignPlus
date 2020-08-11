import {apiUrl, handleResponse} from "./constants";

export const characterCreationService = {
    getRaces,
}

function getRaces() {
    const requestOptions = {
        method: 'GET',
        headers: {'Content-Type': 'text/html'},
    };

    return fetch(`${apiUrl}/races`, requestOptions)
        .then(handleResponse);
}