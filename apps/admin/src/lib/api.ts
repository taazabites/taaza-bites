import { auth } from "./firebase";

/** Authenticated fetch from the admin SPA. Sets the gateway routing header. */
export async function adminFetch(input: string, init: RequestInit = {}) {
  const token = await auth.currentUser?.getIdToken();
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("X-Taaza-App", "admin");
  return fetch(input, { ...init, headers });
}
