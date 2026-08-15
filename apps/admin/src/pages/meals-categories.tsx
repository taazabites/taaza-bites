import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Search, 
  Layers, 
  RefreshCcw, 
  ChevronUp, 
  ChevronDown, 
  UtensilsCrossed, 
  DollarSign, 
  Calendar 
} from "lucide-react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/auth-context';
import { auditService } from '../services/audit';

export default function MealsCategoriesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  
  const [name, setName] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [status, setStatus] = useState("Active");

  useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('displayOrder', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleSave = async () => {
    try {
      const data = {
        name,
        displayOrder: parseInt(displayOrder) || 0,
        status,
        updatedAt: new Date().toISOString()
      };
      
      if (editingCat) {
        await updateDoc(doc(db, 'categories', editingCat.id), data);
        if (user) {
          await auditService.logAction(user.id, user.email || '', 'UPDATE', `Category \${editingCat.id}`, `Updated category \${name}`);
        }
      } else {
        const docRef = await addDoc(collection(db, 'categories'), {
          ...data,
          mealCount: 0,
          createdAt: new Date().toISOString()
        });
        if (user) {
          await auditService.logAction(user.id, user.email || '', 'CREATE', `Category \${docRef.id}`, `Created category \${name}`);
        }
      }
      setIsModalOpen(false);
      setEditingCat(null);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setName("");
    setDisplayOrder("0");
    setStatus("Active");
  };

  const handleEdit = (cat: any) => {
    setEditingCat(cat);
    setName(cat.name);
    setDisplayOrder(cat.displayOrder?.toString() || "0");
    setStatus(cat.status || "Active");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "\${name}"?`)) {
      await deleteDoc(doc(db, 'categories', id));
      if (user) {
        await auditService.logAction(user.id, user.email || '', 'DELETE', `Category \${id}`, `Deleted category \${name}`);
      }
    }
  };

  const handleStatusToggle = async (cat: any, newStatus: string) => {
    await updateDoc(doc(db, 'categories', cat.id), { status: newStatus });
    if (user) {
      await auditService.logAction(user.id, user.email || '', 'UPDATE', `Category ${cat.id}`, `Changed status to ${newStatus}`);
    }
  };

  const handleMoveOrder = async (cat: any, direction: 'up' | 'down') => {
    try {
      const currentOrder = typeof cat.displayOrder === 'number' ? cat.displayOrder : parseInt(cat.displayOrder) || 0;
      const newOrder = direction === 'up' ? Math.max(0, currentOrder - 1) : currentOrder + 1;
      await updateDoc(doc(db, 'categories', cat.id), { displayOrder: newOrder });
      if (user) {
        await auditService.logAction(user.id, user.email || '', 'UPDATE', `Category ${cat.id}`, `Adjusted display order to ${newOrder}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filtered = categories.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="h-8 w-8 text-emerald-500 animate-pulse" />
            Menu Management
          </h1>
          <p className="text-zinc-400 mt-1">Configure meal categories, menu listings, pricing, and availability plans.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => { setEditingCat(null); resetForm(); setIsModalOpen(true); }} className="bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold px-5 py-2.5 rounded-xl transition-all">
            <Plus className="h-4 w-4 mr-2" /> Add Category
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

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 border-zinc-900 shadow-md p-5 hover:border-emerald-500/10 transition-all duration-300">
          <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider font-mono">Total Categories</p>
          <p className="text-3xl font-bold text-white mt-2">{categories.length}</p>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono">Configured food categories</p>
        </Card>
        <Card className="bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 border-zinc-900 shadow-md p-5 hover:border-emerald-500/10 transition-all duration-300">
          <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider font-mono">Active Categories</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2">{categories.filter(c => c.status === 'Active').length}</p>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono">Active on public storefront</p>
        </Card>
        <Card className="bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 border-zinc-900 shadow-md p-5 hover:border-emerald-500/10 transition-all duration-300">
          <p className="text-xs text-rose-400 font-semibold uppercase tracking-wider font-mono">Inactive Categories</p>
          <p className="text-3xl font-bold text-rose-400 mt-2">{categories.filter(c => c.status !== 'Active').length}</p>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono">Hidden categories</p>
        </Card>
      </div>

      <Card className="bg-zinc-950/50 border-zinc-800 shadow-xl overflow-hidden rounded-xl">
        <CardHeader className="border-b border-zinc-800/60 bg-zinc-900/20 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              Category List
            </CardTitle>
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-900/50 border-zinc-800 pl-10 text-white w-full"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-emerald-500" />
              <p>Loading categories...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
              <Layers className="h-12 w-12 text-zinc-700 mb-4" />
              <p className="text-lg font-medium text-zinc-400">No categories found</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-zinc-900/50">
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400 font-semibold">Category Name</TableHead>
                  <TableHead className="text-zinc-400 font-semibold text-center w-36">Display Order</TableHead>
                  <TableHead className="text-zinc-400 font-semibold text-center">Meal Count</TableHead>
                  <TableHead className="text-zinc-400 font-semibold">Status</TableHead>
                  <TableHead className="text-zinc-400 font-semibold">Created Date</TableHead>
                  <TableHead className="text-right text-zinc-400 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((cat) => (
                  <TableRow key={cat.id} className="border-zinc-800 hover:bg-zinc-900/50 transition-colors">
                    <TableCell className="font-medium text-white">{cat.name}</TableCell>
                    <TableCell className="text-zinc-300">
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 w-7 p-0 hover:bg-zinc-800 hover:text-emerald-400 text-zinc-500"
                          onClick={() => handleMoveOrder(cat, 'up')}
                          title="Move Up (Decrease Index)"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <span className="font-mono text-xs w-6 text-center font-bold">{cat.displayOrder}</span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 w-7 p-0 hover:bg-zinc-800 hover:text-emerald-400 text-zinc-500"
                          onClick={() => handleMoveOrder(cat, 'down')}
                          title="Move Down (Increase Index)"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono font-semibold text-zinc-300">{cat.mealCount || 0}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cat.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}>
                        {cat.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm">
                      {cat.createdAt ? new Date(cat.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {cat.status === 'Active' ? (
                          <Button size="sm" variant="ghost" onClick={() => handleStatusToggle(cat, 'Inactive')} title="Disable">
                            <XCircle className="h-4 w-4 text-rose-400" />
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => handleStatusToggle(cat, 'Active')} title="Enable">
                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(cat)}>
                          <Edit2 className="h-4 w-4 text-zinc-400" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(cat.id, cat.name)}>
                          <Trash2 className="h-4 w-4 text-rose-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-zinc-900">
              <h3 className="text-lg font-bold text-white">{editingCat ? 'Edit Category' : 'Add Category'}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-zinc-400 font-semibold mb-1 block">Category Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-zinc-900 border-zinc-800 text-white" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-semibold mb-1 block">Display Order</label>
                <Input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} className="bg-zinc-900 border-zinc-800 text-white" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-semibold mb-1 block">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-2 px-2.5 text-sm text-zinc-300">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-6 border-t border-zinc-900 bg-zinc-900/10">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} className="border-zinc-800 text-zinc-400">Cancel</Button>
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold">Save Category</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
