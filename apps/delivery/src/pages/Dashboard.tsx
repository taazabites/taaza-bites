import { Link } from "react-router-dom";
import { collection, limit, onSnapshot, query, where, doc, updateDoc } from "firebase/firestore";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Bell,
  CheckCircle2,
  IndianRupee,
  MapPin,
  Package,
  Play,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { usePartnerDeliveries } from "@/hooks/usePartnerDeliveries";
import { usePartnerEarnings } from "@/hooks/usePartnerEarnings";
import { greetingForHour, isOpenStatus } from "@/lib/status";
import { displayOrderId } from "@/lib/privacy";
import { partnerApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { PartnerNotification } from "@/types";
import { pendingCount } from "@/lib/outbox";
import { useLocationTracking } from "@/hooks/useLocationTracking";

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { today, sortedOpen, loading } = usePartnerDeliveries(user?.uid);
  const { totals } = usePartnerEarnings(user?.uid);
  const [notes, setNotes] = useState<PartnerNotification[]>([]);
  const [busy, setBusy] = useState(false);
  const online = profile?.currentStatus === "ONLINE" || profile?.currentStatus === "ON_DELIVERY";
  useLocationTracking(online);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "partnerNotifications"),
      where("partnerId", "==", user.uid),
      limit(12)
    );
    return onSnapshot(q, (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<PartnerNotification, "id">) }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setNotes(list);
    });
  }, [user]);

  const counts = useMemo(() => {
    const c = { assigned: 0, picked: 0, ofd: 0, delivered: 0, failed: 0 };
    for (const d of today) {
      if (d.status === "ASSIGNED" || d.status === "ACCEPTED") c.assigned++;
      else if (d.status === "PICKED_UP") c.picked++;
      else if (d.status === "OUT_FOR_DELIVERY" || d.status === "ARRIVED") c.ofd++;
      else if (d.status === "DELIVERED") c.delivered++;
      else if (d.status === "FAILED" || d.status === "RETURN_TO_KITCHEN") c.failed++;
    }
    return c;
  }, [today]);

  const pending = today.filter((d) => isOpenStatus(d.status)).length;
  const unread = notes.filter((n) => !n.read).length;
  const queued = pendingCount();

  const togglePresence = async () => {
    if (!profile || busy) return;
    if (profile.currentStatus === "SUSPENDED") return;
    const next = online && profile.currentStatus !== "ON_DELIVERY" ? "OFFLINE" : "ONLINE";
    if (profile.currentStatus === "ON_DELIVERY" && next === "OFFLINE") {
      toast.error("Finish active deliveries before going offline");
      return;
    }
    setBusy(true);
    try {
      await partnerApi("/presence", { currentStatus: next });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update status");
    } finally {
      setBusy(false);
    }
  };

  const markRead = async (id: string) => {
    await updateDoc(doc(db, "partnerNotifications", id), { read: true });
  };

  if (loading) return <div className="p-8 text-center">Loading…</div>;

  return (
    <div className="flex flex-col gap-5 p-4 max-w-xl mx-auto w-full pb-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{greetingForHour()}</p>
          <h1 className="text-2xl font-black leading-tight">{profile?.name}</h1>
          <p className="text-xs font-semibold mt-1 uppercase tracking-wider text-muted-foreground">
            {profile?.currentStatus.replace("_", " ")}
          </p>
        </div>
        <Button
          variant={online ? "outline" : "default"}
          className="h-11"
          disabled={busy}
          onClick={togglePresence}
        >
          {online ? "Go Offline" : "Go Online"}
        </Button>
      </div>

      {queued > 0 && (
        <p className="text-xs bg-amber-50 border border-amber-100 text-amber-900 rounded-xl px-3 py-2">
          {queued} update{queued === 1 ? "" : "s"} waiting to retry when the network returns.
        </p>
      )}

      <div className="grid grid-cols-5 gap-2">
        <Stat n={counts.assigned} l="Assigned" />
        <Stat n={counts.picked} l="Picked Up" />
        <Stat n={counts.ofd} l="Out" />
        <Stat n={counts.delivered} l="Delivered" />
        <Stat n={counts.failed} l="Failed" />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Hero label="Today's earnings" value={`₹${totals.today}`} icon={<IndianRupee className="size-4" />} />
        <Hero label="Today's deliveries" value={String(counts.delivered)} icon={<CheckCircle2 className="size-4" />} />
        <Hero label="Pending" value={String(pending)} icon={<Package className="size-4" />} />
      </div>

      <Button asChild className="h-16 text-lg font-bold rounded-2xl">
        <Link to="/deliveries">
          <Play className="size-6 mr-2" /> Start Deliveries
        </Link>
      </Button>

      {sortedOpen[0] && (
        <Link to={`/deliveries/${sortedOpen[0].id}`} className="bg-card border rounded-2xl p-4 block">
          <p className="text-[10px] uppercase font-bold text-muted-foreground">Next stop</p>
          <p className="text-xl font-black mt-1">{displayOrderId(sortedOpen[0].orderId, sortedOpen[0].id)}</p>
          <p className="text-sm mt-1 flex items-center gap-1">
            <MapPin className="size-4 text-primary" /> {sortedOpen[0].deliveryArea || sortedOpen[0].deliveryAddress}
          </p>
          <p className="text-sm mt-1">
            {sortedOpen[0].mealName || "Meal"} · {sortedOpen[0].packageCount} package
            {sortedOpen[0].packageCount === 1 ? "" : "s"}
          </p>
        </Link>
      )}

      {unread > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Bell className="size-4" /> Operations ({unread} new)
          </h2>
          {notes
            .filter((n) => !n.read)
            .slice(0, 3)
            .map((n) => (
              <button
                key={n.id}
                className="w-full text-left bg-emerald-50 border border-emerald-100 rounded-xl p-3"
                onClick={() => markRead(n.id)}
              >
                <p className="font-semibold text-sm">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
              </button>
            ))}
        </div>
      )}
      {pending > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-900">
          <p>
            You have <strong>{pending}</strong> pending stop{pending === 1 ? "" : "s"}. Start deliveries, collect at kitchen, then open maps.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="h-12" asChild>
          <Link to="/kitchen-handover">Kitchen pickup</Link>
        </Button>
        <Button variant="outline" className="h-12" asChild>
          <Link to="/route">Open route</Link>
        </Button>
      </div>
    </div>
  );
}

function Stat({ n, l }: { n: number; l: string }) {
  return (
    <div className="bg-card border rounded-2xl p-2 text-center">
      <p className="text-lg font-black">{n}</p>
      <p className="text-[9px] uppercase font-bold text-muted-foreground leading-tight">{l}</p>
    </div>
  );
}

function Hero({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="bg-card border rounded-2xl p-3">
      <div className="text-primary mb-1">{icon}</div>
      <p className="text-lg font-black leading-none">{value}</p>
      <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
