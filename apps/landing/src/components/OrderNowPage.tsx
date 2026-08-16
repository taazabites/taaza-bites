/**
 * Order Now — polished browse + cart experience.
 */
import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Leaf,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  User,
  X,
} from "lucide-react";
import { Logo } from "./Logo";
import { LazyImage } from "./LazyImage";
import { ShopAuthDrawer } from "./ShopAuthDrawer";

interface OrderNowPageProps {
  onNavigate: (path: string) => void;
}

interface Category {
  id: string;
  label: string;
}

interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  image: string;
  isVeg: boolean;
  price: number;
}

type CartLine = { id: string; name: string; price: number; qty: number; image: string };

const SLIDES = [
  {
    id: 1,
    eyebrow: "Are you hungry?",
    title: "Don't Wait",
    subtitle: "Get 1 free delivery when you order healthy food.",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=85&w=1000",
  },
  {
    id: 2,
    eyebrow: "Fresh every day",
    title: "Eat Clean",
    subtitle: "Chef-crafted macro meals delivered to your door.",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=85&w=1000",
  },
  {
    id: 3,
    eyebrow: "Build your bowl",
    title: "Your Way",
    subtitle: "Customize proteins, sides and toppings in minutes.",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=85&w=1000",
  },
];

const CATEGORIES: Category[] = [
  { id: "oats", label: "Healthy Oats Bowls" },
  { id: "protein-salad", label: "Protein Salad Bowls" },
  { id: "smoothie", label: "Signature Smoothie Bowls" },
  { id: "byb-proteins", label: "Build Your Bowl" },
  { id: "omelet", label: "Epic Omelets" },
  { id: "desserts", label: "Healthy Desserts" },
  { id: "nourish", label: "Nourish Bowls" },
  { id: "wraps", label: "Wraps & Sandwiches" },
];

