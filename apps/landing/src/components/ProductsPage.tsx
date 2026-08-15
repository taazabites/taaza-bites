/**
 * Products catalog page — category sidebar + meal cards (Buy Once / Subscribe).
 */
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Percent, Search } from "lucide-react";
import { ShopTopNav } from "./ShopTopNav";
import { LazyImage } from "./LazyImage";

interface ProductsPageProps {
  onNavigate: (path: string) => void;
}

type CategoryId =
  | "breakfast"
  | "indian-home-style"
  | "fat-loss"
  | "cold-pressed"
  | "muscle-gain";

interface Category {
  id: CategoryId;
  label: string;
  image: string;
}

interface Product {
  id: string;
  categoryId: CategoryId;
  name: string;
  qty: number;
  image: string;
  subscribePrice: number;
  compareAt: number;
  buyOncePrice: number;
}

const CATEGORIES: Category[] = [
  {
    id: "breakfast",
    label: "Breakfast",
    image:
      "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "indian-home-style",
    label: "Indian Home Style Meals",
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "fat-loss",
    label: "Fat Loss",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "cold-pressed",
    label: "Cold Pressed Juices",
    image:
      "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: "muscle-gain",
    label: "Muscle Gain",
    image:
      "https://images.unsplash.com/photo-1532550907401-a532f99b7e18?auto=format&fit=crop&q=80&w=200",
  },
];

const PRODUCTS: Product[] = [
  {
    id: "veg-breakfast",
    categoryId: "breakfast",
    name: "veg breakfast",
    qty: 1,
    image:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=400",
    subscribePrice: 199,
    compareAt: 269,
    buyOncePrice: 259,
  },
  {
    id: "nonveg-breakfast",
    categoryId: "breakfast",
    name: "nonveg breakfast",
    qty: 1,
    image:
      "https://images.unsplash.com/photo-1608039829573-9870aba275e0?auto=format&fit=crop&q=80&w=400",
    subscribePrice: 199,
    compareAt: 269,
    buyOncePrice: 259,
  },
  {
    id: "thali-veg",
    categoryId: "indian-home-style",
    name: "veg home thali",
    qty: 1,
    image:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=400",
    subscribePrice: 229,
    compareAt: 299,
    buyOncePrice: 279,
  },
  {
    id: "thali-nonveg",
    categoryId: "indian-home-style",
    name: "nonveg home thali",
    qty: 1,
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=400",
    subscribePrice: 249,
    compareAt: 329,
    buyOncePrice: 299,
  },
  {
    id: "fat-loss-bowl",
    categoryId: "fat-loss",
    name: "fat loss bowl",
    qty: 1,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400",
    subscribePrice: 219,
    compareAt: 289,
    buyOncePrice: 269,
  },
  {
    id: "lean-plate",
    categoryId: "fat-loss",
    name: "lean protein plate",
    qty: 1,
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400",
    subscribePrice: 229,
    compareAt: 299,
    buyOncePrice: 279,
  },
  {
    id: "green-juice",
    categoryId: "cold-pressed",
    name: "green detox juice",
    qty: 1,
    image:
      "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&q=80&w=400",
    subscribePrice: 149,
    compareAt: 199,
    buyOncePrice: 179,
  },
  {
    id: "citrus-juice",
    categoryId: "cold-pressed",
    name: "citrus glow juice",
    qty: 1,
    image:
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&q=80&w=400",
    subscribePrice: 149,
    compareAt: 199,
    buyOncePrice: 179,
  },
  {
    id: "muscle-plate",
    categoryId: "muscle-gain",
    name: "muscle gain plate",
    qty: 1,
    image:
      "https://images.unsplash.com/photo-1532550907401-a532f99b7e18?auto=format&fit=crop&q=80&w=400",
    subscribePrice: 259,
    compareAt: 339,
    buyOncePrice: 309,
  },
  {
    id: "high-protein-bowl",
    categoryId: "muscle-gain",
    name: "high protein bowl",
    qty: 1,
    image:
      "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&q=80&w=400",
    subscribePrice: 249,
    compareAt: 329,
    buyOncePrice: 299,
  },
];

