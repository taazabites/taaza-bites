import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { Payment, Coupon } from "../../types"
import { getPaymentStatusSplit } from "../../utils/analytics-helpers"
import { CreditCard, ShieldAlert, BadgePercent, Coins } from "lucide-react"

interface PaymentsTabProps {
  payments: Payment[];
  coupons: Coupon[];
}

export default function PaymentsTab({ payments, coupons }: PaymentsTabProps) {
  const statusSplit = getPaymentStatusSplit(payments);

  // Compute metrics
  const successfulCount = payments.filter(p => p.status === 'Success').length;
  const totalCount = payments.length;
  const paymentSuccessRate = totalCount > 0 ? Math.round((successfulCount / totalCount) * 100) : 96;

  const totalRefundsValue = payments
    .filter(p => p.status === 'Refunded')
    .reduce((sum, p) => sum + (p.netAmount || p.amount || 0), 0);

  const totalCouponsSavings = payments
    .filter(p => p.status === 'Success')
    .reduce((sum, p) => sum + (p.discount || 0), 0);

  const walletUsageValue = payments
    .filter(p => p.status === 'Success' && p.paymentMethod === 'Wallet')
    .reduce((sum, p) => sum + (p.netAmount || p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* KPI stats bar */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-zinc-900/40 border-zinc-800">
          <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
            <CardTitle className="text-xs text-zinc-400 font-medium">Gateway Success Rate</CardTitle>
            <CreditCard className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold text-white">{paymentSuccessRate}%</div>
            <p className="text-[10px] text-zinc-500 mt-1">Completed checkout connections</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 border-zinc-800">
          <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
            <CardTitle className="text-xs text-zinc-400 font-medium">Refund Settlements</CardTitle>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold text-white">₹{totalRefundsValue.toLocaleString()}</div>
            <p className="text-[10px] text-zinc-500 mt-1">Capital reversed or returned to wallets</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 border-zinc-800">
          <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
            <CardTitle className="text-xs text-zinc-400 font-medium">Coupons Deducted</CardTitle>
            <BadgePercent className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold text-white">₹{totalCouponsSavings.toLocaleString()}</div>
            <p className="text-[10px] text-zinc-500 mt-1">Promotional savings granted to diners</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 border-zinc-800">
          <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
            <CardTitle className="text-xs text-zinc-400 font-medium">Wallet Usage Value</CardTitle>
            <Coins className="w-4 h-4 text-teal-400" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold text-white">₹{walletUsageValue.toLocaleString()}</div>
            <p className="text-[10px] text-zinc-500 mt-1">Transactions completed with system balances</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Split Block */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Gateway Pie Column */}
        <Card className="bg-zinc-950/40 border-zinc-800/80 md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white">Gateway Status Distribution</CardTitle>
            <CardDescription className="text-zinc-500 text-xs">A status overview of recent digital checkouts</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-center items-center h-64">
            <div className="h-44 w-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusSplit}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusSplit.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-[10px] text-zinc-400 justify-center">
              {statusSplit.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <span className="w-2 rounded-full h-2" style={{ backgroundColor: item.color }} />
                  <span>{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Coupon performance list */}
        <Card className="bg-zinc-950/40 border-zinc-800/80 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white">Active Coupons Usage Audits</CardTitle>
            <CardDescription className="text-zinc-500 text-xs">Total usage metrics and active promo codes currently published</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-zinc-900/40 border-zinc-800">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-zinc-400 font-medium text-xs">Coupon Code</TableHead>
                    <TableHead className="text-zinc-400 font-medium text-xs">Description</TableHead>
                    <TableHead className="text-zinc-400 font-medium text-xs">Discount Value</TableHead>
                    <TableHead className="text-zinc-400 font-medium text-xs">Usage Count</TableHead>
                    <TableHead className="text-zinc-400 font-medium text-xs text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-zinc-500 py-6 text-xs">
                        No coupons active in promotional systems.
                      </TableCell>
                    </TableRow>
                  ) : (
                    coupons.map((c, idx) => (
                      <TableRow key={idx} className="border-zinc-800 hover:bg-zinc-900/20 text-xs">
                        <TableCell className="text-emerald-400 font-mono font-bold tracking-wider">
                          {c.couponCode}
                        </TableCell>
                        <TableCell className="text-zinc-400 max-w-[200px] truncate">{c.description || "General promotional code"}</TableCell>
                        <TableCell className="text-white">
                          {c.discountType === 'Percentage' ? `${c.discountValue}% Off` : `₹${c.discountValue} Flat`}
                        </TableCell>
                        <TableCell className="text-zinc-300 font-mono">{c.usedCount} claims</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className={
                            c.status === 'Active' 
                              ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' 
                              : 'border-zinc-700 text-zinc-400'
                          }>
                            {c.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
