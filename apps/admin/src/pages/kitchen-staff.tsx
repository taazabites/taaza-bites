import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, Search, CheckCircle2, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { KitchenTabs } from "../components/kitchen/kitchen-tabs";

export default function KitchenStaffPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Staff Management</h1>
          <p className="text-zinc-400 mt-1">Assign production tasks to kitchen staff and track completion.</p>
        </div>
      </div>
      
      <KitchenTabs />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Staff Roster */}
        <Card className="col-span-1 bg-zinc-900/50 border-zinc-800 shadow-xl overflow-hidden h-fit">
          <CardHeader className="border-b border-zinc-800 bg-zinc-950/50 p-4">
            <CardTitle className="text-white text-base">Active Shift Roster</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-zinc-800/50">
              {[
                { name: "Chef Rahul", role: "Head Chef", status: "Active" },
                { name: "Chef Priya", role: "Prep Cook", status: "Active" },
                { name: "Chef Amit", role: "Grill Station", status: "Active" },
                { name: "Sophia", role: "Packing", status: "Break" },
              ].map((staff, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-zinc-900/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold">
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{staff.name}</div>
                      <div className="text-xs text-zinc-500">{staff.role}</div>
                    </div>
                  </div>
                  <span className={`h-2.5 w-2.5 rounded-full ${staff.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Task Assignments */}
        <Card className="col-span-1 md:col-span-2 bg-zinc-900/50 border-zinc-800 shadow-xl overflow-hidden">
          <CardHeader className="border-b border-zinc-800 bg-zinc-950/50 p-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-white text-base">Task Assignments</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input 
                  placeholder="Search tasks..." 
                  className="pl-9 bg-zinc-900 border-zinc-800 h-9 rounded-xl text-sm focus:border-emerald-500"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/20">
                    <th className="py-3 px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Task</th>
                    <th className="py-3 px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Assigned To</th>
                    <th className="py-3 px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
                    <th className="py-3 px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Completion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {[
                    { task: "Prep 50x Grilled Chicken", to: "Chef Amit", status: "In Progress", time: "-" },
                    { task: "Pack 120 Breakfast Bowls", to: "Sophia", status: "Pending", time: "-" },
                    { task: "Marinate Salmon (20kg)", to: "Chef Priya", status: "Completed", time: "08:30 AM" },
                  ].map((task, i) => (
                    <tr key={i} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-sm">{task.task}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">Assigned by: KM</div>
                      </td>
                      <td className="py-3 px-4 text-zinc-300 text-sm">{task.to}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg border ${
                          task.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                          task.status === 'In Progress' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-zinc-400 text-sm">
                        {task.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
