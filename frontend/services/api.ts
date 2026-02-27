/* eslint-disable @typescript-eslint/no-explicit-any */
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
console.log("API Base URL:", BASE_URL);

export async function apiRequest(
    endpoint: string,
    method: string = "GET",
    body?: any
) {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(JSON.stringify(data) || "API request failed");
    }
    return data;
}

// For endpoints that accept file uploads (FormData / multipart)
// Do NOT set Content-Type — browser adds it automatically with the correct boundary
export async function apiFormRequest(
    endpoint: string,
    method: string = "POST",
    formData: FormData
) {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(JSON.stringify(data) || "API request failed");
    }
    return data;
}