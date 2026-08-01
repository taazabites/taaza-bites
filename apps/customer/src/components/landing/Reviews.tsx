import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const REVIEWS = [
  {
    name: "Ananya Rao",
    role: "Senior Engineering Lead, Swiggy",
    text: "Before TaazaBites, my 3 PM meetings were a battle against brain fog. Now, my focus is incredibly flat and stable throughout the day. Love the Pure Veg options!",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fm=webp",
    rating: 5,
    tag: "Energy Focus"
  },
  {
    name: "Vikram Shenoy",
    role: "Partner, PeakXV Ventures",
    text: "The 30 Day Plan completely streamlined my nutrition routine. The morning delivery is absolutely punctual. Down 4.5kg in 4 weeks and my heart health is peaking.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fm=webp",
    rating: 5,
    tag: "Weight Loss"
  },
  {
    name: "Dr. Pooja Mahesh",
    role: "Clinical Dietitian",
    text: "As a professional, I highly screen what goes into my meals. TaazaBites uses premium cold-pressed oils and maintains verified protein-to-carb ratios that are genuinely health-first.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fm=webp",
    rating: 5,
    tag: "Expert Pick"
  }
];

const TRANSFORMATIONS = [
  {
    name: "Rahul M.",
    result: "Lost 14kg in 12 Weeks",
    before: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400",
    after: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=400",
    desc: "Rahul switched to our Muscle Gain plan and focused on consistent clean eating."
  },
  {
    name: "Sanya K.",
    result: "Reversed PCOS Symptoms",
    before: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=400",
    after: "https://images.unsplash.com/photo-1494597564530-897f5a21bc9a?auto=format&fit=crop&q=80&w=400",
    desc: "Sanya followed our Anti-Inflammatory Low Carb plan for 4 months."
  }
];

export default function Reviews() {
  return (
    <section className="py-24 bg-zinc-50 border-t border-zinc-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-emerald-600 font-black uppercase tracking-widest text-xs px-3.5 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">Social Proof</span>
          <h2 className="text-4xl md:text-6xl font-black text-zinc-950 tracking-tighter mt-4 mb-4">
            Real People. <span className="text-emerald-600">Real Results.</span>
          </h2>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto font-medium">
            Join 15,000+ members in Bengaluru who have transformed their lives with Taaza Bites.
          </p>
        </div>

        {/* Transformations Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {TRANSFORMATIONS.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-[3rem] border border-zinc-200 shadow-sm flex flex-col md:flex-row gap-8"
            >
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div className="relative">
                   <img src={item.before} alt="Before" className="w-full h-48 object-cover rounded-2xl grayscale" />
                   <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-[10px] font-black uppercase rounded">Before</div>
                </div>
                <div className="relative">
                   <img src={item.after} alt="After" className="w-full h-48 object-cover rounded-2xl" />
                   <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase rounded">After</div>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                 <h4 className="text-2xl font-black text-zinc-900 mb-1">{item.name}</h4>
                 <p className="text-emerald-600 font-black uppercase tracking-widest text-xs mb-3">{item.result}</p>
                 <p className="text-zinc-500 text-sm font-medium leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Google Reviews Badge */}
        <div className="flex flex-col items-center mb-12">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-2xl shadow-sm mb-4">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-5 h-5" />
                <div className="flex gap-1 text-amber-400">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
                </div>
                <span className="text-sm font-black text-zinc-900">4.9/5 on Google</span>
            </div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">Based on 2,500+ Verified reviews</p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {REVIEWS.map((rev, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-[2.5rem] border border-zinc-200/60 p-8 shadow-sm flex flex-col relative overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(rev.rating)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{rev.tag}</span>
              </div>

              <p className="text-zinc-600 text-sm leading-relaxed mb-8 flex-grow italic relative z-10">
                "{rev.text}"
              </p>

              <div className="flex items-center gap-4 border-t border-zinc-100 pt-6 mt-auto">
                <img
                  referrerPolicy="no-referrer"
                  src={rev.image}
                  alt={rev.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-zinc-100 shadow-sm"
                  loading="lazy"
                />
                <div>
                  <h4 className="font-extrabold text-zinc-900 text-sm tracking-tight">{rev.name}</h4>
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">{rev.role}</p>
                </div>
              </div>
              <Quote className="absolute top-6 right-6 w-16 h-16 text-zinc-100/60 stroke-[1] -z-10" />
            </motion.div>
          ))}
        </div>

        {/* Video Testimonials Section */}
        <div className="mb-24">
            <h3 className="text-2xl font-black text-zinc-950 text-center mb-12">Video Testimonials</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { name: "Priya S.", result: "Weight Loss Journey", img: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=400" },
                    { name: "Amit K.", result: "Muscle Gain Results", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400" },
                    { name: "Kiran R.", result: "PCOS Recovery Story", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400" }
                ].map((item, i) => (
                    <div key={i} className="group relative rounded-[2rem] overflow-hidden aspect-[9/16] cursor-pointer">
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
                                    <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1" />
                                </div>
                                <div>
                                    <p className="text-white font-black text-sm">{item.name}</p>
                                    <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">{item.result}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Partnerships & Corporate */}
        <div className="border-t border-zinc-200 pt-16 text-center">
           <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 mb-8">Trusted by Bengaluru's Best</p>
           <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale mb-12">
              <span className="text-2xl font-black tracking-tighter">SWIGGY</span>
              <span className="text-2xl font-black tracking-tighter">GOLDMAN SACHS</span>
              <span className="text-2xl font-black tracking-tighter">CULT.FIT</span>
              <span className="text-2xl font-black tracking-tighter">GOOGLE</span>
              <span className="text-2xl font-black tracking-tighter">UBER</span>
           </div>
           
           <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 opacity-30 grayscale">
              <span className="text-sm font-black uppercase tracking-widest">Golds Gym</span>
              <span className="text-sm font-black uppercase tracking-widest">Apple Fitness</span>
              <span className="text-sm font-black uppercase tracking-widest">Volt Gym</span>
              <span className="text-sm font-black uppercase tracking-widest">Zivaya Spa</span>
           </div>
        </div>
      </div>
    </section>
  );
}
