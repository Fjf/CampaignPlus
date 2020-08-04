import {apiUrl, handleResponse} from "./constants";

export const dataService = {
    getEnemies,
    getAbilities,
    getMaps,
    createMap,
    alterMap,
    deleteMap
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

function createMap(cid, parent_map_id, x, y) {
    const requestOptions = {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({parent_map_id, x, y})
    };

    return fetch(`${apiUrl}/campaigns/${cid}/maps`, requestOptions)
        .then(handleResponse);
}

function alterMap(cid, data) {
    const requestOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    };

    return fetch(`${apiUrl}/campaigns/${cid}/maps`, requestOptions)
        .then(handleResponse);
}


function deleteMap(cid, map_id) {
    const requestOptions = {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
    };

    return fetch(`${apiUrl}/campaigns/${cid}/maps/${map_id}`, requestOptions)
        .then(handleResponse);
}