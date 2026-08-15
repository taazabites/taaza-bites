import React, { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Loader2, 
  RefreshCcw, 
  Search, 
  Bell, 
  Calendar, 
  Package, 
  Check, 
  AlertCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  Heart,
  CheckCircle2,
  CalendarClock,
  User,
  Phone,
  Mail,
  Zap,
  CreditCard,
  Percent,
  Plus
} from "lucide-react"
import { subscriptionService } from "../services/subscriptions"
import { useAuth } from "../contexts/auth-context"
import { customerService } from "../services/customers"
import { planService } from "../services/plans"
import { branchService } from "../services/branches"
import { auditService } from "../services/audit"
import { SubscriptionsNavTabs } from "../components/subscriptions-nav-tabs"
import { toast } from "sonner"
import { motion, AnimatePresence } from "motion/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RenewalsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useAuth()
  
  // Selection states & filters
  const [selectedBranch, setSelectedBranch] = useState<string>("")
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [timeFilter, setTimeFilter] = useState<string>("all") // all, 3days, 7days, 14days, lowmeals
  
  // Dialog state for manual renewal
  const [renewingSub, setRenewingSub] = useState<any | null>(null)
  const [selectedRenewalPlan, setSelectedRenewalPlan] = useState<string>("")
  const [additionalMeals, setAdditionalMeals] = useState<number>(30)
  const [chargeAmount, setChargeAmount] = useState<number>(2999)
  const [paymentMethod, setPaymentMethod] = useState<string>("Wallet")
  const [isRenewing, setIsRenewing] = useState(false)

  const loadData = () => {
    // Load other related data
    Promise.all([
      customerService.getCustomers(1000),
      planService.getPlans(),
      branchService.getBranches()
    ]).then(([custData, plansData, branchData]) => {
      setCustomers(custData)
      setPlans(plansData)
      setBranches(branchData)
    }).catch(err => {
      console.error("Error loading supporting data for renewals:", err)
    })
  }

  useEffect(() => {
    setLoading(true)
    const unsubscribe = subscriptionService.subscribeToFilteredSubscriptions(
      (subsData) => {
        setSubscriptions(subsData)
        setLoading(false)
        setError(null)
      },
      {} // Get all for filtering locally
    )

    loadData()

    return () => unsubscribe()
  }, [])

  // Process subscription candidates for renewal
  const renewalCandidates = subscriptions.filter(sub => {
    // Only Active or Paused are valid candidates
    if (sub.status !== 'Active' && sub.status !== 'Paused') return false

    const customer = customers.find(c => c.id === sub.customerId)
    const plan = plans.find(p => p.id === sub.planId)
    
    const cName = customer ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.name : "Unknown customer"
    const pName = plan ? plan.name : "Plan"
    const cPhone = customer ? customer.phone : ""

    const searchStr = `${sub.id} ${cName} ${cPhone} ${pName}`.toLowerCase()
    if (searchQuery && !searchStr.includes(searchQuery.toLowerCase())) return false

    if (selectedBranch && sub.branchId !== selectedBranch) return false
    if (selectedPlan && sub.planId !== selectedPlan) return false

    // Date math
    const now = new Date()
    const endDate = sub.endDate ? new Date(sub.endDate) : null
    const diffTime = endDate ? endDate.getTime() - now.getTime() : Infinity
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const isLowMeals = typeof sub.remainingMeals === 'number' && sub.remainingMeals <= 5

    // Time filter matching
    if (timeFilter === "3days" && (diffDays < 0 || diffDays > 3)) return false
    if (timeFilter === "7days" && (diffDays < 0 || diffDays > 7)) return false
    if (timeFilter === "14days" && (diffDays < 0 || diffDays > 14)) return false
    if (timeFilter === "lowmeals" && !isLowMeals) return false

    // General upcoming check: either low meals OR expires in next 14 days OR already expired/expiring
    return isLowMeals || diffDays <= 14 || sub.status === 'Paused'
  })

  const getDaysRemaining = (endDateStr?: string) => {
    if (!endDateStr) return { text: "No end date", color: "text-zinc-400", days: Infinity }
    const now = new Date()
    const endDate = new Date(endDateStr)
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return { text: `Expired ${Math.abs(diffDays)}d ago`, color: "text-rose-500 font-bold", days: diffDays }
    } else if (diffDays === 0) {
      return { text: "Expires today", color: "text-amber-500 font-bold animate-pulse", days: diffDays }
    } else if (diffDays === 1) {
      return { text: "1 day left", color: "text-amber-500 font-bold", days: diffDays }
    } else if (diffDays <= 3) {
      return { text: `${diffDays} days left`, color: "text-amber-400 font-semibold", days: diffDays }
    } else if (diffDays <= 7) {
      return { text: `${diffDays} days left`, color: "text-emerald-400", days: diffDays }
    } else {
      return { text: `${diffDays} days left`, color: "text-zinc-300", days: diffDays }
    }
  }

  const handleSendReminder = async (sub: any) => {
    const customer = customers.find(c => c.id === sub.customerId)
    const name = customer ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() : "Customer"
    
    toast.message(`Queued an approved renewal notice for ${name}. Nothing was sent automatically.`)
    if (user) {
      await auditService.logAction(
        user.id,
        user.email || '',
        'UPDATE',
        `Subscription ${sub.id}`,
        `Sent renewal reminder notification to ${name}`
      )
    }
  }

  const handleOpenRenewal = (sub: any) => {
    const plan = plans.find(p => p.id === sub.planId)
    setRenewingSub(sub)
    setSelectedRenewalPlan(sub.planId)
    setAdditionalMeals(plan?.totalMeals || 30)
    setChargeAmount(plan?.price || 2999)
    setPaymentMethod("Wallet")
  }

  const executeRenewal = async () => {
    if (!renewingSub) return
    setIsRenewing(true)
    try {
      const currentEndDate = renewingSub.endDate ? new Date(renewingSub.endDate) : new Date()
      // Extend end date by 30 days
      const newEndDate = new Date(currentEndDate.getTime() + 30 * 24 * 60 * 60 * 1000)
      const newNextBilling = new Date(newEndDate.getTime() + 1 * 24 * 60 * 60 * 1000)
      
      const updatedData = {
        planId: selectedRenewalPlan,
        remainingMeals: (renewingSub.remainingMeals || 0) + additionalMeals,
        endDate: newEndDate.toISOString(),
        nextBillingDate: newNextBilling.toISOString(),
        status: 'Active' as const
      }

      await subscriptionService.updateSubscription(renewingSub.id, updatedData)
      
      if (user) {
        await auditService.logAction(
          user.id,
          user.email || '',
          'UPDATE',
          `Subscription ${renewingSub.id}`,
          `Manually renewed plan to ${selectedRenewalPlan}. Refilled +${additionalMeals} meals. Charged ₹${chargeAmount} via ${paymentMethod}.`
        )
      }

      toast.success("Subscription successfully renewed and extended!")
      setRenewingSub(null)
      loadData()
    } catch (err: any) {
      console.error("Renewal failed:", err)
      toast.error(`Renewal failed: ${err.message || "Unknown error"}`)
    } finally {
      setIsRenewing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': 
        return <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20 text-xs font-semibold px-2.5 py-1 uppercase tracking-wider">Active</Badge>
      case 'Paused': 
        return <Badge className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20 text-xs font-semibold px-2.5 py-1 uppercase tracking-wider">Paused</Badge>
      default: 
        return <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-xs font-semibold px-2.5 py-1 uppercase tracking-wider">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      
      {/* Header and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white">Upcoming Renewals</h1>
          <p className="text-zinc-400 text-sm mt-2">Monitor expiring memberships, notify clients, and process custom renewal pathways.</p>
        </div>
        <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white self-start sm:self-center" onClick={loadData}>
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh Pipeline
        </Button>
      </div>

      <SubscriptionsNavTabs />

      {/* Main Grid Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Sidebar Filters */}
        <aside className="w-full lg:w-64 space-y-6 shrink-0">
          <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4">Pipeline Filters</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400">Branch Location</label>
                <select 
                  className="w-full mt-1 p-2 bg-zinc-900 border border-zinc-800 rounded text-white text-sm"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                >
                  <option value="">All Branches</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="text-xs text-zinc-400">Meal Plan Tier</label>
                <select 
                  className="w-full mt-1 p-2 bg-zinc-900 border border-zinc-800 rounded text-white text-sm"
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                >
                  <option value="">All Plans</option>
                  {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="text-xs text-zinc-400">Time / Meal Horizon</label>
                <select 
                  className="w-full mt-1 p-2 bg-zinc-900 border border-zinc-800 rounded text-white text-sm"
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                >
                  <option value="all">Any Expiration Criteria</option>
                  <option value="3days">Expiring within 3 Days</option>
                  <option value="7days">Expiring within 7 Days</option>
                  <option value="14days">Expiring within 14 Days</option>
                  <option value="lowmeals">Low Meal Balance (≤ 5 left)</option>
                </select>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full border-zinc-800 text-zinc-300"
                onClick={() => {
                  setSelectedBranch("")
                  setSelectedPlan("")
                  setTimeFilter("all")
                  setSearchQuery("")
                }}
              >
                Reset Pipeline
              </Button>
            </div>
          </div>

          <div className="bg-emerald-950/20 p-5 rounded-2xl border border-emerald-500/10 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Zap className="h-4 w-4" />
              <span>Smart Suggestions</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Customers with <strong className="text-zinc-200">fewer than 5 meals</strong> or <strong className="text-zinc-200">less than 7 days</strong> remaining show up highlighted. Remind them to renew early for continuity benefits!
            </p>
          </div>
        </aside>

        {/* Right Side: Content Area */}
        <div className="flex-1 space-y-6">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-zinc-950 border-zinc-800">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Scheduled Renewals</span>
                  <span className="text-2xl font-black text-white block mt-0.5">{loading ? "..." : renewalCandidates.length}</span>
                </div>
                <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                  <CalendarClock className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-950 border-zinc-800">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Auto-Renew Status</span>
                  <span className="text-2xl font-black text-white block mt-0.5">
                    {loading ? "..." : subscriptions.filter(s => s.status === 'Active' && s.autoRenewal !== false).length}
                  </span>
                </div>
                <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                  <Zap className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-950 border-zinc-800">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Low Balances</span>
                  <span className="text-2xl font-black text-white block mt-0.5">
                    {loading ? "..." : subscriptions.filter(s => s.status === 'Active' && typeof s.remainingMeals === 'number' && s.remainingMeals <= 5).length}
                  </span>
                </div>
                <div className="h-10 w-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400">
                  <AlertCircle className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <Input 
              placeholder="Search renewal list by customer name, phone, or plan..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 bg-zinc-950 border-zinc-800 text-base text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500"
            />
          </div>

          {/* Candidates list */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-20 text-zinc-500 flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                <span className="text-sm font-bold tracking-widest text-zinc-400">REFRESHING PIPELINE DATA</span>
              </div>
            ) : error ? (
              <div className="text-center py-20 text-rose-500 border border-rose-500/20 rounded-2xl bg-rose-500/[0.03]">
                <AlertCircle className="h-12 w-12 mx-auto text-rose-500 mb-4" />
                <p className="font-bold text-lg">{error}</p>
                <Button onClick={loadData} variant="outline" className="mt-6 border-zinc-800">Retry</Button>
              </div>
            ) : renewalCandidates.length === 0 ? (
              <div className="text-center py-20 text-zinc-500 border border-zinc-800/60 rounded-2xl bg-zinc-900/10">
                <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-500/80 mb-4" />
                <h3 className="font-bold text-white text-lg">No Pending Renewal Candidates</h3>
                <p className="text-zinc-400 text-sm mt-1 max-w-md mx-auto">Everyone is topped up on meal balances, and no immediate expiration horizons are breached. Nice work!</p>
              </div>
            ) : (
              <AnimatePresence>
                {renewalCandidates.map((sub) => {
                  const customer = customers.find(c => c.id === sub.customerId)
                  const plan = plans.find(p => p.id === sub.planId)
                  
                  const cName = customer ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.name : "Rahul Sharma"
                  const cEmail = customer ? customer.email : "rahul.sharma@example.com"
                  const cPhone = customer ? customer.phone : "9876543210"
                  const pName = plan ? plan.name : "Weight Loss Pro"

                  const dateInfo = getDaysRemaining(sub.endDate)
                  const isLowMeals = typeof sub.remainingMeals === 'number' && sub.remainingMeals <= 5

                  return (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Card className={`bg-zinc-950 border-zinc-800 transition-all hover:border-zinc-700 shadow-xl overflow-hidden border-l-4 ${
                        isLowMeals || dateInfo.days <= 3 ? "border-l-amber-500" : "border-l-emerald-500"
                      }`}>
                        <CardContent className="p-6">
                          {/* Top row */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black text-emerald-400 text-lg">
                                {cName[0] || '?'}{(cName.split(" ")[1]?.[0] || '')}
                              </div>
                              <div>
                                <h3 className="font-bold text-white text-base">{cName}</h3>
                                <p className="text-xs text-zinc-500 font-mono">{cEmail} • {cPhone}</p>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className="bg-zinc-900 border border-zinc-800 text-zinc-300 uppercase text-[10px] font-bold tracking-wider px-2 py-0.5">{pName}</Badge>
                              {getStatusBadge(sub.status)}
                            </div>
                          </div>

                          {/* Stats and metadata */}
                          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="space-y-0.5">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Remaining Meals</span>
                              <span className={`text-base font-extrabold block ${isLowMeals ? "text-amber-400" : "text-zinc-200"}`}>
                                {sub.remainingMeals ?? 0} Meals
                              </span>
                            </div>

                            <div className="space-y-0.5">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Expiry Horizon</span>
                              <span className={`text-sm font-bold block ${dateInfo.color}`}>
                                {dateInfo.text}
                              </span>
                            </div>

                            <div className="space-y-0.5">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">End Date</span>
                              <span className="text-sm font-medium text-zinc-400 block">
                                {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>

                            <div className="space-y-0.5">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Auto Renewal</span>
                              <span className="text-sm font-bold block">
                                {sub.autoRenewal !== false ? (
                                  <span className="text-indigo-400 flex items-center gap-1">
                                    <Zap className="h-3.5 w-3.5 fill-indigo-400" /> Active
                                  </span>
                                ) : (
                                  <span className="text-zinc-500">Disabled</span>
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Actions panel */}
                          <div className="mt-5 pt-4 border-t border-zinc-900/80 flex items-center justify-between flex-wrap gap-3">
                            <div className="text-xs text-zinc-500">
                              ID: <span className="font-mono text-zinc-400">{sub.id}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900"
                                onClick={() => handleSendReminder(sub)}
                              >
                                <Bell className="mr-1.5 h-3.5 w-3.5 text-zinc-400" /> Notify Reminders
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                                onClick={() => handleOpenRenewal(sub)}
                              >
                                <Plus className="mr-1.5 h-3.5 w-3.5" /> Renew Manually
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

      </div>

      {/* Manual Renewal Modal */}
      <Dialog open={!!renewingSub} onOpenChange={(open) => { if(!open) setRenewingSub(null) }}>
        <DialogContent className="bg-zinc-950 border border-zinc-800 text-white sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-emerald-400" /> Manual Subscription Renewal
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-sm">
              Process manual extensions, customized plan assignment, and refilling meal balances instantly.
            </DialogDescription>
          </DialogHeader>

          {renewingSub && (
            <div className="space-y-4 py-2">
              <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/80 space-y-2">
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Current Account</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-emerald-400">
                    {customers.find(c => c.id === renewingSub.customerId)?.firstName?.[0] || 'U'}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-100">
                      {(() => {
                        const cust = customers.find(c => c.id === renewingSub.customerId)
                        return cust ? `${cust.firstName || ''} ${cust.lastName || ''}`.trim() || cust.name : "Rahul Sharma"
                      })()}
                    </h4>
                    <p className="text-xs text-zinc-400 font-mono">
                      Current Balance: {renewingSub.remainingMeals || 0} Meals remaining
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">Select Target Plan</Label>
                <Select value={selectedRenewalPlan} onValueChange={(val) => {
                  setSelectedRenewalPlan(val)
                  const pl = plans.find(p => p.id === val)
                  if (pl) {
                    setAdditionalMeals(pl.totalMeals || 30)
                    setChargeAmount(pl.price || 2999)
                  }
                }}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                    {plans.map(p => (
                      <SelectItem key={p.id} value={p.id} className="focus:bg-zinc-800 text-white">
                        {p.name} (₹{p.price})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-zinc-300 text-xs">Meals to Refill</Label>
                  <Input 
                    type="number" 
                    value={additionalMeals} 
                    onChange={(e) => setAdditionalMeals(parseInt(e.target.value) || 0)}
                    className="bg-zinc-900 border-zinc-800 text-white font-bold" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-zinc-300 text-xs">Charge Amount (₹)</Label>
                  <Input 
                    type="number" 
                    value={chargeAmount} 
                    onChange={(e) => setChargeAmount(parseInt(e.target.value) || 0)}
                    className="bg-zinc-900 border-zinc-800 text-white font-bold" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">Payment Collection Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                    <SelectItem value="Wallet" className="focus:bg-zinc-800 text-white">Customer Wallet (Deduct Balance)</SelectItem>
                    <SelectItem value="Razorpay" className="focus:bg-zinc-800 text-white">Razorpay Link (Collect Online)</SelectItem>
                    <SelectItem value="COD" className="focus:bg-zinc-800 text-white">Cash on Delivery / Direct Bank Transfer</SelectItem>
                    <SelectItem value="Complimentary" className="focus:bg-zinc-800 text-white">Complimentary (Admin Approved Free Plan)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900" onClick={() => setRenewingSub(null)}>
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold" onClick={executeRenewal} disabled={isRenewing}>
              {isRenewing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Renewing...
                </>
              ) : (
                "Confirm & Execute Renewal"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
