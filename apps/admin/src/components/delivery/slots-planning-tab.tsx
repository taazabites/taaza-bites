import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, MapPin, Building2, ShieldAlert, Plus, Layers, Sparkles, CheckCircle2, Sliders, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface SlotData {
  id: string;
  slotName: string;
  timeRange: string;
  area: string;
  pincode: string;
  capacityLimit: number;
  bookedCount: number;
  status: 'Available' | 'High Demand' | 'Fully Booked';
  assignedDriverCount: number;
}

const DEFAULT_SLOTS: SlotData[] = [
  { id: "slot-1", slotName: "Morning Peak (Breakfast)", timeRange: "07:00 - 09:00 AM", area: "Koramangala", pincode: "560034", capacityLimit: 500, bookedCount: 465, status: "High Demand", assignedDriverCount: 12 },
  { id: "slot-2", slotName: "Morning Peak (Breakfast)", timeRange: "07:00 - 09:00 AM", area: "Indiranagar", pincode: "560001", capacityLimit: 450, bookedCount: 450, status: "Fully Booked", assignedDriverCount: 10 },
  { id: "slot-3", slotName: "Afternoon Express (Lunch)", timeRange: "12:00 - 02:00 PM", area: "HSR Layout", pincode: "560102", capacityLimit: 600, bookedCount: 320, status: "Available", assignedDriverCount: 15 },
  { id: "slot-4", slotName: "Afternoon Tech Park Run", timeRange: "12:00 - 02:00 PM", area: "Embassy GolfLinks / Marathahalli", pincode: "560037", capacityLimit: 800, bookedCount: 790, status: "High Demand", assignedDriverCount: 18 },
  { id: "slot-5", slotName: "Evening Reset (Dinner)", timeRange: "07:00 - 09:00 PM", area: "Whitefield", pincode: "560066", capacityLimit: 400, bookedCount: 180, status: "Available", assignedDriverCount: 8 },
  { id: "slot-6", slotName: "Evening Reset (Dinner)", timeRange: "07:00 - 09:00 PM", area: "Electronic City Phase 1", pincode: "560100", capacityLimit: 350, bookedCount: 350, status: "Fully Booked", assignedDriverCount: 7 }
];

