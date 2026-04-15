const defaultApiBaseUrl = "http://127.0.0.1:4523/m1/8118976-7876082-default";

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

export const env = {
  apiBaseUrl: normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl),
};
