const BASE_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path: string, options: RequestInit = {}) {
    const authToken = localStorage.getItem("participant_token");
    return fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
            "ngrok-skip-browser-warning": "true",
            ...(authToken ? { "X-Auth-Token": authToken } : {})
        },
    });
}