import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  Calendar, 
  Search, 
  Users, 
  Edit2, 
  Download, 
  Clock, 
  ChefHat, 
  Package, 
  Layers,
  Sparkles,
  Database,
  ArrowUpRight,
  TrendingUp,
  Sliders,
  Settings2,
  X,
  History,
  Activity
} from "lucide-react";
import { collection, onSnapshot, query, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/auth-context';

export default function SchedulerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlotForEdit, setSelectedSlotForEdit] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedCapacity, setEditedCapacity] = useState(150);
  const [editedChef, setEditedChef] = useState("Chef Rahul");

  // Local state persistent store for customized slots for the day
  const [customSlots, setCustomSlots] = useState<any[]>([
    { id: '1', timeSlot: '06:00 AM - 10:00 AM', mealType: 'Breakfast', chefAssigned: 'Chef Rahul', capacity: 150 },
    { id: '2', timeSlot: '11:00 AM - 03:00 PM', mealType: 'Lunch', chefAssigned: 'Chef Amit', capacity: 200 },
    { id: '3', timeSlot: '06:00 PM - 10:00 PM', mealType: 'Dinner', chefAssigned: 'Chef Priya', capacity: 180 },
  ]);

  // Live simulation milestones log
  const milestones = [
    { time: "06:15 AM", type: "Breakfast", msg: "Breakfast Batch 1 preparation completed by Chef Rahul", status: "success" },
    { time: "08:30 AM", type: "Breakfast", msg: "All Breakfast orders dispatched to Packaging Crew", status: "success" },
    { time: "11:00 AM", type: "Lunch", msg: "Lunch slot activation. Chef Amit initiated ingredient prep", status: "info" },
    { time: "11:45 AM", type: "Lunch", msg: "Lunch prep rate at 45% capacity. Secondary line fire active", status: "warning" },
    { time: "02:15 PM", type: "Lunch", msg: "Lunch final batch cleared from stoves", status: "success" }
  ];

  useEffect(() => {
    // using kitchenQueue mapped to time slots
    const q = query(collection(db, 'kitchenQueue'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const enrichedSlots = customSlots.map(slot => {
        const slotMeals = data.filter(d => (d.mealType || 'Breakfast') === slot.mealType || 
          (slot.mealType === 'Breakfast' && d.mealType === 'Veg') || 
          (slot.mealType === 'Lunch' && d.mealType === 'Non-Veg') || 
          (slot.mealType === 'Dinner' && d.mealType === 'Vegan')
        );
        const completed = slotMeals.filter(d => d.preparationStatus === 'Ready for Packing' || d.preparationStatus === 'Ready' || d.preparationStatus === 'Packed').length;
        const total = slotMeals.length || 0;
        
        return {
          ...slot,
          totalMeals: total,
          completed,
          remaining: Math.max(0, total - completed),
        };
      });

      setSchedule(enrichedSlots);
      setLoading(false);
    });
    return unsub;
  }, [customSlots]);

  const handleEditSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotForEdit) return;

    setCustomSlots(prev => prev.map(s => {
      if (s.id === selectedSlotForEdit.id) {
        return {
          ...s,
          capacity: Number(editedCapacity),
          chefAssigned: editedChef
        };
      }
      return s;
    }));

    setIsEditModalOpen(false);
    setSelectedSlotForEdit(null);
  };

  const seedMockData = async () => {
    setLoading(true);
    try {
      const queueRef = collection(db, 'kitchenQueue');
      const packingRef = collection(db, 'packing');

      

      

      
      
    } catch (error) {
      console.error("Failed to seed mock data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalCapacity = schedule.reduce((acc, curr) => acc + curr.capacity, 0);
  const totalScheduled = schedule.reduce((acc, curr) => acc + curr.totalMeals, 0);
  const totalCompleted = schedule.reduce((acc, curr) => acc + curr.completed, 0);

  // Capacity safety warning percentage calculation
  const scheduleRatio = totalCapacity > 0 ? Math.round((totalScheduled / totalCapacity) * 100) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="h-8 w-8 text-emerald-500 animate-pulse" />
            Kitchen Management
          </h1>
          <p className="text-zinc-400 mt-1">Supervise real-time production queues, chef tasks, and kitchen throughput.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" className="border-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-900">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* UNIFORM SUB NAV TABS FOR KITCHEN SECTION */}
      <div className="flex border-b border-zinc-800 gap-6 overflow-x-auto  pb-0">
        {[
          { name: "Production Queue", path: "/kitchen", icon: ChefHat },
          { name: "Packing Station", path: "/kitchen/packing", icon: Package },
          { name: "Today's Schedule", path: "/scheduler", icon: Calendar }
        ].map((tab) => {
          const isActive = location.pathname === tab.path || location.pathname.startsWith(tab.path + "/");
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`pb-3 text-sm font-semibold relative transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap px-1 select-none ${
                isActive ? "text-emerald-400 font-bold animate-pulse" : "text-zinc-400 hover:text-white"
              }`}
            >
              <TabIcon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
              {tab.name}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* SCHEDULE SUMMARY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 border-zinc-900 shadow-md p-5 hover:border-emerald-500/10 transition-all duration-300">
          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider font-mono">Daily Safe Capacity</p>
          <p className="text-3xl font-bold text-white mt-2">{totalCapacity} <span className="text-xs text-zinc-500 font-mono">meals</span></p>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono">Combined time slot throughput limit</p>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 border-zinc-900 shadow-md p-5 hover:border-blue-500/10 transition-all duration-300">
          <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider font-mono">Scheduled Today</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">{totalScheduled}</p>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono">Total meal dockets assigned</p>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 border-zinc-900 shadow-md p-5 hover:border-emerald-500/20 transition-all duration-300">
          <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider font-mono">Total Completed</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2">{totalCompleted}</p>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono">Cleared stoves & sealed completely</p>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 border-zinc-900 shadow-md p-5 hover:border-amber-500/10 transition-all duration-300">
          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider font-mono">Kitchen Load Index</p>
          <p className="text-3xl font-bold text-white mt-2 flex items-baseline gap-1">
            {scheduleRatio}%
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center">
              <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> Optimal
            </span>
          </p>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono">Capacity safety ratio margin</p>
        </Card>
      </div>

      {/* SESSION CHRONO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {schedule.map((slot) => {
          const loadRatio = slot.capacity > 0 ? Math.round((slot.totalMeals / slot.capacity) * 100) : 0;
          return (
            <Card key={slot.id} className="bg-zinc-950/40 border border-zinc-900 hover:border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-xl">
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-zinc-400 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-emerald-400" /> {slot.timeSlot}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">{slot.mealType} Session</h3>
                  </div>
                  <Badge className={
                    slot.mealType === 'Breakfast' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    slot.mealType === 'Lunch' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                    'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  }>
                    {slot.mealType}
                  </Badge>
                </div>

                <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-900/80 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-500">Supervising Chef:</span>
                    <span className="text-white font-bold flex items-center gap-1">
                      <ChefHat className="h-3.5 w-3.5 text-emerald-500" /> {slot.chefAssigned}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-500">Max Capacity:</span>
                    <span className="text-zinc-300 font-bold">{slot.capacity} meals</span>
                  </div>
                </div>

                {/* Progress load bars */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-zinc-400">
                    <span>Load Utilized ({loadRatio}%)</span>
                    <span>{slot.totalMeals} / {slot.capacity}</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, loadRatio)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-900 bg-zinc-900/10 px-5 py-3.5 flex justify-between items-center">
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-[10px] text-zinc-500 font-mono">Done</p>
                    <p className="text-sm font-bold text-emerald-400">{slot.completed}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-zinc-500 font-mono">On Stove</p>
                    <p className="text-sm font-bold text-amber-500">{slot.remaining}</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => {
                    setSelectedSlotForEdit(slot);
                    setEditedCapacity(slot.capacity);
                    setEditedChef(slot.chefAssigned);
                    setIsEditModalOpen(true);
                  }}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Sliders className="h-3 w-3" /> Edit Session
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* BOTTOM LAYOUT: DETAILED SCHEDULE TABLE & TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TIME SLOTS TABLE */}
        <Card className="lg:col-span-2 bg-zinc-950/50 border border-zinc-800 shadow-xl overflow-hidden rounded-2xl">
          <CardHeader className="border-b border-zinc-800/60 bg-zinc-900/10 pb-4">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-500" />
              Daily Sessions Rota
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-zinc-900/50">
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-400 pl-6">TIME SLOT</TableHead>
                    <TableHead className="text-zinc-400">MEAL SESSION</TableHead>
                    <TableHead className="text-zinc-400 text-center">TOTAL SCHEDULED</TableHead>
                    <TableHead className="text-zinc-400 text-center">COMPLETED</TableHead>
                    <TableHead className="text-zinc-400 text-center">REMAINING</TableHead>
                    <TableHead className="text-zinc-400 text-center">CAPACITY</TableHead>
                    <TableHead className="text-zinc-400">CHEF ASSIGNED</TableHead>
                    <TableHead className="text-right text-zinc-400 pr-6">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedule.map((item) => (
                    <TableRow key={item.id} className="border-zinc-800 hover:bg-zinc-900/40 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-white pl-6">
                        {item.timeSlot}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          item.mealType === 'Breakfast' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          item.mealType === 'Lunch' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                          'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        }>
                          {item.mealType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-bold text-white font-mono">{item.totalMeals}</TableCell>
                      <TableCell className="text-center font-bold text-emerald-400 font-mono">{item.completed}</TableCell>
                      <TableCell className="text-center font-bold text-amber-400 font-mono">{item.remaining}</TableCell>
                      <TableCell className="text-center text-zinc-400 font-mono">{item.capacity}</TableCell>
                      <TableCell className="text-zinc-300 font-medium">
                        <div className="flex items-center gap-1.5">
                          <ChefHat className="h-3.5 w-3.5 text-emerald-500" />
                          {item.chefAssigned}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => {
                            setSelectedSlotForEdit(item);
                            setEditedCapacity(item.capacity);
                            setEditedChef(item.chefAssigned);
                            setIsEditModalOpen(true);
                          }}
                          className="h-8 w-8 p-0 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
                          title="Configure Slot"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* LIVE ACTIVITY FEED */}
        <Card className="bg-zinc-950/50 border border-zinc-800 shadow-xl p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-zinc-850 pb-3">
              <h3 className="font-bold text-white flex items-center gap-1.5 text-base">
                <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
                Shift Milestones
              </h3>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/25 text-[9px] font-mono">
                LIVE LOG
              </Badge>
            </div>
            
            <div className="space-y-4">
              {milestones.map((log, i) => (
                <div key={i} className="flex gap-3 text-xs">
                  <div className="font-mono text-zinc-500 text-[10px] pt-0.5 whitespace-nowrap">{log.time}</div>
                  <div className="relative">
                    <div className={`h-2 w-2 rounded-full mt-1.5 ${
                      log.status === 'success' ? 'bg-emerald-500' :
                      log.status === 'warning' ? 'bg-amber-500 animate-ping' :
                      'bg-blue-500'
                    }`} />
                    {i < milestones.length - 1 && (
                      <div className="absolute top-4 bottom-0 left-[3px] w-[1px] bg-zinc-800 h-8" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-zinc-300 leading-relaxed font-medium">{log.msg}</p>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-wide font-mono">{log.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-zinc-900">
            <p className="text-[10px] text-zinc-500 text-center font-mono">
              All logs synced with Kitchen Terminals.
            </p>
          </div>
        </Card>

      </div>

      {/* SESSION EDIT MODAL */}
      {isEditModalOpen && selectedSlotForEdit && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-zinc-950 border border-zinc-800 w-full max-w-md shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-zinc-900 bg-zinc-900/20 p-5">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-emerald-500" />
                  Configure Time Slot
                </CardTitle>
                <button 
                  onClick={() => { setIsEditModalOpen(false); setSelectedSlotForEdit(null); }}
                  className="text-zinc-500 hover:text-white transition-colors cursor-pointer text-sm font-semibold"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-zinc-400 text-xs mt-1">Adjust load capacities & assign culinary supervisors for: <span className="text-white font-bold">{selectedSlotForEdit.mealType}</span></p>
            </CardHeader>
            <form onSubmit={handleEditSlotSubmit}>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-zinc-400">Time Window (Read Only)</label>
                  <Input 
                    value={selectedSlotForEdit.timeSlot} 
                    disabled 
                    className="bg-zinc-900/50 border-zinc-800 text-zinc-500 font-mono text-xs rounded-xl"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-zinc-400">Target Chef Supervisor</label>
                  <select
                    value={editedChef}
                    onChange={(e) => setEditedChef(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  >
                    {["Chef Rahul", "Chef Amit", "Chef Priya", "Chef Sophia", "Chef Vikram"].map(chef => (
                      <option key={chef} value={chef}>{chef}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-zinc-400">Capacity Threshold (Meals)</label>
                  <Input 
                    type="number"
                    value={editedCapacity} 
                    onChange={(e) => setEditedCapacity(Number(e.target.value))}
                    className="bg-zinc-900 border-zinc-800 text-white text-sm rounded-xl focus:ring-emerald-500/50"
                    min="50"
                    max="500"
                  />
                  <p className="text-[10px] text-zinc-500 font-mono">Recommend 100 - 300 meals based on daily staff counts.</p>
                </div>
              </CardContent>
              <div className="border-t border-zinc-900 p-5 bg-zinc-950/80 flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => { setIsEditModalOpen(false); setSelectedSlotForEdit(null); }}
                  className="rounded-xl border border-zinc-800 text-zinc-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold px-5 rounded-xl cursor-pointer"
                >
                  Apply Slot Settings
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}
