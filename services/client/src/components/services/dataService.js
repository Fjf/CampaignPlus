import {apiUrl, handleResponse} from "./constants";

export const dataService = {
    get
};


function get() {
    const requestOptions = {
        method: 'GET',
        headers: {'Content-Type': 'text/html'},
    };

    return fetch(`${apiUrl}/enemies`, requestOptions)
        .then(handleResponse);
}