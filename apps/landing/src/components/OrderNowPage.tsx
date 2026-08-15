/**
 * Order Now — black nav, hero image slider, category strip, item cards.
 * Layout matches the provided Order Now reference screenshots.
 */
import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Menu,
  Plus,
  Search,
  ShoppingCart,
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

const SLIDES = [
  {
    id: 1,
    eyebrow: "are you hungry?",
    title: "Don't Wait",
    subtitle: "Get 1 free delivery when you order healthy food.",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: 2,
    eyebrow: "fresh every day",
    title: "Eat Clean",
    subtitle: "Chef-crafted macro meals delivered to your door.",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: 3,
    eyebrow: "build your bowl",
    title: "Your Way",
    subtitle: "Customize proteins, sides and toppings in minutes.",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=900",
  },
];

const CATEGORIES: Category[] = [
  { id: "oats", label: "Healthy Oats Bowls" },
  { id: "protein-salad", label: "Protein Salad Bowls" },
  { id: "smoothie", label: "Signature Smoothie Bowls" },
  { id: "byb-proteins", label: "BUILD YOUR BOWL - Proteins" },
  { id: "omelet", label: "EPIC omelet" },
  { id: "desserts", label: "Healthy deserts" },
  { id: "nourish", label: "Nourish Bowls" },
  { id: "wraps", label: "Wraps & Sandwiches" },
];

