import { useEffect, useState } from "react"
import { reportService } from "../services/reports"
import { Customer, Subscription, Order, Payment, MenuItem, DeliveryPartner, Delivery, Coupon, KitchenProductionItem, Ingredient } from "../types"
import { calculateKPIMetrics, filterByDateRange, downloadCSV } from "../utils/analytics-helpers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, RefreshCw, FileSpreadsheet, Printer, TrendingUp, Calendar, Users, ShoppingBag, Bike, CreditCard, Salad } from "lucide-react"

// Import modular panels
import KPIGrid from "../components/analytics/kpi-grid"
import RevenueTab from "../components/analytics/revenue-tab"
import CustomersTab from "../components/analytics/customers-tab"
import SubscriptionsTab from "../components/analytics/subscriptions-tab"
import OrdersTab from "../components/analytics/orders-tab"
import DeliveryTab from "../components/analytics/delivery-tab"
import PaymentsTab from "../components/analytics/payments-tab"
import MenuTab from "../components/analytics/menu-tab"
import KitchenTab from "../components/analytics/kitchen-tab"
import InventoryTab from "../components/analytics/inventory-tab"

type TabType = "revenue" | "customers" | "subscriptions" | "orders" | "delivery" | "payments" | "menuItems" | "kitchen" | "inventory";

