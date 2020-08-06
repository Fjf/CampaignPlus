import {apiUrl, handleResponse} from "./constants";

export const profileServices = {
    get,
    create,
};

function get() {
    const requestOptions = {
        method: 'GET',
        headers: {'Content-Type': 'text/html'},
    };

    return fetch(`${apiUrl}/user/players`, requestOptions)
        .then(handleResponse);
}

function create(data) {
    const requestOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    };

    return fetch(`${apiUrl}/user/player`, requestOptions).then(handleResponse);
}
