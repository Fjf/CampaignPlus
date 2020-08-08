import {apiUrl, handleResponse} from "./constants";

export const characterService = {
    getCharacterInfo,
    del,
    save,
    getCharacterSpells,
    getCharacterInventory,
    getSpells,
    addSpell,
    deleteSpell,
    getItems,
    addItem,
    saveItem,
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

function getCharacterInventory(player_id) {
    const requestOptions = {
        method: 'GET',
        headers: {'Content-Type': 'text/html'},
    };

    return fetch(`${apiUrl}/player/${player_id}/items`, requestOptions)
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

function saveItem(character_id, item) {
    const requestOptions = {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({amount: item.amount, extra_info: item.extra_info})
    };

    return fetch(`${apiUrl}/player/${character_id}/item/${item.info.id}`, requestOptions)
        .then(handleResponse);
}

function getItems() {
    const requestOptions = {
        method: 'GET',
        headers: {'Content-Type': 'text/html'},
    };

    return fetch(`${apiUrl}/items`, requestOptions)
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

function addItem(pid, item_id) {
    const requestOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({item_id})
    };

    return fetch(`${apiUrl}/player/${pid}/item`, requestOptions)
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
        headers: {'Content-Type': 'text/html'},
    };
    return fetch(`${apiUrl}/player/${cid}`, requestOptions)
        .then(handleResponse);
}

function save(character) {
    const requestOptions = {
        method: "PUT",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(character)
    };

    return fetch(`${apiUrl}/player/${character.id}`, requestOptions)
        .then(handleResponse);
}
