import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { 
  CreditCard, Plus, IndianRupee, Loader2, Search, Download, Filter, 
  AlertCircle, MoreHorizontal, FileText, Receipt, ShieldCheck, CheckCircle2, XCircle, TrendingUp, BarChart3, Wallet, ShieldAlert
} from "lucide-react";
import { paymentsService } from "../services/payments";
import { razorpayService } from "../services/razorpay";
import { customerService } from "../services/customers";
import { expenseService } from "../services/expenses";
import { Payment, Refund, Invoice, Customer, Expense } from "../types";
import { DataTableSkeleton } from "@/src/components/ui/data-table-skeleton";
import { toast } from "sonner";

// Modular Tabs
import { FinanceDashboardTab } from "../components/finance/FinanceDashboardTab";
import { RazorpayReconciliationTab } from "../components/finance/RazorpayReconciliationTab";
import { RefundsTab } from "../components/finance/RefundsTab";
import { InvoicesTab } from "../components/finance/InvoicesTab";
import { WalletTab } from "../components/finance/WalletTab";
import { ExpensesTab } from "../components/finance/ExpensesTab";
import { ReportsTab } from "../components/finance/ReportsTab";

export default function FinancePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const tabFromPath = location.pathname.includes("/finance/refunds")
    ? "refunds"
    : location.pathname.includes("/finance/invoices")
      ? "invoices"
      : "dashboard";
  const [payments, setPayments] = useState<Payment[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState(tabFromPath);

  // Payments Table states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // New Payment Dialog
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [razorpayKey] = useState<string>(import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_mockkey');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const loadExpenses = () =>
        new Promise<Expense[]>((resolve) => {
          const timeout = setTimeout(() => resolve([]), 4000);
          try {
            expenseService.subscribeExpenses((data) => {
              clearTimeout(timeout);
              resolve(data || []);
            });
          } catch {
            clearTimeout(timeout);
            resolve([]);
          }
        });

      const [paymentsData, refundsData, customersData, expensesData] = await Promise.all([
        paymentsService.getPayments().catch(() => []),
        paymentsService.getRefunds().catch(() => []),
        customerService.getCustomers().catch(() => []),
        loadExpenses(),
      ]);
      setPayments(paymentsData || []);
      setRefunds(refundsData || []);
      setCustomers(customersData || []);
      setExpenses(expensesData || []);
    } catch (err: any) {
      console.error("Failed to load finance data:", err);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setActiveTab(tabFromPath);
  }, [tabFromPath]);

  const onTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "refunds") navigate("/finance/refunds");
    else if (value === "invoices") navigate("/finance/invoices");
    else if (value === "dashboard" || value === "payments") navigate("/finance");
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = 
      p.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.paymentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || p.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesMethod = methodFilter === 'all' || p.paymentMethod?.toLowerCase().includes(methodFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const handleCollectPayment = async () => {
    if (!selectedCustomerId || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error("Please select a customer and enter a valid amount.");
      return;
    }

    setIsProcessingPayment(true);
    try {
      const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
      if (!selectedCustomer) throw new Error("Customer not found");

      const isLoaded = await razorpayService.loadScript();
      if (!isLoaded || !window.Razorpay) {
        toast.error("Razorpay SDK failed to load. Please check your network.");
        return;
      }

      const amount = parseFloat(paymentAmount);
      const { order } = await razorpayService.createOrder(
        amount, 
        selectedCustomer.id, 
        `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
      );

      toast.success("Razorpay Order Created!");

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Taaza Bites",
        description: `Subscription & Meal Payment`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            await razorpayService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              customerId: selectedCustomer.id
            });
            toast.success("Payment verified successfully!");
            setIsPaymentDialogOpen(false);
            setPaymentAmount("");
            setSelectedCustomerId("");
            loadData();
          } catch (e: any) {
            toast.error(e.message || "Payment verification failed");
          }
        },
        prefill: {
          name: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
          email: selectedCustomer.email || "",
          contact: selectedCustomer.phone || ""
        },
        theme: { color: "#10b981" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Failed to process payment");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-muted rounded animate-pulse" />
            <div className="h-4 w-96 bg-muted/70 rounded animate-pulse" />
          </div>
        </div>
        <DataTableSkeleton columnCount={5} rowCount={6} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <IndianRupee className="w-5 h-5" />
            </span>
            Finance & Accounting
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete financial ledger, Razorpay reconciliation, wallets, GST invoices, and operating expenses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsPaymentDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Collect Payment
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
        <TabsList className="h-auto w-full flex flex-wrap gap-1 bg-muted/60 p-1 rounded-xl border border-border">
          <TabsTrigger value="dashboard" className="rounded-lg text-xs md:text-sm font-medium px-3 py-2 data-active:bg-zinc-800 data-active:text-white">Dashboard</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-lg text-xs md:text-sm font-medium px-3 py-2 data-active:bg-zinc-800 data-active:text-white">Payments</TabsTrigger>
          <TabsTrigger value="reconciliation" className="rounded-lg text-xs md:text-sm font-medium px-3 py-2 data-active:bg-zinc-800 data-active:text-white">Razorpay Sync</TabsTrigger>
          <TabsTrigger value="refunds" className="rounded-lg text-xs md:text-sm font-medium px-3 py-2 data-active:bg-zinc-800 data-active:text-white">Refunds</TabsTrigger>
          <TabsTrigger value="invoices" className="rounded-lg text-xs md:text-sm font-medium px-3 py-2 data-active:bg-zinc-800 data-active:text-white">GST Invoices</TabsTrigger>
          <TabsTrigger value="wallet" className="rounded-lg text-xs md:text-sm font-medium px-3 py-2 data-active:bg-zinc-800 data-active:text-white">Customer Wallets</TabsTrigger>
          <TabsTrigger value="expenses" className="rounded-lg text-xs md:text-sm font-medium px-3 py-2 data-active:bg-zinc-800 data-active:text-white">Expenses</TabsTrigger>
          <TabsTrigger value="reports" className="rounded-lg text-xs md:text-sm font-medium px-3 py-2 data-active:bg-zinc-800 data-active:text-white">P&L Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <FinanceDashboardTab payments={payments} refunds={refunds} expenses={expenses} />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-card p-4 rounded-xl border border-border">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by customer or payment ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <select 
                className="border border-border rounded-md p-2 text-sm bg-background text-foreground"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              <select 
                className="border border-border rounded-md p-2 text-sm bg-background text-foreground"
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
              >
                <option value="all">All Methods</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="netbanking">Net Banking</option>
              </select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Payments Ledger</CardTitle>
              <CardDescription>Real-time list of all incoming subscription and order transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.paymentId || p.id.substring(0, 8)}</TableCell>
                      <TableCell className="font-medium">{p.customerName || 'Customer'}</TableCell>
                      <TableCell className="font-semibold text-foreground">₹{p.amount?.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{p.paymentMethod}</TableCell>
                      <TableCell>
                        <Badge variant={p.status === 'Success' ? 'default' : p.status === 'Pending' ? 'secondary' : 'destructive'} className="text-xs">
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(p.createdAt || Date.now()).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => { setSelectedPayment(p); setIsDetailsOpen(true); }}>
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPayments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No payments found matching criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconciliation">
          <RazorpayReconciliationTab payments={payments} />
        </TabsContent>

        <TabsContent value="refunds">
          <RefundsTab refunds={refunds} payments={payments} onRefresh={loadData} />
        </TabsContent>

        <TabsContent value="invoices">
          <InvoicesTab invoices={invoices} payments={payments} />
        </TabsContent>

        <TabsContent value="wallet">
          <WalletTab />
        </TabsContent>

        <TabsContent value="expenses">
          <ExpensesTab expenses={expenses} onRefresh={loadData} />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsTab payments={payments} refunds={refunds} expenses={expenses} />
        </TabsContent>
      </Tabs>

      {/* Collect Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Collect Payment via Razorpay</DialogTitle>
            <DialogDescription>Initiate instant payment request or charge customer subscription.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Select Customer</Label>
              <select 
                className="w-full border border-border rounded-md p-2 text-sm bg-background text-foreground"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value="">-- Choose Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.phone || c.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input 
                type="number" 
                value={paymentAmount} 
                onChange={(e) => setPaymentAmount(e.target.value)} 
                placeholder="2500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCollectPayment} disabled={isProcessingPayment} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isProcessingPayment ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Proceed to Razorpay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Audit Details</DialogTitle>
            <DialogDescription>Full cryptographic and gateway logs for transaction</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-3 text-sm py-2">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Payment ID</span>
                <span className="font-mono font-medium">{selectedPayment.paymentId || selectedPayment.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-semibold">{selectedPayment.customerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-bold text-emerald-600">₹{selectedPayment.amount?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">GST Included (5%)</span>
                <span>₹{(selectedPayment.amount * 0.05).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Payment Method</span>
                <span>{selectedPayment.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Razorpay Order ID</span>
                <span className="font-mono text-xs">{selectedPayment.razorpayOrderId || 'order_mock_xyz'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="default" className="bg-emerald-500/20 text-emerald-300">{selectedPayment.status}</Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
