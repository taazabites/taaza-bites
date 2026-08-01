import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownRight, RefreshCcw, Loader2, Search, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/auth-context";
import { customerService } from "../../services/customers";
import { collection, query, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Customer } from "../../types";

export function WalletTab() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [amount, setAmount] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<"Wallet Credit" | "Wallet Debit">("Wallet Credit");
  const [remarks, setRemarks] = useState("Manual Wallet Adjustment by Admin");
  const [submitting, setSubmitting] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Check roles: restrict manual adjustments to Super Admin, Admin, and Finance Manager
  const isAuthorized = user && (user.role === "Super Admin" || user.role === "Admin" || user.role === "Finance Manager");

  useEffect(() => {
    // Subscribe to customers
    const unsubscribeCustomers = customerService.subscribeCustomers((data) => {
      setCustomers(data);
      setLoading(false);
    });

    // Subscribe to transactions (which has the wallet logs)
    const txnsRef = collection(db, "transactions");
    const qTxns = query(txnsRef, orderBy("timestamp", "desc"), limit(100));
    const unsubscribeTxns = onSnapshot(
      qTxns,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTransactions(list);
      },
      (error) => {
        console.error("Error subscribing to transactions:", error);
      }
    );

    return () => {
      unsubscribeCustomers();
      unsubscribeTxns();
    };
  }, []);

  const handleManualAdjustment = async () => {
    if (!isAuthorized) {
      toast.error("Access Denied: You do not have permission to adjust wallets.");
      return;
    }
    if (!selectedCustomerId || !amount || parseFloat(amount) <= 0) {
      toast.error("Please select a customer and enter a valid positive amount.");
      return;
    }

    setSubmitting(true);
    try {
      const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
      if (!selectedCustomer) throw new Error("Selected customer not found.");

      const numericAmount = parseFloat(amount);
      const adminEmail = user?.email || "admin@taazabites.com";

      await customerService.adjustWalletBalance(
        selectedCustomerId,
        numericAmount,
        adjustmentType,
        remarks,
        adminEmail
      );

      // Write an audit log for security & tracking
      try {
        const auditRef = collection(db, "paymentAuditLogs");
        await customerService.addCustomerNote(
          selectedCustomerId,
          `Wallet ${adjustmentType === "Wallet Credit" ? "Credited" : "Debited"} by ${numericAmount} INR. Reason: ${remarks}. Action taken by ${adminEmail}.`,
          user?.id || "admin",
          user?.name || "Finance Admin",
          "High",
          "Wallet Transaction"
        );
      } catch (auditErr) {
        console.error("Failed to add audit customer note:", auditErr);
      }

      toast.success(
        `Successfully ${adjustmentType === "Wallet Credit" ? "credited" : "debited"} ₹${numericAmount} to ${selectedCustomer.firstName} ${selectedCustomer.lastName}'s wallet.`
      );
      setIsOpen(false);
      setAmount("");
      setSelectedCustomerId("");
      setRemarks("Manual Wallet Adjustment by Admin");
    } catch (err: any) {
      toast.error(err.message || "Failed to adjust wallet balance.");
    } finally {
      setSubmitting(false);
    }
  };

  // Compute stats based on actual customer & transaction data
  const totalWalletLiability = customers.reduce((sum, c) => sum + (c.walletBalance || 0), 0);

  const cashbackThisMonth = transactions
    .filter((t) => {
      if (!t.timestamp || t.amount <= 0) return false;
      const isCredit = t.type === "Wallet Credit" || t.amount > 0;
      const desc = (t.method || "").toLowerCase() + " " + (t.remarks || "").toLowerCase();
      const isCashback = desc.includes("cashback") || desc.includes("bonus") || desc.includes("reward");
      
      const date = new Date(t.timestamp);
      const now = new Date();
      const sameMonth = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      
      return isCredit && isCashback && sameMonth;
    })
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  const referralCredits = transactions
    .filter((t) => {
      const desc = (t.method || "").toLowerCase() + " " + (t.remarks || "").toLowerCase() + " " + (t.type || "").toLowerCase();
      return desc.includes("referral") && (t.amount > 0 || t.type === "Wallet Credit");
    })
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  const getCustomerName = (id: string) => {
    const customer = customers.find((c) => c.id === id);
    return customer ? `${customer.firstName} ${customer.lastName}` : `Customer (${id.substring(0, 8)})`;
  };

  const filteredTransactions = transactions.filter((t) => {
    // Only display wallet-related transactions in the ledger
    const isWalletType = t.type === "Wallet Credit" || t.type === "Wallet Debit" || t.method === "Wallet" || t.type === "Wallet";
    if (!isWalletType) return false;

    const customerName = getCustomerName(t.customerId).toLowerCase();
    const customerIdLower = (t.customerId || "").toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    const remarksLower = (t.method || t.remarks || "").toLowerCase();

    return (
      customerName.includes(searchLower) ||
      customerIdLower.includes(searchLower) ||
      remarksLower.includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Customer Wallet & Cashback Management</h2>
          <p className="text-sm text-slate-500">
            Monitor digital wallet balances, cashback rewards, referral bonuses, and manual credits in real-time.
          </p>
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" /> Manual Wallet Adjustment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-emerald-100 bg-emerald-50/25">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-900">Total Wallet Liability Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-950">₹{loading ? "..." : totalWalletLiability.toLocaleString("en-IN")}</div>
            <p className="text-xs text-emerald-700 mt-1">Active customer prepaid balance pool</p>
          </CardContent>
        </Card>

        <Card className="border-blue-100 bg-blue-50/25">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Cashback Issued This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-950">₹{loading ? "..." : cashbackThisMonth.toLocaleString("en-IN")}</div>
            <p className="text-xs text-blue-700 mt-1">Subscription reward incentives</p>
          </CardContent>
        </Card>

        <Card className="border-purple-100 bg-purple-50/25">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Referral Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-950">₹{loading ? "..." : referralCredits.toLocaleString("en-IN")}</div>
            <p className="text-xs text-purple-700 mt-1">Acquisition growth incentives</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search wallet ledger..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <p className="text-xs text-slate-400 ml-auto font-medium">
          Showing {filteredTransactions.length} of {transactions.filter(t => t.type === "Wallet Credit" || t.type === "Wallet Debit" || t.method === "Wallet" || t.type === "Wallet").length} wallet ledger transactions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Wallet Transaction Ledger</CardTitle>
          <CardDescription>Real-time audit trail of customer wallet credits and debits</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <span>Loading ledger logs...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reference / Remarks</TableHead>
                  <TableHead>Processed By</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((t) => {
                  const isCredit = t.type === "Wallet Credit" || t.amount > 0;
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">{t.id.substring(0, 10)}</TableCell>
                      <TableCell className="font-medium">{getCustomerName(t.customerId)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={isCredit ? "default" : "secondary"}
                          className={`text-xs font-semibold ${
                            isCredit
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {isCredit ? "Credit" : "Debit"}
                        </Badge>
                      </TableCell>
                      <TableCell className={`font-semibold ${isCredit ? "text-emerald-600" : "text-slate-900"}`}>
                        {isCredit ? "+" : "-"}₹{Math.abs(t.amount).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm max-w-xs truncate" title={t.method || t.remarks}>
                        {t.method || t.remarks || "No description"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">{t.performedBy || "System"}</TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {t.timestamp ? new Date(t.timestamp).toLocaleDateString() : "Just now"}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      No wallet transactions recorded.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Manual Adjustment Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manual Wallet Adjustment</DialogTitle>
            <DialogDescription>Credit or debit customer wallet balance manually with a secure audit trail.</DialogDescription>
          </DialogHeader>

          {!isAuthorized && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Unauthorized Access</p>
                <p className="mt-0.5">Your current role ({user?.role}) does not have permission to adjust wallet balances. Only Super Admins, Admins, and Finance Managers are permitted.</p>
              </div>
            </div>
          )}

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Select Customer Wallet</Label>
              <select
                className="w-full border border-slate-300 rounded-md p-2 text-sm bg-white"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                disabled={!isAuthorized}
              >
                <option value="">-- Choose Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} (Wallet: ₹{c.walletBalance || 0})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Adjustment Type</Label>
              <select
                className="w-full border border-slate-300 rounded-md p-2 text-sm bg-white"
                value={adjustmentType}
                onChange={(e: any) => setAdjustmentType(e.target.value)}
                disabled={!isAuthorized}
              >
                <option value="Wallet Credit">Credit (Add Money / Goodwill / Cashback)</option>
                <option value="Wallet Debit">Debit (Correction / Deduction)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="500"
                disabled={!isAuthorized}
              />
            </div>
            <div className="space-y-2">
              <Label>Remarks / Audit Reason</Label>
              <Input
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Goodwill credit for delayed delivery"
                disabled={!isAuthorized}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button
              onClick={handleManualAdjustment}
              disabled={submitting || !isAuthorized}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              {submitting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : null}
              Submit Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
