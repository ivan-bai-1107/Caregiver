import { apiClient } from "@/shared/lib/apiClient";
import {
  clearAuthTokens,
  setAuthTokens,
  setCurrentUser,
  type CurrentUser,
} from "@/shared/lib/auth";

interface AuthTokenResponse {
  token: string;
  refreshToken?: string;
}

interface SendCodePayload {
  email: string;
}

interface RegisterPayload {
  username: string;
  email: string;
  code: string;
  password: string;
}

interface ResetPasswordPayload {
  email: string;
  code: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

function coerceCurrentUser(input: unknown): CurrentUser {
  const value = (input ?? {}) as Record<string, unknown>;

  return {
    id: String(value.id ?? ""),
    username: String(value.username ?? ""),
    email: String(value.email ?? ""),
  };
}

async function storeSession(tokens: AuthTokenResponse, persist = true) {
  setAuthTokens(tokens, persist);
  const user = await getCurrentUser();
  setCurrentUser(user, persist);
  return user;
}

export async function sendEmailCode(payload: SendCodePayload) {
  return apiClient.post<{ message?: string }>("/api/auth/email/send-code", payload);
}

export async function register(payload: RegisterPayload) {
  const tokens = await apiClient.post<AuthTokenResponse>("/api/auth/register", payload);
  return storeSession(tokens);
}

export async function resetPassword(payload: ResetPasswordPayload) {
  return apiClient.post<null>("/api/auth/password/reset", payload);
}

export async function login(payload: LoginPayload) {
  const tokens = await apiClient.post<AuthTokenResponse>("/api/auth/login", payload);
  return storeSession(tokens, payload.rememberMe);
}

export async function getCurrentUser() {
  const response = await apiClient.get<unknown>("/api/users/me");
  return coerceCurrentUser(response);
}

export function logout() {
  clearAuthTokens();
}
