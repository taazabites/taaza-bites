import React, { useState, useEffect } from 'react';
import { safeCopyToClipboard } from '@/src/utils/clipboard';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet as WalletIcon,
  CreditCard,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  Tag,
  Percent,
  Users,
  Share2,
  Copy,
  Check,
  Search,
  Filter,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  Download,
  Info,
  ChevronRight,
  ShieldCheck,
  MessageCircle,
  Coins,
  RefreshCw,
  Eye,
  EyeOff,
  Flame,
  Award,
  X,
  FileText,
  ExternalLink
} from 'lucide-react';
import { Card, Button } from '@/src/components/ui/primitives';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/context/ToastContext';
import { triggerHaptic } from '@/src/utils/haptics';
import { cn } from '@/src/lib/utils';
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { PageHeader } from "../components/dashboard/PageHeader";
import { PageTransition } from "../components/dashboard/PageTransition";
import { QRScannerButton } from "../components/common/QRScannerButton";
import { ClaimReferralCard } from "../components/referral/ClaimReferralCard";
import { WalletService, ReferralService, getAuthHeaders } from '../firebase/services';
import { Wallet, WalletTransaction } from '../firebase/collections';

type WalletTab = 'overview' | 'coupons' | 'cashback' | 'referrals' | 'transactions';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  category: 'Top-Up' | 'Meal Order' | 'Cashback' | 'Referral Bonus' | 'Refund';
  title: string;
  amount: number;
  timestamp: string;
  status: 'Completed' | 'Processing' | 'Refunded';
  refId: string;
  method?: string;
}

interface Coupon {
  id: string;
  code: string;
  discount: string;
  description: string;
  minOrder: number;
  expiryDate: string;
  category: 'Subscription' | 'Add-on' | 'All Meals';
  isExpired: boolean;
}

interface ReferralRecord {
  id: string;
  friendName: string;
  friendAvatar: string;
  joinedDate: string;
  status: 'Completed' | 'Pending First Meal';
  rewardEarned: number;
}

