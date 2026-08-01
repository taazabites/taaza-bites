import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from "recharts"
import { Payment, Order } from "../../types"
import { 
  getRevenueTrendData, 
  getSubscriptionRevenueSplit, 
  getMealCategoryRevenueSplit 
} from "../../utils/analytics-helpers"

interface RevenueTabProps {
  payments: Payment[];
  orders: Order[];
}

export default function RevenueTab({ payments, orders }: RevenueTabProps) {
  const trendData = getRevenueTrendData(payments);
  const subscriptionSplit = getSubscriptionRevenueSplit(payments);
  const categorySplit = getMealCategoryRevenueSplit(orders);

  // Group detailed daily table
  const dailySummaryMap: { [date: string]: any } = {};
  payments.forEach(p => {
    const d = new Date(p.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    if (!dailySummaryMap[d]) {
      dailySummaryMap[d] = { date: d, gross: 0, discount: 0, gst: 0, net: 0, count: 0, success: 0 };
    }
    const amt = p.netAmount || p.amount || 0;
    dailySummaryMap[d].count += 1;
    if (p.status === 'Success') {
      dailySummaryMap[d].gross += (p.amount || amt);
      dailySummaryMap[d].discount += (p.discount || 0);
      dailySummaryMap[d].gst += (p.gst || 0);
      dailySummaryMap[d].net += amt;
      dailySummaryMap[d].success += 1;
    }
  });

  const summaryList = Object.values(dailySummaryMap).slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Trends Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-zinc-950/40 border-zinc-800/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-white">Revenue Trend (INR)</CardTitle>
            <CardDescription className="text-zinc-500 text-xs">Total net income generated daily across active periods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="revenueG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", color: "#fff" }} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#revenueG)" name="Net Sales" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/40 border-zinc-800/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-white">Sales Volume Trend</CardTitle>
            <CardDescription className="text-zinc-500 text-xs">Number of successfully completed checkouts daily</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", color: "#fff" }} />
                  <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} name="Sales Count" activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Splits Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-zinc-950/40 border-zinc-800/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-white">Subscription Revenue share</CardTitle>
            <CardDescription className="text-zinc-500 text-xs">Gross subscription value by plan classification</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="h-48 w-48 mx-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subscriptionSplit}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {subscriptionSplit.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `₹${Number(value).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto">
              {subscriptionSplit.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-6 text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-semibold text-white">₹{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/40 border-zinc-800/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-white">Meal Category Volume Estimates</CardTitle>
            <CardDescription className="text-zinc-500 text-xs">Estimated volume distribution based on protein/veggies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categorySplit} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                  <XAxis type="number" stroke="#71717a" fontSize={10} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={10} tickLine={false} width={100} />
                  <Tooltip formatter={(value: any) => `₹${Number(value).toLocaleString()}`} />
                  <Bar dataKey="value" fill="#10b981" name="Volume Value (₹)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Breakdown Ledger Table */}
      <Card className="bg-zinc-950/40 border-zinc-800/80">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-white">Daily Financial Breakdown</CardTitle>
          <CardDescription className="text-zinc-500 text-xs">Detailed audit ledger summarizing tax inputs, coupons, and net payout ratios</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-900/40 border-zinc-800">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-zinc-400 font-medium text-xs">Settlement Date</TableHead>
                  <TableHead className="text-zinc-400 font-medium text-xs">Gross Value</TableHead>
                  <TableHead className="text-zinc-400 font-medium text-xs">Discount Deductions</TableHead>
                  <TableHead className="text-zinc-400 font-medium text-xs">Tax (CGST+SGST)</TableHead>
                  <TableHead className="text-zinc-400 font-medium text-xs">Net Payout</TableHead>
                  <TableHead className="text-zinc-400 font-medium text-xs text-right">Transactions (Success/Total)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaryList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-zinc-500 py-6 text-xs">
                      No active settlement entries during selected periods.
                    </TableCell>
                  </TableRow>
                ) : (
                  summaryList.map((row, idx) => (
                    <TableRow key={idx} className="border-zinc-800 hover:bg-zinc-900/20 text-xs">
                      <TableCell className="text-white font-medium">{row.date}</TableCell>
                      <TableCell className="text-zinc-300">₹{row.gross.toLocaleString()}</TableCell>
                      <TableCell className="text-rose-400">-₹{row.discount.toLocaleString()}</TableCell>
                      <TableCell className="text-zinc-400">₹{row.gst.toLocaleString()}</TableCell>
                      <TableCell className="text-emerald-400 font-semibold">₹{row.net.toLocaleString()}</TableCell>
                      <TableCell className="text-zinc-300 text-right font-mono">
                        {row.success} / {row.count} ({Math.round((row.success / row.count) * 100)}%)
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
  );
}
