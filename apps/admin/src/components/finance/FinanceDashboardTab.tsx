import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { IndianRupee, TrendingUp, AlertCircle, CheckCircle2, Wallet, RefreshCcw, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import { Payment, Refund, Expense } from "../../types";

interface FinanceDashboardTabProps {
  payments: Payment[];
  refunds: Refund[];
  expenses: Expense[];
}

export function FinanceDashboardTab({ payments, refunds, expenses }: FinanceDashboardTabProps) {
  // Calculations
  const totalRevenue = payments
    .filter(p => p.status === 'Success')
    .reduce((acc, p) => acc + (p.netAmount || p.amount || 0), 0);

  const todayStr = new Date().toISOString().substring(0, 10);
  const todaysRevenue = payments
    .filter(p => p.status === 'Success' && p.createdAt?.startsWith(todayStr))
    .reduce((acc, p) => acc + (p.netAmount || p.amount || 0), 0);

  const pendingPaymentsAmount = payments
    .filter(p => p.status === 'Pending' || p.status === 'Processing')
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  const failedPaymentsCount = payments.filter(p => p.status === 'Failed').length;

  const totalRefundsAmount = refunds
    .filter(r => r.status === 'Success')
    .reduce((acc, r) => acc + (r.amount || 0), 0);

  const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  const netProfit = totalRevenue - totalExpenses - totalRefundsAmount;

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-emerald-100 bg-emerald-50/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-900">Today's Revenue</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <IndianRupee className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-950">₹{todaysRevenue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> Real-time collection
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-100 bg-blue-50/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Net Revenue</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-950">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-blue-700 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Successfully reconciled
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-100 bg-amber-50/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-900">Pending & Failed</CardTitle>
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-950">₹{pendingPaymentsAmount.toLocaleString('en-IN')}</div>
            <p className="text-xs text-amber-700 mt-1">
              {failedPaymentsCount} failed payment attempts
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-100 bg-purple-50/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Operating Expenses</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-950">₹{totalExpenses.toLocaleString('en-IN')}</div>
            <p className="text-xs text-purple-700 mt-1">
              Net Profit: ₹{netProfit.toLocaleString('en-IN')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown and Recent Financial Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent Financial Transactions</CardTitle>
            <CardDescription>Latest customer subscription payments and payouts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                      ₹
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-900">{p.customerName || 'Customer'}</p>
                      <p className="text-xs text-slate-500">{p.paymentMethod} • {new Date(p.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-slate-900">+₹{p.amount?.toLocaleString('en-IN')}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.status === 'Success' ? 'bg-emerald-100 text-emerald-700' :
                      p.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
              {payments.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-6">No recent transactions recorded.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Financial Summary</CardTitle>
            <CardDescription>Quick Ledger Overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Total Inflows</span>
              <span className="font-semibold text-emerald-600">₹{totalRevenue.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Total Outflows (Expenses)</span>
              <span className="font-semibold text-red-600">₹{totalExpenses.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Refunds Processed</span>
              <span className="font-semibold text-amber-600">₹{totalRefundsAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center py-2 pt-2">
              <span className="text-base font-bold text-slate-900">Net Operating Balance</span>
              <span className={`font-bold text-base ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                ₹{netProfit.toLocaleString('en-IN')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