export default function WalletPage() {
  const { currentUser, userData } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<WalletTab>('overview');
  const [showBalanceDetails, setShowBalanceDetails] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Top-Up Modal State
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(100);

  // Custom Promo Input
  const [inputCouponCode, setInputCouponCode] = useState('');

  // Selected Transaction for Receipt Modal
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Filter for Transactions
  const [txnSearch, setTxnSearch] = useState('');
  const [txnFilterCategory, setTxnFilterCategory] = useState<string>('All');

  // Wallet Balances State
  const [depositBalance, setDepositBalance] = useState<number>(0);
  const [bonusBalance, setBonusBalance] = useState<number>(0);
  const [totalCashbackEarned, setTotalCashbackEarned] = useState<number>(0);
  const [totalReferralEarnings, setTotalReferralEarnings] = useState<number>(0);
  const [referralCode, setReferralCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const totalBalance = depositBalance + bonusBalance;

  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Fetch real wallet data
  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Ensure wallet exists and subscribe
    const setupWallet = async () => {
      try {
        await WalletService.ensureWallet(currentUser.uid);
        
        // Fetch referral info
        const refInfo = await ReferralService.getReferralInfo(currentUser.uid);
        setReferralCode(refInfo.referralCode || 'TAAZA' + currentUser.uid.slice(-4).toUpperCase());

        // Initial transactions fetch
        const txns = await WalletService.getTransactions(currentUser.uid);
        const sortedTxns = [...txns].sort((a, b) => {
          const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
          const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
          return timeB - timeA;
        });
        const mappedTxns: Transaction[] = sortedTxns.map(t => ({
          id: t.id,
          type: t.type,
          category: (t.reason.includes('Referral') ? 'Referral Bonus' : 
                     t.reason.includes('Top-Up') ? 'Top-Up' : 
                     t.reason.includes('Cashback') ? 'Cashback' : 
                     t.reason.includes('Meal') ? 'Meal Order' : 'Top-Up') as any,
          title: t.reason,
          amount: t.amount,
          timestamp: t.createdAt?.toDate ? t.createdAt.toDate().toLocaleString() : 'Recent',
          status: 'Completed',
          refId: t.referenceId || t.id.slice(0, 8).toUpperCase(),
          method: t.type === 'credit' ? 'Razorpay / System' : 'Wallet'
        }));
        setTransactions(mappedTxns);
      } catch (err) {
        console.error("Wallet initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    setupWallet();

    const unsubscribe = WalletService.subscribeToWallet(currentUser.uid, (wallet) => {
      if (wallet) {
        setDepositBalance(wallet.balance);
        setBonusBalance(wallet.cashbackAvailable || 0);
        setTotalCashbackEarned(wallet.cashbackLifetime || 0);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Available Coupons State
  const [coupons] = useState<Coupon[]>([
    {
      id: 'c1',
      code: 'TAAZA100',
      discount: '₹100 OFF',
      description: 'Get flat ₹100 discount on monthly meal subscriptions above ₹1,500.',
      minOrder: 1500,
      expiryDate: '31 Aug 2026',
      category: 'Subscription',
      isExpired: false
    },
    {
      id: 'c2',
      code: 'PROTEIN30',
      discount: '30% CASHBACK',
      description: 'Earn up to ₹250 instant cashback into Taaza Wallet on High Protein plans.',
      minOrder: 999,
      expiryDate: '15 Aug 2026',
      category: 'All Meals',
      isExpired: false
    },
    {
      id: 'c3',
      code: 'DETOXFREE',
      discount: 'FREE ADD-ON',
      description: 'Complimentary Green Detox Smoothie with any 7-day meal plan.',
      minOrder: 700,
      expiryDate: '28 Aug 2026',
      category: 'Add-on',
      isExpired: false
    },
    {
      id: 'c4',
      code: 'WELCOME50',
      discount: '50% OFF',
      description: 'Welcome reward for new subscribers on first delivery slot.',
      minOrder: 500,
      expiryDate: '01 Aug 2026',
      category: 'Subscription',
      isExpired: false
    }
  ]);

  // Referral History Records
  const [referrals] = useState<ReferralRecord[]>([
    {
      id: 'ref1',
      friendName: 'Sneha Kulkarni',
      friendAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fm=webp&fit=crop&q=80&w=150',
      joinedDate: '22 Jul 2026',
      status: 'Completed',
      rewardEarned: 500
    },
    {
      id: 'ref2',
      friendName: 'Rohan Mehta',
      friendAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fm=webp&fit=crop&q=80&w=150',
      joinedDate: '18 Jul 2026',
      status: 'Completed',
      rewardEarned: 500
    },
    {
      id: 'ref3',
      friendName: 'Ananya Sharma',
      friendAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fm=webp&fit=crop&q=80&w=150',
      joinedDate: '14 Jul 2026',
      status: 'Completed',
      rewardEarned: 500
    },
    {
      id: 'ref4',
      friendName: 'Kavita Roy',
      friendAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fm=webp&fit=crop&q=80&w=150',
      joinedDate: '20 Jul 2026',
      status: 'Pending First Meal',
      rewardEarned: 0
    }
  ]);

  // Copy Code Handler
  const handleCopyCode = async (code: string) => {
    triggerHaptic('light');
    await safeCopyToClipboard(code);
    setCopiedCode(code);
    showToast(`Copied code "${code}" to clipboard!`, "success");
    setTimeout(() => setCopiedCode(null), 3000);
  };

  // Load Razorpay Script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePaymentVerification = async (
    orderId: string,
    paymentId: string,
    signature: string
  ) => {
    try {
      setIsLoading(true);
      
      const authHeaders = await getAuthHeaders();
      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          type: "recharge",
          amount: topUpAmount,
          notes: {
            userId: currentUser?.uid
          }
        })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Verification failed");
      }

      showToast(`Successfully added ₹${topUpAmount} to wallet! 🎉`, "success");
      setShowTopUpModal(false);
    } catch (err: any) {
      console.error("Verification error:", err);
      showToast(err.message || "Failed to verify payment. Please contact support.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const triggerRealRazorpay = (orderData: any) => {
    if (!currentUser) return;

    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Taaza Bites",
      description: `Wallet Top-Up - ₹${topUpAmount}`,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fm=webp&fit=crop",
      order_id: orderData.id,
      handler: async function (response: any) {
        await handlePaymentVerification(
          response.razorpay_order_id,
          response.razorpay_payment_id,
          response.razorpay_signature
        );
      },
      prefill: {
        name: currentUser.displayName || "",
        email: currentUser.email || ""
      },
      notes: {
        userId: currentUser.uid,
        type: 'recharge'
      },
      theme: {
        color: "#059669" // emerald 600
      },
      modal: {
        ondismiss: function () {
          showToast("Payment window closed", "warning");
        }
      }
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Failed to construct Razorpay instance", err);
      showToast("Could not launch payment gateway.", "error");
    }
  };

  // Add Money Top-Up Execution
  const handleExecuteTopUp = async () => {
    if (topUpAmount <= 0) return;
    triggerHaptic('medium');

    try {
      setIsLoading(true);
      
      const authHeaders = await getAuthHeaders();
      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ 
          amount: topUpAmount,
          notes: {
            userId: currentUser?.uid,
            type: 'recharge'
          }
        })
      });

      if (!response.ok) {
        throw new Error("Failed to create top-up order");
      }

      const orderData = await response.json();
      
      const scriptLoaded = await loadRazorpayScript();
      if (scriptLoaded && !orderData.isSandbox) {
        triggerRealRazorpay(orderData);
      } else {
        // Run Sandbox Simulation for testing
        showToast("Processing simulated sandbox top-up... 💸", "info");
        const mockPaymentId = `pay_sim_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
        await handlePaymentVerification(
          orderData.id,
          mockPaymentId,
          "sandbox_sig_approved"
        );
      }
    } catch (err: any) {
      console.error("Top-up error:", err);
      showToast(err.message || "Failed to initiate top-up", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Apply Promo Input
  const handleApplyCustomPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCouponCode.trim()) return;

    triggerHaptic('medium');
    const matched = coupons.find(c => c.code.toUpperCase() === inputCouponCode.trim().toUpperCase());
    
    if (matched) {
      showToast(`Coupon "${matched.code}" applied! You saved ${matched.discount}! 🎉`, "success");
      setInputCouponCode('');
    } else {
      showToast(`Invalid or expired promo code: "${inputCouponCode}"`, "error");
    }
  };

  // Filtered Transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(txnSearch.toLowerCase()) || t.refId.toLowerCase().includes(txnSearch.toLowerCase());
    const matchesCategory = txnFilterCategory === 'All' || t.category === txnFilterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-8">

          <PageHeader 
            title="Digital Wallet & Rewards"
            description="Manage your balance, redeem exclusive meal coupons, claim daily cashback rewards, and track referral earnings."
            badge="TaazaPay Cash Wallet"
            icon={WalletIcon}
            gradient="from-zinc-950 via-zinc-900 to-emerald-950"
            children={
              <div className="flex items-center gap-3">
                <QRScannerButton variant="button" />
                <Button
                  onClick={() => setShowTopUpModal(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest px-6 h-12 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Money
                </Button>
              </div>
            }
          />

          {/* Navigation Tabs Bar */}
          <div className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[2.5rem] shadow-sm overflow-x-auto hide-scrollbar">
            <div className="flex items-center gap-2">
              {[
                { id: 'overview', label: 'Overview', icon: WalletIcon },
                { id: 'coupons', label: 'Coupons', icon: Tag },
                { id: 'cashback', label: 'Cashback', icon: Percent },
                { id: 'referrals', label: 'Referrals', icon: Users },
                { id: 'transactions', label: 'History', icon: Clock }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as WalletTab); triggerHaptic('light'); }}
                  className={cn(
                    "relative px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap",
                    activeTab === tab.id
                      ? "text-white"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  )}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="walletActiveTabPill"
                      className="absolute inset-0 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-600/20"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <tab.icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.995 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* TAB 1: WALLET & BALANCE OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Virtual Metallic Card & Balance Box */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="p-10 sm:p-12 bg-gradient-to-br from-zinc-900 via-emerald-950 to-zinc-950 text-white rounded-[3rem] shadow-2xl relative overflow-hidden border border-white/10 space-y-10">
                      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                      {/* Card Header */}
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-[1.25rem] bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-black text-emerald-400 text-lg shadow-inner">
                            TP
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-0.5">TaazaPay Platinum</p>
                            <p className="text-xs font-bold text-zinc-400">Subscriber Cash Pass</p>
                          </div>
                        </div>

                        <button
                          onClick={() => setShowBalanceDetails(!showBalanceDetails)}
                          className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-zinc-300 transition-all cursor-pointer backdrop-blur-md border border-white/5"
                        >
                          {showBalanceDetails ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>

                      {/* Total Balance Big Number */}
                      <div className="space-y-2 relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Available Balance</span>
                        <div className="flex items-baseline gap-4">
                          <span className="text-5xl sm:text-7xl font-black tracking-tighter">
                            {showBalanceDetails ? `₹${totalBalance.toLocaleString()}` : '••••••••'}
                          </span>
                          <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-4 py-1.5 rounded-full uppercase tracking-widest">
                            Active
                          </span>
                        </div>
                      </div>

                      {/* Breakdown Split Pills */}
                      <div className="grid grid-cols-2 gap-6 pt-10 border-t border-white/10 relative z-10">
                        <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all group">
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 group-hover:text-zinc-300 transition-colors">Main Deposit</p>
                          <p className="text-2xl font-black text-white">
                            {showBalanceDetails ? `₹${depositBalance.toLocaleString()}` : '••••'}
                          </p>
                          <p className="text-[9px] text-zinc-500 font-bold mt-2 uppercase tracking-wider">100% Usable</p>
                        </div>

                        <div className="p-6 bg-amber-500/10 rounded-[2rem] border border-amber-500/20 hover:bg-amber-500/20 transition-all group">
                          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2 group-hover:text-amber-400 transition-colors">Bonus & Cashback</p>
                          <p className="text-2xl font-black text-amber-400">
                            {showBalanceDetails ? `₹${bonusBalance.toLocaleString()}` : '••••'}
                          </p>
                          <p className="text-[9px] text-amber-500/60 font-bold mt-2 uppercase tracking-wider">Auto-applied</p>
                        </div>
                      </div>
                    </Card>

                    {/* Quick Top-Up Preset Options */}
                    <Card className="p-10 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[3rem] shadow-sm space-y-8">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                          Recharge Wallet
                        </h4>
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest">Instant Add</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          { amount: 10, bonus: 0, tag: 'Quick' },
                          { amount: 100, bonus: 0, tag: 'Standard' },
                          { amount: 500, bonus: 0, tag: 'Popular' },
                          { amount: 1000, bonus: 100, tag: '10% Extra' }
                        ].map(opt => (
                          <button
                            key={opt.amount}
                            onClick={() => {
                              setTopUpAmount(opt.amount);
                              setShowTopUpModal(true);
                              triggerHaptic('light');
                            }}
                            className="p-5 rounded-[2rem] bg-zinc-50 dark:bg-zinc-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 text-left transition-all group cursor-pointer shadow-sm"
                          >
                            <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2 block">{opt.tag}</span>
                            <h5 className="text-2xl font-black text-zinc-900 dark:text-white">₹{opt.amount}</h5>
                          </button>
                        ))}
                      </div>

                      <div className="pt-2">
                        <Button
                          onClick={() => {
                            setTopUpAmount(1);
                            setShowTopUpModal(true);
                            triggerHaptic('medium');
                          }}
                          className="w-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-black text-[10px] uppercase tracking-widest h-14 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm"
                        >
                          Add Custom Amount (Min ₹1)
                        </Button>
                      </div>
                    </Card>
                  </div>

                  {/* Lifetime Earnings Summary Panel */}
                  <div className="space-y-6">
                    <Card className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[3rem] shadow-sm space-y-8">
                      <div>
                        <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                          Savings Engine
                        </h4>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1 opacity-60">Your Ecosystem Rewards</p>
                      </div>

                      <div className="space-y-4">
                        <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 rounded-[2rem] border border-emerald-500/20 flex items-center justify-between group hover:border-emerald-500/40 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                              <Percent className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-zinc-900 dark:text-white">Cashback</p>
                              <p className="text-[10px] text-zinc-500 font-bold">Daily Check-ins</p>
                            </div>
                          </div>
                          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                            ₹{totalCashbackEarned}
                          </span>
                        </div>

                        <div className="p-6 bg-amber-50 dark:bg-amber-950/40 rounded-[2rem] border border-amber-500/20 flex items-center justify-between group hover:border-amber-500/40 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                              <Users className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-zinc-900 dark:text-white">Referral Cash</p>
                              <p className="text-[10px] text-zinc-500 font-bold">7 Successful Invites</p>
                            </div>
                          </div>
                          <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                            ₹{totalReferralEarnings}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() => { setActiveTab('referrals'); triggerHaptic('light'); }}
                        className="w-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-2xl h-14 shadow-xl hover:translate-y-[-2px] transition-all"
                      >
                        Invite & Earn ₹500
                      </Button>
                    </Card>

                    <Card className="p-8 bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-950 dark:bg-zinc-700 flex items-center justify-center text-white shrink-0">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">Secure Payments</p>
                        <p className="text-[10px] text-zinc-500 font-medium">PCI-DSS Compliant Encryption</p>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {/* TAB 2: COUPONS & PROMO VAULT */}
              {activeTab === 'coupons' && (
                <div className="space-y-8">
                  {/* Custom Promo Input Bar */}
                  <Card className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[3rem] shadow-sm">
                    <form onSubmit={handleApplyCustomPromo} className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="relative flex-1 w-full">
                        <Tag className="w-5 h-5 text-zinc-400 absolute left-5 top-4" />
                        <input
                          type="text"
                          value={inputCouponCode}
                          onChange={(e) => setInputCouponCode(e.target.value)}
                          placeholder="Enter custom promo code (e.g. TAAZA100)"
                          className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-[1.5rem] pl-14 pr-6 py-4 text-xs sm:text-sm font-black uppercase tracking-widest focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={!inputCouponCode.trim()}
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest rounded-[1.5rem] h-14 px-10 shrink-0 shadow-lg shadow-emerald-600/20"
                      >
                        Redeem Code
                      </Button>
                    </form>
                  </Card>

                  {/* Coupons List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {coupons.map(coupon => (
                      <Card key={coupon.id} className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[3rem] shadow-sm flex flex-col justify-between space-y-8 relative overflow-hidden group hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all">
                        <div className="space-y-5 relative z-10">
                          <div className="flex items-center justify-between">
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                              {coupon.category}
                            </span>
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                              <Clock className="w-3 h-3" />
                              {coupon.expiryDate}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h3 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">{coupon.discount}</h3>
                            <p className="text-sm text-zinc-500 font-medium leading-relaxed">{coupon.description}</p>
                          </div>

                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest opacity-60">
                            Min Order Value: ₹{coupon.minOrder}
                          </p>
                        </div>

                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/80 rounded-[1.5rem] border border-dashed border-zinc-200 dark:border-zinc-700 flex items-center justify-between relative z-10 group-hover:bg-white dark:group-hover:bg-zinc-800 transition-colors">
                          <span className="text-base font-black tracking-[0.2em] text-emerald-600 dark:text-emerald-400 font-mono">
                            {coupon.code}
                          </span>
                          <Button
                            onClick={() => handleCopyCode(coupon.code)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-widest rounded-xl h-10 px-5 shadow-lg shadow-emerald-600/10"
                          >
                            {copiedCode === coupon.code ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                            {copiedCode === coupon.code ? 'Copied' : 'Copy'}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: CASHBACK ENGINE */}
              {activeTab === 'cashback' && (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="p-10 bg-gradient-to-br from-emerald-950 via-zinc-900 to-zinc-950 text-white rounded-[3rem] shadow-2xl space-y-6 relative overflow-hidden">
                      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                        <Coins className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 opacity-80">Total Cashback Claimed</span>
                        <p className="text-5xl font-black text-white tracking-tighter">₹{totalCashbackEarned}</p>
                      </div>
                      <p className="text-xs text-zinc-400 font-medium">Automatically credited to your TaazaPay wallet after every validated check-in.</p>
                    </Card>

                    <Card className="p-10 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[3rem] shadow-sm space-y-6 group hover:border-amber-500/30 transition-all">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white transition-all">
                        <Flame className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Daily Meal Streak</span>
                        <p className="text-2xl font-black text-zinc-900 dark:text-white">5% Instant Back</p>
                      </div>
                      <p className="text-xs text-zinc-500 font-medium leading-relaxed">Earn 5% cashback on your meal value every single day you complete your streak milestones.</p>
                    </Card>

                    <Card className="p-10 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[3rem] shadow-sm space-y-6 group hover:border-sky-500/30 transition-all">
                      <div className="w-14 h-14 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-600 border border-sky-500/20 group-hover:bg-sky-500 group-hover:text-white transition-all">
                        <RefreshCw className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-sky-600">Renewal Bonus</span>
                        <p className="text-2xl font-black text-zinc-900 dark:text-white">Up to ₹500 Back</p>
                      </div>
                      <p className="text-xs text-zinc-500 font-medium leading-relaxed">Receive instant wallet credits when you renew your 30-day meal subscriptions before they expire.</p>
                    </Card>
                  </div>

                  <Card className="p-12 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[3.5rem] flex flex-col md:flex-row items-center gap-12">
                    <div className="w-full md:w-1/3 flex justify-center">
                      <div className="relative">
                        <div className="w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl absolute inset-0" />
                        <motion.div
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="relative z-10 w-40 h-40 bg-white dark:bg-zinc-800 rounded-[2.5rem] shadow-2xl flex items-center justify-center text-emerald-500 border border-zinc-100 dark:border-zinc-700"
                        >
                          <Gift className="w-20 h-20" />
                        </motion.div>
                      </div>
                    </div>
                    <div className="space-y-6 text-center md:text-left">
                      <h3 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">Unlock "Elite Tier" Rewards</h3>
                      <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-xl">
                        Keep earning cashback to unlock higher tier rewards. Elite members get 10% daily cashback, priority delivery slots, and exclusive early access to seasonal limited-edition meals.
                      </p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                          <Award className="w-3.5 h-3.5" /> Platinum Status: Active
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                          <Sparkles className="w-3.5 h-3.5" /> Next Tier: Diamond
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* TAB 4: REFERRAL EARNINGS */}
              {activeTab === 'referrals' && (
                <div className="space-y-10">
                  {/* Claim Referral Card */}
                  <ClaimReferralCard onSuccess={() => {
                    fetchWalletData();
                  }} />

                  {/* Referral Banner & Code Share Box */}
                  <Card className="p-12 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white rounded-[3.5rem] shadow-2xl space-y-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                    
                    <div className="space-y-4 max-w-2xl relative z-10">
                      <span className="px-4 py-1.5 bg-white/20 border border-white/30 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                        Growth Program
                      </span>
                      <h2 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none">Give ₹250, <br /><span className="text-amber-100">Get ₹500</span></h2>
                      <p className="text-sm sm:text-lg text-amber-50 font-medium leading-relaxed opacity-90 max-w-lg">
                        Invite your friends to switch to organic, customized meal subscriptions. They get ₹250 off their first order, and you earn ₹500 wallet cash instantly.
                      </p>
                    </div>

                    {/* Code Box */}
                    <div className="p-6 bg-zinc-950/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
                      <div className="text-center lg:text-left flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 flex items-center justify-center text-amber-300 border border-amber-500/30">
                          <Share2 className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1">Your Personal Invite Code</p>
                          <p className="text-3xl font-black font-mono text-white tracking-[0.3em]">{referralCode || 'ALEX500'}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                        <Button
                          onClick={() => handleCopyCode(referralCode || "ALEX500")}
                          className="w-full sm:w-auto bg-white text-zinc-950 hover:bg-amber-50 font-black text-[10px] uppercase tracking-widest h-14 px-10 rounded-2xl shadow-xl"
                        >
                          Copy My Code
                        </Button>
                        <Button
                          onClick={() => {
                            triggerHaptic('medium');
                            const code = referralCode || "ALEX500";
                            const link = `${window.location.origin}/subscribe?ref=${code}`;
                            const msg = `🌱 Hey! Get ₹250 OFF on your first fresh, organic TaazaBites meal plan! 🥗✨\n\nUse my personal referral code: *${code}*\n\nSign up & claim your discount here:\n${link}\n\nChef-crafted, healthy organic meals delivered fresh to your door! 🚀`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                          }}
                          className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest h-14 px-10 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                        >
                          <MessageCircle className="w-5 h-5" /> Share via WhatsApp
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Referred Friends History */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <Card className="p-10 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[3rem] shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-black text-zinc-900 dark:text-white">Referral Network</h3>
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 px-4 py-1.5 rounded-full">
                            {referrals.length} Friends Invited
                          </span>
                        </div>

                        <div className="space-y-4">
                          {referrals.map(ref => (
                            <div key={ref.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-zinc-50 dark:bg-zinc-800/40 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 hover:border-amber-500/20 hover:bg-white dark:hover:bg-zinc-800 transition-all gap-4">
                              <div className="flex items-center gap-5">
                                <img src={ref.friendAvatar} alt={ref.friendName} className="w-14 h-14 rounded-2xl object-cover shadow-md border-2 border-white dark:border-zinc-700" referrerPolicy="no-referrer" loading="lazy" />
                                <div>
                                  <h4 className="text-base font-black text-zinc-900 dark:text-white mb-0.5">{ref.friendName}</h4>
                                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Invited {ref.joinedDate}</p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0 border-zinc-200 dark:border-zinc-700">
                                <span className={cn(
                                  "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                  ref.status === 'Completed' 
                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" 
                                    : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                                )}>
                                  {ref.status}
                                </span>
                                <span className="text-xl font-black text-zinc-900 dark:text-white">
                                  {ref.rewardEarned > 0 ? `+₹${ref.rewardEarned}` : '₹0'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>

                    <div className="space-y-6">
                      <Card className="p-10 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[3rem] shadow-sm space-y-8">
                        <h4 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-wider">How it works</h4>
                        <div className="space-y-8">
                          {[
                            { step: 1, title: 'Share Code', desc: 'Send your code to friends who love healthy food.' },
                            { step: 2, title: 'They Sign Up', desc: 'They get ₹250 OFF their first subscription.' },
                            { step: 3, title: 'You Earn', desc: 'You get ₹500 credited when they finish their first week.' }
                          ].map(s => (
                            <div key={s.step} className="flex gap-5">
                              <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-zinc-400 text-sm shrink-0 border border-zinc-200 dark:border-zinc-700">
                                {s.step}
                              </div>
                              <div>
                                <p className="text-sm font-black text-zinc-900 dark:text-white mb-1">{s.title}</p>
                                <p className="text-xs text-zinc-500 font-medium leading-relaxed">{s.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: TRANSACTIONS LEDGER */}
              {activeTab === 'transactions' && (
                <div className="space-y-8">
                  {/* Filter & Search Controls */}
                  <Card className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[2.5rem] shadow-sm space-y-6">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                      <div className="relative w-full lg:w-96">
                        <Search className="w-5 h-5 text-zinc-400 absolute left-5 top-4" />
                        <input
                          type="text"
                          value={txnSearch}
                          onChange={(e) => setTxnSearch(e.target.value)}
                          placeholder="Search receipts, Ref IDs..."
                          className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl pl-14 pr-6 py-4 text-xs font-black tracking-widest focus:outline-none focus:border-emerald-500 transition-all"
                        />
                      </div>

                      <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar w-full lg:w-auto pb-1 lg:pb-0">
                        {['All', 'Top-Up', 'Meal Order', 'Cashback', 'Referral Bonus'].map(cat => (
                          <button
                            key={cat}
                            onClick={() => setTxnFilterCategory(cat)}
                            className={cn(
                              "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap border",
                              txnFilterCategory === cat
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-600/20"
                                : "bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </Card>

                  {/* Transactions Ledger */}
                  <Card className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[3rem] shadow-sm divide-y divide-zinc-100 dark:divide-zinc-800">
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map(txn => (
                        <div
                          key={txn.id}
                          onClick={() => setSelectedTransaction(txn)}
                          className="flex items-center justify-between p-6 first:pt-0 last:pb-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded-[2rem] transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-6">
                            <div className={cn(
                              "w-14 h-14 rounded-[1.5rem] flex items-center justify-center font-black shrink-0 transition-all group-hover:scale-110 shadow-sm",
                              txn.type === 'credit' 
                                ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-500/20" 
                                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
                            )}>
                              {txn.type === 'credit' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                            </div>

                            <div>
                              <h4 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white mb-1">{txn.title}</h4>
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{txn.timestamp}</span>
                                <span className="w-1 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
                                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">ID: {txn.refId}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className={cn(
                              "text-lg sm:text-xl font-black mb-1",
                              txn.type === 'credit' ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-900 dark:text-white"
                            )}>
                              {txn.type === 'credit' ? '+' : '-'}₹{txn.amount}
                            </p>
                            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/10">
                              {txn.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-300 dark:text-zinc-600">
                          <Search className="w-10 h-10" />
                        </div>
                        <div>
                          <p className="text-base font-black text-zinc-900 dark:text-white">No transactions found</p>
                          <p className="text-xs text-zinc-500 font-medium">Try adjusting your filters or search query.</p>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

        </div>

        {/* TOP-UP MODAL */}
        <AnimatePresence>
          {showTopUpModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[3.5rem] p-10 space-y-8 shadow-2xl relative"
              >
                <button
                  onClick={() => setShowTopUpModal(false)}
                  className="absolute top-8 right-8 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer border border-zinc-200 dark:border-zinc-700"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="space-y-3">
                  <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                    Wallet Recharge
                  </span>
                  <h3 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">Add Money</h3>
                  <p className="text-sm text-zinc-500 font-medium">Top up your balance for instant, seamless checkout.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Enter Amount (Min ₹1)</label>
                    <div className="flex gap-2 flex-wrap">
                      {[1, 10, 50, 100, 500].map(amt => (
                        <button
                          key={amt}
                          onClick={() => setTopUpAmount(amt)}
                          className="text-[9px] font-black text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/10 hover:bg-emerald-500/20 transition-all cursor-pointer"
                        >
                          +₹{amt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-zinc-400">₹</span>
                    <input
                      type="number"
                      autoFocus
                      min="1"
                      placeholder="0"
                      value={topUpAmount || ""}
                      onChange={(e) => setTopUpAmount(Number(e.target.value))}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-[2rem] pl-14 pr-8 py-8 text-5xl font-black text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-8 focus:ring-emerald-500/5 transition-all"
                    />
                  </div>
                </div>

                <div className="p-6 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10 flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Recharge Bonus</p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      Load ₹1,000 or more to receive <span className="text-emerald-600">10% Extra Credit</span>
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleExecuteTopUp}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-[2rem] h-16 shadow-2xl shadow-emerald-600/30 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Securely Pay ₹{topUpAmount}
                </Button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* TRANSACTION RECEIPT MODAL */}
        <AnimatePresence>
          {selectedTransaction && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[3.5rem] p-10 space-y-10 shadow-2xl relative"
              >
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="absolute top-8 right-8 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer border border-zinc-200 dark:border-zinc-700"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-[2rem] bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-inner border border-emerald-500/20">
                    <FileText className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">Transaction Receipt</h3>
                    <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">{selectedTransaction.refId}</p>
                  </div>
                </div>

                <div className="space-y-4 p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Description</span>
                    <span className="text-sm font-black text-zinc-900 dark:text-white">{selectedTransaction.title}</span>
                  </div>
                  <div className="h-px bg-zinc-200 dark:bg-zinc-700" />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Amount</span>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">₹{selectedTransaction.amount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Time</span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">{selectedTransaction.timestamp}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Method</span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">{selectedTransaction.method || 'Internal Wallet'}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={() => {
                      showToast("Invoice downloaded successfully!", "success");
                      setSelectedTransaction(null);
                    }}
                    className="w-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-[10px] uppercase tracking-widest rounded-2xl h-14 shadow-xl"
                  >
                    <Download className="w-4 h-4 mr-2" /> Save PDF Statement
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      showToast("Support ticket raised for this transaction.", "success");
                      setSelectedTransaction(null);
                    }}
                    className="w-full border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 font-black text-[10px] uppercase tracking-widest rounded-2xl h-14"
                  >
                    Need Help?
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </PageTransition>
    </DashboardLayout>
  );
}
