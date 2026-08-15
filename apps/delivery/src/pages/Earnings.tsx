import { IndianRupee, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePartnerEarnings } from "@/hooks/usePartnerEarnings";

export default function Earnings() {
  const { user } = useAuth();
  const { rows, totals, loading } = usePartnerEarnings(user?.uid);

  if (loading) return <div className="p-8 text-center">Loading earnings…</div>;

  return (
    <div className="p-4 max-w-xl mx-auto w-full space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Earnings</h1>
        <span className="text-xs bg-muted px-2 py-1 rounded-full font-semibold">Read only</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Card label="Today" value={`₹${totals.today.toFixed(0)}`} />
        <Card label="This week" value={`₹${totals.week.toFixed(0)}`} />
        <Card label="This month" value={`₹${totals.month.toFixed(0)}`} />
        <Card label="Completed" value={String(totals.completed)} />
      </div>
      <div className="bg-emerald-600 text-white rounded-2xl p-5">
        <p className="text-sm text-emerald-100 flex items-center gap-2">
          <Wallet className="size-4" /> Average / delivery
        </p>
        <p className="text-4xl font-black mt-1">₹{totals.avg.toFixed(0)}</p>
      </div>
      <div className="space-y-2">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Earnings appear after operations confirms a delivery.
          </p>
        ) : (
          rows
            .slice()
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 30)
            .map((r) => (
              <div key={r.id} className="bg-card border rounded-2xl p-4 flex justify-between">
                <div>
                  <p className="font-semibold">{r.orderId || r.deliveryId}</p>
                  <p className="text-xs text-muted-foreground">
                    Base ₹{r.baseAmount} · Bonus ₹{r.bonus} · Adj ₹{r.adjustment}
                  </p>
                </div>
                <p className="font-black text-lg flex items-center">
                  <IndianRupee className="size-4" />
                  {r.totalAmount}
                </p>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card border rounded-2xl p-4">
      <p className="text-[10px] uppercase font-bold text-muted-foreground">{label}</p>
      <p className="text-2xl font-black mt-1">{value}</p>
    </div>
  );
}
