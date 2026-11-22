import { config } from "../config";
import { getAccessToken } from "../supabase";

/** Normalised error. `status` 402 = plan limit (show upgrade), 429 = daily limit, 400 = validation. */
export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
    this.name = "ApiError";
  }
  get isPlanLimit() { return this.status === 402; }
  get isRateLimited() { return this.status === 429; }
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function request<T>(method: Method, path: string, body?: unknown, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const isForm = body instanceof FormData;
  const res = await fetch(`${config.apiUrl}${path}`, {
    method,
    ...init,
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });

  if (!res.ok) {
    let detail = res.statusText || "Something went wrong";
    let code: string | undefined;
    try {
      const data = await res.json();
      detail = typeof data.detail === "string" ? data.detail : detail;
      code = data.code;
    } catch { /* non-JSON error */ }
    throw new ApiError(res.status, detail, code);
  }
  if (res.status === 204) return undefined as T;
  const type = res.headers.get("content-type") ?? "";
  return (type.includes("application/json") ? res.json() : res.blob()) as Promise<T>;
}

export const http = {
  get: <T>(p: string) => request<T>("GET", p),
  post: <T>(p: string, b?: unknown) => request<T>("POST", p, b),
  put: <T>(p: string, b?: unknown) => request<T>("PUT", p, b),
  patch: <T>(p: string, b?: unknown) => request<T>("PATCH", p, b),
  del: <T>(p: string) => request<T>("DELETE", p),
};
