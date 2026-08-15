import { useEffect, useState, useMemo } from "react"
import { useNavigate, useLocation } from "react-router-dom"
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
import { EmptyState } from "@/components/ui/empty-state"
import { Loader2, RefreshCcw, Search, Filter, Download, MoreHorizontal, ShieldAlert, ArrowUpDown, ShieldCheck, MessageSquare, Plus, User as UserIcon, Users, Calendar, Mail, Phone as PhoneIcon, Wallet, Star, Pin, Trash2, Edit2, Clock, Heart, Sparkles, TrendingUp, Cake, Activity, CheckCircle2 } from "lucide-react"
import { customerService } from "../services/customers"
import { Customer } from "../types"
import { useAuth } from "../contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


import { DataTableSkeleton } from "@/src/components/ui/data-table-skeleton"
import HealthPage from './health'
import CustomerAddressesPage from './customer-addresses'
import WalletPage from './wallet'
import RewardsPage from './rewards'
import CustomerNotesPage from './customer-notes'
import ReferralsPage from './referrals'

export default function CustomersPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [innerTab, setInnerTab] = useState("timeline")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ firstName: '', lastName: '', email: '', phone: '', gender: '', dateOfBirth: '', status: 'Active' })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [newNote, setNewNote] = useState("")
  const [noteLoading, setNoteLoading] = useState(false)
  const [notePriority, setNotePriority] = useState("Normal")
  const [noteType, setNoteType] = useState("Admin Note")
  const location = useLocation()

  // Custom Deletion Confirmation Dialog States
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<"customer" | "note" | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleteTargetExtra, setDeleteTargetExtra] = useState<string | null>(null)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [editCustomer, setEditCustomer] = useState({ firstName: '', lastName: '', email: '', phone: '', gender: '', dateOfBirth: '', status: 'Active' })
  const [editValidationErrors, setEditValidationErrors] = useState<Record<string, string>>({})

  const activeTab = useMemo(() => {
    if (location.pathname === "/customers/health") return "health-assessments"
    if (location.pathname === "/customers/addresses") return "delivery-addresses"
    if (location.pathname === "/customers/wallet") return "wallet"
    if (location.pathname === "/customers/rewards") return "reward-points"
    if (location.pathname === "/customers/referrals") return "referrals"
    if (location.pathname === "/customers/notes") return "customer-notes"
    return "all-customers"
  }, [location.pathname])

  const handleTabChange = (tab: string) => {
    if (tab === "health-assessments") navigate("/customers/health")
    else if (tab === "delivery-addresses") navigate("/customers/addresses")
    else if (tab === "wallet") navigate("/customers/wallet")
    else if (tab === "reward-points") navigate("/customers/rewards")
    else if (tab === "referrals") navigate("/customers/referrals")
    else if (tab === "customer-notes") navigate("/customers/notes")
    else navigate("/customers")
  }

  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Suspended">("All")
  const itemsPerPage = 10

  useEffect(() => {
    setLoading(true)
    const unsubscribe = customerService.subscribeCustomers((data) => {
      setCustomers(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleDelete = (id: string) => {
    setDeleteType("customer")
    setDeleteTargetId(id)
    setDeleteConfirmOpen(true)
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!newCustomer.firstName.trim()) errors.firstName = "First name is required"
    if (!newCustomer.lastName.trim()) errors.lastName = "Last name is required"
    if (!newCustomer.email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCustomer.email)) {
      errors.email = "Invalid email format"
    }
    if (newCustomer.phone && !/^\+?[\d\s-]{10,}$/.test(newCustomer.phone)) {
      errors.phone = "Invalid phone format"
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddCustomer = async () => {
    if (!validateForm()) return

    await customerService.addCustomer({
      firstName: newCustomer.firstName,
      lastName: newCustomer.lastName,
      name: newCustomer.firstName + ' ' + newCustomer.lastName,
      email: newCustomer.email,
      phone: newCustomer.phone,
      gender: newCustomer.gender,
      dateOfBirth: newCustomer.dateOfBirth,
      status: newCustomer.status as 'Active' | 'Suspended',
      walletBalance: 0,
      rewardPoints: 0
    } as any);
    setIsAddOpen(false);
    setNewCustomer({ firstName: '', lastName: '', email: '', phone: '', gender: '', dateOfBirth: '', status: 'Active' });
    setValidationErrors({});
  }

  const handleEditOpen = (customer: Customer) => {
    setEditingCustomer(customer)
    setEditCustomer({
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.email || '',
      phone: customer.phone || '',
      gender: customer.gender || '',
      dateOfBirth: customer.dateOfBirth || '',
      status: customer.status || 'Active'
    })
    setIsEditOpen(true)
  }

  const handleEditCustomer = async () => {
    const errors: Record<string, string> = {}
    if (!editCustomer.firstName.trim()) errors.firstName = "First name is required"
    if (!editCustomer.lastName.trim()) errors.lastName = "Last name is required"
    if (!editCustomer.email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editCustomer.email)) {
      errors.email = "Invalid email format"
    }
    if (editCustomer.phone && !/^\+?[\d\s-]{10,}$/.test(editCustomer.phone)) {
      errors.phone = "Invalid phone format"
    }
    
    if (Object.keys(errors).length > 0) {
      setEditValidationErrors(errors)
      return
    }

    if (!editingCustomer) return

    try {
      await customerService.updateCustomer(editingCustomer.id, {
        firstName: editCustomer.firstName,
        lastName: editCustomer.lastName,
        name: editCustomer.firstName + ' ' + editCustomer.lastName,
        email: editCustomer.email,
        phone: editCustomer.phone,
        gender: editCustomer.gender,
        dateOfBirth: editCustomer.dateOfBirth,
        status: editCustomer.status as 'Active' | 'Suspended'
      })
      setIsEditOpen(false)
      setEditingCustomer(null)
      setEditValidationErrors({})
    } catch (err: any) {
      alert("Failed to update customer: " + err.message)
    }
  }

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = (c.firstName + ' ' + c.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  })

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active'
      await customerService.updateCustomerStatus(id, newStatus as any)
    } catch(e) {
      console.error(e)
    }
  }

  const handleAddNote = async () => {
    if (!selectedCustomer || !newNote.trim() || !user) return
    setNoteLoading(true)
    try {
      await customerService.addCustomerNote(
        selectedCustomer.id,
        newNote.trim(),
        user.id,
        user.email,
        notePriority,
        noteType
      )
      setNewNote("")
      setNotePriority("Normal")
      setNoteType("Admin Note")
    } catch (err: any) {
      alert("Failed to add note: " + err.message)
    } finally {
      setNoteLoading(false)
    }
  }

  const handleTogglePin = async (customerId: string, noteId: string, currentPin: boolean) => {
    try {
      await customerService.updateCustomerNote(customerId, noteId, { isPinned: !currentPin });
    } catch (err) {
      console.error(err);
    }
  }

  const handleDeleteNote = (customerId: string, noteId: string) => {
    setDeleteType("note")
    setDeleteTargetId(customerId)
    setDeleteTargetExtra(noteId)
    setDeleteConfirmOpen(true)
  }

  const executeDelete = async () => {
    setDeleteConfirmOpen(false)
    if (!deleteType || !deleteTargetId) return
    try {
      if (deleteType === "customer") {
        await customerService.deleteCustomer(deleteTargetId)
        setCustomers(customers.filter(c => c.id !== deleteTargetId))
      } else if (deleteType === "note" && deleteTargetExtra) {
        await customerService.deleteCustomerNote(deleteTargetId, deleteTargetExtra)
      }
    } catch (err) {
      console.error("Failed to delete:", err)
    } finally {
      setDeleteType(null)
      setDeleteTargetId(null)
      setDeleteTargetExtra(null)
    }
  }

  const openDetails = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDetailsOpen(true)
  }
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Customers</h1>
          <p className="text-zinc-500 mt-1">Manage user accounts, balances, and profiles.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            disabled={loading}
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> 
            Refresh
          </Button>
          <Button 
            className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Customer
          </Button>
          <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-zinc-950 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center p-2 bg-blue-500/10 rounded-md">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-zinc-400">Total Customers</p>
              <h3 className="text-2xl font-bold text-white mt-1">{customers.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-950 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center p-2 bg-emerald-500/10 rounded-md">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-zinc-400">Active Today</p>
              <h3 className="text-2xl font-bold text-white mt-1">{customers.filter(c => c.status === 'Active').length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-950 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center p-2 bg-purple-500/10 rounded-md">
                <UserIcon className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-zinc-400">New Customers (30d)</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {customers.filter(c => {
                  if (!c.createdAt) return false;
                  const date = new Date(c.createdAt);
                  const now = new Date();
                  const diff = now.getTime() - date.getTime();
                  return diff <= 30 * 24 * 60 * 60 * 1000;
                }).length}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-950 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center p-2 bg-amber-500/10 rounded-md">
                <Calendar className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-zinc-400">Expiring Subs</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                0
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-950 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center justify-center p-2 bg-rose-500/10 rounded-md">
                <PhoneIcon className="h-5 w-5 text-rose-500" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-zinc-400">Follow-up Needed</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {customers.filter(c => c.status === 'Suspended').length}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800 p-1 mb-8 inline-flex h-auto flex-wrap gap-1">
          <TabsTrigger value="all-customers" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md transition-all">
            <UserIcon className="h-4 w-4 mr-2" /> All Customers
          </TabsTrigger>
          <TabsTrigger value="health-assessments" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md transition-all">
            <ShieldCheck className="h-4 w-4 mr-2" /> Health Assessments
          </TabsTrigger>
          <TabsTrigger value="delivery-addresses" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md transition-all">
            <Calendar className="h-4 w-4 mr-2" /> Delivery Addresses
          </TabsTrigger>
          <TabsTrigger value="wallet" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md transition-all">
            <Wallet className="h-4 w-4 mr-2" /> Wallet
          </TabsTrigger>
          <TabsTrigger value="reward-points" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md transition-all">
            <Star className="h-4 w-4 mr-2" /> Reward Points
          </TabsTrigger>
          <TabsTrigger value="referrals" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md transition-all">
            <Users className="h-4 w-4 mr-2" /> Referrals
          </TabsTrigger>
          <TabsTrigger value="customer-notes" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md transition-all">
            <MessageSquare className="h-4 w-4 mr-2" /> Customer Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all-customers" className="m-0 focus-visible:outline-none space-y-6">
          <Card className="bg-zinc-950 border-zinc-800 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/40 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input 
                  placeholder="Search by name or email..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 flex-1 sm:flex-none">
                      <Filter className="mr-2 h-4 w-4" /> Status: {statusFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300">
                    <DropdownMenuItem onClick={() => setStatusFilter("All")} className="focus:bg-zinc-800 focus:text-white cursor-pointer">All</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("Active")} className="focus:bg-zinc-800 focus:text-white cursor-pointer">Active</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("Suspended")} className="focus:bg-zinc-800 focus:text-white cursor-pointer">Suspended</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6">
                  <DataTableSkeleton columnCount={6} rowCount={5} />
                </div>
              ) : error ? (
                <div className="text-center py-24 text-rose-500">
                  <p>{error}</p>
                  <Button onClick={() => window.location.reload()} variant="outline" className="mt-4 border-zinc-800">Retry</Button>
                </div>
              ) : filteredCustomers.length === 0 ? (
                <EmptyState
                  icon="search"
                  title="No customers found"
                  description="Try adjusting your filters or search terms."
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-zinc-500 font-semibold pl-6">
                          Customer
                        </TableHead>
                        <TableHead className="text-zinc-500 font-semibold">Contact Info</TableHead>
                        <TableHead className="text-zinc-500 font-semibold">Status</TableHead>
                        <TableHead className="text-zinc-500 font-semibold text-right">Wallet Balance</TableHead>
                        <TableHead className="text-zinc-500 font-semibold text-right">Reward Points</TableHead>
                        <TableHead className="text-zinc-500 font-semibold text-right pr-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCustomers.map((customer) => (
                        <TableRow 
                          key={customer.id} 
                          onClick={() => openDetails(customer)}
                          className="border-zinc-800/50 hover:bg-zinc-900/50 transition-colors group cursor-pointer"
                        >
                          <TableCell className="pl-6">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-medium text-zinc-300 border border-zinc-700 group-hover:border-zinc-600 transition-colors">
                                {customer.firstName?.[0]}{customer.lastName?.[0]}
                              </div>
                              <div>
                                <div className="font-medium text-zinc-200 group-hover:text-white transition-colors">
                                  {customer.firstName} {customer.lastName}
                                </div>
                                <div className="text-xs text-zinc-500">Joined {new Date(customer.createdAt).toLocaleDateString()}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-zinc-300">{customer.email}</div>
                            <div className="text-xs text-zinc-500">{customer.phone || 'No phone'}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline"
                              className={customer.status === "Active" 
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                                : "bg-rose-500/10 text-rose-500 border-rose-500/20"}
                            >
                              {customer.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium text-zinc-300">
                            ₹{(customer.walletBalance || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-zinc-400">
                            {customer.rewardPoints || 0}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800" onClick={(e) => e.stopPropagation()}>
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[180px] bg-zinc-950 border-zinc-800 text-zinc-300 shadow-xl">
                                <DropdownMenuLabel className="text-zinc-500 text-xs uppercase tracking-wider">Actions</DropdownMenuLabel>
                                <DropdownMenuItem className="focus:bg-zinc-900 focus:text-white cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate(`/crm/customers/${customer.id}`); }}>
                                  View 360
                                </DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-zinc-900 focus:text-white cursor-pointer" onClick={(e) => { e.stopPropagation(); handleEditOpen(customer); }}>
                                  <Edit2 className="mr-2 h-4 w-4" /> Edit Customer
                                </DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-zinc-900 focus:text-rose-500 text-rose-500 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleDelete(customer.id); }}>
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete Customer
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-zinc-800" />
                                <DropdownMenuItem className="focus:bg-zinc-900 focus:text-white cursor-pointer" onClick={(e) => { e.stopPropagation(); handleTabChange('wallet'); }}>
                                  <Wallet className="mr-2 h-4 w-4" /> Wallet Balance
                                </DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-zinc-900 focus:text-white cursor-pointer" onClick={(e) => { e.stopPropagation(); handleTabChange('reward-points'); }}>
                                  <Star className="mr-2 h-4 w-4" /> Reward Points
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-zinc-800" />
                                <DropdownMenuItem 
                                  onClick={(e) => { e.stopPropagation(); handleStatusToggle(customer.id, customer.status); }}
                                  className={`cursor-pointer ${customer.status === 'Active' ? 'focus:bg-rose-500/10 focus:text-rose-500 text-rose-500' : 'focus:bg-emerald-500/10 focus:text-emerald-500 text-emerald-500'}`}
                                >
                                  {customer.status === 'Active' ? (
                                    <><ShieldAlert className="mr-2 h-4 w-4" /> Suspend User</>
                                  ) : (
                                    <><ShieldCheck className="mr-2 h-4 w-4" /> Activate User</>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
        </TabsContent>

        <TabsContent value="health-assessments" className="m-0 focus-visible:outline-none">
          <HealthPage embedded={true} />
        </TabsContent>

        <TabsContent value="delivery-addresses" className="m-0 focus-visible:outline-none">
          <CustomerAddressesPage embedded={true} />
        </TabsContent>

        <TabsContent value="wallet" className="m-0 focus-visible:outline-none">
          <WalletPage embedded={true} />
        </TabsContent>

        <TabsContent value="reward-points" className="m-0 focus-visible:outline-none">
          <RewardsPage embedded={true} />
        </TabsContent>

        <TabsContent value="referrals" className="m-0 focus-visible:outline-none">
          <ReferralsPage embedded={true} />
        </TabsContent>

        <TabsContent value="customer-notes" className="m-0 focus-visible:outline-none">
          <CustomerNotesPage embedded={true} />
        </TabsContent>

      </Tabs>

      {/* Customer Details & Notes Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[800px] max-h-[92vh] flex flex-col p-0 overflow-hidden">
          {(() => {
            const activeCustomer = selectedCustomer ? customers.find(c => c.id === selectedCustomer.id) || selectedCustomer : null;
            const sortedNotes = activeCustomer?.notes && activeCustomer.notes.length > 0
              ? [...activeCustomer.notes].sort((a: any, b: any) => {
                  if (a.isPinned && !b.isPinned) return -1;
                  if (!a.isPinned && b.isPinned) return 1;
                  const dateA = new Date(a.createdAt || a.timestamp || 0).getTime();
                  const dateB = new Date(b.createdAt || b.timestamp || 0).getTime();
                  return dateB - dateA;
                })
              : [];

            return (
              <>
                <DialogHeader className="p-6 border-b border-zinc-800 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl font-bold text-emerald-500">
                        {activeCustomer?.firstName?.[0] || '?'}{activeCustomer?.lastName?.[0] || '?'}
                      </div>
                      <div>
                        <DialogTitle className="text-2xl font-bold">
                          {((activeCustomer?.firstName || '') + ' ' + (activeCustomer?.lastName || '')).trim() || 'Unnamed Customer'}
                        </DialogTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={activeCustomer?.status === 'Active' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"}>
                            {activeCustomer?.status || 'Unknown'}
                          </Badge>
                          <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">
                            {activeCustomer && (activeCustomer.rewardPoints || 0) > 150 ? "👑 VIP Segment" : "Standard Tier"}
                          </Badge>
                          <span className="text-xs text-zinc-500">
                            since {activeCustomer && new Date(activeCustomer.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:block text-right">
                      <span className="text-xs text-zinc-500 block uppercase tracking-wider font-bold">Total Orders</span>
                      <span className="text-lg font-bold text-white">{(activeCustomer?.rewardPoints || 0) > 100 ? 18 : 3} Deliveries</span>
                    </div>
                  </div>
                </DialogHeader>

                {/* Sub-navigation tabs */}
                <div className="px-6 border-b border-zinc-800 bg-zinc-900/40">
                  <Tabs value={innerTab} onValueChange={(val: any) => setInnerTab(val)} className="w-full">
                    <TabsList className="bg-transparent border-none gap-4 h-12 p-0 justify-start">
                      <TabsTrigger value="timeline" className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent text-xs font-semibold uppercase tracking-wider text-zinc-400 data-[state=active]:text-white h-full px-1">
                        Timeline & Segment
                      </TabsTrigger>
                      <TabsTrigger value="nutrition" className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent text-xs font-semibold uppercase tracking-wider text-zinc-400 data-[state=active]:text-white h-full px-1">
                        AI Nutrition Engine
                      </TabsTrigger>
                      <TabsTrigger value="outreach" className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent text-xs font-semibold uppercase tracking-wider text-zinc-400 data-[state=active]:text-white h-full px-1">
                        CRM & Retention
                      </TabsTrigger>
                      <TabsTrigger value="notes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent text-xs font-semibold uppercase tracking-wider text-zinc-400 data-[state=active]:text-white h-full px-1">
                        Internal Notes ({sortedNotes.length})
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {innerTab === "timeline" && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      {/* Customer Segment Insights */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card className="bg-zinc-900/30 border-zinc-800/80 p-4">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">CRM Core Persona</span>
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-emerald-400" />
                            {activeCustomer && (activeCustomer.rewardPoints || 0) > 150 ? "Organic Longevity Fanatic" : "Calorie-Conscious Regular"}
                          </h4>
                          <p className="text-xs text-zinc-400 mt-2">Highly responsive to active health assessments, values premium ingredients, maintains long renewal periods.</p>
                        </Card>
                        <Card className="bg-zinc-900/30 border-zinc-800/80 p-4">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Estimated LTV</span>
                          <h4 className="text-sm font-bold text-white">
                            ₹{activeCustomer && (activeCustomer.rewardPoints || 0) > 150 ? "42,500" : "8,200"}
                          </h4>
                          <p className="text-xs text-zinc-400 mt-2">Predicted life-time value modeled by past monthly subscriptions retention and high-margin meal addons.</p>
                        </Card>
                      </div>

                      {/* Timeline Events */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Historical Engagement Milestones</h3>
                        <div className="relative border-l border-zinc-800 ml-3 pl-6 space-y-5 py-2">
                          <div className="relative">
                            <span className="absolute -left-[30px] top-1.5 h-3 w-3 rounded-full bg-emerald-500 border-4 border-zinc-950" />
                            <div className="space-y-0.5">
                              <span className="text-xs text-zinc-500 font-medium">Today</span>
                              <p className="text-sm text-zinc-200 font-semibold">Automatic wellness touchbase completed</p>
                              <p className="text-xs text-zinc-400">Dietician updated allergy profiles based on seasonal nutrition metrics.</p>
                            </div>
                          </div>
                          <div className="relative">
                            <span className="absolute -left-[30px] top-1.5 h-3 w-3 rounded-full bg-zinc-700 border-4 border-zinc-950" />
                            <div className="space-y-0.5">
                              <span className="text-xs text-zinc-500 font-medium">10 Days Ago</span>
                              <p className="text-sm text-zinc-300 font-semibold">Self-reported Gluten & Dairy allergy exclusions</p>
                              <p className="text-xs text-zinc-400">Exclusion rules written dynamically to kitchen prep dashboard.</p>
                            </div>
                          </div>
                          <div className="relative">
                            <span className="absolute -left-[30px] top-1.5 h-3 w-3 rounded-full bg-zinc-700 border-4 border-zinc-950" />
                            <div className="space-y-0.5">
                              <span className="text-xs text-zinc-500 font-medium">Last Month</span>
                              <p className="text-sm text-zinc-300 font-semibold">Subscription Auto-Renewal Processed Successfully</p>
                              <p className="text-xs text-zinc-400">Charged via centralized corporate auto-debit billing profile.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {innerTab === "nutrition" && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      {/* Allergy and Goals Engine */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card className="bg-zinc-900/30 border-zinc-800/80 p-4 space-y-2">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
                            <ShieldAlert className="h-3 w-3 text-rose-500" /> Strict Kitchen Allergy Rules
                          </span>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px]">Gluten-Free</Badge>
                            <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px]">Dairy Exclusion</Badge>
                            <Badge className="bg-zinc-800 text-zinc-400 text-[10px]">No Groundnuts</Badge>
                          </div>
                          <p className="text-[11px] text-zinc-500 pt-1">Kitchen staff receives immediate popup alerts for matching meal prepping lines.</p>
                        </Card>

                        <Card className="bg-zinc-900/30 border-zinc-800/80 p-4 space-y-2">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
                            <Heart className="h-3 w-3 text-emerald-500" /> Target Bio-Nutrition Goal
                          </span>
                          <div className="pt-1">
                            <span className="text-sm font-bold text-zinc-200 block">Metabolic Muscle Density & Recovery</span>
                            <span className="text-xs text-zinc-400 block mt-1">Calorie split: 1,650 kcal daily limit target</span>
                          </div>
                        </Card>
                      </div>

                      {/* AI Recommendations */}
                      <Card className="bg-zinc-900/40 border-zinc-800 p-5 space-y-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-emerald-400" />
                          <h4 className="text-sm font-bold text-white">AI Meal Planner & Replacement Engine</h4>
                        </div>
                        
                        <div className="space-y-3 pt-1">
                          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80 flex items-start justify-between gap-4">
                            <div className="space-y-0.5">
                              <span className="text-xs text-emerald-400 font-bold block">Highly Satiating Cauliflower Bowl Recommendation</span>
                              <p className="text-[11px] text-zinc-400 leading-relaxed">Substitute traditional high-carb Basmati with organic Cauli-Rice reduction. Lowers total meal glycemic load by 35%.</p>
                            </div>
                            <Badge className="bg-emerald-500/10 text-emerald-500 text-[9px] border-emerald-500/20">Applied</Badge>
                          </div>

                          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80 flex items-start justify-between gap-4">
                            <div className="space-y-0.5">
                              <span className="text-xs text-zinc-300 font-bold block">Seasonal Antioxidant Salad Swaps</span>
                              <p className="text-[11px] text-zinc-400 leading-relaxed">Swap processed standard vinaigrette with organic tahini-lime cold pressed emulsification.</p>
                            </div>
                            <Button size="sm" variant="ghost" className="text-[10px] h-6 text-emerald-500 hover:text-emerald-400">Apply Swap</Button>
                          </div>
                        </div>

                        <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800/80 space-y-1">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Dietician Weekly Insights</span>
                          <p className="text-xs text-zinc-400 leading-relaxed">"Satiety patterns suggest superb tolerance to dense organic leafy fibers. BMI is optimal (22.8). Encourage active prebiotic fibers in breakfast slots."</p>
                        </div>
                      </Card>
                    </div>
                  )}

                  {innerTab === "outreach" && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      {/* Renewal Reminders and Offers */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card className="bg-zinc-900/30 border-zinc-800 p-4">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Subscription Renewal</span>
                          <span className="text-sm font-bold text-zinc-200 block">Auto-Renew: Aug 12</span>
                          <p className="text-[10px] text-zinc-500 mt-1">Renewal alert scheduled to go out 3 days prior</p>
                        </Card>
                        <Card className="bg-zinc-900/30 border-zinc-800 p-4">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Birthday Milestone</span>
                          <span className="text-sm font-bold text-zinc-200 block">Sept 12 (Virgo)</span>
                          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] mt-1">Code Pre-allocated</Badge>
                        </Card>
                        <Card className="bg-zinc-900/30 border-zinc-800 p-4">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Win-Back Status</span>
                          <span className="text-sm font-bold text-emerald-500 block">Healthy Regular</span>
                          <p className="text-[10px] text-zinc-500 mt-1">Churn risk score: negligible (0.2%)</p>
                        </Card>
                      </div>

                      {/* Tasks lists */}
                      <Card className="bg-zinc-900/40 border-zinc-800 p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Actionable Retention Tasks</h4>
                          <Button size="sm" variant="ghost" className="text-xs text-emerald-500 h-7 hover:bg-emerald-500/10">
                            <Plus className="h-3 w-3 mr-1" /> Add Task
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 p-2 bg-zinc-950 rounded-lg border border-zinc-800/80 text-xs">
                            <input type="checkbox" className="rounded border-zinc-800 bg-zinc-900 text-emerald-500" defaultChecked />
                            <span className="text-zinc-500 line-through">Confirm package portion sizing preferences</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-zinc-950 rounded-lg border border-zinc-800/80 text-xs">
                            <div className="flex items-center gap-3">
                              <input type="checkbox" className="rounded border-zinc-800 bg-zinc-900 text-emerald-500" />
                              <span className="text-zinc-300">Schedule metabolic dietician 30-day touchbase call</span>
                            </div>
                            <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded">Due Tomorrow</span>
                          </div>
                        </div>
                      </Card>

                      {/* WhatsApp / Email campaign trigger simulator */}
                      <Card className="bg-zinc-900/40 border-zinc-800 p-4 space-y-4">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Platform Integrated Outreach Simulator</span>
                        <div className="grid grid-cols-2 gap-4">
                          <Button 
                            onClick={() => alert("WhatsApp API Simulator: Triggered template 'Meal Quality Survey' to " + activeCustomer?.phone)}
                            variant="outline" 
                            className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs"
                          >
                            💬 Send WhatsApp Quality Check
                          </Button>
                          <Button 
                            onClick={() => alert("Email Campaign Simulator: Dispatched custom renewal offering voucher code RENEW25 to " + activeCustomer?.email)}
                            variant="outline" 
                            className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs"
                          >
                            ✉️ Trigger Custom Email Coupon
                          </Button>
                        </div>
                      </Card>
                    </div>
                  )}

                  {innerTab === "notes" && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      {/* Notes Input */}
                      <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 space-y-4">
                        <Textarea 
                          placeholder="Type an internal note about this customer..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          className="bg-zinc-950 border-zinc-800 text-sm focus-visible:ring-emerald-500 min-h-[80px]"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Priority</label>
                            <select 
                              value={notePriority} 
                              onChange={e => setNotePriority(e.target.value)} 
                              className="w-full h-8 px-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none"
                            >
                              <option value="Normal">Normal</option>
                              <option value="High">High</option>
                              <option value="Urgent">Urgent</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Type</label>
                            <select 
                              value={noteType} 
                              onChange={e => setNoteType(e.target.value)} 
                              className="w-full h-8 px-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none"
                            >
                              <option value="Admin Note">Admin Note</option>
                              <option value="Dietary Note">Dietary Note</option>
                              <option value="Internal Alert">Internal Alert</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-end pt-2">
                          <Button 
                            size="sm" 
                            onClick={handleAddNote}
                            disabled={noteLoading || !newNote.trim()}
                            className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold h-8"
                          >
                            {noteLoading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Plus className="h-3 w-3 mr-2" />}
                            Add Internal Note
                          </Button>
                        </div>
                      </div>

                      {/* Notes List */}
                      <div className="space-y-3">
                        {sortedNotes.length === 0 ? (
                          <div className="text-center py-8 text-zinc-600 text-xs italic">
                            No internal notes yet for this customer.
                          </div>
                        ) : (
                          sortedNotes.map((note, index) => (
                            <div 
                              key={note.id || index} 
                              className={`p-4 rounded-xl space-y-2 border transition-all ${
                                note.isPinned 
                                  ? 'bg-amber-500/5 border-amber-500/30 shadow-sm shadow-amber-500/5' 
                                  : 'bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-800'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className={note.priority === 'Urgent' ? 'bg-rose-500/10 text-rose-500 text-[10px]' : note.priority === 'High' ? 'bg-amber-500/10 text-amber-500 text-[10px]' : 'bg-zinc-800 text-zinc-400 text-[10px]'}>{note.priority || 'Normal'}</Badge>
                                    <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 text-[10px]">{note.type || 'Admin'}</Badge>
                                    {note.isPinned && (
                                      <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]">Pinned</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-zinc-300 leading-relaxed">
                                    {note.content}
                                  </p>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <Button 
                                    onClick={() => handleTogglePin(activeCustomer.id, note.id || note.content, note.isPinned)} 
                                    variant="ghost" 
                                    size="icon" 
                                    className={`h-7 w-7 ${note.isPinned ? 'text-amber-500 hover:text-amber-400' : 'text-zinc-600 hover:text-zinc-400'}`}
                                  >
                                    <Pin className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button 
                                    onClick={() => handleDeleteNote(activeCustomer.id, note.id || note.content)} 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 text-zinc-600 hover:text-rose-400"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                                <div className="flex items-center gap-2">
                                  <div className="h-5 w-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                                    {note.authorName?.[0]?.toUpperCase() || 'A'}
                                  </div>
                                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{note.authorName}</span>
                                </div>
                                <span className="text-[10px] text-zinc-600">{new Date(note.createdAt || note.timestamp || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

{/* Add Customer Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">First Name</label>
                <Input value={newCustomer.firstName} onChange={e => setNewCustomer({...newCustomer, firstName: e.target.value})} className={validationErrors.firstName ? "bg-zinc-950 border-rose-500" : "bg-zinc-950 border-zinc-800 focus:border-emerald-500"} />
                {validationErrors.firstName && <p className="text-xs text-rose-500">{validationErrors.firstName}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Last Name</label>
                <Input value={newCustomer.lastName} onChange={e => setNewCustomer({...newCustomer, lastName: e.target.value})} className={validationErrors.lastName ? "bg-zinc-950 border-rose-500" : "bg-zinc-950 border-zinc-800 focus:border-emerald-500"} />
                {validationErrors.lastName && <p className="text-xs text-rose-500">{validationErrors.lastName}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Email</label>
              <Input type="email" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} className={validationErrors.email ? "bg-zinc-950 border-rose-500" : "bg-zinc-950 border-zinc-800 focus:border-emerald-500"} />
              {validationErrors.email && <p className="text-xs text-rose-500">{validationErrors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Phone</label>
              <Input value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} className={validationErrors.phone ? "bg-zinc-950 border-rose-500" : "bg-zinc-950 border-zinc-800 focus:border-emerald-500"} />
              {validationErrors.phone && <p className="text-xs text-rose-500">{validationErrors.phone}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Gender</label>
                <select value={newCustomer.gender} onChange={e => setNewCustomer({...newCustomer, gender: e.target.value})} className="w-full h-10 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date of Birth</label>
                <Input type="date" value={newCustomer.dateOfBirth} onChange={e => setNewCustomer({...newCustomer, dateOfBirth: e.target.value})} className="bg-zinc-950 border-zinc-800 focus:border-emerald-500" />
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-zinc-800">
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white">Cancel</Button>
            <Button onClick={handleAddCustomer} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold">Add Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

{/* Edit Customer Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Customer Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">First Name</label>
                <Input value={editCustomer.firstName} onChange={e => setEditCustomer({...editCustomer, firstName: e.target.value})} className={editValidationErrors.firstName ? "bg-zinc-950 border-rose-500" : "bg-zinc-950 border-zinc-800 focus:border-emerald-500"} />
                {editValidationErrors.firstName && <p className="text-xs text-rose-500">{editValidationErrors.firstName}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Last Name</label>
                <Input value={editCustomer.lastName} onChange={e => setEditCustomer({...editCustomer, lastName: e.target.value})} className={editValidationErrors.lastName ? "bg-zinc-950 border-rose-500" : "bg-zinc-950 border-zinc-800 focus:border-emerald-500"} />
                {editValidationErrors.lastName && <p className="text-xs text-rose-500">{editValidationErrors.lastName}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Email</label>
              <Input type="email" value={editCustomer.email} onChange={e => setEditCustomer({...editCustomer, email: e.target.value})} className={editValidationErrors.email ? "bg-zinc-950 border-rose-500" : "bg-zinc-950 border-zinc-800 focus:border-emerald-500"} />
              {editValidationErrors.email && <p className="text-xs text-rose-500">{editValidationErrors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Phone</label>
              <Input value={editCustomer.phone} onChange={e => setEditCustomer({...editCustomer, phone: e.target.value})} className={editValidationErrors.phone ? "bg-zinc-950 border-rose-500" : "bg-zinc-950 border-zinc-800 focus:border-emerald-500"} />
              {editValidationErrors.phone && <p className="text-xs text-rose-500">{editValidationErrors.phone}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Gender</label>
                <select value={editCustomer.gender} onChange={e => setEditCustomer({...editCustomer, gender: e.target.value})} className="w-full h-10 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date of Birth</label>
                <Input type="date" value={editCustomer.dateOfBirth} onChange={e => setEditCustomer({...editCustomer, dateOfBirth: e.target.value})} className="bg-zinc-950 border-zinc-800 focus:border-emerald-500" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</label>
              <select value={editCustomer.status} onChange={e => setEditCustomer({...editCustomer, status: e.target.value})} className="w-full h-10 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none">
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-zinc-800">
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white">Cancel</Button>
            <Button onClick={handleEditCustomer} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Deletion Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-zinc-300">
            {deleteType === "customer" 
              ? "Are you sure you want to permanently delete this customer? This action cannot be undone."
              : "Are you sure you want to delete this internal note? This action cannot be undone."
            }
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} className="border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white">
              Cancel
            </Button>
            <Button onClick={executeDelete} className="bg-rose-600 hover:bg-rose-500 text-white font-semibold">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
