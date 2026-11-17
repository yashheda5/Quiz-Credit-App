
import { api } from "../../lib/api";

export type AuthUser = {
  id: string;
  role: "USER" | "ADMIN";
  name?: string;
  email?: string;
};

export type AuthResponse = {
  success: boolean;
  data: {
    token: string;
    user: AuthUser;
  };
};

export async function login(email: string, password: string) {
  const response = await api.post<AuthResponse>("/auth/login", {
    email,
    password,
  });

  return response.data.data;
}

export async function register(
  name: string,
  email: string,
  password: string,
) {
  const response = await api.post<AuthResponse>("/auth/register", {
    name,
    email,
    password,
  });

  return response.data.data;
}

export async function getCurrentUser() {
  const response = await api.get<{
    success: boolean;
    data: AuthUser;
  }>("/me");

  return response.data.data;
}

export function saveSession(token: string, user: AuthUser) {
  localStorage.setItem("accessToken", token);
  localStorage.setItem("role", user.role);
}
