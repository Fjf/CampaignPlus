import {apiUrl, handleResponse} from "./constants";

export const characterService = {
    getCharacterInfo,
    del,
    getCharacterSpells,
    getSpells,
    addSpell,
    deleteSpell,
};

function getCharacterInfo(cid) {
    const requestOptions = {
        method: 'GET',
        headers: {'Content-Type': 'text/html'},
    };

    return fetch(`${apiUrl}/player/${cid}/data`, requestOptions)
        .then(handleResponse);
}

function getCharacterSpells(cid) {
    const requestOptions = {
        method: 'GET',
        headers: {'Content-Type': 'text/html'},
    };

    return fetch(`${apiUrl}/player/${cid}/spell`, requestOptions)
        .then(handleResponse);
}

function getSpells() {
    const requestOptions = {
        method: 'GET',
        headers: {'Content-Type': 'text/html'},
    };

    return fetch(`${apiUrl}/user/spells`, requestOptions)
        .then(handleResponse);
}

function addSpell(pid, spell_id) {
    const requestOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({spell_id})
    };

    return fetch(`${apiUrl}/player/${pid}/spell`, requestOptions)
        .then(handleResponse);
}

function deleteSpell(pid, spell_id) {
    const requestOptions = {
        method: 'DELETE',
        headers: {'Content-Type': 'text/html'}
    };

    return fetch(`${apiUrl}/player/${pid}/spell/${spell_id}`, requestOptions)
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
