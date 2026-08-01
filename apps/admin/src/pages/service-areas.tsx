import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Map,
  Plus,
  Edit,
  MapPin,
  Search,
  Filter,
  Check,
  X,
  Loader2,
  Trash2,
  FileText,
  RefreshCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Compass,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { serviceAreasService } from "../services/serviceAreas";
import { deliveryService } from "../services/delivery";
import { ServiceArea, DeliveryRoute } from "../types";
import { useAuth } from "../contexts/auth-context";

export default function ServiceAreasPage() {
  const { user } = useAuth();

  // Firestore collections state
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  
  // Page UX state
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Search & filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");

  // Dialog state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingArea, setEditingArea] = useState<ServiceArea | null>(null);
  const [viewingArea, setViewingArea] = useState<ServiceArea | null>(null);
  const [deleteConfirmArea, setDeleteConfirmArea] = useState<ServiceArea | null>(null);

  // Form states
  const [formState, setFormState] = useState({
    areaName: "",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    pincodesInput: "", // Comma-separated for form
    deliveryCharge: 40,
    freeDeliveryAbove: 500,
    minimumOrder: 150,
    estimatedDeliveryTime: "25-35 mins",
    deliveryRoute: "",
    status: "Active" as 'Active' | 'Inactive'
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // 1. Subscribe to real-time updates and trigger auto-seed if collection is empty
  useEffect(() => {
    let unsubscribeAreas: () => void;
    let unsubscribeRoutes: () => void;

    const initData = async () => {
      try {
        setLoading(true);
        // Seed first if empty
        await serviceAreasService.seedServiceAreas();
        
        // Listen to Service Areas
        unsubscribeAreas = serviceAreasService.subscribeToAreas((fetchedAreas) => {
          setAreas(fetchedAreas);
          setLoading(false);
        });

        // Listen to Delivery Routes (to connect area with delivery sector)
        unsubscribeRoutes = deliveryService.subscribeToRoutes((fetchedRoutes) => {
          setRoutes(fetchedRoutes);
        });
      } catch (err: any) {
        console.error("Error initiating Service Areas:", err);
        setError("Could not load service areas. Please check permissions.");
        setLoading(false);
      }
    };

    initData();

    return () => {
      if (unsubscribeAreas) unsubscribeAreas();
      if (unsubscribeRoutes) unsubscribeRoutes();
    };
  }, []);

  // Show a notification banner that auto-dismisses
  const showSuccess = (message: string) => {
    setSuccessMsg(message);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // 2. Compute Dashboard KPI statistics
  const stats = useMemo(() => {
    const totalAreas = areas.length;
    const activeAreas = areas.filter(a => a.status === 'Active').length;
    const inactiveAreas = totalAreas - activeAreas;

    // Get unique PIN Codes
    const allPincodes = new Set<string>();
    areas.forEach(a => a.pincodes.forEach(p => allPincodes.add(p.trim())));
    const totalPincodes = allPincodes.size;

    // Count delivery partners/routes assigned
    const assignedRoutesCount = areas.filter(a => a.deliveryRoute && a.deliveryRoute !== '').length;

    // Average Delivery Time
    let totalMinutes = 0;
    let validCount = 0;
    areas.forEach(a => {
      // Simple parse of "X-Y mins" or "X mins" to calculate approximate average
      const match = a.estimatedDeliveryTime.match(/(\d+)/g);
      if (match && match.length > 0) {
        const numbers = match.map(Number);
        const avg = numbers.reduce((sum, val) => sum + val, 0) / numbers.length;
        totalMinutes += avg;
        validCount++;
      }
    });
    const avgDeliveryTime = validCount > 0 
      ? `${Math.round(totalMinutes / validCount)} mins` 
      : "30 mins";

    return {
      totalAreas,
      activeAreas,
      inactiveAreas,
      totalPincodes,
      assignedRoutesCount,
      avgDeliveryTime
    };
  }, [areas]);

  // Unique list of cities in database for filter selection
  const uniqueCities = useMemo(() => {
    const cities = new Set<string>();
    areas.forEach(a => {
      if (a.city) cities.add(a.city);
    });
    return Array.from(cities);
  }, [areas]);

  // 3. Filtered Service Areas for data table
  const filteredAreas = useMemo(() => {
    return areas.filter(area => {
      const matchesSearch = 
        area.areaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        area.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        area.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        area.pincodes.some(p => p.includes(searchQuery));

      const matchesStatus = 
        statusFilter === 'All' || 
        area.status === statusFilter;

      const matchesCity = 
        cityFilter === 'All' || 
        area.city === cityFilter;

      return matchesSearch && matchesStatus && matchesCity;
    });
  }, [areas, searchQuery, statusFilter, cityFilter]);

  // 4. Form Actions & CRUD
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formState.areaName.trim()) errors.areaName = "Area name is required";
    if (!formState.city.trim()) errors.city = "City is required";
    if (!formState.state.trim()) errors.state = "State is required";
    if (!formState.pincodesInput.trim()) {
      errors.pincodes = "At least one PIN code is required";
    } else {
      // check format: comma separated numeric pin codes
      const parsed = formState.pincodesInput.split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);
      if (parsed.length === 0) {
        errors.pincodes = "Invalid PIN codes list";
      } else if (parsed.some(p => !/^[a-zA-Z0-9]{3,10}$/.test(p))) {
        errors.pincodes = "PIN codes must be alphanumeric and 3-10 characters";
      }
    }
    if (formState.deliveryCharge < 0) errors.deliveryCharge = "Must be 0 or more";
    if (formState.minimumOrder < 0) errors.minimumOrder = "Must be 0 or more";
    if (formState.freeDeliveryAbove < 0) errors.freeDeliveryAbove = "Must be 0 or more";
    if (!formState.estimatedDeliveryTime.trim()) errors.estimatedDeliveryTime = "Delivery time estimate is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setFormState({
      areaName: "",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      pincodesInput: "",
      deliveryCharge: 40,
      freeDeliveryAbove: 500,
      minimumOrder: 150,
      estimatedDeliveryTime: "25-35 mins",
      deliveryRoute: "",
      status: "Active"
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (area: ServiceArea) => {
    setEditingArea(area);
    setFormState({
      areaName: area.areaName,
      city: area.city || "Mumbai",
      state: area.state || "Maharashtra",
      country: area.country || "India",
      pincodesInput: area.pincodes.join(', '),
      deliveryCharge: area.deliveryCharge,
      freeDeliveryAbove: area.freeDeliveryAbove || 500,
      minimumOrder: area.minimumOrder || 150,
      estimatedDeliveryTime: area.estimatedDeliveryTime,
      deliveryRoute: area.deliveryRoute || "",
      status: area.status
    });
    setFormErrors({});
  };

  // Save Add Area
  const handleSaveAddArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !user) return;

    try {
      setSeeding(true);
      const parsedPincodes = formState.pincodesInput
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const newArea = {
        areaId: "",
        areaName: formState.areaName.trim(),
        city: formState.city.trim(),
        state: formState.state.trim(),
        country: formState.country.trim(),
        pincodes: parsedPincodes,
        deliveryCharge: Number(formState.deliveryCharge),
        freeDeliveryAbove: Number(formState.freeDeliveryAbove),
        minimumOrder: Number(formState.minimumOrder),
        estimatedDeliveryTime: formState.estimatedDeliveryTime.trim(),
        deliveryRoute: formState.deliveryRoute,
        status: formState.status
      };

      await serviceAreasService.addArea(newArea, user.id, user.email);
      setShowAddModal(false);
      showSuccess(`Successfully created Service Area "${newArea.areaName}"`);
    } catch (err: any) {
      console.error(err);
      setError("Failed to create service area. Please try again.");
    } finally {
      setSeeding(false);
    }
  };

  // Save Edit Area
  const handleSaveEditArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArea || !validateForm() || !user) return;

    try {
      setSeeding(true);
      const parsedPincodes = formState.pincodesInput
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const updateData: Partial<ServiceArea> = {
        areaName: formState.areaName.trim(),
        city: formState.city.trim(),
        state: formState.state.trim(),
        country: formState.country.trim(),
        pincodes: parsedPincodes,
        deliveryCharge: Number(formState.deliveryCharge),
        freeDeliveryAbove: Number(formState.freeDeliveryAbove),
        minimumOrder: Number(formState.minimumOrder),
        estimatedDeliveryTime: formState.estimatedDeliveryTime.trim(),
        deliveryRoute: formState.deliveryRoute,
        status: formState.status
      };

      await serviceAreasService.updateArea(editingArea.id, updateData, user.id, user.email);
      setEditingArea(null);
      showSuccess(`Successfully updated Service Area "${updateData.areaName}"`);
    } catch (err: any) {
      console.error(err);
      setError("Failed to update service area. Please try again.");
    } finally {
      setSeeding(false);
    }
  };

  // Toggle active/inactive status quickly from row click
  const handleToggleStatus = async (area: ServiceArea) => {
    if (!user) return;
    const newStatus = area.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await serviceAreasService.updateArea(area.id, { status: newStatus }, user.id, user.email);
      showSuccess(`Set area "${area.areaName}" status to ${newStatus}`);
    } catch (err) {
      console.error(err);
      setError("Failed to change status.");
    }
  };

  // Delete Action
  const handleDeleteArea = async () => {
    if (!deleteConfirmArea || !user) return;
    try {
      setSeeding(true);
      await serviceAreasService.deleteArea(deleteConfirmArea.id, user.id, user.email);
      showSuccess(`Successfully deleted Service Area "${deleteConfirmArea.areaName}"`);
      setDeleteConfirmArea(null);
    } catch (err) {
      console.error(err);
      setError("Failed to delete service area.");
    } finally {
      setSeeding(false);
    }
  };

  const forceReseed = async () => {
    try {
      setSeeding(true);
      await serviceAreasService.seedServiceAreas();
      showSuccess("Standard serviceable regions have been restored.");
    } catch (err) {
      console.error(err);
      setError("Failed to re-seed.");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8 p-6 text-zinc-100 max-w-[1600px] mx-auto pb-16">
      
      {/* 1. Header and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400">
              <Map className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Service Area Management</h1>
          </div>
          <p className="text-zinc-500 text-sm mt-1">
            Configure serviceable PIN codes, regional pricing, and link delivery routing sectors dynamically.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={forceReseed}
            disabled={seeding}
            className="border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-900 gap-2 h-9"
          >
            {seeding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
            Reset Default Regions
          </Button>
          <Button
            size="sm"
            onClick={handleOpenAddModal}
            className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 h-9 shadow-lg shadow-emerald-600/10"
          >
            <Plus className="h-4 w-4" />
            Add Service Area
          </Button>
        </div>
      </div>

      {/* Success/Error Alerts */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm shadow-md"
          >
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm shadow-md"
          >
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError("")} className="ml-auto text-rose-400 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Interactive KPI Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-zinc-950/40 border-zinc-900 shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Total Service Areas</CardDescription>
            <CardTitle className="text-white text-3xl font-extrabold mt-1">
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-emerald-500" /> : stats.totalAreas}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
              <Sparkles className="h-3 w-3 text-emerald-500" /> Active hubs in system
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/40 border-zinc-900 shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Active Sectors</CardDescription>
            <CardTitle className="text-emerald-400 text-3xl font-extrabold mt-1">
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-emerald-500" /> : stats.activeAreas}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
              <Check className="h-3 w-3 text-emerald-500" /> Receiving checkout orders
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/40 border-zinc-900 shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Inactive Sectors</CardDescription>
            <CardTitle className="text-zinc-400 text-3xl font-extrabold mt-1">
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-emerald-500" /> : stats.inactiveAreas}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
              <X className="h-3 w-3 text-zinc-500" /> Locked from checkouts
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/40 border-zinc-900 shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Serviceable Pincodes</CardDescription>
            <CardTitle className="text-emerald-400 text-3xl font-extrabold mt-1">
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-emerald-500" /> : stats.totalPincodes}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
              <MapPin className="h-3 w-3 text-emerald-500" /> Unique valid codes
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/40 border-zinc-900 shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Logistics Connected</CardDescription>
            <CardTitle className="text-white text-3xl font-extrabold mt-1">
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-emerald-500" /> : stats.assignedRoutesCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
              <Compass className="h-3 w-3 text-emerald-500" /> Tied to driver routes
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/40 border-zinc-900 shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Avg Delivery Speed</CardDescription>
            <CardTitle className="text-emerald-400 text-3xl font-extrabold mt-1">
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-emerald-500" /> : stats.avgDeliveryTime}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
              <Clock className="h-3 w-3 text-emerald-500" /> Regional average
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Search and Filtering bar */}
      <Card className="bg-zinc-950/50 border-zinc-800 shadow-lg rounded-xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-zinc-900/60 bg-zinc-900/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Filter className="h-4 w-4 text-emerald-400" />
            <span>Search & Area Filters</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search area, city, pincode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-zinc-900/50 border-zinc-800 text-white placeholder-zinc-500 rounded-lg text-xs"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Label className="text-zinc-400 text-xs">Status:</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[110px] h-9 bg-zinc-900/50 border-zinc-800 text-zinc-200 text-xs rounded-lg">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200 text-xs">
                  <SelectItem value="All">All Areas</SelectItem>
                  <SelectItem value="Active">Active Only</SelectItem>
                  <SelectItem value="Inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* City Filter */}
            <div className="flex items-center gap-2">
              <Label className="text-zinc-400 text-xs">City:</Label>
              <Select value={cityFilter} onValueChange={cityFilter => setCityFilter(cityFilter)}>
                <SelectTrigger className="w-[130px] h-9 bg-zinc-900/50 border-zinc-800 text-zinc-200 text-xs rounded-lg">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200 text-xs">
                  <SelectItem value="All">All Cities</SelectItem>
                  {uniqueCities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Clear Filter button */}
            {(searchQuery || statusFilter !== "All" || cityFilter !== "All") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("All");
                  setCityFilter("All");
                }}
                className="text-zinc-500 hover:text-white text-xs h-9"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* 4. Service Areas Table */}
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-zinc-500 space-y-4">
              <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
              <p className="text-zinc-400 text-sm font-medium">Synchronizing service areas in real-time...</p>
            </div>
          ) : filteredAreas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500 space-y-4 text-center px-4">
              <Compass className="h-12 w-12 text-zinc-800" />
              <div>
                <p className="font-semibold text-zinc-300 text-lg">No serviceable regions found</p>
                <p className="text-xs text-zinc-600 mt-1 max-w-sm">
                  No matching service areas fit the filters. Click "Add Service Area" or check your search criteria.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-zinc-900/20 border-b border-zinc-900">
                  <TableRow>
                    <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider pl-6">Area Name</TableHead>
                    <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider">City/State</TableHead>
                    <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider">Pincodes</TableHead>
                    <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider">Delivery Charge</TableHead>
                    <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider">Min. Order Limit</TableHead>
                    <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider">Free Delivery Above</TableHead>
                    <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider">Est. Delivery Time</TableHead>
                    <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider">Assigned Sector Route</TableHead>
                    <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-zinc-900">
                  {filteredAreas.map((area) => (
                    <TableRow key={area.id} className="hover:bg-zinc-900/20 transition-colors border-b border-zinc-900/60">
                      
                      {/* Area Name */}
                      <TableCell className="font-semibold text-white text-xs pl-6">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-emerald-500/80" />
                          <span>{area.areaName}</span>
                        </div>
                      </TableCell>
                      
                      {/* City/State */}
                      <TableCell className="text-zinc-300 text-xs">
                        {area.city}, <span className="text-zinc-500 font-medium">{area.state}</span>
                      </TableCell>
                      
                      {/* Pincodes Badges */}
                      <TableCell className="max-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {area.pincodes.map(pin => (
                            <Badge 
                              key={pin}
                              variant="outline" 
                              className="font-mono text-[10px] bg-zinc-900 text-zinc-300 border-zinc-800 px-1.5 py-0.5"
                            >
                              {pin}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      
                      {/* Delivery Charge */}
                      <TableCell className="text-zinc-300 text-xs font-semibold">
                        ₹{area.deliveryCharge}
                      </TableCell>

                      {/* Minimum Order Limit */}
                      <TableCell className="text-zinc-300 text-xs font-semibold">
                        ₹{area.minimumOrder || 0}
                      </TableCell>

                      {/* Free Delivery threshold */}
                      <TableCell className="text-zinc-300 text-xs">
                        {area.freeDeliveryAbove ? `₹${area.freeDeliveryAbove}` : <span className="text-zinc-600 italic">No offer</span>}
                      </TableCell>
                      
                      {/* Est delivery time */}
                      <TableCell className="text-zinc-300 text-xs font-medium">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-zinc-500" />
                          <span>{area.estimatedDeliveryTime}</span>
                        </div>
                      </TableCell>

                      {/* Linked Route */}
                      <TableCell className="text-zinc-300 text-xs">
                        {area.deliveryRoute ? (
                          <div className="flex items-center gap-1 text-emerald-400">
                            <Compass className="h-3.5 w-3.5" />
                            <span>{area.deliveryRoute}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-600 italic">No Route Tied</span>
                        )}
                      </TableCell>
                      
                      {/* Status badge */}
                      <TableCell>
                        <button
                          onClick={() => handleToggleStatus(area)}
                          title="Click to toggle status"
                          className="focus:outline-none transition-transform hover:scale-105 active:scale-95"
                        >
                          <Badge 
                            variant="outline" 
                            className={
                              area.status === 'Active' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]' 
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px]'
                            }
                          >
                            {area.status}
                          </Badge>
                        </button>
                      </TableCell>
                      
                      {/* Actions */}
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            title="View Details"
                            onClick={() => setViewingArea(area)}
                            className="h-8 w-8 text-zinc-400 hover:text-white"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Edit Details"
                            onClick={() => handleOpenEditModal(area)}
                            className="h-8 w-8 text-zinc-400 hover:text-white"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Delete Service Area"
                            onClick={() => setDeleteConfirmArea(area)}
                            className="h-8 w-8 text-zinc-400 hover:text-rose-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. ADD SERVICE AREA MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl shadow-black/80 max-h-[90vh] flex flex-col"
            >
              <div className="px-6 py-4 border-b border-zinc-900 bg-zinc-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-bold text-white text-base">Add New Service Area</h3>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)} 
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAddArea} className="flex-1 overflow-y-auto p-6 space-y-4">
                
                {/* Area Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="areaName" className="text-zinc-400 text-xs">Area Name (e.g. Powai Premium Area)</Label>
                  <Input
                    id="areaName"
                    value={formState.areaName}
                    onChange={e => setFormState({ ...formState, areaName: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-600 rounded-lg h-9 text-xs focus-visible:ring-emerald-500"
                    placeholder="Enter unique serviceable area descriptor"
                  />
                  {formErrors.areaName && <p className="text-rose-500 text-[10px]">{formErrors.areaName}</p>}
                </div>

                {/* City, State & Country */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-zinc-400 text-xs">City</Label>
                    <Input
                      id="city"
                      value={formState.city}
                      onChange={e => setFormState({ ...formState, city: e.target.value })}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-lg h-9 text-xs focus-visible:ring-emerald-500"
                    />
                    {formErrors.city && <p className="text-rose-500 text-[10px]">{formErrors.city}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="state" className="text-zinc-400 text-xs">State</Label>
                    <Input
                      id="state"
                      value={formState.state}
                      onChange={e => setFormState({ ...formState, state: e.target.value })}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-lg h-9 text-xs focus-visible:ring-emerald-500"
                    />
                    {formErrors.state && <p className="text-rose-500 text-[10px]">{formErrors.state}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="country" className="text-zinc-400 text-xs">Country</Label>
                    <Input
                      id="country"
                      value={formState.country}
                      onChange={e => setFormState({ ...formState, country: e.target.value })}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-lg h-9 text-xs focus-visible:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Multiple PIN Codes */}
                <div className="space-y-1.5">
                  <Label htmlFor="pincodes" className="text-zinc-400 text-xs">Covered PIN Codes (Comma separated, e.g. 400076, 400072)</Label>
                  <Input
                    id="pincodes"
                    value={formState.pincodesInput}
                    onChange={e => setFormState({ ...formState, pincodesInput: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-600 rounded-lg h-9 text-xs font-mono focus-visible:ring-emerald-500"
                    placeholder="400076, 400072, 400087"
                  />
                  <p className="text-[10px] text-zinc-600 leading-normal">
                    Enter one or more alphanumeric PIN codes separated by commas. These are scanned on user checkout.
                  </p>
                  {formErrors.pincodes && <p className="text-rose-500 text-[10px]">{formErrors.pincodes}</p>}
                </div>

                {/* Delivery pricing controls */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="deliveryCharge" className="text-zinc-400 text-xs">Delivery Fee (₹)</Label>
                    <Input
                      id="deliveryCharge"
                      type="number"
                      value={formState.deliveryCharge}
                      onChange={e => setFormState({ ...formState, deliveryCharge: Number(e.target.value) })}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-lg h-9 text-xs focus-visible:ring-emerald-500"
                    />
                    {formErrors.deliveryCharge && <p className="text-rose-500 text-[10px]">{formErrors.deliveryCharge}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="minimumOrder" className="text-zinc-400 text-xs">Min. Order (₹)</Label>
                    <Input
                      id="minimumOrder"
                      type="number"
                      value={formState.minimumOrder}
                      onChange={e => setFormState({ ...formState, minimumOrder: Number(e.target.value) })}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-lg h-9 text-xs focus-visible:ring-emerald-500"
                    />
                    {formErrors.minimumOrder && <p className="text-rose-500 text-[10px]">{formErrors.minimumOrder}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="freeDeliveryAbove" className="text-zinc-400 text-xs">Free Delivery (₹)</Label>
                    <Input
                      id="freeDeliveryAbove"
                      type="number"
                      value={formState.freeDeliveryAbove}
                      onChange={e => setFormState({ ...formState, freeDeliveryAbove: Number(e.target.value) })}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-lg h-9 text-xs focus-visible:ring-emerald-500"
                      placeholder="e.g. 500"
                    />
                    {formErrors.freeDeliveryAbove && <p className="text-rose-500 text-[10px]">{formErrors.freeDeliveryAbove}</p>}
                  </div>
                </div>

                {/* Estimated Delivery Time & Link Sector Route */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="estTime" className="text-zinc-400 text-xs">Est. Delivery Time</Label>
                    <Input
                      id="estTime"
                      value={formState.estimatedDeliveryTime}
                      onChange={e => setFormState({ ...formState, estimatedDeliveryTime: e.target.value })}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-lg h-9 text-xs focus-visible:ring-emerald-500"
                      placeholder="e.g. 25-35 mins"
                    />
                    {formErrors.estimatedDeliveryTime && <p className="text-rose-500 text-[10px]">{formErrors.estimatedDeliveryTime}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-zinc-400 text-xs">Link Delivery Route</Label>
                    <Select 
                      value={formState.deliveryRoute} 
                      onValueChange={val => setFormState({ ...formState, deliveryRoute: val })}
                    >
                      <SelectTrigger className="w-full h-9 bg-zinc-900 border-zinc-800 text-zinc-200 text-xs rounded-lg">
                        <SelectValue placeholder="No Sector Tied" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200 text-xs">
                        <SelectItem value="none">No Sector Tied</SelectItem>
                        {routes.map(r => (
                          <SelectItem key={r.id} value={r.routeName}>{r.routeName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Status selection */}
                <div className="space-y-1.5 pt-2">
                  <Label className="text-zinc-400 text-xs">Area Availability Status</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-zinc-300">
                      <input
                        type="radio"
                        name="status"
                        checked={formState.status === 'Active'}
                        onChange={() => setFormState({ ...formState, status: 'Active' })}
                        className="accent-emerald-500 h-4 w-4"
                      />
                      Active (Accepts Checkout Orders)
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-zinc-300">
                      <input
                        type="radio"
                        name="status"
                        checked={formState.status === 'Inactive'}
                        onChange={() => setFormState({ ...formState, status: 'Inactive' })}
                        className="accent-rose-500 h-4 w-4"
                      />
                      Inactive (Banned on Checkout)
                    </label>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-2 border-t border-zinc-900 pt-4 mt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddModal(false)}
                    className="text-zinc-400 hover:text-white hover:bg-zinc-900 h-9 rounded-lg text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={seeding}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white h-9 rounded-lg text-xs px-4 shadow-md shadow-emerald-600/10"
                  >
                    {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Service Area"}
                  </Button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. EDIT SERVICE AREA MODAL */}
      <AnimatePresence>
        {editingArea && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl shadow-black/80 max-h-[90vh] flex flex-col"
            >
              <div className="px-6 py-4 border-b border-zinc-900 bg-zinc-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-bold text-white text-base">Edit Service Area</h3>
                </div>
                <button 
                  onClick={() => setEditingArea(null)} 
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditArea} className="flex-1 overflow-y-auto p-6 space-y-4">
                
                {/* Area Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="areaName" className="text-zinc-400 text-xs">Area Name (e.g. Powai Premium Area)</Label>
                  <Input
                    id="areaName"
                    value={formState.areaName}
                    onChange={e => setFormState({ ...formState, areaName: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-600 rounded-lg h-9 text-xs focus-visible:ring-emerald-500"
                    placeholder="Enter unique serviceable area descriptor"
                  />
                  {formErrors.areaName && <p className="text-rose-500 text-[10px]">{formErrors.areaName}</p>}
                </div>

                {/* City, State & Country */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-zinc-400 text-xs">City</Label>
                    <Input
                      id="city"
                      value={formState.city}
                      onChange={e => setFormState({ ...formState, city: e.target.value })}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-lg h-9 text-xs focus-visible:ring-emerald-500"
                    />
                    {formErrors.city && <p className="text-rose-500 text-[10px]">{formErrors.city}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="state" className="text-zinc-400 text-xs">State</Label>
                    <Input
                      id="state"
                      value={formState.state}
                      onChange={e => setFormState({ ...formState, state: e.target.value })}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-lg h-9 text-xs focus-visible:ring-emerald-500"
                    />
                    {formErrors.state && <p className="text-rose-500 text-[10px]">{formErrors.state}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="country" className="text-zinc-400 text-xs">Country</Label>
                    <Input
                      id="country"
                      value={formState.country}
                      onChange={e => setFormState({ ...formState, country: e.target.value })}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-lg h-9 text-xs focus-visible:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Multiple PIN Codes */}
                <div className="space-y-1.5">
                  <Label htmlFor="pincodes" className="text-zinc-400 text-xs">Covered PIN Codes (Comma separated, e.g. 400076, 400072)</Label>
                  <Input
                    id="pincodes"
                    value={formState.pincodesInput}
                    onChange={e => setFormState({ ...formState, pincodesInput: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-600 rounded-lg h-9 text-xs font-mono focus-visible:ring-emerald-500"
                    placeholder="400076, 400072, 400087"
                  />
                  {formErrors.pincodes && <p className="text-rose-500 text-[10px]">{formErrors.pincodes}</p>}
                </div>

                {/* Delivery pricing controls */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="deliveryCharge" className="text-zinc-400 text-xs">Delivery Fee (₹)</Label>
                    <Input
                      id="deliveryCharge"
                      type="number"
                      value={formState.deliveryCharge}
                      onChange={e => setFormState({ ...formState, deliveryCharge: Number(e.target.value) })}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-lg h-9 text-xs focus-visible:ring-emerald-500"
                    />
                    {formErrors.deliveryCharge && <p className="text-rose-500 text-[10px]">{formErrors.deliveryCharge}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="minimumOrder" className="text-zinc-400 text-xs">Min. Order (₹)</Label>
                    <Input
                      id="minimumOrder"
                      type="number"
                      value={formState.minimumOrder}
                      onChange={e => setFormState({ ...formState, minimumOrder: Number(e.target.value) })}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-lg h-9 text-xs focus-visible:ring-emerald-500"
                    />
                    {formErrors.minimumOrder && <p className="text-rose-500 text-[10px]">{formErrors.minimumOrder}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="freeDeliveryAbove" className="text-zinc-400 text-xs">Free Delivery (₹)</Label>
                    <Input
                      id="freeDeliveryAbove"
                      type="number"
                      value={formState.freeDeliveryAbove}
                      onChange={e => setFormState({ ...formState, freeDeliveryAbove: Number(e.target.value) })}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-lg h-9 text-xs focus-visible:ring-emerald-500"
                    />
                    {formErrors.freeDeliveryAbove && <p className="text-rose-500 text-[10px]">{formErrors.freeDeliveryAbove}</p>}
                  </div>
                </div>

                {/* Estimated Delivery Time & Link Sector Route */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="estTime" className="text-zinc-400 text-xs">Est. Delivery Time</Label>
                    <Input
                      id="estTime"
                      value={formState.estimatedDeliveryTime}
                      onChange={e => setFormState({ ...formState, estimatedDeliveryTime: e.target.value })}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-lg h-9 text-xs focus-visible:ring-emerald-500"
                      placeholder="e.g. 25-35 mins"
                    />
                    {formErrors.estimatedDeliveryTime && <p className="text-rose-500 text-[10px]">{formErrors.estimatedDeliveryTime}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-zinc-400 text-xs">Link Delivery Route</Label>
                    <Select 
                      value={formState.deliveryRoute} 
                      onValueChange={val => setFormState({ ...formState, deliveryRoute: val === 'none' ? '' : val })}
                    >
                      <SelectTrigger className="w-full h-9 bg-zinc-900 border-zinc-800 text-zinc-200 text-xs rounded-lg">
                        <SelectValue placeholder="No Sector Tied" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200 text-xs">
                        <SelectItem value="none">No Sector Tied</SelectItem>
                        {routes.map(r => (
                          <SelectItem key={r.id} value={r.routeName}>{r.routeName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Status selection */}
                <div className="space-y-1.5 pt-2">
                  <Label className="text-zinc-400 text-xs">Area Availability Status</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-zinc-300">
                      <input
                        type="radio"
                        name="status"
                        checked={formState.status === 'Active'}
                        onChange={() => setFormState({ ...formState, status: 'Active' })}
                        className="accent-emerald-500 h-4 w-4"
                      />
                      Active (Accepts Checkout Orders)
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-zinc-300">
                      <input
                        type="radio"
                        name="status"
                        checked={formState.status === 'Inactive'}
                        onChange={() => setFormState({ ...formState, status: 'Inactive' })}
                        className="accent-rose-500 h-4 w-4"
                      />
                      Inactive (Banned on Checkout)
                    </label>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-2 border-t border-zinc-900 pt-4 mt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setEditingArea(null)}
                    className="text-zinc-400 hover:text-white hover:bg-zinc-900 h-9 rounded-lg text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={seeding}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white h-9 rounded-lg text-xs px-4 shadow-md shadow-emerald-600/10"
                  >
                    {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                  </Button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. VIEW DETAILS MODAL */}
      <AnimatePresence>
        {viewingArea && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl shadow-black/80 flex flex-col"
            >
              <div className="px-6 py-4 border-b border-zinc-900 bg-zinc-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-bold text-white text-base">Service Area Details</h3>
                </div>
                <button 
                  onClick={() => setViewingArea(null)} 
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                
                {/* Header overview */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-white font-bold text-lg">{viewingArea.areaName}</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">{viewingArea.city}, {viewingArea.state}, {viewingArea.country}</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={
                      viewingArea.status === 'Active' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20 text-xs'
                    }
                  >
                    {viewingArea.status}
                  </Badge>
                </div>

                <div className="border-t border-zinc-900 pt-3 space-y-3.5">
                  
                  {/* PIN Codes */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Serviceable Postal Codes</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {viewingArea.pincodes.map(p => (
                        <Badge key={p} className="bg-zinc-900 border-zinc-800 text-zinc-300 font-mono text-xs">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1">
                    {/* Delivery Charge */}
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Delivery Charge</span>
                      <p className="text-white font-bold text-sm">₹{viewingArea.deliveryCharge}</p>
                    </div>

                    {/* Minimum Order */}
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Minimum Order</span>
                      <p className="text-white font-bold text-sm">₹{viewingArea.minimumOrder || 0}</p>
                    </div>
                    
                    {/* Free Delivery Threshold */}
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Free Delivery Threshold</span>
                      <p className="text-white font-bold text-sm">
                        {viewingArea.freeDeliveryAbove ? `Above ₹${viewingArea.freeDeliveryAbove}` : "N/A"}
                      </p>
                    </div>

                    {/* Est. Delivery Time */}
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Est. Delivery Time</span>
                      <p className="text-white font-semibold text-sm flex items-center gap-1">
                        <Clock className="h-4 w-4 text-zinc-400" /> {viewingArea.estimatedDeliveryTime}
                      </p>
                    </div>
                  </div>

                  {/* Tied Route */}
                  <div className="space-y-1 border-t border-zinc-900 pt-3.5">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Tied Logistics sector route</span>
                    {viewingArea.deliveryRoute ? (
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mt-1">
                        <Compass className="h-4 w-4" />
                        <span>{viewingArea.deliveryRoute}</span>
                      </div>
                    ) : (
                      <p className="text-zinc-600 text-xs italic mt-0.5">No courier sector or driver route assigned.</p>
                    )}
                  </div>

                  {/* Timestamps */}
                  <div className="grid grid-cols-2 gap-2 border-t border-zinc-900 pt-3 text-[10px] text-zinc-600 font-mono">
                    <div>
                      <span>Created:</span>
                      <p className="text-zinc-500 mt-0.5">{viewingArea.createdAt ? new Date(viewingArea.createdAt).toLocaleString() : "Unknown"}</p>
                    </div>
                    <div>
                      <span>Last Updated:</span>
                      <p className="text-zinc-500 mt-0.5">{viewingArea.updatedAt ? new Date(viewingArea.updatedAt).toLocaleString() : "Never"}</p>
                    </div>
                  </div>

                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end pt-4 border-t border-zinc-900 mt-4">
                  <Button
                    onClick={() => setViewingArea(null)}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white h-9 rounded-lg text-xs"
                  >
                    Close Details
                  </Button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirmArea && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl shadow-black/80 p-6"
            >
              <div className="flex items-center gap-3 text-rose-500">
                <AlertCircle className="h-6 w-6" />
                <h3 className="font-bold text-white text-base">Delete Service Area?</h3>
              </div>
              
              <p className="text-zinc-400 text-xs mt-3 leading-normal">
                Are you absolutely sure you want to delete the service area <strong className="text-white">"{deleteConfirmArea.areaName}"</strong>?
                This will immediately remove coverage for PIN codes: <strong className="text-white font-mono">{deleteConfirmArea.pincodes.join(', ')}</strong>.
                Customers trying to checkout with these PIN codes will be locked out.
              </p>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setDeleteConfirmArea(null)}
                  disabled={seeding}
                  className="text-zinc-400 hover:text-white hover:bg-zinc-900 h-9 rounded-lg text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteArea}
                  disabled={seeding}
                  className="bg-rose-600 hover:bg-rose-500 text-white h-9 rounded-lg text-xs px-4 shadow-md shadow-rose-600/10"
                >
                  {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Delete"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
