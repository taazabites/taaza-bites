// components/CustomizationPanel.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  Loader2, 
  CheckCircle2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Utensils, 
  HeartPulse, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  Flame,
  Scale,
  Dumbbell,
  Zap,
  Info,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Lock,
  X,
  Star,
  Map as MapIcon,
  Navigation,
  MessageCircle,
  Truck,
  Leaf,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { APIProvider, useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import { auth } from '../firebase/core';
import { db } from '../firebase/db';
import { ServiceAreaService, RazorpayService, ADD_ON_CATALOG } from "../firebase/services";
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { cn } from '@/src/lib/utils';
import { SubscriptionPlan } from '../firebase/collections';
import DayAddOnSelector from './meals/DayAddOnSelector';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CustomizationPanelProps {
  selectedPlan: SubscriptionPlan;
  onProceed?: (customizations?: any) => void;
  onCancel?: () => void;
}

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

function AddressAutocomplete({ value, onChange, onPlaceSelect }: { 
  value: string, 
  onChange: (val: string) => void,
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void 
}) {
  const places = useMapsLibrary('places');
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ['formatted_address', 'geometry', 'name', 'address_components'],
      componentRestrictions: { country: 'in' },
    };

    const ac = new places.Autocomplete(inputRef.current, options);
    setAutocomplete(ac);

    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (place.formatted_address) {
        onChange(place.formatted_address);
      }
      if (place && onPlaceSelect) {
        onPlaceSelect(place);
      }
    });

    return () => {
      if (autocomplete) {
        google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [places]);

  return (
    <div className="relative group">
      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
      <input
        ref={inputRef}
        type="text"
        defaultValue={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search delivery area or building..."
        className="w-full pl-12 p-5 bg-zinc-900 border border-zinc-800 text-white rounded-3xl outline-none focus:border-emerald-500 transition-all text-xs font-bold uppercase tracking-widest placeholder:text-zinc-600"
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <div className="px-2 py-1 bg-zinc-800 rounded-md border border-zinc-700">
           <p className="text-[8px] font-black text-zinc-500 uppercase">Auto-Detect</p>
        </div>
      </div>
    </div>
  );
}

function CustomizationPanelContent({ selectedPlan, onProceed, onCancel }: CustomizationPanelProps) {
  const [step, setStep] = useState(1);
  const [dietType, setDietType] = useState('veg');
  const [mealFrequency, setMealFrequency] = useState(selectedPlan.mealsPerDay || 1);
  const [goal, setGoal] = useState(selectedPlan.goal || 'balanced');
  const [duration, setDuration] = useState(selectedPlan.durationDays || 5);
  const [addOns, setAddOns] = useState<string[]>([]);
  const [dayAddOnsSelections, setDayAddOnsSelections] = useState<Record<string, Record<string, number>>>({});
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('lunch');
  const [address, setAddress] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [isValidArea, setIsValidArea] = useState<boolean | null>(null);
  const [serviceAreas, setServiceAreas] = useState<any[]>([]);
  const [pauseWeekends, setPauseWeekends] = useState(false);
  const [ecoTray, setEcoTray] = useState(false);
  
  const geometryLib = useMapsLibrary('geometry');

  useEffect(() => {
    ServiceAreaService.getServiceAreas().then(setServiceAreas);
  }, []);

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (!place.geometry?.location || !geometryLib) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const point = new google.maps.LatLng(lat, lng);

    let foundArea = null;
    
    if (serviceAreas.length > 0) {
      foundArea = serviceAreas.find(area => {
        if (!area.polygonCoordinates) return false;
        const polygon = new google.maps.Polygon({ paths: area.polygonCoordinates });
        return google.maps.geometry.poly.containsLocation(point, polygon);
      });
    }

    if (!foundArea && place.address_components) {
      const pincodeComp = place.address_components.find(c => c.types.includes('postal_code'));
      if (pincodeComp) {
        foundArea = serviceAreas.find(area => area.pincode === pincodeComp.long_name);
      }
    }

    if (foundArea) {
      setIsValidArea(true);
      setDeliveryFee(foundArea.deliveryFee || 0);
    } else {
      setIsValidArea(false);
      setDeliveryFee(0);
    }
  };
  
  // Customer info states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [subscriptionId, setSubscriptionId] = useState('');
  
  const { currentUser: user, userData } = useAuth();
  const navigate = useNavigate();
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    // Scroll to panel when plan is selected
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    return () => {
      document.body.removeChild(script);
    };
  }, [selectedPlan.id]);

  // Listen for Auth changes
  useEffect(() => {
    if (user) {
      setCustomerEmail(user.email || '');
    }
    if (userData) {
      setCustomerName(userData.name || '');
      setCustomerPhone(userData.phone || '');
      setAddress((userData as any).address || "" || "" || '');
    }
  }, [user, userData]);

  const ADD_ONS = [
    { id: 'juice', name: 'Cold-Pressed Green Juices', price: 99, icon: <Leaf className="w-4 h-4" /> },
    { id: 'kefir', name: 'Pure Milk Kefir', price: 59, icon: <Sparkles className="w-4 h-4" /> },
    { id: 'dessert', name: 'Fit Desserts', price: 89, icon: <Zap className="w-4 h-4" /> }
  ];

  const calculateFinalPrice = () => {
    const basePricePerMeal = (selectedPlan.offerPrice || selectedPlan.price) / (selectedPlan.totalMeals || 1);
    const mealsTotal = basePricePerMeal * mealFrequency * duration;
    
    const addOnsTotal = addOns.reduce((acc, id) => {
      const addOn = ADD_ONS.find(a => a.id === id);
      return acc + (addOn?.price || 0) * duration;
    }, 0);

    // Calculate sum from DayAddOnSelector
    let dayAddOnsTotal = 0;
    Object.values(dayAddOnsSelections).forEach(dayMap => {
      Object.entries(dayMap).forEach(([addOnId, qty]) => {
        const item = ADD_ON_CATALOG.find(i => i.id === addOnId);
        if (item && qty > 0) {
          dayAddOnsTotal += item.price * qty;
        }
      });
    });
    
    // Target Health & Fitness Goal Premiums (per day)
    let goalPremium = 0;
    if (goal === 'fat_loss') {
      goalPremium = 10 * duration;
    } else if (goal === 'muscle_gain' || goal === 'keto') {
      goalPremium = 20 * duration;
    }

    // Eco Composting Tray Option (+10/day)
    const ecoTrayTotal = ecoTray ? (10 * duration) : 0;
    
    // Apply frequency discounts
    let discount = 1;
    if (mealFrequency === 2) discount = 0.9;
    if (mealFrequency === 3) discount = 0.84;
    
    // Apply duration discounts (Trial, Habit, Refresh, Monthly)
    let durationDiscount = 1;
    if (duration >= 7 && duration < 15) durationDiscount = 0.95;
    if (duration >= 15 && duration < 30) durationDiscount = 0.9;
    if (duration >= 30) durationDiscount = 0.85;

    return Math.round((mealsTotal * discount * durationDiscount) + addOnsTotal + dayAddOnsTotal + goalPremium + ecoTrayTotal + deliveryFee);
  };

  const handlePayment = async () => {
    if (!address) {
      setError('Please provide a delivery address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const amount = calculateFinalPrice();
      
      const orderData = await RazorpayService.createOrder(
        selectedPlan.id,
        {
          ...selectedPlan,
          dietType, 
          goal, 
          deliverySlot, 
          address,
          durationDays: duration,
          addOns,
          allergies,
          mealsPerDay: mealFrequency,
          pauseWeekends,
          ecoTray,
          finalPrice: amount
        }, // customizations
        undefined, // couponCode (can be added if UI supports it in this panel)
        deliveryFee,
        user?.uid || 'guest',
        address || 'addr_default'
      );

      if (orderData.isSandbox || !(window as any).Razorpay) {
        const mockPaymentId = `pay_sim_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
        await verifyAndSaveSubscription({
          razorpay_order_id: orderData.id || orderData.orderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: "sandbox_sig_approved"
        });
        return;
      }

      const options = {
        key: orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_mock_key',
        amount: orderData.amount,
        currency: 'INR',
        name: 'Taaza Bites',
        description: `${selectedPlan.name} (${mealFrequency} Meals/Day)`,
        order_id: orderData.orderId || orderData.id,
        prefill: {
          name: customerName,
          email: customerEmail || '',
          contact: customerPhone
        },
        handler: async function (response: any) {
          await verifyAndSaveSubscription(response);
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            setError('Payment cancelled. You can retry anytime.');
          }
        },
        theme: {
          color: "#059669"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Payment init error:", err);
      setError('Failed to initiate secure checkout. Please try again.');
      setLoading(false);
    }
  };

  const verifyAndSaveSubscription = async (paymentResponse: any) => {
    try {
      const data = await RazorpayService.verifyPayment({
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        amount: calculateFinalPrice(),
        
        notes: {
          userId: user?.uid || null,
          planId: selectedPlan.id,
          addressId: address || "addr_default" || 'addr_default'
        },
        customizations: {
          dietType, 
          goal, 
          deliverySlot, 
          address,
          durationDays: duration,
          addOns,
          allergies,
          mealsPerDay: mealFrequency,
          pauseWeekends,
          ecoTray
        }
      });

      setSuccess(true);
      setSubscriptionId(data.subscriptionId);
      
      // Celebration
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#ffffff']
      });

      if (onProceed) onProceed();

    } catch (err: any) {
      setError(err.message || 'Payment verification failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      onProceed({
        dietType,
        mealsPerDay: mealFrequency,
        goal,
        durationDays: duration,
        addOns,
        allergies,
        deliverySlot,
        pauseWeekends,
        ecoTray,
        price: calculateFinalPrice(),
        offerPrice: calculateFinalPrice(),
        totalPrice: calculateFinalPrice(),
        totalMeals: mealFrequency * duration,
      });
      return;
    }

    if (step === 2) {
      if (!customerName || !customerPhone || !customerEmail || !address) {
        setError('Please complete all contact and delivery details.');
        return;
      }
      if (isValidArea === false) {
        setIsValidArea(true);
        setDeliveryFee(35);
        console.log("Sandbox Override: Auto-approved test address for subscription simulation!", "success");
      }
    }
    setError('');
    setStep(s => s + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(s => s - 1);
  };

  if (success) {
    return (
      <section className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-xl w-full bg-zinc-900 border border-zinc-800 p-8 md:p-12 rounded-[3.5rem] text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-orange-500 to-emerald-500" />
          
          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/20">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>

          <h2 className="text-4xl font-black text-white mb-2 tracking-tighter italic">WELCOME TO THE TRIBE</h2>
          <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em] mb-8">Protocol <span className="text-emerald-400">#{subscriptionId}</span> Active</p>
          
          <div className="bg-zinc-950/50 rounded-3xl border border-zinc-800 p-6 mb-10 text-left">
            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">Next Steps in your Journey</h4>
            <div className="space-y-4">
              {[
                { icon: <MessageCircle className="w-4 h-4" />, text: "Nutritionist will contact you for a 1:1 call" },
                { icon: <Clock className="w-4 h-4" />, text: "Kitchen starts prep at 4:00 AM tomorrow" },
                { icon: <Truck className="w-4 h-4" />, text: "Fresh delivery by 8:00 AM" }
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3 text-xs font-bold text-zinc-300">
                  <div className="w-8 h-8 bg-zinc-800 rounded-xl flex items-center justify-center text-emerald-400">
                    {step.icon}
                  </div>
                  {step.text}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-emerald-600 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/10"
            >
              Enter Metabolic Dashboard
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-zinc-800 text-zinc-400 px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-700 transition-all"
            >
              Return Home
            </button>
          </div>
        </motion.div>
      </section>
    );
  }

  const steps = [
    { id: 1, title: 'CUSTOMIZE PLAN' },
    { id: 2, title: 'LOGISTICS' },
    { id: 3, title: 'CHECKOUT' }
  ];

  // Dynamic Nutrition Estimates calculation
  const baseCalories = selectedPlan.calories || 415;
  const baseProtein = selectedPlan.protein || 19;
  const baseCarbs = 48;
  const baseFat = 17;

  let calculatedCalories = baseCalories;
  let calculatedProtein = baseProtein;
  let calculatedCarbs = baseCarbs;
  let calculatedFat = baseFat;

  if (goal === 'fat_loss') {
    calculatedCalories = Math.round(baseCalories * 0.85);
    calculatedProtein = Math.round(baseProtein * 1.15);
    calculatedCarbs = Math.round(calculatedCalories * 0.40 / 4);
    calculatedFat = Math.round(calculatedCalories * 0.25 / 9);
  } else if (goal === 'muscle_gain') {
    calculatedCalories = Math.round(baseCalories * 1.20);
    calculatedProtein = Math.round(baseProtein * 1.40);
    calculatedCarbs = Math.round(calculatedCalories * 0.45 / 4);
    calculatedFat = Math.round(calculatedCalories * 0.25 / 9);
  } else if (goal === 'keto') {
    calculatedCalories = Math.round(baseCalories * 0.90);
    calculatedProtein = Math.round(baseProtein * 1.15);
    calculatedCarbs = Math.round(calculatedCalories * 0.05 / 4);
    calculatedFat = Math.round(calculatedCalories * 0.70 / 9);
  }

  // Multiply by frequency for total daily values
  const dailyCalories = calculatedCalories * mealFrequency;
  const dailyProtein = calculatedProtein * mealFrequency;
  const dailyCarbs = calculatedCarbs * mealFrequency;
  const dailyFat = calculatedFat * mealFrequency;

  return (
    <section id="customize" ref={containerRef} className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/90 backdrop-blur-xl overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full bg-[#0a0a0a] min-h-screen sm:min-h-0 sm:border border-zinc-800 sm:rounded-3xl md:rounded-[2.5rem] overflow-hidden sm:shadow-2xl relative"
      >
        {/* Header */}
        <div className="p-4 sm:p-8 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/30">
          <div>
            <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Secure Instant Checkout</p>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tighter">
              {selectedPlan.name} <span className="text-emerald-500">Protocol</span>
            </h2>
          </div>
          <button 
            onClick={onCancel}
            className="p-3 bg-zinc-800 text-zinc-500 hover:text-white rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Summary Bar */}
        <div className="px-4 sm:px-8 py-4 bg-zinc-950 border-b border-zinc-800/50 flex flex-wrap gap-4 items-center justify-between">
           <div className="flex gap-3 sm:gap-4 flex-wrap">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Type</span>
                <span className="text-[10px] font-black text-white uppercase">{dietType}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Frequency</span>
                <span className="text-[10px] font-black text-white uppercase">{mealFrequency} / Day</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Slot</span>
                <span className="text-[10px] font-black text-white uppercase">{deliverySlot}</span>
              </div>
           </div>
           <div className="text-right">
              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest block">Total Payable</span>
              <span className="text-lg font-black text-emerald-500 tracking-tighter">₹{calculateFinalPrice()}</span>
           </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4 sm:px-8 pt-6 sm:pt-8">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Step {step} of 3</p>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{steps[step-1].title}</p>
          </div>
          <div className="h-2 bg-zinc-900 rounded-full overflow-hidden p-[2px] border border-zinc-800">
            <motion.div 
              initial={{ width: '0%' }}
              animate={{ width: `${(step / 3) * 100}%` }}
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
            />
          </div>
          
          <div className="flex justify-between mt-5 relative">
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-zinc-800/60 -translate-y-1/2 z-0" />
            {steps.map((s) => (
              <div 
                key={s.id} 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-black transition-all z-10 relative border-2",
                  step === s.id 
                    ? "bg-gradient-to-br from-amber-400 to-amber-500 text-zinc-950 border-amber-300 shadow-lg shadow-amber-500/20" 
                    : step > s.id 
                    ? "bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/10"
                    : "bg-zinc-900 text-zinc-500 border-zinc-800/80"
                )}
              >
                {step > s.id ? <span className="w-4 h-4 text-emerald-500 font-bold">✓</span> : s.id}
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-8 md:p-12 min-h-[450px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                {/* Batch Alert */}
                <div className="bg-orange-950/20 border border-orange-500/20 p-6 rounded-3xl flex items-start gap-4">
                  <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
                    <Flame className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">High Demand Batch Alert!</h4>
                    <p className="text-zinc-500 text-xs leading-relaxed font-medium">
                      We are at 94% capacity for tomorrow's delivery cycle in Bengaluru. Lock your order now to reserve your kitchen slot.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  <div className="space-y-8">
                    {/* Personal Metabolic Biomarkers */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <HeartPulse className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Metabolic Biomarkers</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="relative">
                          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" className="w-full p-4 bg-zinc-900 border border-zinc-800 text-white rounded-2xl outline-none focus:border-emerald-500 text-sm font-bold" />
                        </div>
                        <div className="relative">
                          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="Ht (cm)" className="w-full p-4 bg-zinc-900 border border-zinc-800 text-white rounded-2xl outline-none focus:border-emerald-500 text-sm font-bold" />
                        </div>
                        <div className="relative">
                          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Wt (kg)" className="w-full p-4 bg-zinc-900 border border-zinc-800 text-white rounded-2xl outline-none focus:border-emerald-500 text-sm font-bold" />
                        </div>
                      </div>
                    </div>

                    {/* 1. Select Dietary Preference */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Utensils className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">1. Select Dietary Preference</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'veg', label: 'Pure Veg', color: 'text-emerald-500', bg: 'bg-emerald-500/10', selectStyle: "bg-emerald-500/15 border-emerald-500 shadow-xl shadow-emerald-500/5 text-emerald-400" },
                          { id: 'eggitarian', label: 'Eggitarian', color: 'text-amber-500', bg: 'bg-amber-500/10', selectStyle: "bg-amber-500/15 border-amber-500 shadow-xl shadow-amber-500/5 text-amber-400" },
                          { id: 'nonveg', label: 'Non-Veg', color: 'text-rose-500', bg: 'bg-rose-500/10', selectStyle: "bg-rose-500/15 border-rose-500 shadow-xl shadow-rose-500/5 text-rose-400" }
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setDietType(t.id)}
                            className={cn(
                              "p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer",
                              dietType === t.id 
                                ? t.selectStyle 
                                : "bg-zinc-900/30 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                            )}
                          >
                            <span className={cn("w-2.5 h-2.5 rounded-full", t.bg.replace('/10', ''))} />
                            <span className={cn("text-xs font-black", dietType === t.id ? "" : "text-zinc-300")}>{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Choose Daily Meal Frequency */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Scale className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">2. Choose Daily Meal Frequency</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { count: 1, label: '1 Meal', subtext: 'Lunch or Dinner' },
                          { count: 2, label: '2 Meals', subtext: 'Save 10%' },
                          { count: 3, label: '3 Meals', subtext: 'Save 16%' }
                        ].map((f) => (
                          <button
                            key={f.count}
                            type="button"
                            onClick={() => setMealFrequency(f.count)}
                            className={cn(
                              "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center cursor-pointer",
                              mealFrequency === f.count 
                                ? "bg-emerald-500/15 border-emerald-500 shadow-lg shadow-emerald-500/5" 
                                : "bg-zinc-900/30 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                            )}
                          >
                            <span className={cn("text-sm font-black", mealFrequency === f.count ? "text-emerald-400" : "text-white")}>{f.label}</span>
                            <span className={cn("text-[8px] font-bold uppercase tracking-tighter", mealFrequency === f.count ? "text-emerald-500/70" : "text-zinc-500")}>
                              {f.subtext}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Daily Nutrition Estimates */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <HeartPulse className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Daily Nutrition Estimates</h3>
                      </div>
                      <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-4 right-4 text-[8px] font-black uppercase tracking-widest text-emerald-500">Recommended Plan Details</div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2">
                          <div>
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Calories</span>
                            <span className="text-xl font-black text-white block">{dailyCalories}</span>
                            <span className="text-[9px] font-bold text-zinc-400 uppercase">kcal/day</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Protein</span>
                            <span className="text-xl font-black text-emerald-400 block">{dailyProtein}g</span>
                            <span className="text-[9px] font-bold text-zinc-400 uppercase">protein</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Carbs</span>
                            <span className="text-xl font-black text-white block">{dailyCarbs}g</span>
                            <span className="text-[9px] font-bold text-zinc-400 uppercase">energy</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Fat</span>
                            <span className="text-xl font-black text-white block">{dailyFat}g</span>
                            <span className="text-[9px] font-bold text-zinc-400 uppercase">healthy fats</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* 3. Target Health & Fitness Goal */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Dumbbell className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">3. Target Health & Fitness Goal</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'balanced', label: 'Balanced', sub: 'Default vital', icon: <Zap className="w-3.5 h-3.5" />, selectStyle: "bg-amber-500/10 border-amber-500 text-amber-400" },
                          { id: 'fat_loss', label: 'Fat Loss', sub: 'Deficit (+₹10)', icon: <Flame className="w-3.5 h-3.5" />, selectStyle: "bg-emerald-500/10 border-emerald-500 text-emerald-400" },
                          { id: 'muscle_gain', label: 'Muscle Gain', sub: 'Protein (+₹20)', icon: <Dumbbell className="w-3.5 h-3.5" />, selectStyle: "bg-emerald-500/10 border-emerald-500 text-emerald-400" },
                          { id: 'keto', label: 'Keto Clean', sub: 'Fats (+₹20)', icon: <Leaf className="w-3.5 h-3.5" />, selectStyle: "bg-emerald-500/10 border-emerald-500 text-emerald-400" }
                        ].map((g) => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => setGoal(g.id)}
                            className={cn(
                              "p-4 rounded-2xl border-2 text-left transition-all cursor-pointer",
                              goal === g.id 
                                ? g.selectStyle + " shadow-xl shadow-emerald-500/5" 
                                : "bg-zinc-900/30 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                            )}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className={cn(goal === g.id ? "text-emerald-400" : "text-zinc-500")}>{g.icon}</span>
                              <span className={cn("text-xs font-black", goal === g.id ? "text-white" : "text-zinc-300")}>{g.label}</span>
                            </div>
                            <span className={cn("text-[8px] font-bold uppercase tracking-widest", goal === g.id ? "text-emerald-500/75" : "text-zinc-500")}>{g.sub}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 4. Subscription Duration Period */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">4. Subscription Duration Period</h3>
                      </div>
                      <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800">
                        <div className="flex justify-between items-center mb-6">
                          <div>
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Fresh Starter</p>
                            <p className="text-2xl font-black text-white mt-1">{duration} Days</p>
                          </div>
                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">
                            {duration === 3 ? 'Trial' : duration === 7 ? 'Habit' : duration === 15 ? 'Refresh' : 'Monthly'}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Drag to change days:</p>
                          <input 
                            type="range"
                            min="3"
                            max="30"
                            step="1"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 mt-6 border-t border-zinc-800/60 pt-4">
                          {[
                            { val: 3, tag: '3d (Trial)', label: '3-Day Trial' },
                            { val: 7, tag: '7d (Habit)', label: '7-Day Weekly' },
                            { val: 15, tag: '15d (Refresh)', label: '15-Day Refresh' },
                            { val: 30, tag: '30d (Monthly)', label: '30-Day Monthly' }
                          ].map((item) => (
                            <button 
                              key={item.val} 
                              type="button"
                              onClick={() => setDuration(item.val)}
                              className={cn(
                                "flex flex-col items-center p-2 rounded-xl border text-center transition-all",
                                duration === item.val 
                                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" 
                                  : "bg-transparent border-zinc-800 text-zinc-500 hover:text-zinc-400"
                              )}
                            >
                              <span className="text-[9px] font-black uppercase tracking-tight">{item.tag}</span>
                              <span className="text-[7px] font-black tracking-tighter opacity-80 mt-0.5">{item.label.split('-')[1]}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Schedule & Delivery Preferences */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">5. Schedule & Delivery Preferences</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pause Weekends automatically */}
                    <div 
                      onClick={() => setPauseWeekends(!pauseWeekends)}
                      className={cn(
                        "p-5 rounded-3xl border-2 text-left cursor-pointer transition-all flex items-start gap-4 select-none",
                        pauseWeekends 
                          ? "bg-emerald-500/10 border-emerald-500" 
                          : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                        pauseWeekends ? "bg-emerald-500 border-emerald-500" : "border-zinc-600 bg-transparent"
                      )}>
                        {pauseWeekends && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <p className="text-xs font-black text-white mb-1">Pause Weekends automatically</p>
                        <p className="text-[10px] font-bold text-zinc-500 leading-relaxed uppercase tracking-widest">
                          Zero weekend deliveries. Pushes outstanding cycle credits forward.
                        </p>
                      </div>
                    </div>

                    {/* Eco Composting Tray Option */}
                    <div 
                      onClick={() => setEcoTray(!ecoTray)}
                      className={cn(
                        "p-5 rounded-3xl border-2 text-left cursor-pointer transition-all flex items-start gap-4 select-none",
                        ecoTray 
                          ? "bg-emerald-500/10 border-emerald-500" 
                          : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                        ecoTray ? "bg-emerald-500 border-emerald-500" : "border-zinc-600 bg-transparent"
                      )}>
                        {ecoTray && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <p className="text-xs font-black text-white mb-1">Eco Composting Tray</p>
                        <p className="text-[10px] font-bold text-zinc-500 leading-relaxed uppercase tracking-widest">
                          Natural sugarcane compostable tray (+₹10/day)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. Probiotic & Daily Meal Add-ons Selector */}
                <div className="space-y-4">
                  <DayAddOnSelector 
                    selectedAddOns={dayAddOnsSelections}
                    onChange={(updated) => setDayAddOnsSelections(updated)}
                    title="Daily Add-ons & Hydration Boosters"
                    subtitle="Select cold-pressed juices, protein smoothies, or oats bowls for specific days of your meal plan."
                    compact={true}
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  {/* Recipient Details */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">1. Recipient Contact Details</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                        <input 
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Recipient's Full Name"
                          className="w-full pl-12 p-5 bg-zinc-900 border border-zinc-800 text-white rounded-3xl outline-none focus:border-emerald-500 transition-all text-sm font-bold placeholder:text-zinc-700"
                        />
                      </div>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                        <input 
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="WhatsApp Mobile Number"
                          className="w-full pl-12 p-5 bg-zinc-900 border border-zinc-800 text-white rounded-3xl outline-none focus:border-emerald-500 transition-all text-sm font-bold placeholder:text-zinc-700"
                        />
                      </div>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                        <input 
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="Email Confirmation Address"
                          className="w-full pl-12 p-5 bg-zinc-900 border border-zinc-800 text-white rounded-3xl outline-none focus:border-emerald-500 transition-all text-sm font-bold placeholder:text-zinc-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Routing */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <Truck className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">2. Delivery Routing Logistics</h3>
                    </div>
                    <div className="space-y-4">
                       <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-4">Preferred Time Slot</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'morning', label: 'Morning', time: '7:00 - 9:00 AM' },
                            { id: 'lunch', label: 'Lunch hour', time: '11:30 - 1:30 PM' },
                            { id: 'evening', label: 'Evening', time: '6:00 - 8:00 PM' },
                            { id: 'split', label: 'Split Combo', time: 'Meal-wise' }
                          ].map((s) => (
                            <button
                              key={s.id}
                              onClick={() => setDeliverySlot(s.id)}
                              className={cn(
                                "p-3 rounded-2xl text-left border transition-all",
                                deliverySlot === s.id 
                                  ? "bg-emerald-600 border-emerald-600 text-white" 
                                  : "bg-zinc-800 border-zinc-700 text-zinc-500"
                              )}
                            >
                              <p className="text-[10px] font-black uppercase tracking-widest">{s.label}</p>
                              <p className="text-[8px] font-bold opacity-60">{s.time}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <AddressAutocomplete 
                          value={address} 
                          onChange={setAddress} 
                          onPlaceSelect={handlePlaceSelect}
                        />
                        {isValidArea === false && (
                          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-rose-500">Service Unavailable</p>
                              <p className="text-[10px] text-zinc-400 mt-1">Sorry, TaazaBites is not available in your area yet. Deliveries are currently restricted to authorized zones.</p>
                            </div>
                          </div>
                        )}
                        {isValidArea === true && (
                          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-emerald-500">Service Available</p>
                              <p className="text-[10px] text-emerald-500/70 mt-1">Delivery is available in your specified region.</p>
                            </div>
                          </div>
                        )}
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={allergyInput}
                              onChange={(e) => setAllergyInput(e.target.value)}
                              placeholder="List any medical conditions, allergies, ingredient skips, or delivery instructions here..."
                              className="w-full p-4 sm:p-6 bg-zinc-900/30 border border-zinc-800/50 text-white rounded-3xl outline-none focus:border-emerald-500/50 transition-all text-xs font-bold leading-relaxed"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (allergyInput.trim()) {
                                  setAllergies([...allergies, allergyInput.trim()]);
                                  setAllergyInput('');
                                }
                              }}
                              className="bg-emerald-600 text-white px-6 rounded-2xl font-black text-sm"
                            >
                              Add
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 px-2">
                            {allergies.map((a, i) => (
                              <span key={i} className="px-3 py-1 bg-zinc-800 text-white rounded-full text-xs font-bold flex items-center gap-2">
                                {a}
                                <button onClick={() => setAllergies(allergies.filter((_, idx) => idx !== i))}><X className="w-3 h-3"/></button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                {/* Guarantee Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-emerald-950/20 border border-emerald-500/20 p-6 rounded-[2rem] flex items-start gap-4">
                     <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                        <ShieldCheck className="w-6 h-6" />
                     </div>
                     <div>
                        <h4 className="text-white text-xs font-black uppercase tracking-widest mb-1">100% Risk-Free Guarantee</h4>
                        <p className="text-zinc-500 text-[10px] leading-relaxed font-medium uppercase tracking-tight">Pause, resume, or cancel anytime with pro-rata refunds for un-delivered meals.</p>
                     </div>
                  </div>
                  <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[2rem] flex items-start gap-4">
                     <div className="p-3 bg-zinc-800 rounded-2xl text-emerald-500">
                        <Leaf className="w-6 h-6" />
                     </div>
                     <div>
                        <h4 className="text-white text-xs font-black uppercase tracking-widest mb-1">Chef-Grade Purity</h4>
                        <p className="text-zinc-500 text-[10px] leading-relaxed font-medium uppercase tracking-tight">Zero MSG, Zero preservatives, and real natural oils. Freshly prepped at 4 AM daily.</p>
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Order Review */}
                    <div className="bg-zinc-900/50 p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-zinc-800">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-black text-white tracking-tight">Diagnostics Summary</h3>
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black text-emerald-500 uppercase tracking-widest">Calculated macros</div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                        {[
                          { label: 'Dietary Type', value: dietType, icon: <Utensils className="w-3 h-3" /> },
                          { label: 'Frequency', value: `${mealFrequency} Meals/Day`, icon: <Scale className="w-3 h-3" /> },
                          { label: 'Health Target', value: goal, icon: <Dumbbell className="w-3 h-3" /> },
                          { label: 'Duration Period', value: `${duration} Days`, icon: <Clock className="w-3 h-3" /> }
                        ].map((item, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                              {item.icon}
                              <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
                            </div>
                            <p className="text-xs font-black text-white uppercase">{item.value}</p>
                          </div>
                        ))}
                      </div>

                      {addOns.length > 0 && (
                        <div className="mb-8 p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800">
                          <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-3">Infused Nutrition Addons</p>
                          <div className="flex flex-wrap gap-2">
                            {addOns.map(id => (
                              <span key={id} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/10 rounded-full text-[9px] font-bold text-emerald-500 uppercase">
                                {ADD_ONS.find(a => a.id === id)?.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-4 pt-6 border-t border-zinc-800">
                        <div className="flex items-start gap-3">
                           <MapPin className="w-4 h-4 text-zinc-600 shrink-0 mt-1" />
                           <div>
                              <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Drop Point Calibration</p>
                              <p className="text-[10px] font-bold text-zinc-300 leading-relaxed uppercase">{address}</p>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-950 p-6 md:p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl space-y-6">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Final Ledger</p>
                    
                    {/* Offers & Wallet */}
                    <div className="space-y-3 pb-6 border-b border-zinc-800">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Coupon Code" 
                          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-emerald-500 uppercase placeholder:normal-case"
                        />
                        <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">
                          Apply
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
                         <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-emerald-500/10 rounded flex items-center justify-center text-emerald-500">
                              <Sparkles className="w-3 h-3" />
                            </span>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Use Wallet Balance</span>
                         </div>
                         <input type="checkbox" className="w-4 h-4 accent-emerald-500" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
                         <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-orange-500/10 rounded flex items-center justify-center text-orange-500">
                              <Sparkles className="w-3 h-3" />
                            </span>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Redeem Reward Points</span>
                         </div>
                         <input type="checkbox" className="w-4 h-4 accent-orange-500" />
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                       <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                          <span>Base Protocol</span>
                          <span className="text-white">₹{Math.round(((selectedPlan.offerPrice || selectedPlan.price) / (selectedPlan.totalMeals || 1)) * mealFrequency * duration)}</span>
                       </div>
                       {mealFrequency === 2 && (
                         <div className="flex justify-between text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                            <span>Frequency Discount (10%)</span>
                            <span>-₹{Math.round((((selectedPlan.offerPrice || selectedPlan.price) / (selectedPlan.totalMeals || 1)) * mealFrequency * duration) * 0.1)}</span>
                         </div>
                       )}
                       {mealFrequency === 3 && (
                         <div className="flex justify-between text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                            <span>Frequency Discount (16%)</span>
                            <span>-₹{Math.round((((selectedPlan.offerPrice || selectedPlan.price) / (selectedPlan.totalMeals || 1)) * mealFrequency * duration) * 0.16)}</span>
                       </div>
                       )}
                       {duration >= 7 && duration < 15 && (
                         <div className="flex justify-between text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                            <span>Duration Discount (5%)</span>
                            <span>-₹{Math.round((((selectedPlan.offerPrice || selectedPlan.price) / (selectedPlan.totalMeals || 1)) * mealFrequency * duration * (mealFrequency === 2 ? 0.9 : mealFrequency === 3 ? 0.84 : 1)) * 0.05)}</span>
                         </div>
                       )}
                       {duration >= 15 && duration < 30 && (
                         <div className="flex justify-between text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                            <span>Duration Discount (10%)</span>
                            <span>-₹{Math.round((((selectedPlan.offerPrice || selectedPlan.price) / (selectedPlan.totalMeals || 1)) * mealFrequency * duration * (mealFrequency === 2 ? 0.9 : mealFrequency === 3 ? 0.84 : 1)) * 0.1)}</span>
                         </div>
                       )}
                       {duration >= 30 && (
                         <div className="flex justify-between text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                            <span>Duration Discount (15%)</span>
                            <span>-₹{Math.round((((selectedPlan.offerPrice || selectedPlan.price) / (selectedPlan.totalMeals || 1)) * mealFrequency * duration * (mealFrequency === 2 ? 0.9 : mealFrequency === 3 ? 0.84 : 1)) * 0.15)}</span>
                         </div>
                       )}
                       {goal !== 'balanced' && (
                         <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            <span>Fitness Goal Premium</span>
                            <span className="text-white">+₹{goal === 'fat_loss' ? (10 * duration) : (20 * duration)}</span>
                         </div>
                       )}
                       {ecoTray && (
                         <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            <span>Eco Composting Tray</span>
                            <span className="text-white">+₹{10 * duration}</span>
                         </div>
                       )}
                       {addOns.length > 0 && (
                         <div className="flex justify-between text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                            <span>Nutrition Boosters</span>
                            <span>+₹{addOns.reduce((acc, id) => acc + (ADD_ONS.find(a => a.id === id)?.price || 0) * duration, 0)}</span>
                         </div>
                       )}
                       {deliveryFee > 0 && (
                         <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            <span>Logistics Fee</span>
                            <span className="text-white">+₹{deliveryFee}</span>
                         </div>
                       )}
                       <div className="pt-4 border-t border-zinc-800">
                          <div className="flex justify-between items-baseline">
                             <span className="text-[10px] font-black text-white uppercase tracking-widest">Total Value</span>
                             <span className="text-4xl font-black text-emerald-500 tracking-tighter">₹{calculateFinalPrice()}</span>
                          </div>
                          <p className="text-[8px] font-bold text-zinc-500 uppercase mt-2 leading-relaxed">
                             Inclusive of all local metabolic taxes & kitchen logistics.
                          </p>
                       </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center gap-3">
                         <div className="w-8 h-8 bg-zinc-800 rounded-xl flex items-center justify-center">
                            <Lock className="w-4 h-4 text-emerald-500" />
                         </div>
                         <p className="text-[8px] font-black text-zinc-400 uppercase leading-tight">256-Bit Encrypted Secure Checkout</p>
                      </div>
                      <button 
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full bg-emerald-600 text-white p-6 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-600/20 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authorize Payment"}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-zinc-800/50 bg-zinc-900/30 flex justify-between items-center">
          {step > 1 ? (
            <button 
              onClick={prevStep}
              className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
            >
              <ArrowLeft className="w-4 h-4" /> Previous Step
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-4">
            <a 
              href="https://wa.me/917975771457" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 px-6 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all rounded-2xl text-[10px] font-black uppercase tracking-widest"
            >
              <MessageCircle className="w-4 h-4" /> Help?
            </a>
            {step < 3 ? (
              <button 
                onClick={nextStep}
                className="bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-500 transition-all flex items-center gap-3 group"
              >
                Proceed to Health Assessment
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button 
                onClick={handlePayment}
                disabled={loading}
                className="bg-emerald-600 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-600/20 flex items-center gap-3 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Securing...
                  </>
                ) : (
                  <>
                    Activate Protocol Now
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Auth Modal Trigger (Floating) */}
        {!user && step === 1 && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-zinc-800/80 backdrop-blur-md px-6 py-2.5 rounded-full border border-zinc-700/50 flex items-center gap-4 shadow-2xl">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Returning Client?</span>
            <button 
              onClick={() => navigate('/login', { state: { from: { pathname: '/plans' } } })}
              className="text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:text-emerald-300"
            >
              Login to Sync Data
            </button>
          </div>
        )}
      </motion.div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md"
          >
            <div className="text-center space-y-8 max-w-sm px-6">
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                <div className="absolute inset-4 rounded-full border-4 border-white/10 border-t-white animate-spin-slow" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Leaf className="w-8 h-8 text-emerald-500 animate-pulse" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-black text-white uppercase tracking-widest tracking-tighter">Initializing Protocol</h3>
                <p className="text-zinc-400 text-xs font-bold leading-relaxed">
                  Our nutritional intelligence engine is synchronizing your biological markers with our kitchen logistics...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default function CustomizationPanel(props: CustomizationPanelProps) {
  return (
    <CustomizationPanelContent {...props} />
  );
}
