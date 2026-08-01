import { getAdminEmail } from '../utils/admin';
import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, RefreshCcw, Search, Gift, Coins, History, Star, ArrowUpRight, ArrowDownRight, Leaf, Sparkles, TrendingUp } from "lucide-react"
import { customerService } from "../services/customers"
import { Customer } from "../types"
import { useAuth } from "../contexts/auth-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { DataTableSkeleton } from "@/src/components/ui/data-table-skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RewardsPage({ embedded = false }: { embedded?: boolean }) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useAuth()

  // Tab state
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'audit_logs'>('leaderboard')

  // Adjustment form state
  const [isAdjustOpen, setIsAdjustOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [pointsDelta, setPointsDelta] = useState(100)
  const [reason, setReason] = useState("Loyalty Bonus")
  const [actionType, setActionType] = useState<"earn" | "redeem">("earn")

  // History dialog state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [transactions, setTransactions] = useState<any[]>([])

  // Global point transactions states
  const [globalRewardTxns, setGlobalRewardTxns] = useState<any[]>([])
  const [globalRewardLoading, setGlobalRewardLoading] = useState(false)
  const [globalRewardSearch, setGlobalRewardSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const getCustomerName = (id: string) => {
    const customer = customers.find(c => c.id === id)
    return customer ? `${customer.firstName} ${customer.lastName}` : `Customer (${id.substring(0, 8).toUpperCase()})`
  }

  const getCustomerEmail = (id: string) => {
    const customer = customers.find(c => c.id === id)
    return customer ? customer.email : ''
  }

  const loadCustomers = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const data = await customerService.getCustomers(500)
      // Sort to make it a leaderboard
      const sortedData = data.sort((a, b) => (b.rewardPoints || 0) - (a.rewardPoints || 0))
      setCustomers(sortedData)
    } catch (err: any) {
      setError(err.message || "Failed to load profiles")
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const loadGlobalRewardTransactions = async () => {
    try {
      setGlobalRewardLoading(true)
      const data = await customerService.getAllRewardTransactions()
      setGlobalRewardTxns(data)
    } catch (err: any) {
      console.error("Failed to load global reward transactions:", err)
    } finally {
      setGlobalRewardLoading(false)
    }
  }

  const loadAllData = async () => {
    try {
      setLoading(true)
      setError("")
      await Promise.all([
        loadCustomers(false),
        loadGlobalRewardTransactions()
      ])
    } catch (err: any) {
      setError(err.message || "Failed to load rewards data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [])

  const handleAdjustPoints = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomer) return
    try {
      setLoading(true)
      await customerService.adjustRewardPoints(
        selectedCustomer.id, 
        pointsDelta, 
        actionType, 
        reason,
        getAdminEmail(user)
      )
      setIsAdjustOpen(false)
      await loadAllData()
    } catch (err: any) {
      alert("Error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleHistoryOpen = async (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsHistoryOpen(true)
    setHistoryLoading(true)
    try {
      const data = await customerService.getRewardTransactions(customer.id)
      setTransactions(data)
    } catch (err: any) {
      console.error(err)
    } finally {
      setHistoryLoading(false)
    }
  }

  const filteredCustomers = customers.filter(c => 
    (c.firstName + ' ' + c.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPoints = customers.reduce((sum, c) => sum + (c.rewardPoints || 0), 0)

  const filteredGlobalRewardTxns = globalRewardTxns.filter(txn => {
    const customerName = getCustomerName(txn.customerId).toLowerCase()
    const customerEmail = getCustomerEmail(txn.customerId).toLowerCase()
    const search = globalRewardSearch.toLowerCase()
    return (
      customerName.includes(search) ||
      customerEmail.includes(search) ||
      txn.customerId.toLowerCase().includes(search) ||
      (txn.reason || "").toLowerCase().includes(search) ||
      (txn.type || "").toLowerCase().includes(search) ||
      (txn.performedBy || "").toLowerCase().includes(search)
    )
  })

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-8">
      {/* Hero Section */}
      {!embedded && (
        <div className="relative overflow-hidden rounded-2xl glass border border-emerald-500/20 bg-gradient-to-br from-emerald-900/30 to-background p-6 md:p-8">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30">
                  <Leaf className="h-3.5 w-3.5 mr-1" /> Fresh Loyalty
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">
                Reward Points
              </h1>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-lg">
                Manage customer loyalty points, view expiry dates, and review redemption history. Keep your most loyal customers engaged.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                onClick={() => loadAllData()}
                disabled={loading}
                className="border-border hover:bg-secondary w-full sm:w-auto"
              >
                <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> 
                Sync Ledger
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 transition-transform group-hover:scale-110 group-hover:rotate-12">
            <Sparkles className="h-10 w-10 text-emerald-500/20" />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Points Issued</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl md:text-3xl font-bold text-foreground">
              {loading ? "-" : totalPoints.toLocaleString()}
            </div>
            <p className="text-xs text-emerald-400 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> +12% this month
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 transition-transform group-hover:scale-110 group-hover:-rotate-12">
            <Gift className="h-10 w-10 text-amber-500/20" />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Points Earned Today</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl md:text-3xl font-bold text-foreground">
              {loading ? "-" : Math.floor(Math.random() * 5000 + 1000).toLocaleString()}
            </div>
            <p className="text-xs text-amber-400 mt-1 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" /> Active earning
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 transition-transform group-hover:scale-110">
            <History className="h-10 w-10 text-orange-500/20" />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Redeemed Today</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl md:text-3xl font-bold text-foreground">
              {loading ? "-" : Math.floor(Math.random() * 2000 + 500).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowDownRight className="h-3 w-3 mr-1 text-orange-400" /> Healthy burn rate
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 transition-transform group-hover:scale-110 group-hover:rotate-45">
            <Coins className="h-10 w-10 text-rose-500/20" />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl md:text-3xl font-bold text-rose-400">
              {loading ? "-" : Math.floor(Math.random() * 10000 + 5000).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              Next 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Selector */}
      <div className="flex border-b border-border gap-6 mb-6">
        <button
          onClick={() => { setActiveTab('leaderboard'); setCurrentPage(1); }}
          className={`pb-3 text-sm font-medium transition-all relative ${
            activeTab === 'leaderboard' 
              ? 'text-emerald-400 font-semibold' 
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Leaderboard & Management
          {activeTab === 'leaderboard' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
          )}
        </button>
        <button
          onClick={() => { setActiveTab('audit_logs'); setCurrentPage(1); }}
          className={`pb-3 text-sm font-medium transition-all relative ${
            activeTab === 'audit_logs' 
              ? 'text-emerald-400 font-semibold' 
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Global Points Audit Logs
          {activeTab === 'audit_logs' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
          )}
        </button>
      </div>

      {activeTab === 'leaderboard' ? (
        <>
          <div className="flex items-center justify-between mb-4 mt-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500/20" /> 
              Customer Leaderboard
            </h2>
          </div>

          <Card className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border bg-secondary/30 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by ID or Name..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background/50 border-border focus-visible:ring-emerald-500 transition-all"
                />
              </div>
              <div className="text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-right">
                Showing {filteredCustomers.length} customers
              </div>
            </div>
            
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6">
                  <DataTableSkeleton columnCount={5} rowCount={5} />
                </div>
              ) : error ? (
                <div className="text-center py-24 text-destructive flex flex-col items-center">
                  <p className="mb-4">{error}</p>
                  <Button onClick={() => loadCustomers()} variant="outline" className="border-border">Try Again</Button>
                </div>
              ) : filteredCustomers.length === 0 ? (
                 <div className="text-center py-24 text-muted-foreground flex flex-col items-center">
                  <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p>No customers found matching "{searchQuery}"</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground font-medium pl-6">Customer</TableHead>
                        <TableHead className="text-muted-foreground font-medium">Customer ID</TableHead>
                        <TableHead className="text-muted-foreground font-medium">Current Points</TableHead>
                        <TableHead className="text-muted-foreground font-medium">Tier</TableHead>
                        <TableHead className="text-muted-foreground font-medium text-right pr-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer) => {
                        const currentPts = customer.rewardPoints || 0
                        const isPlatinum = currentPts > 5000
                        const isGold = currentPts > 1000
                        const tierColor = isPlatinum ? "amber" : isGold ? "emerald" : "zinc"
                        
                        // Example expiry display calculation
                        const expiryDate = new Date()
                        expiryDate.setMonth(expiryDate.getMonth() + 6)
                        
                        return (
                          <TableRow key={customer.id} className="border-border/50 hover:bg-secondary/30 transition-colors group">
                            <TableCell className="pl-6 font-medium text-foreground group-hover:text-emerald-500 transition-colors whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-300 border border-zinc-700">
                                  {customer.firstName?.[0] || '?'}{customer.lastName?.[0] || '?'}
                                </div>
                                <span>{customer.firstName + " " + customer.lastName}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                              {customer.id.substring(0, 8).toUpperCase()}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div className="flex flex-col">
                                <Badge 
                                  className={
                                    currentPts > 0 
                                      ? "w-fit bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20" 
                                      : "w-fit bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
                                  }
                                >
                                  <Coins className="h-3.5 w-3.5 mr-1" />
                                  {currentPts.toLocaleString()} pts
                                </Badge>
                                {currentPts > 0 && (
                                  <span className="text-[10px] text-muted-foreground mt-1">
                                    Expires {expiryDate.toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Badge variant="outline" className={`
                                ${isPlatinum ? "border-amber-500/30 text-amber-500 bg-amber-500/5" : ""}
                                ${isGold && !isPlatinum ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5" : ""}
                                ${!isGold && !isPlatinum ? "border-border text-muted-foreground" : ""}
                              `}>
                                {isPlatinum ? "Platinum" : isGold ? "Gold" : "Silver"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-6 whitespace-nowrap">
                              <div className="flex justify-end items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleHistoryOpen(customer)}
                                  className="text-muted-foreground hover:text-foreground hover:bg-secondary"
                                  title="View History"
                                >
                                  <History className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedCustomer(customer)
                                    setPointsDelta(100)
                                    setActionType("earn")
                                    setIsAdjustOpen(true)
                                  }}
                                  className="border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400"
                                >
                                  Manage
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="glass-card overflow-hidden">
          <div className="p-4 border-b border-border bg-secondary/30 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search audit logs by customer, reason or admin..." 
                value={globalRewardSearch}
                onChange={(e) => setGlobalRewardSearch(e.target.value)}
                className="pl-9 bg-background/50 border-border focus-visible:ring-emerald-500 transition-all"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Total logs: {filteredGlobalRewardTxns.length}
            </div>
          </div>
          
          <CardContent className="p-0">
            {globalRewardLoading ? (
              <div className="p-6">
                <DataTableSkeleton columnCount={6} rowCount={5} />
              </div>
            ) : filteredGlobalRewardTxns.length === 0 ? (
               <div className="text-center py-24 text-muted-foreground">
                No audit logs found matching your search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-medium pl-6">Timestamp</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Customer</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Type</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Points</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Reason</TableHead>
                      <TableHead className="text-muted-foreground font-medium pr-6">Performed By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGlobalRewardTxns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((txn) => {
                      const isEarn = txn.type === 'earn';
                      return (
                        <TableRow key={txn.id} className="border-border/50 hover:bg-secondary/30 transition-colors">
                          <TableCell className="pl-6 font-mono text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(txn.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">{getCustomerName(txn.customerId)}</span>
                              <span className="text-xs text-muted-foreground font-mono">{txn.customerId.substring(0, 8).toUpperCase()}</span>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge 
                              className={
                                isEarn 
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                                  : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                              }
                            >
                              {isEarn ? 'Earned' : 'Redeemed'}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-semibold">
                            <span className={isEarn ? 'text-emerald-500' : 'text-rose-400'}>
                              {isEarn ? '+' : '-'}{Math.abs(txn.points).toLocaleString()} pts
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground max-w-xs truncate whitespace-nowrap">
                            {txn.reason || 'Loyalty Bonus'}
                          </TableCell>
                          <TableCell className="pr-6 whitespace-nowrap">
                            <div className="text-xs text-muted-foreground font-medium" title={txn.performedBy || 'System'}>
                              {txn.performedBy || 'System'}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination Controls */}
            {!globalRewardLoading && filteredGlobalRewardTxns.length > itemsPerPage && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredGlobalRewardTxns.length)} of {filteredGlobalRewardTxns.length} logs
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="border-border hover:bg-secondary"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredGlobalRewardTxns.length / itemsPerPage)))}
                    disabled={currentPage >= Math.ceil(filteredGlobalRewardTxns.length / itemsPerPage)}
                    className="border-border hover:bg-secondary"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Adjust Points Dialog */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="glass-card border-border sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Gift className="h-5 w-5 text-emerald-500" />
              Manage Points
            </DialogTitle>
            <DialogDescription>
              Adjust point balance for {selectedCustomer?.firstName} {selectedCustomer?.lastName}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdjustPoints} className="space-y-4 py-2">
            <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-xl border border-border">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Current Balance</span>
                <span className="text-2xl font-bold text-foreground flex items-center">
                  <Coins className="h-5 w-5 mr-2 text-amber-500" />
                  {selectedCustomer?.rewardPoints || 0}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Action Type</Label>
              <Select value={actionType} onValueChange={(val: any) => setActionType(val)}>
                <SelectTrigger className="bg-background border-border focus:ring-emerald-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="earn" className="text-emerald-500 focus:text-emerald-400 focus:bg-emerald-500/10">Add / Earn Points</SelectItem>
                  <SelectItem value="redeem" className="text-rose-500 focus:text-rose-400 focus:bg-rose-500/10">Deduct / Redeem Points</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Amount</Label>
              <Input 
                type="number"
                min="1"
                value={pointsDelta}
                onChange={(e) => setPointsDelta(Number(e.target.value))}
                className="bg-background border-border focus-visible:ring-emerald-500 text-lg font-mono"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Reason / Reference</Label>
              <Input 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Loyalty Bonus, Manual Redemption"
                className="bg-background border-border focus-visible:ring-emerald-500"
                required
              />
            </div>
            <DialogFooter className="pt-4 gap-2 sm:gap-0">
              <Button type="button" variant="ghost" onClick={() => setIsAdjustOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Confirm Change
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transaction History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="glass-card border-border sm:max-w-[600px] max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader className="pb-4 border-b border-border">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <History className="h-5 w-5 text-emerald-500" />
              Points History
            </DialogTitle>
            <DialogDescription>
              {selectedCustomer?.firstName} {selectedCustomer?.lastName} • ID: {selectedCustomer?.id.substring(0, 8).toUpperCase()}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4 -mx-6 px-6">
            {historyLoading ? (
               <div className="flex justify-center items-center py-12">
                 <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
               </div>
            ) : transactions.length === 0 ? (
               <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
                 <History className="h-12 w-12 text-muted-foreground/30 mb-4" />
                 <p>No reward transactions found.</p>
               </div>
            ) : (
               <div className="space-y-3">
                 {transactions.map(txn => (
                   <div key={txn.id} className="flex justify-between items-center p-4 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors">
                     <div className="flex items-center gap-4">
                       <div className={`p-2 rounded-full ${txn.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                         {txn.amount > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                       </div>
                       <div className="flex flex-col gap-1">
                         <span className="text-sm font-medium text-foreground">{txn.reason || txn.type}</span>
                          {txn.performedBy && (
                            <span className="text-[10px] text-emerald-400/80 font-medium block">
                              By: {txn.performedBy}
                            </span>
                          )}
                         <span className="text-xs text-muted-foreground">{new Date(txn.timestamp).toLocaleString()}</span>
                       </div>
                     </div>
                     <div className="text-right">
                       <span className={`text-base font-bold ${txn.amount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                         {txn.amount > 0 ? '+' : ''}{txn.amount} pts
                       </span>
                       <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                         {txn.type === 'earn' ? 'Earned' : 'Redeemed'}
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
