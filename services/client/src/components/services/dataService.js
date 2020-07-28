import {apiUrl, handleResponse} from "./constants";

export const dataService = {
    getEnemies,
    getAbilities
};


function getEnemies() {
    const requestOptions = {
        method: 'GET',
        headers: {'Content-Type': 'text/html'},
    };

    return fetch(`${apiUrl}/enemies`, requestOptions)
        .then(handleResponse);
}

function getAbilities(eid) {
    const requestOptions = {
        method: 'GET',
        headers: {'Content-Type': 'text/html'},
    };

    let url;
    if (eid === undefined) {
        url = `${apiUrl}/abilities`
    } else {
        url = `${apiUrl}/enemies/${eid}/abilities`;
    }

    return fetch(url, requestOptions)
        .then(handleResponse);
}