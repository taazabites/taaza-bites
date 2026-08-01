"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
 ArrowLeft, 
 Star, 
 Flame, 
 Egg, 
 Wheat, 
 Droplet, 
 Clock, 
 Truck, 
 ShieldCheck, 
 CheckCircle2, 
 ChevronRight
} from "lucide-react";
import { Button, Card } from "@/src/components/ui/primitives";
import { useToast } from "@/src/context/ToastContext";
import { db } from '@/src/firebase/db';
import { doc, getDoc } from "firebase/firestore";
import { plansCache } from "@/src/lib/plans-cache";
import { Analytics } from "@/src/utils/analytics";

interface Plan {
 id: string;
 name: string;
 description: string;
 duration: number;
 durationDays?: number;
 price: number;
 offerPrice: number;
 discount: number;
 mealsPerDay: number;
 totalMeals: number;
 calories: number;
 caloriesTarget?: number;
 protein: number;
 features: string[];
 popular: boolean;
 bestValue: boolean;
 image: string;
 deliverySchedule: string;
 goals: string[];
 nutritionScore: number;
}

export default function PlanDetailsPage() {
 const { id } = useParams<{ id: string }>();
 const navigate = useNavigate();
 const { showToast } = useToast();
 
 const [plan, setPlan] = useState<Plan | null>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
   if (!id) return;

   // 1. Check local cache first for instant render
   const cachedPlan = plansCache.getPlanSync(id);
   if (cachedPlan) {
     setPlan(cachedPlan as any);
     setLoading(false);
   }

   // 2. Subscribe to multiplexed plans cache to ensure freshness and real-time consistency
   const subscriberId = `plan_details_${id}`;
   const unsubscribe = plansCache.subscribe(subscriberId, (allPlans) => {
     const freshPlan = allPlans.find(p => p.id === id);
     if (freshPlan) {
       setPlan(freshPlan as any);
     } else if (!cachedPlan) {
       // Fallback to direct getDoc ONLY if not in cache at all to guarantee load
       const fetchDirect = async () => {
         try {
           const docRef = doc(db, 'subscriptionPlans', id);
           const docSnap = await getDoc(docRef);
           if (docSnap.exists()) {
             setPlan({ id: docSnap.id, ...docSnap.data() } as any);
           }
         } catch (err) {
           console.error("Direct fetch fallback error:", err);
         } finally {
           setLoading(false);
         }
       };
       fetchDirect();
     }
     setLoading(false);
   });

   return () => unsubscribe();
 }, [id]);

  useEffect(() => {
    if (plan) {
      Analytics.trackPlanView(plan.id, plan.name, plan.offerPrice || plan.price);
    }
  }, [plan?.id]);

 const handleSubscribe = () => {
   if (!plan) return;
   showToast(`Proceeding with ${plan.name}`, 'success');
   const price = plan.offerPrice || plan.price; 
   localStorage.setItem('taaza_selected_plan', JSON.stringify({ ...plan, price, offerPrice: price }));
   Analytics.trackAddToCart(plan.id, plan.name, price); 
   Analytics.trackCheckoutStarted(plan.id, plan.name, price); 
   navigate('/health-assessment', { state: { selectedPlan: plan } });
 };

 if (loading) {
   return (
     <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
       <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
     </div>
   );
 }

 if (!plan) {
   return (
     <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50/50">
       <h2 className="text-xl font-bold text-slate-800">Plan not found</h2>
       <Button className="mt-4" onClick={() => navigate('/plans')}>Go back to Plans</Button>
     </div>
   );
 }

 // Calculate default macros if undefined
 const calories = plan.caloriesTarget || plan.calories || 1500;
 const protein = plan.protein || 80;
 const carbs = Math.round((calories * 0.45) / 4);
 const fats = Math.round((calories * 0.25) / 9);

 return (
   <div className="min-h-screen bg-slate-50/50 pb-32 md:pb-12">
     
     {/* Hero Section */}
     <div className="relative h-[45vh] min-h-[350px] w-full overflow-hidden">
       <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-slate-950 z-10" />
       <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${plan.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200'})` }} />
       
       <div className="relative z-20 max-w-7xl mx-auto px-4 h-full flex flex-col justify-between py-8">
         <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors self-start">
           <ArrowLeft className="h-5 w-5 text-white" />
         </button>
         
         <motion.div 
           initial={{ opacity: 0, y: 20 }} 
           animate={{ opacity: 1, y: 0 }}
           className="max-w-2xl mb-4"
         >
           {plan.popular && (
             <div className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-4 shadow-lg">
               <Star className="h-3 w-3 fill-current" /> MOST POPULAR
             </div>
           )}
           <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-3">{plan.name}</h1>
           <p className="text-white/80 text-sm md:text-base leading-relaxed">{plan.description}</p>
         </motion.div>
       </div>
     </div>

     <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-30 grid grid-cols-1 lg:grid-cols-3 gap-8">
       
       {/* Left Column (Details) */}
       <div className="lg:col-span-2 space-y-8">
         
         {/* Quick Stats Card */}
         <Card className="border-slate-100 shadow-xl rounded-2xl p-6 bg-white ">
           <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 ">
             <div className="p-4 md:first:pl-0 text-center">
               <Flame className="h-6 w-6 text-orange-500 mx-auto mb-2" />
               <p className="text-2xl font-bold text-slate-900 ">{calories}</p>
               <p className="text-xs text-slate-500 uppercase tracking-wide">Calories/day</p>
             </div>
             <div className="p-4 text-center">
               <Egg className="h-6 w-6 text-rose-500 mx-auto mb-2" />
               <p className="text-2xl font-bold text-slate-900 ">{protein}g</p>
               <p className="text-xs text-slate-500 uppercase tracking-wide">Protein</p>
             </div>
             <div className="p-4 text-center">
               <Wheat className="h-6 w-6 text-amber-500 mx-auto mb-2" />
               <p className="text-2xl font-bold text-slate-900 ">{carbs}g</p>
               <p className="text-xs text-slate-500 uppercase tracking-wide">Carbs</p>
             </div>
             <div className="p-4 text-center">
               <Droplet className="h-6 w-6 text-sky-500 mx-auto mb-2" />
               <p className="text-2xl font-bold text-slate-900 ">{fats}g</p>
               <p className="text-xs text-slate-500 uppercase tracking-wide">Fats</p>
             </div>
           </div>
         </Card>

         {/* What's Included */}
         <Card className="border-slate-100 shadow-sm rounded-2xl p-6 md:p-8">
           <h2 className="text-xl font-bold text-slate-900 mb-6">What&apos;s Included</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {(plan.features || []).map((feat, i) => (
               <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50/[0.3] rounded-xl">
                 <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                 <span className="text-sm font-medium text-slate-700 ">{feat}</span>
               </div>
             ))}
           </div>
         </Card>

         {/* Delivery & Policy Info */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Card className="border-slate-100 shadow-sm rounded-2xl p-6">
             <div className="flex items-center gap-2 mb-4">
               <Clock className="h-5 w-5 text-emerald-600" />
               <h3 className="font-bold text-slate-900 ">Delivery Timings</h3>
             </div>
             <div className="space-y-2 text-sm text-slate-600 ">
               <div className="flex justify-between"><span>Lunch</span><span className="font-medium text-slate-900 ">11:00 AM - 01:00 PM</span></div>
               <div className="flex justify-between"><span>Dinner</span><span className="font-medium text-slate-900 ">06:00 PM - 08:00 PM</span></div>
             </div>
           </Card>
           <Card className="border-slate-100 shadow-sm rounded-2xl p-6">
             <div className="flex items-center gap-2 mb-4">
               <ShieldCheck className="h-5 w-5 text-emerald-600" />
               <h3 className="font-bold text-slate-900 ">Cancellation Policy</h3>
             </div>
             <p className="text-sm text-slate-600 ">
               Free cancellation up to 12 hours before delivery. No questions asked.
             </p>
           </Card>
         </div>
       </div>

       {/* Right Column (Desktop Sticky Pricing) */}
       <div className="hidden lg:block">
         <Card className="border-slate-100 shadow-xl rounded-2xl p-6 sticky top-8 bg-white">
           <div className="flex items-baseline gap-2 mb-1">
             <span className="text-3xl font-bold text-slate-900 ">₹{plan.offerPrice || plan.price}</span>
             <span className="text-slate-500">/ {plan.duration} Days</span>
           </div>
           <p className="text-sm text-emerald-600 font-medium mb-6">₹{Math.round((plan.offerPrice || plan.price) / (plan.duration || 28))} per day</p>
           
           <Button size="md" className="w-full rounded-xl shadow-md shadow-emerald-600/20 py-4 text-white" onClick={handleSubscribe}>
             Subscribe Now <ChevronRight className="h-5 w-5 ml-1" />
           </Button>
           
           <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
             <div className="flex items-center gap-3 text-sm text-slate-600 ">
               <Truck className="h-5 w-5 text-slate-400" /> Free Delivery Included
             </div>
             <div className="flex items-center gap-3 text-sm text-slate-600 ">
               <ShieldCheck className="h-5 w-5 text-slate-400" /> Secure Payment & Auto-Renew
             </div>
           </div>
         </Card>
       </div>
     </div>

     {/* Mobile Sticky Bottom CTA */}
     <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50">
       <div className="container max-w-md flex items-center justify-between gap-4 mx-auto">
         <div>
           <p className="text-xs text-slate-500">{plan.duration} Days Plan</p>
           <p className="text-xl font-bold text-slate-900 ">₹{plan.offerPrice || plan.price}</p>
         </div>
         <Button size="md" className="rounded-xl shadow-md flex-1 max-w-[60%] text-white" onClick={handleSubscribe}>
           Subscribe <ChevronRight className="h-5 w-5 ml-1" />
         </Button>
       </div>
     </div>
   </div>
 );
}
