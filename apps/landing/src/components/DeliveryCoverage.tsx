import { WHATSAPP_NUMBER } from '../config';
import React, { useMemo } from 'react';
import { MapPin, Navigation, ShieldCheck } from 'lucide-react';

const DELIVERY_ZONES = [
  { name: 'HSR Layout', status: 'active', x: 65, y: 75 },
  { name: 'Koramangala', status: 'active', x: 55, y: 65 },
  { name: 'Sarjapur Road', status: 'active', x: 75, y: 80 },
  { name: 'Kasavanahalli', status: 'active', x: 70, y: 78 },
  { name: 'Haralur Road', status: 'active', x: 68, y: 72 },
  { name: 'Bellandur', status: 'active', x: 75, y: 65 },
  { name: 'Indiranagar', status: 'upcoming', x: 60, y: 45 },
  { name: 'BTM Layout', status: 'upcoming', x: 45, y: 75 },
  { name: 'Jayanagar', status: 'upcoming', x: 35, y: 70 },
  { name: 'JP Nagar', status: 'upcoming', x: 38, y: 80 },
  { name: 'Electronic City', status: 'active', x: 68, y: 92 },
  { name: 'Hebbal', status: 'upcoming', x: 48, y: 25 },
  { name: 'Yelahanka', status: 'upcoming', x: 45, y: 15 },
  { name: 'Whitefield', status: 'upcoming', x: 88, y: 45 },
  { name: 'KR Puram', status: 'upcoming', x: 80, y: 35 },
  { name: 'MG Road', status: 'upcoming', x: 52, y: 55 },
];

