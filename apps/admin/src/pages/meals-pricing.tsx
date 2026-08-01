import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  DollarSign, 
  Search, 
  Edit2, 
  Download, 
  Upload, 
  Layers, 
  UtensilsCrossed, 
  Calendar 
} from "lucide-react";
import { collection, onSnapshot, updateDoc, doc, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/auth-context';
import { auditService } from '../services/audit';

export default function MealsPricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPrice, setEditingPrice] = useState<any>(null);
  
  const [price, setPrice] = useState("0");
  const [offerPrice, setOfferPrice] = useState("0");
  const [subPrice, setSubPrice] = useState("0");

  useEffect(() => {
    // using menuItems collection as specified
    const q = query(collection(db, 'menuItems'));
    const unsub = onSnapshot(q, (snapshot) => {
      setMeals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleSave = async () => {
    try {
      const data = {
        price: parseFloat(price) || 0,
        offerPrice: parseFloat(offerPrice) || 0,
        subscriptionPrice: parseFloat(subPrice) || 0,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(doc(db, 'menuItems', editingPrice.id), data);
      
      if (user) {
        await auditService.logAction(user.id, user.email || '', 'UPDATE', `Pricing \${editingPrice.id}`, `Updated pricing for \${editingPrice.mealName}`);
      }
      
      setEditingPrice(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (meal: any) => {
    setEditingPrice(meal);
    setPrice(meal.price?.toString() || "0");
    setOfferPrice(meal.offerPrice?.toString() || "0");
    setSubPrice(meal.subscriptionPrice?.toString() || "0");
  };

  const filtered = meals.filter(m => m.mealName?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-emerald-500 animate-pulse" />
            Menu Management
          </h1>
          <p className="text-zinc-400 mt-1">Configure meal categories, menu listings, pricing, and availability plans.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-zinc-800 text-zinc-300">
            <Upload className="h-4 w-4 mr-2" /> Import CSV
          </Button>
          <Button variant="outline" className="border-zinc-800 text-zinc-300">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
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

      <Card className="bg-zinc-950/50 border-zinc-800 shadow-xl overflow-hidden rounded-xl">
        <CardHeader className="border-b border-zinc-800/60 bg-zinc-900/20 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              Pricing Rules
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
                  <TableHead className="text-zinc-400 text-right">Base Price</TableHead>
                  <TableHead className="text-zinc-400 text-right">Offer Price</TableHead>
                  <TableHead className="text-zinc-400 text-right">Subscription Price</TableHead>
                  <TableHead className="text-zinc-400 text-right">GST (5%)</TableHead>
                  <TableHead className="text-zinc-400 text-right">Final Price</TableHead>
                  <TableHead className="text-zinc-400 text-right">Final Status</TableHead>
                  <TableHead className="text-right text-zinc-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((meal) => (
                  <TableRow key={meal.id} className="border-zinc-800 hover:bg-zinc-900/50">
                    <TableCell className="font-medium text-white">{meal.mealName}</TableCell>
                    <TableCell className="text-right text-zinc-300">₹{meal.price || 0}</TableCell>
                    <TableCell className="text-right text-emerald-400">₹{meal.offerPrice || 0}</TableCell>
                    <TableCell className="text-right text-blue-400">₹{meal.subscriptionPrice || 0}</TableCell>
                    <TableCell className="text-right text-zinc-300">₹{((meal.offerPrice > 0 ? meal.offerPrice : meal.price || 0) * 0.05).toFixed(2)}</TableCell>
                    <TableCell className="text-right font-bold text-emerald-400">₹{((meal.offerPrice > 0 ? meal.offerPrice : meal.price || 0) * 1.05).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      {meal.offerPrice > 0 ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">On Sale</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-zinc-800 text-zinc-400 border-zinc-700">Standard</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(meal)}>
                        <Edit2 className="h-4 w-4 text-zinc-400" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {editingPrice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-zinc-900">
              <h3 className="text-lg font-bold text-white">Edit Pricing for {editingPrice.mealName}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-zinc-400 font-semibold mb-1 block">Base Price (₹)</label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="bg-zinc-900 border-zinc-800 text-white" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-semibold mb-1 block">Offer Price (₹)</label>
                <Input type="number" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} className="bg-zinc-900 border-zinc-800 text-white" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-semibold mb-1 block">Subscription Price (₹)</label>
                <Input type="number" value={subPrice} onChange={(e) => setSubPrice(e.target.value)} className="bg-zinc-900 border-zinc-800 text-white" />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-6 border-t border-zinc-900 bg-zinc-900/10">
              <Button variant="outline" onClick={() => setEditingPrice(null)} className="border-zinc-800 text-zinc-400">Cancel</Button>
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold">Save Pricing</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