export default function ReportsPage() {
  // Realtime raw Firestore state
  const [customers, setCustomers] = useState<Customer[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([])
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [kitchenItems, setKitchenItems] = useState<KitchenProductionItem[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>("revenue")

  // Interactive filters state
  const [dateFilter, setDateFilter] = useState<"today" | "yesterday" | "week" | "month" | "custom">("month")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedArea, setSelectedArea] = useState("all")
  const [selectedPlan, setSelectedPlan] = useState("all")
  const [selectedMethod, setSelectedMethod] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Subscribe to all 8 collections via reportService
  useEffect(() => {
    setLoading(true)
    
    const unsubscribes = [
      reportService.subscribeCustomers(setCustomers),
      reportService.subscribeSubscriptions(setSubscriptions),
      reportService.subscribeOrders(setOrders),
      reportService.subscribePayments(setPayments),
      reportService.subscribeMenuItems(setMenuItems),
      reportService.subscribeDeliveryPartners(setDeliveryPartners),
      reportService.subscribeDeliveries(setDeliveries),
      reportService.subscribeCoupons(setCoupons),
      reportService.subscribeKitchenItems(setKitchenItems),
      reportService.subscribeIngredients(setIngredients)
    ]

    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)

    return () => {
      unsubscribes.forEach(unsub => unsub())
      clearTimeout(timer)
    }
  }, [])

  // ----------------------------------------------------
  // Interactive Filtering Engine
  // ----------------------------------------------------
  
  // Filtered Payments
  const filteredPayments = payments.filter(p => {
    const matchesDate = filterByDateRange(p.createdAt, dateFilter, startDate, endDate)
    const matchesMethod = selectedMethod === "all" || p.paymentMethod === selectedMethod
    const matchesPlan = selectedPlan === "all" || 
      (p.subscriptionId && p.subscriptionId.toLowerCase().includes(selectedPlan.toLowerCase())) ||
      (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(selectedPlan.toLowerCase()))
    
    const matchesSearch = searchQuery === "" || 
      (p.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.paymentId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.transactionId || "").toLowerCase().includes(searchQuery.toLowerCase())

    return matchesDate && matchesMethod && matchesPlan && matchesSearch
  })

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    const rawDate = o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toISOString() : (o.createdAt || o.deliveryDate)
    const matchesDate = filterByDateRange(rawDate, dateFilter, startDate, endDate)
    const matchesArea = selectedArea === "all" || o.deliveryArea === selectedArea
    const matchesPlan = selectedPlan === "all" || 
      (o.planName && o.planName.toLowerCase().includes(selectedPlan.toLowerCase())) ||
      (o.subscriptionId && o.subscriptionId.toLowerCase().includes(selectedPlan.toLowerCase()))

    const matchesSearch = searchQuery === "" || 
      (o.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.id.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesDate && matchesArea && matchesPlan && matchesSearch
  })

  // Filtered Customers
  const filteredCustomers = customers.filter(c => {
    const matchesDate = filterByDateRange(c.createdAt, dateFilter, startDate, endDate)
    const matchesSearch = searchQuery === "" || 
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.phone.includes(searchQuery)

    return matchesDate && matchesSearch
  })

  // Filtered Subscriptions
  const filteredSubscriptions = subscriptions.filter(s => {
    const matchesDate = filterByDateRange(s.startDate, dateFilter, startDate, endDate)
    const matchesPlan = selectedPlan === "all" || s.planId.toLowerCase().includes(selectedPlan.toLowerCase())
    return matchesDate && matchesPlan
  })

  // Recalculated dynamic KPI metrics based on filtered inputs
  const liveKPIs = calculateKPIMetrics(
    filteredCustomers, 
    filteredSubscriptions, 
    filteredOrders, 
    filteredPayments
  )

  // ----------------------------------------------------
  // Export Handlers
  // ----------------------------------------------------
  const handleExportCSV = () => {
    if (activeTab === "revenue") {
      downloadCSV(filteredPayments, `Revenue_Ledger_${new Date().toISOString().slice(0, 10)}.csv`)
    } else if (activeTab === "customers") {
      downloadCSV(filteredCustomers, `Customers_Database_${new Date().toISOString().slice(0, 10)}.csv`)
    } else if (activeTab === "orders") {
      downloadCSV(filteredOrders, `Orders_Fulfillment_${new Date().toISOString().slice(0, 10)}.csv`)
    } else {
      downloadCSV(filteredPayments, `Transaction_Report_${new Date().toISOString().slice(0, 10)}.csv`)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // Extract unique areas, plans, methods for select filters
  const uniqueAreas = Array.from(new Set(orders.map(o => o.deliveryArea).filter(Boolean))) as string[]
  const uniquePlans = Array.from(new Set(subscriptions.map(s => s.planId).filter(Boolean))) as string[]
  const uniqueMethods = Array.from(new Set(payments.map(p => p.paymentMethod).filter(Boolean))) as string[]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Print custom stylesheet to hide dashboard shell when window.print is called */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          aside, nav, header, .no-print, button, input, select, .sidebar {
            display: none !important;
          }
          .print-full-width {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* Title Header Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Business Intelligence</h1>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
              ● Realtime Firestore
            </span>
          </div>
          <p className="text-zinc-400 text-sm mt-1">Deep operational statistics and automated ledger auditing tools.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white text-xs h-9"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-500" /> Export CSV / Excel
          </Button>
          <Button 
            onClick={handlePrint}
            className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-semibold text-xs h-9"
          >
            <Printer className="mr-2 h-4 w-4" /> PDF / Print Report
          </Button>
        </div>
      </div>

      {/* Filters Control Bar */}
      <Card className="bg-zinc-900/40 border-zinc-800/80 no-print">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3">
          
          <div className="flex-1 min-w-[150px]">
            <span className="text-[10px] text-zinc-500 block mb-1 font-semibold">DATE TIMELINE</span>
            <Select value={dateFilter} onValueChange={(val: any) => setDateFilter(val)}>
              <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-300 text-xs h-9">
                <SelectValue placeholder="Select Timeline" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-300">
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">Past 7 Days</SelectItem>
                <SelectItem value="month">Past 30 Days</SelectItem>
                <SelectItem value="custom">Custom Date Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dateFilter === "custom" && (
            <>
              <div className="min-w-[120px]">
                <span className="text-[10px] text-zinc-500 block mb-1 font-semibold">START DATE</span>
                <Input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="bg-zinc-950 border-zinc-800 text-zinc-300 text-xs h-9" 
                />
              </div>
              <div className="min-w-[120px]">
                <span className="text-[10px] text-zinc-500 block mb-1 font-semibold">END DATE</span>
                <Input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="bg-zinc-950 border-zinc-800 text-zinc-300 text-xs h-9" 
                />
              </div>
            </>
          )}

          <div className="min-w-[150px]">
            <span className="text-[10px] text-zinc-500 block mb-1 font-semibold">SECTOR AREA</span>
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-300 text-xs h-9">
                <SelectValue placeholder="All Areas" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-300">
                <SelectItem value="all">All Service Areas</SelectItem>
                {uniqueAreas.map((area, idx) => (
                  <SelectItem key={idx} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[150px]">
            <span className="text-[10px] text-zinc-500 block mb-1 font-semibold">PLAN CLASSIFICATION</span>
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-300 text-xs h-9">
                <SelectValue placeholder="All Plans" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-300">
                <SelectItem value="all">All Plans</SelectItem>
                {uniquePlans.map((plan, idx) => (
                  <SelectItem key={idx} value={plan}>{plan}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[150px]">
            <span className="text-[10px] text-zinc-500 block mb-1 font-semibold">PAYMENT METHOD</span>
            <Select value={selectedMethod} onValueChange={setSelectedMethod}>
              <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-300 text-xs h-9">
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-300">
                <SelectItem value="all">All Methods</SelectItem>
                {uniqueMethods.map((method, idx) => (
                  <SelectItem key={idx} value={method}>{method}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <span className="text-[10px] text-zinc-500 block mb-1 font-semibold">SEARCH FILTER</span>
            <Input 
              placeholder="Search customers, orders, txns..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-950 border-zinc-800 text-zinc-300 text-xs h-9 placeholder:text-zinc-600"
            />
          </div>

        </CardContent>
      </Card>

      {/* Main Content Loading State */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-32 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-zinc-500 text-xs font-medium">Aggregating live Firestore telemetry streams...</p>
        </div>
      ) : (
        <div className="space-y-6 print-full-width">
          
          {/* 10-KPI Master Grid */}
          <KPIGrid metrics={liveKPIs} />

          {/* Sub-Navigation Reports Tabs (Horizontal on Desktop, Grid on Mobile) */}
          <div className="flex flex-wrap gap-1.5 border-b border-zinc-800/80 pb-2 no-print">
            {[
              { id: "revenue", name: "Revenue Reports", icon: TrendingUp },
              { id: "customers", name: "Customer Reports", icon: Users },
              { id: "subscriptions", name: "Subscriptions", icon: Calendar },
              { id: "orders", name: "Order Reports", icon: ShoppingBag },
              { id: "delivery", name: "Delivery Reports", icon: Bike },
              { id: "payments", name: "Payment Audits", icon: CreditCard },
              { id: "menuItems", name: "Menu Analytics", icon: Salad },
              { id: "kitchen", name: "Kitchen Report", icon: Salad },
              { id: "inventory", name: "Inventory Report", icon: FileSpreadsheet }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all duration-300 ${
                  activeTab === tab.id 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/35" 
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.name}
              </button>
            ))}
          </div>

          {/* Render Active View Tab */}
          <div className="print-full-width">
            {activeTab === "revenue" && <RevenueTab payments={filteredPayments} orders={filteredOrders} />}
            {activeTab === "customers" && <CustomersTab customers={filteredCustomers} orders={filteredOrders} payments={filteredPayments} />}
            {activeTab === "subscriptions" && <SubscriptionsTab subscriptions={filteredSubscriptions} customers={filteredCustomers} />}
            {activeTab === "orders" && <OrdersTab orders={filteredOrders} customers={filteredCustomers} />}
            {activeTab === "delivery" && <DeliveryTab deliveryPartners={deliveryPartners} deliveries={deliveries} />}
            {activeTab === "payments" && <PaymentsTab payments={filteredPayments} coupons={coupons} />}
            {activeTab === "menuItems" && <MenuTab menuItems={menuItems} orders={filteredOrders} />}
            {activeTab === "kitchen" && <KitchenTab kitchenItems={kitchenItems} />}
            {activeTab === "inventory" && <InventoryTab ingredients={ingredients} />}
          </div>

        </div>
      )}

    </div>
  )
}
