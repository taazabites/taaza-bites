import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCcw, ArrowDownRight, Plus, CheckCircle2 } from "lucide-react";
import { Refund, Payment } from "../../types";
import { paymentsService } from "../../services/payments";
import { useAuth } from "../../contexts/auth-context";
import { toast } from "sonner";

interface RefundsTabProps {
  refunds: Refund[];
  payments: Payment[];
  onRefresh: () => void;
}

export function RefundsTab({ refunds, payments, onRefresh }: RefundsTabProps) {
  const { user } = useAuth();
  const [isNewRefundOpen, setIsNewRefundOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("Customer requested cancellation");
  const [submitting, setSubmitting] = useState(false);

  const handleIssueRefund = async () => {
    if (!selectedPaymentId || !refundAmount || parseFloat(refundAmount) <= 0) {
      toast.error("Please select a valid payment and refund amount.");
      return;
    }
    const payment = payments.find(p => p.id === selectedPaymentId);
    if (!payment) {
      toast.error("Selected payment not found.");
      return;
    }

    setSubmitting(true);
    try {
      await paymentsService.issueRefund(
        payment.id,
        parseFloat(refundAmount),
        refundReason
      );
      toast.success("Refund issued successfully!");
      setIsNewRefundOpen(false);
      setSelectedPaymentId("");
      setRefundAmount("");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to issue refund.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalRefunded = refunds.reduce((acc, r) => acc + (r.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Refunds & Credit Notes</h2>
          <p className="text-sm text-slate-500">Manage customer subscription refunds, partial settlements, and audit history.</p>
        </div>
        <Button onClick={() => setIsNewRefundOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Issue New Refund
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-amber-100 bg-amber-50/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-900">Total Refunds Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-950">₹{totalRefunded.toLocaleString('en-IN')}</div>
            <p className="text-xs text-amber-700 mt-1">{refunds.length} total refund transactions</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 bg-emerald-50/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-900">Refund Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-950">100%</div>
            <p className="text-xs text-emerald-700 mt-1">Processed securely via Razorpay Payouts API</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Refund History Ledger</CardTitle>
          <CardDescription>All processed refunds and customer adjustments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Refund ID</TableHead>
                <TableHead>Payment Reference</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {refunds.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.refundId || r.id.substring(0, 8)}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">{r.paymentId.substring(0, 8)}</TableCell>
                  <TableCell className="font-semibold text-red-600">-₹{r.amount?.toLocaleString('en-IN')}</TableCell>
                  <TableCell>{r.reason || 'Customer requested'}</TableCell>
                  <TableCell>
                    <Badge variant="default" className="bg-emerald-100 text-emerald-700 text-xs">
                      {r.status || 'Success'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">{new Date(r.createdAt || Date.now()).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {refunds.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No refunds issued yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Issue Refund Dialog */}
      <Dialog open={isNewRefundOpen} onOpenChange={setIsNewRefundOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Issue Refund to Customer</DialogTitle>
            <DialogDescription>Select a successful payment to refund full or partial amount.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Select Payment</Label>
              <select 
                className="w-full border border-slate-300 rounded-md p-2 text-sm bg-white"
                value={selectedPaymentId}
                onChange={(e) => {
                  setSelectedPaymentId(e.target.value);
                  const p = payments.find(pay => pay.id === e.target.value);
                  if (p) setRefundAmount(p.amount.toString());
                }}
              >
                <option value="">-- Choose Successful Payment --</option>
                {payments.filter(p => p.status === 'Success').map(p => (
                  <option key={p.id} value={p.id}>
                    {p.customerName} - ₹{p.amount} ({p.paymentMethod})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Refund Amount (₹)</Label>
              <Input 
                type="number" 
                value={refundAmount} 
                onChange={(e) => setRefundAmount(e.target.value)} 
                placeholder="Enter amount"
              />
            </div>
            <div className="space-y-2">
              <Label>Reason for Refund</Label>
              <Input 
                value={refundReason} 
                onChange={(e) => setRefundReason(e.target.value)} 
                placeholder="e.g., Subscription cancelled by customer"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewRefundOpen(false)}>Cancel</Button>
            <Button onClick={handleIssueRefund} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {submitting ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirm Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
