const authTokenKey = "care-app-auth-token";
const refreshTokenKey = "care-app-refresh-token";
const currentUserKey = "care-app-current-user";

export interface AuthTokens {
  token: string;
  refreshToken?: string;
}

export interface CurrentUser {
  id: string;
  username: string;
  email: string;
}

export function getAuthToken() {
  return localStorage.getItem(authTokenKey);
}

export function setAuthTokens(tokens: AuthTokens) {
  localStorage.setItem(authTokenKey, tokens.token);

  if (tokens.refreshToken) {
    localStorage.setItem(refreshTokenKey, tokens.refreshToken);
  }
}

export function clearAuthTokens() {
  localStorage.removeItem(authTokenKey);
  localStorage.removeItem(refreshTokenKey);
  localStorage.removeItem(currentUserKey);
}

export function setCurrentUser(user: CurrentUser) {
  localStorage.setItem(currentUserKey, JSON.stringify(user));
}

export function getCurrentUserFromStorage(): CurrentUser | null {
  const rawValue = localStorage.getItem(currentUserKey);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as CurrentUser;
  } catch {
    return null;
  }
}
