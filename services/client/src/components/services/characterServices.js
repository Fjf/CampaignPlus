import {apiUrl, handleResponse} from "./constants";

export const characterServices = {
    getCharacterInfo,
    del,
};

function getCharacterInfo(cid) {
    const requestOptions = {
        method: 'GET',
        headers: {'Content-Type': 'text/html'},
    };

    return fetch(`${apiUrl}/player/${cid}/data`, requestOptions)
        .then(handleResponse);
}

function del(cid) {
    const requestOptions = {
        method: "DELETE",
        headers: {'Content-Type': 'application/json'},
    }
    return fetch(`${apiUrl}/player/${cid}`, requestOptions)
        .then(handleResponse);
}
