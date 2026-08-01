import OptimizedImage from "../components/common/OptimizedImage";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, Flame, Zap, Droplets, Info, 
  Clock, ChefHat, Leaf, ShieldCheck, 
  CheckCircle2, ArrowRight, Play, Thermometer,
  MapPin, Scale, HeartPulse, Sparkles, ShieldAlert
} from "lucide-react";
import { Button, Card } from "../components/ui/primitives";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { db } from "../firebase/db";
import { doc, getDoc } from "firebase/firestore";

export default function MealDetailExperience() {
  const { mealId } = useParams();
  const navigate = useNavigate();
  const [meal, setMeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"nutrition" | "story" | "guide">("nutrition");

  useEffect(() => {
    const fetchMeal = async () => {
      if (!mealId) {
        setLoading(false);
        return;
      }
      try {
        // Try fetching from mealPlans collection
        let snap = await getDoc(doc(db, "mealPlans", mealId));
        if (snap.exists()) {
          setMeal({ id: snap.id, ...snap.data() });
        } else {
          // Try fetching from meals collection
          snap = await getDoc(doc(db, "meals", mealId));
          if (snap.exists()) {
            setMeal({ id: snap.id, ...snap.data() });
          } else {
            // Try fetching from menuItems collection
            snap = await getDoc(doc(db, "menuItems", mealId));
            if (snap.exists()) {
              setMeal({ id: snap.id, ...snap.data() });
            } else {
              setMeal(null);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching meal details:", err);
        setMeal(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMeal();
  }, [mealId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto pb-24">
          <div className="flex items-center gap-2 mb-8 h-4 w-24 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <div className="aspect-square rounded-[3rem] bg-zinc-100 dark:bg-zinc-800 animate-pulse shadow-lg" />
              <div className="space-y-4">
                <div className="h-12 w-3/4 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-2xl" />
                <div className="h-6 w-full bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-lg" />
                <div className="h-6 w-5/6 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-lg" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-3xl" />
                ))}
              </div>
            </div>
            <div className="space-y-8">
              <div className="h-16 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-2xl" />
              <div className="h-[400px] bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-[2.5rem]" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!meal) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto my-20 p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-[3rem] space-y-6">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto">
            <Info className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Meal Not Found</h2>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            The requested meal or plan could not be located in our active database.
          </p>
          <Button 
            onClick={() => navigate("/dashboard/todays-meals")}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-2xl"
          >
            Explore Active Menu
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Derive dynamic story elements from meal properties
  const ingredientsList = (meal.ingredients && Array.isArray(meal.ingredients) && meal.ingredients.length > 0)
    ? meal.ingredients.map((ing: string) => ({
        name: ing,
        origin: "Farm-Fresh Sourced",
        benefit: "Nutrient-Dense & Clean"
      }))
    : [
        { name: meal.name || meal.mealName || "Fresh Farm Ingredients", origin: "Artisanal Kitchen", benefit: "Calibrated Macros" },
        { name: "Cold-Pressed Herbs & Seasoning", origin: "Kerala Artisanal Press", benefit: "Rich in Micronutrients" }
      ];

  const chefInfo = {
    name: meal.chefName || "TaazaBites Executive Chef",
    role: "Metabolic Culinary Specialist",
    image: meal.chefImage || "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fm=webp&fit=crop&q=80&w=300",
    quote: meal.chefNotes || "Every ingredient is selected for bioavailability, fresh taste, and precise metabolic performance."
  };

  const timelineSteps = [
    { label: "Sourced", time: "Fresh Farm", icon: <Leaf className="w-4 h-4" /> },
    { label: "Kitchen Prep", time: "Calibrated", icon: <ChefHat className="w-4 h-4" /> },
    { label: "Cold-Chain Log", time: "Insulated", icon: <ShieldCheck className="w-4 h-4" /> },
    { label: "Express Transit", time: "On Schedule", icon: <Clock className="w-4 h-4" /> }
  ];

  const heatingInstructions = [
    { method: "Microwave", instruction: "Remove lid, heat for 2-3 mins on medium-high.", icon: <Zap className="w-4 h-4" /> },
    { method: "Stove-top", instruction: "Transfer to pan, add a splash of water, heat for 4-5 mins.", icon: <Flame className="w-4 h-4" /> }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto pb-24">
        {/* Header Nav */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-8 font-black uppercase tracking-widest text-[10px]"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Hub
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Side: Hero & Image */}
          <section className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-white/5"
            >
              <OptimizedImage 
                src={meal?.image || meal?.imageUrl || "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fm=webp&w=800"} 
                alt={meal?.name || "Meal Image"} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                
                decoding="async"
              />
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                 <div className="px-4 py-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 shadow-xl self-start">
                   {meal?.category || "Standard"}
                 </div>
                 <div className="px-4 py-2 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl self-start">
                   Today's Protocol
                 </div>
              </div>
            </motion.div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tightest leading-none">
                {meal?.name}
              </h1>
              <p className="text-zinc-500 font-medium text-lg leading-relaxed">
                {meal?.description || "Engineered for optimal micronutrient density and steady glucose response."}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
               <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Calories</p>
                  <p className="text-2xl font-black text-zinc-900 dark:text-white">{meal?.calories || meal?.nutrition?.calories}</p>
               </div>
               <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Protein</p>
                  <p className="text-2xl font-black text-emerald-500">{meal?.protein || meal?.nutrition?.protein}g</p>
               </div>
               <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Portion</p>
                  <p className="text-sm font-black text-zinc-900 dark:text-white mt-1">{meal?.portionSize || "450g"}</p>
               </div>
            </div>
          </section>

          {/* Right Side: Interactive Experience Tabs */}
          <section className="space-y-8">
            {/* Custom Tab Switcher */}
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/5">
               {[
                 { id: "nutrition", label: "Nutrition Facts", icon: <HeartPulse className="w-4 h-4" /> },
                 { id: "story", label: "Ingredient Story", icon: <MapPin className="w-4 h-4" /> },
                 { id: "guide", label: "Heating Guide", icon: <Thermometer className="w-4 h-4" /> }
               ].map(tab => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                     activeTab === tab.id 
                       ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-lg" 
                       : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                   }`}
                 >
                   {tab.icon}
                   <span className="hidden sm:inline">{tab.label}</span>
                 </button>
               ))}
            </div>

            <div className="min-h-[400px]">
               <AnimatePresence mode="wait">
                  {activeTab === "nutrition" && (
                    <motion.div 
                      key="nutrition"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white">Molecular Breakdown</h3>
                        <div className="grid grid-cols-2 gap-4">
                           <MacroBar label="Carbohydrates" value={meal?.carbs || 65} target={100} color="bg-blue-500" />
                           <MacroBar label="Total Fats" value={meal?.fat || 22} target={100} color="bg-amber-500" />
                        </div>
                      </div>

                      <Card className="p-6 bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-white/10 rounded-[2rem]">
                         <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Micronutrient Profile</p>
                         <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                            {[
                              { label: "Iron", value: "24%", icon: <Zap className="w-3 h-3 text-rose-500" /> },
                              { label: "Magnesium", value: "32%", icon: <Sparkles className="w-3 h-3 text-purple-500" /> },
                              { label: "Potassium", value: "18%", icon: <Droplets className="w-3 h-3 text-blue-500" /> },
                              { label: "Vit B12", value: "45%", icon: <Flame className="w-3 h-3 text-orange-500" /> }
                            ].map(item => (
                              <div key={item.label} className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                    {item.icon}
                                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{item.label}</span>
                                 </div>
                                 <span className="text-xs font-black text-zinc-900 dark:text-white">{item.value}</span>
                              </div>
                            ))}
                         </div>
                      </Card>

                      {/* Allergens Section */}
                      <Card className="p-6 bg-rose-500/5 border-rose-500/10 rounded-[2rem]">
                         <div className="flex items-center gap-3 mb-4">
                            <ShieldAlert className="w-5 h-5 text-rose-500" />
                            <h4 className="text-sm font-black text-rose-600 dark:text-rose-400">Allergen Information</h4>
                         </div>
                         <div className="flex flex-wrap gap-2">
                            {(meal.allergens && meal.allergens.length > 0) ? meal.allergens.map((allergen: string) => (
                               <span key={allergen} className="px-3 py-1 bg-rose-500/10 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                  {allergen}
                               </span>
                            )) : (
                               <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                  No Major Allergens Detected
                               </span>
                            )}
                         </div>
                         <p className="text-[10px] font-medium text-rose-400 mt-4 leading-relaxed italic">
                            * Handcrafted in a kitchen that processes nuts, soy, and dairy. Cross-contamination protocols are strictly followed.
                         </p>
                      </Card>

                      <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem]">
                         <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                            <h4 className="text-sm font-black text-emerald-600 dark:text-emerald-400">Biological Impact</h4>
                         </div>
                         <p className="text-xs font-medium text-emerald-700/70 dark:text-emerald-400/70 leading-relaxed">
                            This meal's fiber-to-carb ratio is designed to minimize insulin spikes, providing sustained energy for 4-5 hours.
                         </p>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "story" && (
                    <motion.div 
                      key="story"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="space-y-4">
                         <h3 className="text-xl font-black text-zinc-900 dark:text-white">Tracing the Source</h3>
                         <div className="grid gap-4">
                            {ingredientsList.map((ing: any, i: number) => (
                              <div key={ing.name + i} className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-white/10 group hover:border-emerald-500/30 transition-all">
                                 <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                    <Leaf className="w-5 h-5" />
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-zinc-900 dark:text-white">{ing.name}</p>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{ing.origin} • {ing.benefit}</p>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>

                      <div className="bg-zinc-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-8 opacity-10">
                            <ChefHat className="w-24 h-24" />
                         </div>
                         <div className="flex items-center gap-4 mb-6">
                            <OptimizedImage src={chefInfo.image} alt={chefInfo.name} className="w-16 h-16 rounded-2xl object-cover grayscale" referrerPolicy="no-referrer"  />
                            <div>
                               <p className="text-lg font-black">{chefInfo.name}</p>
                               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{chefInfo.role}</p>
                            </div>
                         </div>
                         <p className="text-zinc-400 italic font-medium leading-relaxed">
                            "{chefInfo.quote}"
                         </p>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "guide" && (
                    <motion.div 
                      key="guide"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="space-y-6">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">The Perfect Temperature</h3>
                        <div className="grid gap-4">
                           {heatingInstructions.map(guide => (
                             <Card key={guide.method} className="p-6 bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-white/10 rounded-3xl flex gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white">
                                   {guide.icon}
                                </div>
                                <div>
                                   <p className="text-sm font-black text-zinc-900 dark:text-white mb-1">{guide.method}</p>
                                   <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">{guide.instruction}</p>
                                </div>
                             </Card>
                           ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                         <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Preparation Timeline</h4>
                         <div className="relative pl-8 space-y-8 border-l-2 border-zinc-100 dark:border-zinc-800 ml-4">
                            {timelineSteps.map((item, i) => (
                              <div key={item.label} className="relative">
                                 <div className={`absolute -left-[41px] w-6 h-6 rounded-full border-4 border-white dark:border-zinc-950 flex items-center justify-center ${i === 3 ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-800"}`}>
                                    {React.cloneElement((item.icon as any), { className: `w-3 h-3 ${i === 3 ? "text-white" : "text-zinc-400"}` })}
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-zinc-900 dark:text-white leading-none">{item.label}</p>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{item.time}</p>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>

            <Button className="w-full h-16 bg-zinc-900 dark:bg-white dark:text-zinc-950 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl flex items-center justify-center gap-3 group">
               Log Consumption
               <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>

            {/* Tomorrow's Teaser */}
            <Card className="p-6 bg-zinc-100/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/5 rounded-[2rem] flex items-center justify-between group cursor-pointer hover:border-emerald-500/30 transition-all">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                     <OptimizedImage src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fm=webp&w=100" alt="Tomorrow" className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity"  />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Up Next</p>
                     <p className="text-sm font-black text-zinc-900 dark:text-white">Tomorrow's Metabolic Reset</p>
                  </div>
               </div>
               <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:translate-x-1 transition-transform" />
            </Card>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

function MacroBar({ label, value, target, color }: any) {
  const percent = Math.min(100, (value / target) * 100);
  return (
    <div className="space-y-2">
       <div className="flex justify-between items-end">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</span>
          <span className="text-xs font-black text-zinc-900 dark:text-white">{value}g</span>
       </div>
       <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            className={`h-full ${color} rounded-full`}
          />
       </div>
    </div>
  );
}
