/* eslint-disable @typescript-eslint/no-explicit-any */
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
console.log("API Base URL:", BASE_URL);
export async function apiRequest(
    endpoint: string, // like /auth/login or /projects
    method: string = "GET", //GET is default method, otherwise you can specify POST, PUT, DELETE etc
    body?: any // like { email: "
) {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers: {"Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }), }, // the ... syntax is used to conditionally add the Authorization header only if token exists
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(JSON.stringify(data) || "API request failed");
    }
    return data;
}    