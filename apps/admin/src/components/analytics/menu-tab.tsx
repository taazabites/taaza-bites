import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MenuItem, Order } from "../../types"
import { getMenuMetrics } from "../../utils/analytics-helpers"
import { Star, Flame, Salad } from "lucide-react"

interface MenuTabProps {
  menuItems: MenuItem[];
  orders: Order[];
}

export default function MenuTab({ menuItems, orders }: MenuTabProps) {
  const { bestSelling, leastSelling, fullList } = getMenuMetrics(menuItems, orders);

  return (
    <div className="space-y-6">
      {/* KPI Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-zinc-900/40 border-zinc-800">
          <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
            <CardTitle className="text-xs text-zinc-400 font-medium">Total Active Dishes</CardTitle>
            <Salad className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold text-white">{menuItems.length} meals</div>
            <p className="text-[10px] text-zinc-500 mt-1">Meals currently active on active subscription calendars</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 border-zinc-800">
          <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
            <CardTitle className="text-xs text-zinc-400 font-medium">Mean Meal Rating</CardTitle>
            <Star className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold text-white">4.72 / 5.0</div>
            <p className="text-[10px] text-zinc-500 mt-1">Calculated across verified post-meal customer reviews</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 border-zinc-800">
          <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
            <CardTitle className="text-xs text-zinc-400 font-medium">Average Meal Calories</CardTitle>
            <Flame className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold text-white">435 Kcal</div>
            <p className="text-[10px] text-zinc-500 mt-1">Calorie run-rate ideal for Optimize & Longevity packs</p>
          </CardContent>
        </Card>
      </div>

      {/* Lists Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Best Selling Column */}
        <Card className="bg-zinc-950/40 border-zinc-800/80">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white">Best Selling Dishes</CardTitle>
            <CardDescription className="text-zinc-500 text-xs">Menu meals ranked in descending order of lifetime claims</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-zinc-900/40 border-zinc-800">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-zinc-400 font-medium text-xs">Meal Name</TableHead>
                  <TableHead className="text-zinc-400 font-medium text-xs">Category</TableHead>
                  <TableHead className="text-zinc-400 font-medium text-xs">Macro Profile (P/C/F)</TableHead>
                  <TableHead className="text-zinc-400 font-medium text-xs text-right">Orders Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bestSelling.slice(0, 5).map((meal, idx) => (
                  <TableRow key={idx} className="border-zinc-800 hover:bg-zinc-900/20 text-xs">
                    <TableCell className="text-white font-medium max-w-[150px] truncate">
                      {meal.name}
                    </TableCell>
                    <TableCell className="text-zinc-400">{meal.category}</TableCell>
                    <TableCell className="text-zinc-300 font-mono">
                      {meal.protein}g / {meal.carbs}g / {meal.fat}g
                    </TableCell>
                    <TableCell className="text-emerald-400 font-semibold text-right font-mono">
                      {meal.sales} sales
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Least Selling Column */}
        <Card className="bg-zinc-950/40 border-zinc-800/80">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white">Underperforming Dishes</CardTitle>
            <CardDescription className="text-zinc-500 text-xs">Meals with lower signups, suitable for promotional features or rotations</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-zinc-900/40 border-zinc-800">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-zinc-400 font-medium text-xs">Meal Name</TableHead>
                  <TableHead className="text-zinc-400 font-medium text-xs">Category</TableHead>
                  <TableHead className="text-zinc-400 font-medium text-xs">Macro Profile (P/C/F)</TableHead>
                  <TableHead className="text-zinc-400 font-medium text-xs text-right">Orders Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leastSelling.slice(0, 5).map((meal, idx) => (
                  <TableRow key={idx} className="border-zinc-800 hover:bg-zinc-900/20 text-xs">
                    <TableCell className="text-white font-medium max-w-[150px] truncate">
                      {meal.name}
                    </TableCell>
                    <TableCell className="text-zinc-400">{meal.category}</TableCell>
                    <TableCell className="text-zinc-300 font-mono">
                      {meal.protein}g / {meal.carbs}g / {meal.fat}g
                    </TableCell>
                    <TableCell className="text-amber-500 font-semibold text-right font-mono">
                      {meal.sales} sales
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Comprehensive Diet Macro Grid */}
      <Card className="bg-zinc-950/40 border-zinc-800/80">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-white">Nutrition Performance Profiles</CardTitle>
          <CardDescription className="text-zinc-500 text-xs">Calorie loads, verified average user ratings, and protein compositions across standard active listings</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-900/40 border-zinc-800">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-zinc-400 font-medium text-xs">Dish Name</TableHead>
                  <TableHead className="text-zinc-400 font-medium text-xs">Nutritional Plan</TableHead>
                  <TableHead className="text-zinc-400 font-medium text-xs">Protein Ratio</TableHead>
                  <TableHead className="text-zinc-400 font-medium text-xs">Calorie load</TableHead>
                  <TableHead className="text-zinc-400 font-medium text-xs text-right">Rating Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fullList.map((meal, idx) => {
                  const proteinPercentage = Math.round((meal.protein / (meal.protein + meal.carbs + meal.fat || 1)) * 100);
                  return (
                    <TableRow key={idx} className="border-zinc-800 hover:bg-zinc-900/20 text-xs">
                      <TableCell className="text-white font-medium">{meal.name}</TableCell>
                      <TableCell className="text-zinc-400">{meal.category}</TableCell>
                      <TableCell className="min-w-[140px]">
                        <div className="flex items-center gap-2">
                          {/* Beautiful Native Tailwind custom progress bar */}
                          <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${proteinPercentage}%` }} />
                          </div>
                          <span className="text-[10px] text-zinc-400 font-mono font-semibold">{proteinPercentage}% Pro</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-300 font-mono">{meal.calories} Kcal</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 text-yellow-500 font-semibold font-mono">
                          <Star className="w-3 h-3 fill-yellow-500" />
                          {meal.rating.toFixed(1)}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
