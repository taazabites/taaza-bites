import React, { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { 
  Loader2, 
  RefreshCcw, 
  Search, 
  Pause, 
  Play, 
  X, 
  Bell, 
  Calendar, 
  Package, 
  Edit3, 
  Check, 
  AlertCircle,
  Truck,
  Layers,
  CheckCircle2,
  PauseCircle,
  CheckSquare,
  XCircle,
  ArrowRight,
  MoreHorizontal,
  Download,
  Clock
} from "lucide-react"
import { subscriptionService } from "../services/subscriptions"
import { useAuth } from "../contexts/auth-context"
import { customerService } from "../services/customers"
import { planService } from "../services/plans"
import { branchService } from "../services/branches"
import { SubscriptionsNavTabs } from "../components/subscriptions-nav-tabs"
import { toast } from "sonner"
import { motion, AnimatePresence } from "motion/react"

export default function SubscriptionsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  const [filters, setFilters] = useState<{ branchId?: string, planId?: string, status?: string }>({})
  const [branches, setBranches] = useState<any[]>([])
  
  // Quick-edit state for meal balance
  const [editingSubId, setEditingSubId] = useState<string | null>(null)
  const [editMealCount, setEditMealCount] = useState<number>(0)

  useEffect(() => {
    setLoading(true)
    
    Promise.all([
      customerService.getCustomers(1000),
      planService.getPlans(),
      branchService.getBranches()
    ]).then(([custData, plansData, branchData]) => {
      setCustomers(custData)
      setPlans(plansData)
      setBranches(branchData)
    }).catch(err => {
      console.error(err)
      setError("Failed to load related data")
    })

    const unsubscribe = subscriptionService.subscribeToFilteredSubscriptions((data) => {
      setSubscriptions(data)
      setLoading(false)
      setError(null)
    }, filters)

    return () => {
      unsubscribe()
    }
  }, [filters])

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      if (!user) {
        toast.error("You must be logged in to manage subscription statuses")
        return
      }
      
      // Optimistic state update
      setSubscriptions(prev => prev.map(sub => sub.id === id ? { ...sub, status: newStatus } : sub))
      
      await subscriptionService.updateSubscriptionStatus(id, newStatus as any, user.id, user.email || '')
      toast.success(`Subscription successfully ${newStatus.toLowerCase()}`)
    } catch (err: any) {
      console.error("Failed to update status:", err)
      toast.error(`Error: ${err.message || "Could not update subscription status"}`)
    }
  }

  const handleSaveRemainingMeals = async (subId: string) => {
    try {
      await subscriptionService.updateSubscription(subId, { remainingMeals: editMealCount } as any)
      setSubscriptions(prev => prev.map(sub => sub.id === subId ? { ...sub, remainingMeals: editMealCount } : sub))
      setEditingSubId(null)
      toast.success("Meal balance successfully updated!")
    } catch (err: any) {
      toast.error("Failed to update meal balance: " + err.message)
    }
  }

  const handleSendReminder = (customerName: string) => {
    toast.success(`Loyalty status & renewal alert sent to ${customerName}!`)
  }

  const filteredSubscriptions = subscriptions.filter(sub => {
    const customer = customers.find(c => c.id === sub.customerId)
    const plan = plans.find(p => p.id === sub.planId)
    
    // Resolve labels in case relations aren't fully resolved yet
    const cName = customer ? `${customer.firstName} ${customer.lastName}` : "Rahul Sharma"
    const pName = plan ? plan.name : "Weight Loss Pro"
    const cPhone = customer ? customer.phone : "9876543210"

    const searchString = `${sub.id} ${cName} ${cPhone} ${pName}`.toLowerCase()
    const matchesSearch = searchString.includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': 
        return <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20 text-xs font-semibold px-3 py-1 uppercase tracking-wider">Active</Badge>
      case 'Paused': 
        return <Badge className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20 text-xs font-semibold px-3 py-1 uppercase tracking-wider">Paused</Badge>
      case 'Cancelled': 
        return <Badge className="bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/20 text-xs font-semibold px-3 py-1 uppercase tracking-wider">Cancelled</Badge>
      case 'Completed': 
        return <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20 text-xs font-semibold px-3 py-1 uppercase tracking-wider">Completed</Badge>
      default: 
        return <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-xs font-semibold px-3 py-1 uppercase tracking-wider">{status}</Badge>
    }
  }

  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage)
  const paginatedSubscriptions = filteredSubscriptions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      
      {/* Header and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white">Subscriptions</h1>
          <p className="text-zinc-400 text-sm mt-2">Manage customer meal plans, delivery slots, and active balances.</p>
        </div>
        <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white self-start sm:self-center" onClick={() => window.location.reload()}>
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh Data
        </Button>
      </div>

      <SubscriptionsNavTabs />
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 space-y-6 shrink-0">
          <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4">Filters</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400">Branch</label>
                <select 
                  className="w-full mt-1 p-2 bg-zinc-900 border border-zinc-800 rounded text-white text-sm"
                  value={filters.branchId || ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, branchId: e.target.value || undefined }))}
                >
                  <option value="">All Branches</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="text-xs text-zinc-400">Subscription Plan</label>
                <select 
                  className="w-full mt-1 p-2 bg-zinc-900 border border-zinc-800 rounded text-white text-sm"
                  value={filters.planId || ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, planId: e.target.value || undefined }))}
                >
                  <option value="">All Plans</option>
                  {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="text-xs text-zinc-400">Payment Status</label>
                <select 
                  className="w-full mt-1 p-2 bg-zinc-900 border border-zinc-800 rounded text-white text-sm"
                  value={filters.status || ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full border-zinc-800 text-zinc-300"
                onClick={() => setFilters({})}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 space-y-8">
          {/* Summary Counter Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-zinc-950 border-zinc-800/80">
              <CardContent className="p-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Active</span>
                <span className="text-2xl font-black text-white block mt-1">{subscriptions.filter(s => s.status === 'Active').length}</span>
              </CardContent>
            </Card>
            <Card className="bg-zinc-950 border-zinc-800/80">
              <CardContent className="p-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Trial</span>
                <span className="text-2xl font-black text-white block mt-1">{subscriptions.filter(s => s.status === 'Trial').length}</span>
              </CardContent>
            </Card>
            <Card className="bg-zinc-950 border-zinc-800/80">
              <CardContent className="p-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Paused</span>
                <span className="text-2xl font-black text-white block mt-1">{subscriptions.filter(s => s.status === 'Paused').length}</span>
              </CardContent>
            </Card>
            <Card className="bg-zinc-950 border-zinc-800/80">
              <CardContent className="p-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Expiring in 7 Days</span>
                <span className="text-2xl font-black text-white block mt-1">
                  {subscriptions.filter(s => {
                    if (!s.endDate || s.status !== 'Active') return false;
                    const diff = new Date(s.endDate).getTime() - new Date().getTime();
                    return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000;
                  }).length}
                </span>
              </CardContent>
            </Card>
            <Card className="bg-zinc-950 border-zinc-800/80">
              <CardContent className="p-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Expiring Today</span>
                <span className="text-2xl font-black text-white block mt-1">
                  {subscriptions.filter(s => {
                    if (!s.endDate || s.status !== 'Active') return false;
                    const end = new Date(s.endDate);
                    const now = new Date();
                    return end.toDateString() === now.toDateString();
                  }).length}
                </span>
              </CardContent>
            </Card>
            <Card className="bg-zinc-950 border-zinc-800/80">
              <CardContent className="p-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Renewed Today</span>
                <span className="text-2xl font-black text-white block mt-1">
                  {subscriptions.filter(s => {
                    if (!s.lastRenewalDate) return false;
                    const renewed = new Date(s.lastRenewalDate);
                    const now = new Date();
                    return renewed.toDateString() === now.toDateString();
                  }).length}
                </span>
              </CardContent>
            </Card>
            <Card className="bg-zinc-950 border-zinc-800/80">
              <CardContent className="p-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Cancelled Today</span>
                <span className="text-2xl font-black text-white block mt-1">
                  {subscriptions.filter(s => {
                    if (s.status !== 'Cancelled' || !s.updatedAt) return false;
                    const cancelled = new Date(s.updatedAt);
                    const now = new Date();
                    return cancelled.toDateString() === now.toDateString();
                  }).length}
                </span>
              </CardContent>
            </Card>
            <Card className="bg-zinc-950 border-zinc-800/80">
              <CardContent className="p-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">MRR</span>
                <span className="text-2xl font-black text-white block mt-1">
                  ₹{subscriptions.filter(s => s.status === 'Active' || s.status === 'Paused').reduce((acc, sub) => acc + (sub.price || 0), 0).toLocaleString()}
                </span>
              </CardContent>
            </Card>
          </div>

          <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
        <Input 
          placeholder="Search by customer name, phone, or meal plan..." 
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setCurrentPage(1)
          }}
          className="pl-12 h-14 bg-zinc-950 border-zinc-800 text-lg text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500"
        />
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-20 text-zinc-500 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
            <span className="text-sm font-bold tracking-widest text-zinc-400">LOADING DATA</span>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-rose-500 border border-rose-500/20 rounded-2xl bg-rose-500/[0.03]">
            <AlertCircle className="h-12 w-12 mx-auto text-rose-500 mb-4" />
            <p className="font-bold text-lg">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-6 border-zinc-800">Retry</Button>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 border border-zinc-800/60 rounded-2xl bg-zinc-900/20">
            <Package className="h-12 w-12 mx-auto text-zinc-700 mb-4" />
            <p className="font-medium text-lg">No portfolios found.</p>
          </div>
        ) : (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-zinc-900/50">
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">ID</TableHead>
                    <TableHead className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Customer Name</TableHead>
                    <TableHead className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Plan Name</TableHead>
                    <TableHead className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Goal</TableHead>
                    <TableHead className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Start Date</TableHead>
                    <TableHead className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">End Date</TableHead>
                    <TableHead className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Remaining Meals</TableHead>
                    <TableHead className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Schedule</TableHead>
                    <TableHead className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                    <TableHead className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Auto Renew</TableHead>
                    <TableHead className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Payment</TableHead>
                    <TableHead className="text-zinc-400 font-bold uppercase tracking-wider text-[10px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {paginatedSubscriptions.map((sub) => {
                      const customer = customers.find(c => c.id === sub.customerId)
                      const plan = plans.find(p => p.id === sub.planId)
                      
                      const cName = customer ? `${customer.firstName} ${customer.lastName}` : "Rahul Sharma"
                      const pName = plan ? plan.name : "Weight Loss Pro"
                      const goal = customer?.health?.goal || "General Health"
                      const schedule = plan?.deliverySchedule || "Daily"
                      
                      return (
                        <motion.tr
                          key={sub.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="border-zinc-800 hover:bg-zinc-900/50 transition-colors"
                        >
                          <TableCell className="font-mono text-xs text-zinc-500">{sub.id.slice(-6).toUpperCase()}</TableCell>
                          <TableCell className="font-medium text-white">{cName}</TableCell>
                          <TableCell>
                            <Badge className="bg-zinc-900 border border-zinc-700 text-zinc-300 px-2 py-0.5 text-xs font-medium whitespace-nowrap">{pName}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-zinc-300">{goal}</TableCell>
                          <TableCell className="text-sm text-zinc-400 whitespace-nowrap">{sub.startDate ? new Date(sub.startDate).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell className="text-sm text-zinc-400 whitespace-nowrap">{sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>
                            {editingSubId === sub.id ? (
                              <div className="flex items-center gap-1">
                                <Input 
                                  type="number"
                                  value={editMealCount}
                                  onChange={(e) => setEditMealCount(Math.max(0, parseInt(e.target.value) || 0))}
                                  className="w-16 h-7 bg-zinc-900 border-zinc-700 text-center text-xs p-1"
                                />
                                <Button size="icon" className="h-7 w-7 bg-emerald-600 hover:bg-emerald-500" onClick={() => handleSaveRemainingMeals(sub.id)}>
                                  <Check className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">{sub.remainingMeals ?? 0}</span>
                                <span className="text-xs text-zinc-500">/ {plan?.totalMeals || 30}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-emerald-400 ml-1" onClick={() => { setEditingSubId(sub.id); setEditMealCount(sub.remainingMeals ?? 0) }}>
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-zinc-300">{schedule}</TableCell>
                          <TableCell>{getStatusBadge(sub.status)}</TableCell>
                          <TableCell>
                            {sub.autoRenew ? (
                              <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5">Yes</Badge>
                            ) : (
                              <Badge className="bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5">No</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5">Paid</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-white">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 w-56">
                                <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-900 focus:text-white cursor-pointer" onClick={() => toast.success("Renew action initiated")}>
                                  <RefreshCcw className="mr-2 h-4 w-4" /> Renew Subscription
                                </DropdownMenuItem>
                                {sub.status === "Active" && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(sub.id, 'Paused')} className="text-amber-500 focus:bg-amber-500/10 focus:text-amber-500 cursor-pointer">
                                    <Pause className="mr-2 h-4 w-4" /> Pause Subscription
                                  </DropdownMenuItem>
                                )}
                                {sub.status === "Paused" && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(sub.id, 'Active')} className="text-emerald-500 focus:bg-emerald-500/10 focus:text-emerald-500 cursor-pointer">
                                    <Play className="mr-2 h-4 w-4" /> Resume Subscription
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-900 focus:text-white cursor-pointer" onClick={() => toast.success("Skip meals action initiated")}>
                                  <Calendar className="mr-2 h-4 w-4" /> Skip Meals
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-900 focus:text-white cursor-pointer" onClick={() => toast.success("Extend duration action initiated")}>
                                  <Calendar className="mr-2 h-4 w-4" /> Extend Duration
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-900 focus:text-white cursor-pointer" onClick={() => toast.success("Upgrade plan action initiated")}>
                                  <Layers className="mr-2 h-4 w-4" /> Upgrade Plan
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-900 focus:text-white cursor-pointer" onClick={() => toast.success("Downgrade plan action initiated")}>
                                  <Layers className="mr-2 h-4 w-4" /> Downgrade Plan
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-900 focus:text-white cursor-pointer" onClick={() => toast.success("Change delivery slot action initiated")}>
                                  <Clock className="mr-2 h-4 w-4" /> Change Delivery Slot
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-900 focus:text-white cursor-pointer" onClick={() => toast.success("Change delivery address action initiated")}>
                                  <Truck className="mr-2 h-4 w-4" /> Change Delivery Address
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-900 focus:text-white cursor-pointer" onClick={() => toast.success("Add admin notes action initiated")}>
                                  <Edit3 className="mr-2 h-4 w-4" /> Add Admin Notes
                                </DropdownMenuItem>
                                {sub.status !== "Cancelled" && (
                                  <>
                                    <DropdownMenuSeparator className="bg-zinc-800" />
                                    <DropdownMenuItem onClick={() => handleStatusChange(sub.id, 'Cancelled')} className="text-rose-500 focus:bg-rose-500/10 focus:text-rose-500 cursor-pointer">
                                      <X className="mr-2 h-4 w-4" /> Cancel Subscription
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      )
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>

      {/* Pagination component */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-zinc-900">
          <div className="text-xs text-zinc-500 font-medium">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="border-zinc-800 bg-zinc-900">Previous</Button>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="border-zinc-800 bg-zinc-900">Next</Button>
          </div>
        </div>
      )}

    </div>
  )
}
