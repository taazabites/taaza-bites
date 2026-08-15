import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/auth-context";
import { Navigate } from "react-router-dom";
import { auth } from "../lib/firebase";
import { toast } from "sonner";
import {
  Shield,
  Bike,
  Link2,
  Globe,
  ToggleLeft,
  Loader2,
  Plus,
  Ban,
  CheckCircle2,
} from "lucide-react";

type Tab = "portals" | "partners" | "customers";

async function api(path: string, init?: RequestInit) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(`/api/super-admin${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(init?.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`) as Error & {
      status?: number;
      fallback?: boolean;
    };
    err.status = res.status;
    err.fallback = data.fallback;
    throw err;
  }
  return data;
}

export default function SuperAdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("portals");
  const [loading, setLoading] = useState(false);

  const [portals, setPortals] = useState({
    customerUrl: "/app",
    adminUrl: "/admin",
    landingUrl: "/",
    deliveryUrl: "/partner",
  });
  const [flags, setFlags] = useState({
    maintenanceMode: false,
    allowCustomerSignup: true,
    allowPartnerSelfRegister: false,
    showStaffLoginOnLanding: true,
  });

  const [partners, setPartners] = useState<any[]>([]);
  const [partnerForm, setPartnerForm] = useState({ phone: "", name: "", email: "" });

  const [maps, setMaps] = useState<any[]>([]);
  const [mapForm, setMapForm] = useState({
    customerAppUid: "",
    email: "",
    phone: "",
    displayName: "",
  });

  if (!user || user.role !== "Super Admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  const loadPortals = async () => {
    setLoading(true);
    try {
      const data = await api("/portals");
      if (data.portals) setPortals((p) => ({ ...p, ...data.portals }));
      if (data.featureFlags) setFlags((f) => ({ ...f, ...data.featureFlags }));
    } catch (e: any) {
      if (e.fallback || e.status === 503) {
        toast.message("API offline — edit env locally; Firestore portals need Admin SDK.");
      } else {
        toast.error(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPartners = async () => {
    setLoading(true);
    try {
      const data = await api("/partners");
      setPartners(data.partners || []);
    } catch (e: any) {
      toast.error(e.message || "Could not load partners (needs Firebase Admin credentials)");
    } finally {
      setLoading(false);
    }
  };

  const loadMaps = async () => {
    setLoading(true);
    try {
      const data = await api("/customer-map");
      setMaps(data.maps || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "portals") loadPortals();
    if (tab === "partners") loadPartners();
    if (tab === "customers") loadMaps();
  }, [tab]);

  const savePortals = async () => {
    try {
      await api("/portals", {
        method: "PUT",
        body: JSON.stringify({ portals, featureFlags: flags }),
      });
      toast.success("Portal URLs & feature flags saved");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const registerPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api("/partners", {
        method: "POST",
        body: JSON.stringify(partnerForm),
      });
      toast.success("Delivery partner approved & registered");
      setPartnerForm({ phone: "", name: "", email: "" });
      loadPartners();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const toggleBlock = async (id: string, isBlocked: boolean) => {
    try {
      await api(`/partners/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isBlocked, status: isBlocked ? "Blocked" : "Active" }),
      });
      toast.success(isBlocked ? "Partner blocked" : "Partner unblocked");
      loadPartners();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const linkCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api("/customer-map", {
        method: "POST",
        body: JSON.stringify(mapForm),
      });
      toast.success("Customer account mapped");
      setMapForm({ customerAppUid: "", email: "", phone: "", displayName: "" });
      loadMaps();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "portals", label: "Portals & Flags", icon: <Globe className="w-4 h-4" /> },
    { id: "partners", label: "Delivery Partners", icon: <Bike className="w-4 h-4" /> },
    { id: "customers", label: "Customer Mapping", icon: <Link2 className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Super Admin Control</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Invite staff from Admin Management. Here: portals, partner approval, customer linking.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition ${
              tab === t.id
                ? "bg-emerald-600 border-emerald-500 text-white"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-zinc-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      )}

      {tab === "portals" && (
        <div className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Portal URLs</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["landingUrl", "Landing"],
                ["customerUrl", "Customer"],
                ["adminUrl", "Admin"],
                ["deliveryUrl", "Delivery"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block text-xs text-zinc-500">
                {label}
                <input
                  className="mt-1 w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white"
                  value={(portals as any)[key]}
                  onChange={(e) => setPortals({ ...portals, [key]: e.target.value })}
                />
              </label>
            ))}
          </div>

          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2 pt-2">
            <ToggleLeft className="w-4 h-4" /> Feature flags
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                ["maintenanceMode", "Maintenance mode"],
                ["allowCustomerSignup", "Allow customer signup"],
                ["allowPartnerSelfRegister", "Allow partner self-register"],
                ["showStaffLoginOnLanding", "Show staff login on landing"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
              >
                {label}
                <input
                  type="checkbox"
                  checked={Boolean((flags as any)[key])}
                  onChange={(e) => setFlags({ ...flags, [key]: e.target.checked })}
                />
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={savePortals}
            className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold"
          >
            Save portals & flags
          </button>
        </div>
      )}

      {tab === "partners" && (
        <div className="space-y-6">
          <form
            onSubmit={registerPartner}
            className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 space-y-3"
          >
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Approve / register partner
            </h2>
            <p className="text-xs text-zinc-500">
              Writes to the Delivery Partner Firestore DB so they can log into the partner app.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                required
                placeholder="Phone (10 digit)"
                className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white"
                value={partnerForm.phone}
                onChange={(e) =>
                  setPartnerForm({ ...partnerForm, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })
                }
              />
              <input
                placeholder="Name"
                className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white"
                value={partnerForm.name}
                onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
              />
              <input
                placeholder="Email (optional)"
                className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white"
                value={partnerForm.email}
                onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-bold"
            >
              <CheckCircle2 className="w-4 h-4" /> Register partner
            </button>
          </form>

          <div className="rounded-2xl border border-zinc-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900 text-zinc-400 text-xs uppercase">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Phone</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => (
                  <tr key={p.id} className="border-t border-zinc-800 text-zinc-200">
                    <td className="p-3">{p.name || "—"}</td>
                    <td className="p-3 font-mono text-xs">{p.phone || p.id}</td>
                    <td className="p-3">
                      {p.isBlocked ? (
                        <span className="text-red-400">Blocked</span>
                      ) : (
                        <span className="text-emerald-400">{p.status || "Active"}</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => toggleBlock(p.id, !p.isBlocked)}
                        className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        {p.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))}
                {!partners.length && !loading && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-zinc-500 text-xs">
                      No partners in delivery DB yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "customers" && (
        <div className="space-y-6">
          <form
            onSubmit={linkCustomer}
            className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 space-y-3"
          >
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
              Map customer app account
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                placeholder="Customer app UID (optional)"
                className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white"
                value={mapForm.customerAppUid}
                onChange={(e) => setMapForm({ ...mapForm, customerAppUid: e.target.value })}
              />
              <input
                placeholder="Email"
                className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white"
                value={mapForm.email}
                onChange={(e) => setMapForm({ ...mapForm, email: e.target.value })}
              />
              <input
                placeholder="Phone"
                className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white"
                value={mapForm.phone}
                onChange={(e) => setMapForm({ ...mapForm, phone: e.target.value })}
              />
              <input
                placeholder="Display name"
                className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white"
                value={mapForm.displayName}
                onChange={(e) => setMapForm({ ...mapForm, displayName: e.target.value })}
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-bold"
            >
              Link account
            </button>
          </form>

          <div className="rounded-2xl border border-zinc-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900 text-zinc-400 text-xs uppercase">
                <tr>
                  <th className="text-left p-3">UID</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Phone</th>
                  <th className="text-left p-3">Linked</th>
                </tr>
              </thead>
              <tbody>
                {maps.map((m) => (
                  <tr key={m.id} className="border-t border-zinc-800 text-zinc-200">
                    <td className="p-3 font-mono text-xs">{m.customerAppUid || m.id}</td>
                    <td className="p-3">{m.email || "—"}</td>
                    <td className="p-3">{m.phone || "—"}</td>
                    <td className="p-3 text-xs text-zinc-500">{m.linkedAt || "—"}</td>
                  </tr>
                ))}
                {!maps.length && !loading && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-zinc-500 text-xs">
                      No mappings yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
