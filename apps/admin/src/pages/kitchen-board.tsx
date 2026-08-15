import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  ChefHat, 
  Play, 
  Pause, 
  CheckCircle2, 
  Search, 
  Clock, 
  Users, 
  Printer, 
  Download, 
  Utensils, 
  Package, 
  Calendar,
  Flame,
  UserCheck,
  AlertCircle,
  Database,
  Sparkles,
  ShieldCheck,
  BookOpen,
  QrCode
} from "lucide-react";
import { kitchenService } from '../services/kitchen';
import { useAuth } from '../contexts/auth-context';
import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { ThermalLabelModal } from "../components/kitchen/thermal-label-modal";
import { QcInspectionModal } from "../components/kitchen/qc-inspection-modal";
import { RecipeDetailsModal } from "../components/kitchen/recipe-details-modal";

import { KitchenTabs } from "../components/kitchen/kitchen-tabs";

const CHEFS_ROSTER = [
  { name: "Chef Rahul", specialty: "North Indian / Clay Oven", activeTasks: 2, status: "Active" },
  { name: "Chef Amit", specialty: "Continental & Gourmet", activeTasks: 1, status: "Active" },
  { name: "Chef Priya", specialty: "Health & Nutrition Bowls", activeTasks: 3, status: "Active" },
  { name: "Chef Sophia", specialty: "Salads & Vegan Prep", activeTasks: 0, status: "On Break" },
  { name: "Chef Vikram", specialty: "Desserts & Bakery", activeTasks: 1, status: "Active" }
];

