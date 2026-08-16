import { auth } from "../firebase/auth";

/** Bearer for live Firebase session, or sim token only when a demo session is stored. */
export async function getCustomerAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const user = auth.currentUser;
  if (user) {
    headers.Authorization = `Bearer ${await user.getIdToken()}`;
    return headers;
  }
  try {
    const raw = localStorage.getItem("taaza_simulated_user");
    if (!raw) return headers;
    const parsed = JSON.parse(raw) as { uid?: string };
    if (parsed?.uid) {
      headers.Authorization = `Bearer sim_token_${parsed.uid}`;
    }
  } catch {
    // ignore malformed demo session
  }
  return headers;
}
