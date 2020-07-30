import {apiUrl, handleResponse} from "./constants";

export const dataService = {
    getEnemies,
    getAbilities,
    getMaps
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

function getMaps(cid) {
    const requestOptions = {
        method: 'GET',
        headers: {'Content-Type': 'text/html'},
    };

    return fetch(`${apiUrl}/campaigns/${cid}/maps`, requestOptions)
        .then(handleResponse);
}