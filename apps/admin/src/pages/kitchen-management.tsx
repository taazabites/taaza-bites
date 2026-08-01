import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ChefHat, Building2, AlertCircle, Loader2, Trash2 } from "lucide-react";
import { kitchenService, Kitchen } from "../services/kitchens";
import { branchService, Branch } from "../services/branches";

export default function KitchenManagementPage() {
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [kitchensData, branchesData] = await Promise.all([
      kitchenService.getKitchens(),
      branchService.getBranches()
    ]);
    setKitchens(kitchensData);
    setBranches(branchesData);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Kitchen Management</h2>
          <p className="text-sm text-zinc-400">Manage kitchen capacity and statuses across branches.</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl">
          <Plus className="mr-2 h-4 w-4" /> Add Kitchen
        </Button>
      </div>

      <Card className="bg-zinc-900/40 border-zinc-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white">Active Kitchens</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-emerald-500" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  <TableHead className="text-zinc-400">Kitchen Name</TableHead>
                  <TableHead className="text-zinc-400">Branch</TableHead>
                  <TableHead className="text-zinc-400">Capacity (Meals/Day)</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kitchens.map((kitchen) => (
                  <TableRow key={kitchen.id} className="border-zinc-800 hover:bg-zinc-900/40">
                    <TableCell className="text-white font-medium flex items-center gap-2">
                      <ChefHat className="h-4 w-4 text-emerald-500" />
                      {kitchen.name}
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      {branches.find(b => b.id === kitchen.branchId)?.name || 'Unknown Branch'}
                    </TableCell>
                    <TableCell className="text-zinc-300">{kitchen.capacity}</TableCell>
                    <TableCell>
                      <Badge className={kitchen.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}>
                        {kitchen.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-rose-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
