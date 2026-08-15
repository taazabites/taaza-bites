/**
 * Rule-based CRM command center using live Firestore rows (not demo customers).
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, AlertTriangle, Users } from "lucide-react";
import { loadCrmRows, CrmRow } from "../services/crm";
import { customerDisplayName } from "../lib/crm-engine";
import { formatInr } from "../lib/dates";

export default function CrmCommandCenterPage() {
  const [rows, setRows] = useState<CrmRow[]>([]);
  const [query, setQuery] = useState("Show me customers likely to cancel this week.");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCrmRows()
      .then(setRows)
      .finally(() => setLoading(false));
  }, []);

  const ranked = useMemo(
    () => [...rows].sort((a, b) => a.profile.risk.riskScore > b.profile.risk.riskScore ? -1 : 1),
    [rows]
  );

  const atRisk = ranked.filter((r) => r.profile.risk.riskLevel === "HIGH");
  const expiring = ranked.filter((r) => r.profile.subscriptionStatus === "expiring");

  const answer = useMemo(() => {
    const lower = query.toLowerCase();
    if (lower.includes("cancel") || lower.includes("churn")) {
      return {
        title: `${atRisk.length} customers likely to churn`,
        lines: atRisk.slice(0, 12).map((r) => `${customerDisplayName(r.customer)} — ${r.profile.risk.riskReasons[0] || "At risk"}`),
      };
    }
    if (lower.includes("call today") || lower.includes("follow-up")) {
      return {
        title: "Today's follow-up list",
        lines: ranked.filter((r) => r.profile.risk.riskLevel !== "LOW").slice(0, 8).map((r) => `${customerDisplayName(r.customer)} (${r.customer.phone || "no phone"})`),
      };
    }
    if (lower.includes("expir")) {
      return {
        title: `${expiring.length} subscriptions expiring within 7 days`,
        lines: expiring.map((r) => `${customerDisplayName(r.customer)} · ${r.profile.planName} · LTV ${formatInr(r.profile.totalSpent)}`),
      };
    }
    if (lower.includes("inactive") || lower.includes("not ordered")) {
      const list = ranked.filter((r) => r.profile.segment === "Inactive");
      return { title: "Inactive customers", lines: list.slice(0, 12).map((r) => customerDisplayName(r.customer)) };
    }
    return {
      title: "Try a live query",
      lines: [
        "Show me customers likely to cancel this week.",
        "Which customers should I call today?",
        "Who is expiring?",
      ],
    };
  }, [query, ranked, atRisk, expiring]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <BrainCircuit className="h-8 w-8 text-indigo-400" />
          CRM Command Center
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Live Firestore customers. Risk is operational, never health-based.</p>
      </div>
      {loading ? (
        <p className="text-zinc-500">Loading live CRM…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-zinc-950 border-zinc-800"><CardHeader><CardTitle className="text-sm text-zinc-400 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-rose-400" /> At-risk</CardTitle></CardHeader><CardContent className="text-3xl font-bold text-white">{atRisk.length}</CardContent></Card>
            <Card className="bg-zinc-950 border-zinc-800"><CardHeader><CardTitle className="text-sm text-zinc-400 flex items-center gap-2"><Users className="h-4 w-4" /> Expiring</CardTitle></CardHeader><CardContent className="text-3xl font-bold text-white">{expiring.length}</CardContent></Card>
            <Card className="bg-zinc-950 border-zinc-800"><CardHeader><CardTitle className="text-sm text-zinc-400">Loaded customers</CardTitle></CardHeader><CardContent className="text-3xl font-bold text-white">{rows.length}</CardContent></Card>
          </div>
          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="pt-6 space-y-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm"
              />
              <div>
                <h2 className="text-white font-semibold">{answer.title}</h2>
                <ul className="mt-2 text-sm text-zinc-400 space-y-1">
                  {answer.lines.length === 0 && <li>No matching live customers.</li>}
                  {answer.lines.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader><CardTitle className="text-white text-base">Highest risk</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {ranked.slice(0, 12).map((r) => (
                <div key={r.customer.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-zinc-200">{customerDisplayName(r.customer)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">{r.profile.risk.riskLevel}</span>
                    <Link to={`/crm/customers/${r.customer.id}`} className="px-3 py-1.5 text-sm rounded-md border border-zinc-800">Open</Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
