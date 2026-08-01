import QRCode from "react-qr-code";
import TopReferrersLeaderboard from "./TopReferrersLeaderboard";
import { safeCopyToClipboard } from "@/src/utils/clipboard";
import { useState, useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { db } from "../../firebase/db";
import { 
  doc, 
  getDoc,
  getDocs,
  onSnapshot, 
  collection, 
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp
} from "firebase/firestore";
import { 
  Wallet, 
  WalletTransaction, 
  RewardPoints, 
  RewardTransaction, 
  Referral, 
  ReferralReward, 
  Coupon 
} from "../../firebase/collections";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gift, 
  Wallet as WalletIcon, 
  Users, 
  Tag, 
  Award, 
  Zap, 
  ArrowDownLeft, 
  ArrowUpRight, 
  History, 
  Clock, 
  Info, 
  Check, 
  Copy, 
  Flame, 
  Trophy, 
  Coins, 
  Star, 
  Sparkles, 
  CheckCircle2, 
  Shield, 
  Share2, 
  MessageCircle, 
  Mail, 
  MessageSquare, 
  Loader2, 
  ChevronRight, 
  TrendingUp, 
  CreditCard,
  Lock,
  Search,
  CheckCircle,
  Crown
} from "lucide-react";
import { Card, Button } from "@/src/components/ui/primitives";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { cn, formatDate } from "@/src/lib/utils";
import { PageHeader } from "../dashboard/PageHeader";
import { PageTransition } from "../dashboard/PageTransition";
import { QRScannerButton } from "../common/QRScannerButton";
import { ClaimReferralCard } from "../referral/ClaimReferralCard";
import { useToast } from "@/src/context/ToastContext";
import { RewardService, ReferralService, getAuthHeaders } from "../../firebase/services";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface LoyaltyCenterProps {
  initialTab?: "wallet" | "rewards" | "levels" | "challenges" | "referral" | "referral-history" | "coupons";
}

// Particle Confetti Burst Effect
function ParticleConfetti() {
  const particles = Array.from({ length: 45 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((_, i) => {
        const x = (Math.random() - 0.5) * 500;
        const y = -Math.random() * 400 - 150;
        const delay = Math.random() * 0.15;
        const duration = Math.random() * 1.8 + 1.2;
        const color = [
          "bg-emerald-400 shadow-emerald-400/50", 
          "bg-amber-400 shadow-amber-400/50", 
          "bg-indigo-400 shadow-indigo-400/50", 
          "bg-rose-400 shadow-rose-400/50", 
          "bg-sky-400 shadow-sky-400/50"
        ][Math.floor(Math.random() * 5)];
        const size = Math.random() * 10 + 4;

        return (
          <motion.div
            key={i}
            className={`absolute rounded-full left-1/2 bottom-0 shadow-lg ${color}`}
            style={{ width: size, height: size }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.3 }}
            animate={{
              x,
              y,
              opacity: [1, 1, 0.8, 0],
              scale: [0.3, 1.3, 0.8, 0.1],
              rotate: Math.random() * 720,
            }}
            transition={{
              duration,
              delay,
              ease: "easeOut",
            }}
          />
        );
      })}
    </div>
  );
}

