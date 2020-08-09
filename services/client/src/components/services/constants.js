export const apiUrl = "/api"; // Change this
// export const apiUrl = "http://192.168.0.227:5000/api";

export function handleResponse(response) {
    return response.text().then(text => {
        if (!response.ok) {
            let error = `${response.statusText}: ${text}`;
            return Promise.reject(error);
        }
        return text && JSON.parse(text);
    });
}

export function toggleRightContentBar(ref, callback) {
    let div = ref.current;
    div.classList.toggle('right-content-bar-invisible');

    if (callback !== undefined) setTimeout(callback, 400);
}