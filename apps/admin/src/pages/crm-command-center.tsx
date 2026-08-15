/**
 * AI CRM Command Center — prototype
 * Rule-based churn scoring + natural-language style queries (local heuristics).
 * Can be upgraded to Gemini later without changing the UX shell.
 */
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, MessageSquareText, AlertTriangle, Users, RefreshCcw } from "lucide-react";

type Risk = "healthy" | "watch" | "at_risk";

interface DemoCustomer {
  id: string;
  name: string;
  phone: string;
  goal: string;
  diet: string;
  planDaysLeft: number;
  skippedThisWeek: number;
  lastFeedback: number;
  paymentFails: number;
  inactiveDays: number;
  ltv: number;
}

const DEMO_CUSTOMERS: DemoCustomer[] = [
  { id: "c1", name: "Rahul Sharma", phone: "9876543210", goal: "Weight Loss", diet: "Veg", planDaysLeft: 4, skippedThisWeek: 3, lastFeedback: 2, paymentFails: 0, inactiveDays: 2, ltv: 18400 },
  { id: "c2", name: "Priya Iyer", phone: "9988776655", goal: "Muscle Gain", diet: "Non-Veg", planDaysLeft: 18, skippedThisWeek: 0, lastFeedback: 5, paymentFails: 0, inactiveDays: 0, ltv: 24200 },
  { id: "c3", name: "Anil Mehta", phone: "9123456780", goal: "Clean Living", diet: "Veg", planDaysLeft: 1, skippedThisWeek: 1, lastFeedback: 3, paymentFails: 1, inactiveDays: 1, ltv: 9600 },
  { id: "c4", name: "Sneha Rao", phone: "9090909090", goal: "Weight Loss", diet: "Veg", planDaysLeft: -3, skippedThisWeek: 0, lastFeedback: 4, paymentFails: 0, inactiveDays: 5, ltv: 12000 },
  { id: "c5", name: "Vikram Das", phone: "9811112233", goal: "Muscle Gain", diet: "Egg", planDaysLeft: 7, skippedThisWeek: 2, lastFeedback: 3, paymentFails: 0, inactiveDays: 0, ltv: 15600 },
];

function scoreCustomer(c: DemoCustomer): { score: number; risk: Risk; reasons: string[]; action: string } {
  let score = 100;
  const reasons: string[] = [];
  if (c.planDaysLeft <= 3 && c.planDaysLeft >= 0) {
    score -= 25;
    reasons.push(`Plan expires in ${c.planDaysLeft} day(s)`);
  }
  if (c.planDaysLeft < 0) {
    score -= 35;
    reasons.push(`Expired ${Math.abs(c.planDaysLeft)} day(s) ago`);
  }
  if (c.skippedThisWeek >= 2) {
    score -= 15 * Math.min(c.skippedThisWeek, 3);
    reasons.push(`${c.skippedThisWeek} skipped meals this week`);
  }
  if (c.lastFeedback <= 2) {
    score -= 20;
    reasons.push(`Last feedback ${c.lastFeedback}/5`);
  }
  if (c.paymentFails > 0) {
    score -= 15;
    reasons.push("Recent payment failure");
  }
  if (c.inactiveDays >= 3) {
    score -= 10;
    reasons.push(`Inactive ${c.inactiveDays} days`);
  }
  score = Math.max(0, Math.min(100, score));
  const risk: Risk = score >= 80 ? "healthy" : score >= 50 ? "watch" : "at_risk";
  const action =
    risk === "at_risk"
      ? "Call/WhatsApp today. Ask about meal satisfaction. Offer plan modification before discount."
      : risk === "watch"
        ? "Send personalized renewal reminder + check preferences."
        : "Nurture with loyalty points / referral nudge.";
  return { score, risk, reasons, action };
}

