import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchOpsSnapshot } from "../lib/ops-snapshot";
import { buildCrmProfile, normalizeSubStatus } from "../lib/crm-engine";
import { daysSince, monthKey } from "../lib/dates";

export default function RetentionPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [cohorts, setCohorts] = useState<{ month: string; signups: number; firstSub: number }[]>([]);

  useEffect(() => {
    fetchOpsSnapshot()
      .then((snap) => {
        const profiles = snap.customers.map((c) =>
          buildCrmProfile({
            customer: c,
            subscriptions: snap.subscriptions,
            orders: snap.orders,
            payments: snap.payments,
            tickets: snap.tickets,
            complaints: snap.complaints,
          })
        );
        const active = snap.subscriptions.filter((s) => ["active", "expiring", "paused"].includes(normalizeSubStatus(s))).length;
        const cancelled = snap.subscriptions.filter((s) => normalizeSubStatus(s) === "cancelled").length;
        const paused = snap.subscriptions.filter((s) => normalizeSubStatus(s) === "paused").length;
        const expired = snap.subscriptions.filter((s) => normalizeSubStatus(s) === "expired").length;
        const total = snap.subscriptions.length || 1;
        const durations = snap.subscriptions
          .map((s) => daysSince(s.startDate))
          .filter((d): d is number => d !== null);
        const avgDuration = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
        const ltv =
          profiles.length === 0 ? 0 : Math.round(profiles.reduce((s, p) => s + p.totalSpent, 0) / profiles.length);
        setMetrics({
          active,
          renewalRate: Math.round(((active + expired) > 0 ? (active / (active + expired)) : 0) * 1000) / 10,
          cancelRate: Math.round((cancelled / total) * 1000) / 10,
          pauseRate: Math.round((paused / total) * 1000) / 10,
          churnRate: Math.round(((cancelled + expired) / total) * 1000) / 10,
          avgDuration,
          ltv,
        });
        const map: Record<string, { signups: number; firstSub: number }> = {};
        for (const c of snap.customers) {
          const key = monthKey(c.createdAt) || "unknown";
          map[key] = map[key] || { signups: 0, firstSub: 0 };
          map[key].signups++;
        }
        for (const s of snap.subscriptions) {
          const key = monthKey(s.startDate || s.createdAt);
          if (!key) continue;
          map[key] = map[key] || { signups: 0, firstSub: 0 };
          map[key].firstSub++;
        }
        setCohorts(
          Object.entries(map)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, v]) => ({ month, ...v }))
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = useMemo(
    () => [
      ["Active subscriptions", metrics.active],
      ["Renewal rate", `${metrics.renewalRate || 0}%`],
      ["Cancellation rate", `${metrics.cancelRate || 0}%`],
      ["Pause rate", `${metrics.pauseRate || 0}%`],
      ["Churn rate", `${metrics.churnRate || 0}%`],
      ["Avg duration (days)", metrics.avgDuration],
      ["Avg LTV", `₹${(metrics.ltv || 0).toLocaleString("en-IN")}`],
    ],
    [metrics]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Customer Retention</h1>
        <p className="text-sm text-zinc-400 mt-1">Cohorts and rates from live subscriptions. No invented percentages.</p>
      </div>
      {loading ? (
        <p className="text-zinc-500">Loading…</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map(([label, value]) => (
              <Card key={String(label)} className="bg-zinc-950 border-zinc-800">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400">{label}</CardTitle></CardHeader>
                <CardContent className="text-2xl font-bold text-white">{value ?? "—"}</CardContent>
              </Card>
            ))}
          </div>
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader><CardTitle className="text-white text-base">Cohorts</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {cohorts.length === 0 && <p className="text-zinc-500">Not enough dated records to build cohorts.</p>}
              {cohorts.map((c) => (
                <div key={c.month} className="flex justify-between border-b border-zinc-900 py-2">
                  <span className="text-zinc-300">{c.month}</span>
                  <span className="text-zinc-500">Signups {c.signups} · First subscriptions {c.firstSub}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
