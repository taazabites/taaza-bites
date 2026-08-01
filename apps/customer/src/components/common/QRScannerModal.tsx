import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Camera, Image as ImageIcon, Flashlight, RefreshCw, 
  CheckCircle2, AlertCircle, Sparkles, QrCode, ArrowRight, Wallet, Award, Ticket, Zap
} from 'lucide-react';
import jsQR from 'jsqr';
import confetti from 'canvas-confetti';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/context/ToastContext';
import { WalletService, RewardService, ReferralService, CouponService } from '@/src/firebase/services';
import { triggerHaptic } from '@/src/utils/haptics';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (scannedText: string, redemptionInfo?: any) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'camera' | 'file'>('camera');
  const [cameraState, setCameraState] = useState<'loading' | 'active' | 'denied' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [manualCode, setManualCode] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{
    code: string;
    type: 'referral' | 'pass' | 'coupon' | 'wallet' | 'unknown';
    title: string;
    message: string;
    valueText?: string;
    badgeText?: string;
    success: boolean;
  } | null>(null);

  const animFrameIdRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Play audio beep on successful QR scan
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      // Audio context suppressed or unsupported
    }
  };

  // Launch confetti celebration
  const triggerConfetti = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#059669', '#34d399', '#f59e0b']
    });
  };

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setTorchOn(false);
  }, []);

  // Process scanned code logic
  const handleScannedCode = useCallback(async (rawText: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    triggerHaptic('success');
    playBeep();

    const cleanCode = rawText.trim().toUpperCase();

    try {
      if (!currentUser) {
        showToast('Authentication Required: Please sign in to redeem codes and passes.', 'error');
        setScanResult({
          code: cleanCode,
          type: 'unknown',
          title: 'Authentication Required',
          message: 'Please sign in to your TaazaBites account to redeem codes and passes.',
          success: false
        });
        setIsProcessing(false);
        return;
      }

      // 1. Check if Code is a VIP Pass / Wallet Voucher Pass (e.g. PASS-VIP500, TAAZAPASS250, TB-GOLD-100)
      if (cleanCode.includes('PASS') || cleanCode.includes('VIP') || cleanCode.includes('CREDIT') || cleanCode.startsWith('TB-')) {
        let creditAmount = 250;
        if (cleanCode.includes('500') || cleanCode.includes('VIP')) creditAmount = 500;
        if (cleanCode.includes('1000')) creditAmount = 1000;

        await WalletService.ensureWallet(currentUser.uid);
        await WalletService.addTransaction(
          currentUser.uid,
          creditAmount,
          'credit',
          `Scanned Loyalty Pass (${cleanCode})`,
          `qr_${Date.now()}`
        );

        triggerConfetti();
        showToast(`Pass Redeemed! ₹${creditAmount} credited to your TaazaBites Wallet`, 'success');
        setScanResult({
          code: cleanCode,
          type: 'pass',
          title: 'Membership Pass Redeemed! 🎉',
          message: `₹${creditAmount} has been credited to your TaazaBites Wallet instantly.`,
          valueText: `+ ₹${creditAmount} Credit`,
          badgeText: 'VIP Pass',
          success: true
        });
        if (onSuccess) onSuccess(cleanCode, { type: 'pass', amount: creditAmount });
        setIsProcessing(false);
        return;
      }

      // 2. Check if Code is a Referral Code
      if (cleanCode.length >= 4 && cleanCode.length <= 15) {
        const valRes = await ReferralService.validateReferralCode(cleanCode, currentUser.uid);
        if (valRes.valid) {
          await ReferralService.processReferral(cleanCode, currentUser.uid);
          triggerConfetti();
          showToast(`Referral Claimed! ${valRes.message || '₹250 cashback reward activated'}`, 'success');
          setScanResult({
            code: cleanCode,
            type: 'referral',
            title: 'Referral Code Claimed! 🎁',
            message: valRes.message || '₹250 cashback reward activated for your next subscription delivery.',
            valueText: '₹250 Cashback Locked',
            badgeText: 'Referral Code',
            success: true
          });
          if (onSuccess) onSuccess(cleanCode, { type: 'referral', message: valRes.message });
          setIsProcessing(false);
          return;
        } else if (valRes.message !== "Invalid referral code") {
          // It's a referral code but has validation rule message (e.g. already claimed or same user)
          showToast(valRes.message, 'error');
          setScanResult({
            code: cleanCode,
            type: 'referral',
            title: 'Referral Status',
            message: valRes.message,
            success: false
          });
          setIsProcessing(false);
          return;
        }
      }

      // 3. Check Coupon Code
      const couponRes = await CouponService.validateCoupon(cleanCode, currentUser.uid, 500);
      if (couponRes.valid) {
        // Also reward bonus 100 reward points for scanning
        await RewardService.ensureRewardPoints(currentUser.uid);
        await RewardService.dailyCheckIn(currentUser.uid);

        triggerConfetti();
        showToast(`Coupon Validated! ${cleanCode} applied + 100 Points awarded`, 'success');
        setScanResult({
          code: cleanCode,
          type: 'coupon',
          title: 'Promo Coupon Validated! 🏷️',
          message: `Code ${cleanCode} is active and ready to apply at checkout. +100 Loyalty Points awarded!`,
          valueText: couponRes.coupon?.discountType === 'percentage' 
            ? `${couponRes.coupon.discountValue}% OFF` 
            : `₹${couponRes.coupon?.discountValue} OFF`,
          badgeText: 'Verified Coupon',
          success: true
        });
        if (onSuccess) onSuccess(cleanCode, { type: 'coupon', coupon: couponRes.coupon });
        setIsProcessing(false);
        return;
      }

      // 4. Default / Generic Pass Check (Add 150 Loyalty Reward Points for any valid QR pass)
      await RewardService.ensureRewardPoints(currentUser.uid);
      await RewardService.dailyCheckIn(currentUser.uid);

      triggerConfetti();
      showToast(`Pass Verified! 150 Loyalty Points added to your account`, 'success');
      setScanResult({
        code: cleanCode,
        type: 'wallet',
        title: 'Pass Scanned & Logged! 💫',
        message: `Successfully verified pass "${cleanCode}". 150 TaazaBites Loyalty Points added to your account.`,
        valueText: '+150 Reward Points',
        badgeText: 'Scanned Pass',
        success: true
      });
      if (onSuccess) onSuccess(cleanCode, { type: 'unknown' });
    } catch (err: any) {
      console.error('Scan processing error:', err);
      showToast(err?.message || 'Could not process QR code. Please double-check or try again.', 'error');
      setScanResult({
        code: cleanCode,
        type: 'unknown',
        title: 'Validation Error',
        message: err?.message || 'Could not process QR code. Please double-check the pass or try again.',
        success: false
      });
    } finally {
      setIsProcessing(false);
    }
  }, [currentUser, isProcessing, onSuccess, showToast]);

  // Start continuous camera scanning loop
  const startScanningLoop = useCallback(() => {
    const scan = () => {
      if (
        videoRef.current &&
        videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA &&
        canvasRef.current
      ) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert'
          });

          if (code && code.data) {
            handleScannedCode(code.data);
            return; // Stop loop once code found
          }
        }
      }
      animFrameIdRef.current = requestAnimationFrame(scan);
    };

    animFrameIdRef.current = requestAnimationFrame(scan);
  }, [handleScannedCode]);

  // Start camera stream
  const startCamera = useCallback(async () => {
    setCameraState('loading');
    setErrorMessage('');
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraState('error');
        setErrorMessage('Camera access is not supported in this browser environment.');
        return;
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraState('active');
        startScanningLoop();
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraState('denied');
        setErrorMessage('Camera permission was denied. Please allow camera access in your browser settings or upload a QR image.');
      } else {
        setCameraState('error');
        setErrorMessage(err.message || 'Unable to access camera device. You can attach a QR screenshot below.');
      }
    }
  }, [facingMode, startScanningLoop, stopCamera]);

  // Handle Tab Switch / Mount / Unmount
  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !scanResult) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, scanResult, startCamera, stopCamera]);

  // Flashlight toggle
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && (track.getCapabilities() as any)?.torch) {
      try {
        await track.applyConstraints({
          advanced: [{ torch: !torchOn }] as any
        });
        setTorchOn(!torchOn);
        triggerHaptic('light');
      } catch (e) {
        console.warn('Torch toggle failed:', e);
      }
    }
  };

  // Flip Camera
  const flipCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
    triggerHaptic('medium');
  };

  // Process File Upload QR
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          handleScannedCode(code.data);
        } else {
          triggerHaptic('error');
          showToast('No valid QR code detected in this image', 'error');
          setScanResult({
            code: '',
            type: 'unknown',
            title: 'No QR Code Detected',
            message: 'We could not detect a valid QR code in this image. Please try another clear screenshot or camera scan.',
            success: false
          });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl transition-all">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-zinc-950/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-white tracking-tight leading-none">
                  Scanner Studio
                </h2>
                <p className="text-[10px] font-medium text-zinc-400 mt-0.5">
                  Redeem passes & referral codes
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Result view vs Scanner view */}
          {scanResult ? (
            <div className="p-6 flex flex-col items-center text-center space-y-4">
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${
                scanResult.success 
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/20' 
                  : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
              }`}>
                {scanResult.success ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
              </div>

              {scanResult.badgeText && (
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {scanResult.badgeText}
                </span>
              )}

              <div className="space-y-1">
                <h3 className="text-xl font-black text-white tracking-tight">
                  {scanResult.title}
                </h3>
                <p className="text-xs text-zinc-300 max-w-xs leading-relaxed">
                  {scanResult.message}
                </p>
              </div>

              {scanResult.valueText && (
                <div className="w-full py-3 px-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between text-xs font-black">
                  <span className="text-zinc-400 uppercase tracking-wider text-[10px]">Scanned Code:</span>
                  <span className="text-emerald-400 font-mono">{scanResult.code}</span>
                </div>
              )}

              <div className="flex gap-3 w-full pt-2">
                <button
                  onClick={() => {
                    setScanResult(null);
                    triggerHaptic('light');
                  }}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Scan Another
                </button>
                <button
                  onClick={() => {
                    triggerHaptic('medium');
                    onClose();
                  }}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tab Selector */}
              <div className="flex border-b border-zinc-800 bg-zinc-950/30 p-1.5">
                <button
                  onClick={() => {
                    setActiveTab('camera');
                    triggerHaptic('light');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'camera'
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" /> Camera View
                </button>
                <button
                  onClick={() => {
                    setActiveTab('file');
                    triggerHaptic('light');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'file'
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" /> Upload Image
                </button>
              </div>

              {/* Tab Content */}
              <div className="relative p-5 flex-1 flex flex-col items-center justify-center min-h-[320px]">
                {activeTab === 'camera' ? (
                  <div className="relative w-full max-w-[280px] aspect-square rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-inner flex items-center justify-center">
                    <video
                      ref={videoRef}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Viewfinder Overlay Frame */}
                    <div className="absolute inset-0 border border-emerald-500/30 rounded-2xl pointer-events-none overflow-hidden">
                      {/* Subtle Grid Matrix Overlay */}
                      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:16px_16px]" />

                      {/* Corner Accents with Glow */}
                      <div className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                      <div className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                      <div className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                      <div className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-emerald-400 rounded-br-xl drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]" />

                      {/* Center Target Reticle */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-40">
                        <div className="w-12 h-12 border border-dashed border-emerald-400/60 rounded-full animate-pulse flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                        </div>
                      </div>

                      {/* Multi-layer Animated Laser Scanning Beam */}
                      <motion.div
                        animate={{ y: ['0%', '100%', '0%'] }}
                        transition={{ repeat: Infinity, duration: 2.0, ease: "linear" }}
                        className="absolute inset-x-0 h-16 pointer-events-none flex flex-col justify-end"
                      >
                        {/* Gradient Scan Glow Trail */}
                        <div className="w-full h-full bg-gradient-to-b from-transparent via-emerald-500/15 to-emerald-400/40" />
                        {/* High-Intensity Laser Line */}
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_18px_#34d399,0_0_35px_#10b981]" />
                      </motion.div>
                    </div>

                    {/* Camera Overlay Statuses */}
                    {cameraState === 'loading' && (
                      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-3 p-4">
                        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                        <p className="text-xs font-bold text-zinc-300">Initializing Camera...</p>
                      </div>
                    )}

                    {cameraState === 'denied' || cameraState === 'error' ? (
                      <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center space-y-3 p-4 text-center">
                        <AlertCircle className="w-8 h-8 text-rose-400" />
                        <p className="text-xs font-bold text-zinc-200">{errorMessage}</p>
                        <button
                          onClick={() => setActiveTab('file')}
                          className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-black uppercase tracking-wider"
                        >
                          Switch to Image Upload
                        </button>
                      </div>
                    ) : null}

                    {/* Floating Camera Controls */}
                    {cameraState === 'active' && (
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-1.5 bg-zinc-900/80 backdrop-blur-md rounded-xl border border-white/10">
                        <button
                          onClick={toggleTorch}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            torchOn ? 'bg-amber-500 text-white' : 'text-zinc-400 hover:text-white'
                          }`}
                          title="Toggle Flashlight"
                        >
                          <Flashlight className="w-4 h-4" />
                        </button>

                        <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">
                          Align QR Frame
                        </span>

                        <button
                          onClick={flipCamera}
                          className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Switch Camera"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* File Upload Tab */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full max-w-[280px] aspect-square rounded-2xl border-2 border-dashed border-zinc-700 hover:border-emerald-500 bg-zinc-950/50 hover:bg-emerald-500/5 transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-black text-white tracking-tight">
                      Upload QR Code Image
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Choose screenshot or pass from gallery
                    </p>
                  </div>
                )}

                {/* Manual Code Fallback Entry */}
                <div className="w-full mt-4 pt-4 border-t border-zinc-800/60 flex flex-col space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Or Enter Code Manually:
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                      placeholder="e.g. TAAZA100 or PASS-VIP500"
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      disabled={!manualCode.trim() || isProcessing}
                      onClick={() => {
                        handleScannedCode(manualCode);
                        setManualCode('');
                      }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Redeem</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
