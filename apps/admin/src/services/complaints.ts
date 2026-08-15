import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { writeAuditLog } from "../lib/audit-log";

export const COMPLAINT_CATEGORIES = [
  "Food Quality",
  "Delivery",
  "Payment",
  "Subscription",
  "Missing Item",
  "Wrong Item",
  "Packaging",
  "Refund",
  "General",
] as const;

export const COMPLAINT_PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;
export const COMPLAINT_STATUSES = ["Open", "In Progress", "Waiting", "Resolved", "Closed"] as const;

export interface Complaint {
  id: string;
  ticketId?: string;
  customerId: string;
  customerName?: string;
  orderId?: string;
  category: string;
  priority: string;
  status: string;
  assignedTo?: string;
  issue: string;
  message?: string;
  photos?: string[];
  resolution?: string;
  refundCoupon?: string;
  createdAt?: string;
  updatedAt?: string;
  resolvedAt?: string;
}

function mapDoc(id: string, data: Record<string, any>): Complaint {
  return { id, ...data } as Complaint;
}

export const complaintsService = {
  subscribe(callback: (items: Complaint[]) => void): () => void {
    const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => callback(snap.docs.map((d) => mapDoc(d.id, d.data()))),
      (err) => {
        console.warn("complaints listener:", err);
        callback([]);
      }
    );
  },

  async listForCustomer(customerId: string): Promise<Complaint[]> {
    try {
      const q = query(collection(db, "complaints"), where("customerId", "==", customerId));
      const snap = await getDocs(q);
      return snap.docs.map((d) => mapDoc(d.id, d.data()));
    } catch {
      return [];
    }
  },

  async create(input: Omit<Complaint, "id">, admin?: { id?: string; name?: string }): Promise<string> {
    const now = new Date().toISOString();
    const ref = await addDoc(collection(db, "complaints"), {
      ...input,
      status: input.status || "Open",
      createdAt: now,
      updatedAt: now,
      serverCreatedAt: serverTimestamp(),
    });
    await writeAuditLog({
      adminId: admin?.id,
      adminName: admin?.name,
      action: "CREATE",
      entityType: "complaint",
      entityId: ref.id,
      newValue: input,
    });
    return ref.id;
  },

  async update(
    id: string,
    updates: Partial<Complaint>,
    admin?: { id?: string; name?: string },
    previous?: Partial<Complaint>
  ): Promise<void> {
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { ...updates, updatedAt: now };
    if (updates.status === "Resolved" || updates.status === "Closed") {
      patch.resolvedAt = now;
    }
    await updateDoc(doc(db, "complaints", id), patch);
    await writeAuditLog({
      adminId: admin?.id,
      adminName: admin?.name,
      action: "UPDATE",
      entityType: "complaint",
      entityId: id,
      previousValue: previous || null,
      newValue: updates,
    });
  },
};

export function averageResolutionHours(items: Complaint[]): number | null {
  const resolved = items.filter((c) => c.resolvedAt && c.createdAt);
  if (!resolved.length) return null;
  const hours =
    resolved.reduce((sum, c) => {
      const start = new Date(c.createdAt as string).getTime();
      const end = new Date(c.resolvedAt as string).getTime();
      return sum + (end - start) / 3_600_000;
    }, 0) / resolved.length;
  return Number(hours.toFixed(1));
}
