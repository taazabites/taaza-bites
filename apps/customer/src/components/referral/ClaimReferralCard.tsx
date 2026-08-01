import React, { useState, useEffect } from 'react';
import { Gift, Check, ArrowRight, Scan, Sparkles, Loader2, Users, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button, Card, Input } from '../ui/primitives';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/context/ToastContext';
import { ReferralService } from '@/src/firebase/services';
import confetti from 'canvas-confetti';
import { triggerHaptic } from '@/src/utils/haptics';

interface ClaimReferralCardProps {
  className?: string;
  onSuccess?: () => void;
}

export function ClaimReferralCard({ className = '', onSuccess }: ClaimReferralCardProps) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [referrerInfo, setReferrerInfo] = useState<{ valid: boolean; name?: string; message?: string } | null>(null);
  const [claimed, setClaimed] = useState(false);

  // Auto-detect saved referral code from URL/localStorage
  useEffect(() => {
    const savedCode = localStorage.getItem('taaza_ref_code');
    if (savedCode && !code) {
      setCode(savedCode.toUpperCase());
    }
  }, []);

  // Validate code on blur or debounce
  const handleValidate = async (inputCode: string) => {
    const clean = inputCode.trim().toUpperCase();
    if (!clean || clean.length < 3) {
      setReferrerInfo(null);
      return;
    }
    if (!currentUser) return;

    setValidating(true);
    try {
      const res = await ReferralService.validateReferralCode(clean, currentUser.uid);
      if (res.valid) {
        setReferrerInfo({
          valid: true,
          name: res.referrer?.displayName || 'A TaazaBites Friend',
          message: 'Valid code! Claim ₹250 wallet credit instantly.'
        });
      } else {
        setReferrerInfo({
          valid: false,
          message: res.message || 'Invalid referral code.'
        });
      }
    } catch (err) {
      setReferrerInfo(null);
    } finally {
      setValidating(false);
    }
  };

  const handleClaim = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!clean) {
      showToast('Please enter a referral code to claim', 'error');
      return;
    }
    if (!currentUser) {
      showToast('Please sign in to claim your referral reward', 'error');
      return;
    }

    setLoading(true);
    triggerHaptic('medium');

    try {
      const res = await ReferralService.processReferral(clean, currentUser.uid);
      if (res.success) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
        setClaimed(true);
        localStorage.removeItem('taaza_ref_code');
        showToast(res.message || 'Referral claimed! ₹250 credited to your wallet.', 'success');
        if (onSuccess) onSuccess();
      } else {
        triggerHaptic('heavy');
        showToast(res.message || 'Could not claim referral code.', 'error');
        setReferrerInfo({ valid: false, message: res.message });
      }
    } catch (err: any) {
      triggerHaptic('heavy');
      showToast(err?.message || 'Error processing referral code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openQRScanner = () => {
    triggerHaptic('light');
    window.dispatchEvent(new CustomEvent('open-qr-scanner'));
  };

  if (claimed) {
    return (
      <Card className={`p-6 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/10 border border-emerald-500/30 rounded-[32px] ${className}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-black text-zinc-900 dark:text-white">Referral Reward Active!</h4>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              ₹250 Wallet Credit & 100 Reward Points added to your account.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 sm:p-8 bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950 text-white border border-zinc-800 rounded-[36px] shadow-2xl relative overflow-hidden ${className}`}>
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">Have a Referral Code?</span>
              <h3 className="text-lg font-black tracking-tight text-white">Claim Your ₹250 Bonus</h3>
            </div>
          </div>
          
          <Button
            type="button"
            onClick={openQRScanner}
            variant="outline"
            className="border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-2xl h-10 px-3.5 flex items-center gap-2"
          >
            <Scan className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Scan QR</span>
          </Button>
        </div>

        <form onSubmit={handleClaim} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Enter friend's code (e.g. TAAZA250)"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  handleValidate(e.target.value);
                }}
                className="bg-zinc-950/80 border-zinc-700 text-white font-mono uppercase font-black text-base tracking-widest placeholder:text-zinc-500 h-14 rounded-2xl px-4 focus:border-emerald-500"
              />
              {validating && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || !code.trim()}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs uppercase tracking-wider h-14 px-8 rounded-2xl shadow-xl shadow-emerald-500/20 shrink-0 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Claim Reward <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {/* Validation Feedback Banner */}
          {referrerInfo && (
            <div className={`p-3.5 rounded-2xl text-xs font-medium flex items-center gap-3 border ${
              referrerInfo.valid 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              {referrerInfo.valid ? (
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <div className="flex-1">
                {referrerInfo.valid ? (
                  <span>
                    Invited by <strong className="text-white font-black">{referrerInfo.name}</strong> • Get ₹250 Wallet Credit + 100 Points!
                  </span>
                ) : (
                  <span>{referrerInfo.message}</span>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </Card>
  );
}
