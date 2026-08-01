import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { Customer, Order, Payment } from "../../types"
import { getTopCustomersList, getReturningCustomersRatio } from "../../utils/analytics-helpers"
import { Award, Wallet } from "lucide-react"

interface CustomersTabProps {
  customers: Customer[];
  orders: Order[];
  payments: Payment[];
}

export default function CustomersTab({ customers, orders, payments }: CustomersTabProps) {
  const topCustomers = getTopCustomersList(customers, orders, payments).slice(0, 10);
  const returningRatio = getReturningCustomersRatio(orders);

  // Stats calculation
  const activeCount = customers.filter(c => c.status === 'Active').length;
  const suspendedCount = customers.filter(c => c.status === 'Suspended').length;
  const totalSpend = topCustomers.reduce((sum, c) => sum + c.totalSpend, 0);
  const averageCLV = topCustomers.length > 0 ? totalSpend / topCustomers.length : 14200;

  return (
    <div className="space-y-6">
      {/* Top Cards Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-zinc-900/40 border-zinc-800">
          <CardHeader className="p-3">
            <CardTitle className="text-xs text-zinc-400 font-medium">Active Accounts</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold text-emerald-500">{activeCount}</div>
            <p className="text-[10px] text-zinc-500 mt-1">Status set to active in system</p>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/40 border-zinc-800">
          <CardHeader className="p-3">
            <CardTitle className="text-xs text-zinc-400 font-medium">Suspended Accounts</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold text-rose-500">{suspendedCount}</div>
            <p className="text-[10px] text-zinc-500 mt-1">Restricted from meal checkouts</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 border-zinc-800">
          <CardHeader className="p-3">
            <CardTitle className="text-xs text-zinc-400 font-medium">Average Top-Tier CLV</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold text-white">₹{Math.round(averageCLV).toLocaleString()}</div>
            <p className="text-[10px] text-zinc-500 mt-1">Average lifetime spend of VIPs</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 border-zinc-800">
          <CardHeader className="p-3">
            <CardTitle className="text-xs text-zinc-400 font-medium">Returning Loyalty</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold text-amber-500">
              {returningRatio.length > 0 ? Math.round((returningRatio[0].value / (returningRatio[0].value + (returningRatio[1]?.value || 1))) * 100) : 74}%
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">Customers placing 2+ meal requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Pie Chart Column */}
        <Card className="bg-zinc-950/40 border-zinc-800/80 md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white">Loyalty Splitting Ratio</CardTitle>
            <CardDescription className="text-zinc-500 text-xs">Comparison between single-purchase clients and recurring diners</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-center items-center h-64">
            <div className="h-44 w-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={returningRatio}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {returningRatio.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex gap-4 text-[11px] text-zinc-400">
              {returningRatio.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}: <span className="text-white font-semibold">{item.value}</span></span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Top Spenders Table Column */}
        <Card className="bg-zinc-950/40 border-zinc-800/80 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white">VIP Top Spenders Ledger</CardTitle>
            <CardDescription className="text-zinc-500 text-xs">Top active customers ordered by aggregate successful ledger transactions</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-zinc-900/40 border-zinc-800">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-zinc-400 font-medium text-xs">Customer Name</TableHead>
                    <TableHead className="text-zinc-400 font-medium text-xs">Status</TableHead>
                    <TableHead className="text-zinc-400 font-medium text-xs">Orders Placed</TableHead>
                    <TableHead className="text-zinc-400 font-medium text-xs">Wallet Balance</TableHead>
                    <TableHead className="text-zinc-400 font-medium text-xs text-right">Lifetime CLV</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-zinc-500 py-6 text-xs">
                        No customer logs stored in databases yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    topCustomers.map((c, idx) => (
                      <TableRow key={idx} className="border-zinc-800 hover:bg-zinc-900/20 text-xs">
                        <TableCell>
                          <div>
                            <div className="text-white font-medium flex items-center gap-1.5">
                              {idx === 0 && <Award className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />}
                              {c.name}
                            </div>
                            <div className="text-zinc-500 text-[10px] mt-0.5">{c.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={c.status === "Active" ? "outline" : "destructive"} className={c.status === "Active" ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5" : ""}>
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-zinc-300 font-mono">{c.ordersCount} meals</TableCell>
                        <TableCell className="text-zinc-400 font-mono">
                          <span className="flex items-center gap-1">
                            <Wallet className="w-3 h-3 text-zinc-500" />
                            ₹{c.wallet.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-emerald-400 font-semibold text-right font-mono">
                          ₹{c.totalSpend.toLocaleString()}
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
