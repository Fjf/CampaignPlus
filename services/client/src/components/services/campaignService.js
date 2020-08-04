import {apiUrl, handleResponse} from "./constants";

export const campaignService = {
    get,
    getData: getPlayers,
    join,
    create,
    del,
    update,
};


function get() {
    const requestOptions = {
        method: 'GET',
        headers: {'Content-Type': 'text/html'},
    };

    return fetch(`${apiUrl}/campaigns`, requestOptions)
        .then(handleResponse);
}

function create() {
    const requestOptions = {
        method: 'PUT',
        headers: {'Content-Type': 'text/html'},
    };

    return fetch(`${apiUrl}/campaigns`, requestOptions)
        .then(handleResponse);
}

function del(campaign_id) {
    const requestOptions = {
        method: 'DELETE',
        headers: {'Content-Type': 'text/html'},
    };

    return fetch(`${apiUrl}/campaigns/${campaign_id}`, requestOptions)
        .then(handleResponse);
}

function update(campaign_id, data) {
    const requestOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    };

    return fetch(`${apiUrl}/campaigns/${campaign_id}`, requestOptions)
        .then(handleResponse);
}

function getPlayers(cid) {
    const requestOptions = {
        method: 'GET',
        headers: {'Content-Type': 'text/html'},
    };

    return fetch(`${apiUrl}/campaigns/${cid}/players`, requestOptions)
        .then(handleResponse);
}

function join(code) {
    const requestOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
    };

    return fetch(`${apiUrl}/campaigns/join/${code}`, requestOptions)
        .then(handleResponse)
}