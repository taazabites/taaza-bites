import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { db } from '../firebase/db';
import { collection, onSnapshot, query, orderBy, limit, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { Card, Button, Input } from '../components/ui/primitives';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Users, CreditCard, Utensils, Truck, FileText, Settings, 
  ShieldCheck, LayoutDashboard, Wallet, Receipt, TrendingUp,
  Download, Search, Filter, MoreVertical, Edit, Trash2,
  CheckCircle2, Clock, AlertCircle, Plus, MapPin, Power, X, Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { KitchenService, DeliveryService, RazorpayService } from '../firebase/services';
import { useToast } from '../context/ToastContext';
import LoyaltyTab from '../components/admin/LoyaltyTab';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';

export default function EnterpriseAdmin() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('executive');
  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState<any>({ 
    customers: [], 
    subscriptions: [], 
    orders: [], 
    payments: [],
    deliveries: [],
    kitchenQueue: [],
    serviceAreas: []
  });
  const [loading, setLoading] = useState(true);

  const handleGenerateQueue = async () => {
    setIsGenerating(true);
    try {
      await KitchenService.generateTodayQueue();
      showToast("Kitchen queue generated for today's active meals.", "success");
    } catch (err) {
      showToast("Failed to generate kitchen queue.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const unsubscribers = [
      onSnapshot(collection(db, 'users'), (snap) => {
        setData(prev => ({ ...prev, customers: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
      }, (err) => console.warn('users snapshot error:', err)),
      onSnapshot(collection(db, 'subscriptions'), (snap) => {
        setData(prev => ({ ...prev, subscriptions: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
      }, (err) => console.warn('subscriptions snapshot error:', err)),
      onSnapshot(collection(db, 'orders'), (snap) => {
        setData(prev => ({ ...prev, orders: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
      }, (err) => console.warn('orders snapshot error:', err)),
      onSnapshot(collection(db, 'payments'), (snap) => {
        setData(prev => ({ ...prev, payments: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
      }, (err) => console.warn('payments snapshot error:', err)),
      onSnapshot(collection(db, 'deliveries'), (snap) => {
        setData(prev => ({ ...prev, deliveries: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
      }, (err) => console.warn('deliveries snapshot error:', err)),
      onSnapshot(collection(db, 'kitchenQueue'), (snap) => {
        setData(prev => ({ ...prev, kitchenQueue: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
      }, (err) => console.warn('kitchenQueue snapshot error:', err)),
      onSnapshot(collection(db, 'serviceAreas'), (snap) => {
        setData(prev => ({ ...prev, serviceAreas: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
      }, (err) => console.warn('serviceAreas snapshot error:', err))
    ];

    setLoading(false);
    return () => unsubscribers.forEach(unsub => unsub());
  }, []);

  const TABS = [
    { id: 'executive', name: 'Executive', icon: LayoutDashboard },
    { id: 'customers', name: 'Customers', icon: Users },
    { id: 'subscriptions', name: 'Subscriptions', icon: CreditCard },
    { id: 'kitchen', name: 'Kitchen', icon: Utensils },
    { id: 'delivery', name: 'Delivery', icon: Truck },
    { id: 'finance', name: 'Finance', icon: Wallet },
    { id: 'loyalty', name: 'Loyalty', icon: Gift },
    { id: 'reports', name: 'Reports', icon: FileText },
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'logistics', name: 'Service Areas', icon: MapPin },
    { id: 'roles', name: 'Roles', icon: ShieldCheck },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Helmet><title>Enterprise | TaazaBites Admin</title></Helmet>
      
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 text-white p-6 flex flex-col gap-8 hidden lg:flex">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-zinc-900" />
          </div>
          <span className="font-black text-xl tracking-tighter">Enterprise</span>
        </div>

        <nav className="flex flex-col gap-1 overflow-y-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === tab.id 
                ? 'bg-emerald-500 text-zinc-900 shadow-lg shadow-emerald-500/20' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tighter capitalize">{activeTab} Panel</h1>
            <p className="text-zinc-500 text-sm font-medium mt-1">Enterprise-grade management protocol active.</p>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" className="rounded-xl border border-zinc-200">
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
            <div className="w-10 h-10 rounded-full bg-zinc-200 border-2 border-white shadow-sm" />
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'executive' && <ExecutiveTab data={data} />}
          {activeTab === 'customers' && <CustomersTab customers={data.customers} />}
          {activeTab === 'finance' && <FinanceTab payments={data.payments} orders={data.orders} />}
          {activeTab === 'kitchen' && <KitchenTab queue={data.kitchenQueue} onGenerate={handleGenerateQueue} isGenerating={isGenerating} />}
          {activeTab === 'delivery' && <DeliveryTab deliveries={data.deliveries} orders={data.orders} />}
          {activeTab === 'loyalty' && <LoyaltyTab />}
          {activeTab === 'logistics' && <ServiceAreasTab serviceAreas={data.serviceAreas} />}
        </AnimatePresence>
      </main>
    </div>
  );
}

function ExecutiveTab({ data }: { data: any }) {
  const stats = [
    { label: 'Total Customers', value: data.customers.length, trend: '+12%', icon: Users, color: 'text-blue-500' },
    { label: 'Active Subs', value: data.subscriptions.filter((s: any) => s.status === 'active').length, trend: '+5%', icon: CreditCard, color: 'text-emerald-500' },
    { label: 'Today Revenue', value: '₹42,500', trend: '+18%', icon: Wallet, color: 'text-amber-500' },
    { label: 'Pending Delivery', value: data.orders.filter((o: any) => o.deliveryStatus === 'pending').length, trend: '-2%', icon: Truck, color: 'text-rose-500' },
  ];

  const chartData = [
    { name: 'Mon', revenue: 4000, subs: 240 },
    { name: 'Tue', revenue: 3000, subs: 139 },
    { name: 'Wed', revenue: 2000, subs: 980 },
    { name: 'Thu', revenue: 2780, subs: 390 },
    { name: 'Fri', revenue: 1890, subs: 480 },
    { name: 'Sat', revenue: 2390, subs: 380 },
    { name: 'Sun', revenue: 3490, subs: 430 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(s => (
          <Card key={s.label} className="p-6 bg-white border-none shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-zinc-50 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-full ${s.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {s.trend}
              </span>
            </div>
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">{s.label}</p>
            <p className="text-3xl font-black text-zinc-900 mt-1">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8 bg-white border-none shadow-sm">
          <h3 className="text-lg font-black mb-8">Revenue Performance</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-8 bg-white border-none shadow-sm flex flex-col">
          <h3 className="text-lg font-black mb-8">Protocol Distribution</h3>
          <div className="h-[250px] flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{name: 'Starter', val: 40}, {name: 'Pro', val: 35}, {name: 'Elite', val: 25}]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="val">
                  <Cell fill="#10b981" />
                  <Cell fill="#3b82f6" />
                  <Cell fill="#f59e0b" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-zinc-50">
            <div className="text-center">
              <p className="text-[10px] font-black text-zinc-400">STARTER</p>
              <p className="font-black text-emerald-500 text-lg">40%</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-zinc-400">PRO</p>
              <p className="font-black text-blue-500 text-lg">35%</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-zinc-400">ELITE</p>
              <p className="font-black text-amber-500 text-lg">25%</p>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

function CustomersTab({ customers }: { customers: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  const debouncedSetSearch = useDebouncedCallback((val: string) => {
    setSearchTerm(val);
  }, 300);

  const filteredCustomers = customers.filter(c => {
    const search = searchTerm.toLowerCase();
    const name = (c.name || c.displayName || '').toLowerCase();
    const id = (c.uid || c.id || '').toLowerCase();
    const mobile = (c.phoneNumber || '').toLowerCase();
    return name.includes(search) || id.includes(search) || mobile.includes(search);
  });

  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <Card className="p-8 bg-white border-none shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input 
              className="pl-12 h-12 rounded-2xl bg-zinc-50 border-none" 
              placeholder="Search by name, ID or mobile..." 
              value={localSearchTerm}
              onChange={(e) => {
                setLocalSearchTerm(e.target.value);
                debouncedSetSearch(e.target.value);
              }}
            />
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" className="rounded-xl border border-zinc-100"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
            <Button className="bg-zinc-900 text-white rounded-xl px-6">New Customer</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Customer</th>
                <th className="text-left py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Mobile</th>
                <th className="text-left py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Protocol</th>
                <th className="text-left py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Wallet</th>
                <th className="text-left py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                <th className="text-right py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredCustomers.map(c => (
                <tr key={c.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-black text-xs text-zinc-500 uppercase">
                        {(c.name || c.displayName)?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-black text-zinc-900 text-sm tracking-tight">{c.name || c.displayName || 'Anonymous User'}</p>
                        <p className="text-[10px] font-bold text-zinc-400">{c.uid || c.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 font-bold text-sm text-zinc-600">{c.phoneNumber}</td>
                  <td className="py-4">
                    <span className="px-2 py-1 bg-zinc-100 text-zinc-600 rounded-lg text-[10px] font-black uppercase">
                      {c.subscriptionPlan || 'None'}
                    </span>
                  </td>
                  <td className="py-4 font-black text-sm text-emerald-600">₹{c.walletBalance || 0}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase ${c.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      <div className={`w-1 h-1 rounded-full ${c.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {c.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg"><MoreVertical className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
}

function FinanceTab({ payments, orders }: { payments: any[], orders: any[] }) {
  const totalRevenue = payments.filter(p => p.status === 'captured' || p.status === 'verified').reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 bg-zinc-900 text-white border-none shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-emerald-500/10 rounded-full blur-[60px]" />
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest relative z-10">Net Liquidity</p>
          <h2 className="text-4xl font-black mt-2 relative z-10">₹{totalRevenue.toLocaleString()}</h2>
          <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-emerald-400 relative z-10">
            <TrendingUp className="w-3 h-3" /> +14.2% Growth Index
          </div>
        </Card>
        
        <Card className="p-8 bg-white border-none shadow-sm">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active GST Liability</p>
          <h2 className="text-3xl font-black text-zinc-900 mt-2">₹{(totalRevenue * 0.18).toLocaleString()}</h2>
          <p className="text-[10px] font-bold text-zinc-500 mt-2">18% Integrated Goods & Services Tax</p>
        </Card>

        <Card className="p-8 bg-white border-none shadow-sm">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Coupons & Credits</p>
          <h2 className="text-3xl font-black text-rose-500 mt-2">₹1,24,000</h2>
          <p className="text-[10px] font-bold text-zinc-500 mt-2">Total marketing burn index</p>
        </Card>
      </div>

      <Card className="p-8 bg-white border-none shadow-sm">
        <h3 className="text-lg font-black mb-8 tracking-tight">Recent Settlement Ledger</h3>
        <div className="space-y-1">
          {payments.slice(0, 5).map(p => (
            <div key={p.id} className="flex items-center justify-between p-4 hover:bg-zinc-50 rounded-2xl transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <p className="font-black text-zinc-900 text-sm">{p.paymentMethod || 'Razorpay'} Settlement</p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">{p.paymentId || p.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-zinc-900 text-sm">₹{p.amount || 0}</p>
                <p className={`text-[9px] font-black uppercase ${p.status === 'captured' || p.status === 'verified' ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {p.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

function KitchenTab({ queue, onGenerate, isGenerating }: { queue: any[], onGenerate: () => void, isGenerating: boolean }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-zinc-900">Today's Kitchen Throughput</h2>
        <Button 
          onClick={onGenerate} 
          disabled={isGenerating}
          className="bg-emerald-600 text-white rounded-xl px-6"
        >
          {isGenerating ? 'Generating...' : 'Generate Today\'s Queue'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {['Pending', 'Preparing', 'Cooking', 'Ready'].map(status => (
          <div key={status} className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{status}</span>
              <span className="text-xs font-black text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-full">
                {queue.filter(i => i.status === status).length}
              </span>
            </div>
            <div className="space-y-3 min-h-[300px] p-2 bg-zinc-100/50 rounded-3xl border border-dashed border-zinc-200">
              {queue.filter(i => i.status === status).map(item => (
                <Card key={item.id} className="p-4 bg-white border-none shadow-sm">
                  <p className="font-black text-zinc-900 text-xs">{item.customerName}</p>
                  <p className="text-[9px] font-bold text-zinc-400 mt-1 uppercase tracking-wider">{item.mealType} • {item.deliverySlot}</p>
                  <div className="mt-3 flex gap-1.5">
                    <Button variant="ghost" size="sm" className="h-7 px-3 text-[10px] font-black rounded-lg bg-zinc-50 hover:bg-zinc-100">Details</Button>
                    <Button variant="ghost" size="sm" className="h-7 px-3 text-[10px] font-black rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100">Next Stage</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function DeliveryTab({ deliveries, orders }: { deliveries: any[], orders: any[] }) {
  const pendingDeliveries = orders.filter(o => o.deliveryStatus === 'pending' || o.deliveryStatus === 'preparing' || o.deliveryStatus === 'packed');
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8 bg-white border-none shadow-sm">
          <h3 className="text-lg font-black mb-8 tracking-tight">Active Dispatch Queue</h3>
          <div className="space-y-4">
            {pendingDeliveries.length === 0 ? (
              <div className="text-center py-12 text-zinc-400">
                <Truck className="w-12 h-12 m-auto mb-3 opacity-20" />
                <p className="text-sm font-bold uppercase tracking-widest">No orders ready for dispatch</p>
              </div>
            ) : (
              pendingDeliveries.map(o => (
                <div key={o.id} className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100 flex items-center justify-between">
                  <div>
                    <p className="font-black text-zinc-900 text-sm">#{o.orderNumber}</p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1">{o.deliverySlot} • {o.deliveryArea || 'Bengaluru Central Hub'}</p>
                  </div>
                  <div className="flex gap-3">
                    <select className="h-10 rounded-xl bg-white border border-zinc-200 px-3 text-[10px] font-black uppercase tracking-wider outline-none">
                      <option>Select Partner</option>
                      <option>Rider Alpha (HSR Layout)</option>
                      <option>Rider Beta (Indiranagar)</option>
                    </select>
                    <Button className="h-10 bg-zinc-900 text-white text-[10px] font-black px-4 rounded-xl uppercase">Assign & Dispatch</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-8 bg-zinc-950 text-white border-none shadow-xl">
          <h3 className="text-lg font-black mb-8 tracking-tight">Logistics Analytics</h3>
          <div className="space-y-6">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Average Delivery ETA</p>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-emerald-400" />
                <p className="text-2xl font-black tracking-tighter">34.5 MIN</p>
              </div>
            </div>
            
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Completion Rate</p>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                <p className="text-2xl font-black tracking-tighter">98.2%</p>
              </div>
            </div>

            <div className="p-5 bg-rose-500/10 rounded-2xl border border-rose-500/20">
              <p className="text-[10px] font-black text-rose-500/60 uppercase tracking-widest mb-2">Failed Drops</p>
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                <p className="text-2xl font-black tracking-tighter">1.8%</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

function ServiceAreasTab({ serviceAreas }: { serviceAreas: any[] }) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<any>(null);

  const debouncedSetSearch = useDebouncedCallback((val: string) => {
    setSearchTerm(val);
  }, 300);
  const [formData, setFormData] = useState({
    name: '',
    pincode: '',
    isActive: true,
    deliveryCharge: 0,
    minimumOrder: 0,
    estimatedDeliveryTime: '30-45 mins'
  });

  const filteredAreas = serviceAreas.filter(area => {
    const nameMatch = (area.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const pincodeMatch = (area.pincode || '').includes(searchTerm);
    const matchesSearch = nameMatch || pincodeMatch;
    const matchesFilter = filterActive === null || area.isActive === filterActive;
    return matchesSearch && matchesFilter;
  });

  const handleToggleStatus = async (area: any) => {
    try {
      await updateDoc(doc(db, 'serviceAreas', area.id), { isActive: !area.isActive });
      showToast(`${area.name} ${area.isActive ? 'disabled' : 'enabled'} successfully.`, 'success');
    } catch (err) {
      showToast('Failed to update area status.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service area?')) return;
    try {
      await deleteDoc(doc(db, 'serviceAreas', id));
      showToast('Service area deleted successfully.', 'success');
    } catch (err) {
      showToast('Failed to delete service area.', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingArea) {
        await updateDoc(doc(db, 'serviceAreas', editingArea.id), formData);
        showToast('Service area updated successfully.', 'success');
      } else {
        await addDoc(collection(db, 'serviceAreas'), {
          ...formData,
          polygonCoordinates: [] 
        });
        showToast('New service area added successfully.', 'success');
      }
      setIsModalOpen(false);
      setEditingArea(null);
      setFormData({
        name: '',
        pincode: '',
        isActive: true,
        deliveryCharge: 0,
        minimumOrder: 0,
        estimatedDeliveryTime: '30-45 mins'
      });
    } catch (err) {
      showToast('Failed to save service area.', 'error');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            className="pl-12 h-12 rounded-2xl bg-white border-zinc-200" 
            placeholder="Search zones or pincodes..." 
            value={localSearchTerm}
            onChange={(e) => {
              setLocalSearchTerm(e.target.value);
              debouncedSetSearch(e.target.value);
            }}
          />
        </div>
        <div className="flex gap-4">
          <div className="flex bg-zinc-100 p-1 rounded-xl">
            <button 
              onClick={() => setFilterActive(null)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterActive === null ? 'bg-white shadow-sm' : 'text-zinc-500'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilterActive(true)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterActive === true ? 'bg-white shadow-sm' : 'text-zinc-500'}`}
            >
              Active
            </button>
            <button 
              onClick={() => setFilterActive(false)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterActive === false ? 'bg-white shadow-sm' : 'text-zinc-500'}`}
            >
              Inactive
            </button>
          </div>
          <Button 
            onClick={() => { setEditingArea(null); setIsModalOpen(true); }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 h-12 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Zone
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAreas.map(area => (
          <Card key={area.id} className="p-6 bg-white border-zinc-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl -mr-12 -mt-12 transition-colors ${area.isActive ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`} />
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${area.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-zinc-900 tracking-tight">{area.name}</h3>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{area.pincode}</p>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-lg"
                  onClick={() => { 
                    setEditingArea(area); 
                    setFormData({
                      name: area.name,
                      pincode: area.pincode,
                      isActive: area.isActive,
                      deliveryCharge: area.deliveryCharge,
                      minimumOrder: area.minimumOrder,
                      estimatedDeliveryTime: area.estimatedDeliveryTime
                    }); 
                    setIsModalOpen(true); 
                  }}
                >
                  <Edit className="w-4 h-4 text-zinc-400" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-lg hover:bg-rose-50"
                  onClick={() => handleDelete(area.id)}
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
              <div className="bg-zinc-50 p-3 rounded-xl">
                <p className="text-[8px] font-black text-zinc-400 uppercase mb-1">Delivery Fee</p>
                <p className="text-sm font-black text-zinc-900">₹{area.deliveryCharge}</p>
              </div>
              <div className="bg-zinc-50 p-3 rounded-xl">
                <p className="text-[8px] font-black text-zinc-400 uppercase mb-1">Min. Order</p>
                <p className="text-sm font-black text-zinc-900">₹{area.minimumOrder}</p>
              </div>
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase">{area.estimatedDeliveryTime}</span>
              </div>
              <Button
                onClick={() => handleToggleStatus(area)}
                className={`h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                  area.isActive 
                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                }`}
              >
                <Power className="w-3 h-3" /> {area.isActive ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Area Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-zinc-100 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-zinc-900 tracking-tighter">
                    {editingArea ? 'Edit Service Zone' : 'Add New Zone'}
                  </h2>
                  <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Metabolic Logistics Protocol</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Area Name</label>
                    <Input 
                      required 
                      className="h-12 rounded-2xl bg-zinc-50 border-none" 
                      placeholder="e.g. HSR Layout"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Pincode</label>
                    <Input 
                      required 
                      className="h-12 rounded-2xl bg-zinc-50 border-none" 
                      placeholder="6 digits"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={e => setFormData({...formData, pincode: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Delivery Fee (₹)</label>
                    <Input 
                      type="number" 
                      required 
                      className="h-12 rounded-2xl bg-zinc-50 border-none"
                      value={formData.deliveryCharge}
                      onChange={e => setFormData({...formData, deliveryCharge: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Min. Order (₹)</label>
                    <Input 
                      type="number" 
                      required 
                      className="h-12 rounded-2xl bg-zinc-50 border-none"
                      value={formData.minimumOrder}
                      onChange={e => setFormData({...formData, minimumOrder: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Estimated Delivery Time</label>
                  <Input 
                    required 
                    className="h-12 rounded-2xl bg-zinc-50 border-none" 
                    placeholder="e.g. 30-45 mins"
                    value={formData.estimatedDeliveryTime}
                    onChange={e => setFormData({...formData, estimatedDeliveryTime: e.target.value})}
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <input 
                    type="checkbox" 
                    id="isActive"
                    checked={formData.isActive}
                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                    className="w-5 h-5 rounded-lg border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-black text-zinc-700">Active Service Area</label>
                </div>

                <Button className="w-full h-14 bg-zinc-900 text-white rounded-[1.25rem] text-sm font-black uppercase tracking-widest shadow-xl shadow-zinc-900/20">
                  {editingArea ? 'Save Logistics Updates' : 'Initialize Service Zone'}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

