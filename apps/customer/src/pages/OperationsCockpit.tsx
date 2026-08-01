import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, Circle, Play, RefreshCw, Layers, ShieldCheck, 
  UtensilsCrossed, Truck, MapPin, Sparkles, User, Award, 
  Percent, Clock, HeartPulse, ShieldAlert, Check, Plus, 
  Trash2, Phone, Calendar, ArrowRight, Star
} from 'lucide-react';
import { db } from '../firebase/db';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  collection, query, where, orderBy, onSnapshot, 
  doc, setDoc, updateDoc, addDoc, serverTimestamp, getDocs, deleteDoc
} from 'firebase/firestore';
import { KitchenService, DeliveryService } from '../firebase/services';
import { Card, Button, Input } from '../components/ui/primitives';
import GrowthCockpitTab from '../components/admin/GrowthCockpitTab';

interface Step {
  id: string;
  name: string;
  category: 'onboarding' | 'checkout' | 'logistics' | 'customer';
  description: string;
  url?: string;
  details: string;
}

const FLOW_STEPS: Step[] = [
  {
    id: 'landing',
    name: 'taazabites.in',
    category: 'onboarding',
    description: 'Vibrant front-facing marketing portal with fresh green themes, metabolic benefits, and clear CTA triggers.',
    url: '/',
    details: 'The marketing entry point that pairs Inter typography and Outfit display headings to guide health-focused visitors into ordering.'
  },
  {
    id: 'subdomain',
    name: 'subscription.taazabites.in',
    category: 'onboarding',
    description: 'Specialized subscriber app context handling premium customizable nutrition packages and onboarding paths.',
    url: '/plans',
    details: 'Handles personalized caloric protocols, plan durations, and weekly goals cleanly divided from static marketing assets.'
  },
  {
    id: 'auth',
    name: 'Phone OTP Login',
    category: 'onboarding',
    description: 'Instant phone number verification that automatically provisions a secure profile.',
    url: '/login',
    details: 'Provides frictionless credential generation while caching biometric logs safely during guest checkouts.'
  },
  {
    id: 'plans',
    name: 'Browse Plans',
    category: 'onboarding',
    description: 'Custom subscription plans tailored to Optimize, Baseline, and Longevity goals.',
    url: '/plans',
    details: 'Utilizes the multiplexed caching layer to load customizable weekly plans instantly, complete with animated card skeletons.'
  },
  {
    id: 'health',
    name: 'Health Assessment',
    category: 'onboarding',
    description: ' Circadian onboarding biometrics capture form establishing personalized metabolic and macro goals.',
    url: '/plans',
    details: 'Collects age, target weights, wake-up times, and medical restrictions to calibrate the kitchen meal recipes.'
  },
  {
    id: 'address',
    name: 'Address Matrix',
    category: 'onboarding',
    description: 'Precise coordinates capture verified against approved service polygons.',
    url: '/subscribe/address',
    details: 'Features Bengaluru delivery eligibility maps and detailed drop-off coordinates to eliminate dispatch errors.'
  },
  {
    id: 'slot',
    name: 'Delivery Slot',
    category: 'onboarding',
    description: 'CIRCADIAN meal slot configuration aligning delivery drops with daily metabolism window.',
    url: '/subscribe/address',
    details: 'Allows clients to pick Breakfast (7-9 AM), Lunch (12-2 PM), or Dinner (7-9 PM) delivery cycles.'
  },
  {
    id: 'payment',
    name: 'Razorpay Payment',
    category: 'checkout',
    description: 'Interactive sandbox payment simulation featuring dynamic coupon code reductions.',
    url: '/checkout',
    details: 'Simulates direct payment processing with transaction signatures and optional coupon balance updates.'
  },
  {
    id: 'activated',
    name: 'Subscription Activated',
    category: 'checkout',
    description: 'Success screen dispatching subscription structures and PDF invoices.',
    url: '/payment-success',
    details: 'Signals the database to activate subscription intervals and rewards customers with automatic loyalty points.'
  },
  {
    id: 'dashboard',
    name: 'Customer Dashboard',
    category: 'customer',
    description: 'The user cockpit displaying live meal dispatch meters, support chat hubs, and metabolic stats.',
    url: '/dashboard',
    details: 'Houses circular metabolic trackers, wallet balances, active subscription statuses, and real-time live-sync delivery banners.'
  },
  {
    id: 'admin',
    name: 'Admin Panel',
    category: 'logistics',
    description: 'Central operations cockpit overseeing user accounts, active plans, and coupon databases.',
    details: 'Empowers logistics staff to manage subscriptions, seed databases, and review live operations.'
  },
  {
    id: 'kitchen',
    name: 'Kitchen Operations',
    category: 'logistics',
    description: 'The Chef Cockpit detailing metabolic recipes, allergen notes, and meal preparation lines.',
    details: 'Translates individual health assessment biometrics (e.g. gluten-free, low-carb) directly into fresh, packed boxes.'
  },
  {
    id: 'delivery',
    name: 'Delivery Dispatch',
    category: 'logistics',
    description: 'Rider console routing shipments directly to Bengaluru hubs with detailed geocode drop instructions.',
    details: 'Equips delivery couriers with turn-by-turn sector notes, ETAs, and instant drop confirmation tags.'
  },
  {
    id: 'received',
    name: 'Customer Receives Meal',
    category: 'customer',
    description: 'Delivery loop completion prompting immediate chef and rider rating controls.',
    details: 'Updates client dashboard instantly to Delivered, unlocking micro-rating sliders for ongoing meal quality control.'
  }
];

