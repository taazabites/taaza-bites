import React, { useEffect, useState } from 'react';

const FooterLink = ({ href, text }: { href: string; text: string }) => (
    <li>
        <a href={href} className="text-zinc-400 hover:text-[var(--primary)] transition-colors duration-300 flex items-center gap-2 group">
            <span className="w-0 h-px bg-[var(--primary)] group-hover:w-3 transition-all duration-300"></span>
            <span>{text}</span>
        </a>
    </li>
);

const FooterLinkColumn = ({ title, links }: { title: string; links: { href: string; text: string }[] }) => (
    <div>
        <h4 className="text-lg font-bold font-iowan text-white mb-4 tracking-wide">{title}</h4>
        <ul className="space-y-3">
            {links.map(link => (
                <FooterLink key={link.text} {...link} />
            ))}
        </ul>
    </div>
);


const CollapsibleFooterLinks = ({ title, links }: { title: string; links: { href: string; text: string }[] }) => (
    <details className="border-b border-white/10 py-2 group">
        <summary className="font-semibold text-lg text-white list-none cursor-pointer flex justify-between items-center py-2">
            {title}
            <span className="group-open:rotate-45 transition-transform"><i className="fas fa-plus"></i></span>
        </summary>
        <ul className="space-y-3 pt-3 pb-4">
             {links.map(link => (
                <li key={link.text}><a href={link.href} className="text-zinc-400 hover:text-white transition-colors">{link.text}</a></li>
            ))}
        </ul>
    </details>
);

export const Footer: React.FC = () => {
    const [year, setYear] = useState(new Date().getFullYear());
    useEffect(() => setYear(new Date().getFullYear()), []);

    const quickLinks = [
        { href: "#hero", text: "Home" },
        { href: "#menu", text: "Menu" },
        { href: "#about", text: "About Us" },
        { href: "#faq", text: "FAQ" }
    ];
    const servicesLinks = [
        { href: "#subscriptions", text: "Meal Plans" },
        { href: "#corporate-booking", text: "Corporate Catering" },
        { href: "#meal-planner", text: "AI Planner" },
        { href: "#nutrition-approach", text: "Our Approach" }
    ];
    const legalLinks = [
        { href: "#", text: "Privacy Policy" },
        { href: "#", text: "Terms of Service" },
        { href: "#", text: "Refund Policy" },
    ]

    return (
        <footer className="bg-gradient-to-t from-gray-900 via-black to-black text-zinc-300 pt-20 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-12 gap-12 mb-12">
                    {/* Brand Info */}
                    <div className="lg:col-span-4">
                        <a href="#hero" className="flex items-center gap-2 text-3xl font-bold font-iowan mb-4">
                            <span className="text-[var(--primary)]">taaza</span>
                            <span className="text-[var(--accent-secondary)]">bites</span>
                            <sup className="text-xs top-[-1em] text-zinc-400">™</sup>
                        </a>
                        <p className="text-zinc-400 text-sm mb-6">Premium healthy food delivery in Bangalore. Chef-crafted, nutritionist-designed meals for a healthier you.</p>
                        <div className="flex gap-3">
                            {['facebook-f', 'instagram', 'twitter', 'linkedin-in'].map(icon => (
                                <a key={icon} href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-zinc-300 hover:bg-[var(--primary)] hover:text-white transition-all duration-300"><i className={`fab fa-${icon}`}></i></a>
                            ))}
                        </div>
                    </div>

                    {/* Desktop Links */}
                    <div className="hidden lg:block lg:col-span-2"><FooterLinkColumn title="Quick Links" links={quickLinks} /></div>
                    <div className="hidden lg:block lg:col-span-2"><FooterLinkColumn title="Our Services" links={servicesLinks} /></div>
                    
                    {/* Newsletter */}
                    <div className="hidden lg:block lg:col-span-4">
                         <h4 className="text-lg font-bold font-iowan text-white mb-4 tracking-wide">Stay Fresh</h4>
                         <p className="text-zinc-400 text-sm mb-4">Get updates on new meals, exclusive offers, and health tips delivered to your inbox.</p>
                         <form className="flex gap-2">
                             <input type="email" placeholder="Enter your email" required className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-[var(--accent)] outline-none placeholder:text-zinc-500" />
                             <button type="submit" aria-label="Subscribe" className="bg-[var(--accent-secondary)] text-white font-bold w-12 h-12 rounded-lg hover:bg-[#F84D15] shadow-lg shadow-[var(--accent-secondary)]/20 hover:scale-105 transition-all duration-300 flex items-center justify-center shrink-0">
                                <i className="fas fa-paper-plane"></i>
                            </button>
                         </form>
                    </div>

                    {/* Mobile Links */}
                    <div className="lg:hidden">
                        <CollapsibleFooterLinks title="Quick Links" links={quickLinks} />
                        <CollapsibleFooterLinks title="Our Services" links={servicesLinks} />
                        <CollapsibleFooterLinks title="Legal" links={legalLinks} />
                    </div>
                </div>

                {/* Contact & Mobile Newsletter */}
                 <div className="space-y-8">
                     {/* Contact Info */}
                     <div className="py-8 border-y border-white/10 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                         <a href="https://share.google/YqsS9NeOqDY4IjDMO" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                             <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors shrink-0">
                                 <i className="fas fa-map-marker-alt"></i>
                             </div>
                             <div>
                                 <p className="font-semibold text-white">Our Location</p>
                                 <p className="text-zinc-400 group-hover:text-white transition-colors text-sm">Kasavanahalli, Bengaluru</p>
                             </div>
                         </a>
                         <a href="tel:+917975771457" className="flex items-center gap-4 group">
                             <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors shrink-0">
                                 <i className="fas fa-phone"></i>
                             </div>
                             <div>
                                 <p className="font-semibold text-white">Call Us</p>
                                 <p className="text-zinc-400 group-hover:text-white transition-colors text-sm">+91 7975771457</p>
                             </div>
                         </a>
                         <a href="mailto:Taazabitesindia@gmail.com" className="flex items-center gap-4 group sm:col-span-2 lg:col-span-1">
                             <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors shrink-0">
                                 <i className="fas fa-envelope"></i>
                             </div>
                             <div>
                                 <p className="font-semibold text-white">Email Us</p>
                                 <p className="text-zinc-400 group-hover:text-white transition-colors text-sm">Taazabitesindia@gmail.com</p>
                             </div>
                         </a>
                     </div>
                     {/* Newsletter on Mobile */}
                     <div className="lg:hidden">
                          <h4 className="text-lg font-bold font-iowan text-white mb-4 tracking-wide text-center">Stay Fresh</h4>
                         <form className="flex gap-2 max-w-sm mx-auto">
                             <input type="email" placeholder="Enter your email" required className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-[var(--accent)] outline-none placeholder:text-zinc-500" />
                             <button type="submit" aria-label="Subscribe" className="bg-[var(--accent-secondary)] text-white font-bold w-12 h-12 rounded-lg hover:bg-[#F84D15] shadow-lg shadow-[var(--accent-secondary)]/20 flex items-center justify-center shrink-0">
                                <i className="fas fa-paper-plane"></i>
                            </button>
                         </form>
                     </div>
                 </div>

                <div className="text-center text-zinc-500 text-sm pt-8 mt-8 border-t border-white/10">
                    <p>© {year} Taazabites™. All rights reserved.</p>
                    <p className="mt-1">FSSAI Lic. No.: <a href="#" className="font-semibold text-zinc-400 hover:text-[var(--primary)] transition-colors">21223188002425</a></p>
                </div>
            </div>
        </footer>
    );
};