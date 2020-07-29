import {apiUrl, handleResponse} from "./constants";

export const characterServices = {
    getCharacterInfo,
};

function getCharacterInfo(cid) {
    const requestOptions = {
        method: 'GET',
        headers: {'Content-Type': 'text/html'},
    };

    return fetch(`${apiUrl}/player/${cid}/data`, requestOptions)
        .then(handleResponse);
}
