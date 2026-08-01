import { ChevronDown, MessageCircle, Camera, Circle, Briefcase, Leaf, Heart } from 'lucide-react';
import { WHATSAPP_NUMBER, PORTAL_LINKS } from '../config';
import React, { useState } from "react";

interface FooterProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

interface FooterLinkProps {
  href: string;
  text: string;
  onNavigate: (page: string) => void;
}

const FooterLink: React.FC<FooterLinkProps> = ({ href, text, onNavigate }) => {
  const isExternal =
    href.startsWith("http") ||
    href.startsWith("mailto") ||
    href.startsWith("tel") ||
    href.startsWith("https://wa.me");
  const isPlaceholder = href === "#";

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isPlaceholder || isExternal) {
      if (isPlaceholder) e.preventDefault();
      return;
    }
    e.preventDefault();
    onNavigate(href);
  };

  return (
    <li>
      <a
        href={href}
        className={`block py-2 text-sm transition-colors duration-300 ${isPlaceholder ? "text-gray-500 cursor-default" : "text-gray-400 hover:text-[#059669]"}`}
        target={isExternal ? "_blank" : "_self"}
        rel={isExternal ? "noopener noreferrer" : ""}
        onClick={handleClick}
      >
        {text}
      </a>
    </li>
  );
};

const FooterLinkColumn: React.FC<{
  title: string;
  links: { href: string; text: string }[];
  onNavigate: (page: string) => void;
}> = ({ title, links, onNavigate }) => (
  <div>
    <h4 className="text-white font-bold mb-6 tracking-widest uppercase text-xs opacity-80">
      {title}
    </h4>
    <ul className="space-y-3">
      {links.map((link) => (
        <FooterLink
          key={link.text}
          href={link.href}
          text={link.text}
          onNavigate={onNavigate}
        />
      ))}
    </ul>
  </div>
);

