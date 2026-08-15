import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, RefreshCcw, Search, SlidersHorizontal } from "lucide-react";
import { loadCrmRows, CrmRow } from "../services/crm";
import { CrmSegment, customerDisplayName } from "../lib/crm-engine";
import { formatDate, formatDateTime } from "../lib/dates";
import { DataTableSkeleton } from "@/src/components/ui/data-table-skeleton";

const SEGMENTS: Array<{ key: string; label: string; segment?: CrmSegment | "all" }> = [
  { key: "all", label: "All Customers", segment: "all" },
  { key: "leads", label: "New Leads", segment: "New Lead" },
  { key: "active", label: "Active Customers", segment: "Active Customer" },
  { key: "at-risk", label: "At Risk", segment: "At Risk" },
  { key: "expiring", label: "Expiring", segment: "Renewal Due" },
  { key: "churned", label: "Churned", segment: "Churned" },
  { key: "vip", label: "VIP Customers", segment: "VIP" },
];

const COLUMNS = [
  { id: "customer", label: "Customer" },
  { id: "phone", label: "Phone" },
  { id: "status", label: "Status" },
  { id: "plan", label: "Plan" },
  { id: "subscription", label: "Subscription" },
  { id: "start", label: "Start Date" },
  { id: "expiry", label: "Expiry Date" },
  { id: "meals", label: "Meals Remaining" },
  { id: "lastOrder", label: "Last Order" },
  { id: "activity", label: "Last Activity" },
  { id: "spent", label: "Total Spent" },
  { id: "risk", label: "Risk" },
] as const;

function riskClass(level: string) {
  if (level === "HIGH") return "bg-rose-500/15 text-rose-400 border-rose-500/30";
  if (level === "MEDIUM") return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
}

