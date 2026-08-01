import { Star, Circle, Leaf, Award, ShieldCheck, MapPin, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useCarousel } from '../hooks/useCarousel';

const auditNodes = [
  {
    id: "STATS_01",
    title: "Orders Delivered",
    icon: Package,
    color: "yellow",
    metric: 150000,
    status: "Delivered",
    label: "MEALS",
    unit: "+",
    description: "Trusted by thousands across Bangalore for their daily nutritional needs."
  },
  {
    id: "STATS_02",
    title: "Fresh Meals Daily",
    icon: Leaf,
    color: "orange",
    metric: 100,
    status: "Fresh",
    label: "INGREDIENTS",
    unit: "%",
    description: "Prepared daily with locally sourced, premium quality ingredients."
  },
  {
    id: "STATS_03",
    title: "Nutritionist Designed Plans",
    icon: Award,
    color: "red",
    metric: 100,
    status: "Verified",
    label: "BALANCED",
    unit: "%",
    description: "Scientifically structured macros to hit your exact dietary goals."
  },
  {
    id: "STATS_04",
    title: "Bangalore Delivery",
    icon: MapPin,
    color: "blue",
    metric: 100,
    status: "Active",
    label: "COVERAGE",
    unit: "%",
    description: "Extensive delivery network covering primary hubs in Bangalore."
  }
];

const ProtocolCard: React.FC<{ node: typeof auditNodes[0]; index: number; isActive: boolean }> = ({ node, index, isActive }) => {
  const [val, setVal] = useState(node.metric);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setVal(prev => {
        if (node.id === 'STATS_01') return 150000 + Math.floor(Math.random() * 5);
        if (node.id === 'STATS_02' || node.id === 'STATS_03' || node.id === 'STATS_04') return 100;
        return prev;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isActive, node.id]);

  const colorMap: Record<string, string> = {
    yellow: 'text-yellow-600 bg-yellow-50/50 border-yellow-100',
    orange: 'text-[#FF7A00] bg-[#FF7A00]/10 border-[#FF7A00]/20',
    red: 'text-red-500 bg-red-50/50 border-red-100',
    blue: 'text-blue-500 bg-blue-50/50 border-blue-100'
  };

  return (
    <div className={`bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10 border transition-all duration-500 group animate-on-scroll h-full flex flex-col relative overflow-hidden ${isActive ? 'border-[#FF7A00]/20 shadow-xl lg:hover:shadow-2xl lg:hover:-translate-y-1 scale-100 opacity-100' : 'border-gray-100 opacity-80 scale-[0.96] lg:scale-[0.98]'}`} data-animation="slide-fade-in-up" data-stagger-delay={`${index * 0.1}s`}>
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] [background-size:20px_20px]"></div>

      <div className="flex justify-between items-start mb-6 sm:mb-8 relative z-10">
        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-sm transition-all duration-500 ${isActive ? 'rotate-0 scale-100' : '-rotate-12'} ${colorMap[node.color]}`}>
          <node.icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      <h3 className="text-xl sm:text-2xl font-sans font-extrabold text-[#1A1A1A] mb-3 sm:mb-4 relative z-10 tracking-tight uppercase">{node.title}</h3>
      <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-8 sm:mb-10 flex-grow relative z-10 font-light">{node.description}</p>

      <div className="pt-6 sm:pt-8 border-t border-gray-100 flex items-end justify-between relative z-10">
          <div>
              <p className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 sm:mb-2 font-mono">{node.label}</p>
              <div className="flex items-baseline gap-1">
                <p className={`text-3xl sm:text-4xl font-mono font-light tracking-tighter ${colorMap[node.color].split(' ')[0]}`}>
                    {node.id === 'PROT_04' ? '±' : ''}{val}<span className="text-xs sm:text-sm ml-1 opacity-60">{node.unit}</span>
                </p>
              </div>
          </div>
          <div className="flex flex-col items-end gap-1 sm:gap-1.5 pb-0.5 sm:pb-1">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-gray-100">
                <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-orange-600 animate-pulse`}></div>
                <span className="text-[7px] sm:text-[9px] font-bold uppercase text-gray-700 tracking-widest font-mono">{node.status}</span>
              </div>
          </div>
      </div>
    </div>
  );
};

export const TrustBadges: React.FC = () => {
  const { scrollContainerRef, activeIndex, goToSlide, goToNext, goToPrevious, handlers } = useCarousel({ itemCount: auditNodes.length });

  return (
    <section id="standard" className="py-12 sm:py-32 bg-[#FFF8F0] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="text-center mb-10 sm:mb-24 flex flex-col items-center animate-on-scroll" data-animation="fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-5 sm:py-2 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/20 text-[#FF7A00] text-[8px] sm:text-[10px] font-bold uppercase tracking-widest mb-4 sm:mb-8 shadow-sm font-mono">
             <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FF7A00] animate-pulse shrink-0"/> OUR COMMITMENT
          </div>
          <h2 className="text-3xl sm:text-6xl lg:text-7xl font-sans font-extrabold text-[#1A1A1A] tracking-tight leading-[1.1] mb-3 sm:mb-6 uppercase">
            A Celebration of <br className="hidden sm:block"/>
            <span className="text-[#FF7A00] font-script normal-case tracking-normal">Quality.</span>
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto text-2xl sm:text-3xl font-script leading-relaxed px-2 sm:px-0 opacity-90">
            "Every meal is a festival of flavors, crafted with love."
          </p>
        </div>
 
        <div className="hidden lg:grid grid-cols-4 gap-6 mx-auto items-stretch">
          {auditNodes.map((node, i) => (
            <ProtocolCard key={node.id} node={node} index={i} isActive={true} />
          ))}
        </div>
 
        <div className="lg:hidden relative w-full">
          <div 
            ref={scrollContainerRef} 
            {...handlers}
            className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-4 px-4 pb-8 gap-4 sm:gap-6 scroll-smooth"
          >
            {auditNodes.map((node, i) => (
              <div key={node.id} className="w-[85vw] sm:w-[65vw] flex-shrink-0 snap-center">
                <ProtocolCard node={node} index={i} isActive={activeIndex === i} />
              </div>
            ))}
          </div>
 
          {/* Controls with indicators and chevrons */}
          <div className="flex items-center justify-center gap-4 mt-2 mb-6">
            <button
              onClick={goToPrevious}
              className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-[#FF7A00] hover:border-[#FF7A00]/20 active:scale-95 transition-all shadow-sm cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2">
              {auditNodes.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => goToSlide(i)} 
                  className={`transition-all duration-500 rounded-full h-1.5 cursor-pointer ${
                    activeIndex === i 
                      ? 'w-6 bg-[#FF7A00] ring-4 ring-[#FF7A00]/10' 
                      : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
 
            <button
              onClick={goToNext}
              className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-[#FF7A00] hover:border-[#FF7A00]/20 active:scale-95 transition-all shadow-sm cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
 
        <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-16 opacity-50 px-4 mt-8 lg:mt-24">
             {[
               { Icon: Award, label: 'FSSAI_CERT' },
               { Icon: Leaf, label: 'ISO_22000' },
               { Icon: ShieldCheck, label: 'HACCP_PASS' }
             ].map((cert, i) => (
               <div key={i} className="flex items-center gap-3 font-bold text-[10px] sm:text-xs uppercase tracking-widest text-gray-600 font-mono group hover:opacity-100 transition-opacity">
                  <cert.Icon className="w-4 h-4 text-orange-600 group-hover:scale-110 transition-transform" /> [{cert.label}]
               </div>
             ))}
        </div>
      </div>
    </section>
  );
};