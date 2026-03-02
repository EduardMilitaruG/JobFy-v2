// Empty string = relative URL (dev/test uses Vite proxy; prod uses nginx proxy)
// Set VITE_API_URL to absolute URL only when no proxy is available (e.g., Render static hosting)
const BASE_URL = import.meta.env.VITE_API_URL ?? "";

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }

  return res.json();
}
