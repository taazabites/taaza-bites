import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  Package, 
  CheckCircle2, 
  Search, 
  Users, 
  Printer, 
  Download, 
  Box, 
  ChefHat, 
  Calendar,
  Layers,
  Sparkles,
  ClipboardCheck,
  CheckCircle,
  Database
} from "lucide-react";
import { collection, onSnapshot, query, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/auth-context';
import { KitchenTabs } from "../components/kitchen/kitchen-tabs";

const STAFF_ROSTER = [
  { name: "Rohan Dev", role: "Sealing Specialist", speed: "Fast", status: "Active" },
  { name: "Karan Sharma", role: "Quality Assurer", speed: "Medium", status: "Active" },
  { name: "Ananya Sen", role: "Eco-Box Assembler", speed: "Fast", status: "Active" },
  { name: "Preeti Das", role: "Label Dispatcher", speed: "Medium", status: "Active" },
  { name: "Suresh Kumar", role: "Bulk Organizer", speed: "Slow", status: "On Leave" }
];

export default function KitchenPackingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [packing, setPacking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaffForAssign, setSelectedStaffForAssign] = useState<any | null>(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [selectedStatusTab, setSelectedStatusTab] = useState("All");

  // Local checklist simulation state to represent sealed items visually
  const [checklistMap, setChecklistMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const q = query(collection(db, 'packing'));
    const unsub = onSnapshot(q, (snapshot) => {
      const items: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPacking(items);
      
      // Initialize checklist state for each packing item if not exists
      const initialMap: Record<string, string[]> = {};
      items.forEach((item: any) => {
        initialMap[item.id] = item.itemChecklist || ['Bowl/Tray', 'Lid Sealed', 'Cutlery Pack', 'Sauce/Side'];
      });
      setChecklistMap(prev => ({ ...initialMap, ...prev }));
      
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'packing', id), {
        packagingStatus: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleAssignStaff = async (id: string, staffName: string) => {
    try {
      await updateDoc(doc(db, 'packing', id), {
        packingStaff: staffName,
        updatedAt: new Date().toISOString()
      });
      setIsStaffModalOpen(false);
      setSelectedStaffForAssign(null);
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

  const toggleChecklistItem = async (itemId: string, checkText: string) => {
    const currentList = checklistMap[itemId] || [];
    let updated: string[];
    if (currentList.includes(checkText)) {
      updated = currentList.filter(t => t !== checkText);
    } else {
      updated = [...currentList, checkText];
    }

    setChecklistMap(prev => ({
      ...prev,
      [itemId]: updated
    }));

    // Update item checklist in firestore
    try {
      await updateDoc(doc(db, 'packing', itemId), {
        itemChecklist: updated
      });
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = packing.filter(item => {
    const matchesSearch = 
      item.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.meal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.packingStaff?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedStatusTab === "All") return true;
    if (selectedStatusTab === "Ready") return item.packagingStatus === 'Ready for Packing' || !item.packagingStatus;
    if (selectedStatusTab === "Progress") return item.packagingStatus === 'Packing in Progress';
    if (selectedStatusTab === "Packed") return item.packagingStatus === 'Packed';
    return true;
  });

  const pending = packing.filter(p => p.packagingStatus === 'Ready for Packing' || !p.packagingStatus).length;
  const inProgress = packing.filter(p => p.packagingStatus === 'Packing in Progress').length;
  const packed = packing.filter(p => p.packagingStatus === 'Packed').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="h-8 w-8 text-emerald-500 animate-pulse" />
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

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 border-zinc-900 shadow-md p-5 hover:border-emerald-500/10 transition-all duration-300">
          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider font-mono">Total to Pack</p>
          <p className="text-3xl font-bold text-white mt-2">{packing.length}</p>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono">Dispatched from the kitchen</p>
        </Card>
        
        <Card className="bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 border-zinc-900 shadow-md p-5 hover:border-amber-500/10 transition-all duration-300">
          <p className="text-xs text-amber-500 font-semibold uppercase tracking-wider font-mono">Awaiting Pack</p>
          <p className="text-3xl font-bold text-amber-400 mt-2">{pending}</p>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono">Ready to seal & seal verify</p>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 border-zinc-900 shadow-md p-5 hover:border-blue-500/10 transition-all duration-300">
          <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider font-mono">In Assembly</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">{inProgress}</p>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono">Staff actively boxing</p>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 border-zinc-900 shadow-md p-5 hover:border-emerald-500/20 transition-all duration-300">
          <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider font-mono">Ready for Dispatch</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2">{packed}</p>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono">Boxed, labeled & validated</p>
        </Card>
      </div>

      {/* FILTER & QUEUE BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950/20 border border-zinc-900 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto ">
          {[
            { id: "All", label: "All Packages", count: packing.length },
            { id: "Ready", label: "Awaiting Seal", count: pending },
            { id: "Progress", label: "Sealing In-Progress", count: inProgress },
            { id: "Packed", label: "Quality Sealed ✅", count: packed }
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
            placeholder="Search Order ID, staff, meal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-zinc-900/40 border-zinc-800/80 pl-10 text-white w-full rounded-xl"
          />
        </div>
      </div>

      {/* PACKING QUEUE SHEET */}
      <Card className="bg-zinc-950/50 border-zinc-800 shadow-xl overflow-hidden rounded-2xl">
        <CardHeader className="border-b border-zinc-800/60 bg-zinc-900/10 pb-4">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Box className="h-5 w-5 text-emerald-500" />
            Live Packaging Board
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
              <p className="text-sm text-zinc-500 font-mono">Synchronizing packing stations...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-zinc-500">
              <Package className="h-12 w-12 mb-4 opacity-20 text-emerald-500" />
              <p className="font-semibold text-zinc-300">No active meals pending packaging.</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs text-center">Use the "Seed Live Data" button above to populate test packages instantly.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-zinc-900/50">
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-400 font-mono text-xs pl-6">ORDER ID</TableHead>
                    <TableHead className="text-zinc-400 text-xs">CUSTOMER</TableHead>
                    <TableHead className="text-zinc-400 text-xs">MEAL & CONTAINER</TableHead>
                    <TableHead className="text-zinc-400 text-center text-xs w-20">QTY</TableHead>
                    <TableHead className="text-zinc-400 text-xs">INGREDIENTS/ACC. VERIFY</TableHead>
                    <TableHead className="text-zinc-400 text-xs">ASSIGNED STAFF</TableHead>
                    <TableHead className="text-zinc-400 text-xs">SEAL STATE</TableHead>
                    <TableHead className="text-right text-zinc-400 text-xs pr-6">SEAL CONTROLS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => {
                    const checklistOptions = ['Bowl/Tray', 'Lid Sealed', 'Cutlery Pack', 'Sauce/Side'];
                    const currentChecks = checklistMap[item.id] || [];
                    const isAllChecked = checklistOptions.every(opt => currentChecks.includes(opt));

                    return (
                      <TableRow key={item.id} className="border-zinc-800 hover:bg-zinc-900/40 transition-colors">
                        <TableCell className="font-mono text-xs font-bold text-zinc-400 pl-6">
                          {item.orderId || 'N/A'}
                        </TableCell>
                        <TableCell className="text-white font-medium">
                          {item.customerName || 'Walk-In'}
                        </TableCell>
                        <TableCell className="space-y-0.5">
                          <p className="text-white font-semibold">{item.meal}</p>
                          <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                            <Box className="h-3 w-3" /> Container: <span className="text-emerald-400 font-bold">{item.packagingType || 'Eco Kraft Bowl'}</span>
                          </p>
                        </TableCell>
                        <TableCell className="text-center font-mono font-bold text-emerald-400 text-sm">
                          {item.quantity || 1}
                        </TableCell>
                        <TableCell className="max-w-[280px]">
                          <div className="flex flex-wrap gap-1.5 py-1">
                            {checklistOptions.map(opt => {
                              const isChecked = currentChecks.includes(opt);
                              return (
                                <button
                                  key={opt}
                                  onClick={() => toggleChecklistItem(item.id, opt)}
                                  className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold border transition-all cursor-pointer ${
                                    isChecked 
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm'
                                      : 'bg-zinc-900/40 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                                  }`}
                                >
                                  {isChecked ? '✓ ' : '+ '} {opt}
                                </button>
                              );
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <button 
                            onClick={() => {
                              setSelectedStaffForAssign(item);
                              setIsStaffModalOpen(true);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 hover:border-zinc-700 text-xs font-medium cursor-pointer transition-all text-zinc-200"
                          >
                            <Users className="h-3 w-3 text-emerald-500" />
                            {item.packingStaff || 'Assign Staff'}
                          </button>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            item.packagingStatus === 'Packed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold' :
                            item.packagingStatus === 'Packing in Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 font-bold animate-pulse' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }>
                            {item.packagingStatus || 'Ready for Packing'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex justify-end gap-1.5">
                            {item.packagingStatus !== 'Packing in Progress' && item.packagingStatus !== 'Packed' && (
                              <Button 
                                size="sm" 
                                className="bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs h-8 rounded-lg cursor-pointer flex items-center gap-1 px-2.5 transition-all"
                                onClick={() => handleUpdateStatus(item.id, 'Packing in Progress')} 
                                title="Seal Box"
                              >
                                <Box className="h-3.5 w-3.5" /> Pack Box
                              </Button>
                            )}
                            {item.packagingStatus === 'Packing in Progress' && (
                              <Button 
                                size="sm" 
                                disabled={!isAllChecked}
                                className={`font-bold text-xs h-8 rounded-lg cursor-pointer flex items-center gap-1 px-2.5 transition-all ${
                                  isAllChecked 
                                    ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950' 
                                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                                }`}
                                onClick={() => handleUpdateStatus(item.id, 'Packed')} 
                                title={isAllChecked ? "Check Complete & Seal" : "Must complete verify checks"}
                              >
                                <CheckCircle className="h-3.5 w-3.5" /> Seal & Clear
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 hover:bg-zinc-800 text-zinc-500 rounded-lg cursor-pointer"
                              title="Print Shipping Label & Barcode"
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

      {/* FOOTER STAFF STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2 bg-gradient-to-br from-zinc-950/40 to-zinc-900/10 border-zinc-900 p-5 rounded-2xl shadow-md">
          <div className="flex justify-between items-center mb-4 border-b border-zinc-800/80 pb-3">
            <h3 className="font-bold text-white flex items-center gap-1.5 text-base">
              <Users className="h-4 w-4 text-emerald-400" />
              Packaging Assembly Crew
            </h3>
            <Badge variant="outline" className="bg-emerald-500/5 text-emerald-400 border-emerald-500/20 text-[10px]">
              Assigned Stations
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {STAFF_ROSTER.map((staff) => (
              <div key={staff.name} className="flex justify-between items-center bg-zinc-950/50 border border-zinc-900 p-3.5 rounded-xl">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">{staff.name}</p>
                  <p className="text-[10px] text-zinc-400">{staff.role}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={
                    staff.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]' : 'bg-zinc-800 text-zinc-500 border-zinc-700 text-[10px]'
                  }>
                    {staff.status}
                  </Badge>
                  <p className="text-[10px] text-zinc-500 mt-1 font-mono">Speed: {staff.speed}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-950/40 to-zinc-900/10 border-zinc-900 p-5 rounded-2xl shadow-md flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white flex items-center gap-1.5 text-base mb-2">
              <ClipboardCheck className="h-4 w-4 text-emerald-500" />
              Verification Protocol
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Verify and assemble all meal items by ticking the required checklist items. Only when <span className="text-emerald-400 font-bold">all components</span> are validated will the final quality sealing and barcode printing options unlock to ensure zero-defect delivery.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-900">
            <Button 
              onClick={() => navigate("/kitchen")}
              className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-emerald-400 hover:text-emerald-300 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer"
            >
              Go To Production Queue <ChefHat className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* STAFF ASSIGN MODAL */}
      {isStaffModalOpen && selectedStaffForAssign && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-zinc-950 border border-zinc-800 w-full max-w-md shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-zinc-900 bg-zinc-900/20 p-5">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-500" />
                  Assign Assembly Staff
                </CardTitle>
                <button 
                  onClick={() => { setIsStaffModalOpen(false); setSelectedStaffForAssign(null); }}
                  className="text-zinc-500 hover:text-white transition-colors cursor-pointer text-sm font-semibold"
                >
                  ✕
                </button>
              </div>
              <p className="text-zinc-400 text-xs mt-1">Select pack staff for: <span className="text-white font-bold">{selectedStaffForAssign.meal}</span></p>
            </CardHeader>
            <CardContent className="p-5 space-y-3 max-h-[350px] overflow-y-auto">
              {STAFF_ROSTER.map((staff) => (
                <button
                  key={staff.name}
                  disabled={staff.status !== 'Active'}
                  onClick={() => handleAssignStaff(selectedStaffForAssign.id, staff.name)}
                  className={`w-full flex justify-between items-center p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    staff.status === 'Active' 
                      ? 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/80 hover:border-emerald-500/30'
                      : 'border-zinc-900 bg-zinc-950/20 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      {staff.name}
                      {staff.status === 'Active' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                    </p>
                    <p className="text-[10px] text-zinc-400">{staff.role}</p>
                  </div>
                  <div className="text-right text-[10px] font-mono text-zinc-500">
                    Speed: {staff.speed}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}
