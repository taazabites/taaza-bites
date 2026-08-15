import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  Calendar, 
  Search, 
  Edit2, 
  Play, 
  Pause, 
  CheckCircle, 
  Layers, 
  UtensilsCrossed, 
  DollarSign 
} from "lucide-react";
import { collection, onSnapshot, updateDoc, doc, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/auth-context';
import { auditService } from '../services/audit';

export default function MealsAvailabilityPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // using menuItems collection
    const q = query(collection(db, 'menuItems'));
    const unsub = onSnapshot(q, (snapshot) => {
      setMeals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleToggleAvailability = async (meal: any, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'menuItems', meal.id), { availability: newStatus, updatedAt: new Date().toISOString() });
      if (user) {
        await auditService.logAction(user.id, user.email || '', 'UPDATE', `Availability \${meal.id}`, `Changed availability of \${meal.mealName} to \${newStatus}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filtered = meals.filter(m => m.mealName?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="h-8 w-8 text-emerald-500 animate-pulse" />
            Menu Management
          </h1>
          <p className="text-zinc-400 mt-1">Configure meal categories, menu listings, pricing, and availability plans.</p>
        </div>
      </div>

      {/* UNIFORM MENU MANAGEMENT SUB NAV TABS */}
      <div className="flex border-b border-zinc-800 gap-6 overflow-x-auto  pb-0">
        {[
          { name: "Categories", path: "/meals/categories", icon: Layers },
          { name: "Meals Catalog", path: "/meals", icon: UtensilsCrossed },
          { name: "Pricing Engine", path: "/meals/pricing", icon: DollarSign },
          { name: "Availability Planner", path: "/meals/availability", icon: Calendar }
        ].map((tab) => {
          const isActive = location.pathname === tab.path;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`pb-3 text-sm font-semibold relative transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap px-1 select-none ${
                isActive ? "text-emerald-400 font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              <TabIcon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
              {tab.name}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 border-zinc-900 shadow-md p-5 hover:border-emerald-500/10 transition-all duration-300">
          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider font-mono">Total Meals</p>
          <p className="text-3xl font-bold text-white mt-2">{meals.length}</p>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono">Gourmet creations loaded</p>
        </Card>
        <Card className="bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 border-zinc-900 shadow-md p-5 hover:border-emerald-500/10 transition-all duration-300">
          <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider font-mono">Available Now</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2">{meals.filter(m => m.availability === 'Available').length}</p>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono">Ready for kitchen prep</p>
        </Card>
        <Card className="bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 border-zinc-900 shadow-md p-5 hover:border-emerald-500/10 transition-all duration-300">
          <p className="text-xs text-rose-400 font-semibold uppercase tracking-wider font-mono">Out Of Stock</p>
          <p className="text-3xl font-bold text-rose-400 mt-2">{meals.filter(m => m.availability === 'Out of Stock').length}</p>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono">Pending ingredients</p>
        </Card>
      </div>

      <Card className="bg-zinc-950/50 border-zinc-800 shadow-xl overflow-hidden rounded-xl">
        <CardHeader className="border-b border-zinc-800/60 bg-zinc-900/20 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              Availability Controls
            </CardTitle>
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search meals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-900/50 border-zinc-800 pl-10 text-white w-full"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-zinc-900/50">
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Meal</TableHead>
                  <TableHead className="text-zinc-400 text-center">Breakfast</TableHead>
                  <TableHead className="text-zinc-400 text-center">Lunch</TableHead>
                  <TableHead className="text-zinc-400 text-center">Dinner</TableHead>
                  <TableHead className="text-zinc-400 text-center">Status</TableHead>
                  <TableHead className="text-right text-zinc-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((meal) => (
                  <TableRow key={meal.id} className="border-zinc-800 hover:bg-zinc-900/50">
                    <TableCell className="font-medium text-white">{meal.mealName}</TableCell>
                    <TableCell className="text-center">
                      <CheckCircle className="h-4 w-4 mx-auto text-emerald-500 opacity-50" />
                    </TableCell>
                    <TableCell className="text-center">
                      <CheckCircle className="h-4 w-4 mx-auto text-emerald-500" />
                    </TableCell>
                    <TableCell className="text-center">
                      <CheckCircle className="h-4 w-4 mx-auto text-emerald-500" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={meal.availability === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}>
                        {meal.availability || 'Out of Stock'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {meal.availability === 'Available' ? (
                        <Button size="sm" variant="ghost" onClick={() => handleToggleAvailability(meal, 'Out of Stock')} title="Pause/Disable">
                          <Pause className="h-4 w-4 text-rose-400" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => handleToggleAvailability(meal, 'Available')} title="Resume/Enable">
                          <Play className="h-4 w-4 text-emerald-400" />
                        </Button>
                      )}
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
