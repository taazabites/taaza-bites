import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { Order, Customer } from "../../types"
import { getOrdersByAreaSplit, getOrdersBySlotSplit } from "../../utils/analytics-helpers"

interface OrdersTabProps {
  orders: Order[];
  customers: Customer[];
}

export default function OrdersTab({ orders, customers }: OrdersTabProps) {
  const areaSplit = getOrdersByAreaSplit(orders);
  const slotSplit = getOrdersBySlotSplit(orders);

  // Map customer names for easy lookups
  const customerMap: { [id: string]: string } = {};
  customers.forEach(c => {
    customerMap[c.id] = `${c.firstName} ${c.lastName}`;
  });

  const recentOrders = orders.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-zinc-950/40 border-zinc-800/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-white">Geographical Distribution</CardTitle>
            <CardDescription className="text-zinc-500 text-xs">Total volume mapped across major service areas and sub-sectors</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 h-64">
            <div className="h-44 w-44 mx-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={areaSplit}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {areaSplit.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto overflow-y-auto max-h-48 pr-2">
              {areaSplit.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-6 text-[11px] text-zinc-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <span className="font-semibold text-white">{item.value} deliveries</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/40 border-zinc-800/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-white">Delivery Slot Distribution</CardTitle>
            <CardDescription className="text-zinc-500 text-xs">Breakdown of orders processed per nutritional schedule slots</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={slotSplit}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" name="Orders Log" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Ledger */}
      <Card className="bg-zinc-950/40 border-zinc-800/80">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-white">Fulfillment Status Logs</CardTitle>
          <CardDescription className="text-zinc-500 text-xs">Real-time order tracker detailing current kitchen/delivery statuses</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-900/40 border-zinc-800">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-zinc-400 font-medium text-xs">Order ID</TableHead>
                  <TableHead className="text-zinc-400 font-medium text-xs">Customer</TableHead>
                  <TableHead className="text-zinc-400 font-medium text-xs">Menu Meals Included</TableHead>
                  <TableHead className="text-zinc-400 font-medium text-xs">Area</TableHead>
                  <TableHead className="text-zinc-400 font-medium text-xs">Delivery Date</TableHead>
                  <TableHead className="text-zinc-400 font-medium text-xs text-right">Fulfillment Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-zinc-500 py-6 text-xs">
                      No active orders logged.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOrders.map((o, idx) => {
                    const meals = Array.isArray(o.meals) ? o.meals.join(", ") : o.mealName || "Nutritional Meal Pack";
                    const oStatus = o.status || o.orderStatus || 'Pending';
                    return (
                      <TableRow key={idx} className="border-zinc-800 hover:bg-zinc-900/20 text-xs">
                        <TableCell className="text-white font-mono font-medium">{o.id}</TableCell>
                        <TableCell className="text-zinc-300">
                          {customerMap[o.customerId] || o.customerId}
                        </TableCell>
                        <TableCell className="text-zinc-400 max-w-[200px] truncate">{meals}</TableCell>
                        <TableCell className="text-zinc-300">{o.deliveryArea || "Noida Sector"}</TableCell>
                        <TableCell className="text-zinc-400 font-mono">
                          {o.deliveryDate ? new Date(o.deliveryDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : "Today"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className={
                            oStatus === 'Delivered' 
                              ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' 
                              : oStatus === 'Cancelled' 
                                ? 'border-rose-500/30 text-rose-400 bg-rose-500/5' 
                                : 'border-blue-500/30 text-blue-400 bg-blue-500/5'
                          }>
                            {oStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
