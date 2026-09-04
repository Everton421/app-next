import { cookies } from "next/headers";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface ServerUser {
  codigo: number;
  cnpj?: string;
  vendedor?: number;
  nome: string;
  token: string;
}

export function getServerUser(): ServerUser | null {
  const cookieStore = cookies();
  const authUserCookie = cookieStore.get("authUser");

  if (!authUserCookie) return null;

  try {
    return JSON.parse(authUserCookie.value);
  } catch {
    return null;
  }
}

async function serverFetch<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export function getServerApi() {
  const user = getServerUser();

  if (!user) return null;

  return {
    user,

    get: <T = any>(
      path: string,
      params?: Record<string, string>,
      headers?: Record<string, string>
    ) => {
      const url = new URL(`${baseURL}${path}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.set(key, value);
          }
        });
      }
      return serverFetch<T>(url.toString(), {
        method: "GET",
        headers: { ...headers, token: user.token },
      });
    },

    post: <T = any>(
      path: string,
      body?: any,
      headers?: Record<string, string>
    ) => {
      return serverFetch<T>(`${baseURL}${path}`, {
        method: "POST",
        headers: { ...headers, token: user.token },
        body: body ? JSON.stringify(body) : undefined,
      });
    },
  };
}
