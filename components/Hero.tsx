import React, { useState, useEffect } from 'react';

export const Hero: React.FC = () => {
  const [heroContent, setHeroContent] = useState({
    title: "Nourish Your Life, One Bite at a Time",
    btnText: "Order Now",
    iconClass: "fas fa-bolt"
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 8 && hour < 12) {
      setHeroContent({
        title: "Fuel Your Morning: Get a Healthy Lunch Delivered!",
        btnText: "Order Lunch Now",
        iconClass: "fas fa-utensils"
      });
    } else if (hour >= 12 && hour < 17) {
      setHeroContent({
        title: "Afternoon Energy Boost: Plan Your Dinner Ahead!",
        btnText: "Order Dinner Now",
        iconClass: "fas fa-concierge-bell"
      });
    } else if (hour >= 17 && hour < 22) {
      setHeroContent({
        title: "Finish Strong: High-Protein Meals for the Evening.",
        btnText: "Order Now",
        iconClass: "fas fa-fire"
      });
    }
  }, []);

  return (
    <section id="hero" className="relative h-screen flex items-center justify-center text-white text-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-4.0.3&fm=webp&w=1280&q=60"
          srcSet="https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-4.0.3&fm=webp&w=640&q=60 640w, https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-4.0.3&fm=webp&w=1280&q=60 1280w, https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-4.0.3&fm=webp&w=1920&q=60 1920w"
          sizes="100vw"
          alt="A healthy and colorful bowl of food with fresh ingredients"
          className="w-full h-full object-cover animate-ken-burns"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20"></div>
      </div>
      <div className="relative z-10 p-8 max-w-4xl">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-iowan mb-4 leading-tight animate-on-scroll" data-animation="slide-fade-in-up" style={{textShadow: '0 3px 15px rgba(0,0,0,0.6)'}}>
          {heroContent.title}
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-white/90 animate-on-scroll" data-animation="slide-fade-in-up" data-stagger-delay="0.1s" style={{textShadow: '0 2px 8px rgba(0,0,0,0.5)'}}>
          Experience chef-crafted, nutritionist-designed meals delivered to your doorstep in Bangalore. Fresh ingredients, perfect macros, and exceptional flavor.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-on-scroll" data-animation="slide-fade-in-up" data-stagger-delay="0.2s">
          <a href="https://taazabites.in/menu" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-[var(--primary)]/30 hover:scale-105 hover:shadow-2xl transition-all duration-300 text-lg ripple-effect">
            <i className={heroContent.iconClass}></i> {heroContent.btnText}
          </a>
          <a href="#corporate-booking" className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-lg border border-white/30 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-black/20 hover:scale-105 hover:bg-white/30 hover:shadow-2xl transition-all duration-300 text-lg ripple-effect">
             <i className="fas fa-briefcase"></i> Corporate Plans
          </a>
        </div>
      </div>
    </section>
  );
};