const MobileAccordionColumn: React.FC<{
  title: string;
  links: { href: string; text: string }[];
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ title, links, onNavigate, isOpen, onToggle }) => {
  return (
    <div className="border-b border-white/10 pb-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left py-2"
      >
        <span className="text-white font-bold tracking-widest uppercase text-xs opacity-80">
          {title}
        </span>
        <ChevronDown
          className={`text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"}`}
      >
        <ul className="space-y-3 pl-2">
          {links.map((link) => (
            <FooterLink
              key={link.text}
              href={link.href}
              text={link.text}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export const Footer: React.FC<FooterProps> = ({ currentPage, onNavigate }) => {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const handleAccordionToggle = (title: string) => {
    setOpenAccordion(openAccordion === title ? null : title);
  };

  const quickLinks = [
    { href: "/", text: "Home" },
    { href: PORTAL_LINKS.subscribe, text: "Meal Plans" },
    { href: "/health-assessment", text: "Free Assessment" },
    { href: PORTAL_LINKS.order, text: "Our Menu" },
    { href: "/testimonials", text: "Reviews" },
    { href: "/blog", text: "Blog" },
    { href: "/about", text: "About Us" },
    { href: "/why-us", text: "Why Us" },
    { href: "/faq", text: "FAQ" },
    { href: `https://wa.me/${WHATSAPP_NUMBER}`, text: "Contact Us" },
  ];
  const servicesLinks = [
    { href: "/corporate-booking", text: "Corporate" },
    { href: "/why-us", text: "Why Us" },
    { href: "/nutrition-approach", text: "Nutrition" },
    { href: "/macro-calculator", text: "Macro Calculator" },
    { href: "/seo-strategy", text: "SEO Strategy" },
    { href: "/quality", text: "Quality" },
    { href: "/careers", text: "Careers" },
  ];
  const legalLinks = [
    { href: "/contact", text: "Contact Support" },
    { href: "/privacy", text: "Privacy Policy" },
    { href: "/terms", text: "Terms of Use" },
    { href: "/shipping", text: "Shipping Policy" },
    { href: "/refund", text: "Return and Refund" },
    { href: "/sitemap.xml", text: "Sitemap" },
    { href: PORTAL_LINKS.customerLogin, text: "Customer Login" },
    { href: PORTAL_LINKS.deliveryLogin, text: "Delivery Partner" },
    { href: PORTAL_LINKS.adminLogin, text: "Staff Login" },
  ];

  const topSearchesLinks = [
    { href: "/meal-delivery-hsr-layout", text: "Healthy Delivery HSR Layout" },
    { href: "/meal-delivery-koramangala", text: "Diet Meal Prep Koramangala" },
    { href: "/meal-delivery-whitefield", text: "Office Lunches Whitefield" },
    { href: "/meal-delivery-indiranagar", text: "High-Protein Indiranagar" },
    { href: "/meal-delivery-sarjapur-road", text: "Keto Subscriptions Sarjapur" },
    { href: "/meal-delivery-kasavanahalli", text: "Meal Prep Kasavanahalli" },
    { href: "/meal-delivery-haralur", text: "Diet Delivery Haralur" },
    { href: "/meal-delivery-bellandur", text: "Healthy Meals Bellandur" },
    { href: "/meal-delivery-marathahalli", text: "Food Delivery Marathahalli" },
    { href: "/meal-delivery-electronic-city", text: "Meal Subscriptions Electronic City" },
    { href: "/meal-delivery-jp-nagar", text: "Healthy Food JP Nagar" },
    { href: "/meal-delivery-jayanagar", text: "Diet Meal Plan Jayanagar" },
    { href: "/meal-delivery-btm-layout", text: "Office Lunch BTM Layout" },
    { href: "/meal-delivery-hebbal", text: "Fitness Food Hebbal" },
    { href: "/meal-delivery-yelahanka", text: "Healthy Delivery Yelahanka" },
    { href: "/meal-delivery-mahadevapura", text: "Keto Plan Mahadevapura" },
    { href: "/weight-loss-meal-plan-bangalore", text: "Weight Loss Diet Bangalore" },
    { href: "/high-protein-meals-bangalore", text: "High Protein Meals Bangalore" },
    { href: "/pcos-meal-plan-bangalore", text: "PCOS Diet Plan Bangalore" },
    { href: "/healthy-food-subscription-bangalore", text: "Healthy Food Subscription Bangalore" },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050505] pt-16 sm:pt-24 pb-28 lg:pb-12 border-t border-white/5 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#059669]/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 mb-12 sm:mb-20">
          {/* Brand Section */}
          <div className="lg:col-span-3">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("/");
              }}
              className="inline-block mb-6 sm:mb-8"
            >
              <span className="text-2xl sm:text-3xl font-serif font-light text-white tracking-tight">
                Taazabites<span className="text-[#059669]">.</span>
              </span>
            </a>
            <p className="text-gray-400 text-[13px] sm:text-sm font-light leading-relaxed mb-8 sm:mb-10 max-w-sm">
              Delivering fresh, chef-prepared healthy meals directly to your
              door. Nutrition made simple and delicious in Bangalore.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-[#059669] hover:text-white hover:border-[#059669] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(5,150,105,0.3)]"
                aria-label="WhatsApp"
              >
                <MessageCircle className="text-sm"/>
              </a>
              <a
                href="https://instagram.com/taazabites"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-pink-600 hover:text-white hover:border-pink-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(219,39,119,0.3)]"
                aria-label="Instagram"
              >
                <Camera className="text-sm"/>
              </a>
              <a
                href="https://facebook.com/taazabites"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(37,99,235,0.3)]"
                aria-label="Facebook"
              >
                <Circle className="text-sm"/>
              </a>
              <a
                href="https://twitter.com/taazabites"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-sky-500 hover:text-white hover:border-sky-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(14,165,233,0.3)]"
                aria-label="Twitter"
              >
                <Circle className="text-sm"/>
              </a>
              <a
                href="https://linkedin.com/company/taazabites"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-blue-700 hover:text-white hover:border-blue-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(29,78,216,0.3)]"
                aria-label="LinkedIn"
              >
                <Briefcase className="text-sm"/>
              </a>
              <a
                href="https://youtube.com/@taazabites"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white hover:border-red-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(220,38,38,0.3)]"
                aria-label="YouTube"
              >
                <Circle className="text-sm"/>
              </a>
            </div>
          </div>

          {/* Links Sections - Desktop */}
          <div className="hidden lg:block lg:col-span-2">
            <FooterLinkColumn
              title="Quick Links"
              links={quickLinks}
              onNavigate={onNavigate}
            />
          </div>

          <div className="hidden lg:block lg:col-span-2">
            <FooterLinkColumn
              title="Services"
              links={servicesLinks}
              onNavigate={onNavigate}
            />
          </div>

          <div className="hidden lg:block lg:col-span-3">
            <FooterLinkColumn
              title="Popular Searches"
              links={topSearchesLinks}
              onNavigate={onNavigate}
            />
          </div>

          <div className="hidden lg:block lg:col-span-2">
            <FooterLinkColumn
              title="Legal & Support"
              links={legalLinks}
              onNavigate={onNavigate}
            />
          </div>

          {/* Links Sections - Mobile Accordion */}
          <div className="lg:hidden space-y-4 col-span-1 md:col-span-2">
            {[
              { title: "Quick Links", links: quickLinks },
              { title: "Services", links: servicesLinks },
              { title: "Popular Searches", links: topSearchesLinks },
              { title: "Legal & Support", links: legalLinks },
            ].map((col) => (
              <MobileAccordionColumn
                key={col.title}
                title={col.title}
                links={col.links}
                onNavigate={onNavigate}
                isOpen={openAccordion === col.title}
                onToggle={() => handleAccordionToggle(col.title)}
              />
            ))}
          </div>
        </div>

        {/* Security & Freshness Badges */}
        <div className="pt-10 pb-8 border-t border-white/5 mb-8">
          <h4 className="text-white font-bold mb-6 tracking-widest uppercase text-xs opacity-80 text-center lg:text-left">
            Security & Freshness
          </h4>
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#059669]/10 border border-[#059669]/20 flex items-center justify-center text-[#059669]">
                <Heart className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-white text-xs font-bold uppercase tracking-wider">
                  Nutritionist Designed
                </span>
                <span className="text-gray-500 text-[10px] sm:text-xs">
                  Scientifically balanced macros
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#059669]/10 border border-[#059669]/20 flex items-center justify-center text-[#059669]">
                <Circle className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-white text-xs font-bold uppercase tracking-wider">
                  FSSAI Certified Hub
                </span>
                <span className="text-gray-500 text-[10px] sm:text-xs">
                  Lic. No: 21223188002425
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#059669]/10 border border-[#059669]/20 flex items-center justify-center text-[#059669]">
                <Leaf />
              </div>
              <div className="flex flex-col">
                <span className="text-white text-xs font-bold uppercase tracking-wider">
                  Daily Local Procurement
                </span>
                <span className="text-gray-500 text-[10px] sm:text-xs">
                  Fresh from local farms
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center text-[#25D366]">
                <MessageCircle />
              </div>
              <div className="flex flex-col">
                <span className="text-white text-xs font-bold uppercase tracking-wider">
                  WhatsApp-Verified
                </span>
                <span className="text-gray-500 text-[10px] sm:text-xs">
                  Secure ordering & support
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-500 text-xs font-light tracking-wide text-center md:text-left uppercase">
            &copy; {currentYear} Taazabites. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs font-light tracking-wide flex items-center gap-1 uppercase">
            Made with <Heart className="text-[#059669] mx-1"/> in
            Bengaluru
          </p>
        </div>
      </div>
    </footer>
  );
};
