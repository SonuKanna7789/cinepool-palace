const API_BASE_URL = "https://cinepool-api-production.up.railway.app/api";

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

function getToken(): string | null {
  return localStorage.getItem("cinepool_token");
}

export function setToken(token: string) {
  localStorage.setItem("cinepool_token", token);
}

export function clearToken() {
  localStorage.removeItem("cinepool_token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth = false, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((customHeaders as Record<string, string>) || {}),
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers,
    ...rest,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(
      `API Error ${response.status}: ${errorBody || response.statusText}`
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
