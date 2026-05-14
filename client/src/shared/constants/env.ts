const defaultApiBaseUrl =
  typeof window === "undefined" ? "http://127.0.0.1:8000" : `${window.location.protocol}//${window.location.hostname}:8000`;

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

export const env = {
  apiBaseUrl: normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl),
};
