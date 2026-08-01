import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, IndianRupee, PieChart, BarChart3 } from "lucide-react";
import { Payment, Refund, Expense } from "../../types";
import { toast } from "sonner";

interface ReportsTabProps {
  payments: Payment[];
  refunds: Refund[];
  expenses: Expense[];
}

export function ReportsTab({ payments, refunds, expenses }: ReportsTabProps) {
  const totalRevenue = payments.filter(p => p.status === 'Success').reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const totalRefunds = refunds.reduce((acc, r) => acc + (r.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses - totalRefunds;

  const handleExportReport = (reportName: string) => {
    toast.success(`Exporting ${reportName} to CSV/Excel format...`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Financial Reports & Profit Overview</h2>
          <p className="text-sm text-slate-500">Comprehensive P&L statements, GST summaries, and revenue breakdown reports.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleExportReport("P&L Statement")} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
            <Download className="w-4 h-4" /> Export P&L Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-emerald-100 bg-emerald-50/25">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-900">Gross Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-950">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-emerald-700 mt-1">Subscription plans & meal orders</p>
          </CardContent>
        </Card>

        <Card className="border-red-100 bg-red-50/25">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-900">Total Expenditures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-950">₹{totalExpenses.toLocaleString('en-IN')}</div>
            <p className="text-xs text-red-700 mt-1">Kitchen purchases & overheads</p>
          </CardContent>
        </Card>

        <Card className="border-blue-100 bg-blue-50/25">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Net Profit Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-950">
              {totalRevenue > 0 ? `${((netProfit / totalRevenue) * 100).toFixed(1)}%` : '0%'}
            </div>
            <p className="text-xs text-blue-700 mt-1">Net Earnings: ₹{netProfit.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Methods Breakdown</CardTitle>
            <CardDescription>Distribution of customer payment channels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">UPI (Google Pay, PhonePe, Paytm)</span>
                <span className="font-semibold text-slate-900">65%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">Credit / Debit Cards</span>
                <span className="font-semibold text-slate-900">20%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">Net Banking / Wallets</span>
                <span className="font-semibold text-slate-900">15%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">GST & Tax Summary (5% Standard)</CardTitle>
            <CardDescription>Tax liability collected for government remittance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Taxable Turnover</span>
              <span className="font-semibold text-slate-900">₹{(totalRevenue * 0.95).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">CGST (2.5%)</span>
              <span className="font-semibold text-slate-700">₹{(totalRevenue * 0.025).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">SGST (2.5%)</span>
              <span className="font-semibold text-slate-700">₹{(totalRevenue * 0.025).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 pt-2">
              <span className="text-base font-bold text-slate-900">Total GST Collected</span>
              <span className="font-bold text-base text-emerald-700">₹{(totalRevenue * 0.05).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
