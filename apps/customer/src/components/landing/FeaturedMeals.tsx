import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PremiumMealGrid from './PremiumMealGrid';

const featuredMeals = [
  {
    id: "1",
    name: "Mediterranean Salmon Power Bowl",
    calories: 450,
    protein: 35,
    carbs: 25,
    fat: 18,
    description: "Grilled Atlantic salmon served over a bed of tri-color quinoa, roasted cherry tomatoes, and garden-fresh cucumber salad with a lemon-herb vinaigrette.",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fm=webp&fit=crop&q=80&w=800",
    rating: 4.9,
    price: 380,
    isSpecial: true
  },
  {
    id: "2",
    name: "Plant-Based Buddha Fuel",
    calories: 380,
    protein: 18,
    carbs: 45,
    fat: 12,
    description: "A nourishing blend of massaged kale, roasted sweet potatoes, chickpeas, and avocado slices topped with a creamy tahini-ginger dressing.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fm=webp&fit=crop&q=80&w=800",
    rating: 4.7,
    price: 320
  },
  {
    id: "3",
    name: "Slow-Roasted Lean Beef Stir-Fry",
    calories: 520,
    protein: 42,
    carbs: 30,
    fat: 15,
    description: "Grass-fed lean beef strips wok-tossed with seasonal bell peppers, snap peas, and fresh broccoli in a light ginger-soy reduction. High protein keto-friendly.",
    image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fm=webp&fit=crop&q=80&w=800",
    rating: 4.8,
    price: 450,
    isSpecial: true
  },
  {
    id: "4",
    name: "Classic Pesto Grilled Chicken",
    calories: 410,
    protein: 38,
    carbs: 20,
    fat: 14,
    description: "Tender grilled chicken breast marinated in homemade basil pesto, served with roasted asparagus and cauliflower mash.",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fm=webp&fit=crop&q=80&w=800",
    rating: 4.8,
    price: 350
  },
  {
    id: "5",
    name: "Spiced Chickpea Tikka Salad",
    calories: 340,
    protein: 15,
    carbs: 40,
    fat: 10,
    description: "Oven-roasted chickpeas in a mild tikka spice blend, combined with crisp romaine, pomegranate seeds, and toasted pumpkin seeds.",
    image: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fm=webp&fit=crop&q=80&w=800",
    rating: 4.6,
    price: 280
  },
  {
    id: "6",
    name: "Zesty Shrimp & Avocado Wraps",
    calories: 390,
    protein: 28,
    carbs: 35,
    fat: 16,
    description: "Grilled tiger prawns with avocado salsa, lime-pickled onions, and shredded cabbage in a high-fiber whole wheat wrap.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fm=webp&fit=crop&q=80&w=800",
    rating: 4.9,
    price: 420
  }
];

export default function FeaturedMeals() {
  const navigate = useNavigate();
  return (
    <section className="py-24 sm:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 md:mb-24 gap-6">
            <div className="max-w-2xl">
                <span className="text-[#2D6A4F] font-black uppercase tracking-[0.3em] text-xs mb-3 block">On the Menu</span>
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4">Chef's Featured Selection</h2>
                <p className="text-lg text-slate-500 font-medium">Discover our most popular nutritionist-approved dishes crafted to fuel your Bengaluru lifestyle.</p>
            </div>
            <button 
              onClick={() => navigate('/menu')}
              className="bg-slate-900 text-white py-4 px-8 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 cursor-pointer"
            >
                Explore Full Menu <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </button>
        </div>

        <PremiumMealGrid meals={featuredMeals} />
      </div>
    </section>
  );
}
