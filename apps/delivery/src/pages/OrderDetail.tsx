import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ArrowLeft, Camera, MapPin, Navigation, Phone } from "lucide-react";
import { db, storage } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { mapDeliveryDoc } from "@/lib/mapDelivery";
import { DeliveryStop } from "@/types";
import { displayOrderId, firstName, maskPhone } from "@/lib/privacy";
import { enqueueOrSend } from "@/lib/outbox";
import { eventId, statusLabel } from "@/lib/status";
import { toast } from "react-hot-toast";
import { IssueSheet } from "@/components/IssueSheet";
import { useAuth } from "@/contexts/AuthContext";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [order, setOrder] = useState<DeliveryStop | null>(null);
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    return onSnapshot(doc(db, "deliveries", id), (snap) => {
      if (!snap.exists()) {
        toast.error("Delivery not found");
        navigate("/deliveries");
        return;
      }
      setOrder(mapDeliveryDoc(snap.id, snap.data() as Record<string, unknown>));
    });
  }, [id, navigate]);

  if (!order) return <div className="p-8 text-center">Loading stop…</div>;

  const maps = () => {
    if (!order.location) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${order.location.lat},${order.location.lng}&travelmode=driving`,
      "_blank"
    );
  };
  const call = () => window.open(`tel:${order.customerPhone}`);

  const run = async (path: string, body: Record<string, unknown>, ok: string) => {
    if (busy) return;
    setBusy(true);
    try {
      await enqueueOrSend(path, body);
      toast.success(ok);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const uploadProof = async (file: File) => {
    setBusy(true);
    try {
      const storageRef = ref(storage, `delivery_proofs/${profile?.uid || "partner"}/${order.id}.jpg`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      toast.success("Photo uploaded");
      setOrder((prev) => (prev ? { ...prev, deliveryPhotoUrl: url } : prev));
    } catch {
      toast.error("Photo upload failed");
    } finally {
      setBusy(false);
    }
  };

  const pickup = order.status === "ACCEPTED";
  const navigatePhase = order.status === "PICKED_UP" || order.status === "OUT_FOR_DELIVERY";
  const door = order.status === "OUT_FOR_DELIVERY" || order.status === "ARRIVED";
  const done = ["DELIVERED", "FAILED", "CANCELLED", "RETURN_TO_KITCHEN"].includes(order.status);
  const method = String(order.verificationMethod || "OTP").toUpperCase();

  return (
    <div className="flex flex-col min-h-full bg-slate-50 pb-8">
      <div className="bg-white border-b px-3 py-3 flex items-center gap-2 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100">
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <h1 className="font-black">{displayOrderId(order.orderId, order.id)}</h1>
          <p className="text-xs uppercase font-bold text-muted-foreground">{statusLabel(order.status)}</p>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-xl mx-auto w-full">
        <section className="bg-white rounded-2xl border p-4 space-y-2">
          <p className="text-2xl font-black">{pickup || door ? firstName(order.customerFirstName) : firstName(order.customerName)}</p>
          <p className="text-sm text-muted-foreground">{maskPhone(order.customerPhone)}</p>
          <p className="text-sm flex gap-2">
            <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
            {order.deliveryAddress}
          </p>
          <p className="text-sm font-semibold">
            {order.packageCount} package{order.packageCount === 1 ? "" : "s"}
            {order.mealName ? ` · ${order.mealName}` : ""}
          </p>
          {order.mealItems.length > 0 && <p className="text-sm">{order.mealItems.join(", ")}</p>}
          {(order.specialInstructions || order.kitchenNotes) && (
            <p className="text-sm bg-amber-50 border border-amber-100 rounded-xl p-3">
              {order.specialInstructions || order.kitchenNotes}
            </p>
          )}
        </section>

        {pickup && (
          <Button
            className="w-full h-16 text-lg font-bold"
            disabled={busy}
            onClick={() =>
              run("/pickup", { deliveryId: order.id, eventId: eventId(order.id, "PICKED_UP") }, "Pickup confirmed")
            }
          >
            Confirm Pickup
          </Button>
        )}

        {navigatePhase && (
          <div className="grid grid-cols-2 gap-2">
            <Button className="h-14" onClick={maps}>
              <Navigation className="size-5 mr-2" /> Open Maps
            </Button>
            <Button variant="outline" className="h-14" onClick={call}>
              <Phone className="size-5 mr-2" /> Call Customer
            </Button>
            {order.status === "PICKED_UP" && (
              <Button
                className="h-14 col-span-2"
                disabled={busy}
                onClick={() =>
                  run(
                    "/transition",
                    { deliveryId: order.id, toStatus: "OUT_FOR_DELIVERY", eventId: eventId(order.id, "OFD") },
                    "Out for delivery"
                  )
                }
              >
                Out for delivery
              </Button>
            )}
          </div>
        )}

        {door && (
          <div className="space-y-3">
            {order.status === "OUT_FOR_DELIVERY" && (
              <Button
                className="w-full h-14 text-lg font-bold"
                disabled={busy}
                onClick={() =>
                  run("/transition", { deliveryId: order.id, toStatus: "ARRIVED", eventId: eventId(order.id, "ARRIVED") }, "Arrived")
                }
              >
                Arrived
              </Button>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-14" onClick={call}>
                <Phone className="size-5 mr-2" /> Call Customer
              </Button>
              <Button variant="outline" className="h-14" onClick={maps}>
                <Navigation className="size-5 mr-2" /> Open Maps
              </Button>
            </div>

            {(method === "PHOTO" || method === "OTP") && (
              <div className="border border-dashed rounded-2xl p-4 text-center">
                <input
                  ref={photoRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadProof(e.target.files[0])}
                />
                {order.deliveryPhotoUrl ? (
                  <p className="text-sm text-emerald-700 font-semibold">Photo proof stored</p>
                ) : (
                  <Button variant="outline" className="w-full h-12" disabled={busy} onClick={() => photoRef.current?.click()}>
                    <Camera className="size-4 mr-2" /> Photo proof
                  </Button>
                )}
              </div>
            )}

            {order.status === "ARRIVED" && method === "OTP" && (
              <div className="space-y-2">
                <p className="text-sm font-semibold">Customer delivery OTP</p>
                <div className="flex gap-2">
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    inputMode="numeric"
                    maxLength={4}
                    className="flex-1 h-14 border rounded-xl text-center text-2xl tracking-[0.4em]"
                    placeholder="••••"
                  />
                  <Button
                    className="h-14 px-5 font-bold"
                    disabled={busy || otp.length < 4}
                    onClick={() =>
                      run(
                        "/verify-otp",
                        {
                          deliveryId: order.id,
                          otp,
                          photoUrl: order.deliveryPhotoUrl,
                          eventId: eventId(order.id, "DELIVERED"),
                        },
                        "Delivered"
                      )
                    }
                  >
                    Complete
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">Verified on the server. This screen waits for confirmation.</p>
              </div>
            )}

            {order.status === "ARRIVED" && method !== "OTP" && (
              <Button
                className="w-full h-14 font-bold"
                disabled={busy}
                onClick={() =>
                  run(
                    "/complete",
                    {
                      deliveryId: order.id,
                      photoUrl: order.deliveryPhotoUrl,
                      eventId: eventId(order.id, "DELIVERED"),
                    },
                    "Delivered"
                  )
                }
              >
                Complete Delivery
              </Button>
            )}

            <Button variant="outline" className="w-full h-12 text-red-600" onClick={() => setIssueOpen(true)}>
              Report Problem
            </Button>
          </div>
        )}

        {order.status === "ASSIGNED" && (
          <Button
            className="w-full h-16 text-lg font-bold"
            disabled={busy}
            onClick={() =>
              run("/transition", { deliveryId: order.id, toStatus: "ACCEPTED", eventId: eventId(order.id, "ACCEPTED") }, "Accepted")
            }
          >
            Start Delivery
          </Button>
        )}

        {done && (
          <div className="text-center bg-white border rounded-2xl p-6">
            <p className="font-black text-lg">{statusLabel(order.status)}</p>
            {order.status !== "DELIVERED" && (
              <p className="text-sm text-muted-foreground mt-1">This stop is not marked delivered.</p>
            )}
            <Button asChild variant="outline" className="mt-4">
              <Link to="/history">History</Link>
            </Button>
          </div>
        )}
      </div>

      <IssueSheet
        open={issueOpen}
        busy={busy}
        onClose={() => setIssueOpen(false)}
        onSubmit={async ({ reason, notes, action }) => {
          const resolved =
            reason === "Customer unavailable" || reason === "Customer requested reschedule" ? action : "NONE";
          await run(
            "/issue",
            { deliveryId: order.id, reason, notes, action: resolved, eventId: eventId(order.id, "ISSUE") },
            "Issue reported to operations"
          );
          setIssueOpen(false);
        }}
      />
    </div>
  );
}
