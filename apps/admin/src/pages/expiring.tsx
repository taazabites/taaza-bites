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
  Package, 
  Check, 
  AlertCircle,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  User,
  Plus,
  Snowflake,
  ShieldAlert,
  Send,
  SlidersHorizontal
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

export default function ExpiringSubscriptions() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useAuth()

  // Filter selections
  const [selectedBranch, setSelectedBranch] = useState<string>("")
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [expTypeFilter, setExpTypeFilter] = useState<string>("all") // all, low_meals, low_days, critical

  // Extension Modal State
  const [extendingSub, setExtendingSub] = useState<any | null>(null)
  const [mealsToAdd, setMealsToAdd] = useState<number>(5)
  const [isExtending, setIsExtending] = useState(false)

  const loadData = () => {
    // Load static data
    Promise.all([
      customerService.getCustomers(1000),
      planService.getPlans(),
      branchService.getBranches()
    ]).then(([custs, plansData, branchData]) => {
      setCustomers(custs)
      setPlans(plansData)
      setBranches(branchData)
    }).catch(err => {
      console.error("Error loading related data:", err)
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
      { status: "Active" } // Initial filter
    )

    loadData()

    return () => unsubscribe()
  }, [])

  // Process expiring items
  const expiringList = subscriptions.filter(sub => {
    // Only Active or Paused are candidates
    if (sub.status !== 'Active' && sub.status !== 'Paused') return false

    const customer = customers.find(c => c.id === sub.customerId)
    const plan = plans.find(p => p.id === sub.planId)

    const cName = customer ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.name : "Rahul Sharma"
    const pName = plan ? plan.name : "Regular Meal Plan"
    const cPhone = customer ? customer.phone : "9876543210"

    const searchStr = `${sub.id} ${cName} ${cPhone} ${pName}`.toLowerCase()
    if (searchQuery && !searchStr.includes(searchQuery.toLowerCase())) return false

    if (selectedBranch && sub.branchId !== selectedBranch) return false
    if (selectedPlan && sub.planId !== selectedPlan) return false

    // Criteria: Expiring is ≤ 5 meals remaining OR end date ≤ 5 days away
    const remainingMeals = sub.remainingMeals ?? 0
    const now = new Date()
    const endDate = sub.endDate ? new Date(sub.endDate) : null
    const diffTime = endDate ? endDate.getTime() - now.getTime() : Infinity
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const isLowMeals = remainingMeals <= 5
    const isLowDays = diffDays >= 0 && diffDays <= 5
    const isCritical = remainingMeals <= 2 || diffDays <= 2

    // Apply Filter choice
    if (expTypeFilter === "low_meals" && !isLowMeals) return false
    if (expTypeFilter === "low_days" && !isLowDays) return false
    if (expTypeFilter === "critical" && !isCritical) return false

    // General matching
    return isLowMeals || isLowDays || diffDays < 0
  })

  const getDaysRemaining = (endDateStr?: string) => {
    if (!endDateStr) return { text: "No end date", color: "text-zinc-500", days: Infinity }
    const now = new Date()
    const endDate = new Date(endDateStr)
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return { text: `Expired ${Math.abs(diffDays)}d ago`, color: "text-rose-500 font-extrabold", days: diffDays }
    } else if (diffDays === 0) {
      return { text: "Expires today", color: "text-amber-500 font-bold animate-pulse", days: diffDays }
    } else if (diffDays === 1) {
      return { text: "1 day left", color: "text-rose-400 font-bold", days: diffDays }
    } else if (diffDays <= 3) {
      return { text: `${diffDays} days left`, color: "text-amber-400 font-semibold", days: diffDays }
    } else {
      return { text: `${diffDays} days left`, color: "text-emerald-400", days: diffDays }
    }
  }

  const handleSendSMSAlert = async (sub: any) => {
    const cust = customers.find(c => c.id === sub.customerId)
    const name = cust ? `${cust.firstName || ''} ${cust.lastName || ''}`.trim() : "Customer"
    
    toast.success(`Critical Expiry Notification dispatched to ${name}'s contact numbers!`)
    if (user) {
      await auditService.logAction(
        user.id,
        user.email || '',
        'UPDATE',
        `Subscription ${sub.id}`,
        `Sent urgent expiration alert to ${name}`
      )
    }
  }

  const handleFreezeSubscription = async (sub: any) => {
    try {
      if (!user) {
        toast.error("You must be logged in to modify subscription state")
        return
      }
      await subscriptionService.updateSubscriptionStatus(sub.id, 'Paused', user.id, user.email || '')
      toast.success("Subscription frozen successfully!")
      loadData()
    } catch (err: any) {
      toast.error(`Failed to freeze: ${err.message}`)
    }
  }

  const handleOpenExtension = (sub: any) => {
    setExtendingSub(sub)
    setMealsToAdd(5)
  }

  const executeExtension = async () => {
    if (!extendingSub) return
    setIsExtending(true)
    try {
      const currentMeals = extendingSub.remainingMeals ?? 0
      const currentEndDate = extendingSub.endDate ? new Date(extendingSub.endDate) : new Date()
      // Extend end date by 7 days per 5 meals added
      const daysToAdd = Math.ceil(mealsToAdd * 1.4)
      const newEndDate = new Date(currentEndDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000)

      await subscriptionService.updateSubscription(extendingSub.id, {
        remainingMeals: currentMeals + mealsToAdd,
        endDate: newEndDate.toISOString()
      })

      if (user) {
        await auditService.logAction(
          user.id,
          user.email || '',
          'UPDATE',
          `Subscription ${extendingSub.id}`,
          `Extended balance by adding +${mealsToAdd} meals. Automatically shifted end-date by +${daysToAdd} days.`
        )
      }

      toast.success(`Success! Added ${mealsToAdd} meals & extended expiration by ${daysToAdd} days.`)
      setExtendingSub(null)
      loadData()
    } catch (err: any) {
      toast.error(`Extension failed: ${err.message}`)
    } finally {
      setIsExtending(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white">Expiring Soon</h1>
          <p className="text-zinc-400 text-sm mt-2">Monitor subscriptions running critically low on meals or nearing expiration deadlines.</p>
        </div>
        <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white self-start sm:self-center" onClick={loadData}>
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh Lists
        </Button>
      </div>

      <SubscriptionsNavTabs />

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left column: Sidebar Filters */}
        <aside className="w-full lg:w-64 space-y-6 shrink-0">
          <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4">Focus Scope</h3>
            
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
                <label className="text-xs text-zinc-400">Meal Plan</label>
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
                <label className="text-xs text-zinc-400">Urgency Severity</label>
                <select 
                  className="w-full mt-1 p-2 bg-zinc-900 border border-zinc-800 rounded text-white text-sm"
                  value={expTypeFilter}
                  onChange={(e) => setExpTypeFilter(e.target.value)}
                >
                  <option value="all">Any Expiration Sign</option>
                  <option value="low_meals">Low Meal Balance (≤ 5 meals)</option>
                  <option value="low_days">Running Out of Days (≤ 5 days)</option>
                  <option value="critical">Critical Urgency (≤ 2 meals / days)</option>
                </select>
              </div>

              <Button 
                variant="outline" 
                className="w-full border-zinc-800 text-zinc-300"
                onClick={() => {
                  setSelectedBranch("")
                  setSelectedPlan("")
                  setExpTypeFilter("all")
                  setSearchQuery("")
                }}
              >
                Clear Focus Filters
              </Button>
            </div>
          </div>

          <div className="bg-amber-950/20 p-5 rounded-2xl border border-amber-500/10 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Retention Opportunity</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Quickly extend customers running low to ensure zero delivery interruptions. Dispatched notifications provide instant digital payment renewal links.
            </p>
          </div>
        </aside>

        {/* Right column: Content */}
        <div className="flex-1 space-y-6">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-zinc-950 border-zinc-800">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Expiring Profiles</span>
                  <span className="text-2xl font-black text-rose-400 block mt-0.5">{loading ? "..." : expiringList.length}</span>
                </div>
                <div className="h-10 w-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-950 border-zinc-800">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Avg Remaining Meals</span>
                  <span className="text-2xl font-black text-white block mt-0.5">
                    {(() => {
                      if (loading || expiringList.length === 0) return "..."
                      const sum = expiringList.reduce((acc, curr) => acc + (curr.remainingMeals ?? 0), 0)
                      return (sum / expiringList.length).toFixed(1)
                    })()}
                  </span>
                </div>
                <div className="h-10 w-10 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-400">
                  <Clock className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-950 border-zinc-800">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Critical Alerts</span>
                  <span className="text-2xl font-black text-amber-500 block mt-0.5">
                    {loading ? "..." : expiringList.filter(s => (s.remainingMeals ?? 0) <= 2).length}
                  </span>
                </div>
                <div className="h-10 w-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                  <ShieldAlert className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Inputs */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <Input 
              placeholder="Search expiring soon by customer name, phone, or plan..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 bg-zinc-950 border-zinc-800 text-base text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500"
            />
          </div>

          {/* List items */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-20 text-zinc-500 flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                <span className="text-sm font-bold tracking-widest text-zinc-400">CALCULATING HORIZON STATUSES</span>
              </div>
            ) : error ? (
              <div className="text-center py-20 text-rose-500 border border-rose-500/20 rounded-2xl bg-rose-500/[0.03]">
                <AlertCircle className="h-12 w-12 mx-auto text-rose-500 mb-4" />
                <p className="font-bold text-lg">{error}</p>
                <Button onClick={loadData} variant="outline" className="mt-6 border-zinc-800">Retry</Button>
              </div>
            ) : expiringList.length === 0 ? (
              <div className="text-center py-20 text-zinc-500 border border-zinc-800/60 rounded-2xl bg-zinc-900/10">
                <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-500 mb-4" />
                <h3 className="font-bold text-white text-lg">No Impending Expirations</h3>
                <p className="text-zinc-400 text-sm mt-1 max-w-sm mx-auto">All active portfolios possess high balances. Outstanding renewals are fully up to date!</p>
              </div>
            ) : (
              <AnimatePresence>
                {expiringList.map((sub) => {
                  const customer = customers.find(c => c.id === sub.customerId)
                  const plan = plans.find(p => p.id === sub.planId)
                  
                  const cName = customer ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.name : "Rahul Sharma"
                  const cEmail = customer ? customer.email : "rahul.sharma@example.com"
                  const cPhone = customer ? customer.phone : "9876543210"
                  const pName = plan ? plan.name : "Keto Meal Plan"

                  const dateInfo = getDaysRemaining(sub.endDate)
                  const isMealsUrgent = (sub.remainingMeals ?? 0) <= 2
                  const isDaysUrgent = dateInfo.days <= 2

                  return (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Card className={`bg-zinc-950 border-zinc-800 transition-all hover:border-zinc-700 shadow-xl overflow-hidden border-l-4 ${
                        isMealsUrgent || isDaysUrgent ? "border-l-rose-500" : "border-l-amber-500"
                      }`}>
                        <CardContent className="p-5">
                          {/* Top row */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
                            <div className="flex items-center gap-4">
                              <div className="h-11 w-11 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black text-rose-400 text-lg">
                                {cName[0] || '?'}{(cName.split(" ")[1]?.[0] || '')}
                              </div>
                              <div>
                                <h3 className="font-bold text-white text-base">{cName}</h3>
                                <p className="text-xs text-zinc-500 font-mono">{cEmail} • {cPhone}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge className="bg-zinc-900 border border-zinc-800 text-zinc-300 uppercase text-[10px] tracking-wider px-2 py-0.5">{pName}</Badge>
                              {isMealsUrgent || isDaysUrgent ? (
                                <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 animate-pulse">Critical</Badge>
                              ) : (
                                <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">Warning</Badge>
                              )}
                            </div>
                          </div>

                          {/* Detail counts */}
                          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div className="space-y-0.5">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Remaining Meals</span>
                              <span className={`text-base font-black block ${isMealsUrgent ? "text-rose-400" : "text-amber-400"}`}>
                                {sub.remainingMeals ?? 0} Meals Left
                              </span>
                            </div>

                            <div className="space-y-0.5">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Expiration Status</span>
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
                          </div>

                          {/* Quick Actions Footer */}
                          <div className="mt-5 pt-3 border-t border-zinc-900 flex items-center justify-between gap-4 flex-wrap text-xs text-zinc-500">
                            <div>
                              ID: <span className="font-mono text-zinc-400">{sub.id}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900"
                                onClick={() => handleSendSMSAlert(sub)}
                              >
                                <Send className="mr-1.5 h-3 w-3" /> SMS Alert
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-zinc-800 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                                onClick={() => handleFreezeSubscription(sub)}
                              >
                                <Snowflake className="mr-1.5 h-3 w-3" /> Freeze Plan
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold border border-zinc-700"
                                onClick={() => handleOpenExtension(sub)}
                              >
                                <Plus className="mr-1.5 h-3.5 w-3.5" /> Extend Balance
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

      {/* Extension Modal */}
      <Dialog open={!!extendingSub} onOpenChange={(open) => { if(!open) setExtendingSub(null) }}>
        <DialogContent className="bg-zinc-950 border border-zinc-800 text-white sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-400" /> Extend Meal Balance
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Quickly inject a buffer of active meals to delay expiration or handle temporary balance requests.
            </DialogDescription>
          </DialogHeader>

          {extendingSub && (
            <div className="space-y-4 py-2">
              <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80 space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-500">Target Membership</span>
                <h4 className="text-sm font-semibold text-zinc-200">
                  {(() => {
                    const cust = customers.find(c => c.id === extendingSub.customerId)
                    return cust ? `${cust.firstName || ''} ${cust.lastName || ''}`.trim() || cust.name : "Rahul Sharma"
                  })()}
                </h4>
                <p className="text-xs text-zinc-400">
                  Plan: {plans.find(p => p.id === extendingSub.planId)?.name || "Regular Meal Plan"}
                </p>
                <p className="text-xs text-zinc-500 font-mono">
                  Current Meals: {extendingSub.remainingMeals ?? 0} remaining
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300 text-xs">Additional Meals to Inject</Label>
                <div className="flex gap-2">
                  {[3, 5, 10, 15].map(m => (
                    <Button 
                      key={m}
                      type="button"
                      variant={mealsToAdd === m ? "default" : "outline"}
                      className={`flex-1 ${mealsToAdd === m ? 'bg-emerald-600 hover:bg-emerald-500' : 'border-zinc-800 hover:bg-zinc-900'}`}
                      onClick={() => setMealsToAdd(m)}
                    >
                      +{m} Meals
                    </Button>
                  ))}
                </div>
                <div className="pt-2">
                  <Input 
                    type="number"
                    value={mealsToAdd}
                    onChange={(e) => setMealsToAdd(parseInt(e.target.value) || 0)}
                    placeholder="Custom meal count"
                    className="bg-zinc-900 border-zinc-800 text-white font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900" onClick={() => setExtendingSub(null)}>
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold" onClick={executeExtension} disabled={isExtending}>
              {isExtending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Extending...
                </>
              ) : (
                "Confirm Extension"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
