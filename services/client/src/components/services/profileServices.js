import {apiUrl, handleResponse} from "./constants";

export const profileServices = {
    get,
};

function get() {
    const requestOptions = {
        method: 'GET',
        headers: {'Content-Type': 'text/html'},
    };

    return fetch(`${apiUrl}/user/players`, requestOptions)
        .then(handleResponse);
}
