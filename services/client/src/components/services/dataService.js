import {apiUrl, handleResponse} from "./constants";

export const dataService = {
    getEnemies,
    deleteEnemy,
    createEnemy,
    getAbilities,
    addAbility,
    getMaps,
    createMap,
    alterMap,
    deleteMap,
    setMapImage,
    saveEnemy,
};


function deleteEnemy(eid) {
    const requestOptions = {
        method: 'DELETE',
        headers: {'Content-Type': 'text/html'},
    };

    return fetch(`${apiUrl}/enemies/${eid}`, requestOptions)
        .then(handleResponse);
}

function createEnemy(data) {
    const requestOptions = {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    };

    return fetch(`${apiUrl}/enemies`, requestOptions)
        .then(handleResponse);
}

function saveEnemy(enemy) {
    const requestOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(enemy)
    };

    return fetch(`${apiUrl}/enemies/${enemy.id}`, requestOptions)
        .then(handleResponse);
}

function addAbility(eid, ability) {
    const requestOptions = {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ability})
    };

    return fetch(`${apiUrl}/enemies/${eid}/abilities`, requestOptions)
        .then(handleResponse);
}

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

function alterMap(map_id, data) {
    const requestOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    };

    return fetch(`${apiUrl}/maps/${map_id}`, requestOptions)
        .then(handleResponse);
}

function setMapImage(map, file) {
    let formData = new FormData();
    formData.append("image", file);

    const requestOptions = {
        method: 'POST',
        body: formData
    };

    return fetch(`${apiUrl}/maps/${map.id}/image`, requestOptions)
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