export default function KitchenPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusTab, setSelectedStatusTab] = useState("All");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedItemForChef, setSelectedItemForChef] = useState<any | null>(null);

  // Modal states for Thermal Labeling, 5-Pass QC, and Recipe SOPs
  const [selectedLabelItem, setSelectedLabelItem] = useState<any | null>(null);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);

  const [selectedQcItem, setSelectedQcItem] = useState<any | null>(null);
  const [isQcModalOpen, setIsQcModalOpen] = useState(false);

  const [selectedRecipeItem, setSelectedRecipeItem] = useState<any | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

  const handleApproveQC = async (itemId: string, qcNotes: string) => {
    try {
      await updateDoc(doc(db, 'kitchenQueue', itemId), {
        preparationStatus: 'Ready for Packing',
        qcApproved: true,
        qcNotes,
        qcApprovedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to update QC status:", error);
    }
  };

  useEffect(() => {
    const unsub = kitchenService.subscribeToQueue((items) => {
      setQueue(items);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await kitchenService.updateQueueStatus(id, newStatus);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAssignChef = async (id: string, chefName: string) => {
    try {
      await updateDoc(doc(db, 'kitchenQueue', id), {
        chefAssigned: chefName,
        updatedAt: new Date().toISOString()
      });
      setIsAssignModalOpen(false);
      setSelectedItemForChef(null);
    } catch (error) {
      console.error(error);
    }
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

  // Status-based filtering
  const filteredQueue = queue.filter(item => {
    // Search query matching
    const matchesSearch = 
      item.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.meal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.chefAssigned?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Status tab matching
    if (selectedStatusTab === "All") return true;
    if (selectedStatusTab === "Pending") return item.preparationStatus === 'Pending';
    if (selectedStatusTab === "Preparing") return item.preparationStatus === 'Preparing';
    if (selectedStatusTab === "Ready") return item.preparationStatus === 'Ready for Packing';
    return true;
  });

  const pendingCount = queue.filter(q => q.preparationStatus === 'Pending').length;
  const preparingCount = queue.filter(q => q.preparationStatus === 'Preparing').length;
  const readyCount = queue.filter(q => q.preparationStatus === 'Ready for Packing' || q.preparationStatus === 'Ready').length;

  // Real-time capacity completion percentage
  const totalInQueue = queue.length;
  const completionPercentage = totalInQueue > 0 
    ? Math.round((readyCount / totalInQueue) * 100) 
    : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <ChefHat className="h-8 w-8 text-emerald-500 animate-pulse" />
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

      <KitchenTabs />

      {/* STATS & METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 border-zinc-900 shadow-md p-5 hover:border-emerald-500/10 transition-all duration-300">
          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider font-mono">Meals to Prepare</p>
          <p className="text-3xl font-bold text-white mt-2">{totalInQueue}</p>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono">Current active kitchen load</p>
        </Card>
        
        <Card className="bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 border-zinc-900 shadow-md p-5 hover:border-amber-500/10 transition-all duration-300">
          <div className="flex justify-between items-start">
            <p className="text-xs text-amber-500 font-semibold uppercase tracking-wider font-mono">Pending Fire</p>
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
          </div>
          <p className="text-3xl font-bold text-amber-400 mt-2">{pendingCount}</p>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono">Awaiting chef pick-up</p>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 border-zinc-900 shadow-md p-5 hover:border-blue-500/10 transition-all duration-300">
          <div className="flex justify-between items-start">
            <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider font-mono">On the Stove</p>
            <Flame className="h-4 w-4 text-blue-400 animate-pulse" />
          </div>
          <p className="text-3xl font-bold text-blue-400 mt-2">{preparingCount}</p>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono">Under active prep</p>
        </Card>

        {/* Dynamic Capacity gauge */}
        <Card className="bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 border-zinc-900 shadow-md p-5 hover:border-emerald-500/20 transition-all duration-300">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider font-mono">Ready Rate</p>
              <p className="text-3xl font-bold text-white mt-1">{readyCount} <span className="text-xs text-zinc-500 font-mono">meals</span></p>
            </div>
            <div className="relative flex items-center justify-center">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle cx="28" cy="28" r="22" stroke="#18181b" strokeWidth="4" fill="transparent" />
                <circle cx="28" cy="28" r="22" stroke="#10b981" strokeWidth="4" fill="transparent"
                  strokeDasharray={138} strokeDashoffset={138 - (138 * completionPercentage) / 100} />
              </svg>
              <span className="absolute text-[10px] font-mono font-bold text-emerald-400">{completionPercentage}%</span>
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono">Dispatched to packing</p>
        </Card>
      </div>

      {/* FILTER & QUEUE BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950/20 border border-zinc-900 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto ">
          {[
            { id: "All", label: "All Items", count: totalInQueue },
            { id: "Pending", label: "Awaiting Chef", count: pendingCount },
            { id: "Preparing", label: "In Preparation", count: preparingCount },
            { id: "Ready", label: "Ready", count: readyCount }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatusTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                selectedStatusTab === tab.id
                  ? "bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
              }`}
            >
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                selectedStatusTab === tab.id ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-900 text-zinc-500'
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search Order ID, meal, customer, chef..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-zinc-900/40 border-zinc-800/80 pl-10 text-white w-full rounded-xl"
          />
        </div>
      </div>

      {/* PRODUCTION QUEUE DATATABLE */}
      <Card className="bg-zinc-950/50 border-zinc-800 shadow-xl overflow-hidden rounded-2xl">
        <CardHeader className="border-b border-zinc-800/60 bg-zinc-900/10 pb-4">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Utensils className="h-5 w-5 text-emerald-500" />
            Live Prep Sheet
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
              <p className="text-sm text-zinc-500 font-mono">Synchronizing Live Kitchen state...</p>
            </div>
          ) : filteredQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-zinc-500">
              <Utensils className="h-12 w-12 mb-4 opacity-20 text-emerald-500" />
              <p className="font-semibold text-zinc-300">No matching orders in active prep.</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs text-center">New orders placed by customers will appear in this real-time queue automatically.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-zinc-900/50">
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-400 font-mono text-xs">QUEUE NO.</TableHead>
                    <TableHead className="text-zinc-400 text-xs">ORDER ID</TableHead>
                    <TableHead className="text-zinc-400 text-xs">CUSTOMER</TableHead>
                    <TableHead className="text-zinc-400 text-xs">MEAL NAME</TableHead>
                    <TableHead className="text-zinc-400 text-xs">DIETARY TYPE</TableHead>
                    <TableHead className="text-zinc-400 text-center text-xs w-20">QTY</TableHead>
                    <TableHead className="text-zinc-400 text-xs">EST. PREP TIME</TableHead>
                    <TableHead className="text-zinc-400 text-xs">ASSIGNED CHEF</TableHead>
                    <TableHead className="text-zinc-400 text-xs">PRIORITY</TableHead>
                    <TableHead className="text-zinc-400 text-xs">STATUS</TableHead>
                    <TableHead className="text-right text-zinc-400 text-xs">CONTROLS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQueue.map((item, index) => {
                    const isVeg = item.mealType === 'Veg';
                    const isVegan = item.mealType === 'Vegan';
                    const isHighProtein = item.mealType === 'High Protein';
                    const badgeColor = isVeg ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                                       isVegan ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : 
                                       "bg-rose-500/10 text-rose-400 border-rose-500/20";

                    return (
                      <TableRow key={item.id} className="border-zinc-800 hover:bg-zinc-900/40 transition-colors">
                        <TableCell className="font-mono font-bold text-zinc-500 text-xs pl-6">
                          #{String(index + 1).padStart(2, '0')}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-zinc-400">
                          {item.orderId || 'N/A'}
                        </TableCell>
                        <TableCell className="text-white font-medium">
                          {item.customerName || 'Guest'}
                        </TableCell>
                        <TableCell className="text-white font-semibold">
                          {item.meal}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`font-mono text-[10px] rounded-lg ${badgeColor}`}>
                            {item.mealType || 'Standard'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-bold text-emerald-400 font-mono text-sm">
                          {item.quantity || 1}
                        </TableCell>
                        <TableCell className="text-zinc-400 text-xs font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-zinc-500" />
                            {item.prepTime || '15 mins'}
                          </span>
                        </TableCell>
                        <TableCell className="text-zinc-300">
                          <button 
                            onClick={() => {
                              setSelectedItemForChef(item);
                              setIsAssignModalOpen(true);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 hover:border-zinc-700 text-xs font-medium cursor-pointer transition-all text-zinc-200"
                          >
                            <Users className="h-3 w-3 text-emerald-500" />
                            {item.chefAssigned || 'Assign Chef'}
                          </button>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            item.priority === 'High' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 font-bold' :
                            item.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold' :
                            'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }>
                            {item.priority || 'Medium'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            item.preparationStatus === 'Ready for Packing' || item.preparationStatus === 'Ready' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold' :
                            item.preparationStatus === 'Preparing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 font-bold animate-pulse' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }>
                            {item.preparationStatus || 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex justify-end gap-1.5">
                            {item.preparationStatus === 'Pending' && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 hover:bg-emerald-500/10 hover:text-emerald-400 text-zinc-500 rounded-lg cursor-pointer"
                                onClick={() => handleUpdateStatus(item.id, 'Preparing')} 
                                title="Start Prep"
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            {item.preparationStatus === 'Preparing' && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 hover:bg-amber-500/10 hover:text-amber-400 text-zinc-500 rounded-lg cursor-pointer"
                                onClick={() => handleUpdateStatus(item.id, 'Pending')} 
                                title="Pause Prep"
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            )}
                            {item.preparationStatus === 'Preparing' && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 hover:bg-blue-500/10 hover:text-blue-400 text-zinc-500 rounded-lg cursor-pointer"
                                onClick={() => handleUpdateStatus(item.id, 'Ready for Packing')} 
                                title="Ready for Packaging"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 hover:bg-emerald-500/10 hover:text-emerald-400 text-zinc-500 rounded-lg cursor-pointer"
                              title="View Recipe SOP Card"
                              onClick={() => {
                                setSelectedRecipeItem({ mealName: item.meal, ingredients: item.ingredients || [] });
                                setIsRecipeModalOpen(true);
                              }}
                            >
                              <BookOpen className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 hover:bg-blue-500/10 hover:text-blue-400 text-zinc-500 rounded-lg cursor-pointer"
                              title="5-Pass QC Audit"
                              onClick={() => {
                                setSelectedQcItem(item);
                                setIsQcModalOpen(true);
                              }}
                            >
                              <ShieldCheck className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 hover:bg-zinc-800 hover:text-white text-zinc-500 rounded-lg cursor-pointer"
                              title="Print Thermal Packaging Label"
                              onClick={() => {
                                setSelectedLabelItem(item);
                                setIsLabelModalOpen(true);
                              }}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ROSTER OVERVIEW SIDEBAR CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2 bg-gradient-to-br from-zinc-950/40 to-zinc-900/10 border-zinc-900 p-5 rounded-2xl shadow-md">
          <div className="flex justify-between items-center mb-4 border-b border-zinc-800/80 pb-3">
            <h3 className="font-bold text-white flex items-center gap-1.5 text-base">
              <Users className="h-4 w-4 text-emerald-400" />
              Kitchen Chef Roster Status
            </h3>
            <Badge variant="outline" className="bg-emerald-500/5 text-emerald-400 border-emerald-500/20 text-[10px]">
              Live Shift Rota
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {CHEFS_ROSTER.map((chef) => (
              <div key={chef.name} className="flex justify-between items-center bg-zinc-950/50 border border-zinc-900 p-3.5 rounded-xl">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">{chef.name}</p>
                  <p className="text-[10px] text-zinc-400">{chef.specialty}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={
                    chef.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]' : 'bg-zinc-800 text-zinc-500 border-zinc-700 text-[10px]'
                  }>
                    {chef.status}
                  </Badge>
                  <p className="text-[10px] text-zinc-500 mt-1 font-mono">{chef.activeTasks} items assigned</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-950/40 to-zinc-900/10 border-zinc-900 p-5 rounded-2xl shadow-md flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white flex items-center gap-1.5 text-base mb-2">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              Smart Dispatch Center
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Once head chefs complete prepared meals, they automatically populate in the <span className="text-emerald-400 font-semibold">Packing Station</span> workflow to be checked, sealed, labeled, and prepared for delivery drivers.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-900">
            <Button 
              onClick={() => navigate("/kitchen/packing")}
              className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-emerald-400 hover:text-emerald-300 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer"
            >
              Go To Packing Station <Package className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* INTERACTIVE CHEF ASSIGNMENT MODAL */}
      {isAssignModalOpen && selectedItemForChef && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-zinc-950 border border-zinc-800 w-full max-w-md shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-zinc-900 bg-zinc-900/20 p-5">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-emerald-500" />
                  Assign Head Chef
                </CardTitle>
                <button 
                  onClick={() => { setIsAssignModalOpen(false); setSelectedItemForChef(null); }}
                  className="text-zinc-500 hover:text-white transition-colors cursor-pointer text-sm font-semibold"
                >
                  ✕
                </button>
              </div>
              <p className="text-zinc-400 text-xs mt-1">Select a culinary expert for: <span className="text-white font-bold">{selectedItemForChef.meal}</span> (Qty: {selectedItemForChef.quantity})</p>
            </CardHeader>
            <CardContent className="p-5 space-y-3 max-h-[350px] overflow-y-auto">
              {CHEFS_ROSTER.map((chef) => (
                <button
                  key={chef.name}
                  disabled={chef.status !== 'Active'}
                  onClick={() => handleAssignChef(selectedItemForChef.id, chef.name)}
                  className={`w-full flex justify-between items-center p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    chef.status === 'Active' 
                      ? 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/80 hover:border-emerald-500/30'
                      : 'border-zinc-900 bg-zinc-950/20 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      {chef.name}
                      {chef.status === 'Active' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                    </p>
                    <p className="text-[10px] text-zinc-400">{chef.specialty}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-zinc-500">{chef.activeTasks} meals active</span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODALS */}
      <ThermalLabelModal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        item={selectedLabelItem}
      />

      <QcInspectionModal
        isOpen={isQcModalOpen}
        onClose={() => setIsQcModalOpen(false)}
        item={selectedQcItem}
        onApproveQC={handleApproveQC}
      />

      <RecipeDetailsModal
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
        recipe={selectedRecipeItem}
      />

    </div>
  );
}
