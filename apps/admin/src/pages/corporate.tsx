import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { 
  Building2, 
  Users, 
  Plus, 
  Search, 
  CreditCard, 
  Calendar, 
  Truck, 
  BarChart3, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  Trash2, 
  Download, 
  Upload, 
  DollarSign, 
  FileSpreadsheet, 
  ChefHat, 
  ShieldAlert,
  ArrowRight
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts"

interface Company {
  id: string
  name: string
  gstin: string
  billingCycle: "Monthly" | "Bi-weekly" | "Weekly"
  creditLimit: number
  balanceUsed: number
  employeeCount: number
  deliverySlot: string
  address: string
  assignedKitchen: string
  status: "Active" | "Suspended" | "Pending Approval"
}

interface Employee {
  id: string
  companyId: string
  companyName: string
  name: string
  email: string
  phone: string
  assignedPlan: string
  status: "Active" | "Inactive"
  deliveryTime: string
}

interface Invoice {
  id: string
  companyName: string
  billingPeriod: string
  amount: number
  dueDate: string
  status: "Paid" | "Overdue" | "Unpaid"
}

// Initial Mock Corporate Data
const INITIAL_COMPANIES: Company[] = [
  {
    id: "corp_001",
    name: "Google India Pvt Ltd",
    gstin: "29AABCD1234F1Z5",
    billingCycle: "Monthly",
    creditLimit: 500000,
    balanceUsed: 142000,
    employeeCount: 45,
    deliverySlot: "12:15 PM - 12:45 PM",
    address: "RMZ Infinity, Old Madras Road, Bengaluru",
    assignedKitchen: "Central Indiranagar Kitchen",
    status: "Active"
  },
  {
    id: "corp_002",
    name: "Infosys Campus",
    gstin: "29BBCCD5678K2Z9",
    billingCycle: "Monthly",
    creditLimit: 800000,
    balanceUsed: 312000,
    employeeCount: 92,
    deliverySlot: "12:30 PM - 01:00 PM",
    address: "Electronic City Phase 1, Bengaluru",
    assignedKitchen: "Electronic City Hub",
    status: "Active"
  },
  {
    id: "corp_003",
    name: "Razorpay Software",
    gstin: "29EEFFD9876J3Z3",
    billingCycle: "Bi-weekly",
    creditLimit: 300000,
    balanceUsed: 98000,
    employeeCount: 28,
    deliverySlot: "12:00 PM - 12:30 PM",
    address: "Sony World Signal, Koramangala, Bengaluru",
    assignedKitchen: "Koramangala Cloud Kitchen",
    status: "Active"
  },
  {
    id: "corp_004",
    name: "HDFC Bank Corporate",
    gstin: "27AABCH4567M1ZR",
    billingCycle: "Monthly",
    creditLimit: 200000,
    balanceUsed: 0,
    employeeCount: 12,
    deliverySlot: "01:00 PM - 01:30 PM",
    address: "Richmond Road Office, Bengaluru",
    assignedKitchen: "Central Indiranagar Kitchen",
    status: "Pending Approval"
  }
]

const INITIAL_EMPLOYEES: Employee[] = [
  { id: "emp_101", companyId: "corp_001", companyName: "Google India Pvt Ltd", name: "Ananya Nair", email: "ananyanair@google.com", phone: "+91 98765 43210", assignedPlan: "Keto Weight-Loss Box (Lunch)", status: "Active", deliveryTime: "12:15 PM" },
  { id: "emp_102", companyId: "corp_001", companyName: "Google India Pvt Ltd", name: "Rohan Das", email: "rohandas@google.com", phone: "+91 91234 56789", assignedPlan: "Balanced Indian Low-Carb Meal", status: "Active", deliveryTime: "12:15 PM" },
  { id: "emp_103", companyId: "corp_001", companyName: "Google India Pvt Ltd", name: "Vikram Malhotra", email: "vmalhotra@google.com", phone: "+91 88223 34455", assignedPlan: "High-Protein Athletic Fuel", status: "Active", deliveryTime: "12:15 PM" },
  { id: "emp_104", companyId: "corp_002", companyName: "Infosys Campus", name: "Pooja Hegde", email: "pooja.hegde@infosys.com", phone: "+91 77665 54433", assignedPlan: "Balanced Indian Low-Carb Meal", status: "Active", deliveryTime: "12:45 PM" },
  { id: "emp_105", companyId: "corp_002", companyName: "Infosys Campus", name: "Amit Sharma", email: "amit.sharma@infosys.com", phone: "+91 99887 76655", assignedPlan: "Calorie-Deficit Diabetic Salad", status: "Active", deliveryTime: "12:45 PM" },
  { id: "emp_106", companyId: "corp_003", companyName: "Razorpay Software", name: "Suresh Pillai", email: "suresh.pillai@razorpay.com", phone: "+91 90001 20003", assignedPlan: "Vegan Superfood Energy Bowl", status: "Active", deliveryTime: "12:10 PM" }
]

const INITIAL_INVOICES: Invoice[] = [
  { id: "inv_901", companyName: "Google India Pvt Ltd", billingPeriod: "June 2026", amount: 142000, dueDate: "2026-07-10", status: "Paid" },
  { id: "inv_902", companyName: "Infosys Campus", billingPeriod: "June 2026", amount: 312000, dueDate: "2026-07-10", status: "Paid" },
  { id: "inv_903", companyName: "Razorpay Software", billingPeriod: "June 15-30, 2026", amount: 48000, dueDate: "2026-07-05", status: "Paid" },
  { id: "inv_904", companyName: "Razorpay Software", billingPeriod: "July 01-15, 2026", amount: 50000, dueDate: "2026-07-20", status: "Unpaid" },
  { id: "inv_905", companyName: "Infosys Campus", billingPeriod: "July 2026 (Draft)", amount: 185000, dueDate: "2026-08-10", status: "Unpaid" }
]

const CHART_DATA_REVENUE = [
  { name: "Jan", Corporate: 120000, Retail: 450000 },
  { name: "Feb", Corporate: 180000, Retail: 490000 },
  { name: "Mar", Corporate: 250000, Retail: 520000 },
  { name: "Apr", Corporate: 340000, Retail: 560000 },
  { name: "May", Corporate: 420000, Retail: 610000 },
  { name: "Jun", Corporate: 550000, Retail: 680000 },
  { name: "Jul", Corporate: 610000, Retail: 720000 }
]

export default function CorporatePage() {
  const [activeTab, setActiveTab] = useState<"companies" | "employees" | "bulk-subs" | "billing" | "schedules" | "reports">("companies")
  
  // Data States
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES)
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES)
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES)
  
  // Search Filters
  const [companySearch, setCompanySearch] = useState("")
  const [employeeSearch, setEmployeeSearch] = useState("")
  const [selectedCorpFilter, setSelectedCorpFilter] = useState("All")

  // Modal State - Add Company
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false)
  const [newCompany, setNewCompany] = useState<Partial<Company>>({
    name: "",
    gstin: "",
    billingCycle: "Monthly",
    creditLimit: 100000,
    deliverySlot: "12:00 PM - 12:30 PM",
    address: "",
    assignedKitchen: "Central Indiranagar Kitchen",
    status: "Active"
  })

  // Modal State - Add Employee
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    companyId: "corp_001",
    name: "",
    email: "",
    phone: "",
    assignedPlan: "Balanced Indian Low-Carb Meal",
    deliveryTime: "12:15 PM"
  })

  // Bulk Action State
  const [bulkActionCompany, setBulkActionCompany] = useState("corp_001")
  const [bulkActionPlan, setBulkActionPlan] = useState("Keto Weight-Loss Box (Lunch)")
  const [bulkIsProcessing, setBulkIsProcessing] = useState(false)
  const [bulkSuccessCount, setBulkSuccessCount] = useState(0)

  // CSV Bulk Import simulation
  const [importing, setImporting] = useState(false)

  // Handlers
  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCompany.name?.trim()) return

    const companyToAdd: Company = {
      id: `corp_${Date.now()}`,
      name: newCompany.name,
      gstin: newCompany.gstin || "N/A",
      billingCycle: newCompany.billingCycle || "Monthly",
      creditLimit: Number(newCompany.creditLimit) || 100000,
      balanceUsed: 0,
      employeeCount: 0,
      deliverySlot: newCompany.deliverySlot || "12:00 PM - 12:30 PM",
      address: newCompany.address || "",
      assignedKitchen: newCompany.assignedKitchen || "Central Indiranagar Kitchen",
      status: "Active"
    }

    setCompanies([...companies, companyToAdd])
    setIsAddCompanyOpen(false)
    setNewCompany({
      name: "",
      gstin: "",
      billingCycle: "Monthly",
      creditLimit: 100000,
      deliverySlot: "12:00 PM - 12:30 PM",
      address: "",
      assignedKitchen: "Central Indiranagar Kitchen",
      status: "Active"
    })
  }

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmployee.name.trim() || !newEmployee.email.trim()) return

    const companyObj = companies.find(c => c.id === newEmployee.companyId)
    const empToAdd: Employee = {
      id: `emp_${Date.now()}`,
      companyId: newEmployee.companyId,
      companyName: companyObj ? companyObj.name : "Unknown",
      name: newEmployee.name,
      email: newEmployee.email,
      phone: newEmployee.phone,
      assignedPlan: newEmployee.assignedPlan,
      status: "Active",
      deliveryTime: newEmployee.deliveryTime
    }

    setEmployees([...employees, empToAdd])
    
    // Update company count
    setCompanies(companies.map(c => 
      c.id === newEmployee.companyId 
        ? { ...c, employeeCount: c.employeeCount + 1 } 
        : c
    ))

    setIsAddEmployeeOpen(false)
    setNewEmployee({
      companyId: "corp_001",
      name: "",
      email: "",
      phone: "",
      assignedPlan: "Balanced Indian Low-Carb Meal",
      deliveryTime: "12:15 PM"
    })
  }

  const handleDeleteEmployee = (empId: string, companyId: string) => {
    if (!confirm("Are you sure you want to remove this corporate employee?")) return
    setEmployees(employees.filter(e => e.id !== empId))
    setCompanies(companies.map(c => 
      c.id === companyId 
        ? { ...c, employeeCount: Math.max(0, c.employeeCount - 1) } 
        : c
    ))
  }

  const handleBulkActivate = () => {
    setBulkIsProcessing(true)
    setTimeout(() => {
      // Find matching employees
      const count = employees.filter(e => e.companyId === bulkActionCompany).length
      
      setEmployees(employees.map(e => 
        e.companyId === bulkActionCompany 
          ? { ...e, assignedPlan: bulkActionPlan, status: "Active" }
          : e
      ))

      setBulkIsProcessing(false)
      setBulkSuccessCount(count)
      setTimeout(() => setBulkSuccessCount(0), 4000)
    }, 1500)
  }

  const simulateCSVImport = () => {
    setImporting(true)
    setTimeout(() => {
      const parsedDemo: Employee[] = [
        { id: "emp_csv1", companyId: "corp_001", companyName: "Google India Pvt Ltd", name: "Siddharth Sen", email: "siddharths@google.com", phone: "+91 94432 10091", assignedPlan: "Keto Weight-Loss Box (Lunch)", status: "Active", deliveryTime: "12:15 PM" },
        { id: "emp_csv2", companyId: "corp_001", companyName: "Google India Pvt Ltd", name: "Malini Roy", email: "malinir@google.com", phone: "+91 98845 00012", assignedPlan: "Vegan Superfood Energy Bowl", status: "Active", deliveryTime: "12:15 PM" },
        { id: "emp_csv3", companyId: "corp_001", companyName: "Google India Pvt Ltd", name: "Dinesh Kumar", email: "dineshk@google.com", phone: "+91 97721 34500", assignedPlan: "Balanced Indian Low-Carb Meal", status: "Active", deliveryTime: "12:15 PM" }
      ]

      setEmployees([...employees, ...parsedDemo])
      
      // Update Google's employee count
      setCompanies(companies.map(c => 
        c.id === "corp_001" 
          ? { ...c, employeeCount: c.employeeCount + parsedDemo.length } 
          : c
      ))

      setImporting(false)
      alert("CSV Import Simulated: 3 employees registered under Google India.")
    }, 1200)
  }

  const triggerMarkInvoicePaid = (id: string) => {
    setInvoices(invoices.map(inv => 
      inv.id === id ? { ...inv, status: "Paid" as const } : inv
    ))
  }

  const triggerGenerateInvoice = (comp: Company) => {
    if (comp.balanceUsed === 0) {
      alert("No pending balances for this company to invoice.")
      return
    }

    const newInv: Invoice = {
      id: `inv_${Date.now()}`,
      companyName: comp.name,
      billingPeriod: "Current Cycle (Unbilled)",
      amount: comp.balanceUsed,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "Unpaid"
    }

    setInvoices([newInv, ...invoices])
    setCompanies(companies.map(c => 
      c.id === comp.id ? { ...c, balanceUsed: 0 } : c
    ))
    alert(`Successfully generated invoice ${newInv.id} of ₹${newInv.amount.toLocaleString()} for ${comp.name}.`)
  }

  // Filtered lists
  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
    c.gstin.toLowerCase().includes(companySearch.toLowerCase())
  )

  const filteredEmployees = employees.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(employeeSearch.toLowerCase()) || 
                          e.email.toLowerCase().includes(employeeSearch.toLowerCase())
    const matchesCorp = selectedCorpFilter === "All" || e.companyId === selectedCorpFilter
    return matchesSearch && matchesCorp
  })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Corporate Clients</h1>
          <p className="text-zinc-500 mt-1">Manage B2B institutional relationships, employee rosters, custom deliveries, and centralized corporate billing ledger.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "companies" && (
            <Button onClick={() => setIsAddCompanyOpen(true)} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold">
              <Plus className="mr-2 h-4 w-4" /> Add Company Account
            </Button>
          )}
          {activeTab === "employees" && (
            <div className="flex gap-2">
              <Button onClick={simulateCSVImport} disabled={importing} variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800">
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4 text-emerald-500" />}
                Import Employee CSV
              </Button>
              <Button onClick={() => setIsAddEmployeeOpen(true)} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold">
                <Plus className="mr-2 h-4 w-4" /> Add Employee
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Corporate Overview Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-950 border-zinc-800/60 shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">Total B2B Accounts</span>
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-bold text-white">{companies.length}</h3>
              <p className="text-xs text-zinc-500 mt-1">Across 3 major delivery clusters</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800/60 shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">Active Institutional Subscribers</span>
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-bold text-white">
                {companies.reduce((sum, c) => sum + c.employeeCount, 0)}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Subsidized corporate meal passes</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800/60 shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">Outstanding Balance Ledger</span>
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-bold text-white">
                ₹{companies.reduce((sum, c) => sum + c.balanceUsed, 0).toLocaleString()}
              </h3>
              <p className="text-xs text-zinc-500 mt-1"> central corporate credits</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800/60 shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">Corporate Delivery Performance</span>
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                <Truck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-bold text-white">100%</h3>
              <p className="text-xs text-zinc-500 mt-1">Bulk single-point offloads on-time</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-zinc-950 border border-zinc-800/60 rounded-xl overflow-hidden shadow-xl">
        <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/40">
            <TabsList className="bg-zinc-950 border border-zinc-800 p-1 flex-wrap h-auto gap-1">
              <TabsTrigger value="companies" className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
                <Building2 className="h-4 w-4 mr-2" /> Company Accounts
              </TabsTrigger>
              <TabsTrigger value="employees" className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
                <Users className="h-4 w-4 mr-2" /> Employee Roster
              </TabsTrigger>
              <TabsTrigger value="bulk-subs" className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
                <Calendar className="h-4 w-4 mr-2" /> Bulk Subscriptions
              </TabsTrigger>
              <TabsTrigger value="billing" className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
                <CreditCard className="h-4 w-4 mr-2" /> Central Billing
              </TabsTrigger>
              <TabsTrigger value="schedules" className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
                <Truck className="h-4 w-4 mr-2" /> Dedicated Schedules
              </TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white">
                <BarChart3 className="h-4 w-4 mr-2" /> Corporate Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: COMPANIES */}
          <TabsContent value="companies" className="m-0 focus-visible:outline-none">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/20">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input 
                  placeholder="Search corporate accounts, gstin..." 
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                  className="pl-9 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-400 pl-6">Company Name</TableHead>
                    <TableHead className="text-zinc-400">GSTIN Number</TableHead>
                    <TableHead className="text-zinc-400">Subscribers</TableHead>
                    <TableHead className="text-zinc-400">Central Kitchen</TableHead>
                    <TableHead className="text-zinc-400">Cycle / Time Window</TableHead>
                    <TableHead className="text-zinc-400 text-right">Credit Used</TableHead>
                    <TableHead className="text-zinc-400 text-right pr-6">Central Invoicing</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((comp) => (
                    <TableRow key={comp.id} className="border-zinc-800/60 hover:bg-zinc-900/40 transition-colors">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold">
                            {comp.name[0]}
                          </div>
                          <div>
                            <span className="font-semibold text-white block">{comp.name}</span>
                            <span className="text-xs text-zinc-500 truncate block max-w-xs">{comp.address}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-zinc-400 text-xs">
                        {comp.gstin}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-zinc-900 border-zinc-800 text-zinc-300">
                          {comp.employeeCount} Employees
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-300 text-sm">
                        {comp.assignedKitchen}
                      </TableCell>
                      <TableCell>
                        <span className="text-zinc-300 block text-sm">{comp.billingCycle}</span>
                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-emerald-500" /> {comp.deliverySlot}
                        </span>
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <span className="text-zinc-200 block font-semibold">₹{comp.balanceUsed.toLocaleString()}</span>
                        <span className="text-[10px] text-zinc-500 block">Limit: ₹{(comp.creditLimit / 1000).toLocaleString()}k</span>
                      </TableCell>
                      <TableCell className="text-right pr-6 py-4">
                        <Button 
                          onClick={() => triggerGenerateInvoice(comp)}
                          size="sm" 
                          variant="outline" 
                          className="border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300 text-xs h-8"
                        >
                          <FileText className="h-3 w-3 mr-1 text-emerald-500" /> Bill Ledger
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* TAB 2: EMPLOYEE ROSTER */}
          <TabsContent value="employees" className="m-0 focus-visible:outline-none">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/20 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input 
                  placeholder="Search corporate employee name, email..." 
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  className="pl-9 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 items-center w-full sm:w-auto">
                <Label className="text-zinc-500 text-xs whitespace-nowrap uppercase tracking-wider">Company Filter:</Label>
                <select 
                  value={selectedCorpFilter} 
                  onChange={e => setSelectedCorpFilter(e.target.value)}
                  className="h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="All">All Corporate Partners</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-400 pl-6">Employee</TableHead>
                    <TableHead className="text-zinc-400">Institutional Partner</TableHead>
                    <TableHead className="text-zinc-400">Corporate Plan</TableHead>
                    <TableHead className="text-zinc-400">Delivery Schedule</TableHead>
                    <TableHead className="text-zinc-400">Verification Status</TableHead>
                    <TableHead className="text-zinc-400 text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((emp) => (
                    <TableRow key={emp.id} className="border-zinc-800/60 hover:bg-zinc-900/40 transition-colors">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-300">
                            {emp.name[0]}
                          </div>
                          <div>
                            <span className="font-semibold text-white block text-sm">{emp.name}</span>
                            <span className="text-xs text-zinc-500 block">{emp.email} • {emp.phone || "No phone"}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-300 text-sm font-medium">
                        {emp.companyName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs">
                          {emp.assignedPlan}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-400 text-xs">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-emerald-500" /> Mon - Fri {emp.deliveryTime}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                          Active Pass
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button 
                          onClick={() => handleDeleteEmployee(emp.id, emp.companyId)}
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* TAB 3: BULK SUBSCRIPTIONS */}
          <TabsContent value="bulk-subs" className="m-0 focus-visible:outline-none p-6">
            <div className="max-w-2xl mx-auto space-y-6 py-6">
              <div className="text-center space-y-2">
                <Building2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <h3 className="text-lg font-bold text-white">Central Institutional Subscription Allocator</h3>
                <p className="text-sm text-zinc-500">Mass-assign or update bio-nutrition meal plans to all registered employees of a company with a single action.</p>
              </div>

              <Card className="bg-zinc-900/50 border-zinc-800 shadow-lg p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-300 font-medium">1. Select Target Institutional Partner</Label>
                    <select 
                      value={bulkActionCompany}
                      onChange={e => setBulkActionCompany(e.target.value)}
                      className="w-full h-11 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none"
                    >
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.employeeCount} active roster list)</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-300 font-medium">2. Select Unified Meal Plan Scheme</Label>
                    <select 
                      value={bulkActionPlan}
                      onChange={e => setBulkActionPlan(e.target.value)}
                      className="w-full h-11 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Keto Weight-Loss Box (Lunch)">Keto Weight-Loss Box (Lunch)</option>
                      <option value="Balanced Indian Low-Carb Meal">Balanced Indian Low-Carb Meal</option>
                      <option value="High-Protein Athletic Fuel">High-Protein Athletic Fuel</option>
                      <option value="Vegan Superfood Energy Bowl">Vegan Superfood Energy Bowl</option>
                      <option value="Calorie-Deficit Diabetic Salad">Calorie-Deficit Diabetic Salad</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800">
                  <Button 
                    onClick={handleBulkActivate}
                    disabled={bulkIsProcessing}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold h-11"
                  >
                    {bulkIsProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Provisioning corporate profiles...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Execute Bulk Subscriptions Allocation
                      </>
                    )}
                  </Button>
                </div>

                <AnimatePresence>
                  {bulkSuccessCount > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400"
                    >
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      <div>
                        <span className="font-bold block text-sm">Central Subscription Update Succeeded!</span>
                        <span className="text-xs text-zinc-400">Successfully provisioned and mapped {bulkSuccessCount} employees to "{bulkActionPlan}".</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 4: CENTRAL BILLING */}
          <TabsContent value="billing" className="m-0 focus-visible:outline-none">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/20 flex items-center justify-between">
              <span className="font-semibold text-white text-base">Central Institutional Invoices & Credit Ledger</span>
              <Badge variant="outline" className="border-zinc-800 text-zinc-400">Centralized Clearing Mode</Badge>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-400 pl-6">Invoice ID</TableHead>
                    <TableHead className="text-zinc-400">Corporate Account</TableHead>
                    <TableHead className="text-zinc-400">Billing Period</TableHead>
                    <TableHead className="text-zinc-400">Central Amount</TableHead>
                    <TableHead className="text-zinc-400">Payment Due Date</TableHead>
                    <TableHead className="text-zinc-400">Ledger Status</TableHead>
                    <TableHead className="text-zinc-400 text-right pr-6">Ledger Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id} className="border-zinc-800/60 hover:bg-zinc-900/40 transition-colors">
                      <TableCell className="pl-6 py-4 font-mono text-zinc-300 font-bold">
                        {inv.id}
                      </TableCell>
                      <TableCell className="text-white font-semibold">
                        {inv.companyName}
                      </TableCell>
                      <TableCell className="text-zinc-400 text-sm">
                        {inv.billingPeriod}
                      </TableCell>
                      <TableCell className="font-bold text-white">
                        ₹{inv.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-zinc-400 text-sm">
                        {new Date(inv.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          inv.status === "Paid" 
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse"
                        }>
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6 py-4">
                        {inv.status !== "Paid" ? (
                          <Button 
                            onClick={() => triggerMarkInvoicePaid(inv.id)}
                            size="sm" 
                            className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold h-8 text-xs"
                          >
                            Mark Paid
                          </Button>
                        ) : (
                          <span className="text-xs text-zinc-500">Central Settled</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* TAB 5: DEDICATED SCHEDULES */}
          <TabsContent value="schedules" className="m-0 focus-visible:outline-none">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/20 flex items-center justify-between">
              <span className="font-semibold text-white text-base">Bulk Corporate Hub Logistic Allocations</span>
              <Badge className="bg-zinc-900 border-zinc-800 text-zinc-400">Consolidated Delivery Offloads</Badge>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {companies.map(c => (
                  <Card key={c.id} className="bg-zinc-900/40 border-zinc-800 shadow-md">
                    <CardHeader className="pb-3 border-b border-zinc-800/60">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-white text-base font-bold">{c.name}</CardTitle>
                          <CardDescription className="text-zinc-500 text-xs mt-0.5">{c.address}</CardDescription>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          {c.employeeCount} Passes Assigned
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <span className="text-zinc-500 block font-semibold uppercase tracking-wider text-[10px]">Central Dispatch Kitchen</span>
                          <span className="text-zinc-200 font-medium flex items-center gap-1">
                            <ChefHat className="h-3.5 w-3.5 text-emerald-500" /> {c.assignedKitchen}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-zinc-500 block font-semibold uppercase tracking-wider text-[10px]">Guaranteed Delivery Slot</span>
                          <span className="text-zinc-200 font-medium flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-emerald-500" /> {c.deliverySlot}
                          </span>
                        </div>
                      </div>

                      <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-purple-500/10 text-purple-400 rounded-full flex items-center justify-center text-xs">
                            🚚
                          </div>
                          <div>
                            <span className="text-xs text-zinc-300 font-bold block">Consolidated Route #12</span>
                            <span className="text-[10px] text-zinc-500 block">Driver: Kumar M. • Active</span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-xs text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 h-7">
                          Track Route
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* TAB 6: CORPORATE ANALYTICS */}
          <TabsContent value="reports" className="m-0 focus-visible:outline-none p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-zinc-900/40 border-zinc-800 shadow-md">
                <CardHeader>
                  <CardTitle className="text-white text-base">Corporate vs. Retail Monthly Recurring Revenue</CardTitle>
                  <CardDescription className="text-zinc-500">Comparing central corporate institutional billing performance against general consumer web/app dispatches.</CardDescription>
                </CardHeader>
                <CardContent className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={CHART_DATA_REVENUE}>
                      <defs>
                        <linearGradient id="colorCorp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
                      <YAxis stroke="#71717a" fontSize={11} tickFormatter={(val) => `₹${val/1000}k`} />
                      <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", color: "#fff" }} />
                      <Area type="monotone" dataKey="Corporate" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCorp)" name="Corporate Contract B2B" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/40 border-zinc-800 shadow-md">
                <CardHeader>
                  <CardTitle className="text-white text-base">Meal Distribution across Corporate Partners</CardTitle>
                  <CardDescription className="text-zinc-500">Total active employee subscribers serviced across current institutional client portfolios.</CardDescription>
                </CardHeader>
                <CardContent className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={companies}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickFormatter={(name) => name.split(" ")[0]} />
                      <YAxis stroke="#71717a" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", color: "#fff" }} />
                      <Bar dataKey="employeeCount" fill="#3b82f6" name="Active Subscribers" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ADD COMPANY DIALOG */}
      <Dialog open={isAddCompanyOpen} onOpenChange={setIsAddCompanyOpen}>
        <DialogContent className="bg-zinc-950 border border-zinc-800 text-white rounded-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Register Corporate Client</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCompany} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="corp-name" className="text-zinc-300">Company Legal Name</Label>
              <Input 
                id="corp-name"
                placeholder="e.g. Google India Pvt Ltd" 
                value={newCompany.name}
                onChange={e => setNewCompany({ ...newCompany, name: e.target.value })}
                className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="corp-gst" className="text-zinc-300">GSTIN Identification</Label>
                <Input 
                  id="corp-gst"
                  placeholder="e.g. 29AABCD1234F1Z5" 
                  value={newCompany.gstin}
                  onChange={e => setNewCompany({ ...newCompany, gstin: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="corp-cycle" className="text-zinc-300">Central Ledger Cycle</Label>
                <select 
                  id="corp-cycle"
                  value={newCompany.billingCycle}
                  onChange={e => setNewCompany({ ...newCompany, billingCycle: e.target.value as any })}
                  className="w-full h-10 px-3 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Weekly">Weekly Clearing</option>
                  <option value="Bi-weekly">Bi-weekly Clearing</option>
                  <option value="Monthly">Monthly Clearing</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="corp-limit" className="text-zinc-300">Central Credit Limit (₹)</Label>
                <Input 
                  id="corp-limit"
                  type="number"
                  placeholder="500000" 
                  value={newCompany.creditLimit}
                  onChange={e => setNewCompany({ ...newCompany, creditLimit: Number(e.target.value) })}
                  className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="corp-slot" className="text-zinc-300">Delivery Time Window</Label>
                <Input 
                  id="corp-slot"
                  placeholder="e.g. 12:15 PM - 12:45 PM" 
                  value={newCompany.deliverySlot}
                  onChange={e => setNewCompany({ ...newCompany, deliverySlot: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="corp-address" className="text-zinc-300">Institutional Premises Address</Label>
              <textarea 
                id="corp-address"
                rows={3}
                placeholder="RMZ Infinity, Old Madras Road, Bengaluru..." 
                value={newCompany.address}
                onChange={e => setNewCompany({ ...newCompany, address: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-md p-2 focus:border-emerald-500 focus:outline-none text-sm"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="corp-kitchen" className="text-zinc-300">Assigned Dispatch Central Kitchen</Label>
              <select 
                id="corp-kitchen"
                value={newCompany.assignedKitchen}
                onChange={e => setNewCompany({ ...newCompany, assignedKitchen: e.target.value })}
                className="w-full h-10 px-3 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Central Indiranagar Kitchen">Central Indiranagar Kitchen</option>
                <option value="Electronic City Hub">Electronic City Hub</option>
                <option value="Koramangala Cloud Kitchen">Koramangala Cloud Kitchen</option>
              </select>
            </div>

            <DialogFooter className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsAddCompanyOpen(false)} className="text-zinc-400 hover:text-white">
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-medium">
                Register B2B Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ADD EMPLOYEE DIALOG */}
      <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
        <DialogContent className="bg-zinc-950 border border-zinc-800 text-white rounded-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Add Employee To Corporate Roster</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateEmployee} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-zinc-300">Corporate Employer</Label>
              <select 
                value={newEmployee.companyId}
                onChange={e => setNewEmployee({ ...newEmployee, companyId: e.target.value })}
                className="w-full h-10 px-3 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none"
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-zinc-300">Full Name</Label>
              <Input 
                placeholder="Ananya Nair" 
                value={newEmployee.name}
                onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })}
                className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-zinc-300">Work Email</Label>
                <Input 
                  type="email"
                  placeholder="ananyanair@company.com" 
                  value={newEmployee.email}
                  onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-zinc-300">Phone</Label>
                <Input 
                  placeholder="+91 98765 43210" 
                  value={newEmployee.phone}
                  onChange={e => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-zinc-300">Assign Institutional Plan</Label>
                <select 
                  value={newEmployee.assignedPlan}
                  onChange={e => setNewEmployee({ ...newEmployee, assignedPlan: e.target.value })}
                  className="w-full h-10 px-3 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Keto Weight-Loss Box (Lunch)">Keto Weight-Loss Box (Lunch)</option>
                  <option value="Balanced Indian Low-Carb Meal">Balanced Indian Low-Carb Meal</option>
                  <option value="High-Protein Athletic Fuel">High-Protein Athletic Fuel</option>
                  <option value="Vegan Superfood Energy Bowl">Vegan Superfood Energy Bowl</option>
                  <option value="Calorie-Deficit Diabetic Salad">Calorie-Deficit Diabetic Salad</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-zinc-300">Daily Drop Time</Label>
                <Input 
                  placeholder="e.g. 12:15 PM" 
                  value={newEmployee.deliveryTime}
                  onChange={e => setNewEmployee({ ...newEmployee, deliveryTime: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <DialogFooter className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsAddEmployeeOpen(false)} className="text-zinc-400 hover:text-white">
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-medium">
                Add Employee Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
