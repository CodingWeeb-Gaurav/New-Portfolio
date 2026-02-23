import { apiRequest } from "./api";

export async function login(email: string, password: string) {
  const data = await apiRequest("/auth/login", "POST", {
    email,
    password,
  });

  localStorage.setItem("access_token", data.access_token);

  return data;
}