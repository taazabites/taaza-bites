import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { IndianRupee, TrendingUp, Receipt, ArrowDownRight, Clock, Wallet } from "lucide-react";
import { Payment, Refund, Expense } from "../../types";

interface FinanceDashboardTabProps {
  payments: Payment[];
  refunds: Refund[];
  expenses: Expense[];
}

function KpiCard({
  title,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "emerald" | "blue" | "amber" | "violet";
}) {
  const tones = {
    emerald: {
      card: "border-emerald-500/25 bg-emerald-500/10",
      title: "text-emerald-200",
      icon: "bg-emerald-500/20 text-emerald-300",
      value: "text-white",
      hint: "text-emerald-300/90",
    },
    blue: {
      card: "border-sky-500/25 bg-sky-500/10",
      title: "text-sky-200",
      icon: "bg-sky-500/20 text-sky-300",
      value: "text-white",
      hint: "text-sky-300/90",
    },
    amber: {
      card: "border-amber-500/25 bg-amber-500/10",
      title: "text-amber-200",
      icon: "bg-amber-500/20 text-amber-300",
      value: "text-white",
      hint: "text-amber-300/90",
    },
    violet: {
      card: "border-violet-500/25 bg-violet-500/10",
      title: "text-violet-200",
      icon: "bg-violet-500/20 text-violet-300",
      value: "text-white",
      hint: "text-violet-300/90",
    },
  }[tone];

  return (
    <Card className={tones.card}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className={`text-sm font-medium ${tones.title}`}>{title}</CardTitle>
        <div className={`p-2 rounded-lg ${tones.icon}`}>
          <Icon className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold tracking-tight ${tones.value}`}>{value}</div>
        <p className={`text-xs mt-1.5 ${tones.hint}`}>{hint}</p>
      </CardContent>
    </Card>
  );
}

export function FinanceDashboardTab({ payments, refunds, expenses }: FinanceDashboardTabProps) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Today's Revenue"
          value={`₹${todaysRevenue.toLocaleString('en-IN')}`}
          hint="Real-time collection"
          icon={IndianRupee}
          tone="emerald"
        />
        <KpiCard
          title="Total Net Revenue"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          hint="Successfully reconciled"
          icon={TrendingUp}
          tone="blue"
        />
        <KpiCard
          title="Pending & Failed"
          value={`₹${pendingPaymentsAmount.toLocaleString('en-IN')}`}
          hint={`${failedPaymentsCount} failed payment attempts`}
          icon={Clock}
          tone="amber"
        />
        <KpiCard
          title="Operating Expenses"
          value={`₹${totalExpenses.toLocaleString('en-IN')}`}
          hint={`Net profit: ₹${netProfit.toLocaleString('en-IN')}`}
          icon={ArrowDownRight}
          tone="violet"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Recent Financial Transactions</CardTitle>
            <CardDescription>Latest customer subscription payments and payouts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payments.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/40 hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs shrink-0">
                      ₹
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{p.customerName || 'Customer'}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.paymentMethod} • {new Date(p.createdAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="font-semibold text-sm text-foreground">+₹{p.amount?.toLocaleString('en-IN')}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.status === 'Success' ? 'bg-emerald-500/20 text-emerald-300' :
                      p.status === 'Pending' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
              {payments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No recent transactions</p>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Successful Razorpay checkouts will appear here. Collect a payment or wait for a customer order.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4 text-emerald-400" />
              Financial Summary
            </CardTitle>
            <CardDescription>Quick ledger overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex justify-between items-center py-2.5 border-b border-border">
              <span className="text-sm text-muted-foreground">Total Inflows</span>
              <span className="font-semibold text-emerald-400">₹{totalRevenue.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-border">
              <span className="text-sm text-muted-foreground">Total Outflows (Expenses)</span>
              <span className="font-semibold text-rose-400">₹{totalExpenses.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-border">
              <span className="text-sm text-muted-foreground">Refunds Processed</span>
              <span className="font-semibold text-amber-400">₹{totalRefundsAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm font-semibold text-foreground">Net Operating Balance</span>
              <span className={`font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ₹{netProfit.toLocaleString('en-IN')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
