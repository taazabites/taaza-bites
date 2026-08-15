import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/auth-context";
import { canViewHealth } from "../lib/rbac";
import {
  buildCrmProfile,
  customerDisplayName,
  isFailedPayment,
  isPaidPayment,
  paymentAmount,
} from "../lib/crm-engine";
import { persistCustomerRisk } from "../services/crm";
import { complaintsService } from "../services/complaints";
import { formatDate, formatDateTime } from "../lib/dates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="bg-zinc-950 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-base text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="text-sm text-zinc-100 mt-1">{value || "—"}</div>
    </div>
  );
}

export default function Customer360Page() {
  const { customerId = "" } = useParams();
  const { user } = useAuth();
  const healthOk = canViewHealth(user?.role);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Record<string, any> | null>(null);
  const [subs, setSubs] = useState<Record<string, any>[]>([]);
  const [orders, setOrders] = useState<Record<string, any>[]>([]);
  const [payments, setPayments] = useState<Record<string, any>[]>([]);
  const [tickets, setTickets] = useState<Record<string, any>[]>([]);
  const [complaints, setComplaints] = useState<Record<string, any>[]>([]);
  const [events, setEvents] = useState<Record<string, any>[]>([]);
  const [health, setHealth] = useState<Record<string, any> | null>(null);
  const [referrals, setReferrals] = useState<Record<string, any>[]>([]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const snap = await getDoc(doc(db, "customers", customerId));
      if (!snap.exists()) {
        setError("Customer not found.");
        setCustomer(null);
        return;
      }
      const c: Record<string, any> = { id: snap.id, ...snap.data() };
      setCustomer(c);

      const byCustomer = async (col: string) => {
        try {
          const q = query(collection(db, col), where("customerId", "==", customerId), limit(80));
          const s = await getDocs(q);
          return s.docs.map((d) => ({ id: d.id, ...d.data() }));
        } catch {
          return [];
        }
      };

      const [s, o, p, t, ev, refs] = await Promise.all([
        byCustomer("subscriptions"),
        byCustomer("orders"),
        byCustomer("payments"),
        byCustomer("supportTickets"),
        byCustomer("subscriptionEvents"),
        byCustomer("referrals"),
      ]);
      setSubs(s);
      setOrders(o);
      setPayments(p);
      setTickets(t);
      setEvents(ev);
      setReferrals(refs);
      setComplaints(await complaintsService.listForCustomer(customerId));

      if (healthOk) {
        try {
          const hq = query(collection(db, "healthAssessments"), where("customerId", "==", customerId), limit(1));
          const hs = await getDocs(hq);
          setHealth(hs.docs[0] ? { id: hs.docs[0].id, ...hs.docs[0].data() } : c.health || null);
        } catch {
          setHealth(c.health || null);
        }
      } else {
        setHealth(null);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load customer.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [customerId]);

  const profile = useMemo(() => {
    if (!customer) return null;
    return buildCrmProfile({
      customer,
      subscriptions: subs,
      orders,
      payments,
      tickets,
      complaints,
    });
  }, [customer, subs, orders, payments, tickets, complaints]);

  useEffect(() => {
    if (customer && profile) {
      persistCustomerRisk(customer.id, profile, { id: user?.id, name: user?.name }).catch(() => {});
    }
  }, [profile?.risk.riskScore, customer?.id]);

  if (loading) {
    return <div className="p-12 text-zinc-400">Loading customer 360…</div>;
  }
  if (error || !customer || !profile) {
    return (
      <div className="p-12 text-center text-rose-400">
        {error || "Unavailable"}
        <div className="mt-4">
          <Button variant="outline" onClick={load}>Retry</Button>
        </div>
      </div>
    );
  }

  const current = subs[0];
  const completed = orders.filter((o) => String(o.orderStatus || o.status).toLowerCase() === "delivered").length;
  const cancelled = orders.filter((o) => String(o.orderStatus || o.status).toLowerCase().includes("cancel")).length;
  const failedPays = payments.filter(isFailedPayment).length;
  const refunds = payments.filter((p) => String(p.status).toLowerCase() === "refunded");
  const paid = payments.filter(isPaidPayment).reduce((s, p) => s + paymentAmount(p), 0);
  const aov = completed > 0 ? paid / Math.max(completed, 1) : 0;
  const address =
    customer.addresses?.[0]?.addressLine1 ||
    customer.addresses?.[0]?.line1 ||
    current?.address?.line1 ||
    customer.area ||
    "—";

  const timeline = [
    { label: "Customer registered", at: customer.createdAt },
    ...events.map((e) => ({ label: e.type || e.event || "Activity", at: e.createdAt || e.timestamp })),
    ...orders.map((o) => ({ label: `Order ${o.orderStatus || o.status || "placed"}`, at: o.createdAt })),
    ...payments.filter(isPaidPayment).map((p) => ({ label: "Payment completed", at: p.createdAt })),
    ...complaints.map((c) => ({ label: "Complaint created", at: c.createdAt })),
    ...tickets.map((t) => ({ label: `Ticket ${t.status || ""}`, at: t.createdAt })),
  ]
    .filter((x) => x.at)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 30);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="text-xs text-zinc-500">{customer.id}</div>
          <h1 className="text-3xl font-bold text-white">{customerDisplayName(customer)}</h1>
          <p className="text-zinc-400 mt-1">{customer.phone || "No phone"} · {customer.email || "No email"}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">{profile.segment}</Badge>
            <Badge variant="outline" className="border-zinc-700 capitalize">{profile.subscriptionStatus}</Badge>
            <Badge variant="outline" className={profile.risk.riskLevel === "HIGH" ? "border-rose-500/40 text-rose-400" : "border-amber-500/40 text-amber-300"}>
              Risk {profile.risk.riskLevel} ({profile.risk.riskScore})
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/crm" className="px-3 py-2 rounded-lg border border-zinc-800 text-sm">Back to CRM</Link>
          <Link to="/support" className="px-3 py-2 rounded-lg border border-zinc-800 text-sm">Create ticket</Link>
        </div>
      </div>

      {profile.risk.riskReasons.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-300">
          {profile.risk.riskReasons.join(" · ")}
        </div>
      )}

      <Tabs defaultValue="profile">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-zinc-900 border border-zinc-800 p-1">
          {["profile", "health", "subscription", "orders", "payments", "delivery", "support", "rewards", "timeline"].map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Section title="PROFILE">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Name" value={customerDisplayName(customer)} />
              <Field label="Phone" value={customer.phone} />
              <Field label="Email" value={customer.email} />
              <Field label="Address" value={address} />
              <Field label="Delivery area" value={customer.deliveryArea || customer.area || current?.area} />
              <Field label="Account created" value={formatDate(customer.createdAt)} />
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="health" className="mt-4">
          {!healthOk ? (
            <Section title="HEALTH ASSESSMENT">
              <p className="text-sm text-zinc-400">Health records are restricted to authorized roles.</p>
            </Section>
          ) : (
            <Section title="HEALTH ASSESSMENT">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="Goal" value={health?.goal || health?.goals?.[0]} />
                <Field label="Diet preference" value={health?.dietPreference || health?.diet} />
                <Field label="Meal preference" value={health?.mealPreference || health?.mealType} />
                <Field label="Assessment date" value={formatDate(health?.assessmentDate || health?.lastUpdated || health?.createdAt)} />
              </div>
            </Section>
          )}
        </TabsContent>

        <TabsContent value="subscription" className="mt-4">
          <Section title="SUBSCRIPTION">
            {subs.length === 0 ? (
              <p className="text-zinc-500 text-sm">No subscription on file.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="Current plan" value={profile.planName} />
                <Field label="Start date" value={formatDate(current?.startDate)} />
                <Field label="End date" value={formatDate(current?.endDate)} />
                <Field label="Meals remaining" value={profile.mealsRemaining} />
                <Field label="Meals completed" value={profile.mealsCompleted} />
                <Field label="Renewal date" value={formatDate(current?.nextBillingDate || current?.endDate)} />
                <Field label="Status" value={profile.subscriptionStatus} />
                <Field label="Original plan snapshot" value={current?.planSnapshot?.planName || "Preserved if present"} />
              </div>
            )}
          </Section>
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <Section title="ORDERS">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Field label="Total orders" value={orders.length} />
              <Field label="Completed" value={completed} />
              <Field label="Cancelled" value={cancelled} />
              <Field label="Average order value" value={`₹${Math.round(aov).toLocaleString("en-IN")}`} />
            </div>
            <Field label="Last order" value={formatDateTime(profile.lastOrderAt)} />
          </Section>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <Section title="PAYMENTS">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Total paid" value={`₹${paid.toLocaleString("en-IN")}`} />
              <Field label="Failed payments" value={failedPays} />
              <Field label="Refunds" value={refunds.length} />
              <Field label="Outstanding" value={`₹${payments.filter((p) => String(p.status).toLowerCase() === "pending").reduce((s, p) => s + paymentAmount(p), 0).toLocaleString("en-IN")}`} />
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="delivery" className="mt-4">
          <Section title="DELIVERY">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Address" value={address} />
              <Field label="Upcoming" value={orders.find((o) => ["pending", "confirmed", "preparing", "packed", "out for delivery"].includes(String(o.orderStatus || o.status).toLowerCase()))?.deliveryDate ? formatDate(orders[0]?.deliveryDate) : "None scheduled"} />
              <Field label="History" value={`${completed} delivered`} />
              <Field label="Issues" value={complaints.filter((c) => String(c.category).toLowerCase() === "delivery").length} />
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="support" className="mt-4">
          <Section title="SUPPORT">
            {tickets.length + complaints.length === 0 ? (
              <p className="text-sm text-zinc-500">No tickets or complaints.</p>
            ) : (
              <ul className="space-y-2 text-sm text-zinc-300">
                {complaints.map((c) => (
                  <li key={c.id}>Complaint · {c.category} · {c.status} · {formatDate(c.createdAt)}</li>
                ))}
                {tickets.map((t) => (
                  <li key={t.id}>Ticket · {t.subject || t.category} · {t.status} · {formatDate(t.createdAt)}</li>
                ))}
              </ul>
            )}
          </Section>
        </TabsContent>

        <TabsContent value="rewards" className="mt-4">
          <Section title="REWARDS">
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Points" value={customer.rewardPoints || 0} />
              <Field label="Referrals" value={referrals.length || customer.referralsCount || 0} />
              <Field label="Coupons used" value={customer.couponsUsed?.length || 0} />
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <Section title="ACTIVITY TIMELINE">
            {timeline.length === 0 ? (
              <p className="text-sm text-zinc-500">No recorded events yet.</p>
            ) : (
              <ol className="space-y-3">
                {timeline.map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="text-zinc-500 w-40 shrink-0">{formatDateTime(item.at)}</span>
                    <span className="text-zinc-200">{item.label}</span>
                  </li>
                ))}
              </ol>
            )}
          </Section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
