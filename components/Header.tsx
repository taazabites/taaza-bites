import React, { useState, useEffect, useCallback } from 'react';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const NavLink = ({ href, children, mode = 'dark' }: { href: string; children: React.ReactNode; mode?: 'dark' | 'light' }) => (
    <li>
      <a href={href} onClick={() => setIsMenuOpen(false)} className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 relative group ${mode === 'dark' ? 'text-zinc-700 hover:text-[var(--primary-dark)]' : 'text-white'}`}>
        {children}
         <span className={`absolute bottom-2 left-1/2 -translate-x-1/2 h-[2px] w-0 group-hover:w-1/2 transition-all duration-300 ${mode === 'light' ? 'bg-white' : 'bg-[var(--primary)]'}`}></span>
      </a>
    </li>
  );

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-2 bg-white/80 backdrop-blur-xl shadow-md border-b border-zinc-200/50' : 'py-4 bg-transparent'}`}>
        <div className="container mx-auto px-4">
          <nav className="flex justify-between items-center">
            <a href="#hero" className="flex items-center gap-2 text-3xl font-bold font-iowan transition-colors duration-300">
              <span className={isScrolled ? 'text-[var(--primary)]' : 'text-white'}>taaza</span>
              <span className={isScrolled ? 'text-[var(--accent-secondary)]' : 'text-white'}>bites</span>
              <sup className={`text-xs top-[-1em] ${isScrolled ? 'text-zinc-500' : 'text-white/80'}`}>™</sup>
            </a>
            <ul className="hidden lg:flex items-center gap-2">
              <NavLink href="#hero" mode={isScrolled ? 'dark' : 'light'}>Home</NavLink>
              <NavLink href="#menu" mode={isScrolled ? 'dark' : 'light'}>Menu</NavLink>
              <NavLink href="#subscriptions" mode={isScrolled ? 'dark' : 'light'}>Subscriptions</NavLink>
              <NavLink href="#corporate-booking" mode={isScrolled ? 'dark' : 'light'}>Corporate</NavLink>
              <NavLink href="#meal-planner" mode={isScrolled ? 'dark' : 'light'}>AI Planner</NavLink>
              <NavLink href="#nutrition-approach" mode={isScrolled ? 'dark' : 'light'}>Our Approach</NavLink>
            </ul>
            <div className="flex items-center gap-4">
              <a href="https://taazabites.in/menu" className={`hidden lg:inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 ripple-effect ${isScrolled ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white shadow-[var(--primary)]/30' : 'bg-white/20 backdrop-blur-sm border border-white/30 text-white shadow-black/20'}`}>
                <i className="fas fa-shopping-cart"></i> Order Now
              </a>
              <button onClick={toggleMenu} className={`lg:hidden text-2xl z-50 p-2 transition-colors duration-300 ${isScrolled || isMenuOpen ? 'text-[var(--primary-dark)]' : 'text-white'}`} aria-label="Toggle menu" aria-expanded={isMenuOpen}>
                <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={toggleMenu}
      ></div>

      {/* Mobile Menu Panel */}
      <div className={`fixed top-0 left-0 h-full w-4/5 max-w-sm bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <nav className="pt-24 px-6">
          <ul className="flex flex-col gap-2">
            <NavLink href="#hero">Home</NavLink>
            <NavLink href="#menu">Menu</NavLink>
            <NavLink href="#subscriptions">Subscriptions</NavLink>
            <NavLink href="#corporate-booking">Corporate</NavLink>
            <NavLink href="#meal-planner">AI Planner</NavLink>
            <NavLink href="#nutrition-approach">Our Approach</NavLink>
            <NavLink href="#about">About Us</NavLink>
            <NavLink href="#testimonials">Testimonials</NavLink>
            <NavLink href="#faq">FAQ</NavLink>
          </ul>
        </nav>
      </div>
    </>
  );
};