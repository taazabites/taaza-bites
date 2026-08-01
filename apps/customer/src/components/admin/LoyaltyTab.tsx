import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/db';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { Card, Button, Input } from '../ui/primitives';
import { 
  Plus, Search, Edit, Trash2, Power, Tag, Users, Wallet, 
  TrendingUp, Download, Filter, Gift, Award, Info, X,
  Calendar, CheckCircle2, AlertCircle, Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CouponService, WalletService, RewardService, ReferralService, AdminService } from '../../firebase/services';
import { useToast } from '../../context/ToastContext';
import { Coupon } from '../../firebase/collections';

export default function LoyaltyTab() {
  const { showToast } = useToast();
  const [subTab, setSubTab] = useState<'coupons' | 'referrals' | 'wallet' | 'rewards'>('coupons');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    title: '',
    description: '',
    type: 'percentage' as Coupon['type'],
    discountValue: 0,
    maxDiscount: 0,
    minimumOrder: 0,
    expiryDate: '',
    active: true,
    usageLimit: 0,
    applicablePlans: [] as string[]
  });

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'coupons'), orderBy('createdAt', 'desc')), (snap) => {
      setCoupons(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon)));
    });

    const fetchStats = async () => {
      try {
        const data = await AdminService.getLoyaltyStats();
        setStats(data);
      } catch (err) {
        console.error("Error fetching loyalty stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
    return () => unsub();
  }, []);

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...couponForm,
        expiryDate: couponForm.expiryDate ? Timestamp.fromDate(new Date(couponForm.expiryDate)) : null,
      };

      if (editingCoupon) {
        await CouponService.updateCoupon(editingCoupon.id, data);
        showToast("Coupon updated successfully", "success");
      } else {
        await CouponService.createCoupon(data as any);
        showToast("Coupon created successfully", "success");
      }
      setIsCouponModalOpen(false);
      setEditingCoupon(null);
      resetCouponForm();
    } catch (err) {
      showToast("Failed to save coupon", "error");
    }
  };

  const resetCouponForm = () => {
    setCouponForm({
      code: '',
      title: '',
      description: '',
      type: 'percentage',
      discountValue: 0,
      maxDiscount: 0,
      minimumOrder: 0,
      expiryDate: '',
      active: true,
      usageLimit: 0,
      applicablePlans: []
    });
  };

  const handleToggleCoupon = async (coupon: Coupon) => {
    try {
      await CouponService.updateCoupon(coupon.id, { active: !coupon.active });
      showToast(`Coupon ${coupon.active ? 'disabled' : 'enabled'}`, "success");
    } catch (err) {
      showToast("Failed to update status", "error");
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm("Delete this coupon permanently?")) return;
    try {
      await CouponService.deleteCoupon(id);
      showToast("Coupon deleted", "success");
    } catch (err) {
      showToast("Failed to delete coupon", "error");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Sub-navigation */}
      <div className="flex items-center gap-2 p-1 bg-zinc-100 rounded-2xl w-fit">
        {[
          { id: 'coupons', name: 'Coupons', icon: Tag },
          { id: 'referrals', name: 'Referrals', icon: Users },
          { id: 'wallet', name: 'Wallet Settings', icon: Wallet },
          { id: 'rewards', name: 'Reward Points', icon: Award },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              subTab === tab.id ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {subTab === 'coupons' && (
          <motion.div key="coupons" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="flex justify-between items-center mb-6">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input className="pl-12 h-12 rounded-2xl bg-white border-zinc-200" placeholder="Search by code or title..." />
              </div>
              <Button 
                onClick={() => { resetCouponForm(); setEditingCoupon(null); setIsCouponModalOpen(true); }}
                className="bg-emerald-600 text-white rounded-xl px-6 h-12 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create Coupon
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map(coupon => (
                <Card key={coupon.id} className="p-6 bg-white border-zinc-100 shadow-sm relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl -mr-12 -mt-12 opacity-10 ${coupon.active ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl ${coupon.active ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-50 text-zinc-400'}`}>
                        <Tag className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-zinc-900">{coupon.code}</h4>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{coupon.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 rounded-lg"
                        onClick={() => {
                          setEditingCoupon(coupon);
                          setCouponForm({
                            code: coupon.code,
                            title: coupon.title,
                            description: coupon.description || '',
                            type: coupon.type,
                            discountValue: coupon.discountValue,
                            maxDiscount: coupon.maxDiscount || 0,
                            minimumOrder: coupon.minimumOrder,
                            expiryDate: coupon.expiryDate ? (() => {
                              try {
                                return typeof coupon.expiryDate?.toMillis === 'function' ? new Date(coupon.expiryDate.toMillis()).toISOString().split('T')[0] : new Date(coupon.expiryDate).toISOString().split('T')[0];
                              } catch (e) { return ''; }
                            })() : '',
                            active: coupon.active,
                            usageLimit: coupon.usageLimit || 0,
                            applicablePlans: coupon.applicablePlans || []
                          });
                          setIsCouponModalOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4 text-zinc-400" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-rose-50" onClick={() => handleDeleteCoupon(coupon.id)}>
                        <Trash2 className="w-4 h-4 text-rose-400" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <p className="text-sm font-bold text-zinc-900">{coupon.title}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-zinc-50 p-3 rounded-xl">
                        <p className="text-[8px] font-black text-zinc-400 uppercase">Discount</p>
                        <p className="text-sm font-black text-emerald-600">
                          {coupon.type === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                        </p>
                      </div>
                      <div className="bg-zinc-50 p-3 rounded-xl">
                        <p className="text-[8px] font-black text-zinc-400 uppercase">Usage</p>
                        <p className="text-sm font-black text-zinc-900">{coupon.usageCount} / {coupon.usageLimit || '∞'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">
                        {coupon.expiryDate ? (() => {
                          try {
                            const ms = typeof coupon.expiryDate?.toMillis === 'function' ? coupon.expiryDate.toMillis() : new Date(coupon.expiryDate).getTime();
                            return `Exp: ${new Date(ms).toLocaleDateString()}`;
                          } catch (e) { return 'No Expiry'; }
                        })() : 'No Expiry'}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleToggleCoupon(coupon)}
                      className={`h-8 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        coupon.active ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      }`}
                    >
                      {coupon.active ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {subTab === 'referrals' && (
           <motion.div key="referrals" className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <Card className="p-8 bg-zinc-900 text-white border-none shadow-xl">
                 <Users className="w-8 h-8 text-emerald-500 mb-4" />
                 <h4 className="text-3xl font-black tracking-tighter">{stats?.totalReferrals || 0}</h4>
                 <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Total referrals generated</p>
               </Card>
               <Card className="p-8 bg-white border-zinc-100">
                 <Gift className="w-8 h-8 text-indigo-500 mb-4" />
                 <h4 className="text-3xl font-black tracking-tighter">{stats?.successfulReferrals || 0}</h4>
                 <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Successful Conversions</p>
               </Card>
               <Card className="p-8 bg-white border-zinc-100">
                 <TrendingUp className="w-8 h-8 text-emerald-500 mb-4" />
                 <h4 className="text-3xl font-black tracking-tighter">
                   {stats?.totalReferrals > 0 ? Math.round((stats.successfulReferrals / stats.totalReferrals) * 100) : 0}%
                 </h4>
                 <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Conversion Velocity</p>
               </Card>
             </div>
             
             <Card className="p-8 bg-white border-zinc-100">
                <h3 className="text-xl font-black text-zinc-900 mb-6">Referral Rewards Summary</h3>
                <div className="grid grid-cols-2 gap-8">
                   <div className="p-6 bg-zinc-50 rounded-3xl">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Lifetime Wallet Credits</p>
                      <p className="text-2xl font-black text-zinc-900">₹{(stats?.successfulReferrals || 0) * 200}</p>
                   </div>
                   <div className="p-6 bg-zinc-50 rounded-3xl">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Lifetime Reward Points</p>
                      <p className="text-2xl font-black text-zinc-900">{(stats?.successfulReferrals || 0) * 100} PTS</p>
                   </div>
                </div>
             </Card>
           </motion.div>
        )}

        {subTab === 'wallet' && (
          <motion.div key="wallet" className="max-w-2xl">
            <Card className="p-8 bg-white border-zinc-100 shadow-sm">
              <h3 className="text-xl font-black text-zinc-900 mb-6">Global Wallet Parameters</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Default Cashback %</label>
                  <div className="flex gap-4">
                    <Input className="h-12 rounded-2xl bg-zinc-50 border-none" defaultValue="5" />
                    <Button className="bg-zinc-900 text-white rounded-xl px-8">Save</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Min. Recharge Amount (₹)</label>
                  <div className="flex gap-4">
                    <Input className="h-12 rounded-2xl bg-zinc-50 border-none" defaultValue="500" />
                    <Button className="bg-zinc-900 text-white rounded-xl px-8">Save</Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {subTab === 'rewards' && (
          <motion.div key="rewards" className="max-w-2xl">
            <Card className="p-8 bg-white border-zinc-100 shadow-sm">
              <h3 className="text-xl font-black text-zinc-900 mb-6">Loyalty Program Engine</h3>
              <div className="space-y-6">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-black text-sm text-emerald-900">Earning Rules</h4>
                    <Button variant="ghost" size="sm" className="text-emerald-600 font-black uppercase text-[10px] tracking-widest">Add Rule</Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-white rounded-xl text-xs">
                      <span className="font-bold text-zinc-600">Daily Check-in</span>
                      <span className="font-black text-emerald-600">+10 Points</span>
                    </div>
                    <div className="flex justify-between p-3 bg-white rounded-xl text-xs">
                      <span className="font-bold text-zinc-600">Plan Purchase (per ₹100)</span>
                      <span className="font-black text-emerald-600">+5 Points</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-black text-sm text-indigo-900">Redemption Rules</h4>
                    <Button variant="ghost" size="sm" className="text-indigo-600 font-black uppercase text-[10px] tracking-widest">Add Rule</Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-white rounded-xl text-xs">
                      <span className="font-bold text-zinc-600">Point Value</span>
                      <span className="font-black text-indigo-600">10 Points = ₹1.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coupon Modal */}
      <AnimatePresence>
        {isCouponModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCouponModalOpen(false)} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-8 border-b border-zinc-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                  <h2 className="text-2xl font-black text-zinc-900 tracking-tighter">{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h2>
                  <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">TaazaBites Marketing Protocol</p>
                </div>
                <button onClick={() => setIsCouponModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"><X className="w-5 h-5 text-zinc-400" /></button>
              </div>

              <form onSubmit={handleCouponSubmit} className="p-8 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Coupon Code</label>
                    <Input required className="h-12 rounded-2xl bg-zinc-50 border-none font-mono" placeholder="WELCOME50" value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Coupon Title</label>
                    <Input required className="h-12 rounded-2xl bg-zinc-50 border-none" placeholder="Flat 50% Off" value={couponForm.title} onChange={e => setCouponForm({...couponForm, title: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea className="w-full p-4 rounded-2xl bg-zinc-50 border-none text-sm font-medium focus:ring-2 focus:ring-emerald-500/20" rows={3} placeholder="Describe the offer..." value={couponForm.description} onChange={e => setCouponForm({...couponForm, description: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Coupon Type</label>
                    <select className="w-full h-12 px-4 rounded-2xl bg-zinc-50 border-none text-sm font-black uppercase tracking-widest appearance-none" value={couponForm.type} onChange={e => setCouponForm({...couponForm, type: e.target.value as any})}>
                      <option value="percentage">Percentage</option>
                      <option value="flat">Flat Discount</option>
                      <option value="free_delivery">Free Delivery</option>
                      <option value="first_order">First Order</option>
                      <option value="festival">Festival Offer</option>
                      <option value="referral">Referral Special</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Discount Value</label>
                    <Input type="number" required className="h-12 rounded-2xl bg-zinc-50 border-none" value={couponForm.discountValue} onChange={e => setCouponForm({...couponForm, discountValue: parseFloat(e.target.value)})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Min. Order Amount (₹)</label>
                    <Input type="number" required className="h-12 rounded-2xl bg-zinc-50 border-none" value={couponForm.minimumOrder} onChange={e => setCouponForm({...couponForm, minimumOrder: parseFloat(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Max Discount (₹)</label>
                    <Input type="number" className="h-12 rounded-2xl bg-zinc-50 border-none" value={couponForm.maxDiscount} onChange={e => setCouponForm({...couponForm, maxDiscount: parseFloat(e.target.value)})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Expiry Date</label>
                    <Input type="date" className="h-12 rounded-2xl bg-zinc-50 border-none" value={couponForm.expiryDate} onChange={e => setCouponForm({...couponForm, expiryDate: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Usage Limit</label>
                    <Input type="number" className="h-12 rounded-2xl bg-zinc-50 border-none" value={couponForm.usageLimit} onChange={e => setCouponForm({...couponForm, usageLimit: parseInt(e.target.value)})} />
                  </div>
                </div>

                <Button className="w-full h-14 bg-zinc-900 text-white rounded-[1.25rem] text-sm font-black uppercase tracking-widest shadow-xl shadow-zinc-900/20">
                  {editingCoupon ? 'Save Coupon Updates' : 'Launch Promo Campaign'}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
