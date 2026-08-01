import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Award, Zap, Clock, ShieldCheck, DollarSign, Star, AlertCircle } from "lucide-react";

export function LogisticsAnalyticsTab() {
  const driverLeaderboard = [
    { rank: 1, name: "Karthik V", deliveries: 48, onTimeRate: "99.4%", rating: 4.95, vehicle: "Ather 450X (EV)" },
    { rank: 2, name: "Sunil Kumar", deliveries: 44, onTimeRate: "98.8%", rating: 4.91, vehicle: "Ola S1 Pro (EV)" },
    { rank: 3, name: "Manjunath R", deliveries: 42, onTimeRate: "98.2%", rating: 4.88, vehicle: "TVS iQube (EV)" },
    { rank: 4, name: "Rajesh G", deliveries: 39, onTimeRate: "97.5%", rating: 4.85, vehicle: "Electric Van" },
  ];

  const zonePerformance = [
    { zone: "Koramangala Hub", deliveries: 1850, onTime: "99.1%", avgMin: "21.4 mins", costPerMeal: "₹16.2" },
    { zone: "Indiranagar Hub", deliveries: 1620, onTime: "98.7%", avgMin: "22.8 mins", costPerMeal: "₹17.5" },
    { zone: "HSR Layout Hub", deliveries: 1450, onTime: "98.5%", avgMin: "23.1 mins", costPerMeal: "₹18.1" },
    { zone: "Whitefield Hub", deliveries: 1980, onTime: "97.8%", avgMin: "26.5 mins", costPerMeal: "₹21.0" },
    { zone: "Electronic City Hub", deliveries: 1200, onTime: "98.2%", avgMin: "24.0 mins", costPerMeal: "₹19.4" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* High level KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-950 border-zinc-800 p-4">
          <div className="flex justify-between items-center text-zinc-500 text-xs font-bold uppercase">
            <span>Overall On-Time Delivery</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1">98.4%</div>
          <p className="text-[11px] text-zinc-400 mt-1">+1.2% vs last week target</p>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800 p-4">
          <div className="flex justify-between items-center text-zinc-500 text-xs font-bold uppercase">
            <span>Avg Delivery Duration</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-1">23.8 mins</div>
          <p className="text-[11px] text-zinc-400 mt-1">From Kitchen Dispatch to Doorstep</p>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800 p-4">
          <div className="flex justify-between items-center text-zinc-500 text-xs font-bold uppercase">
            <span>Logistics Cost per Meal</span>
            <DollarSign className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-400 mt-1">₹18.40</div>
          <p className="text-[11px] text-emerald-400 mt-1">72% Fleet on Electric Vehicles (EV)</p>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800 p-4">
          <div className="flex justify-between items-center text-zinc-500 text-xs font-bold uppercase">
            <span>Customer Rating Avg</span>
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 mt-1">4.92 / 5</div>
          <p className="text-[11px] text-zinc-400 mt-1">Based on 14,200 ratings</p>
        </Card>
      </div>

      {/* Grid: Driver Leaderboard & Zone Efficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Driver Leaderboard */}
        <Card className="bg-zinc-950 border-zinc-800 overflow-hidden">
          <CardHeader className="bg-zinc-900/40 border-b border-zinc-800">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-400" />
              Daily Driver Performance Leaderboard
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">Top fleet partners based on speed, safety, and customer ratings.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-zinc-900/20">
                <TableRow>
                  <TableHead className="text-zinc-400 text-xs uppercase">Rank</TableHead>
                  <TableHead className="text-zinc-400 text-xs uppercase">Partner</TableHead>
                  <TableHead className="text-zinc-400 text-xs uppercase font-mono">Deliveries</TableHead>
                  <TableHead className="text-zinc-400 text-xs uppercase">On-Time %</TableHead>
                  <TableHead className="text-zinc-400 text-xs uppercase text-right">Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-zinc-900">
                {driverLeaderboard.map((d) => (
                  <TableRow key={d.rank} className="hover:bg-zinc-900/40">
                    <TableCell className="font-extrabold text-amber-400 font-mono text-xs">#{d.rank}</TableCell>
                    <TableCell className="text-xs">
                      <div className="font-bold text-white">{d.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{d.vehicle}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-emerald-400 font-bold">{d.deliveries} meals</TableCell>
                    <TableCell className="text-xs text-white font-mono">{d.onTimeRate}</TableCell>
                    <TableCell className="text-right text-xs font-bold text-amber-400 font-mono">
                      ★ {d.rating}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Bengaluru Zone Efficiency */}
        <Card className="bg-zinc-950 border-zinc-800 overflow-hidden">
          <CardHeader className="bg-zinc-900/40 border-b border-zinc-800">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-emerald-400" />
              Bengaluru Zone Delivery Efficiency
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">Micro-fulfillment cluster throughput and unit economics.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-zinc-900/20">
                <TableRow>
                  <TableHead className="text-zinc-400 text-xs uppercase">Hub Zone</TableHead>
                  <TableHead className="text-zinc-400 text-xs uppercase">Daily Volume</TableHead>
                  <TableHead className="text-zinc-400 text-xs uppercase">On-Time %</TableHead>
                  <TableHead className="text-zinc-400 text-xs uppercase">Avg Travel</TableHead>
                  <TableHead className="text-zinc-400 text-xs uppercase text-right">Cost/Meal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-zinc-900">
                {zonePerformance.map((z) => (
                  <TableRow key={z.zone} className="hover:bg-zinc-900/40">
                    <TableCell className="font-bold text-white text-xs">{z.zone}</TableCell>
                    <TableCell className="text-xs font-mono text-zinc-300">{z.deliveries.toLocaleString()}</TableCell>
                    <TableCell className="text-xs font-mono text-emerald-400 font-bold">{z.onTime}</TableCell>
                    <TableCell className="text-xs font-mono text-zinc-400">{z.avgMin}</TableCell>
                    <TableCell className="text-right text-xs font-mono font-bold text-indigo-400">{z.costPerMeal}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
