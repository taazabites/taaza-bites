import { KitchenProductionItem } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface KitchenTabProps {
  kitchenItems: KitchenProductionItem[];
}

export default function KitchenTab({ kitchenItems }: KitchenTabProps) {
  const prepared = kitchenItems.reduce((acc, item) => acc + item.qtyCompleted, 0);
  const total = kitchenItems.reduce((acc, item) => acc + item.qtyRequired, 0);
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <CardTitle className="text-sm font-medium">Meals Prepared</CardTitle>
          <div className="text-2xl font-bold">{prepared} / {total}</div>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
          <div className="text-2xl font-bold">{total > 0 ? Math.round((prepared / total) * 100) : 0}%</div>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <CardTitle className="text-sm font-medium">Delayed Orders</CardTitle>
          <div className="text-2xl font-bold">2</div>
        </Card>
      </div>
      <Card className="bg-zinc-900/40 border-zinc-800">
        <CardHeader>
          <CardTitle>Kitchen Production Report</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meal Name</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kitchenItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.mealName}</TableCell>
                  <TableCell>{item.qtyRequired}</TableCell>
                  <TableCell>{item.qtyCompleted}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'Completed' ? 'default' : 'secondary'}>{item.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
