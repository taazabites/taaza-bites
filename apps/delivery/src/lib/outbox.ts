import { partnerApi, PartnerApiError } from "@/lib/api";

type PendingOp = {
  id: string;
  path: string;
  body: Record<string, unknown>;
  createdAt: number;
};

const KEY = "taaza_partner_outbox_v1";
const memory: PendingOp[] = [];

function readStored(): PendingOp[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PendingOp[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(ops: PendingOp[]) {
  memory.splice(0, memory.length, ...ops);
  try {
    sessionStorage.setItem(KEY, JSON.stringify(ops.slice(-40)));
  } catch {
    /* private mode */
  }
}

function allOps(): PendingOp[] {
  const merged = [...memory, ...readStored()];
  const byId = new Map(merged.map((o) => [o.id, o]));
  return [...byId.values()];
}

export async function enqueueOrSend(path: string, body: Record<string, unknown>) {
  const id = String(body.eventId || `${path}_${Date.now()}`);
  try {
    return await partnerApi(path, { ...body, eventId: id });
  } catch (err) {
    const status = err instanceof PartnerApiError ? err.status : 0;
    const offline = typeof navigator !== "undefined" && !navigator.onLine;
    if (offline || status >= 500 || status === 0) {
      persist([...allOps(), { id, path, body: { ...body, eventId: id }, createdAt: Date.now() }]);
      throw new PartnerApiError("Saved — will retry when the network is back", status || 503);
    }
    throw err;
  }
}

export async function flushOutbox(): Promise<number> {
  const pending = allOps();
  if (!pending.length) return 0;
  const remaining: PendingOp[] = [];
  let ok = 0;
  for (const op of pending) {
    try {
      await partnerApi(op.path, op.body);
      ok++;
    } catch {
      remaining.push(op);
    }
  }
  persist(remaining);
  return ok;
}

export function pendingCount(): number {
  return allOps().length;
}
