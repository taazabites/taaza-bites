import { useMemo, useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { DeliveryAssignment } from "@/types";
import { QrCode, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

/** Batch id format: TB-YYYYMMDD-<partnerShort> */
function buildBatchId(uid: string) {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `TB-${ymd}-${uid.slice(0, 4).toUpperCase()}`;
}

export default function KitchenHandover() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<DeliveryAssignment[]>([]);
  const [scannedCode, setScannedCode] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!user) return;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const q = query(
      collection(db, "deliveryAssignments"),
      where("partnerId", "==", user.uid),
      where("createdAt", ">=", startOfDay.getTime())
    );
    return onSnapshot(q, (snap) => {
      const list: DeliveryAssignment[] = [];
      snap.forEach((d) => {
        const data = { id: d.id, ...d.data() } as DeliveryAssignment;
        if (!["rejected", "failed", "returned"].includes(data.status)) list.push(data);
      });
      setDeliveries(list);
    });
  }, [user]);

  const batchId = useMemo(() => (user ? buildBatchId(user.uid) : "TB-XXXX"), [user]);
  const expected = deliveries.filter((d) => !["delivered"].includes(d.status)).length;
  const codeOk = scannedCode.trim().toUpperCase() === batchId;

  const confirmHandover = () => {
    if (!codeOk) {
      toast.error("Batch QR / code does not match your route");
      return;
    }
    setConfirmed(true);
    toast.success(`✅ ${expected} meals collected for ${batchId}`);
  };

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto w-full space-y-5">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <QrCode className="size-6 text-orange-500" /> Kitchen Handover
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Scan or enter your batch code before leaving the kitchen.
        </p>
      </div>

      <div className="bg-zinc-900 text-white rounded-2xl p-6 text-center space-y-2">
        <p className="text-xs uppercase tracking-widest text-zinc-400">Your route batch</p>
        <p className="text-3xl font-black tracking-wider">{batchId}</p>
        <p className="text-sm text-zinc-300">
          {expected} meals → {expected} customers
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Enter / scan batch code
        </label>
        <input
          value={scannedCode}
          onChange={(e) => {
            setScannedCode(e.target.value);
            setConfirmed(false);
          }}
          placeholder={batchId}
          className="w-full h-12 px-4 rounded-xl border bg-background font-mono text-sm tracking-wide"
        />
      </div>

      <Button className="w-full h-12" onClick={confirmHandover}>
        Confirm meal collection
      </Button>

      {confirmed && codeOk && (
        <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-emerald-900">
          <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
          <p className="text-sm">
            <strong>✅ {expected} meals collected</strong> for route {batchId}. You can leave the kitchen.
          </p>
        </div>
      )}

      {scannedCode && !codeOk && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl p-4 text-red-900">
          <AlertTriangle className="size-5 shrink-0 text-red-600" />
          <p className="text-sm">
            <strong>❌ Code mismatch</strong> — expected {batchId}. Ask kitchen to re-print your batch QR.
          </p>
        </div>
      )}

      <div className="bg-card border rounded-2xl p-4">
        <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Manifest</p>
        <ul className="space-y-1.5 max-h-48 overflow-y-auto">
          {deliveries.map((d, i) => (
            <li key={d.id} className="text-sm flex justify-between gap-2">
              <span className="truncate">
                {i + 1}. {d.customerName}
              </span>
              <span className="text-xs text-muted-foreground shrink-0">{d.mealType}</span>
            </li>
          ))}
          {!deliveries.length && (
            <li className="text-sm text-muted-foreground">No assignments yet for today.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
