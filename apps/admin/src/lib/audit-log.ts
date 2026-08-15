import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function writeAuditLog(input: {
  adminId?: string | null;
  adminName?: string | null;
  action: string;
  entityType: string;
  entityId?: string;
  previousValue?: unknown;
  newValue?: unknown;
}): Promise<void> {
  try {
    await addDoc(collection(db, "auditLogs"), {
      adminId: input.adminId || "unknown",
      adminName: input.adminName || "unknown",
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId || "",
      previousValue: input.previousValue ?? null,
      newValue: input.newValue ?? null,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString(),
      source: "admin-web",
    });
  } catch (error) {
    console.error("Failed to write auditLogs entry:", error);
  }
}
