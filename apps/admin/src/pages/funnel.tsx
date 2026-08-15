import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchOpsSnapshot } from "../lib/ops-snapshot";

const STEPS = [
  { key: "page_view", label: "Subscription Page View" },
  { key: "plan_selected", label: "Plan Selected" },
  { key: "assessment_started", label: "Health Assessment Started" },
  { key: "assessment_completed", label: "Health Assessment Completed" },
  { key: "checkout_started", label: "Checkout Started" },
  { key: "payment_started", label: "Payment Started" },
  { key: "payment_successful", label: "Payment Successful" },
  { key: "subscription_activated", label: "Subscription Activated" },
] as const;

function matches(event: Record<string, any>, key: string) {
  const t = String(event.type || event.event || event.step || "").toLowerCase().replace(/[\s-]/g, "_");
  return t.includes(key) || t === key;
}

export default function FunnelPage() {
  const [counts, setCounts] = useState<number[]>(() => Array.from({ length: STEPS.length }, () => 0));
  const [note, setNote] = useState("");

  useEffect(() => {
    fetchOpsSnapshot().then((snap) => {
      const events = snap.events.filter((e) => {
        const keys = Object.keys(e).map((k) => k.toLowerCase());
        return !keys.some((k) => ["goal", "diet", "condition", "allergy", "medical", "height", "weight", "bmi"].includes(k));
      });
      const computed = STEPS.map((step) => events.filter((e) => matches(e, step.key)).length);
      const paid = snap.payments.filter((p) => ["success", "paid"].includes(String(p.status).toLowerCase())).length;
      const activated = snap.subscriptions.filter((s) => String(s.status).toLowerCase() === "active").length;
      const allZero = computed.every((n) => n === 0);
      setCounts(allZero ? computed.map((n, i) => (i === 6 ? paid : i === 7 ? activated : n)) : computed);
      if (allZero) {
        setNote("No subscriptionEvents yet. Payment success and activated subscriptions are shown from operational collections. Health fields are never sent here.");
      }
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Subscription Funnel</h1>
        <p className="text-sm text-zinc-400 mt-1">Conversion between steps. Sensitive health answers are excluded.</p>
      </div>
      {note && <p className="text-xs text-amber-300/80">{note}</p>}
      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const prev = i === 0 ? counts[i] : counts[i - 1];
          const conv = prev ? Math.round((counts[i] / prev) * 1000) / 10 : 0;
          return (
            <Card key={step.key} className="bg-zinc-950 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-zinc-300">{step.label}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-end justify-between">
                <div className="text-2xl font-bold text-white">{counts[i]}</div>
                {i > 0 && <div className="text-xs text-zinc-500">{conv}% from previous step</div>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
