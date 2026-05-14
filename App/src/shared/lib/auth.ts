const authTokenKey = "care-app-auth-token";
const refreshTokenKey = "care-app-refresh-token";
const currentUserKey = "care-app-current-user";

type AuthStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export interface AuthTokens {
  token: string;
  refreshToken?: string;
}

export interface CurrentUser {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

function getSessionStorage(): AuthStorage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function getLocalStorage(): AuthStorage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getAuthStorage(persist: boolean): AuthStorage | null {
  return persist ? getLocalStorage() : getSessionStorage();
}

export function getAuthToken() {
  return getSessionStorage()?.getItem(authTokenKey) ?? getLocalStorage()?.getItem(authTokenKey) ?? null;
}

export function setAuthTokens(tokens: AuthTokens, persist = true) {
  const storage = getAuthStorage(persist);
  if (!storage) {
    return;
  }

  clearAuthTokens();
  storage.setItem(authTokenKey, tokens.token);

  if (tokens.refreshToken) {
    storage.setItem(refreshTokenKey, tokens.refreshToken);
  }
}

export function clearAuthTokens() {
  [getSessionStorage(), getLocalStorage()].forEach((storage) => {
    storage?.removeItem(authTokenKey);
    storage?.removeItem(refreshTokenKey);
    storage?.removeItem(currentUserKey);
  });
}

export function setCurrentUser(user: CurrentUser, persist = true) {
  getAuthStorage(persist)?.setItem(currentUserKey, JSON.stringify(user));
}

export function getCurrentUserFromStorage(): CurrentUser | null {
  const rawValue =
    getSessionStorage()?.getItem(currentUserKey) ?? getLocalStorage()?.getItem(currentUserKey);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as CurrentUser;
  } catch {
    return null;
  }
}