export const ProductsPage: React.FC<ProductsPageProps> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("breakfast");
  const [query, setQuery] = useState("");

  const activeLabel =
    CATEGORIES.find((c) => c.id === activeCategory)?.label ?? "Products";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      if (p.categoryId !== activeCategory) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q);
    });
  }, [activeCategory, query]);

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#1A1A1A] w-full">
      <ShopTopNav active="products" onNavigate={onNavigate} />

      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
        {/* Categories sidebar */}
        <aside className="lg:w-[280px] xl:w-[300px] shrink-0 bg-[#F5A623] lg:min-h-[calc(100vh-4rem)]">
          <div className="px-4 sm:px-5 pt-5 pb-4">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 mb-4">
              Categories
            </h2>
            <div className="flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 -mx-1 px-1">
              {CATEGORIES.map((cat) => {
                const selected = cat.id === activeCategory;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-3 min-w-[200px] lg:min-w-0 w-full text-left rounded-xl px-2.5 py-2 transition-all cursor-pointer border ${
                      selected
                        ? "bg-[#6B9F3C] border-[#6B9F3C] shadow-sm"
                        : "bg-white border-white/80 hover:bg-white/95"
                    }`}
                  >
                    <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-zinc-100">
                      <LazyImage
                        src={cat.image}
                        alt={cat.label}
                        className="w-full h-full object-cover"
                        wrapperClassName="w-full h-full"
                      />
                    </div>
                    <span
                      className={`text-sm font-semibold leading-snug ${
                        selected ? "text-zinc-900" : "text-zinc-800"
                      }`}
                    >
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main catalog */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              {activeLabel}
            </h1>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <label className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  className="w-full h-10 pl-9 pr-3 rounded-full bg-white border border-zinc-200 text-sm text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-[#6B9F3C] focus:ring-2 focus:ring-[#6B9F3C]/20"
                />
              </label>
              <button
                type="button"
                className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 hover:border-[#6B9F3C] cursor-pointer shrink-0"
                aria-label="Offers"
              >
                <Percent className="w-4 h-4" />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory + query}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5"
            >
              {filtered.map((product) => (
                <article
                  key={product.id}
                  className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-zinc-100/80 p-3 sm:p-4 flex gap-3 sm:gap-4"
                >
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-zinc-100">
                    <LazyImage
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      wrapperClassName="w-full h-full"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <h3 className="text-base sm:text-lg font-semibold text-zinc-900 capitalize leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-sm text-zinc-600 mt-0.5">{product.qty}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-base font-bold text-zinc-900">
                        ₹{product.subscribePrice}
                      </span>
                      <span className="text-sm text-zinc-400 line-through">
                        ₹{product.compareAt}
                      </span>
                    </div>

                    <div className="mt-auto pt-3 flex items-end gap-2 sm:gap-3">
                      <div className="relative flex-1">
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10 text-[10px] font-bold text-white bg-[#F5A623] px-1.5 py-0.5 rounded-sm whitespace-nowrap">
                          ₹{product.buyOncePrice}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            window.location.href = "/order";
                          }}
                          className="w-full h-9 sm:h-10 rounded-lg border-2 border-[#6B9F3C] text-[#6B9F3C] text-xs sm:text-sm font-semibold bg-white hover:bg-[#6B9F3C]/5 transition-colors cursor-pointer"
                        >
                          Buy Once
                        </button>
                      </div>
                      <div className="relative flex-1">
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10 text-[10px] font-bold text-zinc-900 bg-[#F5D76E] px-1.5 py-0.5 rounded-sm whitespace-nowrap">
                          ₹{product.subscribePrice}
                        </span>
                        <button
                          type="button"
                          onClick={() => onNavigate("/subscriptions")}
                          className="w-full h-9 sm:h-10 rounded-lg bg-[#6B9F3C] text-white text-xs sm:text-sm font-semibold hover:bg-[#5a8a32] transition-colors cursor-pointer shadow-sm"
                        >
                          Subscribe
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <p className="text-center text-zinc-500 py-16 text-sm">
              No products match your search in this category.
            </p>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductsPage;
