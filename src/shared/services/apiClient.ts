import { storage } from "../../storage/mmkv";

const FALLBACK_BASE_URL = "https://sr-backend-xi.vercel.app/api";

const configuredBaseUrl =
  import.meta.env.VITE_PUBLIC_API_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.EXPO_PUBLIC_API_URL;

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  statusCode?: number;
  errors?: any[];
}

export class ApiError extends Error {
  statusCode: number;
  errors?: any[];

  constructor(message: string, statusCode: number = 500, errors?: any[]) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

function getAuthToken(): string | null {
  try {
    return storage.getString("auth_session_token") || null;
  } catch {
    return null;
  }
}

function getBaseUrl(): string {
  return (configuredBaseUrl || FALLBACK_BASE_URL).replace(/\/+$/, "");
}

export async function request<T>(
  endpoint: string,
  options: RequestInit & { params?: Record<string, any> } = {},
): Promise<T> {
  const baseUrl = getBaseUrl();
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  let url = `${baseUrl}${normalizedEndpoint}`;

  if (options.params) {
    const query = new URLSearchParams();
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, String(val));
      }
    });
    const qs = query.toString();
    if (qs) {
      url += (url.includes("?") ? "&" : "?") + qs;
    }
  }

  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const responseData = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      isJson && responseData?.message
        ? responseData.message
        : `Request failed with status ${response.status}`;
    throw new ApiError(
      message,
      response.status,
      isJson ? responseData?.errors : undefined,
    );
  }

  // Handle standard server wrapper { success: true, data: ... }
  if (
    isJson &&
    responseData &&
    typeof responseData === "object" &&
    "data" in responseData
  ) {
    return responseData.data as T;
  }

  return responseData as T;
}

export const apiClient = {
  get: <T>(endpoint: string, params?: Record<string, any>) =>
    request<T>(endpoint, { method: "GET", params }),

  post: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};

export default apiClient;