const ITEMS: MenuItem[] = [
  { id: "o1", categoryId: "oats", name: "Apple Cinnamon Oats Bowl", description: "Premium rolled oats soaked overnight in almond milk and raw honey with cinnamon apples.", image: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 199 },
  { id: "o2", categoryId: "oats", name: "Avocado Overnight Oats", description: "Creamy overnight oats topped with sliced avocado, chia seeds and banana.", image: "https://images.unsplash.com/photo-1494597567531-9524ee7cfaa0?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 219 },
  { id: "o3", categoryId: "oats", name: "Blackberry Oats Bowl", description: "Purple oat base loaded with blackberries, pomegranate and sliced banana.", image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 229 },
  { id: "o4", categoryId: "oats", name: "Blueberry Power Oats", description: "Antioxidant-rich blueberry oats with pomegranate, banana and seeds.", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 209 },
  { id: "o5", categoryId: "oats", name: "Peanut Butter Oats", description: "Protein oats blended with natural peanut butter and cacao nibs.", image: "https://images.unsplash.com/photo-1517093157656-b9eccef91eb1?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 239 },
  { id: "o6", categoryId: "oats", name: "Mango Turmeric Oats", description: "Golden oats with mango, turmeric and toasted coconut flakes.", image: "https://images.unsplash.com/photo-1623065422902-30a2d94beca3?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 249 },
  { id: "p1", categoryId: "protein-salad", name: "Grilled Chicken Salad", description: "Lean grilled chicken over mixed greens, cucumber and lemon dressing.", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&q=80&w=500", isVeg: false, price: 299 },
  { id: "p2", categoryId: "protein-salad", name: "Tofu Crunch Salad", description: "Crispy tofu, cabbage slaw, sesame and ginger soy dressing.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 259 },
  { id: "p3", categoryId: "protein-salad", name: "Egg Power Salad", description: "Boiled eggs, avocado, greens and mustard yogurt dressing.", image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=500", isVeg: false, price: 279 },
  { id: "p4", categoryId: "protein-salad", name: "Chickpea Protein Bowl", description: "Roasted chickpeas, quinoa, herbs and tahini drizzle.", image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 269 },
  { id: "s1", categoryId: "smoothie", name: "Berry Blast Bowl", description: "Frozen berry blend topped with granola, banana and chia.", image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 199 },
  { id: "s2", categoryId: "smoothie", name: "Green Detox Bowl", description: "Spinach, pineapple, banana and coconut flakes.", image: "https://images.unsplash.com/photo-1623065422902-30a2d94beca3?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 219 },
  { id: "s3", categoryId: "smoothie", name: "Chocolate Protein Bowl", description: "Cacao smoothie base with peanut butter and cacao nibs.", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 229 },
  { id: "s4", categoryId: "smoothie", name: "Tropical Glow Bowl", description: "Mango and passionfruit with toasted coconut.", image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 209 },
  { id: "bp1", categoryId: "byb-proteins", name: "Grilled Chicken (150g)", description: "Lean grilled chicken breast portion for bowl building.", image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&q=80&w=500", isVeg: false, price: 239 },
  { id: "bp2", categoryId: "byb-proteins", name: "Paneer Cubes (120g)", description: "Soft paneer cubes lightly seasoned.", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 249 },
  { id: "bp3", categoryId: "byb-proteins", name: "Tofu Steak", description: "Pan-seared tofu steak with sesame.", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 299 },
  { id: "bp4", categoryId: "byb-proteins", name: "Boiled Eggs (2)", description: "Two perfectly boiled eggs.", image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&q=80&w=500", isVeg: false, price: 259 },
  { id: "e1", categoryId: "omelet", name: "Spinach Feta Omelet", description: "Egg white omelet with spinach and feta.", image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=500", isVeg: false, price: 279 },
  { id: "e2", categoryId: "omelet", name: "Mushroom Cheese Omelet", description: "Fluffy omelet with mushrooms and cheese.", image: "https://images.unsplash.com/photo-1608039829573-9870aba275e0?auto=format&fit=crop&q=80&w=500", isVeg: false, price: 269 },
  { id: "e3", categoryId: "omelet", name: "Veggie Loaded Omelet", description: "Peppers, onion, tomato and herbs.", image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=500", isVeg: false, price: 199 },
  { id: "d1", categoryId: "desserts", name: "Chia Pudding Cup", description: "Creamy chia pudding with berries and honey.", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 219 },
  { id: "n1", categoryId: "nourish", name: "Buddha Nourish Bowl", description: "Quinoa, roasted veggies and tahini.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 229 },
  { id: "n2", categoryId: "nourish", name: "Mediterranean Bowl", description: "Olives, hummus, cucumber and greens.", image: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 209 },
  { id: "n3", categoryId: "nourish", name: "Teriyaki Tofu Bowl", description: "Tofu, rice and steamed greens.", image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 239 },
  { id: "n4", categoryId: "nourish", name: "Salmon Poke Bowl", description: "Salmon, rice, avocado and seaweed.", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&q=80&w=500", isVeg: false, price: 249 },
  { id: "w1", categoryId: "wraps", name: "Chicken Wrap", description: "Grilled chicken wrap with greens.", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=500", isVeg: false, price: 299 },
  { id: "w2", categoryId: "wraps", name: "Paneer Sandwich", description: "Grilled paneer in multigrain bread.", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 259 },
  { id: "w3", categoryId: "wraps", name: "Veggie Wrap", description: "Fresh veggies and hummus wrap.", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 279 },
];

const SORT_OPTIONS = [
  "All",
  "Veg",
  "Non-veg",
  "Price: Low to High",
  "Price: High to Low",
] as const;

/** Suggested add-ons shown in the cart below the order */
const CART_ADDONS: { id: string; name: string; price: number; image: string }[] = [
  {
    id: "addon-cold-press",
    name: "Cold Press Juice",
    price: 89,
    image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "addon-protein-shot",
    name: "Protein Shot",
    price: 79,
    image: "https://images.unsplash.com/photo-1579722820308-d74e571900a9?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "addon-greek-yogurt",
    name: "Greek Yogurt Cup",
    price: 69,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "addon-boiled-eggs",
    name: "Boiled Eggs (2)",
    price: 49,
    image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "addon-nuts",
    name: "Trail Mix Pack",
    price: 59,
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=200",
  },
];

const ACCENT = "#059669";

export const OrderNowPage: React.FC<OrderNowPageProps> = ({ onNavigate }) => {
  const [slide, setSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState("oats");
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]>("All");
  const [addressOpen, setAddressOpen] = useState(false);
  const [address, setAddress] = useState("Change Address");
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);

  const cartCount = cart.reduce((n, l) => n + l.qty, 0);
  const cartTotal = cart.reduce((n, l) => n + l.price * l.qty, 0);

  const addToCart = (item: { id: string; name: string; price: number; image: string }, openCart = false) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.id === item.id);
      if (existing) {
        return prev.map((l) => (l.id === item.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1, image: item.image }];
    });
    setJustAdded(item.id);
    window.setTimeout(() => setJustAdded(null), 700);
    if (openCart) setCartOpen(true);
  };

  const setQty = (id: string, qty: number) => {
    setCart((prev) =>
      prev
        .map((l) => (l.id === id ? { ...l, qty } : l))
        .filter((l) => l.qty > 0)
    );
  };

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!cartOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [cartOpen]);

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    CATEGORIES.forEach((c) => {
      map[c.id] = ITEMS.filter((i) => i.categoryId === c.id).length;
    });
    return map;
  }, []);

  const visibleItems = useMemo(() => {
    let list = ITEMS.filter((i) => i.categoryId === activeCategory);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
      );
    }
    if (sortBy === "Veg") list = list.filter((i) => i.isVeg);
    if (sortBy === "Non-veg") list = list.filter((i) => !i.isVeg);
    if (sortBy === "Price: Low to High") list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === "Price: High to Low") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [activeCategory, query, sortBy]);

  const current = SLIDES[slide];
  const activeCatLabel = CATEGORIES.find((c) => c.id === activeCategory)?.label || "Menu";

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-zinc-900 font-sans">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-zinc-950 text-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 sm:h-[58px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="p-1.5 hover:bg-white/10 rounded-lg cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" strokeWidth={2} />
            </button>
            <button type="button" onClick={() => onNavigate("/")} className="shrink-0 cursor-pointer" aria-label="Home">
              <div className="w-9 h-9 rounded-lg bg-zinc-900 overflow-hidden flex items-center justify-center border border-white/10">
                <Logo showText={false} size="sm" />
              </div>
            </button>
            <button
              type="button"
              onClick={() => setAddressOpen((v) => !v)}
              className="text-left min-w-0 cursor-pointer hover:opacity-90"
            >
              <span className="block text-[10px] text-white/55 leading-none">Delivering to</span>
              <span className="mt-0.5 flex items-center gap-1 text-[13px] font-semibold leading-tight truncate max-w-[130px] sm:max-w-[200px]">
                {address}
                <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-70" />
              </span>
            </button>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1">
            {(
              [
                { label: "Search", icon: Search, action: () => setSearchOpen((v) => !v) },
                { label: "Sort", icon: ArrowUpDown, action: () => setSortOpen((v) => !v) },
                { label: "Login", icon: User, action: () => setAuthOpen(true) },
                { label: "Cart", icon: ShoppingCart, action: () => setCartOpen(true) },
              ] as const
            ).map(({ label, icon: Icon, action }) => (
              <button
                key={label}
                type="button"
                onClick={action}
                className="relative flex items-center gap-1.5 px-2 sm:px-2.5 py-2 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                <span className="hidden md:inline text-[13px] font-medium">{label}</span>
                {label === "Cart" && cartCount > 0 && (
                  <span className="absolute -top-0.5 right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#059669] text-[10px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {addressOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute left-4 sm:left-16 top-14 z-50 w-64 bg-white text-zinc-900 rounded-xl shadow-xl border border-zinc-200 overflow-hidden"
            >
              {["Koramangala, Bengaluru", "HSR Layout, Bengaluru", "Indiranagar, Bengaluru"].map((a) => (
                <button
                  key={a}
                  type="button"
                  className="w-full text-left px-4 py-3 text-sm hover:bg-zinc-50 cursor-pointer border-0 bg-transparent"
                  onClick={() => {
                    setAddress(a);
                    setAddressOpen(false);
                  }}
                >
                  {a}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/10"
            >
              <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search bowls, salads, wraps…"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white text-zinc-900 text-sm outline-none"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {sortOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute right-4 sm:right-20 top-14 z-50 w-52 bg-white text-zinc-900 rounded-xl shadow-xl border border-zinc-200 overflow-hidden"
            >
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`w-full text-left px-4 py-2.5 text-sm cursor-pointer border-0 ${
                    sortBy === opt ? "bg-emerald-50 text-emerald-900 font-semibold" : "bg-transparent hover:bg-zinc-50"
                  }`}
                  onClick={() => {
                    setSortBy(opt);
                    setSortOpen(false);
                  }}
                >
                  {opt}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero — cleaner split */}
      <section className="relative bg-white overflow-hidden border-b border-zinc-100">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 min-h-[300px] sm:min-h-[340px]">
          <div className="flex flex-col justify-center px-6 sm:px-10 lg:px-12 py-10 sm:py-12 order-2 md:order-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
              >
                <p className="text-sm sm:text-[15px] text-zinc-500 font-medium">{current.eyebrow}</p>
                <h1 className="mt-1.5 text-4xl sm:text-5xl font-bold text-zinc-950 tracking-tight leading-[1.05]">
                  {current.title}
                </h1>
                <p className="mt-3 text-[15px] sm:text-base text-zinc-600 max-w-sm leading-relaxed">
                  {current.subtitle}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("order-items")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="mt-6 inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#059669] text-white text-sm font-bold tracking-wide hover:bg-[#047857] cursor-pointer border-0 shadow-lg shadow-emerald-800/15"
                >
                  Order now
                </button>
              </motion.div>
            </AnimatePresence>
            <div className="mt-8 flex items-center gap-3">
              <button
                type="button"
                aria-label="Previous"
                onClick={() => setSlide((s) => (s - 1 + SLIDES.length) % SLIDES.length)}
                className="w-9 h-9 rounded-full border border-zinc-200 bg-white flex items-center justify-center hover:bg-zinc-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-1.5">
                {SLIDES.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-label={`Slide ${i + 1}`}
                    onClick={() => setSlide(i)}
                    className={`h-1.5 rounded-full border-0 cursor-pointer transition-all ${
                      i === slide ? "w-6 bg-[#059669]" : "w-1.5 bg-zinc-300"
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label="Next"
                onClick={() => setSlide((s) => (s + 1) % SLIDES.length)}
                className="w-9 h-9 rounded-full border border-zinc-200 bg-white flex items-center justify-center hover:bg-zinc-50 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative order-1 md:order-2 min-h-[220px] sm:min-h-[280px] md:min-h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                <LazyImage
                  src={current.image}
                  alt=""
                  className="w-full h-full object-cover"
                  wrapperClassName="w-full h-full"
                  priority
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent md:bg-gradient-to-l md:from-transparent md:via-transparent md:to-white/40" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Category pills */}
      <div className="sticky top-14 sm:top-[58px] z-40 bg-[#FAFAF9]/95 backdrop-blur-md border-b border-zinc-200/80">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 px-3.5 py-2 rounded-full text-[13px] whitespace-nowrap cursor-pointer border transition-colors ${
                    active
                      ? "bg-zinc-950 text-white border-zinc-950 font-semibold"
                      : "bg-white text-zinc-700 border-zinc-200 font-medium hover:border-zinc-300"
                  }`}
                >
                  {cat.label}
                  <span className={`ml-1.5 ${active ? "text-white/70" : "text-zinc-400"}`}>
                    {categoryCounts[cat.id] || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Items */}
      <div id="order-items" className="max-w-[1200px] mx-auto px-4 sm:px-6 py-7 sm:py-9 pb-28">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight">{activeCatLabel}</h2>
            <p className="mt-0.5 text-sm text-zinc-500">{visibleItems.length} items</p>
          </div>
          {sortBy !== "All" && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              {sortBy}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {visibleItems.map((item) => {
            const inCart = cart.find((l) => l.id === item.id);
            const flash = justAdded === item.id;
            return (
              <article
                key={item.id}
                className="group h-full bg-white border border-zinc-200/90 rounded-2xl overflow-hidden flex flex-col shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-zinc-300 transition-all"
              >
                <div className="relative aspect-[4/3] shrink-0 bg-zinc-100 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setDetailItem(item)}
                    className="absolute inset-0 border-0 p-0 cursor-pointer bg-transparent"
                    aria-label={`View ${item.name}`}
                  >
                    <LazyImage
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      wrapperClassName="w-full h-full"
                    />
                  </button>
                  <span
                    className={`absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold shadow-sm ${
                      item.isVeg ? "text-emerald-700" : "text-red-700"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? "bg-emerald-600" : "bg-red-600"}`}
                    />
                    {item.isVeg ? "Veg" : "Non-veg"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setLiked((p) => ({ ...p, [item.id]: !p[item.id] }))}
                    className="absolute right-2.5 top-2.5 w-8 h-8 rounded-full bg-white/95 shadow-sm flex items-center justify-center cursor-pointer"
                    aria-label="Favorite"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        liked[item.id] ? "fill-emerald-500 text-emerald-500" : "text-zinc-400"
                      }`}
                      strokeWidth={2.25}
                    />
                  </button>
                </div>

                <div className="relative flex flex-1 flex-col px-3 pt-3 pb-3.5 min-h-[96px]">
                  <button
                    type="button"
                    onClick={() => setDetailItem(item)}
                    className="text-left bg-transparent border-0 p-0 cursor-pointer pr-10"
                  >
                    <h3 className="text-[13px] sm:text-sm font-bold text-zinc-900 leading-snug line-clamp-2 min-h-[2.4rem]">
                      {item.name}
                    </h3>
                  </button>
                  <p className="mt-1.5 text-sm font-semibold text-zinc-800">₹{item.price}</p>

                  {inCart ? (
                    <div className="absolute bottom-3 right-3 flex items-center gap-0 rounded-lg bg-[#059669] text-white overflow-hidden shadow-sm">
                      <button
                        type="button"
                        className="w-8 h-8 flex items-center justify-center hover:bg-black/10 cursor-pointer border-0 bg-transparent"
                        onClick={() => setQty(item.id, inCart.qty - 1)}
                        aria-label="Decrease"
                      >
                        <Minus className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </button>
                      <span className="w-6 text-center text-xs font-bold">{inCart.qty}</span>
                      <button
                        type="button"
                        className="w-8 h-8 flex items-center justify-center hover:bg-black/10 cursor-pointer border-0 bg-transparent"
                        onClick={() => addToCart(item)}
                        aria-label="Increase"
                      >
                        <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => addToCart(item)}
                      className={`absolute bottom-3 right-3 w-9 h-9 rounded-lg text-white flex items-center justify-center shadow-sm cursor-pointer border-0 transition-transform ${
                        flash ? "scale-110" : ""
                      }`}
                      style={{ backgroundColor: ACCENT }}
                      aria-label={`Add ${item.name}`}
                    >
                      <Plus className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {visibleItems.length === 0 && (
          <div className="py-20 text-center">
            <ShoppingBag className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No items match your filters.</p>
          </div>
        )}
      </div>

      {/* Sticky cart pill */}
      <AnimatePresence>
        {cartCount > 0 && !cartOpen && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[80] w-[min(94%,440px)]"
          >
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="w-full flex items-center gap-3 rounded-2xl bg-zinc-950 text-white pl-4 pr-3 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.28)] cursor-pointer border-0"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#059669] text-sm font-bold">
                {cartCount}
              </span>
              <span className="flex-1 text-left">
                <span className="block text-sm font-bold leading-tight">View cart</span>
                <span className="block text-[11px] text-white/60">
                  {cartCount} item{cartCount > 1 ? "s" : ""} · ready to checkout
                </span>
              </span>
              <span className="text-sm font-bold pr-1">₹{cartTotal}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                <ShoppingCart className="w-4 h-4" />
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart drawer — desktop side panel / mobile bottom sheet */}
      <AnimatePresence>
        {cartOpen && (
          <div className="fixed inset-0 z-[90]">
            <motion.button
              type="button"
              aria-label="Close cart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-[2px] border-0 cursor-pointer"
              onClick={() => setCartOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="absolute right-0 top-0 bottom-0 w-full sm:max-w-[420px] bg-white shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">Your cart</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {cartCount === 0 ? "Add something delicious" : `${cartCount} item${cartCount > 1 ? "s" : ""}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center cursor-pointer border-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                {cart.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
                      <ShoppingBag className="w-6 h-6 text-zinc-400" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-800">Cart is empty</p>
                    <p className="text-xs text-zinc-500 mt-1">Browse the menu and tap + to add items.</p>
                    <button
                      type="button"
                      onClick={() => setCartOpen(false)}
                      className="mt-5 text-sm font-bold text-[#059669] cursor-pointer border-0 bg-transparent"
                    >
                      Continue browsing
                    </button>
                  </div>
                ) : (
                  <>
                  <ul className="space-y-3">
                    {cart.map((line) => (
                      <li
                        key={line.id}
                        className="flex gap-3 p-3 rounded-2xl border border-zinc-100 bg-zinc-50/60"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-200 shrink-0">
                          <img src={line.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-zinc-900 line-clamp-2 leading-snug">{line.name}</p>
                          <p className="mt-1 text-sm font-semibold text-zinc-700">
                            ₹{line.price}
                            {line.qty > 1 && (
                              <span className="text-zinc-400 font-medium"> · ₹{line.price * line.qty}</span>
                            )}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="inline-flex items-center rounded-lg border border-zinc-200 bg-white overflow-hidden">
                              <button
                                type="button"
                                className="w-8 h-8 flex items-center justify-center hover:bg-zinc-50 cursor-pointer border-0 bg-transparent"
                                onClick={() => setQty(line.id, line.qty - 1)}
                              >
                                {line.qty === 1 ? (
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                ) : (
                                  <Minus className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <span className="w-7 text-center text-xs font-bold">{line.qty}</span>
                              <button
                                type="button"
                                className="w-8 h-8 flex items-center justify-center hover:bg-zinc-50 cursor-pointer border-0 bg-transparent"
                                onClick={() => setQty(line.id, line.qty + 1)}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Add-ons below order */}
                  <div className="mt-6 pt-5 border-t border-zinc-100">
                    <div className="mb-3">
                      <h4 className="text-sm font-bold text-zinc-950">Add-ons</h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Complete your meal with extras</p>
                    </div>
                    <div className="space-y-2.5">
                      {CART_ADDONS.map((addon) => {
                        const inCart = cart.find((l) => l.id === addon.id);
                        return (
                          <div
                            key={addon.id}
                            className="flex items-center gap-3 p-2.5 rounded-xl border border-zinc-100 bg-white"
                          >
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-100 shrink-0">
                              <img src={addon.image} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-zinc-900 truncate">{addon.name}</p>
                              <p className="text-xs font-medium text-zinc-600 mt-0.5">₹{addon.price}</p>
                            </div>
                            {inCart ? (
                              <div className="inline-flex items-center rounded-lg bg-[#059669] text-white overflow-hidden shrink-0">
                                <button
                                  type="button"
                                  className="w-7 h-7 flex items-center justify-center hover:bg-black/10 cursor-pointer border-0 bg-transparent"
                                  onClick={() => setQty(addon.id, inCart.qty - 1)}
                                  aria-label="Decrease addon"
                                >
                                  <Minus className="w-3 h-3" strokeWidth={2.5} />
                                </button>
                                <span className="w-5 text-center text-[11px] font-bold">{inCart.qty}</span>
                                <button
                                  type="button"
                                  className="w-7 h-7 flex items-center justify-center hover:bg-black/10 cursor-pointer border-0 bg-transparent"
                                  onClick={() => addToCart(addon)}
                                  aria-label="Increase addon"
                                >
                                  <Plus className="w-3 h-3" strokeWidth={2.5} />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => addToCart(addon)}
                                className="shrink-0 px-3 py-1.5 rounded-lg border border-[#059669] text-[#059669] text-xs font-bold hover:bg-emerald-50 cursor-pointer bg-white"
                              >
                                + Add
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  </>
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-zinc-100 px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-3 bg-white">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Subtotal</span>
                    <span className="font-bold text-zinc-950">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Delivery</span>
                    <span className="font-semibold text-emerald-700">Calculated at checkout</span>
                  </div>
                  <div className="pt-2 border-t border-zinc-100 flex justify-between items-center">
                    <span className="text-base font-bold text-zinc-950">Total</span>
                    <span className="text-xl font-bold text-zinc-950">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    First-time tiffin security deposit (₹299) may apply at checkout.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem("taaza_order_now_cart", JSON.stringify(cart));
                      setCartOpen(false);
                      setAuthOpen(true);
                    }}
                    className="w-full py-3.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm cursor-pointer border-0 shadow-lg shadow-emerald-800/15"
                  >
                    Continue to checkout
                  </button>
                </div>
              )}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Detail modal */}
      <AnimatePresence>
        {detailItem && (
          <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.button
              type="button"
              aria-label="Close"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/55 border-0 cursor-pointer"
              onClick={() => setDetailItem(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="aspect-[16/11] bg-zinc-100 relative">
                <LazyImage
                  src={detailItem.image}
                  alt={detailItem.name}
                  className="w-full h-full object-cover"
                  wrapperClassName="w-full h-full"
                />
                <button
                  type="button"
                  onClick={() => setDetailItem(null)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center cursor-pointer border-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 pb-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold text-zinc-950 leading-snug">{detailItem.name}</h3>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      detailItem.isVeg ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                    }`}
                  >
                    <Leaf className="w-3 h-3" />
                    {detailItem.isVeg ? "Veg" : "Non-veg"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{detailItem.description}</p>
                <p className="mt-4 text-xl font-bold text-zinc-950">₹{detailItem.price}</p>
                <button
                  type="button"
                  onClick={() => {
                    addToCart(detailItem, true);
                    setDetailItem(null);
                  }}
                  className="mt-4 w-full py-3.5 text-sm font-bold text-white bg-[#059669] hover:bg-[#047857] rounded-xl cursor-pointer border-0"
                >
                  Add to cart
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Side menu */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-[60]">
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 border-0 cursor-pointer"
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl p-5"
            >
              <div className="flex items-center justify-between mb-6">
                <Logo size="sm" />
                <button type="button" onClick={() => setMenuOpen(false)} className="cursor-pointer p-1 border-0 bg-transparent">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {[
                { label: "Home", path: "/" },
                { label: "Subscriptions", path: "/subscriptions" },
                { label: "Products", path: "/products" },
                { label: "Order Now", path: "/order" },
              ].map((l) => (
                <button
                  key={l.label}
                  type="button"
                  className="block w-full text-left py-3 text-sm font-medium border-b border-zinc-100 cursor-pointer bg-transparent"
                  onClick={() => {
                    setMenuOpen(false);
                    onNavigate(l.path);
                  }}
                >
                  {l.label}
                </button>
              ))}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <ShopAuthDrawer open={authOpen} onClose={() => setAuthOpen(false)} intent="profile" />
    </div>
  );
};

export default OrderNowPage;
