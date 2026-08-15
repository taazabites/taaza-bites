import { auth } from "@/lib/firebase";

export class PartnerApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function token(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export async function partnerApi<T = Record<string, unknown>>(
  path: string,
  body: Record<string, unknown> = {}
): Promise<T> {
  const idToken = await token();
  if (!idToken) throw new PartnerApiError("Not signed in", 401);

  const res = await fetch(`/api/partner${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) {
    throw new PartnerApiError(data.error || `Request failed (${res.status})`, res.status);
  }
  return data;
}

export async function adminDeliveryApi<T = Record<string, unknown>>(
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  const idToken = await token();
  const res = await fetch(`/api/delivery${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: idToken ? `Bearer ${idToken}` : "",
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) throw new PartnerApiError(data.error || `Request failed (${res.status})`, res.status);
  return data;
}
