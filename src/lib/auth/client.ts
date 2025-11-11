/**
 * Client-side authentication utilities
 * Handles token storage and authenticated fetch requests
 */

/**
 * Get the current session token from localStorage or cookies
 */
export function getSessionToken(): string | null {
  if (typeof window === 'undefined') return null;

  // Try localStorage first (our backup storage)
  const localToken = localStorage.getItem('session-token');
  if (localToken) return localToken;

  // Try reading from cookies (if httpOnly is disabled in dev)
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'session-token' && value) {
      return value;
    }
  }

  return null;
}

/**
 * Create fetch headers with authentication
 */
export function getAuthHeaders(): HeadersInit {
  const token = getSessionToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Authenticated fetch wrapper
 * Automatically includes auth token in requests
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const authHeaders = getAuthHeaders();

  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...authHeaders,
      ...(options.headers || {}),
    },
  };

  return fetch(url, mergedOptions);
}

/**
 * Clear session token (logout)
 */
export function clearSessionToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('session-token');
}
