import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HeartbeatIndicator } from "../../components/heartbeat-indicator"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { 
  Loader2, 
  RefreshCcw, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  Printer, 
  Trash2, 
  UserPlus, 
  Edit, 
  Eye, 
  X, 
  Check, 
  CheckCircle, 
  Calendar, 
  Truck, 
  ChefHat, 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  ArrowRight, 
  MapPin, 
  User, 
  FileText, 
  AlertCircle, 
  Inbox, 
  Sparkles, 
  Plus, 
  Smartphone, 
  MessageSquare, 
  Mail,
  ClipboardList
} from "lucide-react"
import { OrdersTabs } from "../../components/orders/orders-tabs";
import { orderService } from "../../services/orders"
import { Order } from "../../types"
import { useAuth } from "../../contexts/auth-context"
import { useLocation, useNavigate } from "react-router-dom"

export default function OrdersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // explicit def

  const location = useLocation();
  const navigate = useNavigate();
  const defaultStatus = location.pathname.includes('/orders/pending') ? 'Pending' :
                        location.pathname.includes('/orders/preparing') ? 'Preparing' :
                        location.pathname.includes('/orders/packed') ? 'Packed' :
                        location.pathname.includes('/orders/out') ? 'Out For Delivery' :
                        location.pathname.includes('/orders/delivered') ? 'Delivered' :
                        location.pathname.includes('/orders/cancelled') ? 'Cancelled' : 'All';

  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // State for Selection & Bulk Actions
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([])
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState(defaultStatus)

  useEffect(() => {
    setStatusFilter(defaultStatus)
  }, [location.pathname, defaultStatus])
  const [paymentFilter, setPaymentFilter] = useState("All")
  const [areaFilter, setAreaFilter] = useState("All")
  const [driverFilter, setDriverFilter] = useState("All")
  const [planFilter, setPlanFilter] = useState("All")
  const [slotFilter, setSlotFilter] = useState("All")
  const [timeFilter, setTimeFilter] = useState("All") // "All" | "Today" | "Tomorrow" | "Range"
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Modals state
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null)
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null)
  
  // Custom edit form state
  const [editFormData, setEditFormData] = useState({
    customerName: "",
    customerPhone: "",
    deliveryAddress: "",
    deliveryArea: "",
    deliverySlot: "",
    paymentStatus: ""
  })

  // Driver Assignment form state
  const [selectedDriverId, setSelectedDriverId] = useState("")
  const [assignRoute, setAssignRoute] = useState("")
  const [estDeliveryTime, setEstDeliveryTime] = useState("")

  // Bulk actions status/driver selection
  const [bulkStatusToChange, setBulkStatusToChange] = useState("")
  const [bulkDriverToAssign, setBulkDriverToAssign] = useState("")
  const [bulkShowStatusModal, setBulkShowStatusModal] = useState(false)
  const [bulkShowDriverModal, setBulkShowDriverModal] = useState(false)

  // Live order notifications state (for selected order)
  const [orderNotificationLogs, setOrderNotificationLogs] = useState<any[]>([])

  // Load real-time orders & delivery partners
  useEffect(() => {
    setLoading(true)
    setError("")
    
    // Setup Firestore listener
    const unsubscribeOrders = orderService.subscribeToOrders(
      (fetchedOrders) => {
        setOrders(fetchedOrders)
        setLoading(false)
      },
      (err) => {
        setError("Error fetching real-time orders: " + err.message)
        setLoading(false)
      }
    )

    // Setup delivery partners listener
    const unsubscribePartners = orderService.subscribeToDeliveryPartners((fetchedPartners) => {
      setDrivers(fetchedPartners)
    })

    return () => {
      unsubscribeOrders()
      unsubscribePartners()
    }
  }, [])

  // Whenever a detailed order is opened, load its triggered notification logs in real time
  useEffect(() => {
    if (!viewingOrder) {
      setOrderNotificationLogs([])
      return
    }

    const unsubscribe = orderService.subscribeNotifications(viewingOrder.id, (logs) => {
      setOrderNotificationLogs(logs)
    })

    return () => unsubscribe()
  }, [viewingOrder])

  // Seeding sample orders helper
  const handleSeedOrders = async () => {
    try {
      setLoading(true)
      await orderService.seedSampleOrders()
    } catch (err: any) {
      setError("Failed to seed sample orders: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Dashboard calculations based on orders list (reactive)
  const stats = useMemo(() => {
    const total = orders.length
    let todayRevenue = 0;
    orders.forEach(o => {
      if (o.createdAt && o.createdAt.substring(0, 10) === new Date().toISOString().substring(0, 10)) {
        todayRevenue += o.amount || 0;
      }
    })
    
    // Today's orders
    const todayStr = new Date().toISOString().substring(0, 10)
    const todayOrders = orders.filter(o => {
      const createdStr = o.createdAt ? o.createdAt.substring(0, 10) : ''
      return createdStr === todayStr
    })

    const pending = orders.filter(o => o.orderStatus === "Pending").length
    const preparing = orders.filter(o => o.orderStatus === "Preparing").length
    const packed = orders.filter(o => o.orderStatus === "Packed").length
    const outForDelivery = orders.filter(o => o.orderStatus === "Out For Delivery" || o.orderStatus === "Out with Courier" || o.status === "Out for Delivery").length
    const delivered = orders.filter(o => o.orderStatus === "Delivered").length
    const cancelled = orders.filter(o => o.orderStatus === "Cancelled" || o.orderStatus === "canceled" || o.status === "Cancelled" || o.status === "canceled").length;
    
    let revenueToday = 0;
    let todayOrdersCount = todayOrders.length;
    todayOrders.forEach(o => {
      revenueToday += (o.amount || 250); // Default to 250 if no amount
    });
    
    const avgOrderValue = todayOrdersCount > 0 ? revenueToday / todayOrdersCount : 0;
    
    return {
      total,
      today: todayOrders.length,
      revenueToday,
      avgOrderValue,
      pending,
      preparing,
      packed,
      outForDelivery,
      delivered,
      cancelled,
      todayRevenue
    }
  }, [orders])

  // Filter & Search Logic
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // 1. Search Query
      const matchesSearch = 
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.orderId && o.orderId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (o.customerName && o.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (o.customerPhone && o.customerPhone.includes(searchQuery))

      if (!matchesSearch) return false

      // 2. Status Filter
      if (statusFilter !== "All") {
        const oStatus = o.orderStatus || o.status || "";
        if (statusFilter === "Out For Delivery") {
          if (oStatus !== "Out For Delivery" && oStatus !== "Out with Courier" && oStatus !== "Out for Delivery") return false;
        } else if (statusFilter === "Cancelled") {
          if (oStatus !== "Cancelled" && oStatus !== "canceled" && oStatus !== "Canceled") return false;
        } else {
          if (oStatus !== statusFilter) return false;
        }
      }

      // 3. Payment Filter
      if (paymentFilter !== "All" && o.paymentStatus !== paymentFilter) return false

      // 4. Area Filter
      if (areaFilter !== "All" && o.deliveryArea !== areaFilter) return false

      // 5. Driver Filter
      if (driverFilter !== "All" && o.driverName !== driverFilter) return false

      // 6. Plan Filter
      if (planFilter !== "All" && o.planName !== planFilter) return false

      // 7. Slot Filter
      if (slotFilter !== "All" && o.deliverySlot && !o.deliverySlot.includes(slotFilter)) return false

      // 8. Time Filters
      if (timeFilter === "Today") {
        const todayStr = new Date().toISOString().substring(0, 10)
        const createdStr = o.createdAt ? o.createdAt.substring(0, 10) : ''
        if (createdStr !== todayStr) return false
      } else if (timeFilter === "Tomorrow") {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const tomorrowStr = tomorrow.toISOString().substring(0, 10)
        const createdStr = o.createdAt ? o.createdAt.substring(0, 10) : ''
        if (createdStr !== tomorrowStr) return false
      } else if (timeFilter === "Range") {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0); // Normalize to start of day
          const created = o.createdAt ? new Date(o.createdAt) : null;
          if (created) {
            const createdDate = new Date(created);
            createdDate.setHours(0, 0, 0, 0); // Normalize created date to start of day
            if (createdDate < start) return false;
          }
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999); // include whole day
          const created = o.createdAt ? new Date(o.createdAt) : null;
          if (created && created > end) return false;
        }
      }

      return true
    })
  }, [orders, searchQuery, statusFilter, paymentFilter, areaFilter, driverFilter, planFilter, slotFilter, timeFilter, startDate, endDate])

  // Get unique lists for filter dropdowns
  const uniqueAreas = useMemo(() => {
    const areas = orders.map(o => o.deliveryArea).filter(Boolean)
    return Array.from(new Set(areas)) as string[]
  }, [orders])

  const uniqueDrivers = useMemo(() => {
    const driversList = orders.map(o => o.driverName).filter(Boolean)
    return Array.from(new Set(driversList)) as string[]
  }, [orders])

  const uniquePlans = useMemo(() => {
    const plans = orders.map(o => o.planName).filter(Boolean)
    return Array.from(new Set(plans)) as string[]
  }, [orders])

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("")
    setStatusFilter("All")
    setPaymentFilter("All")
    setAreaFilter("All")
    setDriverFilter("All")
    setPlanFilter("All")
    setSlotFilter("All")
    setTimeFilter("All")
    setStartDate("")
    setEndDate("")
  }

  // Row Selection logic
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(filteredOrders.map(o => o.id))
    } else {
      setSelectedOrderIds([])
    }
  }

  const handleSelectRow = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(prev => [...prev, orderId])
    } else {
      setSelectedOrderIds(prev => prev.filter(id => id !== orderId))
    }
  }

  // Status Colors styling helper
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "Pending":
        return "bg-zinc-800 text-zinc-300 border-zinc-700"
      case "Confirmed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      case "Preparing":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "Packed":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "Out For Delivery":
      case "Out with Courier":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
      case "Delivered":
        return "bg-teal-500/10 text-teal-400 border-teal-500/20 animate-pulse"
      case "Cancelled":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20"
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700"
    }
  }

  // Payment Colors styling helper
  const getPaymentColor = (pStatus: string | undefined) => {
    switch (pStatus) {
      case "Paid":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      case "Pending":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "Failed":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20"
      default:
        return "bg-zinc-800 text-zinc-300 border-zinc-700"
    }
  }

  // Open Edit Dialog
  const handleOpenEdit = (order: Order) => {
    setEditingOrder(order)
    setEditFormData({
      customerName: order.customerName || "",
      customerPhone: order.customerPhone || "",
      deliveryAddress: order.deliveryAddress || "",
      deliveryArea: order.deliveryArea || "",
      deliverySlot: order.deliverySlot || "",
      paymentStatus: order.paymentStatus || "Pending"
    })
  }

  // Save Edit Order
  const handleSaveEdit = async () => {
    if (!editingOrder || !user) return
    try {
      setLoading(true)
      
      await orderService.updateOrder(editingOrder.id, editFormData, user.id, user.email)

      setEditingOrder(null)
    } catch (err: any) {
      alert("Error saving edits: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Open Assign Driver Dialog
  const handleOpenAssignDriver = (order: Order) => {
    setAssigningOrder(order)
    setSelectedDriverId(order.driverId || "")
    setAssignRoute(order.deliveryArea || "")
    setEstDeliveryTime("")
  }

  // Save Driver Assignment
  const handleSaveDriver = async () => {
    if (!assigningOrder || !user) return
    const matchedDriver = drivers.find(d => d.id === selectedDriverId)
    const driverName = matchedDriver ? matchedDriver.name : "Assigned Driver"
    
    try {
      setLoading(true)
      await orderService.assignDriver(
        assigningOrder.id,
        selectedDriverId,
        driverName,
        matchedDriver?.routeId || "route-gen",
        assignRoute || "Assigned Area",
        estDeliveryTime || "30 mins",
        user.id,
        user.email
      )
      setAssigningOrder(null)
    } catch (err: any) {
      alert("Error assigning driver: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Cancel Order action
  const handleCancelOrder = async (orderId: string) => {
    if (!user) return
    if (confirm("Are you sure you want to cancel this order?")) {
      try {
        setLoading(true)
        await orderService.updateOrderStatus(orderId, "Cancelled", user.id, user.email)
      } catch (err: any) {
        alert("Error cancelling order: " + err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  // Bulk status update
  const handleBulkStatusChange = async () => {
    if (!bulkStatusToChange || !user || selectedOrderIds.length === 0) return
    try {
      setLoading(true)
      await orderService.bulkUpdateStatus(selectedOrderIds, bulkStatusToChange, user.id, user.email)
      setBulkShowStatusModal(false)
      setSelectedOrderIds([])
      setBulkStatusToChange("")
    } catch (err: any) {
      alert("Bulk status change failed: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Bulk driver assignment
  const handleBulkDriverChange = async () => {
    if (!bulkDriverToAssign || !user || selectedOrderIds.length === 0) return
    const matchedDriver = drivers.find(d => d.id === bulkDriverToAssign)
    const driverName = matchedDriver ? matchedDriver.name : "Driver"

    try {
      setLoading(true)
      await orderService.bulkAssignDriver(selectedOrderIds, bulkDriverToAssign, driverName, user.id, user.email)
      setBulkShowDriverModal(false)
      setSelectedOrderIds([])
      setBulkDriverToAssign("")
    } catch (err: any) {
      alert("Bulk driver assignment failed: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Bulk print invoices
  const handleBulkPrintInvoices = () => {
    if (selectedOrderIds.length === 0) return
    // Simple custom formatting for multiple printing
    const printableContent = selectedOrderIds.map(id => {
      const order = orders.find(o => o.id === id)
      if (!order) return ''
      return `
        <div style="font-family: sans-serif; padding: 40px; border-bottom: 2px dashed #000; page-break-after: always; color: #000; background: #fff;">
          <h2 style="color: #059669; margin-bottom: 5px;">TAAZA BITES INVOICE</h2>
          <p style="margin: 2px 0;">Order ID: ${order.orderId || order.id.substring(0,8)}</p>
          <p style="margin: 2px 0;">Date: ${order.createdAt ? new Date(order.createdAt).toLocaleString() : new Date().toLocaleDateString()}</p>
          <hr style="border: 1px solid #ddd; margin: 15px 0;" />
          <h3>CUSTOMER DETAILS</h3>
          <p><strong>Name:</strong> ${order.customerName || 'N/A'}</p>
          <p><strong>Phone:</strong> ${order.customerPhone || 'N/A'}</p>
          <p><strong>Address:</strong> ${order.deliveryAddress || 'N/A'}</p>
          <hr style="border: 1px solid #ddd; margin: 15px 0;" />
          <h3>MEAL DETAILS</h3>
          <p><strong>Plan Name:</strong> ${order.planName || 'Healthy Diet'}</p>
          <p><strong>Meal Name:</strong> ${order.mealName || 'Fresh Wrap'}</p>
          <p><strong>Delivery Slot:</strong> ${order.deliverySlot || 'Lunch'}</p>
          <p><strong>Special Instructions:</strong> ${order.specialInstructions || 'None'}</p>
          <hr style="border: 1px solid #ddd; margin: 15px 0;" />
          <h3 style="text-align: right;">Total Paid: ₹199.00 (${order.paymentStatus})</h3>
        </div>
      `
    }).join('')

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`<html><head><title>Print Invoices</title></head><body>${printableContent}</body></html>`)
      printWindow.document.close()
      printWindow.print()
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    const ordersToExport = selectedOrderIds.length > 0 
      ? orders.filter(o => selectedOrderIds.includes(o.id))
      : filteredOrders

    if (ordersToExport.length === 0) {
      alert("No orders to export")
      return
    }

    const headers = ["Order ID", "Customer Name", "Phone", "Subscription Plan", "Meal", "Delivery Area", "Slot", "Payment", "Status", "Driver"]
    const rows = ordersToExport.map(o => [
      o.orderId || o.id,
      o.customerName || '',
      o.customerPhone || '',
      o.planName || '',
      o.mealName || '',
      o.deliveryArea || '',
      o.deliverySlot || '',
      o.paymentStatus || '',
      o.orderStatus || '',
      o.driverName || ''
    ])

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `taazabites_orders_${new Date().toISOString().substring(0,10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Single order Print Invoice
  const triggerSinglePrint = (order: Order) => {
    const printableContent = `
      <div style="font-family: sans-serif; padding: 40px; color: #000; background: #fff; max-width: 600px; margin: 0 auto; border: 1px solid #eee;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #10b981; margin: 0; font-size: 28px;">Taaza Bites</h2>
          <p style="color: #666; margin: 5px 0;">Fresh & Natural Meal Subscriptions</p>
        </div>
        <div style="border-bottom: 2px solid #eee; padding-bottom: 15px; margin-bottom: 15px;">
          <p><strong>Invoice ID:</strong> TZ-INV-${order.orderId || order.id.substring(0,6)}</p>
          <p><strong>Order ID:</strong> ${order.orderId || order.id}</p>
          <p><strong>Date:</strong> ${order.createdAt ? new Date(order.createdAt).toLocaleString() : new Date().toLocaleString()}</p>
          <p><strong>Payment Status:</strong> <span style="color: green; font-weight: bold;">${order.paymentStatus}</span></p>
        </div>
        <div style="margin-bottom: 20px;">
          <h4 style="margin: 0 0 8px 0; color: #333;">DELIVERY TO</h4>
          <p style="margin: 2px 0;"><strong>Customer:</strong> ${order.customerName}</p>
          <p style="margin: 2px 0;"><strong>Phone:</strong> ${order.customerPhone}</p>
          <p style="margin: 2px 0;"><strong>Address:</strong> ${order.deliveryAddress}</p>
          <p style="margin: 2px 0;"><strong>Area:</strong> ${order.deliveryArea}</p>
        </div>
        <div style="margin-bottom: 20px; background: #f9f9f9; padding: 15px; rounded: 8px;">
          <h4 style="margin: 0 0 8px 0; color: #333;">ORDER DETAILS</h4>
          <p style="margin: 4px 0;"><strong>Subscription Plan:</strong> ${order.planName}</p>
          <p style="margin: 4px 0;"><strong>Meal Ordered:</strong> ${order.mealName}</p>
          <p style="margin: 4px 0;"><strong>Delivery Slot:</strong> ${order.deliverySlot}</p>
          <p style="margin: 4px 0;"><strong>Special Instructions:</strong> ${order.specialInstructions || 'None'}</p>
        </div>
        <div style="border-top: 2px solid #eee; padding-top: 15px; text-align: right;">
          <h3 style="margin: 0;">Total Amount Paid: ₹199.00</h3>
          <p style="color: #888; font-size: 12px; margin-top: 5px;">Thank you for ordering with Taaza Bites!</p>
        </div>
      </div>
    `
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`<html><head><title>Print Invoice</title></head><body>${printableContent}</body></html>`)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }

  // Workflows stages definition for timeline visualization
  const workflowStages = [
    { label: "Pending", detail: "Awaiting Confirmation", icon: Clock },
    { label: "Confirmed", detail: "Accepted by Restaurant", icon: CheckCircle },
    { label: "Preparing", detail: "Cooking in Kitchen", icon: ChefHat },
    { label: "Packed", detail: "Order Packed & Sealed", icon: Inbox },
    { label: "Out For Delivery", detail: "Out with Partner", icon: Truck },
    { label: "Delivered", detail: "Delivered Safely", icon: Check }
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Page Title & Live Sync Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">Order Management</h1>
            <HeartbeatIndicator />
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1.5 py-0.5 px-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync Active
            </Badge>
          </div>
          <p className="text-zinc-500 mt-1">Monitor, edit, assign drivers, and manage real-time statuses of Taaza Bites order queues.</p>
        </div>

        {/* Top bar controls */}
        <div className="flex flex-wrap gap-2">
          {orders.length === 0 && (
            <Button 
              onClick={handleSeedOrders}
              className="bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-semibold"
            >
              <Sparkles className="mr-2 h-4 w-4 text-zinc-950" />
              Seed Sample Orders
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => setOrders([])}
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
          >
            Clear List
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>
      
      <OrdersTabs />

      {/* ERROR DISPLAY */}
      {error && (
        <Card className="bg-rose-500/10 border-rose-500/20 text-rose-400 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">{error}</p>
        </Card>
      )}

      {/* DASHBOARD STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 border-zinc-900 shadow-md p-5 hover:border-emerald-500/20 transition-all group duration-300">
          <div className="flex justify-between items-start">
            <p className="text-xs text-zinc-400 font-semibold tracking-wider uppercase font-mono">Today's Revenue</p>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-emerald-400 mt-2 tracking-tight group-hover:scale-[1.01] transition-transform">₹{stats.revenueToday}</p>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono">Real-time earnings</p>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 border-zinc-900 shadow-md p-5 hover:border-emerald-500/20 transition-all group duration-300">
          <div className="flex justify-between items-start">
            <p className="text-xs text-zinc-400 font-semibold tracking-wider uppercase font-mono">Today's Orders</p>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mt-2 tracking-tight group-hover:scale-[1.01] transition-transform">{stats.today}</p>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live order activity
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 border-zinc-900 shadow-md p-5 hover:border-emerald-500/20 transition-all group duration-300">
          <div className="flex justify-between items-start">
            <p className="text-xs text-zinc-400 font-semibold tracking-wider uppercase font-mono">Avg Order Value</p>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mt-2 tracking-tight group-hover:scale-[1.01] transition-transform">₹{stats.avgOrderValue.toFixed(0)}</p>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono">Daily order average</p>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 border-zinc-900 shadow-md p-5 hover:border-emerald-500/20 transition-all group duration-300">
          <div className="flex justify-between items-start">
            <p className="text-xs text-zinc-400 font-semibold tracking-wider uppercase font-mono">Total Orders</p>
            <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400">
              <ClipboardList className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mt-2 tracking-tight group-hover:scale-[1.01] transition-transform">{stats.total}</p>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono">Historical volume</p>
        </Card>
      </div>

      {/* QUEUE STATUS CONTROL HUB (STATUS TABS) */}
      <div>
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-3.5 font-mono">Queue Status Hub</p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {[
            { id: "All", label: "All Orders", count: stats.total, icon: ClipboardList, color: "text-zinc-400", border: "border-zinc-800", activeBg: "bg-zinc-900 text-white border-zinc-700 shadow-md" },
            { id: "Pending", label: "Pending Queue", count: stats.pending, icon: Clock, color: "text-amber-500", border: "border-amber-950/30", activeBg: "bg-amber-950/20 text-amber-400 border-amber-500/30 shadow-sm" },
            { id: "Preparing", label: "In Kitchen", count: stats.preparing, icon: ChefHat, color: "text-orange-500", border: "border-orange-950/30", activeBg: "bg-orange-950/20 text-orange-400 border-orange-500/30 shadow-sm" },
            { id: "Packed", label: "Packed & Sealed", count: stats.packed, icon: Inbox, color: "text-blue-500", border: "border-blue-950/30", activeBg: "bg-blue-950/20 text-blue-400 border-blue-500/30 shadow-sm" },
            { id: "Out For Delivery", label: "On the Road", count: stats.outForDelivery, icon: Truck, color: "text-indigo-500", border: "border-indigo-950/30", activeBg: "bg-indigo-950/20 text-indigo-400 border-indigo-500/30 shadow-sm" },
            { id: "Delivered", label: "Delivered Safely", count: stats.delivered, icon: CheckCircle, color: "text-emerald-500", border: "border-emerald-950/30", activeBg: "bg-emerald-950/20 text-emerald-400 border-emerald-500/30 shadow-sm" },
            { id: "Cancelled", label: "Cancelled", count: stats.cancelled, icon: Trash2, color: "text-rose-500", border: "border-rose-950/30", activeBg: "bg-rose-950/20 text-rose-400 border-rose-500/30 shadow-sm" }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  const routeMap: Record<string, string> = {
                    "All": "/orders",
                    "Pending": "/orders/pending",
                    "Preparing": "/orders/preparing",
                    "Packed": "/orders/packed",
                    "Out For Delivery": "/orders/delivery",
                    "Delivered": "/orders/delivered",
                    "Cancelled": "/orders/cancelled"
                  }
                  navigate(routeMap[tab.id] || "/orders")
                }}
                className={`flex flex-col items-start gap-1 p-3.5 rounded-xl border text-left transition-all duration-250 cursor-pointer w-full relative overflow-hidden select-none group ${
                  isActive 
                    ? `${tab.activeBg} ring-1 ring-emerald-500/10` 
                    : `bg-zinc-950/20 border-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-900/40 hover:border-zinc-800`
                }`}
                style={{ minHeight: "84px" }}
              >
                <div className="flex items-center justify-between w-full">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-current animate-pulse' : tab.color} transition-transform group-hover:scale-110 duration-250`} />
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                    isActive 
                      ? 'bg-zinc-950 text-white border border-zinc-800' 
                      : 'bg-zinc-900/50 text-zinc-400 border border-zinc-900'
                  }`}>
                    {tab.count}
                  </span>
                </div>
                <div className="mt-2 leading-none">
                  <p className="text-xs font-semibold tracking-tight">{tab.label}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* FILTER & SEARCH MANAGEMENT BAR */}
      <Card className="bg-zinc-950/30 border-zinc-900 p-4 space-y-4 rounded-tl-none">
        
        {/* Row 1: Search & Time quick filters */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="Search by Order ID, Customer, Phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-zinc-900/50 border-zinc-800/80 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500"
            />
          </div>

          {/* Time Quick Filter buttons */}
          <div className="flex items-center gap-1.5 self-start lg:self-center overflow-x-auto pb-1 lg:pb-0">
            <Button
              variant={timeFilter === "All" ? "secondary" : "outline"}
              onClick={() => setTimeFilter("All")}
              size="sm"
              className={timeFilter === "All" ? "bg-zinc-800 text-white border-zinc-700" : "border-zinc-800 text-zinc-400 hover:text-white"}
            >
              All Time
            </Button>
            <Button
              variant={timeFilter === "Today" ? "secondary" : "outline"}
              onClick={() => setTimeFilter("Today")}
              size="sm"
              className={timeFilter === "Today" ? "bg-zinc-800 text-white border-zinc-700" : "border-zinc-800 text-zinc-400 hover:text-white"}
            >
              Today
            </Button>
            <Button
              variant={timeFilter === "Tomorrow" ? "secondary" : "outline"}
              onClick={() => setTimeFilter("Tomorrow")}
              size="sm"
              className={timeFilter === "Tomorrow" ? "bg-zinc-800 text-white border-zinc-700" : "border-zinc-800 text-zinc-400 hover:text-white"}
            >
              Tomorrow
            </Button>
            <Button
              variant={timeFilter === "Range" ? "secondary" : "outline"}
              onClick={() => setTimeFilter("Range")}
              size="sm"
              className={timeFilter === "Range" ? "bg-zinc-800 text-white border-zinc-700" : "border-zinc-800 text-zinc-400 hover:text-white"}
            >
              Custom Range
            </Button>
          </div>
        </div>

        {/* Date range picker - visible when custom range is active */}
        {timeFilter === "Range" && (
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/60 animate-in slide-in-from-top-1 duration-200">
            <div className="w-full sm:w-auto">
              <label className="text-xs text-zinc-400 block mb-1">Start Date</label>
              <Input 
                type="date" 
                value={startDate} 
                onChange={(e) => {
                  setStartDate(e.target.value);
                  console.log("Start Date changed:", e.target.value);
                }}
                className="bg-zinc-950 border-zinc-800 text-white text-xs h-9"
              />
            </div>
            <div className="w-full sm:w-auto">
              <label className="text-xs text-zinc-400 block mb-1">End Date</label>
              <Input 
                type="date" 
                value={endDate} 
                onChange={(e) => {
                  setEndDate(e.target.value);
                  console.log("End Date changed:", e.target.value);
                }}
                className="bg-zinc-950 border-zinc-800 text-white text-xs h-9"
              />
            </div>
          </div>
        )}

        {/* Row 2: Advanced filters */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-zinc-900">
          <div>
            <label className="text-xs text-zinc-500 font-semibold uppercase block mb-1.5">Payment</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-md py-1.5 px-2.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Payments</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-zinc-500 font-semibold uppercase block mb-1.5">Area</label>
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-md py-1.5 px-2.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Areas</option>
              {uniqueAreas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-zinc-500 font-semibold uppercase block mb-1.5">Driver</label>
            <select
              value={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-md py-1.5 px-2.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Drivers</option>
              {uniqueDrivers.map(dr => (
                <option key={dr} value={dr}>{dr}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-zinc-500 font-semibold uppercase block mb-1.5">Meal Plan</label>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-md py-1.5 px-2.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Plans</option>
              {uniquePlans.map(plan => (
                <option key={plan} value={plan}>{plan}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-zinc-500 font-semibold uppercase block mb-1.5">Delivery Slot</label>
            <select
              value={slotFilter}
              onChange={(e) => setSlotFilter(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-md py-1.5 px-2.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Slots</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
            </select>
          </div>
        </div>

        {/* Clear Filters bar */}
        <div className="flex justify-between items-center pt-2">
          <p className="text-xs text-zinc-500">
            Showing <strong className="text-zinc-300">{Math.min(filteredOrders.length, itemsPerPage)}</strong> of {filteredOrders.length} orders
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleResetFilters} 
            className="text-emerald-500 hover:text-emerald-400 text-xs p-0 h-auto"
          >
            Reset Filters
          </Button>
        </div>

      </Card>

      {/* BULK ACTIONS TOOLBAR */}
      {selectedOrderIds.length > 0 && (
        <Card className="bg-emerald-950/20 border-emerald-900/60 p-3 flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-2 duration-300 shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <p className="text-sm font-semibold text-white">
              {selectedOrderIds.length} orders selected
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBulkShowStatusModal(true)}
              className="border-emerald-900/40 text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/60"
            >
              Bulk Change Status
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBulkShowDriverModal(true)}
              className="border-emerald-900/40 text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/60"
            >
              Bulk Assign Driver
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkPrintInvoices}
              className="border-emerald-900/40 text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/60"
            >
              <Printer className="h-4 w-4 mr-1.5" />
              Bulk Print Invoices
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportCSV}
              className="border-emerald-900/40 text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/60"
            >
              <Download className="h-4 w-4 mr-1.5" />
              Bulk Export CSV
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedOrderIds([])}
              className="text-zinc-400 hover:text-white"
            >
              Clear
            </Button>
          </div>
        </Card>
      )}

      {/* ORDERS MAIN TABLE */}
      <Card className="bg-zinc-950/50 backdrop-blur-xl border-zinc-800/60 shadow-xl overflow-hidden rounded-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-400 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <p className="text-sm">Loading live queue from Firestore...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            icon="search"
            title="No orders found"
            description="Try adjusting your filters or search terms. If you don't have any orders, you can seed sample data."
            action={
              orders.length === 0 && (
                <Button 
                  onClick={handleSeedOrders}
                  size="lg"
                  className="font-semibold shadow-md shadow-primary/20"
                >
                  Seed 10 Sample Orders
                </Button>
              )
            }
          />
        ) : (
          <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-900/40 border-b border-zinc-800/60">
                <TableRow>
                  <TableHead className="w-[50px] text-center">
                    <input 
                      type="checkbox"
                      checked={selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer h-4 w-4"
                    />
                  </TableHead>
                  <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider">Order ID</TableHead>
                  <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider">Customer</TableHead>
                  <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider">Subscription Plan & Meal</TableHead>
                  <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider">Date & Slot</TableHead>
                  <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider">Delivery Area</TableHead>
                  <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider">Payment Status</TableHead>
                  <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider">Order Status</TableHead>
                  <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider">Assigned Driver</TableHead>
                  <TableHead className="text-zinc-400 font-bold text-xs uppercase tracking-wider text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-zinc-900">
                {filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((order) => (
                  <TableRow 
                    key={order.id} 
                    className="hover:bg-zinc-900/30 transition-colors border-b border-zinc-900"
                  >
                    <TableCell className="text-center">
                      <input 
                        type="checkbox"
                        checked={selectedOrderIds.includes(order.id)}
                        onChange={(e) => handleSelectRow(order.id, e.target.checked)}
                        className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer h-4 w-4"
                      />
                    </TableCell>

                    {/* Order ID */}
                    <TableCell className="font-mono text-xs font-semibold text-white">
                      {order.orderId || order.id.substring(0,8)}
                    </TableCell>

                    {/* Customer */}
                    <TableCell>
                      <div className="font-medium text-white text-sm">{order.customerName || "N/A"}</div>
                      <div className="text-zinc-500 text-xs mt-0.5">{order.customerPhone || "N/A"}</div>
                    </TableCell>

                    {/* Meal / Plan */}
                    <TableCell>
                      <div className="text-zinc-300 font-medium text-xs">{order.planName || "N/A"}</div>
                      <div className="text-emerald-400/80 text-xs mt-0.5 font-medium">{order.mealName || "N/A"}</div>
                    </TableCell>

                    {/* Date / Slot */}
                    <TableCell>
                      <div className="text-zinc-300 text-xs font-medium">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Today'}
                      </div>
                      <div className="mt-1">
                        <Badge variant="outline" className={
                          (order.deliverySlot || "Standard").toLowerCase().includes('breakfast') || (order.deliverySlot || "Standard").toLowerCase().includes('morning') ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px] uppercase font-semibold py-0.5 px-1.5' :
                          (order.deliverySlot || "Standard").toLowerCase().includes('lunch') || (order.deliverySlot || "Standard").toLowerCase().includes('afternoon') ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 text-[9px] uppercase font-semibold py-0.5 px-1.5' :
                          'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[9px] uppercase font-semibold py-0.5 px-1.5'
                        }>
                          {order.deliverySlot || "Standard"}
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Area */}
                    <TableCell className="text-zinc-300 text-xs">
                      {order.deliveryArea || "N/A"}
                    </TableCell>

                    {/* Payment Status */}
                    <TableCell>
                      <Badge variant="outline" className={`${getPaymentColor(order.paymentStatus)} text-[10px] font-bold py-0.5 px-2`}>
                        {order.paymentStatus || "Pending"}
                      </Badge>
                    </TableCell>

                    {/* Order Status */}
                    <TableCell>
                      <Badge variant="outline" className={`${getStatusColor(order.orderStatus)} text-[10px] font-bold py-0.5 px-2`}>
                        {order.orderStatus || "Pending"}
                      </Badge>
                    </TableCell>

                    {/* Assigned Driver */}
                    <TableCell>
                      {order.driverName ? (
                        <div className="flex items-center gap-1 text-zinc-300 text-xs font-medium">
                          <Truck className="h-3.5 w-3.5 text-zinc-500" />
                          {order.driverName}
                        </div>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleOpenAssignDriver(order)}
                          className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/5 text-xs p-0 h-auto"
                        >
                          <UserPlus className="h-3.5 w-3.5 mr-1" />
                          Assign Driver
                        </Button>
                      )}
                    </TableCell>

                    {/* Actions dropdown/menu */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          title="View Order"
                          onClick={() => setViewingOrder(order)}
                          className="h-7 w-7 text-zinc-400 hover:text-white"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Edit Order"
                          onClick={() => handleOpenEdit(order)}
                          className="h-7 w-7 text-zinc-400 hover:text-white"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Print Invoice"
                          onClick={() => triggerSinglePrint(order)}
                          className="h-7 w-7 text-zinc-400 hover:text-white"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Cancel Order"
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={order.orderStatus === "Cancelled" || order.orderStatus === "Delivered"}
                          className="h-7 w-7 text-zinc-400 hover:text-rose-400 disabled:opacity-30"
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
          
          {/* Pagination Controls */}
          {filteredOrders.length > itemsPerPage && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
              <div className="text-sm text-zinc-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} entries
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredOrders.length / itemsPerPage)))}
                  disabled={currentPage >= Math.ceil(filteredOrders.length / itemsPerPage)}
                  className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
          </>
        )}
      </Card>


      {/* VIEW ORDER DETAILS MODAL */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-900 p-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Order Details: {viewingOrder.orderId || viewingOrder.id.substring(0,8)}
                </h3>
                <p className="text-zinc-500 text-xs mt-1">
                  Placed on {viewingOrder.createdAt ? new Date(viewingOrder.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setViewingOrder(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">

              {/* Status Workflow Indicator Steps (Horizontal/Vertical Timeline) */}
              <div className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-lg space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Status Workflow Timeline</h4>
                
                {viewingOrder.orderStatus === "Cancelled" ? (
                  <div className="bg-rose-950/20 border border-rose-900/50 p-4 rounded-md text-rose-400 flex items-center gap-3">
                    <X className="h-5 w-5 bg-rose-500 text-zinc-950 rounded-full p-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Order Cancelled</p>
                      <p className="text-xs text-rose-500/80 mt-0.5">This order has been cancelled and flagged. No further action can be taken.</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2">
                    {/* Horizontal Connector Line for desktop */}
                    <div className="hidden md:block absolute top-[18px] left-[5%] right-[5%] h-0.5 bg-zinc-800 -z-10" />

                    {workflowStages.map((stage, index) => {
                      // Calculate active step
                      const currentStatusIndex = workflowStages.findIndex(s => s.label === viewingOrder.orderStatus)
                      const isCompleted = index <= currentStatusIndex
                      const isActive = index === currentStatusIndex

                      return (
                        <div key={stage.label} className="flex md:flex-col items-center gap-3 md:text-center flex-1 relative z-10 w-full">
                          
                          {/* Circle Icon */}
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all ${
                            isCompleted 
                              ? "bg-emerald-500 border-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/10" 
                              : "bg-zinc-950 border-zinc-800 text-zinc-500"
                          } ${isActive ? "ring-4 ring-emerald-500/10 scale-110" : ""}`}>
                            <stage.icon className="h-4 w-4" />
                          </div>

                          <div className="md:mt-2 text-left md:text-center">
                            <p className={`text-xs font-bold ${isCompleted ? "text-white" : "text-zinc-500"}`}>
                              {stage.label}
                            </p>
                            <p className="text-[10px] text-zinc-500 hidden md:block mt-0.5">
                              {stage.detail}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Grid content */}
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Left Column: Customer & Delivery Info */}
                <div className="space-y-4">
                  
                  {/* Customer Block */}
                  <div className="border border-zinc-900 rounded-lg p-4 bg-zinc-900/10">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-3 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      Customer Information
                    </h5>
                    <div className="space-y-2 text-sm text-zinc-300">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Name:</span>
                        <span className="font-semibold text-white">{viewingOrder.customerName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Phone:</span>
                        <span className="font-semibold text-white">{viewingOrder.customerPhone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Email:</span>
                        <span className="text-zinc-300">{viewingOrder.customerId === 'cust-101' ? 'rahul@gmail.com' : 'client@taazabites.com'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Details Block */}
                  <div className="border border-zinc-900 rounded-lg p-4 bg-zinc-900/10">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-3 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      Delivery Details
                    </h5>
                    <div className="space-y-2 text-sm text-zinc-300">
                      <div>
                        <span className="text-zinc-500 block mb-0.5">Delivery Address:</span>
                        <span className="text-white font-medium">{viewingOrder.deliveryAddress}</span>
                      </div>
                      <div className="flex justify-between mt-2 pt-2 border-t border-zinc-900/60">
                        <span className="text-zinc-500">Delivery Area:</span>
                        <span className="font-semibold text-white">{viewingOrder.deliveryArea || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">Delivery Slot:</span>
                        <Badge variant="outline" className={
                          (viewingOrder.deliverySlot || "Standard").toLowerCase().includes('breakfast') || (viewingOrder.deliverySlot || "Standard").toLowerCase().includes('morning') ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] font-semibold uppercase' :
                          (viewingOrder.deliverySlot || "Standard").toLowerCase().includes('lunch') || (viewingOrder.deliverySlot || "Standard").toLowerCase().includes('afternoon') ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 text-[10px] font-semibold uppercase' :
                          'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px] font-semibold uppercase'
                        }>
                          {viewingOrder.deliverySlot || 'Standard'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Column: Meal, Subscription, and Payments */}
                <div className="space-y-4">
                  
                  {/* Meal details */}
                  <div className="border border-zinc-900 rounded-lg p-4 bg-zinc-900/10">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-3 flex items-center gap-1.5">
                      <ChefHat className="h-3.5 w-3.5" />
                      Meal & Subscription Details
                    </h5>
                    <div className="space-y-2 text-sm text-zinc-300">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Subscription ID:</span>
                        <span className="font-mono text-zinc-400 text-xs">{viewingOrder.subscriptionId || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Plan Tier Name:</span>
                        <span className="font-semibold text-white">{viewingOrder.planName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Meal Ordered:</span>
                        <span className="font-semibold text-emerald-400">{viewingOrder.mealName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block mb-0.5">Special Instructions:</span>
                        <p className="text-xs text-zinc-400 italic bg-zinc-950 p-2 rounded border border-zinc-900">
                          {viewingOrder.specialInstructions || 'No special instructions given.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment & Logistics */}
                  <div className="border border-zinc-900 rounded-lg p-4 bg-zinc-900/10">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-3 flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5" />
                      Logistics & Payment Details
                    </h5>
                    <div className="space-y-2 text-sm text-zinc-300">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Assigned Driver:</span>
                        <span className="font-semibold text-white">{viewingOrder.driverName || 'None'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Driver ID:</span>
                        <span className="font-mono text-zinc-500 text-xs">{viewingOrder.driverId || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-zinc-900/60">
                        <span className="text-zinc-500">Payment Status:</span>
                        <Badge variant="outline" className={getPaymentColor(viewingOrder.paymentStatus)}>
                          {viewingOrder.paymentStatus}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Estimated Total Paid:</span>
                        <span className="font-semibold text-white">₹199.00 INR</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* NOTIFICATION TRIGGERS LOG ARCHITECTURE */}
              <div className="border border-zinc-900 rounded-lg p-5 bg-zinc-950/40">
                <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-4 flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4" />
                  Prepared Notification Logs (Real-time architecture)
                </h5>
                {orderNotificationLogs.length === 0 ? (
                  <p className="text-xs text-zinc-600 italic">No notifications have been generated for this order yet. Upgrade order status to trigger WhatsApp, Push and Email channels.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {orderNotificationLogs.map((log, idx) => (
                      <div key={idx} className="bg-zinc-900/40 border border-zinc-900 p-3 rounded-lg flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2 pb-1 border-b border-zinc-800">
                          <span className="text-xs font-bold text-white flex items-center gap-1">
                            {log.channel === "WhatsApp" && <MessageSquare className="h-3 w-3 text-emerald-400" />}
                            {log.channel === "Push" && <Smartphone className="h-3 w-3 text-indigo-400" />}
                            {log.channel === "Email" && <Mail className="h-3 w-3 text-amber-400" />}
                            {log.channel}
                          </span>
                          <span className="text-[10px] text-zinc-500">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Just Now'}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">{log.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-between border-t border-zinc-900 p-6 bg-zinc-900/10">
              <div className="flex gap-2">
                {viewingOrder.orderStatus !== "Cancelled" && viewingOrder.orderStatus !== "Delivered" && (
                  <Button
                    onClick={() => {
                      handleOpenEdit(viewingOrder)
                      setViewingOrder(null)
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-semibold"
                  >
                    Edit Order
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    handleOpenAssignDriver(viewingOrder)
                    setViewingOrder(null)
                  }}
                  className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                >
                  Change Driver
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => triggerSinglePrint(viewingOrder)}
                  className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Invoice
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setViewingOrder(null)}
                  className="border-zinc-800 text-zinc-400 hover:text-white"
                >
                  Close
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* EDIT ORDER MODAL */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-900 p-6">
              <h3 className="text-lg font-bold text-white">Edit Order Details</h3>
              <Button variant="ghost" size="icon" onClick={() => setEditingOrder(null)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-zinc-400 font-semibold mb-1 block">Customer Name</label>
                <Input 
                  value={editFormData.customerName}
                  onChange={(e) => setEditFormData({...editFormData, customerName: e.target.value})}
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-semibold mb-1 block">Phone Number</label>
                <Input 
                  value={editFormData.customerPhone}
                  onChange={(e) => setEditFormData({...editFormData, customerPhone: e.target.value})}
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-semibold mb-1 block">Delivery Address</label>
                <Input 
                  value={editFormData.deliveryAddress}
                  onChange={(e) => setEditFormData({...editFormData, deliveryAddress: e.target.value})}
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 font-semibold mb-1 block">Delivery Area</label>
                  <select
                    value={editFormData.deliveryArea}
                    onChange={(e) => setEditFormData({...editFormData, deliveryArea: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-2 px-2.5 text-sm text-zinc-300 focus:outline-none"
                  >
                    <option value="">Select Area</option>
                    <option value="Powai">Powai</option>
                    <option value="Bandra West">Bandra West</option>
                    <option value="Juhu">Juhu</option>
                    <option value="Andheri West">Andheri West</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-semibold mb-1 block">Delivery Slot</label>
                  <select
                    value={editFormData.deliverySlot}
                    onChange={(e) => setEditFormData({...editFormData, deliverySlot: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-2 px-2.5 text-sm text-zinc-300 focus:outline-none"
                  >
                    <option value="">Select Slot</option>
                    <option value="Breakfast (8:00 AM - 10:00 AM)">Breakfast</option>
                    <option value="Lunch (12:00 PM - 2:00 PM)">Lunch</option>
                    <option value="Dinner (7:00 PM - 9:00 PM)">Dinner</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 font-semibold mb-1 block">Payment Status</label>
                  <select
                    value={editFormData.paymentStatus}
                    onChange={(e) => setEditFormData({...editFormData, paymentStatus: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-2 px-2.5 text-sm text-zinc-300 focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-semibold mb-1 block">Order Status Workflow</label>
                  <select
                    value={editingOrder.orderStatus}
                    onChange={(e) => setEditingOrder({...editingOrder, orderStatus: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-2 px-2.5 text-sm text-zinc-300 focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Packed">Packed</option>
                    <option value="Out For Delivery">Out For Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-2 border-t border-zinc-900 p-6 bg-zinc-900/10">
              <Button variant="outline" onClick={() => setEditingOrder(null)} className="border-zinc-800 text-zinc-400">
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} className="bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN DRIVER MODAL */}
      {assigningOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-900 p-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Truck className="h-5 w-5 text-emerald-400" />
                Assign Delivery Executive
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setAssigningOrder(null)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-zinc-400 font-semibold mb-1 block">Select Delivery Partner</label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => {
                    const matched = drivers.find(d => d.id === e.target.value)
                    setSelectedDriverId(e.target.value)
                    if (matched) setAssignRoute(matched.routeId.replace('route-', ''))
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-2 px-2.5 text-sm text-zinc-300 focus:outline-none"
                >
                  <option value="">Select Partner</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} ({driver.status}) - {driver.vehicle}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-semibold mb-1 block">Assign Delivery Route / Area</label>
                <Input 
                  value={assignRoute}
                  onChange={(e) => setAssignRoute(e.target.value)}
                  placeholder="e.g. Powai, Bandra West"
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-semibold mb-1 block">Estimated Delivery Time / ETA</label>
                <Input 
                  value={estDeliveryTime}
                  onChange={(e) => setEstDeliveryTime(e.target.value)}
                  placeholder="e.g. 30 minutes, 12:45 PM"
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-zinc-900 p-6 bg-zinc-900/10">
              <Button variant="outline" onClick={() => setAssigningOrder(null)} className="border-zinc-800 text-zinc-400">
                Cancel
              </Button>
              <Button onClick={handleSaveDriver} className="bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold">
                Assign & Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* BULK STATUS UPDATE MODAL */}
      {bulkShowStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-900 p-6">
              <h3 className="text-lg font-bold text-white">Bulk Change Status</h3>
              <Button variant="ghost" size="icon" onClick={() => setBulkShowStatusModal(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6">
              <label className="text-xs text-zinc-400 font-semibold mb-1 block">New Order Status Workflow</label>
              <select
                value={bulkStatusToChange}
                onChange={(e) => setBulkStatusToChange(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-2 px-2.5 text-sm text-zinc-300 focus:outline-none"
              >
                <option value="">Select Status</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Preparing">Preparing</option>
                <option value="Packed">Packed</option>
                <option value="Out For Delivery">Out For Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 border-t border-zinc-900 p-6 bg-zinc-900/10">
              <Button variant="outline" onClick={() => setBulkShowStatusModal(false)} className="border-zinc-800 text-zinc-400">
                Cancel
              </Button>
              <Button onClick={handleBulkStatusChange} className="bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold">
                Apply to {selectedOrderIds.length} Orders
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* BULK DRIVER ASSIGNMENT MODAL */}
      {bulkShowDriverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-900 p-6">
              <h3 className="text-lg font-bold text-white">Bulk Assign Drivers</h3>
              <Button variant="ghost" size="icon" onClick={() => setBulkShowDriverModal(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6">
              <label className="text-xs text-zinc-400 font-semibold mb-1 block">Select Delivery Partner</label>
              <select
                value={bulkDriverToAssign}
                onChange={(e) => setBulkDriverToAssign(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-2 px-2.5 text-sm text-zinc-300 focus:outline-none"
              >
                <option value="">Select Partner</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} ({driver.status}) - {driver.vehicle}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 border-t border-zinc-900 p-6 bg-zinc-900/10">
              <Button variant="outline" onClick={() => setBulkShowDriverModal(false)} className="border-zinc-800 text-zinc-400">
                Cancel
              </Button>
              <Button onClick={handleBulkDriverChange} className="bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold">
                Assign to {selectedOrderIds.length} Orders
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
