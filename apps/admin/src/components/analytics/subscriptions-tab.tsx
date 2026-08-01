import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Subscription, Customer } from "../../types"
import { getSubscriptionPlansSplit } from "../../utils/analytics-helpers"
import { CalendarRange, Trash2 } from "lucide-react"

interface SubscriptionsTabProps {
  subscriptions: Subscription[];
  customers: Customer[];
}

export default function SubscriptionsTab({ subscriptions, customers }: SubscriptionsTabProps) {
  const planData = getSubscriptionPlansSplit(subscriptions);

  // Map customer names for easy lookups
  const customerMap: { [id: string]: string } = {};
  customers.forEach(c => {
    customerMap[c.id] = `${c.firstName} ${c.lastName}`;
  });

  // Expiring soon: status is Active and end date is within next 7 days
  const now = new Date();
  const nextSevenDays = new Date();
  nextSevenDays.setDate(now.getDate() + 7);

  const expiringSoon = subscriptions.filter(s => {
    if (s.status !== 'Active') return false;
    const end = new Date(s.endDate);
    return end >= now && end <= nextSevenDays;
  });

  // Cancelled plans
  const cancelledPlans = subscriptions.filter(s => s.status === 'Cancelled' || s.status === 'Frozen');

  return (
    <div className="space-y-6">
      {/* Plan Distribution Chart */}
      <Card className="bg-zinc-950/40 border-zinc-800/80">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-white">Active Plan Classifications</CardTitle>
          <CardDescription className="text-zinc-500 text-xs">A comprehensive breakdown of all active, frozen, or paused nutrition subscription packages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={planData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" name="Signups Count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Lists Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Expiring Soon Column */}
        <Card className="bg-zinc-950/40 border-zinc-800/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold text-white">Expiring Soon (Next 7 Days)</CardTitle>
              <CardDescription className="text-zinc-500 text-xs">Active plans scheduled to terminate shortly</CardDescription>
            </div>
            <CalendarRange className="w-5 h-5 text-amber-500" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-y-auto max-h-72">
              <Table>
                <TableHeader className="bg-zinc-900/40 border-zinc-800">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-zinc-400 font-medium text-xs">Customer</TableHead>
                    <TableHead className="text-zinc-400 font-medium text-xs">Plan Details</TableHead>
                    <TableHead className="text-zinc-400 font-medium text-xs text-right">Expiration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expiringSoon.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-zinc-500 py-6 text-xs">
                        No active plans are scheduled for expiration this week.
                      </TableCell>
                    </TableRow>
                  ) : (
                    expiringSoon.map((s, idx) => (
                      <TableRow key={idx} className="border-zinc-800 hover:bg-zinc-900/20 text-xs">
                        <TableCell className="text-white font-medium">
                          {customerMap[s.customerId] || s.customerId}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-amber-500/30 text-amber-400">
                            {s.planId}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-zinc-400 font-mono">
                          {new Date(s.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Terminated/Cancelled Column */}
        <Card className="bg-zinc-950/40 border-zinc-800/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold text-white">Terminated or Frozen Plans</CardTitle>
              <CardDescription className="text-zinc-500 text-xs">Dormant subscription accounts waiting for reactivation</CardDescription>
            </div>
            <Trash2 className="w-5 h-5 text-rose-500" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-y-auto max-h-72">
              <Table>
                <TableHeader className="bg-zinc-900/40 border-zinc-800">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-zinc-400 font-medium text-xs">Customer</TableHead>
                    <TableHead className="text-zinc-400 font-medium text-xs">Plan Details</TableHead>
                    <TableHead className="text-zinc-400 font-medium text-xs text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cancelledPlans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-zinc-500 py-6 text-xs">
                        No cancelled or frozen subscription structures.
                      </TableCell>
                    </TableRow>
                  ) : (
                    cancelledPlans.map((s, idx) => (
                      <TableRow key={idx} className="border-zinc-800 hover:bg-zinc-900/20 text-xs">
                        <TableCell className="text-white font-medium">
                          {customerMap[s.customerId] || s.customerId}
                        </TableCell>
                        <TableCell className="text-zinc-400">
                          {s.planId}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="destructive" className={s.status === 'Frozen' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : ''}>
                            {s.status}
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
