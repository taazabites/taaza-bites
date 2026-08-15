import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchOpsSnapshot } from "../lib/ops-snapshot";
import { isPaidPayment, paymentAmount, normalizeSubStatus } from "../lib/crm-engine";
import { inRange, presetRange, DatePreset, formatInr } from "../lib/dates";
import { Link } from "react-router-dom";

export default function AnalyticsLivePage() {
  const [preset, setPreset] = useState<DatePreset>("30d");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const range = presetRange(preset);
    setLoading(true);
    fetchOpsSnapshot(true)
      .then((snap) => {
        const payments = snap.payments.filter((p) => inRange(p.createdAt || p.timestamp, range));
        const orders = snap.orders.filter((o) => inRange(o.createdAt || o.deliveryDate, range));
        const customers = snap.customers.filter((c) => inRange(c.createdAt, range));
        const revenue = payments.filter(isPaidPayment).reduce((s, p) => s + paymentAmount(p), 0);
        const subRevenue = payments.filter((p) => p.subscriptionId && isPaidPayment(p)).reduce((s, p) => s + paymentAmount(p), 0);
        const oneTime = revenue - subRevenue;
        const statuses = {
          newSubs: snap.subscriptions.filter((s) => inRange(s.createdAt || s.startDate, range)).length,
          pauses: snap.subscriptions.filter((s) => normalizeSubStatus(s) === "paused").length,
          cancels: snap.subscriptions.filter((s) => normalizeSubStatus(s) === "cancelled").length,
          expired: snap.subscriptions.filter((s) => normalizeSubStatus(s) === "expired").length,
        };
        setData({
          revenue,
          subRevenue,
          oneTime,
          newCustomers: customers.length,
          orders: orders.length,
          complaints: snap.complaints.filter((c) => inRange(c.createdAt, range)).length,
          refunds: snap.payments.filter((p) => String(p.status).toLowerCase() === "refunded").length,
          deliverySuccess: orders.filter((o) => String(o.orderStatus || o.status).toLowerCase() === "delivered").length,
          ...statuses,
          truncated: snap.truncated,
          paymentRows: payments.slice(0, 12),
        });
      })
      .finally(() => setLoading(false));
  }, [preset]);

  const cards = useMemo(() => {
    if (!data) return [];
    return [
      ["Revenue (range)", formatInr(data.revenue)],
      ["Subscription revenue", formatInr(data.subRevenue)],
      ["One-time orders", formatInr(data.oneTime)],
      ["New customers", data.newCustomers],
      ["New subscriptions", data.newSubs],
      ["Pauses / Cancels / Expired", `${data.pauses} / ${data.cancels} / ${data.expired}`],
      ["Orders", data.orders],
      ["Delivered", data.deliverySuccess],
      ["Complaints", data.complaints],
      ["Refunds", data.refunds],
    ];
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-zinc-400 mt-1">Live Firestore totals for the selected range. No projected or invented series.</p>
        </div>
        <div className="flex gap-2">
          {(["today", "7d", "30d"] as DatePreset[]).map((p) => (
            <button key={p} onClick={() => setPreset(p)} className={`px-3 py-1.5 rounded-lg text-xs border ${preset === p ? "bg-emerald-600 text-zinc-950 border-emerald-500" : "border-zinc-800 text-zinc-400"}`}>
              {p}
            </button>
          ))}
          <Link to="/funnel" className="px-3 py-1.5 rounded-lg text-xs border border-zinc-800 text-zinc-300">Funnel</Link>
          <Link to="/retention" className="px-3 py-1.5 rounded-lg text-xs border border-zinc-800 text-zinc-300">Retention</Link>
        </div>
      </div>
      {loading || !data ? (
        <p className="text-zinc-500">Loading live metrics…</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(([label, value]) => (
            <Card key={String(label)} className="bg-zinc-950 border-zinc-800">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400">{label}</CardTitle></CardHeader>
              <CardContent className="text-2xl font-bold text-white">{value}</CardContent>
            </Card>
          ))}
        </div>
      )}
      {data?.truncated && <p className="text-xs text-amber-300/80">Showing the most recent 400 documents per collection. Use backend aggregates for full-history finance.</p>}
    </div>
  );
}
