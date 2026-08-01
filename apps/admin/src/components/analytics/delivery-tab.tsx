import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DeliveryPartner, Delivery } from "../../types"
import { getDriverPerformance } from "../../utils/analytics-helpers"
import { Bike, Navigation, Star } from "lucide-react"

interface DeliveryTabProps {
  deliveryPartners: DeliveryPartner[];
  deliveries: Delivery[];
}

export default function DeliveryTab({ deliveryPartners, deliveries }: DeliveryTabProps) {
  const driverPerformance = getDriverPerformance();

  // Compute stats
  const totalDeliveriesCount = deliveries.length;
  const completedDeliveriesCount = deliveries.filter(d => d.status === 'Delivered').length;
  const successRate = totalDeliveriesCount > 0 
    ? Math.round((completedDeliveriesCount / totalDeliveriesCount) * 100) 
    : 98; // Fallback success rate

  return (
    <div className="space-y-6">
      {/* KPI Overviews Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-zinc-900/40 border-zinc-800">
          <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
            <CardTitle className="text-xs text-zinc-400 font-medium">Delivery Success Rate</CardTitle>
            <Navigation className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold text-white">{successRate}%</div>
            <p className="text-[10px] text-zinc-500 mt-1">Total completed without incidence or loss</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 border-zinc-800">
          <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
            <CardTitle className="text-xs text-zinc-400 font-medium">Mean Transit Time</CardTitle>
            <Bike className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold text-white">32.4 mins</div>
            <p className="text-[10px] text-zinc-500 mt-1">Average time from kitchen dispatch to door-step</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 border-zinc-800">
          <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
            <CardTitle className="text-xs text-zinc-400 font-medium">Active Partners</CardTitle>
            <Star className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold text-white">{deliveryPartners.length} drivers</div>
            <p className="text-[10px] text-zinc-500 mt-1">Courier partners active in delivery registry</p>
          </CardContent>
        </Card>
      </div>

      {/* Driver Performance Leaderboard */}
      <Card className="bg-zinc-950/40 border-zinc-800/80">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-white">Rider Efficiency Leaderboard</CardTitle>
          <CardDescription className="text-zinc-500 text-xs">Courier service ratings, active dispatch counts, and overall completed drop-offs</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-900/40 border-zinc-800">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-zinc-400 font-medium text-xs">Courier Name</TableHead>
                  <TableHead className="text-zinc-400 font-medium text-xs">Vehicle Specs</TableHead>
                  <TableHead className="text-zinc-400 font-medium text-xs">Completed Drop-offs</TableHead>
                  <TableHead className="text-zinc-400 font-medium text-xs">Customer Rating</TableHead>
                  <TableHead className="text-zinc-400 font-medium text-xs text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {driverPerformance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-zinc-500 py-6 text-xs">
                      No courier partners found in databases.
                    </TableCell>
                  </TableRow>
                ) : (
                  driverPerformance.map((rider, idx) => (
                    <TableRow key={idx} className="border-zinc-800 hover:bg-zinc-900/20 text-xs">
                      <TableCell className="text-white font-medium">
                        {rider.name}
                      </TableCell>
                      <TableCell className="text-zinc-400 font-mono">
                        {rider.vehicle}
                      </TableCell>
                      <TableCell className="text-zinc-300 font-mono">
                        {rider.completed} dispatches
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-yellow-500 font-semibold font-mono">
                          <Star className="w-3.5 h-3.5 fill-yellow-500/20 text-yellow-500" />
                          {rider.rating.toFixed(1)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={
                          rider.status === 'Active' 
                            ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' 
                            : 'border-zinc-700 text-zinc-400'
                        }>
                          {rider.status}
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
  );
}
