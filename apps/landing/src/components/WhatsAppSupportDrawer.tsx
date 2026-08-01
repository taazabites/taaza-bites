import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { WHATSAPP_NUMBER } from "../config";

// Official WhatsApp Logo SVG
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export const WhatsAppSupportDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Stop body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating Action Button for Support */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-40 right-4 z-[400] bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 rounded-full shadow-[0_8px_30px_rgba(37,211,102,0.4)] border border-white/20 flex items-center justify-center active:scale-95 transition-all animate-bounce md:hidden"
        style={{ animationDuration: '3s' }}
        aria-label="24/7 WhatsApp Support"
      >
        <WhatsAppIcon className="w-6 h-6 text-white" />
      </button>

      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[1001] transition-all duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer Container */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-[350px] bg-white z-[1002] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col will-change-transform touch-none ${
          isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
      >
        <div className="p-5 flex justify-between items-center border-b border-zinc-100 bg-white">
          <h2 className="text-lg font-extrabold text-zinc-900 tracking-tight uppercase">24/7 Support Desk</h2>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-all"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 space-y-6">
          <p className="text-zinc-600 text-sm leading-relaxed">
            Need immediate help with your <strong>meal subscription</strong>, <strong>pause or postponement requests</strong>, or want to make a <strong>custom diet change</strong>?
          </p>
          
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">⚡ Real-time Concierge</span>
            <p className="text-emerald-950 text-xs leading-relaxed">
              Our active nutrition & logistics team is online <strong>24 hours a day, 7 days a week</strong> to service your meal plan instantly.
            </p>
          </div>
          
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20Taazabites!%20I%20need%20support.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-center font-black text-sm uppercase tracking-wider transition-all shadow-[0_4px_15px_rgba(37,211,102,0.3)] active:scale-95 flex items-center justify-center gap-3"
          >
            <WhatsAppIcon className="w-5 h-5 text-white fill-current" />
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </>
  );
};
