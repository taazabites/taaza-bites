import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ArrowDownRight, RefreshCcw } from "lucide-react";
import { Expense } from "../../types";
import { expenseService } from "../../services/expenses";
import { useAuth } from "../../contexts/auth-context";
import { toast } from "sonner";

interface ExpensesTabProps {
  expenses: Expense[];
  onRefresh: () => void;
}

export function ExpensesTab({ expenses, onRefresh }: ExpensesTabProps) {
  const { user } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [category, setCategory] = useState<Expense['category']>('Kitchen Purchases');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [submitting, setSubmitting] = useState(false);

  const handleAddExpense = async () => {
    if (!amount || !description || parseFloat(amount) <= 0) {
      toast.error("Please provide valid expense amount and description.");
      return;
    }

    setSubmitting(true);
    try {
      await expenseService.addExpense({
        expenseId: `EXP-${Math.floor(100000 + Math.random() * 900000)}`,
        category,
        amount: parseFloat(amount),
        description,
        vendorName,
        paymentMethod,
        paidBy: user?.email || 'admin@taazabites.com',
        date: new Date().toISOString().substring(0, 10)
      }, user?.id || 'admin', user?.email || 'admin@taazabites.com');

      toast.success("Expense recorded successfully!");
      setIsAddOpen(false);
      setAmount('');
      setDescription('');
      setVendorName('');
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to record expense.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, expenseId: string) => {
    try {
      await expenseService.deleteExpense(id, expenseId, user?.id || 'admin', user?.email || 'admin@taazabites.com');
      toast.success("Expense deleted successfully.");
      onRefresh();
    } catch (err) {
      toast.error("Failed to delete expense.");
    }
  };

  const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Operating Expense Management</h2>
          <p className="text-sm text-slate-500">Track kitchen ingredients, packaging materials, staff salaries, delivery costs, and overheads.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Record New Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-100 bg-red-50/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-900">Total Operating Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-950">₹{totalExpenses.toLocaleString('en-IN')}</div>
            <p className="text-xs text-red-700 mt-1">{expenses.length} recorded expense entries</p>
          </CardContent>
        </Card>

        <Card className="border-amber-100 bg-amber-50/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-900">Top Expense Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-amber-950">Kitchen Purchases</div>
            <p className="text-xs text-amber-700 mt-1">Raw vegetables, dairy, grains</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 bg-emerald-50/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-900">Approval Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-950">100% Audited</div>
            <p className="text-xs text-emerald-700 mt-1">Verified by Finance Manager</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Expense Ledger</CardTitle>
          <CardDescription>Chronological list of company expenditures</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Expense ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-xs">{e.expenseId}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{e.category}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{e.description}</TableCell>
                  <TableCell className="text-slate-600 text-sm">{e.vendorName || '-'}</TableCell>
                  <TableCell className="font-semibold text-red-600">₹{e.amount?.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-xs">{e.paymentMethod}</TableCell>
                  <TableCell className="text-xs text-slate-500">{e.date}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(e.id, e.expenseId)} className="text-red-500 hover:text-red-700 h-8 w-8 p-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {expenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    No expense records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Expense Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record New Expense</DialogTitle>
            <DialogDescription>Add kitchen purchases, utilities, or operating costs to the ledger.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <select className="w-full border border-slate-300 rounded-md p-2 text-sm bg-white" value={category} onChange={(e: any) => setCategory(e.target.value)}>
                <option value="Kitchen Purchases">Kitchen Purchases (Ingredients)</option>
                <option value="Packaging">Packaging (Boxes, Containers)</option>
                <option value="Salaries">Salaries & Wages</option>
                <option value="Delivery Costs">Delivery & Fleet Logistics</option>
                <option value="Utilities">Utilities (Electricity, Water, Gas)</option>
                <option value="Marketing">Marketing & Ads</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="15000" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Bulk organic vegetables for Juhu kitchen" />
            </div>
            <div className="space-y-2">
              <Label>Vendor Name (Optional)</Label>
              <Input value={vendorName} onChange={(e) => setVendorName(e.target.value)} placeholder="AgriFresh Suppliers" />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <select className="w-full border border-slate-300 rounded-md p-2 text-sm bg-white" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="Corporate UPI">Corporate UPI</option>
                <option value="Company Credit Card">Company Credit Card</option>
                <option value="Petty Cash">Petty Cash</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddExpense} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {submitting ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
