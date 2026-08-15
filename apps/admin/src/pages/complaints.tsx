import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  averageResolutionHours,
  COMPLAINT_CATEGORIES,
  COMPLAINT_PRIORITIES,
  COMPLAINT_STATUSES,
  complaintsService,
  Complaint,
} from "../services/complaints";
import { useAuth } from "../contexts/auth-context";
import { formatDate } from "../lib/dates";

export default function ComplaintsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Complaint[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    customerId: "",
    customerName: "",
    orderId: "",
    category: "Food Quality",
    priority: "Medium",
    issue: "",
  });

  useEffect(() => {
    return complaintsService.subscribe(setItems);
  }, []);

  const kpis = useMemo(() => {
    const openItems = items.filter((c) => !["Resolved", "Closed"].includes(c.status));
    const high = openItems.filter((c) => ["High", "Urgent"].includes(c.priority)).length;
    const today = new Date().toISOString().slice(0, 10);
    const resolvedToday = items.filter((c) => c.resolvedAt?.startsWith(today)).length;
    return {
      open: openItems.length,
      high,
      avg: averageResolutionHours(items),
      resolvedToday,
    };
  }, [items]);

  const create = async () => {
    if (!form.customerId || !form.issue) return;
    await complaintsService.create(
      {
        customerId: form.customerId.trim(),
        customerName: form.customerName.trim(),
        orderId: form.orderId.trim() || undefined,
        category: form.category,
        priority: form.priority,
        issue: form.issue.trim(),
        message: form.issue.trim(),
        status: "Open",
      },
      { id: user?.id, name: user?.name }
    );
    setOpen(false);
    setForm({ customerId: "", customerName: "", orderId: "", category: "Food Quality", priority: "Medium", issue: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Complaints</h1>
          <p className="text-sm text-zinc-400 mt-1">Track resolution time from order and customer issues.</p>
        </div>
        <Button className="bg-emerald-600 text-zinc-950" onClick={() => setOpen(true)}>New complaint</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ["Open Complaints", kpis.open],
          ["High Priority", kpis.high],
          ["Avg resolution (hrs)", kpis.avg ?? "—"],
          ["Resolved today", kpis.resolvedToday],
        ].map(([label, value]) => (
          <Card key={String(label)} className="bg-zinc-950 border-zinc-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-400">{label}</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold text-white">{value}</CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-zinc-950 border-zinc-800">
        <CardContent className="p-0 divide-y divide-zinc-800">
          {items.length === 0 && <div className="p-10 text-center text-zinc-500">No complaints in Firestore yet.</div>}
          {items.map((c) => (
            <div key={c.id} className="p-4 flex flex-col md:flex-row md:items-center gap-3 justify-between">
              <div>
                <div className="text-white font-medium">{c.issue}</div>
                <div className="text-xs text-zinc-500 mt-1">
                  {c.customerName || c.customerId} · {c.orderId || "No order"} · {formatDate(c.createdAt)} · {c.assignedTo || "Unassigned"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-zinc-700">{c.category}</Badge>
                <Badge variant="outline">{c.priority}</Badge>
                <select
                  className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm"
                  value={c.status}
                  onChange={(e) =>
                    complaintsService.update(c.id, { status: e.target.value, resolution: c.resolution }, { id: user?.id, name: user?.name }, c)
                  }
                >
                  {COMPLAINT_STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                {c.customerId && (
                  <Link to={`/crm/customers/${c.customerId}`} className="px-3 py-1.5 text-sm rounded-md border border-zinc-800">Customer</Link>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800">
          <DialogHeader>
            <DialogTitle>Create complaint</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Customer ID</Label>
              <Input value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} />
            </div>
            <div>
              <Label>Customer name</Label>
              <Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
            </div>
            <div>
              <Label>Order ID (optional)</Label>
              <Input value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <select className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {COMPLAINT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label>Priority</Label>
                <select className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-2" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  {COMPLAINT_PRIORITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label>Issue</Label>
              <Input value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={create} className="bg-emerald-600 text-zinc-950">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
