export const apiUrl = "http://localhost:5000/api"; // Change this

export function handleResponse(response) {
    return response.text().then(text => {
        if (!response.ok) {
            let error = `${response.statusText}: ${text}`;
            return Promise.reject(error);
        }
        return text && JSON.parse(text);
    });
}