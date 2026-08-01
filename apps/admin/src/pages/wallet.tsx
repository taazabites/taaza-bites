import { getAdminEmail } from '../utils/admin';
import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, RefreshCcw, Search, Wallet, ArrowUpRight, IndianRupee, History } from "lucide-react"
import { customerService } from "../services/customers"
import { Customer } from "../types"
import { useAuth } from "../contexts/auth-context"
import { DataTableSkeleton } from "@/src/components/ui/data-table-skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export default function WalletPage({ embedded = false }: { embedded?: boolean }) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const { user } = useAuth()

  // Tab state
  const [activeTab, setActiveTab] = useState<'accounts' | 'audit_logs'>('accounts')

  // Adjust balance dialog states
  const [isAdjustOpen, setIsAdjustOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [adjustType, setAdjustType] = useState<'Wallet Credit' | 'Wallet Debit'>('Wallet Credit')
  const [adjustAmount, setAdjustAmount] = useState<number>(500)
  const [adjustReason, setAdjustReason] = useState<string>("Admin Adjustment")

  // History dialog state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [transactions, setTransactions] = useState<any[]>([])
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null)

  // Global transaction history states
  const [globalTransactions, setGlobalTransactions] = useState<any[]>([])
  const [globalTxnLoading, setGlobalTxnLoading] = useState(false)
  const [globalTxnSearch, setGlobalTxnSearch] = useState("")

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
      setError("")
      const data = await customerService.getCustomers()
      setCustomers(data)
    } catch (err: any) {
      setError(err.message || "Failed to load customer wallets")
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const loadGlobalTransactions = async () => {
    try {
      setGlobalTxnLoading(true)
      const data = await customerService.getAllTransactions()
      setGlobalTransactions(data)
    } catch (err: any) {
      console.error("Failed to load global transactions:", err)
    } finally {
      setGlobalTxnLoading(false)
    }
  }

  const loadAllData = async () => {
    try {
      setLoading(true)
      setError("")
      await Promise.all([
        loadCustomers(false),
        loadGlobalTransactions()
      ])
    } catch (err: any) {
      setError(err.message || "Failed to load wallet data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [])

  const handleAdjustOpen = (customer: Customer, type: 'Wallet Credit' | 'Wallet Debit') => {
    setSelectedCustomer(customer)
    setAdjustType(type)
    setAdjustAmount(500)
    setAdjustReason("Admin Adjustment")
    setIsAdjustOpen(true)
  }

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomer || !user) return
    if (adjustAmount <= 0) {
      alert("Amount must be greater than 0")
      return
    }
    
    try {
      setLoading(true)
      await customerService.adjustWalletBalance(
        selectedCustomer.id,
        adjustAmount,
        adjustType,
        adjustReason,
        getAdminEmail(user)
      )
      setIsAdjustOpen(false)
      await loadAllData()
    } catch (err: any) {
      alert("Failed to adjust wallet balance: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleHistoryOpen = async (customer: Customer) => {
    setHistoryCustomer(customer)
    setIsHistoryOpen(true)
    setHistoryLoading(true)
    try {
      const data = await customerService.getTransactionsByCustomerId(customer.id)
      setTransactions(data)
    } catch (err: any) {
      console.error(err)
    } finally {
      setHistoryLoading(false)
    }
  }

  const filteredCustomers = customers.filter(c => 
    (c.firstName + ' ' + c.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalWalletReserve = customers.reduce((sum, c) => sum + (c.walletBalance || 0), 0)

  const filteredGlobalTxns = globalTransactions.filter(txn => {
    const customerName = getCustomerName(txn.customerId).toLowerCase()
    const customerEmail = getCustomerEmail(txn.customerId).toLowerCase()
    const search = globalTxnSearch.toLowerCase()
    return (
      customerName.includes(search) ||
      customerEmail.includes(search) ||
      txn.customerId.toLowerCase().includes(search) ||
      (txn.method || "").toLowerCase().includes(search) ||
      (txn.type || "").toLowerCase().includes(search) ||
      (txn.performedBy || "").toLowerCase().includes(search)
    )
  })
  const highestBalance = customers.length > 0 ? Math.max(...customers.map(c => c.walletBalance || 0)) : 0
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {!embedded && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Wallet Management</h1>
            <p className="text-zinc-500 mt-1">Audit customer wallets, manage virtual credits, and view transaction logs.</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => loadAllData()}
              disabled={loading}
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> 
              Refresh
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-zinc-950/50 backdrop-blur-xl border-zinc-800/60 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Outstandings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-500" />
              ₹{loading ? "-" : totalWalletReserve.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Total active wallet liability pool</p>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-950/50 backdrop-blur-xl border-zinc-800/60 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Peak Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-purple-500" />
              ₹{loading ? "-" : highestBalance.toLocaleString()}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Highest individual customer wallet credit</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/50 backdrop-blur-xl border-zinc-800/60 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Wallet Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-blue-500" />
              {loading ? "-" : customers.length}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Total activated customer wallets</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Selector */}
      <div className="flex border-b border-zinc-800/80 gap-6 mb-6">
        <button
          onClick={() => { setActiveTab('accounts'); setCurrentPage(1); }}
          className={`pb-3 text-sm font-medium transition-all relative ${
            activeTab === 'accounts' 
              ? 'text-emerald-400 font-semibold' 
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Wallet Accounts
          {activeTab === 'accounts' && (
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
          Global Audit Logs
          {activeTab === 'audit_logs' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
          )}
        </button>
      </div>

      {activeTab === 'accounts' ? (
        <Card className="bg-zinc-950/50 backdrop-blur-xl border-zinc-800/60 shadow-lg overflow-hidden">
          <div className="p-4 border-b border-zinc-800/60 bg-zinc-900/20 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                placeholder="Search by ID, Name or Email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500"
              />
            </div>
          </div>
          
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6">
                <DataTableSkeleton columnCount={5} rowCount={5} />
              </div>
            ) : error ? (
              <div className="text-center py-24 text-rose-500">
                <p>{error}</p>
                <Button onClick={loadAllData} variant="outline" className="mt-4 border-zinc-800">Retry</Button>
              </div>
            ) : filteredCustomers.length === 0 ? (
               <div className="text-center py-24 text-zinc-500">
                No wallets found matching your search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-zinc-400 font-medium pl-6">Customer</TableHead>
                      <TableHead className="text-zinc-400 font-medium">Customer ID</TableHead>
                      <TableHead className="text-zinc-400 font-medium">Email</TableHead>
                      <TableHead className="text-zinc-400 font-medium">Wallet Balance</TableHead>
                      <TableHead className="text-zinc-400 font-medium text-right pr-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCustomers.map((customer) => (
                      <TableRow key={customer.id} className="border-zinc-800/50 hover:bg-zinc-900/50 transition-colors group">
                        <TableCell className="pl-6 font-medium text-zinc-100 group-hover:text-emerald-500 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-300 border border-zinc-700">
                              {customer.firstName?.[0] || '?'}{customer.lastName?.[0] || '?'}
                            </div>
                            <span>{customer.firstName + " " + customer.lastName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-zinc-400">
                          {customer.id.substring(0, 10).toUpperCase()}
                        </TableCell>
                        <TableCell className="text-zinc-300">
                          {customer.email}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              (customer.walletBalance || 0) > 0 
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-sm py-1" 
                                : "bg-zinc-900 text-zinc-400 border-zinc-800 text-sm py-1"
                            }
                          >
                            ₹{(customer.walletBalance || 0).toLocaleString()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6 space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleHistoryOpen(customer)}
                            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                            title="View History"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAdjustOpen(customer, 'Wallet Credit')}
                            className="border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                          >
                            Credit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAdjustOpen(customer, 'Wallet Debit')}
                            className="border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
                          >
                            Debit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {/* Pagination Controls */}
            {!loading && !error && filteredCustomers.length > itemsPerPage && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
                <div className="text-sm text-zinc-400">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} entries
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
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage >= totalPages}
                    className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-zinc-950/50 backdrop-blur-xl border-zinc-800/60 shadow-lg overflow-hidden">
          <div className="p-4 border-b border-zinc-800/60 bg-zinc-900/20 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                placeholder="Search audit logs by name, reason or admin..." 
                value={globalTxnSearch}
                onChange={(e) => setGlobalTxnSearch(e.target.value)}
                className="pl-9 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500"
              />
            </div>
            <div className="text-sm text-zinc-400">
              Total logs: {filteredGlobalTxns.length}
            </div>
          </div>
          
          <CardContent className="p-0">
            {globalTxnLoading ? (
              <div className="p-6">
                <DataTableSkeleton columnCount={6} rowCount={5} />
              </div>
            ) : filteredGlobalTxns.length === 0 ? (
               <div className="text-center py-24 text-zinc-500">
                No audit logs found matching your search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-zinc-400 font-medium pl-6">Timestamp</TableHead>
                      <TableHead className="text-zinc-400 font-medium">Customer</TableHead>
                      <TableHead className="text-zinc-400 font-medium">Adjustment Type</TableHead>
                      <TableHead className="text-zinc-400 font-medium">Amount</TableHead>
                      <TableHead className="text-zinc-400 font-medium">Method / Reason</TableHead>
                      <TableHead className="text-zinc-400 font-medium pr-6">Performed By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGlobalTxns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((txn) => {
                      const isCredit = txn.amount > 0 || txn.type === 'Wallet Credit';
                      return (
                        <TableRow key={txn.id} className="border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                          <TableCell className="pl-6 font-mono text-xs text-zinc-400">
                            {new Date(txn.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-zinc-100">{getCustomerName(txn.customerId)}</span>
                              <span className="text-xs text-zinc-500 font-mono">{txn.customerId.substring(0, 10).toUpperCase()}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                isCredit 
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                                  : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                              }
                            >
                              {txn.type || (isCredit ? 'Wallet Credit' : 'Wallet Debit')}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-zinc-200">
                            <span className={isCredit ? 'text-emerald-500' : 'text-rose-400'}>
                              {isCredit ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-zinc-300 max-w-xs truncate">
                            {txn.method || 'System'}
                          </TableCell>
                          <TableCell className="pr-6">
                            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                              <span className="truncate max-w-[150px]" title={txn.performedBy || 'System'}>
                                {txn.performedBy || 'System'}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination Controls for Global Log */}
            {!globalTxnLoading && filteredGlobalTxns.length > itemsPerPage && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
                <div className="text-sm text-zinc-400">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredGlobalTxns.length)} of {filteredGlobalTxns.length} logs
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
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredGlobalTxns.length / itemsPerPage)))}
                    disabled={currentPage >= Math.ceil(filteredGlobalTxns.length / itemsPerPage)}
                    className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Adjust Balance Dialog */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{adjustType === 'Wallet Credit' ? 'Credit' : 'Debit'} Wallet Balance</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdjustBalance} className="space-y-4 py-4">
            <div className="flex justify-between items-center p-3 bg-zinc-900 rounded-lg border border-zinc-800">
              <div>
                <span className="text-xs text-zinc-500 uppercase tracking-wider block">Current Wallet Balance</span>
                <span className="text-lg font-bold text-white">₹{(selectedCustomer?.walletBalance || 0).toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-500 uppercase tracking-wider block">Impact</span>
                <span className={`text-lg font-bold ${adjustType === 'Wallet Credit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {adjustType === 'Wallet Credit' ? '+' : '-'} ₹{adjustAmount.toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="adjust-amount" className="text-zinc-300">Adjustment Amount (₹)</Label>
              <Input 
                id="adjust-amount"
                type="number"
                min="1"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(Number(e.target.value))}
                className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="adjust-reason" className="text-zinc-300">Reason</Label>
              <Input 
                id="adjust-reason"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="e.g. Refund, Promotional Credit..."
                className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500"
                required
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsAdjustOpen(false)} className="text-zinc-400 hover:text-white">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className={`${adjustType === 'Wallet Credit' ? 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950' : 'bg-rose-500 hover:bg-rose-400 text-rose-950'} font-medium`}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Confirm {adjustType === 'Wallet Credit' ? 'Credit' : 'Debit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transaction History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Wallet History</DialogTitle>
            <p className="text-zinc-400 text-sm">{historyCustomer?.firstName} {historyCustomer?.lastName}</p>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4 pr-2">
            {historyLoading ? (
               <div className="flex justify-center items-center py-12">
                 <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
               </div>
            ) : transactions.length === 0 ? (
               <div className="text-center py-12 text-zinc-500">
                 No transactions found for this customer.
               </div>
            ) : (
               <div className="space-y-3">
                 {transactions.map(txn => (
                   <div key={txn.id} className="flex justify-between items-center p-3 rounded-lg border border-zinc-800 bg-zinc-900/50">
                     <div className="flex flex-col gap-1">
                       <span className="text-sm font-medium text-white">{txn.method || txn.type}</span>
                       <span className="text-xs text-zinc-500">{new Date(txn.timestamp).toLocaleString()}</span>
                     </div>
                     <div className="text-right">
                       <span className={`text-base font-bold ${txn.amount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                         {txn.amount > 0 ? '+' : ''}{txn.amount}
                       </span>
                       <div className="text-[10px] uppercase tracking-wider text-zinc-500 mt-0.5">{txn.status}</div>
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
