import { Fingerprint, ArrowRight, Shield, Bike, Utensils, Globe } from 'lucide-react';
import React from 'react';
import { useAuth } from '../context/AuthContext';
import type { PortalKind } from '../lib/portalRouter';

const portalIcon: Record<PortalKind, React.ReactNode> = {
  admin: <Shield className="w-4 h-4" />,
  delivery: <Bike className="w-4 h-4" />,
  customer: <Utensils className="w-4 h-4" />,
  website: <Globe className="w-4 h-4" />,
};

export const AuthModal: React.FC = () => {
    const {
      isAuthModalOpen,
      closeAuth,
      login,
      isLoading,
      portalResolution,
      isResolvingPortal,
      choosePortal,
      user,
    } = useAuth();

    if (!isAuthModalOpen) return null;

    const showPortalPicker = Boolean(portalResolution?.options?.length);
    const showResolving = isResolvingPortal;

    const handleGoogleSignIn = () => {
        login({ routeAfterLogin: true }).catch(err => console.error("Login Error:", err));
    };

    return (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 animate-fade-in">
            <div className="absolute inset-0 bg-[#1A1A1A]/80 backdrop-blur-xl" onClick={closeAuth}></div>
            
            <div className="relative bg-[#F5F2ED] w-full max-w-sm rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white animate-scale-up">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-[#FF7A00] shadow-[0_0_15px_#FF7A00] animate-scan-y-infinite opacity-40 z-20"></div>
                
                <div className="p-10 sm:p-12 text-center">
                    <div className="w-16 h-16 bg-zinc-100 rounded-2xl mx-auto mb-6 flex items-center justify-center text-[#FF7A00] shadow-inner">
                        <Fingerprint className="w-8 h-8 animate-pulse"/>
                    </div>

                    {showResolving ? (
                      <>
                        <span className="text-[8px] font-mono font-black text-zinc-400 uppercase tracking-[0.6em] block mb-2">CHECKING ACCESS</span>
                        <h2 className="text-2xl font-extrabold font-sans uppercase text-[#1A1A1A] tracking-tight leading-none mb-4">Finding your portal…</h2>
                        <p className="text-xs text-zinc-500 font-mono">Matching your role across Admin, Delivery & Customer.</p>
                      </>
                    ) : showPortalPicker ? (
                      <>
                        <span className="text-[8px] font-mono font-black text-zinc-400 uppercase tracking-[0.6em] block mb-2">CHOOSE PORTAL</span>
                        <h2 className="text-2xl font-extrabold font-sans uppercase text-[#1A1A1A] tracking-tight leading-none mb-2">
                          Hi{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}.
                        </h2>
                        <p className="text-xs text-zinc-500 mb-6">
                          {portalResolution?.adminRole
                            ? `Signed in as ${portalResolution.adminRole}`
                            : 'Where do you want to go?'}
                        </p>
                        <div className="flex flex-col gap-2 text-left">
                          {portalResolution!.options.map((opt) => (
                            <button
                              key={opt.kind + opt.label}
                              type="button"
                              onClick={() => choosePortal(opt)}
                              className={`group flex items-center gap-3 w-full rounded-2xl border px-4 py-3 transition-all ${
                                opt.kind === portalResolution!.primary
                                  ? 'bg-[#059669] border-[#059669] text-white shadow-md'
                                  : 'bg-white border-zinc-200 hover:border-[#059669]/40 text-[#1A1A1A]'
                              }`}
                            >
                              <span className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                                opt.kind === portalResolution!.primary ? 'bg-white/20' : 'bg-zinc-100 text-[#059669]'
                              }`}>
                                {portalIcon[opt.kind]}
                              </span>
                              <span className="flex-1 min-w-0">
                                <span className="block text-xs font-bold uppercase tracking-wide">{opt.label}</span>
                                <span className={`block text-[10px] truncate ${
                                  opt.kind === portalResolution!.primary ? 'text-white/80' : 'text-zinc-400'
                                }`}>{opt.description}</span>
                              </span>
                              <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-[8px] font-mono font-black text-zinc-400 uppercase tracking-[0.6em] block mb-2">SECURE LOGIN</span>
                        <h2 className="text-3xl font-extrabold font-sans uppercase text-[#1A1A1A] tracking-tight leading-none mb-8">Welcome Back.</h2>

                        <button 
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            className="group relative flex items-center justify-center w-full bg-white border border-zinc-200 hover:border-zinc-300 rounded-full px-6 py-4 shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50"
                        >
                            <div className="flex items-center justify-center space-x-3">
                                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 block">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                    <path fill="none" d="M0 0h48v48H0z"></path>
                                </svg>
                                <span className="font-mono text-xs uppercase tracking-widest text-[#1A1A1A] font-bold">
                                    {isLoading ? "Connecting..." : "Sign in with Google"}
                                </span>
                            </div>
                        </button>
                      </>
                    )}
                    
                    <div className="mt-6">
                        <button 
                            type="button"
                            onClick={closeAuth}
                            className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] hover:text-[#FF7A00] transition-colors"
                        >
                            {showPortalPicker ? 'Close' : 'Cancel'}
                        </button>
                    </div>
                </div>

                <div className="bg-zinc-50 p-6 text-center border-t border-zinc-100">
                    <p className="text-[7px] font-mono font-bold text-zinc-300 uppercase tracking-[0.4em]">
                      {showPortalPicker ? 'Role-based portal access' : 'Secure Authentication'}
                    </p>
                </div>
            </div>
        </div>
    );
};