export default function OperationsCockpit() {
  const { currentUser, isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'flow' | 'admin' | 'kitchen' | 'delivery' | 'growth' | 'requests'>('flow');
  const [selectedStep, setSelectedStep] = useState<Step>(FLOW_STEPS[0]);

  // Firestore Data States
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [kitchenQueue, setKitchenQueue] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);

  // New Coupon Form
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('500');
  const [newCouponMinOrder, setNewCouponMinOrder] = useState('2000');
  const [newCouponType, setNewCouponType] = useState<'flat' | 'percentage'>('flat');

  // Simulation Control State
  const [simulationActive, setSimulationActive] = useState(false);
  const [currentSimOrder, setCurrentSimOrder] = useState<any>(null);

  useEffect(() => {
    // 1. Sync Subscriptions in Real Time
    const unsubSubs = onSnapshot(collection(db, 'subscriptions'), (snap) => {
      setSubscriptions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.warn('subscriptions snapshot error:', err));

    // 2. Sync Orders in Real Time
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
      const allOrders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setOrders(allOrders);
      
      // Look for any currently active tracking order for simulation purposes
      const active = allOrders.find(o => o.deliveryStatus !== 'delivered' && o.deliveryStatus !== 'cancelled');
      if (active) {
        setCurrentSimOrder(active);
      } else if (allOrders.length > 0) {
        // Fallback to latest
        const sorted = [...allOrders].sort((a, b) => {
          const tA = a.createdAt?.seconds || 0;
          const tB = b.createdAt?.seconds || 0;
          return tB - tA;
        });
        setCurrentSimOrder(sorted[0]);
      }
    }, (err) => console.warn('orders snapshot error:', err));

    // 3. Sync Coupons
    const unsubCoupons = onSnapshot(collection(db, 'coupons'), (snap) => {
      setCoupons(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.warn('coupons snapshot error:', err));

    // 4. Sync Users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.warn('users snapshot error:', err);
      setLoading(false);
    });

    // 5. Sync Kitchen Queue
    const unsubKitchen = KitchenService.subscribeToKitchenQueue(setKitchenQueue);

    // 6. Sync Deliveries
    const unsubDeliveries = DeliveryService.subscribeToDeliveries(setDeliveries);

    return () => {
      unsubSubs();
      unsubOrders();
      unsubCoupons();
      unsubUsers();
      unsubKitchen();
      unsubDeliveries();
    };
  }, []);

  // Operations: Update order delivery status
  const updateOrderStatus = async (orderId: string, status: string, additionalFields = {}) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        deliveryStatus: status,
        updatedAt: serverTimestamp(),
        ...additionalFields
      });
      showToast(`Order status updated to ${status.toUpperCase()}!`, "success");
    } catch (e) {
      console.error("Error updating order:", e);
      showToast("Failed to update status", "error");
    }
  };

  // Operations: Create active order cycle for test
  const createMockOrderCycle = async () => {
    if (!currentUser) {
      showToast("Please log in first to run simulated cycles.", "info");
      navigate('/login');
      return;
    }

    setSimulationActive(true);
    try {
      const orderId = `ORD-SIM-${Math.floor(100000 + Math.random() * 900000)}`;
      const mealOptions = [
        "Metabolic Bio-Box (Quinoa & Edamame Base)",
        "Circadian Salmon & Greens Bowl",
        "Ketogenic Avocado Egg Protein Plate",
        "Plant Metabolic Tofu Nourish Plate"
      ];
      const chefNotesList = [
        "Crafted on high-protein black quinoa base with direct-press vinaigrette.",
        "Contains fresh salmon fillet paired with circadian spinach logs.",
        "Loaded with healthy monounsaturated avocado fats and egg white albumin.",
        "Crafted using locally-sourced fresh tofu cubes and toasted sesame seeds."
      ];
      
      const selectIndex = Math.floor(Math.random() * mealOptions.length);

      const mockOrder = {
        id: orderId,
        orderNumber: orderId,
        userId: currentUser.uid,
        subscriptionId: currentUser.uid,
        mealScheduleId: "sim_schedule_01",
        planName: "Metabolic Optimize Protocol",
        mealName: mealOptions[selectIndex],
        mealImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        chefNotes: chefNotesList[selectIndex],
        amount: 4999,
        discount: 500,
        coupon: "TAAZA20",
        tax: 235,
        paymentStatus: "paid",
        deliveryStatus: "pending", // Flow steps: pending -> preparing -> packed -> dispatched -> arriving -> delivered
        orderStatus: "confirmed",
        deliverySlot: "Lunch (12:00 PM - 02:00 PM)",
        deliveryAddress: "HSR Layout, Sector 1, Bengaluru, Karnataka (Drop Zone B)",
        deliveryInstructions: "Leave with security guard, call when drop completed.",
        eta: "1:30 PM",
        driverName: "Courier Alpha (Rider)",
        driverPhone: "+91 99999 88888",
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'orders', orderId), mockOrder);
      
      // Update User profile subscription status for active look
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        hasActiveSubscription: true,
        updatedAt: serverTimestamp()
      });

      // Also ensure a subscription document exists
      const subId = currentUser.uid;
      await setDoc(doc(db, 'subscriptions', subId), {
        id: subId,
        userId: currentUser.uid,
        planId: "sim_plan_01",
        planName: "Metabolic Optimize Protocol",
        status: "active",
        startDate: serverTimestamp(),
        endDate: serverTimestamp(),
        remainingMeals: 24,
        paused: false,
        deliveryTime: "Lunch (12:00 PM - 02:00 PM)",
        deliveryAddressId: "default_address",
        createdAt: serverTimestamp()
      });

      showToast("Simulated active order cycle initialized!", "success");
      setActiveTab('kitchen'); // Jump to Kitchen to let them start
    } catch (e) {
      console.error(e);
      showToast("Error starting simulation", "error");
    } finally {
      setSimulationActive(false);
    }
  };

  // Operations: Manage Coupons
  const createCoupon = async () => {
    if (!newCouponCode) return;
    try {
      const couponId = newCouponCode.toUpperCase().trim();
      await setDoc(doc(db, 'coupons', couponId), {
        id: couponId,
        code: couponId,
        discount: parseInt(newCouponDiscount, 10),
        minOrder: parseInt(newCouponMinOrder, 10),
        type: newCouponType,
        active: true,
        expiryDate: serverTimestamp(), // Dummy valid
        createdAt: serverTimestamp()
      });
      showToast(`Coupon ${couponId} created successfully!`, "success");
      setNewCouponCode('');
    } catch (e) {
      console.error(e);
      showToast("Failed to create coupon", "error");
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'coupons', id));
      showToast("Coupon deleted", "success");
    } catch (e) {
      console.error(e);
    }
  };

  // Step Status Evaluator
  const getStepStatus = (stepId: string) => {
    if (!currentUser) return 'pending';

    switch (stepId) {
      case 'landing':
      case 'subdomain':
      case 'plans':
        return 'completed';
      case 'auth':
        return currentUser ? 'completed' : 'active';
      case 'health':
        const assessment = subscriptions.length > 0; // Check if active subscription exists
        return assessment ? 'completed' : 'active';
      case 'address':
      case 'slot':
        return subscriptions.length > 0 ? 'completed' : 'pending';
      case 'payment':
        return orders.some(o => o.paymentStatus === 'paid') ? 'completed' : 'pending';
      case 'activated':
        return subscriptions.some(s => s.status === 'active') ? 'completed' : 'pending';
      case 'dashboard':
        return currentUser ? 'completed' : 'pending';
      case 'admin':
        return isAdmin ? 'completed' : 'pending';
      case 'kitchen':
        return currentSimOrder?.deliveryStatus === 'preparing' || currentSimOrder?.deliveryStatus === 'packed' ? 'active' : (['shipped', 'arriving', 'delivered'].includes(currentSimOrder?.deliveryStatus) ? 'completed' : 'pending');
      case 'delivery':
        return currentSimOrder?.deliveryStatus === 'shipped' || currentSimOrder?.deliveryStatus === 'arriving' ? 'active' : (currentSimOrder?.deliveryStatus === 'delivered' ? 'completed' : 'pending');
      case 'received':
        return currentSimOrder?.deliveryStatus === 'delivered' ? 'completed' : 'pending';
      default:
        return 'pending';
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Operations & Journey Cockpit | TaazaBites</title>
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Upper Header section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 sm:p-10 rounded-[3rem] border border-zinc-100 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px]" />
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest">
              <Sparkles className="w-4 h-4 animate-pulse" /> Operations & Simulation Center
            </div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl">
              TaazaBites <span className="text-emerald-600">Ecosystem Cockpit</span>
            </h1>
            <p className="text-zinc-500 max-w-2xl text-sm leading-relaxed">
              This unified control panel traces the exact lifecycle sequence of TaazaBites. Manage active subscription databases, simulate kitchen orders, dispatch deliveries, and track live status synchronization.
            </p>
          </div>
          <div className="relative z-10 shrink-0 flex flex-wrap gap-4">
            <Button 
              onClick={createMockOrderCycle} 
              disabled={simulationActive}
              className="px-6 py-4 rounded-2xl bg-zinc-950 text-white font-black hover:bg-zinc-900 transition flex items-center gap-2 shadow-lg shadow-zinc-950/20"
            >
              <RefreshCw className={`w-4 h-4 ${simulationActive ? 'animate-spin' : ''}`} />
              Seed Active Order Cycle
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="px-5 py-4 rounded-2xl border-zinc-200 text-zinc-700 font-black hover:bg-zinc-50 transition"
            >
              Customer Dashboard
            </Button>
          </div>
        </header>

        {/* Dynamic Cockpit Navigation Tabs */}
        <div className="flex border-b border-zinc-200 bg-white p-2 rounded-2xl shadow-sm gap-2">
          <button 
            onClick={() => setActiveTab('flow')}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
              activeTab === 'flow' ? 'bg-emerald-500 text-white' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
            }`}
          >
            <Layers className="w-4 h-4" /> 1. Journey Timeline
          </button>
          <button 
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
              activeTab === 'admin' ? 'bg-emerald-500 text-white' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> 2. Admin operations
          </button>
          <button 
            onClick={() => setActiveTab('kitchen')}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition relative ${
              activeTab === 'kitchen' ? 'bg-emerald-500 text-white' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" /> 3. Kitchen Cockpit
            {orders.some(o => o.deliveryStatus === 'pending' || o.deliveryStatus === 'preparing') && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('delivery')}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition relative ${
              activeTab === 'delivery' ? 'bg-emerald-500 text-white' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
            }`}
          >
            <Truck className="w-4 h-4" /> 4. Rider Logistics
            {orders.some(o => o.deliveryStatus === 'packed' || o.deliveryStatus === 'shipped') && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-500 animate-ping" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('growth')}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition relative ${
              activeTab === 'growth' ? 'bg-emerald-500 text-white' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
            }`}
          >
            <Sparkles className="w-4 h-4" /> 5. Growth & Marketing
          </button>
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          
          {activeTab === 'requests' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Pending Approvals</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Meal Customization Requests */}
                <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 flex flex-col">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Meal Modifications</h4>
                      <p className="text-xs text-zinc-500">Approve or reject custom meals</p>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="p-8 text-center text-zinc-500">
                      <p className="text-sm">No pending meal requests</p>
                    </div>
                  </div>
                </div>

                {/* Pause/Resume Requests */}
                <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 flex flex-col">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Subscription Controls</h4>
                      <p className="text-xs text-zinc-500">Approve pauses and plan upgrades</p>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="p-8 text-center text-zinc-500">
                      <p className="text-sm">No pending subscription requests</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'flow' && (
            <motion.div 
              key="flow"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Journey Timeline left two cols */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-8 sm:p-10 rounded-[2.5rem] bg-white border border-zinc-100 shadow-lg space-y-8">
                  <div>
                    <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Interactive Journey Map</h2>
                    <p className="text-zinc-400 text-sm mt-1">
                      Tracing the exact sequential path requested. Click any step to examine backend validation layers, geocode validators, and live operations.
                    </p>
                  </div>

                  {/* Vertical Timeline Stack */}
                  <div className="relative pl-8 space-y-6">
                    {/* Line helper */}
                    <div className="absolute left-[15px] top-4 bottom-4 w-1 bg-zinc-100 rounded-full" />

                    {FLOW_STEPS.map((step, index) => {
                      const status = getStepStatus(step.id);
                      const isSelected = selectedStep.id === step.id;

                      return (
                        <div 
                          key={step.id} 
                          className="relative flex items-start gap-4 cursor-pointer group"
                          onClick={() => setSelectedStep(step)}
                        >
                          {/* Left dot icon indicator */}
                          <div className="absolute -left-[32px] mt-1 bg-white p-1 rounded-full z-10">
                            {status === 'completed' ? (
                              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                            ) : status === 'active' ? (
                              <div className="w-6 h-6 rounded-full border-4 border-orange-500 bg-orange-100 animate-pulse flex items-center justify-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                              </div>
                            ) : (
                              <Circle className="w-6 h-6 text-zinc-300 group-hover:text-zinc-400 transition" />
                            )}
                          </div>

                          {/* Node card */}
                          <div className={`flex-grow p-5 rounded-2xl border transition-all ${
                            isSelected 
                              ? 'border-emerald-500 bg-emerald-50/25 shadow-md' 
                              : 'border-zinc-100 bg-white hover:border-zinc-300 hover:shadow-xs'
                          }`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <span className="font-black text-zinc-900 tracking-tight text-base flex items-center gap-2">
                                <span className="text-zinc-300 font-mono text-xs">{String(index + 1).padStart(2, '0')}.</span>
                                {step.name}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest self-start ${
                                step.category === 'onboarding' ? 'bg-emerald-100 text-emerald-700' :
                                step.category === 'checkout' ? 'bg-amber-100 text-amber-700' :
                                step.category === 'logistics' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                              }`}>
                                {step.category}
                              </span>
                            </div>
                            <p className="text-zinc-500 text-xs mt-1.5 leading-relaxed">{step.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>

              {/* Step info sidebar */}
              <div className="space-y-6">
                <Card className="p-8 rounded-[2.5rem] bg-zinc-950 text-white border-none shadow-2xl sticky top-28 overflow-hidden space-y-6">
                  <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-emerald-500/10 rounded-full blur-[60px]" />
                  
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Step details</p>
                    <h3 className="text-2xl font-black text-white tracking-tight mt-1">{selectedStep.name}</h3>
                  </div>

                  <div className="relative z-10 p-5 rounded-2xl bg-white/5 border border-white/10 text-xs text-zinc-300 leading-relaxed space-y-4">
                    <p>{selectedStep.details}</p>
                  </div>

                  <div className="relative z-10 space-y-3">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Operations simulation</p>
                    {selectedStep.url ? (
                      <Button 
                        onClick={() => navigate(selectedStep.url!)}
                        className="w-full py-3.5 bg-emerald-500 text-white font-black rounded-xl hover:bg-emerald-600 transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                      >
                        <Play className="w-3.5 h-3.5" /> Navigate to this page
                      </Button>
                    ) : (
                      <div className="p-4 rounded-xl bg-zinc-900 border border-white/5 text-center text-zinc-400 text-xs font-bold">
                        Internal Logistics Node (Manage via Tabs Above)
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div 
              key="admin"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Analytics and seeding card */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 bg-white border border-zinc-100 rounded-3xl text-zinc-900 flex flex-col justify-between shadow-sm">
                  <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Total users</span>
                  <p className="text-3xl font-black tracking-tight mt-2">{users.length}</p>
                  <p className="text-[10px] text-emerald-600 font-bold mt-1">Live database synced</p>
                </Card>
                <Card className="p-6 bg-white border border-zinc-100 rounded-3xl text-zinc-900 flex flex-col justify-between shadow-sm">
                  <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Subscriptions</span>
                  <p className="text-3xl font-black tracking-tight mt-2">{subscriptions.length}</p>
                  <p className="text-[10px] text-zinc-500 font-bold mt-1">{subscriptions.filter(s => s.status === 'active').length} Active, {subscriptions.filter(s => s.status === 'paused').length} Paused</p>
                </Card>
                <Card className="p-6 bg-white border border-zinc-100 rounded-3xl text-zinc-900 flex flex-col justify-between shadow-sm">
                  <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Active Coupons</span>
                  <p className="text-3xl font-black tracking-tight mt-2">{coupons.filter(c => c.active).length}</p>
                  <p className="text-[10px] text-zinc-500 font-bold mt-1">Applied during Razorpay flow</p>
                </Card>
                <Card className="p-6 bg-white border border-zinc-100 rounded-3xl text-zinc-900 flex flex-col justify-between shadow-sm">
                  <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Operations status</span>
                  <p className="text-3xl font-black text-emerald-600 tracking-tight mt-2">ONLINE</p>
                  <p className="text-[10px] text-zinc-500 font-bold mt-1">Connected to Backend</p>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Coupon Management */}
                <Card className="p-8 rounded-[2.5rem] bg-white border border-zinc-100 shadow-md space-y-6">
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-zinc-900 flex items-center gap-2">
                      <Percent className="text-emerald-500" /> Coupon codes manager
                    </h3>
                    <p className="text-zinc-400 text-xs mt-1">
                      Active coupons are accessible during checkout. Use these active coupons to test Razorpay discount pipelines.
                    </p>
                  </div>

                  {/* Create Coupon inline form */}
                  <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100 space-y-4">
                    <p className="text-xs font-black text-zinc-700 uppercase tracking-wider">Generate promo code</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Promo Code</label>
                        <Input 
                          placeholder="e.g. HEALTH30" 
                          value={newCouponCode}
                          onChange={(e) => setNewCouponCode(e.target.value)}
                          className="mt-1 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Discount Value (₹)</label>
                        <Input 
                          type="number" 
                          value={newCouponDiscount}
                          onChange={(e) => setNewCouponDiscount(e.target.value)}
                          className="mt-1 bg-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Minimum Order Value (₹)</label>
                        <Input 
                          type="number" 
                          value={newCouponMinOrder}
                          onChange={(e) => setNewCouponMinOrder(e.target.value)}
                          className="mt-1 bg-white"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button 
                          onClick={createCoupon}
                          className="w-full py-3 rounded-xl bg-zinc-900 text-white font-bold hover:bg-zinc-800 flex items-center justify-center gap-1.5 text-xs"
                        >
                          <Plus className="w-4 h-4" /> Add Coupon
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Coupon List */}
                  <div className="space-y-3">
                    <p className="text-xs font-black text-zinc-700 uppercase tracking-wider">Active Promo Codes</p>
                    {coupons.length === 0 ? (
                      <p className="text-zinc-400 text-xs italic">No promo codes registered. Seed or create some.</p>
                    ) : (
                      <div className="divide-y divide-zinc-100 max-h-[180px] overflow-y-auto pr-2">
                        {coupons.map((coupon) => (
                          <div key={coupon.id} className="py-3 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded mr-2">{coupon.code}</span>
                              <span className="text-zinc-500">₹{coupon.discount} off (Min ₹{coupon.minOrder})</span>
                            </div>
                            <button 
                              onClick={() => deleteCoupon(coupon.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>

                {/* Subscriptions Overrider */}
                <Card className="p-8 rounded-[2.5rem] bg-white border border-zinc-100 shadow-md space-y-6">
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-zinc-900 flex items-center gap-2">
                      <Calendar className="text-emerald-500" /> Subscription Override Panel
                    </h3>
                    <p className="text-zinc-400 text-xs mt-1">
                      Direct state overrides for active subscriptions. Toggle between active, paused, or expired to test subscriber dashboard states.
                    </p>
                  </div>

                  <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
                    {subscriptions.length === 0 ? (
                      <div className="text-center py-8 text-zinc-400 text-xs italic">
                        No subscription documents registered. Click "Seed Active Order Cycle" to generate live subscriptions.
                      </div>
                    ) : (
                      subscriptions.map((sub) => (
                        <div key={sub.id} className="p-4 rounded-xl border border-zinc-100 text-xs space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-zinc-800">{sub.planName || "Metabolic Plan"}</p>
                              <p className="text-[10px] text-zinc-400">UID: {sub.userId?.slice(0, 10)}...</p>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              sub.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                              sub.status === 'paused' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {sub.status}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <button 
                              onClick={async () => {
                                await updateDoc(doc(db, 'subscriptions', sub.id), { status: 'active', paused: false });
                                showToast("Subscription set to ACTIVE!", "success");
                              }}
                              className="flex-1 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 font-bold text-[10px]"
                            >
                              Activate
                            </button>
                            <button 
                              onClick={async () => {
                                await updateDoc(doc(db, 'subscriptions', sub.id), { status: 'paused', paused: true });
                                showToast("Subscription PAUSED!", "info");
                              }}
                              className="flex-1 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 font-bold text-[10px]"
                            >
                              Pause
                            </button>
                            <button 
                              onClick={async () => {
                                await updateDoc(doc(db, 'subscriptions', sub.id), { status: 'expired', paused: false });
                                showToast("Subscription EXPIRED!", "error");
                              }}
                              className="flex-1 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 font-bold text-[10px]"
                            >
                              Expire
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'kitchen' && (
            <motion.div 
              key="kitchen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Kitchen active orders left two cols */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-8 sm:p-10 rounded-[2.5rem] bg-white border border-zinc-100 shadow-lg space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Chef's Preparing Table</h2>
                    <p className="text-zinc-400 text-sm mt-1">
                      Manage preparation logs for metabolic meal protocols. Chef notes are custom-generated based on metabolic biometrics.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {orders.filter(o => ['pending', 'preparing', 'packed'].includes(o.deliveryStatus)).length === 0 ? (
                      <div className="text-center py-16 border-2 border-dashed border-zinc-200 rounded-3xl flex flex-col justify-center items-center text-zinc-400">
                        <UtensilsCrossed className="w-12 h-12 text-zinc-200 mb-3" />
                        <p className="font-bold text-sm">Preparing table empty.</p>
                        <p className="text-xs mt-1 text-zinc-400 max-w-xs">
                          Click "Seed Active Order Cycle" at the top to dispatch a mock order directly to this table!
                        </p>
                      </div>
                    ) : (
                      orders.filter(o => ['pending', 'preparing', 'packed'].includes(o.deliveryStatus)).map((order) => (
                        <div key={order.id} className="p-6 rounded-3xl border border-zinc-100 bg-zinc-50 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-4">
                            <div>
                              <p className="font-mono text-[10px] text-zinc-400 font-bold">ORDER ID: {order.orderNumber}</p>
                              <h4 className="font-black text-zinc-900 text-lg tracking-tight mt-0.5">{order.mealName || "Metabolic Nourish Bowl"}</h4>
                            </div>
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 font-black rounded-full text-[9px] uppercase tracking-wider self-start sm:self-center">
                              STATUS: {order.deliveryStatus?.toUpperCase()}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                              <p className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Dietary Goal</p>
                              <p className="font-bold text-zinc-800 mt-0.5">{order.planName || "Weight Loss & Fitness Plan"}</p>
                            </div>
                            <div>
                              <p className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Delivery Slot</p>
                              <p className="font-bold text-zinc-800 mt-0.5 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-emerald-500" /> {order.deliverySlot}</p>
                            </div>
                          </div>

                          {/* Chef Recipe calibration info */}
                          <div className="bg-white p-4 rounded-xl border border-zinc-100/50 text-xs">
                            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                              <HeartPulse className="w-3.5 h-3.5 text-rose-500" /> Circadian biometrics recipe instructions
                            </p>
                            <p className="text-zinc-600 leading-relaxed italic">
                              "{order.chefNotes || "High-protein recipe optimized with whole grain brown rice, broccoli rabe logs, and sesame seed oils."}"
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-3 pt-2 border-t border-zinc-100">
                            {order.deliveryStatus === 'pending' && (
                              <Button 
                                onClick={() => updateOrderStatus(order.id, 'preparing')}
                                className="px-4 py-2 bg-emerald-500 text-white font-black rounded-xl hover:bg-emerald-600 text-xs transition"
                              >
                                Start Cooking
                              </Button>
                            )}
                            {order.deliveryStatus === 'preparing' && (
                              <Button 
                                onClick={() => updateOrderStatus(order.id, 'packed')}
                                className="px-4 py-2 bg-zinc-900 text-white font-black rounded-xl hover:bg-zinc-800 text-xs transition"
                              >
                                Mark as Packed
                              </Button>
                            )}
                            {order.deliveryStatus === 'packed' && (
                              <Button 
                                onClick={() => {
                                  updateOrderStatus(order.id, 'shipped', {
                                    driverName: "Courier Alpha (Rider)",
                                    driverPhone: "+91 99999 88888"
                                  });
                                  setActiveTab('delivery'); // Push to rider cockpit
                                }}
                                className="px-4 py-2 bg-blue-500 text-white font-black rounded-xl hover:bg-blue-600 text-xs transition flex items-center gap-1.5"
                              >
                                Hand over & Dispatch <ArrowRight className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>

              {/* Kitchen Guidelines */}
              <div className="space-y-6">
                <Card className="p-8 rounded-[2.5rem] bg-emerald-950 text-white border-none shadow-xl space-y-6 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-white/5 rounded-full blur-[40px]" />
                  <div className="relative z-10 space-y-2">
                    <UtensilsCrossed className="w-8 h-8 text-emerald-400" />
                    <h3 className="text-xl font-black text-white tracking-tight">Kitchen Protocols</h3>
                    <p className="text-emerald-200/80 text-xs leading-relaxed">
                      Meal preparation is dynamic. As soon as the chef marks a meal as 'Preparing' or 'Packed', the changes synchronize with the customer's dashboard tracker in real time.
                    </p>
                  </div>
                  
                  <div className="relative z-10 space-y-3 pt-4 border-t border-emerald-900 text-xs text-emerald-200/70">
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Target protein calibrations</p>
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Allergen verification checkpoints</p>
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Thermal seal validation</p>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'delivery' && (
            <motion.div 
              key="delivery"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Delivery dispatch logs left two cols */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-8 sm:p-10 rounded-[2.5rem] bg-white border border-zinc-100 shadow-lg space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Rider Dispatch & Routes</h2>
                    <p className="text-zinc-400 text-sm mt-1">
                      Courier dashboard tracking Bengaluru target hubs coordinates, landmark checkpoints, and drop-off instructions.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {orders.filter(o => ['shipped', 'arriving'].includes(o.deliveryStatus)).length === 0 ? (
                      <div className="text-center py-16 border-2 border-dashed border-zinc-200 rounded-3xl flex flex-col justify-center items-center text-zinc-400">
                        <Truck className="w-12 h-12 text-zinc-200 mb-3" />
                        <p className="font-bold text-sm">Logistics queue clear.</p>
                        <p className="text-xs mt-1 text-zinc-400 max-w-xs">
                          Riders are notified when the kitchen finishes packing a meal and dispatches the shipment.
                        </p>
                      </div>
                    ) : (
                      orders.filter(o => ['shipped', 'arriving'].includes(o.deliveryStatus)).map((order) => (
                        <div key={order.id} className="p-6 rounded-3xl border border-zinc-100 bg-zinc-50 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-4">
                            <div>
                              <p className="font-mono text-[10px] text-zinc-400 font-bold">SHIPMENT ID: {order.orderNumber}</p>
                              <h4 className="font-black text-zinc-900 text-base tracking-tight mt-0.5">Drop Zone Dropoff to Bengaluru Matrix</h4>
                            </div>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 font-black rounded-full text-[9px] uppercase tracking-wider self-start sm:self-center">
                              STATUS: {order.deliveryStatus?.toUpperCase()}
                            </span>
                          </div>

                          <div className="space-y-3 text-xs">
                            <div className="flex items-start gap-2.5">
                              <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Delivery Address</p>
                                <p className="font-bold text-zinc-800 mt-0.5">{order.deliveryAddress || "HSR Layout, Bengaluru, Karnataka"}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2.5">
                              <User className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Courier Handover</p>
                                <p className="font-bold text-zinc-800 mt-0.5">{order.driverName} ({order.driverPhone})</p>
                              </div>
                            </div>
                            {order.deliveryInstructions && (
                              <div className="flex items-start gap-2.5">
                                <Phone className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Drop-off Notes</p>
                                  <p className="font-bold text-zinc-800 mt-0.5">{order.deliveryInstructions}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-3 pt-2 border-t border-zinc-100">
                            {order.deliveryStatus === 'shipped' && (
                              <Button 
                                onClick={() => updateOrderStatus(order.id, 'arriving')}
                                className="px-4 py-2 bg-amber-500 text-white font-black rounded-xl hover:bg-amber-600 text-xs transition"
                              >
                                Mark as Arriving
                              </Button>
                            )}
                            {order.deliveryStatus === 'arriving' && (
                              <Button 
                                onClick={async () => {
                                  await updateOrderStatus(order.id, 'delivered');
                                  
                                  // Seed notification to users
                                  try {
                                    await addDoc(collection(db, 'notifications'), {
                                      userId: order.userId,
                                      title: "Meal Arrived! 🥦",
                                      message: `Your customized metabolic box (${order.mealName}) has been securely drop-verified at your geolocated sector. Let's trace your nutrition!`,
                                      read: false,
                                      createdAt: serverTimestamp(),
                                      type: "delivery"
                                    });
                                  } catch (e) {
                                    console.error(e);
                                  }
                                }}
                                className="px-4 py-2 bg-emerald-500 text-white font-black rounded-xl hover:bg-emerald-600 text-xs transition flex items-center gap-1.5"
                              >
                                Mark as Delivered <Check className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>

              {/* Bengaluru geocoding coordinates validation box */}
              <div className="space-y-6">
                <Card className="p-8 rounded-[2.5rem] bg-zinc-900 text-white border-none shadow-xl space-y-6 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-emerald-500/10 rounded-full blur-[40px]" />
                  <div className="relative z-10 space-y-2">
                    <MapPin className="w-8 h-8 text-rose-500" />
                    <h3 className="text-xl font-black text-white tracking-tight">Geocode Grid</h3>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      TaazaBites limits metabolic logistics to Bengaluru zones with pre-verified polygon geofences.
                    </p>
                  </div>
                  
                  <div className="relative z-10 bg-white/5 border border-white/10 p-5 rounded-2xl text-[10px] space-y-2 text-zinc-400 font-mono">
                    <p className="text-emerald-500 font-black">● Bengaluru HSR Layout: APPROVED</p>
                    <p className="text-emerald-500 font-black">● Bengaluru Koramangala: APPROVED</p>
                    <p className="text-emerald-500 font-black">● Bengaluru Indiranagar: APPROVED</p>
                    <p className="text-red-500 font-black">○ Outside Bengaluru Limits: OUT OF BOUNDS</p>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'growth' && (
            <motion.div 
              key="growth"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <GrowthCockpitTab />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}
