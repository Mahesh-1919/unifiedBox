import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
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
    const res = await fetch(queryKey.join("/"), {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

let queryClientInstance: QueryClient | undefined;

export const getQueryClient = () => {
  queryClientInstance ??= new QueryClient({
    defaultOptions: {
      queries: {
        queryFn: getQueryFn({ on401: "throw" }),
        refetchInterval: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
        gcTime: 60 * 60 * 1000, // 1 hour - keep in cache
        retry: (failureCount, error: unknown) => {
          if (
            error &&
            typeof error === "object" &&
            "message" in error &&
            typeof error.message === "string" &&
            error.message.includes("404")
          )
            return false;
          return failureCount < 1;
        },
        // Add network mode for better offline handling
        networkMode: "online",
      },
      mutations: {
        retry: false,
      },
    },
  });
  return queryClientInstance;
};

export const queryClient = getQueryClient();
