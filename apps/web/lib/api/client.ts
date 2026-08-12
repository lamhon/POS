import { createApiError, NetworkError } from "./errors";
import type { ProblemDetails } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

/**
 * Core fetch wrapper. All API calls should go through this function.
 * - Sets JSON content-type headers.
 * - Parses ProblemDetails error responses from the backend.
 * - Throws typed errors (ApiError subclasses).
 */
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const url = `${API_BASE_URL}${endpoint}`;

  const init: RequestInit = {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    },
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  let response: Response;

  try {
    response = await fetch(url, init);
  } catch {
    throw new NetworkError();
  }

  if (!response.ok) {
    let problemDetails: ProblemDetails = {};
    try {
      problemDetails = (await response.json()) as ProblemDetails;
    } catch {
      // ignore parse errors — fall through with empty ProblemDetails
    }
    throw createApiError(response.status, problemDetails);
  }

  // 204 No Content — return undefined cast to T
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Convenience helpers.
 */
export const apiClient = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(endpoint, { ...options, method: "POST", body }),

  put: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T>(endpoint: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
