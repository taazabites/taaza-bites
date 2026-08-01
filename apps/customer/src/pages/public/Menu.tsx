import { useState, useEffect, useMemo } from "react";
import OptimizedImage from "../../components/common/OptimizedImage";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Utensils, 
  Leaf, 
  Flame, 
  Clock, 
  Heart, 
  ArrowRight, 
  CheckCircle2, 
  Check, 
  Plus, 
  Trash2, 
  ShoppingCart, 
  Sparkles, 
  Coffee, 
  Moon, 
  X, 
  ChevronRight, 
  Calendar, 
  Filter, 
  ShieldCheck, 
  AlertCircle, 
  Zap,
  RotateCcw,
  ShoppingBag
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { triggerHaptic } from "../../utils/haptics";

export interface MenuItem {
  id: string;
  name: string;
  category: "Breakfast" | "Lunch" | "Dinner" | "Snacks";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  price: number;
  isVeg: boolean;
  image: string;
  tags: string[];
  description: string;
  allergens?: string[];
}

export interface CartItem {
  cartId: string;
  mealId: string;
  name: string;
  category: string;
  selectedDay: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  price: number;
  quantity: number;
  image: string;
}

const DAYS_LIST = [
  "Today (Mon)",
  "Tomorrow (Tue)",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

const categories = ["All", "Breakfast", "Lunch", "Dinner", "Snacks"] as const;

const menuItems: MenuItem[] = [
  {
    id: "brk-1",
    name: "Avocado & Quinoa Power Bowl",
    category: "Breakfast",
    calories: 420,
    protein: 18,
    carbs: 45,
    fat: 22,
    price: 190,
    isVeg: true,
    image: "https://images.unsplash.com/photo-1511690656153-19294f27c832?auto=format&fm=webp&fit=crop&q=80&w=400",
    tags: ["High Protein", "Vegan", "Clean Fiber"],
    description: "Fluffy organic quinoa topped with smashed Hass avocado, poached egg option, microgreens, and toasted pepitas.",
    allergens: ["Seeds"]
  },
  {
    id: "brk-2",
    name: "Spiced Chia & Berry Parfait",
    category: "Breakfast",
    calories: 340,
    protein: 14,
    carbs: 38,
    fat: 12,
    price: 160,
    isVeg: true,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fm=webp&fit=crop&q=80&w=400",
    tags: ["Antioxidant", "Low GI", "Gut Friendly"],
    description: "Cold-infused coconut chia seed pudding layered with wild blueberries, cinnamon, and raw honey drizzled almonds.",
    allergens: ["Nuts"]
  },
  {
    id: "brk-3",
    name: "Spinach & Mushroom Egg-White Frittata",
    category: "Breakfast",
    calories: 290,
    protein: 26,
    carbs: 10,
    fat: 14,
    price: 210,
    isVeg: false,
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fm=webp&fit=crop&q=80&w=400",
    tags: ["Keto Friendly", "High Protein", "Low Carb"],
    description: "Farm-fresh egg whites baked with baby spinach, cremini mushrooms, goat cheese, and fresh dill.",
    allergens: ["Dairy", "Eggs"]
  },
  {
    id: "brk-4",
    name: "Metabolic Oats & Almond Butter Bowl",
    category: "Breakfast",
    calories: 380,
    protein: 16,
    carbs: 42,
    fat: 16,
    price: 170,
    isVeg: true,
    image: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fm=webp&fit=crop&q=80&w=400",
    tags: ["Slow Release", "Heart Healthy"],
    description: "Steel-cut oats cooked in unsweetened almond milk, swirled with artisanal roasted almond butter and flaxseeds.",
    allergens: ["Nuts"]
  },
  {
    id: "lch-1",
    name: "Mediterranean Grilled Salmon",
    category: "Lunch",
    calories: 510,
    protein: 35,
    carbs: 12,
    fat: 28,
    price: 290,
    isVeg: false,
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fm=webp&fit=crop&q=80&w=400",
    tags: ["Keto Friendly", "Omega-3", "Chef Special"],
    description: "Wild-caught salmon fillet seasoned with sumac and oregano, served over char-grilled asparagus and tzatziki.",
    allergens: ["Fish", "Dairy"]
  },
  {
    id: "lch-2",
    name: "Charcoal Grilled Herb Chicken",
    category: "Lunch",
    calories: 480,
    protein: 42,
    carbs: 35,
    fat: 14,
    price: 260,
    isVeg: false,
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fm=webp&fit=crop&q=80&w=400",
    tags: ["High Lean Protein", "Zero Trans-Fat"],
    description: "Grass-fed chicken breast marinated in rosemary & garlic, served with steamed sweet potatoes and blanched broccoli.",
    allergens: []
  },
  {
    id: "lch-3",
    name: "Edamame & Paneer Buddha Bowl",
    category: "Lunch",
    calories: 450,
    protein: 28,
    carbs: 38,
    fat: 20,
    price: 240,
    isVeg: true,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fm=webp&fit=crop&q=80&w=400",
    tags: ["High Fiber", "Pure Veg", "Balanced Macros"],
    description: "Pan-seared cottage cheese cubes, young edamame beans, brown rice, red cabbage slaw, and tahini drizzle.",
    allergens: ["Dairy", "Soy", "Sesame"]
  },
  {
    id: "lch-4",
    name: "Quinoa Stuffed Bell Peppers",
    category: "Lunch",
    calories: 390,
    protein: 18,
    carbs: 44,
    fat: 16,
    price: 220,
    isVeg: true,
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fm=webp&fit=crop&q=80&w=400",
    tags: ["Gluten Free", "Vegan", "Metabolic"],
    description: "Roasted tricolor bell peppers packed with black beans, corn, organic quinoa, and fresh avocado salsa.",
    allergens: []
  },
  {
    id: "dnr-1",
    name: "Zucchini Noodles with Pesto",
    category: "Dinner",
    calories: 320,
    protein: 12,
    carbs: 25,
    fat: 18,
    price: 230,
    isVeg: true,
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fm=webp&fit=crop&q=80&w=400",
    tags: ["Low Carb", "Gluten Free", "Light Night"],
    description: "Spiralized zucchini noodles tossed in fresh house-made basil cashew pesto and roasted cherry tomatoes.",
    allergens: ["Tree Nuts"]
  },
  {
    id: "dnr-2",
    name: "Slow-Cooked Lean Lamb Tagine",
    category: "Dinner",
    calories: 540,
    protein: 38,
    carbs: 18,
    fat: 26,
    price: 320,
    isVeg: false,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fm=webp&fit=crop&q=80&w=400",
    tags: ["High Iron", "Gourmet", "Chef Special"],
    description: "Tender grass-fed lamb simmered with saffron, apricots, and Moroccan spices over fluffy cauliflower couscous.",
    allergens: []
  },
  {
    id: "dnr-3",
    name: "Tofu & Bok Choy Ginger Stir-Fry",
    category: "Dinner",
    calories: 360,
    protein: 22,
    carbs: 28,
    fat: 16,
    price: 210,
    isVeg: true,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fm=webp&fit=crop&q=80&w=400",
    tags: ["Anti-Inflammatory", "Vegan"],
    description: "Organic non-GMO tofu cubes wok-tossed with baby bok choy, shiitake mushrooms, ginger, and tamari sauce.",
    allergens: ["Soy"]
  },
  {
    id: "snk-1",
    name: "Roasted Chickpea & Spice Crunch",
    category: "Snacks",
    calories: 180,
    protein: 9,
    carbs: 22,
    fat: 4,
    price: 110,
    isVeg: true,
    image: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fm=webp&fit=crop&q=80&w=400",
    tags: ["High Fiber", "Vegan", "Guilt Free"],
    description: "Oven-roasted chickpeas tossed in smoked paprika, Himalayan pink salt, and extra virgin olive oil.",
    allergens: []
  },
  {
    id: "snk-2",
    name: "Cold-Pressed Green Cleanse Smoothie",
    category: "Snacks",
    calories: 150,
    protein: 5,
    carbs: 26,
    fat: 2,
    price: 130,
    isVeg: true,
    image: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fm=webp&fit=crop&q=80&w=400",
    tags: ["Detox", "Raw Organic", "Hydrating"],
    description: "Freshly cold-pressed kale, green apple, cucumber, mint, lemon, and spirulina superfood blend.",
    allergens: []
  }
];

export default function Menu() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Active Day & Filters State
  const [selectedDay, setSelectedDay] = useState<string>("Today (Mon)");
  const [activeCategory, setActiveCategory] = useState<typeof categories[number]>("All");
  const [dietFilter, setDietFilter] = useState<"All" | "Veg" | "Non-Veg">("All");

  // Selected Meals Map for Bulk Adding: selectedMealsByDay[day][mealId] = quantity
  const [selectedMealsByDay, setSelectedMealsByDay] = useState<Record<string, Record<string, number>>>({});

  // Cart Drawer & Persisted Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("taaza_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [poppingItemId, setPoppingItemId] = useState<string | null>(null);
  const [isBulkPopping, setIsBulkPopping] = useState(false);

  // Sync Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("taaza_cart", JSON.stringify(cart));
    } catch (e) {
      console.warn("Error saving cart to localStorage", e);
    }
  }, [cart]);

  // Map quantity of each meal already in cart
  const itemCartQtyMap = useMemo(() => {
    const map: Record<string, number> = {};
    cart.forEach(c => {
      map[c.mealId] = (map[c.mealId] || 0) + c.quantity;
    });
    return map;
  }, [cart]);

  // Current Day's Selections Map
  const currentDaySelections = useMemo(() => {
    return selectedMealsByDay[selectedDay] || {};
  }, [selectedMealsByDay, selectedDay]);

  // Selected Count for current day
  const selectedCountForDay = useMemo(() => {
    return Object.values(currentDaySelections).reduce((acc, qty) => acc + qty, 0);
  }, [currentDaySelections]);

  // Aggregated Macros for current day selections
  const dayMacroTotals = useMemo(() => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let totalPrice = 0;

    Object.entries(currentDaySelections).forEach(([mealId, qty]) => {
      if (qty <= 0) return;
      const meal = menuItems.find(m => m.id === mealId);
      if (meal) {
        calories += meal.calories * qty;
        protein += meal.protein * qty;
        carbs += meal.carbs * qty;
        fat += meal.fat * qty;
        totalPrice += meal.price * qty;
      }
    });

    return { calories, protein, carbs, fat, totalPrice };
  }, [currentDaySelections]);

  // Total items in cart across all days
  const totalCartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Total cart price
  const totalCartPrice = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  // Toggle selection or update quantity for a meal on selectedDay
  const handleToggleMeal = (mealId: string, delta: number = 1) => {
    triggerHaptic("light");
    if (delta > 0) {
      setPoppingItemId(mealId);
      setTimeout(() => setPoppingItemId(null), 350);
    }
    setSelectedMealsByDay((prev) => {
      const dayMap = { ...(prev[selectedDay] || {}) };
      const currentQty = dayMap[mealId] || 0;
      const nextQty = Math.max(0, currentQty + delta);

      if (nextQty === 0) {
        delete dayMap[mealId];
      } else {
        dayMap[mealId] = nextQty;
      }

      return {
        ...prev,
        [selectedDay]: dayMap,
      };
    });
  };

  // Quick preset: Select 1 Breakfast, 1 Lunch, 1 Dinner for active day
  const handleSelectFullDayMenu = () => {
    triggerHaptic("medium");
    const breakfast = menuItems.find(m => m.category === "Breakfast");
    const lunch = menuItems.find(m => m.category === "Lunch");
    const dinner = menuItems.find(m => m.category === "Dinner");

    const newMap: Record<string, number> = {};
    if (breakfast) newMap[breakfast.id] = 1;
    if (lunch) newMap[lunch.id] = 1;
    if (dinner) newMap[dinner.id] = 1;

    setSelectedMealsByDay((prev) => ({
      ...prev,
      [selectedDay]: newMap,
    }));

    showToast(` Selected full balanced menu for ${selectedDay}!`, "info");
  };

  // Clear selections for active day
  const handleClearDaySelections = () => {
    triggerHaptic("light");
    setSelectedMealsByDay((prev) => {
      const updated = { ...prev };
      delete updated[selectedDay];
      return updated;
    });
  };

  // BULK ADD ACTION: Add all selected meals for active day to Cart at once!
  const handleBulkAddToCart = () => {
    if (selectedCountForDay === 0) return;

    setIsBulkPopping(true);
    setTimeout(() => setIsBulkPopping(false), 450);
    triggerHaptic("success");

    const itemsToAdd: CartItem[] = [];

    Object.entries(currentDaySelections).forEach(([mealId, qty]) => {
      if (qty <= 0) return;
      const meal = menuItems.find(m => m.id === mealId);
      if (meal) {
        itemsToAdd.push({
          cartId: `${selectedDay}-${meal.id}-${Date.now()}`,
          mealId: meal.id,
          name: meal.name,
          category: meal.category,
          selectedDay,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          price: meal.price,
          quantity: qty,
          image: meal.image,
        });
      }
    });

    // Add to cart state
    setCart((prevCart) => {
      let updatedCart = [...prevCart];

      itemsToAdd.forEach((newItem) => {
        const existingIndex = updatedCart.findIndex(
          c => c.mealId === newItem.mealId && c.selectedDay === newItem.selectedDay
        );

        if (existingIndex >= 0) {
          updatedCart[existingIndex] = {
            ...updatedCart[existingIndex],
            quantity: updatedCart[existingIndex].quantity + newItem.quantity,
          };
        } else {
          updatedCart.push(newItem);
        }
      });

      return updatedCart;
    });

    // Clear day selections after successful bulk add
    setSelectedMealsByDay((prev) => {
      const copy = { ...prev };
      delete copy[selectedDay];
      return copy;
    });

    showToast(`🛒 Added ${selectedCountForDay} meals for ${selectedDay} to your cart!`, "success");
    setIsCartOpen(true);
  };

  // Remove single item from cart drawer
  const handleRemoveFromCart = (cartId: string) => {
    triggerHaptic("light");
    setCart((prev) => prev.filter(item => item.cartId !== cartId));
  };

  // Update quantity in cart drawer
  const handleUpdateCartQty = (cartId: string, delta: number) => {
    triggerHaptic("light");
    setCart((prev) => {
      return prev
        .map(item => {
          if (item.cartId === cartId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  // Filter menu items by category and diet
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesDiet = dietFilter === "All" || (dietFilter === "Veg" && item.isVeg) || (dietFilter === "Non-Veg" && !item.isVeg);
    return matchesCategory && matchesDiet;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <main className="pt-20 sm:pt-24 pb-36">
        
        {/* Floating Cart Button */}
        <div className="fixed top-24 right-4 sm:right-8 z-40">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            animate={totalCartItemCount > 0 ? { scale: [1, 1.12, 0.98, 1] } : {}}
            key={totalCartItemCount}
            transition={{ duration: 0.3 }}
            onClick={() => {
              triggerHaptic("light");
              setIsCartOpen(true);
            }}
            className="relative bg-zinc-950 dark:bg-emerald-600 text-white p-3.5 sm:px-5 sm:py-3 rounded-full shadow-2xl shadow-emerald-600/30 flex items-center gap-2.5 font-bold text-xs sm:text-sm cursor-pointer border border-white/20"
          >
            <ShoppingCart className="w-5 h-5 text-emerald-400 dark:text-white" />
            <span className="hidden sm:inline">My Meal Cart</span>
            <AnimatePresence mode="popLayout">
              {totalCartItemCount > 0 && (
                <motion.span
                  key={totalCartItemCount}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: [1, 1.3, 1], rotate: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.25 }}
                  className="bg-emerald-500 dark:bg-white text-zinc-950 font-black px-2.5 py-0.5 rounded-full text-xs shadow-md border border-emerald-300"
                >
                  {totalCartItemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Header Section */}
        <section className="px-6 py-12 max-w-7xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-widest border border-emerald-300/50 dark:border-emerald-700/50">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Bulk Meal Planner & Daily Menu
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-zinc-950 dark:text-white max-w-4xl mx-auto leading-tight">
              Pick Your Daily Meals. <br className="hidden sm:inline"/>
              <span className="text-emerald-600 dark:text-emerald-400">Add Full Days at Once.</span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto font-medium">
              Select multiple dishes for any day of the week, monitor aggregate macros in real-time, and bulk-add your entire day's menu directly to your cart.
            </p>
          </motion.div>
        </section>

        {/* Step 1: Target Day Selection Bar */}
        <section className="px-6 max-w-7xl mx-auto mb-8">
          <div className="bg-white dark:bg-zinc-900 border border-emerald-100/80 dark:border-zinc-800 p-5 sm:p-6 rounded-[2.2rem] shadow-xl shadow-emerald-900/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-black text-sm uppercase tracking-wider text-zinc-900 dark:text-white">
                  Step 1: Choose Planning Day
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
                Currently Planning For: <strong className="font-black">{selectedDay}</strong>
              </span>
            </div>

            {/* Day Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {DAYS_LIST.map((day) => {
                const isSelected = selectedDay === day;
                const countForThisDay = Object.values(selectedMealsByDay[day] || {}).reduce((a, b) => a + b, 0);

                return (
                  <button
                    key={day}
                    onClick={() => {
                      triggerHaptic("light");
                      setSelectedDay(day);
                    }}
                    className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105 ring-2 ring-emerald-400/50"
                        : "bg-slate-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    <span>{day}</span>
                    {countForThisDay > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                        isSelected ? "bg-white text-emerald-700" : "bg-emerald-500 text-white"
                      }`}>
                        {countForThisDay}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Preset Buttons for Selected Day */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectFullDayMenu}
                  className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Select Full Day Preset (3 Meals)</span>
                </button>

                {selectedCountForDay > 0 && (
                  <button
                    onClick={handleClearDaySelections}
                    className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border border-rose-200 dark:border-rose-900"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Day</span>
                  </button>
                )}
              </div>

              <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {selectedCountForDay === 0 ? (
                  <span>Click on any meal card below to select it for <strong>{selectedDay}</strong>.</span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {selectedCountForDay} dish{selectedCountForDay > 1 ? "es" : ""} staged for {selectedDay}!
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Step 2: Course & Diet Filters Bar */}
        <section className="px-6 max-w-7xl mx-auto mb-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
            
            {/* Category Course Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mr-1 shrink-0">Course:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    triggerHaptic("light");
                    setActiveCategory(cat);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    activeCategory === cat
                      ? "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-sm"
                      : "bg-slate-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Diet Filter */}
            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mr-1">Diet:</span>
              {(["All", "Veg", "Non-Veg"] as const).map((diet) => (
                <button
                  key={diet}
                  onClick={() => {
                    triggerHaptic("light");
                    setDietFilter(diet);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    dietFilter === diet
                      ? diet === "Veg"
                        ? "bg-emerald-600 text-white"
                        : diet === "Non-Veg"
                        ? "bg-rose-600 text-white"
                        : "bg-zinc-800 text-white"
                      : "bg-slate-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {diet}
                </button>
              ))}
            </div>

          </div>
        </section>

        {/* Step 3: Menu Cards Grid */}
        <section className="px-6 max-w-7xl mx-auto mb-28">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="wait">
              {filteredItems.map((item) => {
                const selectedQty = currentDaySelections[item.id] || 0;
                const isSelected = selectedQty > 0;
                const isPopping = poppingItemId === item.id;
                const itemInCartQty = itemCartQtyMap[item.id] || 0;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={`group rounded-[2.5rem] bg-white dark:bg-zinc-900 border transition-all duration-300 flex flex-col relative overflow-hidden shadow-sm ${
                      isSelected
                        ? "border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/30 shadow-xl shadow-emerald-900/10 -translate-y-1"
                        : "border-zinc-200/80 dark:border-zinc-800 hover:border-emerald-300 hover:shadow-lg"
                    }`}
                  >
                    {/* Image & Selection Header */}
                    <div className="relative h-56 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <OptimizedImage
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                        <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-[10px] font-black text-white uppercase tracking-widest">
                          {item.category === "Breakfast" && <Coffee className="w-3.5 h-3.5 text-amber-400" />}
                          {item.category === "Lunch" && <Utensils className="w-3.5 h-3.5 text-emerald-400" />}
                          {item.category === "Dinner" && <Moon className="w-3.5 h-3.5 text-sky-400" />}
                          {item.category === "Snacks" && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                          {item.category}
                        </span>

                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-md ${
                          item.isVeg 
                            ? "bg-emerald-600 border-emerald-500 text-white" 
                            : "bg-rose-600 border-rose-500 text-white"
                        }`}>
                          {item.isVeg ? "Pure Veg" : "Non-Veg"}
                        </span>
                      </div>

                      {/* Selected Overlay Indicator */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[2px] flex items-center justify-center z-20 pointer-events-none">
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-2xl shadow-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 border border-emerald-300"
                          >
                            <CheckCircle2 className="w-5 h-5 text-white animate-bounce" />
                            <span>Selected for {selectedDay} ({selectedQty}x)</span>
                          </motion.div>
                        </div>
                      )}

                      {/* Price Tag */}
                      <div className="absolute bottom-4 left-4 z-10">
                        <span className="bg-zinc-950/90 text-emerald-400 font-black px-3.5 py-1.5 rounded-xl text-sm border border-emerald-500/30 shadow-md">
                          ₹{item.price}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="text-xl font-black text-zinc-950 dark:text-white leading-tight mb-2 tracking-tight">
                          {item.name}
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      {/* Tag Chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.map(tag => (
                          <span key={tag} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Macros Grid */}
                      <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl text-center border border-zinc-100 dark:border-zinc-800">
                        <div>
                          <p className="text-[9px] text-zinc-400 font-black uppercase">Kcal</p>
                          <p className="text-xs font-black text-zinc-900 dark:text-white">{item.calories}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-zinc-400 font-black uppercase">Prot</p>
                          <p className="text-xs font-black text-zinc-900 dark:text-white">{item.protein}g</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-zinc-400 font-black uppercase">Carb</p>
                          <p className="text-xs font-black text-zinc-900 dark:text-white">{item.carbs}g</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-zinc-400 font-black uppercase">Fat</p>
                          <p className="text-xs font-black text-zinc-900 dark:text-white">{item.fat}g</p>
                        </div>
                      </div>

                      {/* Selection Toggle / Stepper Control */}
                      <div className="pt-2">
                        {isSelected ? (
                          <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 p-2 rounded-2xl shadow-xs">
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => handleToggleMeal(item.id, -1)}
                              className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-black hover:bg-emerald-100 dark:hover:bg-zinc-700 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                            >
                              -
                            </motion.button>

                            <div className="flex flex-col items-center">
                              <span className="font-black text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
                                {selectedQty} Staged for {selectedDay.split(" ")[0]}
                              </span>
                              {itemInCartQty > 0 && (
                                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                  <ShoppingBag className="w-3 h-3" /> {itemInCartQty} in cart
                                </span>
                              )}
                            </div>

                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              animate={isPopping ? { scale: [1, 1.3, 0.9, 1] } : {}}
                              transition={{ duration: 0.3 }}
                              onClick={() => handleToggleMeal(item.id, 1)}
                              className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-500 flex items-center justify-center transition-all cursor-pointer shadow-md"
                            >
                              +
                            </motion.button>
                          </div>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.92 }}
                            animate={isPopping ? { scale: [1, 1.15, 0.92, 1] } : {}}
                            transition={{ duration: 0.3 }}
                            onClick={() => handleToggleMeal(item.id, 1)}
                            className="w-full h-12 rounded-2xl bg-zinc-950 dark:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all cursor-pointer shadow-sm active:scale-98 relative overflow-hidden"
                          >
                            <Plus className="w-4 h-4 text-emerald-400 dark:text-white" />
                            <span>Select for {selectedDay}</span>
                            {itemInCartQty > 0 && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="ml-1 bg-emerald-500 dark:bg-zinc-900 text-zinc-950 dark:text-emerald-300 font-black px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 border border-emerald-300/40"
                              >
                                <ShoppingBag className="w-3 h-3" />
                                <span>{itemInCartQty} in cart</span>
                              </motion.span>
                            )}
                          </motion.button>
                        )}
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>

      </main>

      {/* Floating Bottom Action Banner & Macro Aggregator (Visible when 1+ meals selected) */}
      <AnimatePresence>
        {selectedCountForDay > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 dark:bg-zinc-900/95 text-white backdrop-blur-xl border-t border-emerald-500/40 p-4 sm:p-6 shadow-2xl"
          >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Selected Summary & Live Aggregated Macros */}
              <div className="space-y-2 text-center md:text-left w-full md:w-auto">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500 text-zinc-950 text-xs font-black uppercase tracking-wider">
                    {selectedCountForDay} Dish{selectedCountForDay > 1 ? "es" : ""} Staged
                  </span>
                  <span className="text-xs text-zinc-400 font-semibold">
                    for <strong>{selectedDay}</strong>
                  </span>
                </div>

                {/* Live Macro Pills */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs font-bold text-zinc-300">
                  <span className="flex items-center gap-1 bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>{dayMacroTotals.calories} Kcal</span>
                  </span>
                  <span className="flex items-center gap-1 bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{dayMacroTotals.protein}g Protein</span>
                  </span>
                  <span className="flex items-center gap-1 bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700">
                    <Leaf className="w-3.5 h-3.5 text-teal-400" />
                    <span>{dayMacroTotals.carbs}g Carbs</span>
                  </span>
                  <span className="text-emerald-400 font-black text-sm ml-2">
                    Total: ₹{dayMacroTotals.totalPrice}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="px-5 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border border-zinc-700"
                >
                  Review Cart ({totalCartItemCount})
                </button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.92 }}
                  animate={isBulkPopping ? { scale: [1, 1.12, 0.95, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  onClick={handleBulkAddToCart}
                  className="flex-1 md:flex-initial px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 font-black text-xs sm:text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/30 transition-all cursor-pointer flex items-center justify-center gap-2.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Bulk Add {selectedCountForDay} Meals for {selectedDay.split(" ")[0]}</span>
                  <span className="bg-zinc-950 text-emerald-400 px-2.5 py-0.5 rounded-full text-xs font-black shadow-inner">
                    {selectedCountForDay}
                  </span>
                </motion.button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Slide-Over Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
            />

            {/* Slide Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white dark:bg-zinc-900 z-50 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-zinc-200 dark:border-zinc-800"
            >
              {/* Drawer Header */}
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Your Meal Cart</h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{totalCartItemCount} item{totalCartItemCount !== 1 ? "s" : ""} queued for delivery</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-2 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-zinc-600 dark:text-zinc-300 transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Items List */}
                {cart.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center mx-auto text-emerald-600">
                      <Utensils className="w-8 h-8" />
                    </div>
                    <h3 className="font-black text-lg text-zinc-900 dark:text-white">Your cart is empty</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                      Select dishes for any day and use the bulk-add button to fill your delivery schedule.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.cartId}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center gap-3 relative"
                      >
                        <OptimizedImage
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-xl object-cover shrink-0"
                        />

                        <div className="flex-grow space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                              {item.selectedDay}
                            </span>
                            <button
                              onClick={() => handleRemoveFromCart(item.cartId)}
                              className="text-zinc-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <h4 className="font-bold text-xs text-zinc-900 dark:text-white leading-tight">
                            {item.name}
                          </h4>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                              ₹{item.price * item.quantity}
                            </span>

                            {/* Qty Stepper */}
                            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                              <button
                                onClick={() => handleUpdateCartQty(item.cartId, -1)}
                                className="text-xs font-black text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 px-1"
                              >
                                -
                              </button>
                              <span className="text-xs font-black text-zinc-900 dark:text-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateCartQty(item.cartId, 1)}
                                className="text-xs font-black text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 px-1"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drawer Footer & Checkout Action */}
              {cart.length > 0 && (
                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                      <span>Subtotal</span>
                      <span className="font-bold text-zinc-900 dark:text-white">₹{totalCartPrice}</span>
                    </div>
                    <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                      <span>Chef Delivery Fee</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">FREE</span>
                    </div>
                    <div className="flex justify-between font-black text-sm text-zinc-900 dark:text-white pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <span>Total Amount</span>
                      <span className="text-emerald-600 dark:text-emerald-400">₹{totalCartPrice}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      triggerHaptic("success");
                      setIsCartOpen(false);
                      navigate("/plans");
                    }}
                    className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                  >
                    <span>Proceed to Subscription Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
