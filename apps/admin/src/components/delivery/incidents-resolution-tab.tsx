import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Phone, RefreshCcw, ShieldAlert, CheckCircle2, MapPin, XCircle, DollarSign, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface Incident {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  driverName: string;
  reason: 'Customer Unavailable' | 'Wrong Address' | 'Access Denied (Gate)' | 'Meal Damaged' | 'Payment Issue';
  status: 'Open Escalation' | 'Re-Attempt Scheduled' | 'Resolved (Left at Gate)' | 'Resolved (Credit Issued)' | 'Resolved (Re-Dispatched)';
  loggedAt: string;
  area: string;
}

const DEFAULT_INCIDENTS: Incident[] = [
  { id: "inc-101", orderId: "ORD-9921", customerName: "Rohan Malhotra", customerPhone: "+91 98765 43210", driverName: "Karthik V", reason: "Access Denied (Gate)", status: "Open Escalation", loggedAt: "08:15 AM", area: "Koramangala 4th Block" },
  { id: "inc-102", orderId: "ORD-9934", customerName: "Priya Sharma", customerPhone: "+91 98123 76543", driverName: "Sunil Kumar", reason: "Customer Unavailable", status: "Re-Attempt Scheduled", loggedAt: "08:30 AM", area: "Indiranagar 100ft Road" },
  { id: "inc-103", orderId: "ORD-9945", customerName: "Vikram Reddy", customerPhone: "+91 97654 32109", driverName: "Manjunath R", reason: "Meal Damaged", status: "Resolved (Re-Dispatched)", loggedAt: "07:50 AM", area: "HSR Sector 2" },
  { id: "inc-104", orderId: "ORD-9950", customerName: "Ananya Roy", customerPhone: "+91 99000 11223", driverName: "Rajesh G", reason: "Wrong Address", status: "Open Escalation", loggedAt: "08:45 AM", area: "Whitefield Hope Farm" }
];

export function IncidentsResolutionTab() {
  const [incidents, setIncidents] = useState<Incident[]>(DEFAULT_INCIDENTS);
  const [filterReason, setFilterReason] = useState("All");

  const handleResolve = (incidentId: string, newStatus: Incident['status']) => {
    setIncidents(prev => prev.map(inc => inc.id === incidentId ? { ...inc, status: newStatus } : inc));
    toast.success(`Incident ${incidentId} updated to: ${newStatus}`);
  };

  const filtered = incidents.filter(i => filterReason === "All" || i.reason === filterReason);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-950 border-zinc-800 p-4">
          <div className="flex justify-between items-center text-zinc-500 text-xs font-bold uppercase">
            <span>Open Escalations</span>
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 mt-1">
            {incidents.filter(i => i.status === "Open Escalation").length}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Action needed by Support Ops</p>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800 p-4">
          <div className="flex justify-between items-center text-zinc-500 text-xs font-bold uppercase">
            <span>Re-Attempts Pending</span>
            <RefreshCcw className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {incidents.filter(i => i.status === "Re-Attempt Scheduled").length}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Scheduled for 2nd slot today</p>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800 p-4">
          <div className="flex justify-between items-center text-zinc-500 text-xs font-bold uppercase">
            <span>Kitchen Re-Dispatches</span>
            <ShieldAlert className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {incidents.filter(i => i.status.includes("Re-Dispatched")).length}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Instant fresh meal prep</p>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800 p-4">
          <div className="flex justify-between items-center text-zinc-500 text-xs font-bold uppercase">
            <span>Resolution Rate</span>
            <CheckCircle2 className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-400 mt-1">98.2%</div>
          <p className="text-[11px] text-zinc-400 mt-1">Target SLA &lt; 15 mins</p>
        </Card>
      </div>

      {/* Filter Header */}
      <div className="flex items-center justify-between bg-zinc-950/40 p-4 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-4 w-4 text-rose-400" />
          <span className="text-xs font-bold text-zinc-400 uppercase font-mono">Filter Failure Type:</span>
          <select
            value={filterReason}
            onChange={(e) => setFilterReason(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Exception Types</option>
            <option value="Customer Unavailable">Customer Unavailable</option>
            <option value="Access Denied (Gate)">Access Denied (Gate Security)</option>
            <option value="Wrong Address">Wrong Address</option>
            <option value="Meal Damaged">Meal Damaged in Transit</option>
          </select>
        </div>
      </div>

      {/* Incidents Table */}
      <Card className="bg-zinc-950 border-zinc-800 overflow-hidden rounded-xl">
        <Table>
          <TableHeader className="bg-zinc-900/40">
            <TableRow>
              <TableHead className="text-zinc-400 font-bold text-xs uppercase">Order / Logged Time</TableHead>
              <TableHead className="text-zinc-400 font-bold text-xs uppercase">Customer & Phone</TableHead>
              <TableHead className="text-zinc-400 font-bold text-xs uppercase">Driver & Area</TableHead>
              <TableHead className="text-zinc-400 font-bold text-xs uppercase">Failure Reason</TableHead>
              <TableHead className="text-zinc-400 font-bold text-xs uppercase">Current Status</TableHead>
              <TableHead className="text-zinc-400 font-bold text-xs uppercase text-right">Escalation Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-zinc-900">
            {filtered.map((inc) => (
              <TableRow key={inc.id} className="hover:bg-zinc-900/30">
                <TableCell className="font-bold text-white text-xs">
                  <div className="text-emerald-400 font-mono">{inc.orderId}</div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{inc.loggedAt}</div>
                </TableCell>
                <TableCell className="text-xs">
                  <div className="font-semibold text-white">{inc.customerName}</div>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                    <Phone className="h-3 w-3 text-zinc-500" /> {inc.customerPhone}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-zinc-300">
                  <div className="font-semibold text-zinc-200">{inc.driverName}</div>
                  <div className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-emerald-500" /> {inc.area}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px]">
                    {inc.reason}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold ${
                      inc.status === "Open Escalation"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse"
                        : inc.status === "Re-Attempt Scheduled"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}
                  >
                    {inc.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolve(inc.id, "Re-Attempt Scheduled")}
                      className="text-[11px] h-7 bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white"
                      title="Schedule Re-Attempt"
                    >
                      <RefreshCcw className="h-3 w-3 mr-1 text-amber-400" /> Re-Attempt
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolve(inc.id, "Resolved (Re-Dispatched)")}
                      className="text-[11px] h-7 bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                      title="Fresh Kitchen Dispatch"
                    >
                      Fresh Dispatch
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
