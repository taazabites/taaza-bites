import { Link } from "react-router-dom";
import { MapPin, Navigation } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePartnerDeliveries } from "@/hooks/usePartnerDeliveries";
import { Button } from "@/components/ui/button";
import { displayOrderId, firstName, maskPhone } from "@/lib/privacy";
import { enqueueOrSend } from "@/lib/outbox";
import { eventId, statusLabel } from "@/lib/status";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { distanceKm } from "@/lib/routeUtils";

export default function Deliveries() {
  const { user, profile } = useAuth();
  const { sortedOpen, loading, here } = usePartnerDeliveries(user?.uid);
  const [busy, setBusy] = useState<string | null>(null);
  const suspended = profile?.currentStatus === "SUSPENDED";

  const start = async (id: string) => {
    if (suspended || busy) return;
    setBusy(id);
    try {
      await enqueueOrSend("/transition", { deliveryId: id, toStatus: "ACCEPTED", eventId: eventId(id, "ACCEPTED") });
      toast.success("Accepted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start");
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading queue…</div>;

  return (
    <div className="p-4 max-w-xl mx-auto w-full space-y-4">
      <h1 className="text-2xl font-black">Delivery queue</h1>
      <p className="text-sm text-muted-foreground">Only stops assigned to you. Sorted by slot, area, then distance.</p>
      {sortedOpen.length === 0 ? (
        <div className="border border-dashed rounded-2xl p-10 text-center text-sm text-muted-foreground">
          No open deliveries. Stay online for new assignments.
        </div>
      ) : (
        sortedOpen.map((d) => {
          const km = here && d.location ? distanceKm(here, d.location).toFixed(1) : null;
          return (
            <article key={d.id} className="bg-card border rounded-2xl overflow-hidden">
              <div className="p-4 space-y-2">
                <div className="flex justify-between gap-2">
                  <h2 className="text-xl font-black">{displayOrderId(d.orderId, d.id)}</h2>
                  <span className="text-[10px] font-bold uppercase bg-muted px-2 py-1 rounded-full h-fit">
                    {statusLabel(d.status)}
                  </span>
                </div>
                {km && (
                  <p className="text-sm font-semibold">
                    📍 {km} km away
                  </p>
                )}
                <p className="font-bold">{firstName(d.customerFirstName || d.customerName)}</p>
                <p className="text-sm text-muted-foreground">{maskPhone(d.customerPhone)}</p>
                <p className="text-sm flex gap-2">
                  <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    <span className="font-semibold">{d.deliveryArea || "Area TBA"}</span>
                    <span className="block">{d.deliveryAddress}</span>
                  </span>
                </p>
                <p className="text-sm">
                  {d.mealName || d.mealItems.join(", ") || "Meal"} · {d.packageCount} package
                  {d.packageCount === 1 ? "" : "s"}
                </p>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Slot {d.deliverySlot || "—"} · {d.paymentStatus === "cod" ? "COD" : "PAID"}
                </p>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2 border-t">
                {d.location && (
                  <Button
                    variant="outline"
                    className="h-12"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&destination=${d.location!.lat},${d.location!.lng}&travelmode=driving`,
                        "_blank"
                      )
                    }
                  >
                    <Navigation className="size-4 mr-1" /> Open Map
                  </Button>
                )}
                {d.status === "ASSIGNED" ? (
                  <Button className="h-12 font-bold" disabled={!!busy || suspended} onClick={() => start(d.id)}>
                    {busy === d.id ? "…" : "Start Delivery"}
                  </Button>
                ) : (
                  <Button asChild className="h-12 font-bold col-span-2">
                    <Link to={`/deliveries/${d.id}`}>Open stop</Link>
                  </Button>
                )}
              </div>
            </article>
          );
        })
      )}
    </div>
  );
}
