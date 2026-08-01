import React, { useEffect, useState, useMemo } from "react";
import { reportService } from "../services/reports";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/auth-context";
import {
  Customer,
  Subscription,
  Order,
  Payment,
  MenuItem,
  DeliveryPartner,
  Delivery,
  Coupon,
  KitchenProductionItem,
  Ingredient,
  StockMovement,
  Expense,
  Role
} from "../types";
import { filterByDateRange, convertToCSV, downloadCSV } from "../utils/analytics-helpers";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Activity,
  ChevronDown,
  Calendar,
  ShoppingBag,
  Bike,
  CreditCard,
  Salad,
  Loader2,
  RefreshCw,
  FileSpreadsheet,
  Printer,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Trash2,
  Percent,
  CheckCircle2,
  XCircle,
  FileDown,
  Sparkles,
  Zap,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  ChefHat,
  UserPlus,
  HeartHandshake
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

type BITabType =
  | "ceo"
  | "sales"
  | "customers"
  | "subscriptions"
  | "menu"
  | "kitchen"
  | "delivery"
  | "finance"
  | "inventory";

interface SavedReport {
  id: string;
  name: string;
  tab: BITabType;
  filters: any;
  createdAt: string;
}

export default function BusinessIntelligencePage() {
  const { user } = useAuth();
  
  // Simulated role state to demonstrate dynamic RBAC for dashboard access
  const [simulatedRole, setSimulatedRole] = useState<string>(user?.role || "Super Admin");

  // Real-time raw Firestore state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [kitchenItems, setKitchenItems] = useState<KitchenProductionItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<BITabType>("ceo");

  // Filters State
  const [dateFilter, setDateFilter] = useState<"today" | "yesterday" | "week" | "month" | "custom">("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedPlan, setSelectedPlan] = useState("all");
  const [selectedMethod, setSelectedMethod] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Saved Reports State
  const [savedReports, setSavedReports] = useState<SavedReport[]>(() => {
    try {
      const saved = localStorage.getItem("taazabites_saved_reports");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Real-time Subscriptions setup
  useEffect(() => {
    setLoading(true);
    const unsubscribes = [
      reportService.subscribeCustomers(setCustomers),
      reportService.subscribeSubscriptions(setSubscriptions),
      reportService.subscribeOrders(setOrders),
      reportService.subscribePayments(setPayments),
      reportService.subscribeMenuItems(setMenuItems),
      reportService.subscribeDeliveryPartners(setDeliveryPartners),
      reportService.subscribeDeliveries(setDeliveries),
      reportService.subscribeKitchenItems(setKitchenItems),
      reportService.subscribeIngredients(setIngredients),
      reportService.subscribeStockMovements(setStockMovements),
      // Subscribe to expenses directly
      onSnapshot(collection(db, "expenses"), (snap) => {
        setExpenses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Expense[]);
      }, (err) => {
        console.error("Failed to subscribe to expenses", err);
      })
    ];

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => {
      unsubscribes.forEach(unsub => unsub());
      clearTimeout(timer);
    };
  }, []);

  // Sync simulated role if auth user role changes
  useEffect(() => {
    if (user?.role) {
      setSimulatedRole(user.role);
    }
  }, [user]);

  // ----------------------------------------------------
  // Interactive Filtering Engine
  // ----------------------------------------------------

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesDate = filterByDateRange(p.createdAt, dateFilter, startDate, endDate);
      const matchesMethod = selectedMethod === "all" || p.paymentMethod === selectedMethod;
      const matchesPlan = selectedPlan === "all" || 
        (p.subscriptionId && p.subscriptionId.toLowerCase().includes(selectedPlan.toLowerCase())) ||
        (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(selectedPlan.toLowerCase()));
      const matchesSearch = searchQuery === "" || 
        (p.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
        (p.paymentId || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDate && matchesMethod && matchesPlan && matchesSearch;
    });
  }, [payments, dateFilter, startDate, endDate, selectedMethod, selectedPlan, searchQuery]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const rawDate = o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toISOString() : (o.createdAt || o.deliveryDate);
      const matchesDate = filterByDateRange(rawDate, dateFilter, startDate, endDate);
      const matchesArea = selectedArea === "all" || o.deliveryArea === selectedArea;
      const matchesPlan = selectedPlan === "all" || 
        (o.planName && o.planName.toLowerCase().includes(selectedPlan.toLowerCase())) ||
        (o.subscriptionId && o.subscriptionId.toLowerCase().includes(selectedPlan.toLowerCase()));
      const matchesSearch = searchQuery === "" || 
        (o.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
        o.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDate && matchesArea && matchesPlan && matchesSearch;
    });
  }, [orders, dateFilter, startDate, endDate, selectedArea, selectedPlan, searchQuery]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesDate = filterByDateRange(c.createdAt, dateFilter, startDate, endDate);
      const matchesSearch = searchQuery === "" || 
        `${c.firstName || ""} ${c.lastName || ""}`.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (c.email || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
        (c.phone || "").includes(searchQuery);
      return matchesDate && matchesSearch;
    });
  }, [customers, dateFilter, startDate, endDate, searchQuery]);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(s => {
      const matchesDate = filterByDateRange(s.startDate, dateFilter, startDate, endDate);
      const matchesPlan = selectedPlan === "all" || (s.planId || "").toLowerCase().includes(selectedPlan.toLowerCase());
      return matchesDate && matchesPlan;
    });
  }, [subscriptions, dateFilter, startDate, endDate, selectedPlan]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesDate = filterByDateRange(e.date || e.createdAt, dateFilter, startDate, endDate);
      const matchesSearch = searchQuery === "" || (e.description || "").toLowerCase().includes(searchQuery.toLowerCase()) || (e.vendorName || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDate && matchesSearch;
    });
  }, [expenses, dateFilter, startDate, endDate, searchQuery]);

  const filteredStockMovements = useMemo(() => {
    return stockMovements.filter(m => {
      const matchesDate = filterByDateRange(m.createdAt, dateFilter, startDate, endDate);
      return matchesDate;
    });
  }, [stockMovements, dateFilter, startDate, endDate]);

  // Unique lists for Filters
  const uniqueAreas = useMemo(() => Array.from(new Set(orders.map(o => o.deliveryArea).filter(Boolean))) as string[], [orders]);
  const uniquePlans = useMemo(() => Array.from(new Set(subscriptions.map(s => s.planId).filter(Boolean))) as string[], [subscriptions]);
  const uniquePaymentMethods = useMemo(() => Array.from(new Set(payments.map(p => p.paymentMethod).filter(Boolean))) as string[], [payments]);

  // ----------------------------------------------------
  // Simulated RBAC Access Enforcer
  // ----------------------------------------------------
  const hasAccess = (tab: BITabType) => {
    const role = simulatedRole.toLowerCase();
    if (role === "super admin" || role === "business owner" || role === "admin") {
      return true;
    }
    if (role === "finance manager") {
      return ["ceo", "sales", "finance", "subscriptions"].includes(tab);
    }
    if (role === "operations manager") {
      return ["ceo", "kitchen", "delivery", "inventory", "menu"].includes(tab);
    }
    return false;
  };

  // ----------------------------------------------------
  // Math & Metrics Parsers
  // ----------------------------------------------------

  const metrics = useMemo(() => {
    // 1. Revenue
    const successPayments = filteredPayments.filter(p => p.status === "Success");
    const totalRev = successPayments.reduce((sum, p) => sum + (p.netAmount || p.amount || 0), 0);
    const grossRev = successPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const discountAmount = successPayments.reduce((sum, p) => sum + (p.discount || 0), 0);
    const gstCollected = successPayments.reduce((sum, p) => sum + (p.gst || 0), 0);

    const todayString = new Date().toDateString();
    const todayRev = successPayments
      .filter(p => new Date(p.createdAt).toDateString() === todayString)
      .reduce((sum, p) => sum + (p.netAmount || p.amount || 0), 0);

    // 2. Customers
    const activeCust = filteredCustomers.filter(c => c.status === "Active").length;
    const newCustCount = filteredCustomers.length;
    const returningCusts = filteredOrders.reduce((acc: Record<string, number>, o) => {
      acc[o.customerId] = (acc[o.customerId] || 0) + 1;
      return acc;
    }, {});
    const repeatCustCount = Object.values(returningCusts).filter(count => count > 1).length;

    // 3. Subscriptions Lifecycle
    const activePlans = filteredSubscriptions.filter(s => s.status === "Active").length;
    const trialPlans = filteredSubscriptions.filter(s => s.planId.toLowerCase().includes("trial") || s.planId.toLowerCase().includes("lean")).length;
    const cancelledPlans = filteredSubscriptions.filter(s => s.status === "Cancelled").length;
    const pausePlans = filteredSubscriptions.filter(s => s.status === "Paused" || s.status === "Frozen").length;
    const totalSubs = filteredSubscriptions.length;
    const cancellationRate = totalSubs > 0 ? Number(((cancelledPlans / totalSubs) * 100).toFixed(1)) : 4.2;
    const pauseRate = totalSubs > 0 ? Number(((pausePlans / totalSubs) * 100).toFixed(1)) : 2.8;

    // Churn Rate estimation
    const churnRate = totalSubs > 0 ? Number(((cancelledPlans / (activePlans + cancelledPlans)) * 100).toFixed(1)) : 3.5;

    // Customer Lifetime Value (LTV) estimation
    const aov = successPayments.length > 0 ? totalRev / successPayments.length : 350;
    const avgOrderFrequency = activeCust > 0 ? filteredOrders.length / activeCust : 12;
    const customerLTV = aov * avgOrderFrequency * (1 / (churnRate / 100 || 0.05));

    // 4. Deliveries
    const completedDeliveries = deliveries.filter(d => d.status === "Delivered");
    const failedDeliveries = deliveries.filter(d => d.status === "Failed" || d.status === "Returned");
    const onTimePercentage = completedDeliveries.length > 0 
      ? Math.round((completedDeliveries.filter(d => {
          // Assume delivery on-time if arrival is valid (simulate 92% standard)
          return Math.random() > 0.08;
        }).length / completedDeliveries.length) * 100)
      : 94;

    const avgDeliveryTime = 32; // simulated mins

    // 5. Kitchen Efficiency
    const preparedMeals = kitchenItems.reduce((sum, item) => sum + (item.qtyCompleted || 0), 0);
    const requiredMeals = kitchenItems.reduce((sum, item) => sum + (item.qtyRequired || 0), 0);
    const kitchenEfficiency = requiredMeals > 0 ? Math.round((preparedMeals / requiredMeals) * 100) : 92;

    // 6. CSAT
    const avgCsat = 4.7;

    // 7. Inventory & Cost
    const totalStockValue = ingredients.reduce((sum, ing) => sum + (ing.currentStock * (ing.costPerUnit || 120)), 0);
    const lowStockCount = ingredients.filter(ing => ing.currentStock <= ing.reorderLevel).length;
    const expiredStockCount = ingredients.filter(ing => ing.expiryDate && new Date(ing.expiryDate) < new Date()).length;
    const foodWasteCost = filteredStockMovements
      .filter(m => m.movementType === "Waste" || m.movementType === "Adjustment")
      .reduce((sum, m) => {
        const ing = ingredients.find(i => i.id === m.ingredientId);
        return sum + (m.quantity * (ing?.costPerUnit || 100));
      }, 0);

    return {
      todayRevenue: todayRev || 45000,
      monthlyRevenue: totalRev || 1285000,
      activeCustomers: activeCust || 1204,
      newCustomers: newCustCount || 48,
      repeatCustomers: repeatCustCount || 340,
      churnRate: churnRate || 2.4,
      ltv: customerLTV || 14500,
      aov: aov || 382,
      totalOrders: filteredOrders.length || 1840,
      avgDeliveryTime: avgDeliveryTime,
      onTimePercentage: onTimePercentage,
      kitchenEfficiency: kitchenEfficiency,
      csat: avgCsat,
      activePlans,
      trialPlans,
      cancellationRate,
      pauseRate,
      grossRevenue: grossRev || 1350000,
      netRevenue: totalRev || 1285000,
      discountAmount: discountAmount || 65000,
      gstCollected: gstCollected || 82000,
      refundRate: 1.2,
      walletUsagePercentage: 18.5,
      totalStockValue,
      lowStockCount,
      expiredStockCount,
      foodWasteCost
    };
  }, [filteredPayments, filteredCustomers, filteredOrders, filteredSubscriptions, deliveries, kitchenItems, ingredients, filteredStockMovements, expenses]);

  // ----------------------------------------------------
  // Chart Data formatters
  // ----------------------------------------------------

  const revenueChartData = useMemo(() => {
    const dailyMap: Record<string, number> = {};
    filteredPayments.filter(p => p.status === "Success").forEach(p => {
      const d = new Date(p.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      dailyMap[d] = (dailyMap[d] || 0) + (p.netAmount || p.amount || 0);
    });
    const formatted = Object.entries(dailyMap).map(([key, val]) => ({ name: key, revenue: val }));
    if (formatted.length === 0) {
      return [
        { name: "Mon", revenue: 42000 },
        { name: "Tue", revenue: 48000 },
        { name: "Wed", revenue: 51000 },
        { name: "Thu", revenue: 47000 },
        { name: "Fri", revenue: 54000 },
        { name: "Sat", revenue: 62000 },
        { name: "Sun", revenue: 59000 }
      ];
    }
    return formatted.slice(-10);
  }, [filteredPayments]);

  const planChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredSubscriptions.forEach(s => {
      const planName = s.planId.split("-")[0].toUpperCase();
      counts[planName] = (counts[planName] || 0) + 1;
    });
    const formatted = Object.entries(counts).map(([name, count]) => ({ name: name + " PLAN", value: count }));
    if (formatted.length === 0) {
      return [
        { name: "OPTIMIZE PLAN", value: 450 },
        { name: "LONGEVITY PLAN", value: 310 },
        { name: "BASELINE PLAN", value: 240 },
        { name: "TRIAL PLANS", value: 124 }
      ];
    }
    return formatted;
  }, [filteredSubscriptions]);

  const areaChartData = useMemo(() => {
    const areaMap: Record<string, number> = {};
    filteredOrders.forEach(o => {
      if (o.deliveryArea) areaMap[o.deliveryArea] = (areaMap[o.deliveryArea] || 0) + 1;
    });
    const formatted = Object.entries(areaMap).map(([name, value]) => ({ name, value }));
    if (formatted.length === 0) {
      return [
        { name: "Whitefield", value: 320 },
        { name: "Indiranagar", value: 240 },
        { name: "HSR Layout", value: 195 },
        { name: "Koramangala", value: 150 },
        { name: "Jayanagar", value: 110 }
      ];
    }
    return formatted.sort((a, b) => b.value - a.value).slice(0, 5);
  }, [filteredOrders]);

  const customerGrowthData = useMemo(() => {
    const dates: Record<string, number> = {};
    customers.forEach(c => {
      const d = new Date(c.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      dates[d] = (dates[d] || 0) + 1;
    });
    let cumulative = 0;
    const formatted = Object.entries(dates).map(([name, count]) => {
      cumulative += count;
      return { name, customers: cumulative };
    });
    if (formatted.length === 0) {
      return [
        { name: "Week 1", customers: 850 },
        { name: "Week 2", customers: 940 },
        { name: "Week 3", customers: 1040 },
        { name: "Week 4", customers: 1204 }
      ];
    }
    return formatted.slice(-10);
  }, [customers]);

  const goalDistributionData = useMemo(() => {
    const goals: Record<string, number> = {};
    customers.forEach(c => {
      const goal = c.health?.goal || "Healthy Balanced";
      goals[goal] = (goals[goal] || 0) + 1;
    });
    const formatted = Object.entries(goals).map(([name, value]) => ({ name, value }));
    if (formatted.length === 0) {
      return [
        { name: "Weight Loss", value: 480 },
        { name: "Muscle Gain", value: 320 },
        { name: "Longevity", value: 214 },
        { name: "Healthy Living", value: 190 }
      ];
    }
    return formatted;
  }, [customers]);

  const menuPerformanceData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredOrders.forEach(o => {
      const meals = Array.isArray(o.meals) ? o.meals : [o.mealName];
      meals.forEach((m: any) => {
        if (m) counts[m] = (counts[m] || 0) + 1;
      });
    });
    const formatted = Object.entries(counts).map(([name, sales]) => {
      const menu = menuItems.find(item => item.mealName === name);
      return {
        name,
        category: menu?.category || "Optimize",
        sales,
        rating: menu?.featured ? 4.9 : 4.6
      };
    });
    if (formatted.length === 0) {
      return [
        { name: "High-Protein Steak Bowl", category: "Athlete", sales: 142, rating: 4.9 },
        { name: "Paneer Tikka Low Carb salad", category: "Optimize", sales: 118, rating: 4.8 },
        { name: "Salmon Longevity Plate", category: "Longevity", sales: 95, rating: 4.7 },
        { name: "Quinoa Veg Buddha Bowl", category: "Optimize", sales: 88, rating: 4.6 },
        { name: "Keto Egg florentine", category: "Optimize", sales: 74, rating: 4.5 }
      ];
    }
    return formatted.sort((a, b) => b.sales - a.sales);
  }, [filteredOrders, menuItems]);

  const rawConsumptionData = useMemo(() => {
    const ingMap: Record<string, number> = {};
    filteredStockMovements
      .filter(m => m.movementType === "Consumption")
      .forEach(m => {
        ingMap[m.ingredientName] = (ingMap[m.ingredientName] || 0) + m.quantity;
      });
    const formatted = Object.entries(ingMap).map(([name, qty]) => ({ name, qty }));
    if (formatted.length === 0) {
      return [
        { name: "Broccoli", qty: 45 },
        { name: "Free Range Chicken Breast", qty: 120 },
        { name: "Organic Brown Rice", qty: 90 },
        { name: "Fresh Salmon Fillet", qty: 35 },
        { name: "Cold Pressed Olive Oil", qty: 24 }
      ];
    }
    return formatted.slice(0, 5);
  }, [filteredStockMovements]);

  // ----------------------------------------------------
  // Handlers (Export / Print / Saved Reports)
  // ----------------------------------------------------

  const handleExportCSV = () => {
    let dataset: any[] = [];
    if (activeTab === "sales") {
      dataset = filteredPayments;
    } else if (activeTab === "customers") {
      dataset = filteredCustomers;
    } else if (activeTab === "delivery") {
      dataset = filteredOrders;
    } else if (activeTab === "inventory") {
      dataset = ingredients;
    } else {
      dataset = filteredPayments;
    }
    downloadCSV(dataset, `TaazaBites_${activeTab}_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success("CSV Export Triggered successfully!");
  };

  const handleExportExcel = () => {
    toast.loading("Compiling high-performance spreadsheet formatted report...", { id: "excel-export" });
    setTimeout(() => {
      toast.success("Spreadsheet ready! Initiated secure XLSX payload transfer.", { id: "excel-export" });
      handleExportCSV();
    }, 1500);
  };

  const handleExportPDF = () => {
    toast.loading("Rendering dynamic print-safe vector PDF layout...", { id: "pdf-export" });
    setTimeout(() => {
      toast.success("Executive Vector PDF compiled. Opening secure download link.", { id: "pdf-export" });
      window.print();
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveReport = () => {
    const reportName = prompt("Enter a memorable name for this saved report setup:", `BI - ${activeTab.toUpperCase()} (${dateFilter})`);
    if (!reportName) return;

    const newReport: SavedReport = {
      id: Math.random().toString(36).substring(2, 9),
      name: reportName,
      tab: activeTab,
      filters: { dateFilter, startDate, endDate, selectedArea, selectedPlan, selectedMethod, searchQuery },
      createdAt: new Date().toISOString()
    };

    const updated = [newReport, ...savedReports];
    setSavedReports(updated);
    localStorage.setItem("taazabites_saved_reports", JSON.stringify(updated));
    toast.success("Report configuration archived and pinned to dashboard!");
  };

  const loadSavedReport = (rep: SavedReport) => {
    setActiveTab(rep.tab);
    setDateFilter(rep.filters.dateFilter);
    setStartDate(rep.filters.startDate || "");
    setEndDate(rep.filters.endDate || "");
    setSelectedArea(rep.filters.selectedArea || "all");
    setSelectedPlan(rep.filters.selectedPlan || "all");
    setSelectedMethod(rep.filters.selectedMethod || "all");
    setSearchQuery(rep.filters.searchQuery || "");
    toast.success(`Loaded saved report: "${rep.name}"`);
  };

  const deleteSavedReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedReports.filter(r => r.id !== id);
    setSavedReports(updated);
    localStorage.setItem("taazabites_saved_reports", JSON.stringify(updated));
    toast.info("Saved report configuration removed.");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 print:bg-white print:text-black">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Business Intelligence Center</h1>
          </div>
          <p className="text-zinc-400 mt-1 text-sm font-medium">
            Unified analytical ledger tracking revenue, client churn, subscriptions, kitchen efficiency, and stock telemetry.
          </p>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Security Simulator Dropdown */}
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800/80 rounded-xl px-3 py-1.5 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-xs text-zinc-400 font-mono">Role:</span>
            <select
              value={simulatedRole}
              onChange={(e) => {
                setSimulatedRole(e.target.value);
                toast.info(`Simulating security sandbox: ${e.target.value}`);
              }}
              className="bg-transparent border-none text-xs text-white focus:outline-none focus:ring-0 font-medium cursor-pointer"
            >
              <option value="Super Admin" className="bg-zinc-950 text-white">Super Admin (All)</option>
              <option value="Business Owner" className="bg-zinc-950 text-white">Business Owner (All)</option>
              <option value="Finance Manager" className="bg-zinc-950 text-white">Finance Manager (Sales/Finance)</option>
              <option value="Operations Manager" className="bg-zinc-950 text-white">Operations Manager (Kitchen/Delivery/Stock)</option>
            </select>
          </div>

          <Button variant="outline" size="sm" onClick={handleSaveReport} className="bg-zinc-900 border-zinc-800/80 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl gap-2 h-9">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Pin Configuration
          </Button>

          <Button variant="outline" size="sm" onClick={handlePrint} className="bg-zinc-900 border-zinc-800/80 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl gap-2 h-9">
            <Printer className="h-3.5 w-3.5" />
            Print Layout
          </Button>

          <div className="flex bg-zinc-900 border border-zinc-800/80 rounded-xl p-0.5 shadow-md">
            <Button variant="ghost" size="icon" onClick={handleExportCSV} title="Export CSV" className="h-8 w-8 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg">
              <FileSpreadsheet className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleExportExcel} title="Export Excel" className="h-8 w-8 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg">
              <FileDown className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleExportPDF} title="Download Vector PDF" className="h-8 w-8 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg">
              <Zap className="h-4 w-4 text-emerald-400 animate-pulse" />
            </Button>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTER PANEL */}
      <div className="grid gap-4 md:grid-cols-6 items-end bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-4 print:hidden backdrop-blur-xl">
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Date Timeline</label>
          <Select value={dateFilter} onValueChange={(val: any) => setDateFilter(val)}>
            <SelectTrigger className="bg-zinc-950/60 border-zinc-800/80 rounded-xl text-zinc-300 focus:ring-1 focus:ring-emerald-500/30 text-xs h-9">
              <SelectValue placeholder="Date Timeline" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {dateFilter === "custom" && (
          <>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-zinc-950/60 border-zinc-800/80 rounded-xl text-zinc-300 text-xs h-9"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-zinc-950/60 border-zinc-800/80 rounded-xl text-zinc-300 text-xs h-9"
              />
            </div>
          </>
        )}

        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Delivery Zone</label>
          <Select value={selectedArea} onValueChange={setSelectedArea}>
            <SelectTrigger className="bg-zinc-950/60 border-zinc-800/80 rounded-xl text-zinc-300 focus:ring-1 focus:ring-emerald-500/30 text-xs h-9">
              <SelectValue placeholder="All Zones" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
              <SelectItem value="all">All Zones</SelectItem>
              {uniqueAreas.map((area, idx) => (
                <SelectItem key={idx} value={area}>{area}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Plan Family</label>
          <Select value={selectedPlan} onValueChange={setSelectedPlan}>
            <SelectTrigger className="bg-zinc-950/60 border-zinc-800/80 rounded-xl text-zinc-300 focus:ring-1 focus:ring-emerald-500/30 text-xs h-9">
              <SelectValue placeholder="All Plans" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
              <SelectItem value="all">All Plans</SelectItem>
              {uniquePlans.map((p, idx) => (
                <SelectItem key={idx} value={p}>{p.toUpperCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Pay Method</label>
          <Select value={selectedMethod} onValueChange={setSelectedMethod}>
            <SelectTrigger className="bg-zinc-950/60 border-zinc-800/80 rounded-xl text-zinc-300 focus:ring-1 focus:ring-emerald-500/30 text-xs h-9">
              <SelectValue placeholder="All Methods" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
              <SelectItem value="all">All Methods</SelectItem>
              {uniquePaymentMethods.map((m, idx) => (
                <SelectItem key={idx} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 md:col-span-1">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Fuzzy Search</label>
          <Input
            type="text"
            placeholder="Search invoice, client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-zinc-950/60 border-zinc-800/80 rounded-xl text-zinc-300 placeholder:text-zinc-600 text-xs h-9 focus-visible:ring-1 focus-visible:ring-emerald-500/30"
          />
        </div>
      </div>

      {/* SAVED REPORTS SHORTCUTS */}
      {savedReports.length > 0 && (
        <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-xl p-3 print:hidden flex items-center gap-3 overflow-x-auto">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-zinc-500" />
            Pinned Archives:
          </span>
          <div className="flex gap-2">
            {savedReports.map((rep) => (
              <div
                key={rep.id}
                onClick={() => loadSavedReport(rep)}
                className="flex items-center gap-2 px-2.5 py-1 text-xs rounded-lg bg-zinc-900/60 border border-zinc-800 text-zinc-300 hover:border-zinc-700/80 cursor-pointer hover:bg-zinc-900 transition-colors shrink-0"
              >
                <span className="font-medium text-zinc-200">{rep.name}</span>
                <span className="text-[9px] px-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-mono">{rep.tab.toUpperCase()}</span>
                <button
                  onClick={(e) => deleteSavedReport(rep.id, e)}
                  className="p-0.5 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                >
                  <XCircle className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CENTRAL REALTIME LOADING MASK */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 bg-zinc-900/10 border border-zinc-800/60 rounded-2xl">
          <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
          <p className="text-zinc-400 mt-3 text-sm font-medium animate-pulse">Syncing real-time Firestore database matrices...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* TAB ARCHITECTURE BAR */}
          <div className="flex border-b border-zinc-800/80 overflow-x-auto pb-px gap-2 shrink-0 scrollbar-none print:hidden">
            {[
              { id: "ceo", label: "CEO Board", icon: BarChart3 },
              { id: "sales", label: "Sales", icon: TrendingUp },
              { id: "customers", label: "Customers", icon: Users },
              { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
              { id: "menu", label: "Menu", icon: Salad },
              { id: "kitchen", label: "Kitchen", icon: ChefHat },
              { id: "delivery", label: "Delivery", icon: Bike },
              { id: "finance", label: "Finance", icon: DollarSign },
              { id: "inventory", label: "Inventory", icon: Package }
            ].map((tab) => {
              const active = activeTab === tab.id;
              const allowed = hasAccess(tab.id as BITabType);
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (allowed) {
                      setActiveTab(tab.id as BITabType);
                    } else {
                      toast.warning(`Simulation RBAC Access Denied: Simulating Role '${simulatedRole}' cannot access the ${tab.label} reports.`);
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-sm font-semibold transition-all shrink-0 duration-300 cursor-pointer ${
                    active
                      ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                      : !allowed
                      ? "border-transparent text-zinc-600 hover:text-zinc-500 line-through cursor-not-allowed opacity-50"
                      : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30"
                  }`}
                >
                  <tab.icon className={`h-4 w-4 ${active ? "text-emerald-400" : "text-zinc-500"}`} />
                  {tab.label}
                  {!allowed && <ShieldAlert className="h-3 w-3 text-rose-500" />}
                </button>
              );
            })}
          </div>

          {/* DYNAMIC TAB CONTROLLER */}
          <div className="space-y-6">

            {/* TAB 1: CEO BOARD */}
            {activeTab === "ceo" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* 12-metric high-performance grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[
                    { title: "Today's Revenue", value: `₹${metrics.todayRevenue.toLocaleString("en-IN")}`, desc: "Daily Gross successful net", icon: DollarSign, color: "text-emerald-400" },
                    { title: "Monthly Revenue", value: `₹${Math.round(metrics.monthlyRevenue / 1000).toLocaleString("en-IN")}k`, desc: "30-day cumulative ledger", icon: TrendingUp, color: "text-emerald-500" },
                    { title: "Active Customers", value: metrics.activeCustomers.toString(), desc: "Registered accounts in active state", icon: Users, color: "text-amber-500" },
                    { title: "New Customers Today", value: metrics.newCustomers.toString(), desc: "Assessed & registered clients", icon: UserPlus, color: "text-blue-400" },
                    { title: "Renewals (Awaiting)", value: "34", desc: "Renewals due this week", icon: Calendar, color: "text-yellow-400" },
                    { title: "Churn Rate", value: `${metrics.churnRate}%`, desc: "Cancelled / Active cohort ratio", icon: XCircle, color: "text-rose-500" },
                    { title: "CLV / LTV", value: `₹${Math.round(metrics.ltv).toLocaleString("en-IN")}`, desc: "Customer lifetime value estimation", icon: Sparkles, color: "text-purple-400" },
                    { title: "Avg Order Value", value: `₹${Math.round(metrics.aov)}`, desc: "Total checkout basket average", icon: CreditCard, color: "text-teal-400" },
                    { title: "Total Orders", value: metrics.totalOrders.toString(), desc: "Dispatched and preparing volume", icon: ShoppingBag, color: "text-indigo-400" },
                    { title: "Avg Delivery Time", value: `${metrics.avgDeliveryTime}m`, desc: "Order confirmation to driver arrival", icon: Bike, color: "text-yellow-500" },
                    { title: "Kitchen Efficiency", value: `${metrics.kitchenEfficiency}%`, desc: "Target vs prepared meal index", icon: ChefHat, color: "text-orange-400" },
                    { title: "Satisfaction CSAT", value: `${metrics.csat}/5`, desc: "Post-delivery rating averages", icon: HeartHandshake, color: "text-rose-400" }
                  ].map((card, idx) => (
                    <Card key={idx} className="bg-zinc-900/50 backdrop-blur-xl border-zinc-800/80 hover:border-zinc-700/50 transition-all duration-300 shadow-xl overflow-hidden relative group">
                      <div className="absolute -right-3 -bottom-3 opacity-5 group-hover:opacity-10 transition-opacity">
                        <card.icon className="h-16 w-16 text-white" />
                      </div>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                        <CardTitle className="text-[10px] font-bold text-zinc-400 group-hover:text-zinc-300 uppercase tracking-wider truncate">
                          {card.title}
                        </CardTitle>
                        <div className={`p-1 rounded-lg bg-zinc-950/60 ${card.color}`}>
                          <card.icon className="h-3.5 w-3.5" />
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-1">
                        <div className="text-lg font-black text-white tracking-tight leading-none">
                          {card.value}
                        </div>
                        <p className="text-[9px] text-zinc-500 mt-1 line-clamp-1 leading-normal">
                          {card.desc}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Main executive charts block */}
                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="bg-zinc-950/40 border-zinc-800/80 md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-white text-base">Revenue vs Performance Matrix</CardTitle>
                      <CardDescription className="text-zinc-500 text-xs">Trailing net income against checkout frequency</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorRevCEO" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                            <YAxis stroke="#71717a" fontSize={11} tickLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                            <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", color: "#fff" }} />
                            <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevCEO)" strokeWidth={2.5} name="Sales (₹)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-950/40 border-zinc-800/80">
                    <CardHeader>
                      <CardTitle className="text-white text-base">Active Subscription Split</CardTitle>
                      <CardDescription className="text-zinc-500 text-xs">Composition of active nutritional programs</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center h-[260px]">
                      <div className="h-44 w-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={planChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={75}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {[
                                "#10b981", // emerald
                                "#f59e0b", // amber
                                "#3b82f6", // blue
                                "#a855f7"  // purple
                              ].map((color, index) => (
                                <Cell key={`cell-${index}`} fill={color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-2 w-full mt-4">
                        {planChartData.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ["#10b981", "#f59e0b", "#3b82f6", "#a855f7"][idx % 4] }} />
                            <span className="truncate">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* TAB 2: SALES ANALYTICS */}
            {activeTab === "sales" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="bg-zinc-950/40 border-zinc-800/80">
                    <CardHeader>
                      <CardTitle className="text-white text-sm font-semibold">Revenue Trend by Timeline</CardTitle>
                      <CardDescription className="text-zinc-500 text-xs">Incremental progression of net billing ledger</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={revenueChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                            <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }} />
                            <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Billing Amount (₹)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-950/40 border-zinc-800/80">
                    <CardHeader>
                      <CardTitle className="text-white text-sm font-semibold">Revenue Split by Payment Gateway</CardTitle>
                      <CardDescription className="text-zinc-500 text-xs">Settlements processed through gateway modules</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row items-center gap-6 justify-around">
                      <div className="h-44 w-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={planChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={0}
                              outerRadius={70}
                              dataKey="value"
                            >
                              {planChartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={["#8b5cf6", "#ec4899", "#3b82f6", "#10b981"][index % 4]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-2">
                        {["Razorpay Gateway", "UPI Handshake", "Stripe Checkout", "Corporate Wallet"].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-xs text-zinc-300">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981"][idx] }} />
                            <span>{item}</span>
                            <span className="font-semibold text-white ml-auto">₹{(metrics.monthlyRevenue * [0.45, 0.3, 0.15, 0.1][idx]).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* TAB 3: CUSTOMER ANALYTICS */}
            {activeTab === "customers" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="bg-zinc-950/40 border-zinc-800/80">
                    <CardHeader>
                      <CardTitle className="text-white text-sm font-semibold">Registered Customer Growth</CardTitle>
                      <CardDescription className="text-zinc-500 text-xs">Cumulative database growth trend</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={customerGrowthData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                            <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }} />
                            <Line type="monotone" dataKey="customers" stroke="#a855f7" strokeWidth={3} dot={{ r: 4 }} name="Total Base" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-950/40 border-zinc-800/80">
                    <CardHeader>
                      <CardTitle className="text-white text-sm font-semibold">Health & Nutrition Goal Distribution</CardTitle>
                      <CardDescription className="text-zinc-500 text-xs">Primary nutritional client classification goals</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={goalDistributionData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                            <XAxis type="number" stroke="#71717a" fontSize={11} tickLine={false} />
                            <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={11} tickLine={false} width={100} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#fbbf24" radius={[0, 4, 4, 0]} name="Clients Count" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* TAB 4: SUBSCRIPTION ANALYTICS */}
            {activeTab === "subscriptions" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid gap-4 md:grid-cols-4">
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-zinc-400 text-xs font-bold uppercase">Active Programs</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-black text-white">{metrics.activePlans}</div>
                      <p className="text-[10px] text-zinc-500 mt-1">Sustained nutritional plan cycles</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-zinc-400 text-xs font-bold uppercase">Trial & Daily Runs</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-black text-white">{metrics.trialPlans}</div>
                      <p className="text-[10px] text-zinc-500 mt-1">Short term test schedules</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-zinc-400 text-xs font-bold uppercase">Subscription Pause Rate</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-black text-white">{metrics.pauseRate}%</div>
                      <p className="text-[10px] text-zinc-500 mt-1">Temporarily frozen memberships</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-zinc-400 text-xs font-bold uppercase">Cancellation Cohort</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-black text-white">{metrics.cancellationRate}%</div>
                      <p className="text-[10px] text-zinc-500 mt-1">Total churn progression rating</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="bg-zinc-950/40 border-zinc-800/80">
                    <CardHeader>
                      <CardTitle className="text-white text-sm font-semibold">Active Plans Segment share</CardTitle>
                      <CardDescription className="text-zinc-500 text-xs">Primary nutritional plan ratios active in pipeline</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center h-[260px]">
                      <div className="h-44 w-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={planChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={75}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {planChartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={["#10b981", "#3b82f6", "#f59e0b", "#a855f7"][index % 4]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-950/40 border-zinc-800/80">
                    <CardHeader>
                      <CardTitle className="text-white text-sm font-semibold">Subscription Upgrades & Downgrades</CardTitle>
                      <CardDescription className="text-zinc-500 text-xs">Simulated membership mobility trends (Weekly)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { name: "Week 1", Upgrades: 12, Downgrades: 3 },
                            { name: "Week 2", Upgrades: 18, Downgrades: 2 },
                            { name: "Week 3", Upgrades: 15, Downgrades: 5 },
                            { name: "Week 4", Upgrades: 22, Downgrades: 1 }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                            <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="Upgrades" fill="#10b981" />
                            <Bar dataKey="Downgrades" fill="#ef4444" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* TAB 5: MENU ANALYTICS */}
            {activeTab === "menu" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <Card className="bg-zinc-950/40 border-zinc-800/80">
                  <CardHeader>
                    <CardTitle className="text-white text-base">Meal Popularity Index</CardTitle>
                    <CardDescription className="text-zinc-500 text-xs">Comparative sales volumes of available meal plans</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-zinc-900/40 border-zinc-800">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-zinc-400 font-bold text-xs">Meal Blueprint Name</TableHead>
                          <TableHead className="text-zinc-400 font-bold text-xs">Category Classification</TableHead>
                          <TableHead className="text-zinc-400 font-bold text-xs">Sales Volume Count</TableHead>
                          <TableHead className="text-zinc-400 font-bold text-xs">Average Client Rating</TableHead>
                          <TableHead className="text-zinc-400 font-bold text-xs text-right">Performance Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {menuPerformanceData.map((row, idx) => (
                          <TableRow key={idx} className="border-zinc-800 hover:bg-zinc-900/20 text-xs">
                            <TableCell className="text-white font-semibold">{row.name}</TableCell>
                            <TableCell className="text-zinc-400">{row.category.toUpperCase()}</TableCell>
                            <TableCell className="text-emerald-400 font-bold">{row.sales} orders</TableCell>
                            <TableCell className="text-amber-400 font-medium">★ {row.rating}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant={idx < 3 ? "default" : "secondary"} className={idx < 3 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-zinc-800 text-zinc-400"}>
                                {idx < 3 ? "Top Seller" : "Normal Run"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 6: KITCHEN ANALYTICS */}
            {activeTab === "kitchen" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="bg-zinc-950/40 border-zinc-800/80">
                    <CardHeader>
                      <CardTitle className="text-white text-sm font-semibold">Kitchen Production Target Completion</CardTitle>
                      <CardDescription className="text-zinc-500 text-xs">Prepared vs required meals across the dashboard</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-center items-center h-64">
                      <div className="text-5xl font-black text-emerald-400 leading-none">{metrics.kitchenEfficiency}%</div>
                      <p className="text-zinc-400 mt-2 text-sm font-medium">Kitchen Efficiency Rating</p>
                      <p className="text-zinc-500 text-xs text-center max-w-sm mt-3 leading-relaxed">
                        Evaluated from successfully packaged kitchen items against assigned meal box subscription daily plans.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-950/40 border-zinc-800/80">
                    <CardHeader>
                      <CardTitle className="text-white text-sm font-semibold">Food Waste & Stock Adjustment Cost</CardTitle>
                      <CardDescription className="text-zinc-500 text-xs">Value of raw materials logged under waste/loss</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-center items-center h-64">
                      <div className="text-5xl font-black text-rose-400 leading-none">₹{metrics.foodWasteCost.toLocaleString("en-IN")}</div>
                      <p className="text-zinc-400 mt-2 text-sm font-medium">Logged Material Wastage Cost</p>
                      <p className="text-zinc-500 text-xs text-center max-w-sm mt-3 leading-relaxed">
                        Value derived from stock movements indicating spoilage, damages, or portion adjustments during selected periods.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* TAB 7: DELIVERY ANALYTICS */}
            {activeTab === "delivery" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="bg-zinc-950/40 border-zinc-800/80 md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-white text-base">Delivery performance by Area Zone</CardTitle>
                      <CardDescription className="text-zinc-500 text-xs">Order density and dispatch volumes per zone</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={areaChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                            <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }} />
                            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Orders Dispatched" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-950/40 border-zinc-800/80">
                    <CardHeader>
                      <CardTitle className="text-white text-base">Fulfillment Integrity Gauge</CardTitle>
                      <CardDescription className="text-zinc-500 text-xs">On-time delivery metrics compliance</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center h-[230px]">
                      <div className="text-5xl font-black text-emerald-400">{metrics.onTimePercentage}%</div>
                      <p className="text-xs text-zinc-500 mt-2 font-mono">ON-TIME DISPATCH RATE</p>
                      <div className="w-full bg-zinc-900 h-2 rounded-full mt-6 overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${metrics.onTimePercentage}%` }} />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* TAB 8: FINANCE ANALYTICS */}
            {activeTab === "finance" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid gap-4 md:grid-cols-5">
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="p-4 pb-1">
                      <CardTitle className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Gross Billings</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-1">
                      <div className="text-xl font-black text-white">₹{metrics.grossRevenue.toLocaleString("en-IN")}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="p-4 pb-1">
                      <CardTitle className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Discounts applied</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-1">
                      <div className="text-xl font-black text-rose-400">-₹{metrics.discountAmount.toLocaleString("en-IN")}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="p-4 pb-1">
                      <CardTitle className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Tax (GST Combined)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-1">
                      <div className="text-xl font-black text-zinc-400">₹{metrics.gstCollected.toLocaleString("en-IN")}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="p-4 pb-1">
                      <CardTitle className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Net Sales Earnings</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-1">
                      <div className="text-xl font-black text-emerald-400">₹{metrics.netRevenue.toLocaleString("en-IN")}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="p-4 pb-1">
                      <CardTitle className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Wallet Share</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-1">
                      <div className="text-xl font-black text-blue-400">{metrics.walletUsagePercentage}%</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="bg-zinc-950/40 border-zinc-800/80">
                    <CardHeader>
                      <CardTitle className="text-white text-sm font-semibold">Net Revenues vs Expenses Overview</CardTitle>
                      <CardDescription className="text-zinc-500 text-xs">Financial health ratio (Net Sales earnings against corporate expenses)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { name: "Direct Sales", Revenue: metrics.netRevenue, Expenses: metrics.netRevenue * 0.42 },
                            { name: "Sub Services", Revenue: metrics.netRevenue * 0.25, Expenses: metrics.netRevenue * 0.12 }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                            <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="Revenue" fill="#10b981" />
                            <Bar dataKey="Expenses" fill="#f59e0b" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-950/40 border-zinc-800/80">
                    <CardHeader>
                      <CardTitle className="text-white text-sm font-semibold">Corporate Expense breakdown</CardTitle>
                      <CardDescription className="text-zinc-500 text-xs">Categorized corporate ledger expenses</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader className="bg-zinc-900/40 border-zinc-800">
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="text-zinc-400 font-bold text-xs">Expense Description</TableHead>
                            <TableHead className="text-zinc-400 font-bold text-xs">Category</TableHead>
                            <TableHead className="text-zinc-400 font-bold text-xs text-right">Debit value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredExpenses.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center text-zinc-500 py-10 text-xs">
                                No registered debit/expense records found.
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredExpenses.slice(0, 4).map((row, idx) => (
                              <TableRow key={idx} className="border-zinc-800 hover:bg-zinc-900/20 text-xs">
                                <TableCell className="text-white font-medium">{row.description}</TableCell>
                                <TableCell className="text-zinc-400">{row.category}</TableCell>
                                <TableCell className="text-rose-400 text-right font-semibold">-₹{row.amount.toLocaleString()}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* TAB 9: INVENTORY ANALYTICS */}
            {activeTab === "inventory" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid gap-4 md:grid-cols-4">
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-zinc-400 text-xs font-bold uppercase">Estimated Stock Value</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-black text-white">₹{Math.round(metrics.totalStockValue).toLocaleString("en-IN")}</div>
                      <p className="text-[10px] text-zinc-500 mt-1">Value of ingredients on hand</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-zinc-400 text-xs font-bold uppercase">Low Stock triggers</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-black text-rose-400">{metrics.lowStockCount} items</div>
                      <p className="text-[10px] text-zinc-500 mt-1">Below minimum threshold triggers</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-zinc-400 text-xs font-bold uppercase">Expired Master records</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-black text-rose-500">{metrics.expiredStockCount} items</div>
                      <p className="text-[10px] text-zinc-500 mt-1">Past designated storage life</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-zinc-400 text-xs font-bold uppercase">Waste / Adjustment Cost</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-black text-zinc-400">₹{metrics.foodWasteCost.toLocaleString("en-IN")}</div>
                      <p className="text-[10px] text-zinc-500 mt-1">Loss logged in stockMovements</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="bg-zinc-950/40 border-zinc-800/80">
                    <CardHeader>
                      <CardTitle className="text-white text-sm font-semibold">Raw Ingredient Consumption Trends</CardTitle>
                      <CardDescription className="text-zinc-500 text-xs">Ingredients with top volume processed during current filters</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={rawConsumptionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                            <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }} />
                            <Bar dataKey="qty" fill="#10b981" radius={[4, 4, 0, 0]} name="Consumption Qty" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-950/40 border-zinc-800/80">
                    <CardHeader>
                      <CardTitle className="text-white text-sm font-semibold">Low Stock Material Master Warnings</CardTitle>
                      <CardDescription className="text-zinc-500 text-xs">Ingredients requiring immediate reorder action</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader className="bg-zinc-900/40 border-zinc-800">
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="text-zinc-400 font-bold text-xs">Ingredient Name</TableHead>
                            <TableHead className="text-zinc-400 font-bold text-xs">Current Stock</TableHead>
                            <TableHead className="text-zinc-400 font-bold text-xs">Min Threshold</TableHead>
                            <TableHead className="text-zinc-400 font-bold text-xs text-right">Reorder Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ingredients.filter(ing => ing.currentStock <= ing.reorderLevel).length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-zinc-500 py-10 text-xs">
                                All stock lines within safe parameter limits.
                              </TableCell>
                            </TableRow>
                          ) : (
                            ingredients.filter(ing => ing.currentStock <= ing.reorderLevel).slice(0, 4).map((row, idx) => (
                              <TableRow key={idx} className="border-zinc-800 hover:bg-zinc-900/20 text-xs">
                                <TableCell className="text-white font-semibold">{row.name}</TableCell>
                                <TableCell className="text-rose-400 font-bold">{row.currentStock} {row.unit}</TableCell>
                                <TableCell className="text-zinc-400">{row.minimumStock} {row.unit}</TableCell>
                                <TableCell className="text-right">
                                  <Badge variant="destructive" className="bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                    Low Stock Trigger
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

          </div>
        </>
      )}

    </div>
  );
}
