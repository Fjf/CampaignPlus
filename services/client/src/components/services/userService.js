import "./constants"
import {apiUrl} from "./constants";

export const userService = {
    login,
    logout,
    registerUser,
    getUser
};


function getUser() {
    let u = localStorage.getItem("user");
    if (u === null) return u;
    return JSON.parse(u);
}

function registerUser(name, password, email) {
    const requestOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, password, email})
    };


    return fetch(`${apiUrl}/register`, requestOptions)
        .then(handleResponse)
        .then(data => {
            // login successful if there's a user in the response
            if (data) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            return data;
        });
}


function login(username, password) {
    const requestOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password})
    };

    return fetch(`${apiUrl}/login`, requestOptions)
        .then(handleResponse)
        .then(data => {
            // login successful if there's a user in the response
            if (data) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            return data;
        });
}


function logout() {
    // remove user from local storage to log user out
    const requestOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
    };

    localStorage.removeItem('user');
    return fetch(`${apiUrl}/logout`, requestOptions)
        .then(handleResponse);
}


function handleResponse(response) {
    return response.text().then(text => {
        const data = JSON.parse(text);
        if (!response.ok) {
            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }

        return data;
    });
}