export const apiUrl = "/api"; // Change this
// export const apiUrl = "http://192.168.0.227:5000/api";

export function handleResponse(response) {
    return response.text().then(text => {
        let result = JSON.parse(text);
        if (!response.ok) {
            let error = `${response.statusText}: ${result.message}`;
            return Promise.reject(error);
        }
        return result;
    });
}

export function toggleRightContentBar(ref, callback) {
    let div = ref.current;
    div.classList.toggle('right-content-bar-invisible');

    if (callback !== undefined) setTimeout(callback, 400);
}