function answerQuery(q: string, ranked: ReturnType<typeof buildRanked>) {
  const lower = q.toLowerCase();
  if (lower.includes("cancel") || lower.includes("churn")) {
    const list = ranked.filter((r) => r.risk === "at_risk");
    return {
      title: `${list.length} customers likely to churn`,
      lines: list.map((r) => `${r.name} — ${r.score}% health · ${r.reasons[0] || "At risk"}`),
    };
  }
  if (lower.includes("call today") || lower.includes("follow-up")) {
    const list = ranked.filter((r) => r.risk !== "healthy").slice(0, 8);
    return {
      title: "Today's follow-up list",
      lines: list.map((r) => `${r.name} (${r.phone}) — ${r.action}`),
    };
  }
  if (lower.includes("expir")) {
    const list = ranked.filter((r) => r.planDaysLeft >= 0 && r.planDaysLeft <= 7);
    return {
      title: `${list.length} subscriptions expiring within 7 days`,
      lines: list.map((r) => `${r.name} — ${r.planDaysLeft} day(s) left · LTV ₹${r.ltv.toLocaleString()}`),
    };
  }
  if (lower.includes("not ordered") || lower.includes("inactive")) {
    const list = ranked.filter((r) => r.inactiveDays >= 3 || r.planDaysLeft < 0);
    return {
      title: "Inactive / no recent order",
      lines: list.map((r) => `${r.name} — inactive ${Math.max(r.inactiveDays, Math.abs(Math.min(r.planDaysLeft, 0)))} day(s)`),
    };
  }
  if (lower.includes("win-back") || lower.includes("winback")) {
    const list = ranked.filter((r) => r.planDaysLeft < 0).slice(0, 20);
    return {
      title: "Win-back campaign list",
      lines: list.map((r) => `${r.name} · expired · LTV ₹${r.ltv.toLocaleString()}`),
    };
  }
  return {
    title: "Try a sample question",
    lines: [
      "Show me customers likely to cancel this week.",
      "Which customers should I call today?",
      "Who has not ordered in 3 days?",
      "Create today's follow-up list.",
      "Give me customers for a win-back campaign.",
    ],
  };
}

function buildRanked() {
  return DEMO_CUSTOMERS.map((c) => ({ ...c, ...scoreCustomer(c) })).sort((a, b) => a.score - b.score);
}

export default function CrmCommandCenterPage() {
  const ranked = useMemo(() => buildRanked(), []);
  const [query, setQuery] = useState("Show me customers likely to cancel this week.");
  const [answer, setAnswer] = useState(() => answerQuery(query, ranked));

  const atRisk = ranked.filter((r) => r.risk === "at_risk").length;
  const expiring = ranked.filter((r) => r.planDaysLeft >= 0 && r.planDaysLeft <= 7).length;
  const renewalRevenue = ranked
    .filter((r) => r.planDaysLeft >= 0 && r.planDaysLeft <= 7)
    .reduce((s, r) => s + Math.round(r.ltv * 0.15), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <BrainCircuit className="h-8 w-8 text-indigo-400" />
          AI CRM Command Center
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Prototype — rule-based Customer AI + Retention AI. Wire Gemini when ready.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat title="At-risk customers" value={String(atRisk)} icon={<AlertTriangle className="h-4 w-4 text-red-400" />} />
        <Stat title="Expiring in 7 days" value={String(expiring)} icon={<RefreshCcw className="h-4 w-4 text-amber-400" />} />
        <Stat title="Potential renewal ₹" value={`₹${renewalRevenue.toLocaleString()}`} icon={<Users className="h-4 w-4 text-emerald-400" />} />
        <Stat title="Tracked profiles" value={String(ranked.length)} icon={<MessageSquareText className="h-4 w-4 text-sky-400" />} />
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-indigo-400" /> Ask the CRM
          </CardTitle>
          <CardDescription>Natural-language prototype over customer scores</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 h-11 rounded-lg bg-zinc-950 border border-zinc-700 px-3 text-sm text-white"
              placeholder='e.g. "Which customers should I call today?"'
            />
            <Button
              className="bg-indigo-600 hover:bg-indigo-500"
              onClick={() => setAnswer(answerQuery(query, ranked))}
            >
              Run
            </Button>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <p className="text-sm font-semibold text-indigo-300 mb-2">{answer.title}</p>
            <ul className="space-y-1.5">
              {answer.lines.map((line) => (
                <li key={line} className="text-sm text-zinc-300">
                  · {line}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Customer 360 scores</CardTitle>
          <CardDescription>🟢 Healthy 80–100 · 🟡 Watch 50–79 · 🔴 At risk 0–49</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {ranked.map((c) => (
            <div key={c.id} className="rounded-xl border border-zinc-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">
                  {c.risk === "healthy" ? "🟢" : c.risk === "watch" ? "🟡" : "🔴"} {c.name}{" "}
                  <span className="text-zinc-500 text-sm font-normal">· {c.goal} · {c.diet}</span>
                </p>
                <p className="text-xs text-zinc-400 mt-1">{c.reasons.join(" · ") || "Stable engagement"}</p>
                <p className="text-xs text-indigo-300 mt-1">{c.action}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-bold text-white">{c.score}</p>
                <p className="text-[10px] uppercase text-zinc-500">Health score</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-zinc-400">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-white">{value}</p>
      </CardContent>
    </Card>
  );
}