const ITEMS: MenuItem[] = [
  { id: "o1", categoryId: "oats", name: "APPLE CINNAMON OATS BOWL", description: "Premium rolled oats soaked overnight in almond milk and raw honey with cinnamon apples…", image: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 199 },
  { id: "o2", categoryId: "oats", name: "Avocado Overnight Oats", description: "Creamy overnight oats topped with sliced avocado, chia seeds and banana…", image: "https://images.unsplash.com/photo-1494597567531-9524ee7cfaa0?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 219 },
  { id: "o3", categoryId: "oats", name: "Black berry oats bowl", description: "Purple oat base loaded with blackberries, pomegranate and sliced banana…", image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 229 },
  { id: "o4", categoryId: "oats", name: "Blueberry Power Oats", description: "Antioxidant-rich blueberry oats with pomegranate, banana and seeds…", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 209 },
  { id: "o5", categoryId: "oats", name: "Peanut Butter Oats", description: "Protein oats blended with natural peanut butter and cacao nibs…", image: "https://images.unsplash.com/photo-1517093157656-b9eccef91eb1?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 239 },
  { id: "o6", categoryId: "oats", name: "Mango Turmeric Oats", description: "Golden oats with mango, turmeric and toasted coconut flakes…", image: "https://images.unsplash.com/photo-1623065422902-30a2d94beca3?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 249 },

  { id: "p1", categoryId: "protein-salad", name: "Grilled Chicken Salad", description: "Lean grilled chicken over mixed greens, cucumber and lemon dressing…", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&q=80&w=500", isVeg: false, price: 299 },
  { id: "p2", categoryId: "protein-salad", name: "Tofu Crunch Salad", description: "Crispy tofu, cabbage slaw, sesame and ginger soy dressing…", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 259 },
  { id: "p3", categoryId: "protein-salad", name: "Egg Power Salad", description: "Boiled eggs, avocado, greens and mustard yogurt dressing…", image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=500", isVeg: false, price: 279 },
  { id: "p4", categoryId: "protein-salad", name: "Chickpea Protein Bowl", description: "Roasted chickpeas, quinoa, herbs and tahini drizzle…", image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 269 },

  { id: "s1", categoryId: "smoothie", name: "Berry Blast Bowl", description: "Frozen berry blend topped with granola, banana and chia…", image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 199 },
  { id: "s2", categoryId: "smoothie", name: "Green Detox Bowl", description: "Spinach, pineapple, banana and coconut flakes…", image: "https://images.unsplash.com/photo-1623065422902-30a2d94beca3?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 219 },
  { id: "s3", categoryId: "smoothie", name: "Chocolate Protein Bowl", description: "Cacao smoothie base with peanut butter and cacao nibs…", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 229 },
  { id: "s4", categoryId: "smoothie", name: "Tropical Glow Bowl", description: "Mango and passionfruit with toasted coconut…", image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 209 },

  { id: "bp1", categoryId: "byb-proteins", name: "Grilled Chicken (150g)", description: "Lean grilled chicken breast portion for bowl building…", image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&q=80&w=500", isVeg: false, price: 239 },
  { id: "bp2", categoryId: "byb-proteins", name: "Paneer Cubes (120g)", description: "Soft paneer cubes lightly seasoned…", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 249 },
  { id: "bp3", categoryId: "byb-proteins", name: "Tofu Steak", description: "Pan-seared tofu steak with sesame…", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 299 },
  { id: "bp4", categoryId: "byb-proteins", name: "Boiled Eggs (2)", description: "Two perfectly boiled eggs…", image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&q=80&w=500", isVeg: false, price: 259 },

  { id: "e1", categoryId: "omelet", name: "Spinach Feta Omelet", description: "Egg white omelet with spinach and feta…", image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=500", isVeg: false, price: 279 },
  { id: "e2", categoryId: "omelet", name: "Mushroom Cheese Omelet", description: "Fluffy omelet with mushrooms and cheese…", image: "https://images.unsplash.com/photo-1608039829573-9870aba275e0?auto=format&fit=crop&q=80&w=500", isVeg: false, price: 269 },
  { id: "e3", categoryId: "omelet", name: "Veggie Loaded Omelet", description: "Peppers, onion, tomato and herbs…", image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=500", isVeg: false, price: 199 },

  { id: "d1", categoryId: "desserts", name: "Chia Pudding Cup", description: "Creamy chia pudding with berries and honey…", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 219 },

  { id: "n1", categoryId: "nourish", name: "Buddha Nourish Bowl", description: "Quinoa, roasted veggies and tahini…", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 229 },
  { id: "n2", categoryId: "nourish", name: "Mediterranean Bowl", description: "Olives, hummus, cucumber and greens…", image: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 209 },
  { id: "n3", categoryId: "nourish", name: "Teriyaki Tofu Bowl", description: "Tofu, rice and steamed greens…", image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 239 },
  { id: "n4", categoryId: "nourish", name: "Salmon Poke Bowl", description: "Salmon, rice, avocado and seaweed…", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&q=80&w=500", isVeg: false, price: 249 },

  { id: "w1", categoryId: "wraps", name: "Chicken Wrap", description: "Grilled chicken wrap with greens…", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=500", isVeg: false, price: 299 },
  { id: "w2", categoryId: "wraps", name: "Paneer Sandwich", description: "Grilled paneer in multigrain bread…", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 259 },
  { id: "w3", categoryId: "wraps", name: "Veggie Wrap", description: "Fresh veggies and hummus wrap…", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=500", isVeg: true, price: 279 },
];

const SORT_OPTIONS = [
  "All",
  "Veg",
  "Non-veg",
  "Price: Low to High",
  "Price: High to Low",
] as const;

export const OrderNowPage: React.FC<OrderNowPageProps> = ({ onNavigate }) => {
  const [slide, setSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState("oats");
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [cart, setCart] = useState<{ id: string; name: string; price: number; qty: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const cartCount = cart.reduce((n, l) => n + l.qty, 0);
  const cartTotal = cart.reduce((n, l) => n + l.price * l.qty, 0);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.id === item.id);
      if (existing) {
        return prev.map((l) => (l.id === item.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  };
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]>("All");
  const [addressOpen, setAddressOpen] = useState(false);
  const [address, setAddress] = useState("Change Address");
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);

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
    if (sortBy === "Price: Low to High") {
      list = [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === "Price: High to Low") {
      list = [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }, [activeCategory, query, sortBy]);

  const current = SLIDES[slide];

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans">
      {/* ===== 1. BLACK NAV BAR ===== */}
      <header className="sticky top-0 z-50 bg-black text-white">
        <div className="max-w-[1280px] mx-auto px-3 sm:px-5 h-14 sm:h-[60px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="p-1.5 hover:bg-white/10 rounded cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" strokeWidth={2} />
            </button>

            <button
              type="button"
              onClick={() => onNavigate("/")}
              className="shrink-0 cursor-pointer"
              aria-label="Home"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded bg-[#111] overflow-hidden flex items-center justify-center border border-white/10">
                <Logo showText={false} size="sm" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAddressOpen((v) => !v)}
              className="text-left min-w-0 cursor-pointer hover:opacity-90"
            >
              <span className="block text-[10px] sm:text-[11px] text-white/80 leading-none">
                Delivering To
              </span>
              <span className="mt-0.5 flex items-center gap-1 text-[13px] sm:text-[14px] font-bold leading-tight truncate max-w-[120px] sm:max-w-[200px]">
                {address}
                <ChevronDown className="w-3.5 h-3.5 shrink-0" />
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
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
                className="relative flex items-center gap-1.5 px-1.5 sm:px-2 py-1.5 rounded hover:bg-white/10 cursor-pointer"
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                <span className="hidden sm:inline text-[13px] font-medium">{label}</span>
                {label === "Cart" && cartCount > 0 && (
                  <span className="absolute -top-0.5 right-0 min-w-[16px] h-4 px-1 rounded-full bg-[#059669] text-[10px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Address dropdown */}
        <AnimatePresence>
          {addressOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute left-3 sm:left-16 top-14 z-50 w-64 bg-white text-zinc-900 rounded-lg shadow-xl border border-zinc-200 overflow-hidden"
            >
              {["Koramangala, Bengaluru", "HSR Layout, Bengaluru", "Indiranagar, Bengaluru"].map(
                (a) => (
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
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search row */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/10"
            >
              <div className="max-w-[1280px] mx-auto px-3 sm:px-5 py-3">
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search items…"
                  className="w-full h-10 px-4 rounded bg-white text-zinc-900 text-sm outline-none"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sort menu */}
        <AnimatePresence>
          {sortOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute right-3 sm:right-24 top-14 z-50 w-52 bg-white text-zinc-900 rounded-lg shadow-xl border border-zinc-200 overflow-hidden"
            >
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`w-full text-left px-4 py-2.5 text-sm cursor-pointer border-0 ${
                    sortBy === opt ? "bg-zinc-100 font-semibold" : "bg-transparent hover:bg-zinc-50"
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

      {/* ===== 2. HERO IMAGE SLIDER ===== */}
      <section className="relative bg-white overflow-hidden">
        <div className="relative max-w-[1280px] mx-auto min-h-[280px] sm:min-h-[340px] md:min-h-[380px]">
          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[280px] sm:min-h-[340px] md:min-h-[380px]">
            <div className="flex flex-col justify-center px-6 sm:px-10 lg:px-14 py-10 relative z-10 bg-white">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.35 }}
                >
                  <p className="text-[18px] sm:text-[22px] text-zinc-800 lowercase font-normal">
                    {current.eyebrow}
                  </p>
                  <h1 className="mt-1 text-[40px] sm:text-[52px] md:text-[56px] font-extrabold text-[#0B4D3A] leading-none tracking-tight">
                    {current.title}
                  </h1>
                  <p className="mt-3 sm:mt-4 text-[15px] sm:text-[17px] text-zinc-800 max-w-sm">
                    {current.subtitle}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("order-items")?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="mt-6 sm:mt-8 inline-flex items-center justify-center px-7 py-3 bg-[#0B4D3A] text-white text-sm font-bold uppercase tracking-wide hover:bg-[#093d2e] cursor-pointer border-0"
                  >
                    ORDER NOW
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative bg-[#0B4D3A] min-h-[220px] md:min-h-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent hidden md:block" />
              <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-30 bg-[radial-gradient(circle,_#fff_1px,_transparent_1px)] bg-[length:14px_14px]" />
              <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-10">
                <div className="relative w-[78%] max-w-[340px] aspect-square">
                  <div className="absolute -inset-4 bg-[#F59E0B] [clip-path:polygon(12%_8%,88%_0%,100%_35%,92%_88%,40%_100%,0%_70%,8%_30%)] opacity-90" />
                  <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                    <LazyImage
                      src={current.image}
                      alt=""
                      className="w-full h-full object-cover"
                      wrapperClassName="w-full h-full"
                      priority
                      fetchPriority="high"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => setSlide((s) => (s - 1 + SLIDES.length) % SLIDES.length)}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 shadow flex items-center justify-center cursor-pointer hover:bg-white"
          >
            <ChevronLeft className="w-6 h-6 text-zinc-800" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => setSlide((s) => (s + 1) % SLIDES.length)}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 shadow flex items-center justify-center cursor-pointer hover:bg-white"
          >
            <ChevronRight className="w-6 h-6 text-zinc-800" />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => setSlide(i)}
                className={`w-2 h-2 rounded-full cursor-pointer border-0 ${
                  i === slide ? "bg-[#0B4D3A]" : "bg-zinc-300"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3. CATEGORY STRIP ===== */}
      <div className="sticky top-14 sm:top-[60px] z-40 bg-[#EFEFEF] border-b border-zinc-200">
        <div className="max-w-[1280px] mx-auto px-3 sm:px-5 overflow-x-auto">
          <div className="flex items-stretch gap-0 min-w-max">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.id;
              const count = categoryCounts[cat.id] || 0;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`relative shrink-0 px-4 sm:px-5 py-3.5 text-[13px] sm:text-[14px] whitespace-nowrap cursor-pointer border-0 bg-transparent transition-colors ${
                    active
                      ? "text-zinc-950 font-bold"
                      : "text-zinc-700 font-medium hover:text-zinc-950"
                  }`}
                >
                  {cat.label} ({count})
                  {active && (
                    <span className="absolute left-4 right-4 bottom-0 h-[2px] bg-zinc-900" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== 4. ITEMS — uniform cards (image / name / price / blue +) ===== */}
      <div id="order-items" className="max-w-[1280px] mx-auto px-3 sm:px-5 py-6 sm:py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {visibleItems.map((item) => (
            <article
              key={item.id}
              className="h-full bg-white border border-zinc-200 rounded-xl overflow-hidden flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
            >
              <div className="relative aspect-[4/3] shrink-0 bg-zinc-100 overflow-hidden">
                <LazyImage
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  wrapperClassName="w-full h-full"
                />
                <button
                  type="button"
                  onClick={() =>
                    setLiked((p) => ({ ...p, [item.id]: !p[item.id] }))
                  }
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 shadow flex items-center justify-center cursor-pointer"
                  aria-label="Favorite"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      liked[item.id]
                        ? "fill-emerald-500 text-emerald-500"
                        : "text-emerald-500"
                    }`}
                    strokeWidth={2.25}
                  />
                </button>
              </div>

              <div className="relative flex flex-1 flex-col px-3 pt-3 pb-3 min-h-[88px]">
                <button
                  type="button"
                  onClick={() => setDetailItem(item)}
                  className="text-left bg-transparent border-0 p-0 cursor-pointer"
                >
                  <h3 className="text-[13px] sm:text-[14px] font-bold text-zinc-900 leading-snug line-clamp-2 min-h-[2.5rem]">
                    {item.name}
                  </h3>
                </button>
                <p className="mt-1 text-[13px] sm:text-[14px] font-medium text-zinc-700">
                  ₹{item.price.toFixed(2)}
                </p>
                <button
                  type="button"
                  onClick={() => addToCart(item)}
                  className="absolute bottom-3 right-3 w-9 h-9 rounded-md bg-[#2563eb] text-white flex items-center justify-center shadow-sm hover:bg-[#1d4ed8] cursor-pointer"
                  aria-label={`Add ${item.name} to cart`}
                >
                  <Plus className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </div>
            </article>
          ))}
        </div>

        {visibleItems.length === 0 && (
          <p className="text-center text-zinc-500 py-16 text-sm">No items in this category.</p>
        )}
      </div>

      {/* Side menu drawer */}
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
                <button type="button" onClick={() => setMenuOpen(false)} className="cursor-pointer p-1">
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

      {/* View More modal */}
      <AnimatePresence>
        {detailItem && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.button
              type="button"
              aria-label="Close"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 border-0 cursor-pointer"
              onClick={() => setDetailItem(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative bg-white w-full max-w-md rounded-lg overflow-hidden shadow-2xl"
            >
              <div className="aspect-[4/3] bg-zinc-100">
                <LazyImage
                  src={detailItem.image}
                  alt={detailItem.name}
                  className="w-full h-full object-cover"
                  wrapperClassName="w-full h-full"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold uppercase">{detailItem.name}</h3>
                <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{detailItem.description}</p>
                <button
                  type="button"
                  onClick={() => {
                    addToCart(detailItem);
                    setDetailItem(null);
                    setCartOpen(true);
                  }}
                  className="mt-5 w-full py-3 text-sm font-bold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-lg cursor-pointer"
                >
                  Add to cart · ₹{detailItem.price.toFixed(2)}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sticky cart bar */}
      {cartCount > 0 && !cartOpen && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[80] w-[min(92%,420px)]">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="w-full flex items-center justify-between gap-3 rounded-2xl bg-zinc-950 text-white px-5 py-3.5 shadow-2xl cursor-pointer"
          >
            <span className="text-sm font-bold">{cartCount} item{cartCount > 1 ? "s" : ""}</span>
            <span className="text-sm font-semibold tracking-wide">View cart</span>
            <span className="text-sm font-bold">₹{cartTotal.toFixed(0)}</span>
          </button>
        </div>
      )}

      {/* Cart drawer */}
      <AnimatePresence>
        {cartOpen && (
          <div className="fixed inset-0 z-[90]">
            <motion.button
              type="button"
              aria-label="Close cart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 border-0 cursor-pointer"
              onClick={() => setCartOpen(false)}
            />
            <motion.aside
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <h3 className="text-lg font-bold">Your order</h3>
                <button type="button" onClick={() => setCartOpen(false)} className="p-2 rounded-full hover:bg-zinc-100 cursor-pointer border-0 bg-transparent">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {cart.length === 0 ? (
                  <p className="text-sm text-zinc-500 text-center py-10">Cart is empty</p>
                ) : (
                  cart.map((line) => (
                    <div key={line.id} className="flex items-center justify-between gap-3 py-2 border-b border-zinc-100">
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{line.name}</p>
                        <p className="text-xs text-zinc-500">₹{line.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="w-8 h-8 rounded-lg border border-zinc-200 text-sm font-bold cursor-pointer bg-white"
                          onClick={() =>
                            setCart((prev) =>
                              prev
                                .map((l) => (l.id === line.id ? { ...l, qty: l.qty - 1 } : l))
                                .filter((l) => l.qty > 0)
                            )
                          }
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-bold">{line.qty}</span>
                        <button
                          type="button"
                          className="w-8 h-8 rounded-lg border border-zinc-200 text-sm font-bold cursor-pointer bg-white"
                          onClick={() =>
                            setCart((prev) =>
                              prev.map((l) => (l.id === line.id ? { ...l, qty: l.qty + 1 } : l))
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className="p-5 border-t space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500 font-medium">Subtotal</span>
                    <span className="font-bold">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    First-time tiffin security deposit (₹299 dummy) may apply at checkout.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem("taaza_order_now_cart", JSON.stringify(cart));
                      setCartOpen(false);
                      setAuthOpen(true);
                    }}
                    className="w-full py-3.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm cursor-pointer border-0"
                  >
                    Continue to checkout
                  </button>
                </div>
              )}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <ShopAuthDrawer open={authOpen} onClose={() => setAuthOpen(false)} intent="profile" />
    </div>
  );
};

export default OrderNowPage;
