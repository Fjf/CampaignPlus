export const apiUrl = "http://192.168.0.227:5000/api";

export function handleResponse(response) {
    return response.text().then(text => {
        if (!response.ok) {
            let error = `${response.statusText}: ${text}`;
            return Promise.reject(error);
        }
        return text && JSON.parse(text);
    });
}