export type Book = {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher: string;
  publicationYear: number;
  quantity: number;
  availableQuantity: number;
  status: string;
};

export type BookPayload = Omit<Book, "id" | "availableQuantity" | "status">;

type ApiErrorPayload = {
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
};

function resolveApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL;
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;
    if (hostname.endsWith(".manus.space")) {
      return "https://8080-i9t7wbczcuv8anpug6j9x-09856c63.sg2.manus.computer";
    }
    const sandboxHost = hostname.match(/^\d+-(.+)$/);
    if (sandboxHost) {
      return `${protocol}//8080-${sandboxHost[1]}`;
    }
  }

  return "http://localhost:8080";
}

const apiBaseUrl = resolveApiBaseUrl();

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message || payload.error || "The request could not be completed");
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = payload.fieldErrors;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });
  } catch {
    throw new ApiError(0, {
      message: "Unable to reach the Spring Boot API. Start the backend on port 8080 and try again.",
    });
  }

  if (!response.ok) {
    let payload: ApiErrorPayload = {};
    try {
      payload = await response.json();
    } catch {
      payload = { message: "The API returned an unexpected error" };
    }
    throw new ApiError(response.status, payload);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export const booksApi = {
  list: (search = "", category = "") => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (category && category !== "all") params.set("category", category);
    const query = params.toString();
    return request<Book[]>(`/api/books${query ? `?${query}` : ""}`);
  },
  get: (id: number) => request<Book>(`/api/books/${id}`),
  create: (payload: BookPayload) =>
    request<Book>("/api/books", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: number, payload: BookPayload) =>
    request<Book>(`/api/books/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id: number) => request<void>(`/api/books/${id}`, { method: "DELETE" }),
  issue: (id: number) => request<Book>(`/api/books/${id}/issue`, { method: "POST" }),
  returnBook: (id: number) => request<Book>(`/api/books/${id}/return`, { method: "POST" }),
};
