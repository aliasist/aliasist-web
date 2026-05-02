import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Route all API calls to the Cloudflare Worker — no backend server needed
const API_BASE = "https://datasist-worker.bchooper0730.workers.dev";

let datasistClerkGetToken: (() => Promise<string | null>) | null = null;

/** Called from `DatasistClerkApiBridge` so mutating requests can send a Clerk session JWT. */
export function setDatasistClerkGetToken(fn: (() => Promise<string | null>) | null) {
  datasistClerkGetToken = fn;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

async function mergeAuthHeaders(
  method: string,
  base: HeadersInit | undefined,
): Promise<HeadersInit> {
  const headers = new Headers(base);
  const needsAuth = ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());
  if (needsAuth && datasistClerkGetToken) {
    try {
      const token = await datasistClerkGetToken();
      if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    } catch {
      /* signed out or Clerk unavailable */
    }
  }
  return headers;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers = await mergeAuthHeaders(method, data ? { "Content-Type": "application/json" } : {});
  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(`${API_BASE}${queryKey.join("/")}`);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
