import { ExternalLink, Loader2, Send, Phone, Mail, MapPin } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../config';
import React, { useState } from 'react';
import { SmartButton } from './SmartButton';

export const ContactPage: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const MAP_URL = "https://maps.app.goo.gl/XAj7fyrfLdvmZMS8A?g_st=awb";
    const FULL_ADDRESS = "2nd Floor, Sri Banashankari Nilaya, Hosa Rd, Above Go Colors, Kasavanahalli, Bengaluru 560035";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
        if (!formData.message.trim()) newErrors.message = 'Message is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setStatus('error');
            try {
                if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate([30, 50, 30]);
                }
            } catch (err) {
                console.warn('Vibration not supported or block on device:', err);
            }
            return;
        }

        setStatus('submitting');
        try {
            if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(15);
            }
        } catch (err) {
            console.warn('Vibration not supported on device:', err);
        }

        const { name, email, subject, message } = formData;
        const rawMessage = [
            '*Taazabites Contact Form Enquiry*',
            '',
            `*Name:* ${name}`,
            `*Email:* ${email}`,
            `*Subject:* ${subject}`,
            `*Message:* ${message}`,
            '',
            '_Sent via Taazabites Website Contact Form_'
        ].join('\n');

        const encodedMessage = encodeURIComponent(rawMessage);
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

        setStatus('success');
        
        const opened = window.open(whatsappUrl, '_blank');
        if (!opened) {
            window.location.href = whatsappUrl;
        }

        setTimeout(() => {
            setStatus('idle');
            setFormData({ name: '', email: '', subject: '', message: '' }); 
        }, 1500);
    };

    const inputClasses = "w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl focus:border-[#FF7A00] focus:bg-white focus:ring-4 focus:ring-[#FF7A00]/10 outline-none transition-all duration-300 text-[#1A1A1A] placeholder:text-gray-400 font-light";
    const labelClasses = "block text-sm font-bold text-gray-700 mb-2 ml-2 uppercase tracking-widest";

    const contactPageSchema = {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": "Contact Taazabites",
        "description": "Get in touch with Taazabites for healthy meal delivery in Bangalore.",
        "url": "https://www.taazabites.in/contact",
        "mainEntity": {
            "@type": "Organization",
            "name": "Taazabites",
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+91-79757-71457",
                "contactType": "customer service",
                "email": "support@taazabites.in",
                "areaServed": "IN",
                "availableLanguage": ["en", "hi"]
            }
        }
    };

    return (
        <section id="contact" className="relative py-16 sm:py-24 lg:py-32 bg-[#FFF8F0] overflow-hidden">
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify(contactPageSchema)
            }} />
            {/* Subtle background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-40 -left-40 w-[40rem] h-[40rem] bg-[#FF7A00]/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-40 -right-40 w-[40rem] h-[40rem] bg-[#FFD700]/5 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div className="text-center mb-12 sm:mb-16 lg:mb-24">
                    <span className="text-[#FF7A00] font-bold tracking-widest uppercase text-[10px] sm:text-xs mb-4 sm:mb-6 block">Connect With Us</span>
                    <h2 className="text-4xl sm:text-5xl lg:text-7xl font-light font-serif text-[#1A1A1A] tracking-tight leading-none mb-4 sm:mb-6">
                        Get in <span className="italic text-[#FF7A00]">Touch.</span>
                    </h2>
                    <p className="max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed font-light">
                        Have questions about our meal plans? Our dedicated team is ready to assist you.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-20 items-start mb-16 sm:mb-20">
                    {/* Contact Form */}
                    <div className="bg-white border border-gray-100 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 lg:p-12 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[#FFF8F0] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <h3 className="text-2xl sm:text-3xl font-light font-serif text-[#1A1A1A] mb-6 sm:mb-8 tracking-tight relative z-10">Send a Message</h3>
                        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 relative z-10" noValidate>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                                <div>
                                    <label className={labelClasses}>Your Name</label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleChange} 
                                        className={`${inputClasses} ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}`} 
                                        placeholder="e.g. Alex" 
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1 ml-2 animate-fade-in">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className={labelClasses}>Your Email</label>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        value={formData.email} 
                                        onChange={handleChange} 
                                        className={`${inputClasses} ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}`} 
                                        placeholder="alex@example.com" 
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1 ml-2 animate-fade-in">{errors.email}</p>}
                                </div>
                            </div>
                            <div>
                                <label className={labelClasses}>Subject</label>
                                <input 
                                    type="text" 
                                    name="subject" 
                                    value={formData.subject} 
                                    onChange={handleChange} 
                                    className={`${inputClasses} ${errors.subject ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}`} 
                                    placeholder="How can we help?" 
                                />
                                {errors.subject && <p className="text-red-500 text-xs mt-1 ml-2 animate-fade-in">{errors.subject}</p>}
                            </div>
                            <div>
                                <label className={labelClasses}>Message</label>
                                <textarea 
                                    name="message" 
                                    value={formData.message} 
                                    onChange={handleChange} 
                                    rows={5} 
                                    className={`${inputClasses} resize-y min-h-[100px] sm:min-h-[120px] ${errors.message ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}`}
                                    placeholder="Describe your request in detail..."
                                ></textarea>
                                {errors.message && <p className="text-red-500 text-xs mt-1 ml-2 animate-fade-in">{errors.message}</p>}
                            </div>
                            
                            <SmartButton 
                                label={status === 'submitting' ? 'Sending...' : 'Send Message'}
                                variant="primary"
                                icon={status === 'submitting' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                className="w-full mt-2 sm:mt-4 py-3 sm:py-4 text-base sm:text-lg shadow-[0_8px_30px_rgba(255,122,0,0.25)]"
                                type="submit"
                                disabled={status === 'submitting'}
                            />
                        </form>
                    </div>

                    {/* Contact Info Sidebar */}
                    <div className="space-y-6 sm:space-y-8">
                        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 lg:p-12 border border-gray-100 shadow-xl relative overflow-hidden">
                            <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-[#FFF8F0] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
                            <h3 className="text-2xl sm:text-3xl font-light font-serif text-[#1A1A1A] mb-6 sm:mb-8 tracking-tight relative z-10">Contact Info</h3>
                            <div className="space-y-6 sm:space-y-8 relative z-10">
                                <a href={`tel:+${WHATSAPP_NUMBER}`} className="flex items-start gap-4 sm:gap-6 group">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#FFF8F0] flex items-center justify-center text-[#FF7A00] group-hover:bg-[#FF7A00] group-hover:text-white transition-colors shrink-0 border border-[#FF7A00]/20">
                                        <Phone className="text-sm sm:text-base"/>
                                    </div>
                                    <div>
                                        <p className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 sm:mb-1">Phone</p>
                                        <p className="text-base sm:text-lg font-medium text-[#1A1A1A]">+91 79757 71457</p>
                                    </div>
                                </a>
                                <a href="mailto:support@taazabites.in" className="flex items-start gap-4 sm:gap-6 group">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#FFF8F0] flex items-center justify-center text-[#FF7A00] group-hover:bg-[#FF7A00] group-hover:text-white transition-colors shrink-0 border border-[#FF7A00]/20">
                                        <Mail className="text-sm sm:text-base"/>
                                    </div>
                                    <div>
                                        <p className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 sm:mb-1">Email</p>
                                        <p className="text-base sm:text-lg font-medium text-[#1A1A1A] break-all">support@taazabites.in</p>
                                    </div>
                                </a>
                                <a href={MAP_URL} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 sm:gap-6 group">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#FFF8F0] flex items-center justify-center text-[#FF7A00] group-hover:bg-[#FF7A00] group-hover:text-white transition-colors shrink-0 border border-[#FF7A00]/20">
                                        <MapPin className="text-sm sm:text-base"/>
                                    </div>
                                    <div>
                                        <p className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 sm:mb-1">Address</p>
                                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-light">{FULL_ADDRESS}</p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        <div className="bg-[#1A1A1A] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 border border-white/10 relative overflow-hidden shadow-xl">
                            <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-[#FF7A00]/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                            <h3 className="text-xl sm:text-2xl font-light font-serif text-white mb-3 sm:mb-4 relative z-10">Kitchen Hours</h3>
                            <p className="text-sm sm:text-base text-gray-400 mb-5 sm:mb-6 font-light relative z-10">Our kitchen is active 7 days a week to ensure you always get fresh meals.</p>
                            <div className="flex justify-between items-center relative z-10">
                                <span className="font-medium text-[#FFD700] tracking-wide text-sm sm:text-base">Daily</span>
                                <span className="font-bold text-[#1A1A1A] bg-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl shadow-sm tracking-wider text-xs sm:text-sm">09:00 - 22:00 IST</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Google Maps Section */}
                <div className="text-center mb-8 sm:mb-10">
                    <h3 className="text-2xl sm:text-3xl font-light font-serif text-[#1A1A1A] mb-3 sm:mb-4">Visit Our Kitchen</h3>
                    <p className="text-sm sm:text-base text-gray-600 font-light">We are located in the heart of Bengaluru.</p>
                </div>
                
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl h-[300px] sm:h-[400px] md:h-[500px] border border-[#FF7A00]/10">
                    <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3889.044196160934!2d77.67184287588329!3d12.904886616335198!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae130f666710ad%3A0x6b45e9976375e205!2sSri%20Banashankari%20Nilaya!5e0!3m2!1sen!2sin!4v1740500000000!5m2!1sen!2sin"
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen={true} 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Taazabites Bengaluru Headquarters"
                    ></iframe>
                    
                    <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[90%] sm:w-auto text-center">
                         <SmartButton 
                            label="Open in Maps"
                            variant="primary"
                            icon={<ExternalLink className="w-5 h-5" />}
                            href={MAP_URL}
                            target="_blank"
                            className="shadow-[0_8px_30px_rgba(255,122,0,0.25)] w-full sm:w-auto"
                         />
                    </div>
                </div>
            </div>
        </section>
    );
};
