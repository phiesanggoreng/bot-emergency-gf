const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Get a valid JWT token for backend API calls.
 * Caches the token and refreshes when it's about to expire.
 */
async function getAuthToken(): Promise<string> {
  const now = Date.now();

  // Refresh if token is missing or will expire in less than 5 minutes
  if (!cachedToken || now >= tokenExpiresAt - 5 * 60 * 1000) {
    const res = await fetch("/api/auth/token");
    if (!res.ok) {
      cachedToken = null;
      tokenExpiresAt = 0;
      throw new Error("Sesi habis. Silakan login ulang.");
    }
    const data = await res.json();
    cachedToken = data.accessToken;
    // Token expires in 1 hour, cache accordingly
    tokenExpiresAt = now + 55 * 60 * 1000;
  }

  return cachedToken!;
}

/**
 * Authenticated fetch wrapper for backend API calls.
 * Automatically attaches the JWT token as a Bearer token.
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAuthToken();

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers,
  });
}

/**
 * Clear the cached token (call on logout)
 */
export function clearAuthToken() {
  cachedToken = null;
  tokenExpiresAt = 0;
}