export const DeliveryCoverage = () => {
  const [activeZoneSlide, setActiveZoneSlide] = React.useState(0);
  const zoneContainerRef = React.useRef<HTMLDivElement>(null);

  const handleZoneScroll = () => {
    if (zoneContainerRef.current) {
      const { scrollLeft, clientWidth } = zoneContainerRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      setActiveZoneSlide(index);
    }
  };

  // Generate a map background background
  const gridLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i <= 100; i += 5) {
      lines.push(<line key={i + 'h'} x1="0" y1={i} x2="100" y2={i} stroke="currentColor" strokeWidth="0.1" className="text-white/5" />);
      lines.push(<line key={i + 'v'} x1={i} y1="0" x2={i} y2="100" stroke="currentColor" strokeWidth="0.1" className="text-white/5" />);
    }
    return lines;
  }, []);

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#0A0A0A] text-white relative overflow-hidden" aria-labelledby="coverage-heading">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#059669]/50 to-transparent"></div>
      
      {/* Abstract Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-50">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             {gridLines}
          </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Context Content */}
            <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium tracking-wide font-mono text-[#059669]">
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Namma Bengaluru</span>
                </div>
                
                <div className="space-y-4">
                    <h2 id="coverage-heading" className="text-4xl md:text-5xl font-bold tracking-tight text-white font-sans">
                        Hyper-Local.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#059669] to-[#34D399]">Always Fresh.</span>
                    </h2>
                    <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
                        We currently serve major tech corridors and residential hubs across Bengaluru. By keeping our delivery radius focused, we guarantee that every meal arrives at peak temperature and nutritional integrity.
                    </p>
                </div>

                {/* Desktop View: Grid Layout */}
                <div className="hidden sm:grid sm:grid-cols-2 gap-6 pt-6 border-t border-white/10">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-3 h-3 rounded-full bg-[#059669] shadow-[0_0_15px_rgba(5,150,105,0.8)]"></div>
                            <h3 className="font-semibold tracking-wide text-sm font-sans uppercase">Active Zones</h3>
                        </div>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            {DELIVERY_ZONES.filter(z => z.status === 'active').slice(0, 10).map(zone => (
                                <li key={zone.name} className="flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-[#059669]/60" />
                                    {zone.name}
                                </li>
                            ))}
                            <li className="text-xs text-gray-500 italic mt-2">+ and surrounding areas</li>
                        </ul>
                    </div>
                    <div>
                         <div className="flex items-center gap-3 mb-4">
                            <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                            <h3 className="font-semibold tracking-wide text-sm font-sans uppercase">Coming Soon</h3>
                        </div>
                        <ul className="space-y-2 text-gray-500 text-sm opacity-80">
                            {DELIVERY_ZONES.filter(z => z.status === 'upcoming').map(zone => (
                                <li key={zone.name} className="flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {zone.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Mobile View: Side-Sliding Cards Layout */}
                <div className="sm:hidden relative pt-6 border-t border-white/10 overflow-hidden w-full">
                    <div 
                        ref={zoneContainerRef}
                        onScroll={handleZoneScroll}
                        className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-4 px-4 pb-6 gap-6 scroll-smooth"
                    >
                        <div className="min-w-[85vw] flex-shrink-0 snap-center bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-3 h-3 rounded-full bg-[#059669] shadow-[0_0_15px_rgba(5,150,105,0.8)]"></div>
                                <h3 className="font-semibold tracking-wide text-sm font-sans uppercase">Active Zones</h3>
                            </div>
                            <ul className="space-y-2.5 text-gray-400 text-sm">
                                {DELIVERY_ZONES.filter(z => z.status === 'active').slice(0, 10).map(zone => (
                                    <li key={zone.name} className="flex items-center gap-2.5">
                                        <MapPin className="w-4 h-4 text-[#059669]" />
                                        {zone.name}
                                    </li>
                                ))}
                                <li className="text-xs text-gray-500 italic mt-2">+ and surrounding areas</li>
                            </ul>
                        </div>

                        <div className="min-w-[85vw] flex-shrink-0 snap-center bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                                <h3 className="font-semibold tracking-wide text-sm font-sans uppercase">Coming Soon</h3>
                            </div>
                            <ul className="space-y-2.5 text-gray-500 text-sm opacity-80">
                                {DELIVERY_ZONES.filter(z => z.status === 'upcoming').map(zone => (
                                    <li key={zone.name} className="flex items-center gap-2.5">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        {zone.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Dots indicator */}
                    <div className="flex items-center justify-center gap-2 mt-2">
                        {[0, 1].map((_, index) => (
                            <button 
                                key={index} 
                                onClick={() => {
                                    if(navigator.vibrate) navigator.vibrate(5);
                                    if(zoneContainerRef.current) {
                                        zoneContainerRef.current.scrollTo({
                                            left: index * zoneContainerRef.current.clientWidth,
                                            behavior: 'smooth'
                                        });
                                    }
                                }} 
                                className={`h-1.5 transition-all duration-500 rounded-full ${activeZoneSlide === index ? 'w-8 bg-[#059669]' : 'w-2 bg-gray-600'}`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="mt-8 p-4 rounded-xl border border-[#25D366]/20 bg-[#25D366]/5 flex items-start gap-4">
                    <div className="mt-0.5 text-xl">📍</div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-white">Not sure if we deliver to your area?</p>
                        <p className="text-sm text-gray-400">
                            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="text-[#25D366] hover:underline underline-offset-2">
                                Contact us on WhatsApp
                            </a> and we'll check availability.
                        </p>
                    </div>
                </div>
                
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex gap-4 mt-8">
                    <ShieldCheck className="w-6 h-6 text-[#059669] shrink-0" />
                    <p className="text-sm text-gray-400 leading-relaxed">
                        <strong className="text-white font-medium block mb-1">Temperature-Controlled Delivery</strong>
                        Our logistics network is optimized to deliver meals from our centralized cloud-kitchen within 15 minutes of preparation passing QC.
                    </p>
                </div>
            </div>

            {/* Stylized Map Visualizer */}
            <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square w-full max-w-2xl mx-auto rounded-[2rem] bg-[#0A0A0A] border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(5,150,105,0.1)]">
                 <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at center, #059669 0%, transparent 60%)' }}></div>
                 
                 {/* Map Grid Pattern */}
                 <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(#ffffff0a 1px, transparent 1px), linear-gradient(90deg, #ffffff0a 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                 <svg className="w-full h-full p-4 relative z-10" viewBox="0 0 100 100">
                    <defs>
                        <linearGradient id="route" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#34D399" stopOpacity="0" />
                            <stop offset="50%" stopColor="#34D399" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Stylized Bengaluru Geography Overlay */}
                    <g className="map-geography" opacity="0.4">
                        {/* Water Bodies */}
                        <path d="M 62 60 Q 65 58 68 60 Q 72 63 69 66 Q 64 65 62 60 Z" fill="#042f2e" /> {/* Bellandur Lake */}
                        <path d="M 58 68 Q 60 67 61 68 Q 62 70 59 70 Z" fill="#042f2e" /> {/* Agara Lake */}
                        <path d="M 56 48 Q 58 47 59 49 Q 58 51 55 50 Z" fill="#042f2e" /> {/* Ulsoor Lake */}
                        <path d="M 70 85 Q 72 83 74 86 Q 71 88 70 85 Z" fill="#042f2e" /> {/* Harlur Lake */}
                        
                        {/* Arterial Roads */}
                        <path d="M 45 75 Q 50 75 60 70 Q 75 60 78 45 Q 80 35 70 28 Q 55 25 48 25" fill="none" stroke="#262626" strokeWidth="0.8" /> {/* ORR */}
                        <path d="M 55 65 Q 50 75 60 85 Q 68 92 70 100" fill="none" stroke="#262626" strokeWidth="0.6" /> {/* Hosur Road */}
                        <path d="M 52 55 Q 60 45 80 35 Q 90 30 100 25" fill="none" stroke="#262626" strokeWidth="0.6" /> {/* Old Madras Road */}
                        <path d="M 60 70 Q 65 75 75 80 Q 80 82 90 85" fill="none" stroke="#262626" strokeWidth="0.6" /> {/* Sarjapur Road */}
                        <path d="M 35 70 Q 40 70 45 75 Q 55 80 60 85" fill="none" stroke="#262626" strokeWidth="0.6" /> {/* Bannerghatta Road */}
                    </g>

                    {/* Central Kitchen */}
                    <circle cx="70" cy="78" r="1.5" fill="#FF7A00" filter="url(#glow)" />
                    <circle cx="70" cy="78" r="4" fill="none" stroke="#FF7A00" strokeWidth="0.3" className="origin-[70px_78px] animate-ping opacity-60" style={{ animationDuration: '3s' }} />
                    <text x="70" y="74" fill="#FF7A00" fontSize="2.5" className="font-mono tracking-widest font-bold text-center" textAnchor="middle">HQ</text>

                    {/* Delivery Routes Connectors */}
                    {DELIVERY_ZONES.filter(z => z.status === 'active').map((zone, i) => (
                        <line 
                            key={`line-${i}`}
                            x1="70" y1="78" 
                            x2={zone.x} y2={zone.y} 
                            stroke="url(#route)" 
                            strokeWidth="0.4" 
                            strokeDasharray="1 1.5"
                            className="opacity-70"
                        />
                    ))}

                    {/* Plot Points */}
                    {DELIVERY_ZONES.map((zone, i) => (
                        <g key={i} className="group transition-transform duration-300 origin-center cursor-crosshair">
                            <circle 
                                cx={zone.x} 
                                cy={zone.y} 
                                r={zone.status === 'active' ? 1.2 : 0.8} 
                                fill={zone.status === 'active' ? '#34D399' : '#4B5563'} 
                                filter={zone.status === 'active' ? 'url(#glow)' : ''}
                                className={zone.status === 'active' ? 'hover:fill-white transition-colors duration-300' : ''}
                            />
                            {zone.status === 'active' && (
                                <circle 
                                    cx={zone.x} 
                                    cy={zone.y} 
                                    r="2.5" 
                                    fill="none" 
                                    stroke="#34D399" 
                                    strokeWidth="0.2" 
                                    className="origin-center animate-ping opacity-40" 
                                    style={{ animationDuration: `${2 + (i % 3)}s`, animationDelay: `${i * 0.2}s`, transformOrigin: `${zone.x}px ${zone.y}px` }}
                                />
                            )}
                            <text 
                                x={zone.x} 
                                y={zone.y + 4.5} 
                                fill={zone.status === 'active' ? '#ffffff' : '#6b7280'} 
                                fontSize="2" 
                                className={`font-sans font-semibold tracking-wider uppercase select-none pointer-events-none ${zone.status === 'active' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity duration-300'}`}
                                textAnchor="middle"
                            >
                                {zone.name}
                            </text>
                        </g>
                    ))}
                 </svg>
                 
                 <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                     <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg p-3 text-xs w-48 font-mono">
                         <div className="text-gray-500 mb-1">SYSTEM_STATUS</div>
                         <div className="text-[#059669] flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#059669] rounded-full animate-pulse"></div> ROUTES_ONLINE</div>
                     </div>
                 </div>
            </div>

        </div>
      </div>
    </section>
  );
};
