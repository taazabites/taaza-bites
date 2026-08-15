import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { fetchOpsSnapshot } from "../lib/ops-snapshot";
import { buildCrmProfile, CrmProfile, CrmSegment } from "../lib/crm-engine";
import { writeAuditLog } from "../lib/audit-log";

export interface CrmRow {
  customer: Record<string, any>;
  profile: CrmProfile;
}

export async function loadCrmRows(segment?: CrmSegment | "all"): Promise<CrmRow[]> {
  const snap = await fetchOpsSnapshot();
  const rows = snap.customers.map((customer) => ({
    customer,
    profile: buildCrmProfile({
      customer,
      subscriptions: snap.subscriptions,
      orders: snap.orders,
      payments: snap.payments,
      tickets: snap.tickets,
      complaints: snap.complaints,
    }),
  }));
  if (!segment || segment === "all") return rows;
  return rows.filter((r) => r.profile.segments.includes(segment) || r.profile.segment === segment);
}

export async function persistCustomerRisk(
  customerId: string,
  profile: CrmProfile,
  admin?: { id?: string; name?: string }
): Promise<void> {
  await updateDoc(doc(db, "customers", customerId), {
    riskLevel: profile.risk.riskLevel,
    riskScore: profile.risk.riskScore,
    riskReasons: profile.risk.riskReasons,
    crmSegment: profile.segment,
    calculatedAt: profile.risk.calculatedAt,
    updatedAt: new Date().toISOString(),
    riskCalculatedAt: serverTimestamp(),
  });
  await writeAuditLog({
    adminId: admin?.id,
    adminName: admin?.name,
    action: "UPDATE",
    entityType: "customer",
    entityId: customerId,
    newValue: {
      riskLevel: profile.risk.riskLevel,
      riskScore: profile.risk.riskScore,
      crmSegment: profile.segment,
    },
  });
}
