import {apiUrl, handleResponse} from "./constants";

export const campaignService = {
    get,
    getData: getPlayers,
    join
};


function get() {
    const requestOptions = {
        method: 'GET',
        headers: {'Content-Type': 'text/html'},
    };

    return fetch(`${apiUrl}/campaigns`, requestOptions)
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