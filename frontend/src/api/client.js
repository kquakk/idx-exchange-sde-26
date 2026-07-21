const BASE_URL = "/api";

async function request(path) {
    const response = await fetch(`${BASE_URL}${path}`);

    if (!response.ok) {
        let errorMess = `Request failed with status ${response.status}`;
        try {
            const body = await response.json();
            if (body.error) {
                errorMess = body.error;
            }
        } catch {

        }
        throw new Error(errorMess);
    }

    return response.json();
}

export function fetchProperties(params = {}) {
    const query = new URLSearchParams(params).toString();
    const path = query ? `/properties?${query}` : "/properties";
    return request(path);
}

export function fetchPropertyDetail(id) {
    return request(`/properties/${id}`);
}

export function fetchOpenHouse(id) {
    return request(`/properties/${id}/openhouses`);
}