export function SlotsPlanningTab() {
  const [slots, setSlots] = useState<SlotData[]>(DEFAULT_SLOTS);
  const [selectedArea, setSelectedArea] = useState("All");
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlotForm, setNewSlotForm] = useState({
    slotName: "Morning Peak (Breakfast)",
    timeRange: "07:00 - 09:00 AM",
    area: "Jayanagar",
    pincode: "560004",
    capacityLimit: 300
  });

  const handleAddSlot = () => {
    if (!newSlotForm.area || !newSlotForm.pincode) {
      toast.error("Area and PIN code are required");
      return;
    }
    const newSlot: SlotData = {
      id: `slot-${Date.now()}`,
      slotName: newSlotForm.slotName,
      timeRange: newSlotForm.timeRange,
      area: newSlotForm.area,
      pincode: newSlotForm.pincode,
      capacityLimit: newSlotForm.capacityLimit,
      bookedCount: 0,
      status: "Available",
      assignedDriverCount: 4
    };
    setSlots([newSlot, ...slots]);
    setShowAddSlot(false);
    toast.success(`Slot created for ${newSlot.area} (${newSlot.pincode})`);
  };

  const filteredSlots = slots.filter(s => selectedArea === "All" || s.area === selectedArea);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Overview stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-950 border-zinc-800 p-4">
          <div className="flex justify-between items-center text-zinc-500 text-xs font-bold uppercase">
            <span>Total Slot Capacity</span>
            <Clock className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {slots.reduce((acc, s) => acc + s.capacityLimit, 0).toLocaleString()} Meals
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Configured for Bengaluru Hubs</p>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800 p-4">
          <div className="flex justify-between items-center text-zinc-500 text-xs font-bold uppercase">
            <span>Booked Subscriptions</span>
            <Layers className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {slots.reduce((acc, s) => acc + s.bookedCount, 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {Math.round((slots.reduce((acc, s) => acc + s.bookedCount, 0) / slots.reduce((acc, s) => acc + s.capacityLimit, 0)) * 100)}% Overall Fill Rate
          </p>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800 p-4">
          <div className="flex justify-between items-center text-zinc-500 text-xs font-bold uppercase">
            <span>Fully Booked Slots</span>
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 mt-1">
            {slots.filter(s => s.status === "Fully Booked").length}
          </div>
          <p className="text-[11px] text-rose-400/80 mt-1">Auto-Blocked on Customer App</p>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800 p-4">
          <div className="flex justify-between items-center text-zinc-500 text-xs font-bold uppercase">
            <span>Active Dispatch Fleet</span>
            <Building2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {slots.reduce((acc, s) => acc + s.assignedDriverCount, 0)} Drivers
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Stationed across 6 zones</p>
        </Card>
      </div>

      {/* Control Bar & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-950/40 p-4 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <MapPin className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-bold text-zinc-400 uppercase font-mono">Filter by Area:</span>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Bengaluru Zones</option>
            {Array.from(new Set(slots.map(s => s.area))).map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        <Button
          onClick={() => setShowAddSlot(!showAddSlot)}
          className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[3px]" /> Add New Delivery Slot
        </Button>
      </div>

      {/* Add Slot Expandable Form */}
      {showAddSlot && (
        <Card className="bg-zinc-900/60 border-zinc-800 p-5 rounded-2xl animate-in slide-in-from-top-2">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-emerald-400" /> Create Custom Zone Slot & Order Cap
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-zinc-400 font-medium block mb-1">Time Slot Name</label>
              <select
                value={newSlotForm.slotName}
                onChange={(e) => setNewSlotForm({ ...newSlotForm, slotName: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white"
              >
                <option value="Morning Peak (Breakfast)">Morning Peak (07:00 - 09:00 AM)</option>
                <option value="Afternoon Express (Lunch)">Afternoon Express (12:00 - 02:00 PM)</option>
                <option value="Evening Reset (Dinner)">Evening Reset (07:00 - 09:00 PM)</option>
              </select>
            </div>
            <div>
              <label className="text-zinc-400 font-medium block mb-1">Area Name</label>
              <Input
                value={newSlotForm.area}
                onChange={(e) => setNewSlotForm({ ...newSlotForm, area: e.target.value })}
                placeholder="e.g. Jayanagar"
                className="bg-zinc-950 border-zinc-800 text-white"
              />
            </div>
            <div>
              <label className="text-zinc-400 font-medium block mb-1">PIN Code</label>
              <Input
                value={newSlotForm.pincode}
                onChange={(e) => setNewSlotForm({ ...newSlotForm, pincode: e.target.value })}
                placeholder="560004"
                className="bg-zinc-950 border-zinc-800 text-white"
              />
            </div>
            <div>
              <label className="text-zinc-400 font-medium block mb-1">Maximum Order Cap (Capacity)</label>
              <Input
                type="number"
                value={newSlotForm.capacityLimit}
                onChange={(e) => setNewSlotForm({ ...newSlotForm, capacityLimit: Number(e.target.value) })}
                className="bg-zinc-950 border-zinc-800 text-white font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setShowAddSlot(false)} className="text-zinc-400 hover:text-white text-xs">
              Cancel
            </Button>
            <Button onClick={handleAddSlot} className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl">
              Save Slot & Apply Limits
            </Button>
          </div>
        </Card>
      )}

      {/* Slots Table */}
      <Card className="bg-zinc-950 border-zinc-800 overflow-hidden rounded-xl">
        <Table>
          <TableHeader className="bg-zinc-900/40">
            <TableRow>
              <TableHead className="text-zinc-400 font-bold text-xs uppercase">Time Slot</TableHead>
              <TableHead className="text-zinc-400 font-bold text-xs uppercase">Area & PIN Code</TableHead>
              <TableHead className="text-zinc-400 font-bold text-xs uppercase">Capacity / Booked</TableHead>
              <TableHead className="text-zinc-400 font-bold text-xs uppercase">Capacity Bar</TableHead>
              <TableHead className="text-zinc-400 font-bold text-xs uppercase">Fleet Assigned</TableHead>
              <TableHead className="text-zinc-400 font-bold text-xs uppercase text-right">Slot Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-zinc-900">
            {filteredSlots.map((s) => {
              const fillPct = Math.min(100, Math.round((s.bookedCount / s.capacityLimit) * 100));
              return (
                <TableRow key={s.id} className="hover:bg-zinc-900/30">
                  <TableCell className="font-bold text-white text-xs">
                    <div>{s.slotName}</div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{s.timeRange}</div>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-300">
                    <div className="font-semibold text-white">{s.area}</div>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-zinc-900 border-zinc-800 text-zinc-400 font-mono mt-0.5">
                      PIN: {s.pincode}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    <span className="font-extrabold text-white">{s.bookedCount}</span>
                    <span className="text-zinc-500"> / {s.capacityLimit}</span>
                  </TableCell>
                  <TableCell className="w-48">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-zinc-400">{fillPct}% Full</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            fillPct >= 100 ? "bg-rose-500" : fillPct >= 85 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-300 font-mono">
                    {s.assignedDriverCount} Drivers Active
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold uppercase ${
                        s.status === "Fully Booked"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : s.status === "High Demand"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}
                    >
                      {s.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