export default function CrmCustomersPage() {
  const params = useParams();
  const navigate = useNavigate();
  const segmentKey = params.segment || "all";
  const segmentDef = SEGMENTS.find((s) => s.key === segmentKey) || SEGMENTS[0];
  const [rows, setRows] = useState<CrmRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"risk" | "spent" | "expiry" | "activity">("risk");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(COLUMNS.map((c) => [c.id, true]))
  );
  const [showCols, setShowCols] = useState(false);
  const pageSize = 12;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await loadCrmRows(segmentDef.segment));
    } catch (err: any) {
      setError(err?.message || "Failed to load CRM customers from Firestore.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    setPage(1);
  }, [segmentKey]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rows;
    if (q) {
      list = rows.filter(({ customer, profile }) => {
        const blob = [
          customerDisplayName(customer),
          customer.phone,
          customer.email,
          customer.id,
          profile.planName,
          customer.subscriptionId,
        ]
          .join(" ")
          .toLowerCase();
        return blob.includes(q);
      });
    }
    return [...list].sort((a, b) => {
      if (sortKey === "spent") return b.profile.totalSpent - a.profile.totalSpent;
      if (sortKey === "risk") return b.profile.risk.riskScore - a.profile.risk.riskScore;
      if (sortKey === "expiry") {
        return String(b.profile.endDate || "").localeCompare(String(a.profile.endDate || ""));
      }
      return (b.profile.lastActivityAt?.getTime() || 0) - (a.profile.lastActivityAt?.getTime() || 0);
    });
  }, [rows, search, sortKey]);

  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const exportCsv = () => {
    const header = COLUMNS.map((c) => c.label).join(",");
    const lines = filtered.map(({ customer, profile }) =>
      [
        customerDisplayName(customer),
        customer.phone || "",
        profile.segment,
        profile.planName,
        profile.subscriptionStatus,
        formatDate(profile.startDate),
        formatDate(profile.endDate),
        profile.mealsRemaining,
        formatDate(profile.lastOrderAt),
        formatDateTime(profile.lastActivityAt),
        profile.totalSpent,
        profile.risk.riskLevel,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crm-${segmentKey}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">CRM · {segmentDef.label}</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Segments are calculated from live subscription, order, payment, and support activity.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-zinc-800" onClick={load}>
            <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button onClick={exportCsv} className="bg-emerald-600 hover:bg-emerald-500 text-zinc-950">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {SEGMENTS.map((s) => (
          <Button
            key={s.key}
            size="sm"
            variant={s.key === segmentKey ? "default" : "outline"}
            className={s.key === segmentKey ? "bg-emerald-600 text-zinc-950" : "border-zinc-800"}
            onClick={() => navigate(s.key === "all" ? "/crm" : `/crm/${s.key}`)}
          >
            {s.label}
          </Button>
        ))}
      </div>

      <Card className="bg-zinc-950 border-zinc-800">
        <div className="p-4 flex flex-col md:flex-row gap-3 border-b border-zinc-800">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, phone, customer ID, subscription ID"
              className="pl-9 bg-zinc-900 border-zinc-800"
            />
          </div>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as any)}
            className="bg-zinc-900 border border-zinc-800 rounded-md text-sm px-3 py-2"
          >
            <option value="risk">Sort: Risk</option>
            <option value="spent">Sort: Spend</option>
            <option value="expiry">Sort: Expiry</option>
            <option value="activity">Sort: Activity</option>
          </select>
          <Button variant="outline" className="border-zinc-800" onClick={() => setShowCols((v) => !v)}>
            <SlidersHorizontal className="h-4 w-4 mr-2" /> Columns
          </Button>
        </div>
        {showCols && (
          <div className="px-4 py-3 flex flex-wrap gap-3 border-b border-zinc-800 text-sm text-zinc-400">
            {COLUMNS.map((c) => (
              <label key={c.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={visible[c.id]}
                  onChange={() => setVisible((v) => ({ ...v, [c.id]: !v[c.id] }))}
                />
                {c.label}
              </label>
            ))}
          </div>
        )}
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <DataTableSkeleton columnCount={8} rowCount={6} />
            </div>
          ) : error ? (
            <div className="p-12 text-center text-rose-400">
              {error}
              <div className="mt-4">
                <Button variant="outline" onClick={load}>Retry</Button>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">No customers in this segment yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800">
                    <TableHead className="w-10">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          const next: Record<string, boolean> = {};
                          pageRows.forEach((r) => {
                            next[r.customer.id] = e.target.checked;
                          });
                          setSelected(next);
                        }}
                      />
                    </TableHead>
                    {visible.customer && <TableHead>Customer</TableHead>}
                    {visible.phone && <TableHead>Phone</TableHead>}
                    {visible.status && <TableHead>Status</TableHead>}
                    {visible.plan && <TableHead>Plan</TableHead>}
                    {visible.subscription && <TableHead>Subscription</TableHead>}
                    {visible.start && <TableHead>Start Date</TableHead>}
                    {visible.expiry && <TableHead>Expiry Date</TableHead>}
                    {visible.meals && <TableHead>Meals Remaining</TableHead>}
                    {visible.lastOrder && <TableHead>Last Order</TableHead>}
                    {visible.activity && <TableHead>Last Activity</TableHead>}
                    {visible.spent && <TableHead>Total Spent</TableHead>}
                    {visible.risk && <TableHead>Risk</TableHead>}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.map(({ customer, profile }) => (
                    <TableRow key={customer.id} className="border-zinc-800">
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={!!selected[customer.id]}
                          onChange={() =>
                            setSelected((s) => ({ ...s, [customer.id]: !s[customer.id] }))
                          }
                        />
                      </TableCell>
                      {visible.customer && (
                        <TableCell>
                          <div className="font-medium text-white">{customerDisplayName(customer)}</div>
                          <div className="text-xs text-zinc-500 font-mono">{customer.id}</div>
                        </TableCell>
                      )}
                      {visible.phone && <TableCell className="text-zinc-300">{customer.phone || "—"}</TableCell>}
                      {visible.status && (
                        <TableCell>
                          <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                            {profile.segment}
                          </Badge>
                        </TableCell>
                      )}
                      {visible.plan && <TableCell>{profile.planName}</TableCell>}
                      {visible.subscription && (
                        <TableCell className="capitalize">{profile.subscriptionStatus}</TableCell>
                      )}
                      {visible.start && <TableCell>{formatDate(profile.startDate)}</TableCell>}
                      {visible.expiry && <TableCell>{formatDate(profile.endDate)}</TableCell>}
                      {visible.meals && <TableCell>{profile.mealsRemaining}</TableCell>}
                      {visible.lastOrder && <TableCell>{formatDate(profile.lastOrderAt)}</TableCell>}
                      {visible.activity && <TableCell>{formatDateTime(profile.lastActivityAt)}</TableCell>}
                      {visible.spent && (
                        <TableCell>₹{profile.totalSpent.toLocaleString("en-IN")}</TableCell>
                      )}
                      {visible.risk && (
                        <TableCell>
                          <Badge variant="outline" className={riskClass(profile.risk.riskLevel)}>
                            {profile.risk.riskLevel}
                          </Badge>
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        <Link to={`/crm/customers/${customer.id}`} className="px-3 py-1.5 text-sm rounded-md border border-zinc-800">View 360</Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800 text-sm text-zinc-500">
            <span>
              {filtered.length} customers
              {Object.values(selected).filter(Boolean).length > 0
                ? ` · ${Object.values(selected).filter(Boolean).length} selected`
                : ""}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="py-1">
                {page}/{pages}
              </span>
              <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
