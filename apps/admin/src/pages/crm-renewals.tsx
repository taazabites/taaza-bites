import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadCrmRows, CrmRow } from "../services/crm";
import { recommendedRenewalAction } from "../lib/crm-engine";
import { customerDisplayName } from "../lib/crm-engine";
import { daysUntil, formatDate } from "../lib/dates";
import { toast } from "sonner";
import { writeAuditLog } from "../lib/audit-log";
import { useAuth } from "../contexts/auth-context";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../lib/firebase";

const GROUPS = [
  { key: "7d", label: "7 Days", match: (d: number | null, _status: string) => d !== null && d >= 4 && d <= 7 },
  { key: "3d", label: "3 Days", match: (d: number | null, _status: string) => d !== null && d >= 2 && d <= 3 },
  { key: "tomorrow", label: "Tomorrow", match: (d: number | null, _status: string) => d === 1 },
  { key: "expired", label: "Expired", match: (d: number | null, status: string) => (d !== null && d < 0) || status === "expired" || status === "cancelled" },
] as const;

export default function RenewalsCrmPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<CrmRow[]>([]);
  const [group, setGroup] = useState<(typeof GROUPS)[number]["key"]>("7d");

  useEffect(() => {
    loadCrmRows().then(setRows).catch(() => setRows([]));
  }, []);

  const grouped = useMemo(() => {
    return rows.filter(({ profile }) => {
      const days = daysUntil(profile.endDate);
      const def = GROUPS.find((g) => g.key === group)!;
      return def.match(days, profile.subscriptionStatus);
    });
  }, [rows, group]);

  const queueNotice = async (row: CrmRow, kind: string) => {
    await addDoc(collection(db, "communicationLogs"), {
      channel: "queue",
      template: kind,
      customerId: row.customer.id,
      status: "queued_pending_consent",
      createdAt: new Date().toISOString(),
      note: "Not sent automatically. Requires approved template and customer consent.",
    });
    await writeAuditLog({
      adminId: user?.id,
      adminName: user?.name,
      action: "CREATE",
      entityType: "notification_queue",
      entityId: row.customer.id,
      newValue: { kind },
    });
    toast.message("Queued for an approved template. Nothing was sent automatically.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Renewals Due</h1>
        <p className="text-sm text-zinc-400 mt-1">Grouped from live subscription end dates. Promotional sends stay queued until consent/templates are approved.</p>
      </div>
      <div className="flex gap-2">
        {GROUPS.map((g) => (
          <Button key={g.key} size="sm" variant={group === g.key ? "default" : "outline"} className={group === g.key ? "bg-emerald-600 text-zinc-950" : "border-zinc-800"} onClick={() => setGroup(g.key)}>
            {g.label}
          </Button>
        ))}
      </div>
      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader><CardTitle className="text-white text-base">{grouped.length} customers</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {grouped.length === 0 && <p className="text-zinc-500 text-sm">No subscriptions in this window.</p>}
          {grouped.map(({ customer, profile }) => (
            <div key={customer.id} className="border border-zinc-800 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
              <div>
                <div className="text-white font-medium">{customerDisplayName(customer)}</div>
                <div className="text-xs text-zinc-500 mt-1">
                  {profile.planName} · Expiry {formatDate(profile.endDate)} · Last order {formatDate(profile.lastOrderAt)} · Spent ₹{profile.totalSpent.toLocaleString("en-IN")}
                </div>
                <div className="text-xs text-zinc-400 mt-2">{recommendedRenewalAction(profile)}</div>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <Badge variant="outline">{profile.risk.riskLevel}</Badge>
                <Link to={`/crm/customers/${customer.id}`} className="px-3 py-1.5 text-sm rounded-md border border-zinc-800">View</Link>
                <Button size="sm" variant="outline" className="border-zinc-800" onClick={() => queueNotice({ customer, profile }, "renewal_contact")}>Contact</Button>
                <Button size="sm" variant="outline" className="border-zinc-800" onClick={() => queueNotice({ customer, profile }, "renewal_approved")}>Queue notice</Button>
                <Link to="/coupons" className="px-3 py-1.5 text-sm rounded-md border border-zinc-800">Coupon</Link>
                <Link to={`/crm/customers/${customer.id}`} className="px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-zinc-950">Renew</Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
