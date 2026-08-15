import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePartnerDeliveries } from "@/hooks/usePartnerDeliveries";
import { startOfTodayMs, statusLabel } from "@/lib/status";
import { displayOrderId } from "@/lib/privacy";
import { usePartnerEarnings } from "@/hooks/usePartnerEarnings";

const FILTERS = ["today", "previous", "completed", "failed", "cancelled"] as const;

export default function History() {
  const { user } = useAuth();
  const { items, loading } = usePartnerDeliveries(user?.uid);
  const { rows } = usePartnerEarnings(user?.uid);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("today");
  const earnByDelivery = useMemo(() => new Map(rows.map((r) => [r.deliveryId, r.totalAmount])), [rows]);

  const list = useMemo(() => {
    const today = startOfTodayMs();
    return items
      .filter((d) => {
        if (filter === "today") return d.createdAt >= today;
        if (filter === "previous") return d.createdAt < today;
        if (filter === "completed") return d.status === "DELIVERED";
        if (filter === "failed") return d.status === "FAILED" || d.status === "RETURN_TO_KITCHEN";
        return d.status === "CANCELLED";
      })
      .sort((a, b) => (b.deliveredAt || b.updatedAt) - (a.deliveredAt || a.updatedAt));
  }, [items, filter]);

  if (loading) return <div className="p-8 text-center">Loading history…</div>;

  return (
    <div className="p-4 max-w-xl mx-auto w-full space-y-4">
      <h1 className="text-2xl font-black">History</h1>
      <div className="flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 px-3 py-2 rounded-full text-xs font-bold uppercase ${
              filter === f ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">No records in this filter.</p>
      ) : (
        list.map((d) => (
          <Link key={d.id} to={`/deliveries/${d.id}`} className="block bg-card border rounded-2xl p-4">
            <div className="flex justify-between">
              <p className="font-black">{displayOrderId(d.orderId, d.id)}</p>
              <span className="text-[10px] font-bold uppercase">{statusLabel(d.status)}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(d.createdAt).toLocaleString()} · {d.deliveryArea || "—"}
            </p>
            {d.deliveredAt ? (
              <p className="text-xs mt-1">Completed {new Date(d.deliveredAt).toLocaleTimeString()}</p>
            ) : null}
            <p className="text-sm font-bold mt-1">₹{earnByDelivery.get(d.id) ?? 0}</p>
          </Link>
        ))
      )}
    </div>
  );
}