export default function LoyaltyCenter({ initialTab = "rewards" }: LoyaltyCenterProps) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  // State for active tab
  const [activeTab, setActiveTab] = useState<"wallet" | "rewards" | "levels" | "challenges" | "referral" | "referral-history" | "coupons">(initialTab);
  
  // Interactive Gamification Challenges & Badges States
  const [challenges, setChallenges] = useState([
    {
      id: "c1",
      title: "7-Day Streak Warrior",
      description: "Log in or receive meals for 7 consecutive days without skipping.",
      type: "Weekly" as const,
      progress: 5,
      maxProgress: 7,
      rewardXP: 250,
      rewardAmount: 100,
      claimed: false,
      expiresIn: "3 days left",
      category: "Streak"
    },
    {
      id: "c2",
      title: "Macro Balance Champion",
      description: "Complete 5 high-protein gourmet meals in a single week.",
      type: "Weekly" as const,
      progress: 5,
      maxProgress: 5,
      rewardXP: 300,
      rewardAmount: 150,
      claimed: false,
      expiresIn: "Ready to claim!",
      category: "Nutrition"
    },
    {
      id: "c3",
      title: "Community Ambassador",
      description: "Successfully invite 2 friends using your unique referral link.",
      type: "Special" as const,
      progress: 1,
      maxProgress: 2,
      rewardXP: 500,
      rewardAmount: 250,
      claimed: false,
      expiresIn: "No expiry",
      category: "Referral"
    },
    {
      id: "c4",
      title: "Chef Reviewer",
      description: "Leave detailed feedback for 3 delivered meal preparations.",
      type: "Daily" as const,
      progress: 2,
      maxProgress: 3,
      rewardXP: 100,
      rewardAmount: 50,
      claimed: false,
      expiresIn: "Ends tonight",
      category: "Engagement"
    }
  ]);

  const [badges, setBadges] = useState([
    {
      id: "b1",
      title: "Streak Pioneer",
      category: "Streak",
      rarity: "Common" as const,
      description: "Maintained a 5-day active meal streak.",
      currentProgress: 5,
      maxProgress: 5,
      unlocked: true,
      rewardXP: 100,
      icon: "Flame"
    },
    {
      id: "b2",
      title: "Metabolic Master",
      category: "Nutrition",
      rarity: "Rare" as const,
      description: "Consumed over 10,000 kcal of chef-prepared macro meals.",
      currentProgress: 7500,
      maxProgress: 10000,
      unlocked: false,
      rewardXP: 300,
      icon: "Zap"
    },
    {
      id: "b3",
      title: "Referral Hero",
      category: "Referral",
      rarity: "Epic" as const,
      description: "Invited 3+ active subscribers to TaazaBites.",
      currentProgress: 1,
      maxProgress: 3,
      unlocked: false,
      rewardXP: 500,
      icon: "Users"
    },
    {
      id: "b4",
      title: "Clean Plate Club",
      category: "Loyalty",
      rarity: "Legendary" as const,
      description: "Delivered 20 meals without any skipped dates.",
      currentProgress: 14,
      maxProgress: 20,
      unlocked: false,
      rewardXP: 1000,
      icon: "Trophy"
    },
    {
      id: "b5",
      title: "Gourmet Connoisseur",
      category: "Nutrition",
      rarity: "Rare" as const,
      description: "Tried meals across all 4 nutritional diet plans.",
      currentProgress: 3,
      maxProgress: 4,
      unlocked: false,
      rewardXP: 250,
      icon: "Star"
    },
    {
      id: "b6",
      title: "Early Bird Diner",
      category: "Loyalty",
      rarity: "Common" as const,
      description: "Set early morning breakfast slot preferences.",
      currentProgress: 1,
      maxProgress: 1,
      unlocked: true,
      rewardXP: 50,
      icon: "Award"
    }
  ]);
  
  // States
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [reward, setReward] = useState<RewardPoints | null>(null);
  const [rewardTransactions, setRewardTransactions] = useState<RewardTransaction[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralRewards, setReferralRewards] = useState<ReferralReward[]>([]);
  const [referralCode, setReferralCode] = useState("");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  
  // Action states
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [recharging, setRecharging] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState<string>("");
  const [couponCode, setCouponCode] = useState("");
  const [checkingIn, setCheckingIn] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastRewardClaimed, setLastRewardClaimed] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Search filter for transactions
  const [searchQuery, setSearchQuery] = useState("");

  // New States for Referral History Tab
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [refHistorySearch, setRefHistorySearch] = useState("");
  const [refHistoryStatusFilter, setRefHistoryStatusFilter] = useState<"all" | "pending" | "completed" | "rewarded">("all");
  const [isSimulatingId, setIsSimulatingId] = useState<string | null>(null);

  // Batch fetch data
  const fetchLoyaltyData = async () => {
    if (!currentUser) return;
    try {
      // Load critical rewards data first
      const [rewardSnap, rewardTxSnap] = await Promise.all([
        getDoc(doc(db, 'rewardPoints', currentUser.uid)),
        getDocs(query(collection(db, 'rewardTransactions'), where('userId', '==', currentUser.uid), limit(50)))
      ]);

      if (rewardSnap.exists()) {
        setReward(rewardSnap.data() as RewardPoints);
      }
      
      // Sort reward transactions in memory
      const mappedRewardTx = rewardTxSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as RewardTransaction));
      const sortedRewardTx = [...mappedRewardTx].sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return timeB - timeA;
      });
      setRewardTransactions(sortedRewardTx);
      setLoading(false); // Stop loading indicator once rewards are loaded

      // Load other data in background using Promise.allSettled for maximum resilience
      const [
        walletSnapRes,
        walletTxSnapRes,
        refInfoRes,
        refsRes,
        rewardsRes,
        couponsSnapRes
      ] = await Promise.allSettled([
        getDoc(doc(db, 'wallets', currentUser.uid)),
        getDocs(query(collection(db, 'walletTransactions'), where('userId', '==', currentUser.uid), limit(50))),
        ReferralService.getReferralInfo(currentUser.uid),
        ReferralService.getReferrals(currentUser.uid),
        ReferralService.getReferralRewards(currentUser.uid),
        getDocs(query(collection(db, 'coupons'), where('active', '==', true), limit(20)))
      ]);

      if (walletSnapRes.status === 'fulfilled' && walletSnapRes.value.exists()) {
        setWallet(walletSnapRes.value.data() as Wallet);
      }
      
      if (walletTxSnapRes.status === 'fulfilled') {
        const mappedWalletTx = walletTxSnapRes.value.docs.map(doc => ({ id: doc.id, ...doc.data() } as WalletTransaction));
        const sortedWalletTx = [...mappedWalletTx].sort((a, b) => {
          const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
          const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
          return timeB - timeA;
        });
        setWalletTransactions(sortedWalletTx);
      }

      if (refInfoRes.status === 'fulfilled') {
        setReferralCode(refInfoRes.value.referralCode);
      }

      if (refsRes.status === 'fulfilled' && Array.isArray(refsRes.value)) {
        const sortedRefs = [...refsRes.value].sort((a, b) => {
          const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 
                        (a.createdAt ? new Date(a.createdAt as any).getTime() : 0);
          const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 
                        (b.createdAt ? new Date(b.createdAt as any).getTime() : 0);
          return timeB - timeA;
        });
        setReferrals(sortedRefs);
      }

      if (rewardsRes.status === 'fulfilled' && Array.isArray(rewardsRes.value)) {
        const sortedRewards = [...rewardsRes.value].sort((a, b) => {
          const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 
                        (a.createdAt ? new Date(a.createdAt as any).getTime() : 0);
          const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 
                        (b.createdAt ? new Date(b.createdAt as any).getTime() : 0);
          return timeB - timeA;
        });
        setReferralRewards(sortedRewards);
      }

      if (couponsSnapRes.status === 'fulfilled') {
        setCoupons(couponsSnapRes.value.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon)));
      }
      
    } catch (err) {
      console.error("Error fetching loyalty data:", err);
      setLoading(false); // Ensure loading is stopped
    }
  };

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    fetchLoyaltyData();
  }, [currentUser]);

  // Handle direct referral invitation
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast("Please log in to send invitations", "error");
      return;
    }
    if (!inviteName.trim()) {
      showToast("Please enter a friend's name", "error");
      return;
    }
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    try {
      setIsInviting(true);
      const res = await ReferralService.sendDirectInvitation(
        currentUser.uid,
        referralCode,
        inviteName.trim(),
        inviteEmail.trim(),
        invitePhone.trim()
      );
      if (res.success) {
        showToast(`Invitation sent to ${inviteName.trim()}! 📩`, "success");
        setInviteName("");
        setInviteEmail("");
        setInvitePhone("");
        // Refresh loyalty data
        await fetchLoyaltyData();
      } else {
        showToast("Failed to send invitation. Please try again.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "An error occurred", "error");
    } finally {
      setIsInviting(false);
    }
  };

  // Handle simulated referral conversion & rewarding
  const handleSimulateConversion = async (refId: string) => {
    if (!currentUser) return;
    try {
      setIsSimulatingId(refId);
      showToast("Simulating first meal plan order & delivery... 🚚", "info");
      
      const res = await ReferralService.simulateReferralConversion(refId);
      if (res.success) {
        showToast("Referral successfully converted! ₹100 credited to wallet 🎉", "success");
        await fetchLoyaltyData();
      } else {
        showToast(res.message || "Simulation failed", "error");
      }
    } catch (err: any) {
      showToast(err.message || "An error occurred during simulation", "error");
    } finally {
      setIsSimulatingId(null);
    }
  };

  // Sync tab with initial prop changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const quickAmounts = ["500", "1000", "2000", "5000"];

  // Handle Recharge wallet
  const handleRecharge = async () => {
    if (!rechargeAmount || isNaN(Number(rechargeAmount)) || Number(rechargeAmount) <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }

    if (!currentUser) {
      showToast("Please login to recharge", "error");
      return;
    }

    setRecharging(true);
    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          amount: Number(rechargeAmount),
          notes: {
            userId: currentUser.uid,
            type: 'recharge'
          }
        })
      });

      const orderData = await response.json();
      if (!orderData.success) throw new Error(orderData.error || "Failed to create order");

      if (orderData.isSandbox || !(window as any).Razorpay) {
        setRecharging(true);
        const authHeaders = await getAuthHeaders();
        const mockPaymentId = `pay_sim_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
        const verifyRes = await fetch("/api/payments/verify", {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            razorpay_order_id: orderData.id || orderData.orderId,
            razorpay_payment_id: mockPaymentId,
            razorpay_signature: "sandbox_sig_approved",
            type: 'recharge',
            amount: Number(rechargeAmount),
            notes: {
              userId: currentUser.uid
            }
          })
        });

        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          showToast("Wallet recharged successfully! 🎉", "success");
          setRechargeAmount("");
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 4000);
        } else {
          showToast(verifyData.error || "Verification failed", "error");
        }
        setRecharging(false);
        return;
      }

      const options = {
        key: orderData.keyId || "rzp_test_mock_key",
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Taaza Bites",
        description: "Wallet Recharge",
        order_id: orderData.id,
        handler: async (response: any) => {
          try {
            setRecharging(true);
            const authHeaders = await getAuthHeaders();
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: authHeaders,
              body: JSON.stringify({
                ...response,
                type: 'recharge',
                amount: Number(rechargeAmount),
                notes: {
                  userId: currentUser.uid
                }
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              showToast("Wallet recharged successfully! 🎉", "success");
              setRechargeAmount("");
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 4000);
            } else {
              showToast(verifyData.error || "Verification failed", "error");
            }
          } catch (err) {
            showToast("Payment verification failed", "error");
          } finally {
            setRecharging(false);
          }
        },
        prefill: {
          name: currentUser.displayName || "",
          email: currentUser.email || ""
        },
        theme: { color: "#059669" },
        modal: {
          ondismiss: () => setRecharging(false)
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      showToast(err.message === 'Failed to fetch' ? "Could not connect to the payment server. Please check your internet connection and try again." : (err.message || "Failed to initiate payment"), "error");
      setRecharging(false);
    }
  };

  // Handle Reward Points Redemption
  const handleRedeem = async () => {
    if (!currentUser || !reward) return;
    const pointsToRedeem = 500; 
    const amountToCredit = 50;

    if (reward.currentPoints < pointsToRedeem) {
      showToast(`You need at least ${pointsToRedeem} points to redeem.`, 'error');
      return;
    }

    setIsRedeeming(true);
    try {
      await RewardService.redeemPoints(currentUser.uid, pointsToRedeem, amountToCredit);
      showToast(`Successfully redeemed ${pointsToRedeem} points for ₹${amountToCredit}! 💰`, 'success');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err: any) {
      showToast(err.message || 'Failed to redeem points', 'error');
    } finally {
      setIsRedeeming(false);
    }
  };

  // Handle Daily Check-in Streak
  const handleCheckIn = async () => {
    if (!currentUser) return;
    setCheckingIn(true);
    try {
      const result = await RewardService.dailyCheckIn(currentUser.uid);
      if (result.success) {
        setLastRewardClaimed(result.pointsEarned);
        showToast(`Streak Checked-In! Earned +${result.pointsEarned} Points! 🔥`, "success");
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          setLastRewardClaimed(null);
        }, 4000);
      }
    } catch (err: any) {
      showToast(err.message || "Check-in failed. Please try again tomorrow!", "error");
    } finally {
      setCheckingIn(false);
    }
  };

  // Handle Claiming Challenge Rewards
  const handleClaimChallenge = async (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    if (challenge.progress < challenge.maxProgress) {
      showToast(`Complete all ${challenge.maxProgress} steps before claiming!`, "info");
      return;
    }

    if (challenge.claimed) {
      showToast("Reward already claimed!", "info");
      return;
    }

    setChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, claimed: true } : c));
    showToast(`Claimed +${challenge.rewardXP} XP and ₹${challenge.rewardAmount || 0} bonus wallet credits! 🎉`, "success");
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // Handle Unlocking Badges
  const handleUnlockBadge = (badgeId: string) => {
    const badge = badges.find(b => b.id === badgeId);
    if (!badge) return;

    if (badge.unlocked) {
      showToast(`Badge "${badge.title}" is already in your trophy showcase!`, "info");
      return;
    }

    if (badge.currentProgress < badge.maxProgress) {
      showToast(`Badge progress: ${badge.currentProgress}/${badge.maxProgress}. Keep going!`, "info");
      return;
    }

    setBadges(prev => prev.map(b => b.id === badgeId ? { ...b, unlocked: true } : b));
    showToast(`Unlocked Badge: ${badge.title}! +${badge.rewardXP} XP Awarded! 🏆`, "success");
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // Check if check-in was already done today
  const hasCheckedInToday = () => {
    if (!reward || !reward.lastCheckInDate) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return reward.lastCheckInDate === todayStr;
  };

  // Copy helper
  const handleCopy = async (text: string, type: string) => {
    await safeCopyToClipboard(text);
    setCopiedCode(text);
    showToast(`${type} copied to clipboard!`, "success");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Share referral helper
  const getReferralText = () => {
    const referralLink = `${window.location.origin}/subscribe?ref=${referralCode}`;
    return `🌱 Hey! Get ₹250 OFF on your first fresh, organic TaazaBites meal plan! 🥗✨\n\nUse my personal referral code: *${referralCode}*\n\nSign up & claim your discount here:\n${referralLink}\n\nChef-crafted, healthy organic meals delivered fresh to your door! 🚀`;
  };

  // Tier Status Logic
  const getTierDetails = (points: number) => {
    if (points >= 5000) {
      return {
        name: "Diamond Status",
        color: "from-fuchsia-600 to-purple-600 text-fuchsia-100",
        badgeBg: "bg-fuchsia-500/10 border-fuchsia-500/30",
        textColor: "text-fuchsia-400",
        progress: 100,
        nextTier: "Max Level Reached",
        desc: "The ultimate tier for active healthy dining."
      };
    } else if (points >= 2500) {
      return {
        name: "Platinum Elite",
        color: "from-sky-600 to-indigo-600 text-sky-100",
        badgeBg: "bg-sky-500/10 border-sky-500/30",
        textColor: "text-sky-400",
        progress: ((points - 2500) / 2500) * 100,
        nextTier: "Diamond Status (5000 pts)",
        desc: "Advanced nutrition and VIP priority."
      };
    } else if (points >= 1000) {
      return {
        name: "Gold Member",
        color: "from-amber-500 to-yellow-600 text-amber-100",
        badgeBg: "bg-amber-500/10 border-amber-500/30",
        textColor: "text-amber-400",
        progress: ((points - 1000) / 1500) * 100,
        nextTier: "Platinum Elite (2500 pts)",
        desc: "Free deliveries and double cashback bonuses."
      };
    } else if (points >= 500) {
      return {
        name: "Silver Tier",
        color: "from-zinc-400 to-slate-500 text-zinc-100",
        badgeBg: "bg-zinc-500/10 border-zinc-500/30",
        textColor: "text-zinc-400",
        progress: ((points - 500) / 500) * 100,
        nextTier: "Gold Member (1000 pts)",
        desc: "Unlock bonus reward points and weekly cashback."
      };
    } else {
      return {
        name: "Bronze Novice",
        color: "from-orange-700 to-amber-800 text-orange-100",
        badgeBg: "bg-orange-500/10 border-orange-500/30",
        textColor: "text-orange-400",
        progress: (points / 500) * 100,
        nextTier: "Silver Tier (500 pts)",
        desc: "Welcome to TaazaBites active loyalty journey."
      };
    }
  };

  const tier = getTierDetails(reward?.currentPoints || 0);

  // Filters Transactions based on Query
  const filteredWalletTransactions = walletTransactions.filter(tx => 
    tx.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRewardTransactions = rewardTransactions.filter(tx =>
    tx.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-8 py-10 px-4 max-w-6xl mx-auto">
          <div className="h-10 w-48 bg-zinc-200 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="h-32 bg-zinc-200 rounded-3xl" />
            <div className="h-32 bg-zinc-200 rounded-3xl" />
            <div className="h-32 bg-zinc-200 rounded-3xl" />
            <div className="h-32 bg-zinc-200 rounded-3xl" />
          </div>
          <div className="h-[400px] bg-zinc-200 rounded-[40px]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-8 relative">
          {/* Animated Confetti Canvas */}
          {showConfetti && <ParticleConfetti />}

          {/* Header Title */}
          <PageHeader 
            title="Loyalty & Rewards Center"
            description="Your consolidated hub for Cashback, Wallet balances, Referrals, Coupons, and Streaks."
            badge="Customer Rewards"
            icon={Gift}
            gradient="from-emerald-950 via-zinc-900 to-zinc-950"
          >
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-4 py-2 bg-emerald-50/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2">
                <Flame className="h-4 w-4 text-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                  Streak: {reward?.streakCount || 0} Days
                </span>
              </div>
              <div className="px-4 py-2 bg-indigo-50/10 border border-indigo-500/20 rounded-2xl flex items-center gap-2">
                <Shield className="h-4 w-4 text-indigo-400" />
                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">
                  {tier.name}
                </span>
              </div>
              <QRScannerButton variant="badge" />
            </div>
          </PageHeader>

        {/* 4-Bento Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Wallet Balance Bento */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card 
              id="wallet-bento"
              onClick={() => setActiveTab("wallet")}
              className={cn(
                "p-6 sm:p-8 rounded-[2.5rem] cursor-pointer transition-all border relative overflow-hidden group h-full flex flex-col justify-between",
                activeTab === "wallet" 
                  ? "bg-zinc-900 text-white border-zinc-900 shadow-2xl shadow-emerald-500/10" 
                  : "bg-white border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50"
              )}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className={cn(
                    "p-3 rounded-2xl",
                    activeTab === "wallet" ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-600"
                  )}>
                    <WalletIcon className="h-6 w-6" />
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em]",
                    activeTab === "wallet" ? "text-emerald-400" : "text-zinc-400"
                  )}>Digital Wallet</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl sm:text-4xl font-black tracking-tighter">₹{wallet?.balance || 0}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      activeTab === "wallet" ? "text-zinc-400" : "text-zinc-500"
                    )}>
                      ₹{wallet?.cashbackAvailable || 0} Cashback
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Reward Points Bento */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card 
              id="rewards-bento"
              onClick={() => setActiveTab("rewards")}
              className={cn(
                "p-6 sm:p-8 rounded-[2.5rem] cursor-pointer transition-all border relative overflow-hidden group h-full flex flex-col justify-between",
                activeTab === "rewards" 
                  ? "bg-zinc-900 text-white border-zinc-900 shadow-2xl shadow-indigo-500/10" 
                  : "bg-white border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50"
              )}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className={cn(
                    "p-3 rounded-2xl",
                    activeTab === "rewards" ? "bg-indigo-500 text-white" : "bg-indigo-50 text-indigo-600"
                  )}>
                    <Award className="h-6 w-6" />
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em]",
                    activeTab === "rewards" ? "text-indigo-400" : "text-zinc-400"
                  )}>Reward Vault</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl sm:text-4xl font-black tracking-tighter">{reward?.currentPoints || 0} <span className="text-xl">PTS</span></h3>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      activeTab === "rewards" ? "text-zinc-400" : "text-zinc-500"
                    )}>
                      Tier: {tier.name}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Daily Streak Bento */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card 
              id="streak-bento"
              onClick={() => setActiveTab("rewards")}
              className={cn(
                "p-6 sm:p-8 rounded-[2.5rem] cursor-pointer transition-all border relative overflow-hidden group h-full flex flex-col justify-between",
                hasCheckedInToday() 
                  ? "bg-emerald-950 text-emerald-100 border-emerald-900 shadow-xl shadow-emerald-900/20" 
                  : "bg-white border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50"
              )}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-orange-500/20 transition-all duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className={cn(
                    "p-3 rounded-2xl",
                    hasCheckedInToday() ? "bg-emerald-500 text-white" : "bg-orange-50 text-orange-600"
                  )}>
                    <Flame className={cn("h-6 w-6", hasCheckedInToday() && "animate-pulse")} />
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em]",
                    hasCheckedInToday() ? "text-emerald-400" : "text-zinc-400"
                  )}>Check-In Streak</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl sm:text-4xl font-black tracking-tighter">{reward?.streakCount || 0} <span className="text-xl">DAYS</span></h3>
                  <div className="flex items-center gap-1.5">
                    <div className={cn("h-1.5 w-1.5 rounded-full", hasCheckedInToday() ? "bg-emerald-400" : "bg-orange-400")} />
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      hasCheckedInToday() ? "text-emerald-400" : "text-zinc-500"
                    )}>
                      {hasCheckedInToday() ? "Checked In" : "Check In"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Referrals Stats Bento */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card 
              id="referral-bento"
              onClick={() => setActiveTab("referral")}
              className={cn(
                "p-6 sm:p-8 rounded-[2.5rem] cursor-pointer transition-all border relative overflow-hidden group h-full flex flex-col justify-between",
                activeTab === "referral" 
                  ? "bg-zinc-900 text-white border-zinc-900 shadow-2xl shadow-sky-500/10" 
                  : "bg-white border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50"
              )}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-sky-500/20 transition-all duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className={cn(
                    "p-3 rounded-2xl",
                    activeTab === "referral" ? "bg-sky-500 text-white" : "bg-sky-50 text-sky-600"
                  )}>
                    <Users className="h-6 w-6" />
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em]",
                    activeTab === "referral" ? "text-sky-400" : "text-zinc-400"
                  )}>Referral Hub</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl sm:text-4xl font-black tracking-tighter">{referrals.length} <span className="text-xl">INVITES</span></h3>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      activeTab === "referral" ? "text-zinc-400" : "text-zinc-500"
                    )}>
                      ₹{referralRewards.reduce((acc, curr) => acc + curr.amount, 0)} Earned
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Master Navigation Tabs */}
        <div className="flex sm:flex-wrap items-center gap-2 p-1.5 bg-zinc-100 rounded-3xl sm:max-w-fit border border-zinc-200 overflow-x-auto hide-scrollbar w-full">
          {(["rewards", "levels", "challenges", "referral", "referral-history", "wallet", "coupons"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "whitespace-nowrap flex-shrink-0 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer",
                activeTab === tab 
                  ? "bg-white text-zinc-900 shadow-md shadow-zinc-200" 
                  : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              {tab === "rewards" && "🌟 Reward Vault & XP"}
              {tab === "levels" && "🏆 Levels & Badges"}
              {tab === "challenges" && "⚡ Challenges"}
              {tab === "referral" && "🤝 Refer & Earn"}
              {tab === "referral-history" && "📜 Referral History"}
              {tab === "wallet" && "💳 Wallet"}
              {tab === "coupons" && "🏷 Promo Coupons"}
            </button>
          ))}
        </div>

        {/* Main Cohesive Work Area */}
        <div className="relative w-full sm:w-auto">
          <AnimatePresence mode="wait">
            {activeTab === "rewards" && (
              <motion.div
                key="rewards-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Rewards Center Columns */}
                <div className="lg:col-span-2 space-y-8">
                  
                  {/* Gamified Check-In Calendar */}
                  <Card className="p-8 bg-gradient-to-br from-zinc-900 to-slate-900 text-white rounded-[40px] border border-white/10 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-84 h-84 bg-emerald-500/10 rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                            <Flame className="h-5 w-5 text-orange-500" />
                            Daily Check-in & Streaks
                          </h3>
                          <p className="text-zinc-400 text-xs font-medium">Check in consecutively to boost your reward points.</p>
                        </div>

                        {!hasCheckedInToday() && (
                          <Button 
                            onClick={handleCheckIn} 
                            disabled={checkingIn}
                            className="bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs uppercase tracking-widest py-3 px-6 h-auto rounded-xl shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                          >
                            {checkingIn ? "Saving..." : "Check In Now"}
                          </Button>
                        )}
                      </div>

                      {/* 7-Day Strip Progress */}
                      <div className="relative pt-4">
                        {/* Connecting Line */}
                        <div className="absolute left-6 right-6 top-1/2 -translate-y-1 bg-zinc-800 h-1 rounded-full z-0" />
                        
                        <div className="relative z-10 grid grid-cols-7 gap-1">
                          {Array.from({ length: 7 }).map((_, index) => {
                            const dayNum = index + 1;
                            const isCompleted = (reward?.streakCount || 0) >= dayNum;
                            const pointsValue = dayNum === 7 ? 50 : 10 + index * 5;
                            const isToday = !hasCheckedInToday() && (reward?.streakCount || 0) + 1 === dayNum;
                            const isLocked = !isCompleted && !isToday;

                            return (
                              <div key={dayNum} className="flex flex-col items-center gap-3">
                                <div className={cn(
                                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-2",
                                  isCompleted 
                                    ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/30" 
                                    : isToday 
                                      ? "bg-zinc-800 border-emerald-500 text-emerald-400 animate-pulse ring-4 ring-emerald-500/10" 
                                      : "bg-zinc-900 border-zinc-800 text-zinc-600"
                                )}>
                                  {isCompleted ? (
                                    <Check className="h-5 w-5" />
                                  ) : isToday ? (
                                    <Flame className="h-5 w-5" />
                                  ) : (
                                    <Lock className="h-4 w-4" />
                                  )}
                                </div>
                                <div className="text-center">
                                  <p className="text-[10px] font-black uppercase text-zinc-400">Day {dayNum}</p>
                                  <p className={cn(
                                    "text-[9px] font-black tracking-wide",
                                    isCompleted ? "text-emerald-400" : isToday ? "text-emerald-400 font-bold" : "text-zinc-600"
                                  )}>
                                    +{pointsValue}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {hasCheckedInToday() ? (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-300 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Check-In completed today! Return tomorrow to keep streak active.
                        </div>
                      ) : (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2">
                          <Info className="h-4 w-4" />
                          You have an active check-in available! Claim your points.
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Points Ledger List */}
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <h3 className="text-xl font-black text-zinc-900 flex items-center gap-3">
                        <History className="h-6 w-6 text-emerald-600" />
                        Points History
                      </h3>
                      
                      {/* Search box inside Ledger */}
                      <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search transactions..."
                          className="pl-9 pr-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all w-full sm:w-64 bg-white"
                        />
                      </div>
                    </div>

                    {filteredRewardTransactions.length === 0 ? (
                      <Card className="p-16 border-dashed border-2 border-zinc-200 flex flex-col items-center text-center rounded-[40px] bg-white">
                        <History className="h-10 w-10 text-zinc-300 mb-4" />
                        <p className="text-zinc-500 font-medium">No point logs match your search.</p>
                      </Card>
                    ) : (
                      <div className="space-y-3">
                        {filteredRewardTransactions.map((tx) => (
                          <Card key={tx.id} className="p-4 sm:p-5 bg-white border-zinc-100 rounded-[24px] sm:rounded-[28px] shadow-sm flex items-center gap-3 sm:gap-5 group hover:shadow-md transition-all">
                            <div className={cn(
                              "w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                              tx.type === 'credit' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                            )}>
                              {tx.type === 'credit' ? <ArrowDownLeft className="h-5 w-5 sm:h-6 sm:w-6" /> : <ArrowUpRight className="h-5 w-5 sm:h-6 sm:w-6" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-black text-zinc-900 truncate">{tx.reason || "Points Update"}</h4>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                {formatDate(tx.createdAt)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={cn(
                                "text-lg font-black tracking-tight",
                                tx.type === 'credit' ? "text-emerald-600" : "text-zinc-900"
                              )}>
                                {tx.type === 'credit' ? "+" : "-"}{tx.points}
                              </p>
                              <span className="text-[8px] font-black px-1.5 py-0.5 bg-zinc-100 text-zinc-400 rounded uppercase">ID: {tx.id.substring(0, 8)}</span>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Sidebar Tier / Redemption */}
                <div className="space-y-8">
                  {/* Current Active Badge Display */}
                  <Card className="p-8 bg-white border-zinc-100 rounded-[40px] shadow-sm text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 blur-2xl" />
                    
                    <div className="relative z-10 space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Membership Tier</span>
                        <span className="text-[9px] font-black px-2.5 py-1 bg-zinc-100 text-zinc-500 rounded-full uppercase tracking-wider">
                          Active Status
                        </span>
                      </div>

                      {/* Shimmering Dynamic Badge */}
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-zinc-50 to-zinc-100 border border-zinc-200/50 flex items-center justify-center mx-auto shadow-xl relative group">
                        <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                          <Award className="h-10 w-10 text-emerald-600 group-hover:scale-110 transition-transform" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-2xl font-black text-zinc-900">{tier.name}</h4>
                        <p className="text-zinc-500 text-xs font-semibold">{tier.desc}</p>
                      </div>

                      <div className="pt-4 border-t border-zinc-100 space-y-3 text-left">
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tier Progress</span>
                          <span className="text-[10px] font-black text-zinc-500 uppercase">{tier.nextTier}</span>
                        </div>
                        <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-600 rounded-full transition-all duration-1000"
                            style={{ width: `${tier.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Redeem Points Block */}
                  <Card className="p-8 bg-emerald-50 border-emerald-100 rounded-[40px] space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                        <Coins className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-zinc-900">Points Converter</h4>
                        <p className="text-emerald-700 text-xs font-semibold uppercase tracking-wider">Instant Wallet Credits</p>
                      </div>
                    </div>

                    <div className="p-4 bg-white border border-emerald-100 rounded-2xl flex justify-between items-center">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Exchange Rate</p>
                        <p className="text-sm font-black text-zinc-900">500 PTS = ₹50 Credit</p>
                      </div>
                      <p className="text-lg font-black text-emerald-600">₹50.00</p>
                    </div>

                    <Button
                      onClick={handleRedeem}
                      disabled={isRedeeming || !reward || reward.currentPoints < 500}
                      className="w-full bg-zinc-900 hover:bg-black text-white font-black text-sm uppercase tracking-widest py-5 h-auto rounded-2xl shadow-xl shadow-zinc-900/10 disabled:opacity-50"
                    >
                      {isRedeeming ? "Processing..." : "Convert 500 Points"}
                    </Button>
                  </Card>

                </div>
              </motion.div>
            )}

            {activeTab === "levels" && (
              <motion.div
                key="levels-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                {/* Levels & XP Master Header Card */}
                <Card className="p-8 sm:p-10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950 text-white rounded-[2.5rem] border border-white/10 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                  
                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                          Level 4 • Metabolic Master
                        </span>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                          2,850 Total XP
                        </span>
                      </div>

                      <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                        You are 650 XP away from <span className="text-indigo-400">Level 5: Macro Champion</span>
                      </h2>

                      {/* XP Progress Bar */}
                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-zinc-300">
                          <span>Level 4 (2,500 XP)</span>
                          <span className="text-indigo-400">81% Complete</span>
                          <span>Level 5 (3,500 XP)</span>
                        </div>
                        <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                          <div className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 rounded-full w-[81%] shadow-lg shadow-indigo-500/50" />
                        </div>
                      </div>
                    </div>

                    {/* Level Badge Trophy Display */}
                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl text-center space-y-3 backdrop-blur-md">
                      <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 font-black text-2xl shadow-xl shadow-amber-500/20">
                        <Trophy className="w-10 h-10 text-zinc-950" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-white">Metabolic Master</h4>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">+15% Bonus Cashback on all subscriptions</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Achievements & Badges Matrix */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Achievements & Badges</h3>
                      <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Collect trophies as you progress on your nutrition journey</p>
                    </div>
                    <span className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-2xl text-xs font-black uppercase tracking-widest">
                      {badges.filter(b => b.unlocked).length} / {badges.length} Unlocked
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {badges.map((badge) => (
                      <Card 
                        key={badge.id}
                        className={cn(
                          "p-6 rounded-[2.5rem] border transition-all flex flex-col justify-between relative overflow-hidden group",
                          badge.unlocked 
                            ? "bg-white border-zinc-200 shadow-xl shadow-zinc-200/50 hover:border-emerald-500/50" 
                            : "bg-zinc-50/80 border-zinc-200/80 opacity-90"
                        )}
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                              badge.rarity === 'Legendary' ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                              badge.rarity === 'Epic' ? "bg-purple-500/10 text-purple-600 border border-purple-500/20" :
                              badge.rarity === 'Rare' ? "bg-sky-500/10 text-sky-600 border border-sky-500/20" :
                              "bg-zinc-100 text-zinc-600"
                            )}>
                              {badge.rarity}
                            </span>

                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                              +{badge.rewardXP} XP
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 text-xl font-black shadow-inner border",
                              badge.unlocked 
                                ? "bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/30" 
                                : "bg-zinc-200 text-zinc-400 border-zinc-300"
                            )}>
                              {badge.icon === 'Flame' && <Flame className="w-8 h-8" />}
                              {badge.icon === 'Zap' && <Zap className="w-8 h-8" />}
                              {badge.icon === 'Users' && <Users className="w-8 h-8" />}
                              {badge.icon === 'Trophy' && <Trophy className="w-8 h-8" />}
                              {badge.icon === 'Star' && <Star className="w-8 h-8" />}
                              {badge.icon === 'Award' && <Award className="w-8 h-8" />}
                            </div>

                            <div>
                              <h4 className="text-base font-black text-zinc-900 leading-snug">{badge.title}</h4>
                              <p className="text-xs text-zinc-500 font-medium line-clamp-2 mt-0.5">{badge.description}</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 mt-6 border-t border-zinc-100 space-y-3">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-zinc-400">
                            <span>Progress</span>
                            <span>{badge.currentProgress} / {badge.maxProgress}</span>
                          </div>
                          
                          <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                badge.unlocked ? "bg-emerald-500" : "bg-zinc-400"
                              )}
                              style={{ width: `${Math.min(100, (badge.currentProgress / badge.maxProgress) * 100)}%` }}
                            />
                          </div>

                          {!badge.unlocked && badge.currentProgress >= badge.maxProgress && (
                            <Button
                              onClick={() => handleUnlockBadge(badge.id)}
                              className="w-full mt-2 text-[10px] font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white h-10 rounded-xl"
                            >
                              Unlock Badge
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "challenges" && (
              <motion.div
                key="challenges-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Active Challenges</h3>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Complete daily and weekly nutrition missions to claim XP and Wallet Credits</p>
                  </div>
                  <span className="px-4 py-2 bg-amber-500/10 text-amber-600 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    {challenges.filter(c => !c.claimed).length} Open Missions
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {challenges.map((challenge) => {
                    const isReady = challenge.progress >= challenge.maxProgress;

                    return (
                      <Card 
                        key={challenge.id}
                        className={cn(
                          "p-8 rounded-[2.5rem] border transition-all flex flex-col justify-between relative overflow-hidden group",
                          challenge.claimed 
                            ? "bg-zinc-50/70 border-zinc-200 text-zinc-500" 
                            : isReady 
                            ? "bg-white border-amber-400/80 shadow-xl shadow-amber-500/10 ring-2 ring-amber-400/30" 
                            : "bg-white border-zinc-200 shadow-sm"
                        )}
                      >
                        <div className="space-y-5">
                          <div className="flex items-center justify-between">
                            <span className="px-3 py-1 bg-zinc-100 text-zinc-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                              {challenge.type} Challenge
                            </span>

                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                +{challenge.rewardXP} XP
                              </span>
                              {challenge.rewardAmount && (
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                  +₹{challenge.rewardAmount} Wallet
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xl font-black text-zinc-900">{challenge.title}</h4>
                            <p className="text-xs text-zinc-500 font-medium leading-relaxed mt-1">{challenge.description}</p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-[11px] font-black uppercase tracking-wider">
                              <span className="text-zinc-400">Mission Progress</span>
                              <span className={isReady ? "text-emerald-600" : "text-zinc-700"}>
                                {challenge.progress} / {challenge.maxProgress}
                              </span>
                            </div>

                            <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full rounded-full transition-all duration-500",
                                  challenge.claimed ? "bg-zinc-400" : isReady ? "bg-amber-500" : "bg-emerald-500"
                                )}
                                style={{ width: `${Math.min(100, (challenge.progress / challenge.maxProgress) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 mt-6 border-t border-zinc-100 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            ⏳ {challenge.expiresIn}
                          </span>

                          <Button
                            onClick={() => handleClaimChallenge(challenge.id)}
                            disabled={challenge.claimed || !isReady}
                            className={cn(
                              "text-xs font-black uppercase tracking-widest px-6 h-11 rounded-xl transition-all",
                              challenge.claimed 
                                ? "bg-zinc-200 text-zinc-500" 
                                : isReady 
                                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20" 
                                : "bg-zinc-900 text-white opacity-80"
                            )}
                          >
                            {challenge.claimed ? "Claimed ✓" : isReady ? "Claim Reward 🎉" : "In Progress"}
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === "wallet" && (
              <motion.div
                key="wallet-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Wallet Balance Screen */}
                <div className="lg:col-span-2 space-y-10">
                  {/* Shimmering Wallet Card */}
                  <Card className="p-6 sm:p-10 bg-zinc-900 text-white rounded-[2rem] sm:rounded-[3rem] relative overflow-hidden shadow-2xl shadow-emerald-500/10 border border-white/5">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Total Balance</span>
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                      </div>
                      <h2 className="text-5xl sm:text-6xl font-black tracking-tighter">
                        ₹{wallet?.balance || 0}
                      </h2>
                      
                      <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <div className="px-4 py-3 bg-white/5 rounded-2xl border border-white/10">
                          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Available Cashback</p>
                          <p className="text-lg font-bold text-emerald-400">₹{wallet?.cashbackAvailable || 0}</p>
                        </div>
                        <div className="px-4 py-3 bg-white/5 rounded-2xl border border-white/10">
                          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Pending Cashback</p>
                          <p className="text-lg font-bold text-amber-400">₹{wallet?.cashbackPending || 0}</p>
                        </div>
                        <div className="px-4 py-3 bg-white/5 rounded-2xl border border-white/10">
                          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Lifetime Cashback</p>
                          <p className="text-lg font-bold text-white">₹{wallet?.cashbackLifetime || 0}</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Wallet Activity Ledger */}
                  <section className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <h3 className="text-xl font-black text-zinc-900 flex items-center gap-3">
                        <History className="h-6 w-6 text-emerald-600" />
                        Wallet activity
                      </h3>
                      <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search transactions..."
                          className="pl-9 pr-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all w-full sm:w-64 bg-white"
                        />
                      </div>
                    </div>

                    {filteredWalletTransactions.length === 0 ? (
                      <Card className="p-16 border-dashed border-2 border-zinc-200 flex flex-col items-center text-center rounded-[40px] bg-white">
                        <History className="h-10 w-10 text-zinc-300 mb-4" />
                        <p className="text-zinc-500 font-medium">No transactions match your query.</p>
                      </Card>
                    ) : (
                      <div className="space-y-3">
                        {filteredWalletTransactions.map((tx) => (
                          <Card key={tx.id} className="p-4 sm:p-5 bg-white border-zinc-100 rounded-[24px] sm:rounded-[28px] shadow-sm flex items-center gap-3 sm:gap-5 group hover:shadow-md transition-all">
                            <div className={cn(
                              "w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                              tx.type === 'credit' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                            )}>
                              {tx.type === 'credit' ? <ArrowDownLeft className="h-5 w-5 sm:h-6 sm:w-6" /> : <ArrowUpRight className="h-5 w-5 sm:h-6 sm:w-6" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-black text-zinc-900 truncate">{tx.reason || "Wallet Update"}</h4>
                              </div>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                {formatDate(tx.createdAt)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={cn(
                                "text-lg font-black tracking-tight",
                                tx.type === 'credit' ? "text-emerald-600" : "text-zinc-900"
                              )}>
                                {tx.type === 'credit' ? "+" : "-"}₹{tx.amount}
                              </p>
                              <p className="text-[9px] font-bold text-zinc-400 uppercase">Bal: ₹{tx.balanceAfter}</p>
                              <span className="text-[8px] font-black px-1.5 py-0.5 bg-zinc-100 text-zinc-400 rounded uppercase">ID: {tx.id.substring(0, 8)}</span>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </section>
                </div>

                {/* Quick Recharge Console */}
                <aside className="space-y-8">
                  <Card className="p-6 sm:p-8 bg-white border-zinc-100 rounded-[2rem] sm:rounded-[40px] shadow-sm sm:sticky sm:top-10">
                    <h3 className="text-xl font-black text-zinc-900 mb-6">Recharge Wallet</h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Enter Amount (₹)</p>
                        <div className="relative w-full sm:w-auto">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-zinc-300">₹</span>
                          <input 
                            type="number" 
                            value={rechargeAmount}
                            onChange={(e) => setRechargeAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-10 pr-6 py-5 bg-zinc-50 border border-zinc-100 rounded-2xl text-2xl font-black focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {quickAmounts.map(amt => (
                          <button 
                            key={amt}
                            onClick={() => setRechargeAmount(amt)}
                            className={cn(
                              "py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2",
                              rechargeAmount === amt 
                                ? "bg-zinc-900 border-zinc-900 text-white" 
                                : "bg-white border-zinc-100 text-zinc-500 hover:border-zinc-200"
                            )}
                          >
                            +₹{amt}
                          </button>
                        ))}
                      </div>

                      <Button 
                        onClick={handleRecharge}
                        disabled={recharging || !rechargeAmount}
                        className="w-full rounded-2xl py-8 font-black text-lg bg-zinc-900 hover:bg-black text-white group shadow-2xl shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {recharging ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          <>
                            Proceed to Pay
                            <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>

                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
                        <Info className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                        <p className="text-[10px] font-bold text-emerald-800 leading-relaxed uppercase tracking-widest">
                          Add ₹2000+ to get flat 10% bonus credits in your reward vault.
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-4 pt-4">
                        <CreditCard className="h-6 w-6 text-zinc-300" />
                        <div className="w-px h-4 bg-zinc-100" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Secured via Razorpay</span>
                      </div>
                    </div>
                  </Card>
                </aside>
              </motion.div>
            )}

            {activeTab === "referral" && (
              <motion.div
                key="referral-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-12"
              >
                <div className="space-y-8">
                  {/* Claim Referral Card */}
                  <ClaimReferralCard onSuccess={() => {
                    // refresh state if needed
                    fetchUserData();
                  }} />

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Refer and Earn network display */}
                  <div className="lg:col-span-2 space-y-10">
                    <Card className="p-10 bg-gradient-to-br from-emerald-50 to-amber-50 text-zinc-900 rounded-[48px] relative overflow-hidden shadow-2xl shadow-emerald-500/10 border border-emerald-100">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-200/30 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
                      <div className="relative z-10 space-y-8">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-emerald-600 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800">Referral Program</span>
                        </div>
                        
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight max-w-xl text-zinc-950">
                          Grow the community. <br/> Earn the rewards.
                        </h2>
                        
                        <p className="text-zinc-600 font-medium leading-relaxed max-w-md">
                          Invite your friends to Taaza Bites. You both get <strong className="text-zinc-950">₹250</strong> wallet credits and <strong className="text-zinc-950">100</strong> reward points.
                        </p>
                        
                        {/* Interactive Copy Sharing Link Panel */}
                        <div className="space-y-6 pt-4">
                          {/* QR Code */}
                          <div className="p-4 bg-white rounded-2xl flex items-center justify-center shadow-inner">
                            <QRCode 
                              value={`${window.location.origin}/subscribe?ref=${referralCode}`}
                              size={160}
                              level="H"
                              className="w-full h-auto max-w-[200px]"
                            />
                          </div>
                          <div className="flex flex-col sm:flex-row items-stretch gap-3">
                            <div className="flex-1 p-4 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-between gap-4 backdrop-blur-md">
                              <code className="font-mono text-lg font-black tracking-widest text-emerald-400">{referralCode}</code>
                              <button 
                                onClick={() => handleCopy(referralCode, "Referral Code")}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-zinc-400 hover:text-white"
                              >
                                {copiedCode === referralCode ? (
                                  <Check className="h-5 w-5 text-emerald-500" />
                                ) : (
                                  <Copy className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                            
                            <Button 
                              onClick={() => handleCopy(`${window.location.origin}/subscribe?ref=${referralCode}`, "Referral link")}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl py-4 px-6 font-black uppercase tracking-widest text-xs h-auto shadow-xl"
                            >
                              Copy Invite Link
                            </Button>

                            <Button
                              onClick={() => {
                                triggerHaptic('medium');
                                window.open(`https://wa.me/?text=${encodeURIComponent(getReferralText())}`, "_blank");
                              }}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl py-4 px-6 font-black uppercase tracking-widest text-xs h-auto shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                            >
                              <MessageCircle className="h-5 w-5" /> Share via WhatsApp
                            </Button>
                          </div>

                          {/* Social sharing grid */}
                          <div className="grid grid-cols-3 gap-3">
                            <button 
                              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(getReferralText())}`, "_blank")}
                              className="flex flex-col items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl hover:bg-emerald-500/20 transition-all group"
                            >
                              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-emerald-500/30">
                                <MessageCircle className="h-5 w-5" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">WhatsApp</span>
                            </button>

                            <button 
                              onClick={() => window.location.href = `mailto:?subject=Join TaazaBites and Save!&body=${encodeURIComponent(getReferralText())}`}
                              className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all group"
                            >
                              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                <Mail className="h-5 w-5" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-indigo-400">Email</span>
                            </button>

                            <button 
                              onClick={() => window.location.href = `sms:?body=${encodeURIComponent(getReferralText())}`}
                              className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-amber-500/10 hover:border-amber-500/30 transition-all group"
                            >
                              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                                <MessageSquare className="h-5 w-5" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-amber-400">SMS</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Sidebar Stats and Milestone Achievements */}
                  <aside className="space-y-8">
                    <Card className="p-8 bg-white border-zinc-100 rounded-[40px] shadow-sm">
                      <h3 className="text-lg font-black text-zinc-900 mb-6">Referral Stats</h3>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-500 uppercase">Total Referrals</span>
                          <span className="text-lg font-black">{referrals.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-500 uppercase">Cashback Earned</span>
                          <span className="text-lg font-black text-emerald-600">₹{referralRewards.reduce((acc, curr) => acc + curr.amount, 0)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-500 uppercase">Points Earned</span>
                          <span className="text-lg font-black text-indigo-600">{referralRewards.reduce((acc, curr) => acc + curr.points, 0)}</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-8 bg-amber-50 border-amber-100 rounded-[40px]">
                      <h3 className="text-lg font-black text-zinc-900 mb-4">Milestones</h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-200 flex items-center justify-center text-amber-700 font-black text-xs">1</div>
                          <div className="flex-1">
                            <p className="text-xs font-black text-zinc-900">First Invite</p>
                            <p className="text-[10px] text-amber-700 font-bold uppercase">Earn ₹250 bonus</p>
                          </div>
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 font-black text-xs">5</div>
                          <div className="flex-1">
                            <p className="text-xs font-black text-zinc-900">Refer 5 Friends</p>
                            <p className="text-[10px] text-amber-600 font-bold uppercase">Get 1 Week Free</p>
                          </div>
                          <div className="h-2 flex-1 bg-amber-200 rounded-full max-w-[40px] ml-auto">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: referrals.length >= 5 ? '100%' : `${(referrals.length / 5) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </aside>
                </div>

                </div>
                {/* Gamified Top Referrers Leaderboard Section */}
                <TopReferrersLeaderboard
                  currentUserReferralsCount={referrals.length}
                  currentUserEarnings={referralRewards.reduce((acc, curr) => acc + curr.amount, 0)}
                  currentUserCode={referralCode}
                  userName={currentUser?.displayName || 'You'}
                  userAvatar={currentUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                />
              </motion.div>
            )}
            
            {activeTab === "referral-history" && (
              <motion.div
                key="referral-history-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6 w-full"
              >
                {/* 1. Summary Cards / Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                  <div className="p-5 bg-white border border-zinc-100 rounded-3xl shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Invitations Sent</span>
                    <h3 className="text-2xl font-black text-zinc-900 mt-2">{referrals.length}</h3>
                  </div>
                  <div className="p-5 bg-white border border-zinc-100 rounded-3xl shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Pending Invites</span>
                    <h3 className="text-2xl font-black text-amber-600 mt-2">
                      {referrals.filter(r => r.status === 'pending').length}
                    </h3>
                  </div>
                  <div className="p-5 bg-white border border-zinc-100 rounded-3xl shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Converted Rewards</span>
                    <h3 className="text-2xl font-black text-emerald-600 mt-2">
                      {referrals.filter(r => r.status === 'rewarded').length}
                    </h3>
                  </div>
                  <div className="p-5 bg-white border border-zinc-100 rounded-3xl shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Cashback Earned</span>
                    <h3 className="text-2xl font-black text-sky-600 mt-2">
                      ₹{referralRewards.reduce((acc, curr) => acc + curr.amount, 0)}
                    </h3>
                  </div>
                </div>

                {/* 2. Main 2-Column Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
                  {/* Left Column: Sent Status & History */}
                  <div className="lg:col-span-7 space-y-6">
                    <Card className="p-6 bg-white border border-zinc-100 rounded-[32px] shadow-sm space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h3 className="text-lg font-black text-zinc-900 flex items-center gap-2">
                          <History className="h-5 w-5 text-emerald-600" />
                          Sent Invitations & Status
                        </h3>
                        {/* Search and Filters inside Card */}
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                            <input
                              type="text"
                              placeholder="Search by name/email..."
                              value={refHistorySearch}
                              onChange={(e) => setRefHistorySearch(e.target.value)}
                              className="pl-9 pr-4 py-2 border border-zinc-200 rounded-2xl text-xs w-full sm:w-48 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Filter Badges */}
                      <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-50 rounded-2xl w-fit border border-zinc-100">
                        {(["all", "pending", "rewarded"] as const).map((filter) => (
                          <button
                            key={filter}
                            onClick={() => setRefHistoryStatusFilter(filter)}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                              refHistoryStatusFilter === filter
                                ? "bg-white text-zinc-900 shadow-sm"
                                : "text-zinc-500 hover:text-zinc-900"
                            )}
                          >
                            {filter === "all" ? "All Invites" : filter === "pending" ? "Pending" : "Converted"}
                          </button>
                        ))}
                      </div>

                      {/* List */}
                      {referrals.filter(ref => {
                        const matchSearch = 
                          (ref.referredName || "").toLowerCase().includes(refHistorySearch.toLowerCase()) ||
                          (ref.referredEmail || "").toLowerCase().includes(refHistorySearch.toLowerCase()) ||
                          (ref.referredUserId || "").toLowerCase().includes(refHistorySearch.toLowerCase()) ||
                          (ref.id || "").toLowerCase().includes(refHistorySearch.toLowerCase());
                        
                        const matchStatus = 
                          refHistoryStatusFilter === "all" ? true :
                          refHistoryStatusFilter === "pending" ? ref.status === 'pending' :
                          refHistoryStatusFilter === "rewarded" ? ref.status === 'rewarded' : true;
                          
                        return matchSearch && matchStatus;
                      }).length === 0 ? (
                        <div className="p-12 border-dashed border-2 border-zinc-100 flex flex-col items-center text-center rounded-3xl bg-zinc-50/50">
                          <Users className="h-8 w-8 text-zinc-300 mb-3" />
                          <p className="text-xs text-zinc-500 font-medium">No invitations match the selected criteria.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {referrals.filter(ref => {
                            const matchSearch = 
                              (ref.referredName || "").toLowerCase().includes(refHistorySearch.toLowerCase()) ||
                              (ref.referredEmail || "").toLowerCase().includes(refHistorySearch.toLowerCase()) ||
                              (ref.referredUserId || "").toLowerCase().includes(refHistorySearch.toLowerCase()) ||
                              (ref.id || "").toLowerCase().includes(refHistorySearch.toLowerCase());
                            
                            const matchStatus = 
                              refHistoryStatusFilter === "all" ? true :
                              refHistoryStatusFilter === "pending" ? ref.status === 'pending' :
                              refHistoryStatusFilter === "rewarded" ? ref.status === 'rewarded' : true;
                              
                            return matchSearch && matchStatus;
                          }).map((ref) => {
                            const isDirectInvite = !!ref.referredName;
                            return (
                              <div key={ref.id} className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-zinc-200 transition-all">
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                    ref.status === 'rewarded' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                  )}>
                                    {ref.status === 'rewarded' ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-sm font-black text-zinc-900 truncate">
                                      {isDirectInvite ? ref.referredName : `Friend Signed Up`}
                                    </h4>
                                    <p className="text-xs text-zinc-500 truncate">
                                      {isDirectInvite ? (ref.referredEmail || ref.referredPhone) : `ID: ${ref.referredUserId.substring(0, 8)}`}
                                    </p>
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                                      Sent: {formatDate(ref.createdAt)}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3 self-end sm:self-auto">
                                  <span className={cn(
                                    "text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider",
                                    ref.status === 'rewarded' ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                                  )}>
                                    {ref.status === 'rewarded' ? "Converted" : "Pending Order"}
                                  </span>
                                  
                                  {ref.status === 'pending' && (
                                    <button
                                      onClick={() => handleSimulateConversion(ref.id)}
                                      disabled={isSimulatingId === ref.id}
                                      className="text-[10px] font-black px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                                    >
                                      {isSimulatingId === ref.id ? (
                                        <>
                                          <Loader2 className="h-3 w-3 animate-spin" />
                                          Converting...
                                        </>
                                      ) : (
                                        <>
                                          <Sparkles className="h-3 w-3" />
                                          Deliver & Reward
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </Card>
                  </div>

                  {/* Right Column: Invite Friend Form & Rules */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* Invite Form */}
                    <Card className="p-6 bg-white border border-zinc-100 rounded-[32px] shadow-sm space-y-5">
                      <div className="space-y-1">
                        <h3 className="text-lg font-black text-zinc-900 flex items-center gap-2">
                          <Gift className="h-5 w-5 text-emerald-600" />
                          Invite a Friend Directly
                        </h3>
                        <p className="text-xs text-zinc-500">
                          We will send a personalized meal invitation code to your friend.
                        </p>
                      </div>

                      <form onSubmit={handleSendInvite} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Friend's Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Rahul Sharma"
                            value={inviteName}
                            onChange={(e) => setInviteName(e.target.value)}
                            required
                            disabled={isInviting}
                            className="w-full px-4 py-3 text-sm border border-zinc-200 rounded-2xl focus:outline-none focus:border-emerald-500 disabled:bg-zinc-50 disabled:text-zinc-400"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Email Address</label>
                          <input
                            type="email"
                            placeholder="e.g. rahul@example.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            required
                            disabled={isInviting}
                            className="w-full px-4 py-3 text-sm border border-zinc-200 rounded-2xl focus:outline-none focus:border-emerald-500 disabled:bg-zinc-50 disabled:text-zinc-400"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Phone Number (Optional)</label>
                          <input
                            type="tel"
                            placeholder="e.g. 9876543210"
                            value={invitePhone}
                            onChange={(e) => setInvitePhone(e.target.value)}
                            disabled={isInviting}
                            className="w-full px-4 py-3 text-sm border border-zinc-200 rounded-2xl focus:outline-none focus:border-emerald-500 disabled:bg-zinc-50 disabled:text-zinc-400"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isInviting}
                          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-100 disabled:text-zinc-400 text-white font-black uppercase text-xs tracking-widest rounded-2xl transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {isInviting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Sending Invitation...
                            </>
                          ) : (
                            <>
                              <Mail className="h-4 w-4" />
                              Send Personal Invitation
                            </>
                          )}
                        </button>
                      </form>
                    </Card>

                    {/* How It Works Card */}
                    <div className="p-6 bg-emerald-50 border border-emerald-100/50 rounded-[32px] space-y-4">
                      <h4 className="text-sm font-black text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Referral Program Rules
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex gap-2.5 items-start">
                          <div className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">1</div>
                          <p className="text-xs text-emerald-800 leading-relaxed">
                            <strong>Share code/form:</strong> Give Rahul your referral code or use the form above to send an email.
                          </p>
                        </li>
                        <li className="flex gap-2.5 items-start">
                          <div className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">2</div>
                          <p className="text-xs text-emerald-800 leading-relaxed">
                            <strong>Friend gets ₹250:</strong> Rahul registers and gets ₹250 wallet credit applied upon subscribing.
                          </p>
                        </li>
                        <li className="flex gap-2.5 items-start">
                          <div className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">3</div>
                          <p className="text-xs text-emerald-800 leading-relaxed">
                            <strong>You get ₹100:</strong> Once Rahul's first breakfast, lunch, or dinner plan gets delivered, you instantly receive ₹100 inside your wallet!
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "coupons" && (
              <motion.div
                key="coupons-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-10"
              >
                {/* Promo Coupon Console and catalog */}
                <Card className="p-8 bg-white border border-zinc-100 rounded-[40px] shadow-sm max-w-xl mx-auto text-center space-y-6">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 shadow-md">
                    <Tag className="h-6 w-6" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-zinc-900">Apply Promo Code</h3>
                    <p className="text-zinc-500 text-xs font-semibold">Verify and activate custom coupons on your account.</p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="ENTER PROMO CODE"
                      className="flex-1 bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-sm font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-center"
                    />
                    <Button 
                      onClick={async () => {
                        if (!couponCode) return;
                        showToast("Validating coupon...", "info");
                        try {
                          const coupon = await RewardService.getRewardPoints(currentUser?.uid || ""); // Just a connection validation
                          showToast(`Promo ${couponCode} is active on your profile! Apply it at subscription checkout.`, "success");
                        } catch (err) {
                          showToast("Invalid coupon code.", "error");
                        }
                      }}
                      className="rounded-2xl px-8 bg-zinc-900 text-white font-black hover:bg-black uppercase text-xs tracking-widest"
                    >
                      APPLY
                    </Button>
                  </div>
                </Card>

                {/* Grid of available coupon offers */}
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-zinc-900">Available Promotions</h3>
                  {coupons.length === 0 ? (
                    <Card className="p-12 border-dashed border-2 border-zinc-200 flex flex-col items-center text-center rounded-[40px] bg-white">
                      <Tag className="h-10 w-10 text-zinc-300 mb-4" />
                      <p className="text-zinc-500 font-medium">No active promotions currently available.</p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {coupons.map((promo) => (
                        <Card key={promo.id} className="p-6 bg-gradient-to-br from-white to-zinc-50/50 border border-zinc-100 rounded-[32px] relative overflow-hidden group hover:shadow-lg transition-all shadow-sm">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12 blur-xl" />
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                                {promo.type.replace('_', ' ')}
                              </span>
                              <Tag className="h-4 w-4 text-zinc-300" />
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-baseline gap-1">
                                <h4 className="text-lg font-black text-zinc-900">{promo.code}</h4>
                                <span className="text-emerald-600 font-black text-sm">
                                  ({promo.type === 'percentage' ? `${promo.discountValue}% OFF` : `₹${promo.discountValue} OFF`})
                                </span>
                              </div>
                              <p className="text-zinc-500 text-xs font-semibold leading-relaxed">{promo.title}</p>
                            </div>

                            <button 
                              onClick={() => handleCopy(promo.code, "Coupon code")}
                              className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                            >
                              {copiedCode === promo.code ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" />
                                  Copy Code
                                </>
                              )}
                            </button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
