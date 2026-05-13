import { env } from "@/shared/constants/env";
import { getAuthToken } from "@/shared/lib/auth";

type QueryValue = string | number | boolean | null | undefined;

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: Record<string, QueryValue>;
}

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${env.apiBaseUrl}${normalizedPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

async function request<T>(path: string, options: RequestOptions = {}) {
  const token = getAuthToken();
  const { body, headers, query, ...rest } = options;
  const response = await fetch(buildUrl(path, query), {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : null),
      ...(token ? { Authorization: `Bearer ${token}` } : null),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as ApiEnvelope<T> | T) : null;
  const apiMessage =
    payload && typeof payload === "object" && "message" in payload
      ? String(payload.message ?? "")
      : "";

  if (!response.ok) {
    throw new ApiError(apiMessage || "请求失败，请稍后重试。", response.status, payload);
  }

  if (payload && typeof payload === "object" && "success" in payload && payload.success === false) {
    throw new ApiError(apiMessage || "请求失败，请稍后重试。", response.status, payload);
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data as T;
  }

  return payload as T;
}

export const apiClient = {
  get<T>(path: string, query?: Record<string, QueryValue>, options?: Omit<RequestOptions, "query">) {
    return request<T>(path, {
      ...options,
      method: "GET",
      query,
    });
  },
  post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "body">) {
    return request<T>(path, {
      ...options,
      method: "POST",
      body,
    });
  },
  put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "body">) {
    return request<T>(path, {
      ...options,
      method: "PUT",
      body,
    });
  },
};
