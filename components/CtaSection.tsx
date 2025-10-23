import React from 'react';

export const CtaSection: React.FC = () => {
  const imageUrl = "https://images.unsplash.com/photo-1542690439-23ac154211b8?ixlib=rb-4.0.3&fm=webp";
  return (
    <section 
      id="cta-section" 
      className="py-20 md:py-28 relative bg-black"
    >
      <img
        src={`${imageUrl}&w=1280&q=80`}
        srcSet={`${imageUrl}&w=640&q=80 640w, ${imageUrl}&w=1280&q=80 1280w, ${imageUrl}&w=1920&q=80 1920w`}
        sizes="100vw"
        loading="lazy"
        alt="A vibrant spread of healthy food ingredients"
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-zinc-900/70"></div>
      
      <div className="container mx-auto px-4 relative z-10 text-center text-white">
        <h2 className="text-4xl md:text-5xl font-bold font-iowan mb-4 leading-tight animate-on-scroll" data-animation="slide-fade-in-up" style={{textShadow: '0 3px 15px rgba(0,0,0,0.6)'}}>
          Ready for a Healthier You?
        </h2>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-white/80 animate-on-scroll" data-animation="slide-fade-in-up" data-stagger-delay="0.1s" style={{textShadow: '0 2px 8px rgba(0,0,0,0.5)'}}>
          Your journey to convenient, delicious, and healthy eating starts now. Let's make your wellness goals a reality, one meal at a time.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center animate-on-scroll" data-animation="slide-fade-in-up" data-stagger-delay="0.2s">
          <a href="https://taazabites.in/menu" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-[var(--primary)]/30 hover:scale-105 hover:shadow-2xl transition-all duration-300 text-lg ripple-effect">
            <i className="fas fa-bolt"></i> Order Now
          </a>
           <a href="#subscriptions" className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border border-white/30 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-black/20 hover:scale-105 hover:bg-white/20 hover:shadow-2xl transition-all duration-300 text-lg ripple-effect">
             <i className="fas fa-calendar-alt"></i> View Subscriptions
          </a>
          <a href="#corporate-booking" className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border border-white/30 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-black/20 hover:scale-105 hover:bg-white/20 hover:shadow-2xl transition-all duration-300 text-lg ripple-effect">
             <i className="fas fa-briefcase"></i> Corporate Plans
          </a>
        </div>
      </div>
    </section>
  );
};