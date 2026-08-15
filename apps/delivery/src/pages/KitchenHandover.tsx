import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePartnerDeliveries } from "@/hooks/usePartnerDeliveries";
import { Button } from "@/components/ui/button";
import { enqueueOrSend } from "@/lib/outbox";
import { eventId } from "@/lib/status";
import { toast } from "react-hot-toast";
import { QrCode } from "lucide-react";

export default function KitchenHandover() {
  const { user } = useAuth();
  const { sortedOpen } = usePartnerDeliveries(user?.uid);
  const [busy, setBusy] = useState(false);
  const ready = useMemo(() => sortedOpen.filter((d) => d.status === "ACCEPTED"), [sortedOpen]);

  const confirm = async () => {
    if (!ready.length || busy) return;
    setBusy(true);
    try {
      await enqueueOrSend("/pickup", {
        deliveryIds: ready.map((d) => d.id),
        eventId: eventId("batch", "PICKED_UP"),
      });
      toast.success(`${ready.length} pickup event${ready.length === 1 ? "" : "s"} stored`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Pickup failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-black flex items-center gap-2">
        <QrCode className="size-6 text-orange-500" /> Pickup
      </h1>
      <p className="text-sm text-muted-foreground">Confirm kitchen handover for accepted stops. Each confirm writes a delivery event.</p>
      <div className="bg-zinc-900 text-white rounded-2xl p-5">
        <p className="text-xs uppercase tracking-widest text-zinc-400">Packages</p>
        <p className="text-4xl font-black">{ready.reduce((n, d) => n + d.packageCount, 0)}</p>
        <p className="text-sm text-zinc-300 mt-1">{ready.length} accepted orders</p>
      </div>
      {ready.map((d) => (
        <div key={d.id} className="bg-card border rounded-xl p-3 text-sm">
          <p className="font-bold">{d.orderId}</p>
          <p>{d.customerFirstName} · {d.packageCount} pkg · {d.mealName || d.mealItems.join(", ")}</p>
          {d.specialInstructions && <p className="text-amber-800 mt-1">{d.specialInstructions}</p>}
          <p className="text-muted-foreground mt-1">{d.deliveryAddress}</p>
        </div>
      ))}
      <Button className="w-full h-16 text-lg font-bold" disabled={!ready.length || busy} onClick={confirm}>
        Confirm Pickup
      </Button>
    </div>
  );
}
