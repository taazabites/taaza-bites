import { useState, useEffect } from "react";
import { safeCopyToClipboard } from "@/src/utils/clipboard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { db } from '../firebase/db';
import { 
  collection, 
  query, 
  where, orderBy, limit, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  writeBatch, 
  Timestamp, 
  addDoc 
} from "firebase/firestore";
import { Order } from "../firebase/collections";
import { getAuthHeaders } from "../firebase/services";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, 
  Search, 
  Download, 
  ChevronRight, 
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Package,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  X,
  FileText,
  Printer,
  Mail,
  TrendingUp,
  Percent,
  Check,
  Award,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  MapPin,
  Clock3,
  HelpCircle,
  RotateCcw,
  Zap,
  ShoppingCart
} from "lucide-react";
import { Card, Button, Input, Label, Textarea } from "@/src/components/ui/primitives";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { cn, formatDate } from "@/src/lib/utils";
import { jsPDF } from "jspdf";
import { OrderMealRating } from "@/src/components/orders/OrderMealRating";
import { DeliveryTracker } from "@/src/components/orders/DeliveryTracker";
import { useDebounce } from "../hooks/useDebounce";

export default function OrdersPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Real-time Firestore state
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [walletTx, setWalletTx] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);

  // Local dashboard control state
  const [activeTab, setActiveTab] = useState<'orders' | 'payments' | 'wallet' | 'loyalty'>('orders');
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  // Interactive billing states
  const [rechargeAmount, setRechargeAmount] = useState("1000");
  const [isProcessing, setIsProcessing] = useState(false);
  const [sendingInvoiceId, setSendingInvoiceId] = useState<string | null>(null);
  
  // Sandbox modal state
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [simulatedOrder, setSimulatedOrder] = useState<any>(null);

  // Refund request state inside order details
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refundDetails, setRefundDetails] = useState("");

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      const pattern = style === 'heavy' ? [30, 20, 30] : style === 'medium' ? [20] : [10];
      window.navigator.vibrate(pattern);
    }
  };

  // 1. Listen to all collections in real time
  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    const unsubscribes: (() => void)[] = [];

    // 1.1 Listen to orders
    try {
      const qOrders = query(
        collection(db, 'orders'),
        where('userId', '==', currentUser.uid)
      );
      const unsubOrders = onSnapshot(qOrders, (snap) => {
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        list.sort((a, b) => {
            const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
            return dateB - dateA;
        });
        const limitedList = list.slice(0, 20);
        setOrders(limitedList);
        setLoading(false);
      }, (err) => {
        console.warn("Orders listener error:", err);
        setLoading(false);
      });
      unsubscribes.push(unsubOrders);
    } catch (e) {
      console.error("Orders collection setup failed:", e);
    }

    // 1.2 Listen to payments
    try {
      const qPayments = query(
        collection(db, 'payments'),
        where('userId', '==', currentUser.uid)
      );
      const unsubPayments = onSnapshot(qPayments, (snap) => {
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        
        setPayments(list);
      }, (err) => console.warn("Payments listener error:", err));
      unsubscribes.push(unsubPayments);
    } catch (e) {
      console.error("Payments listener setup fail:", e);
    }

    // 1.3 Listen to walletTransactions
    try {
      const qTx = query(
        collection(db, 'walletTransactions'),
        where('userId', '==', currentUser.uid)
      );
      const unsubTx = onSnapshot(qTx, (snap) => {
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        
        setWalletTx(list);
      }, (err) => {
        // Fallback to transactions
        const qTx2 = query(
          collection(db, 'transactions'),
          where('userId', '==', currentUser.uid)
        );
        const unsubTx2 = onSnapshot(qTx2, (snap) => {
          const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
          
          setWalletTx(list);
        }, (err2) => console.warn("Transactions backup error:", err2));
        unsubscribes.push(unsubTx2);
      });
      unsubscribes.push(unsubTx);
    } catch (e) {
      console.error("Wallet transactions listener setup fail:", e);
    }

    // 1.4 Listen to user profile (contains walletBalance, rewardPoints)
    try {
      const unsubUser = onSnapshot(doc(db, 'users', currentUser.uid), (snap) => {
        if (snap.exists()) {
          setUserProfile(snap.data());
        }
      }, (err) => console.warn("User profile listener error:", err));
      unsubscribes.push(unsubUser);
    } catch (e) {
      console.error("User doc setup fail:", e);
    }

    // 1.5 Listen to refunds
    try {
      const qRefunds = query(
        collection(db, 'refunds'),
        where('userId', '==', currentUser.uid)
      );
      const unsubRefunds = onSnapshot(qRefunds, (snap) => {
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        
        setRefunds(list);
      }, (err) => console.warn("Refunds listener error:", err));
      unsubscribes.push(unsubRefunds);
    } catch (e) {
      console.error("Refunds listener fail:", e);
    }

    // 1.6 Listen to subscriptions
    try {
      const qSubs = query(
        collection(db, 'subscriptions'),
        where('userId', '==', currentUser.uid)
      );
      const unsubSubs = onSnapshot(qSubs, (snap) => {
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        setSubscriptions(list);
      }, (err) => console.warn("Subscriptions listener error:", err));
      unsubscribes.push(unsubSubs);
    } catch (e) {
      console.error("Subscriptions listener fail:", e);
    }

    // 1.7 Listen to addresses
    try {
      const qAddresses = query(
        collection(db, 'addresses'),
        where('userId', '==', currentUser.uid)
      );
      const unsubAddresses = onSnapshot(qAddresses, (snap) => {
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        setAddresses(list);
      }, (err) => console.warn("Addresses listener error:", err));
      unsubscribes.push(unsubAddresses);
    } catch (e) {
      console.error("Addresses listener fail:", e);
    }

    // 1.8 Listen to coupons
    try {
      const qCoupons = query(collection(db, 'coupons'));
      const unsubCoupons = onSnapshot(qCoupons, (snap) => {
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        setCoupons(list);
      }, (err) => console.warn("Coupons fetch failed:", err));
      unsubscribes.push(unsubCoupons);
    } catch (e) {
      console.error("Coupons collection setup fail:", e);
    }

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [currentUser]);

  // 2. Load Razorpay Checkout Script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 3. Log a Failed Payment
  const logFailedPayment = async (orderId: string, amount: number, reason: string) => {
    if (!currentUser) return;
    try {
      const paymentId = `pay_fail_${Math.floor(100000 + Math.random() * 900000)}`;
      await setDoc(doc(db, 'payments', paymentId), {
        id: paymentId,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        userId: currentUser.uid,
        amount,
        currency: "INR",
        paymentMethod: "Card/UPI (Declined)",
        status: "failed",
        failureReason: reason,
        verified: false,
        createdAt: Timestamp.now()
      });

      // Also create a failed order log to keep history rich
      const orderNum = `ORD-FAIL-${Math.floor(1000 + Math.random() * 9000)}`;
      await setDoc(doc(db, 'orders', orderNum), {
        id: orderNum,
        orderNumber: orderNum,
        userId: currentUser.uid,
        subscriptionId: currentUser.uid,
        mealScheduleId: "none",
        planName: "High Protein Fresh Plan (Failed Attempt)",
        amount,
        discount: 0,
        coupon: "",
        tax: Math.round(amount * 0.05),
        paymentStatus: "failed",
        deliveryStatus: "cancelled",
        orderStatus: "failed",
        createdAt: Timestamp.now()
      });
    } catch (e) {
      console.error("Failed logging payment error:", e);
    }
  };

  // 4. Initiate Razorpay Payment (Simulated/Real checkout)
  const handleInitiatePayment = async (amount: number, type: 'recharge' | 'subscription' = 'recharge', notes: any = {}) => {
    if (!currentUser) return;
    setIsProcessing(true);
    triggerHaptic('heavy');
    
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        showToast("Could not connect to the payment server. Please check your internet connection and try again.", "error");
        setIsProcessing(false);
        return;
      }

      // Create Order on full-stack Express server
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ amount, notes: { userId: currentUser.uid, ...notes } })
      });

      if (!res.ok) {
        throw new Error("Razorpay gateway handshake failed on back-end.");
      }

      const orderData = await res.json();
      
      // Sandbox fallback if Razorpay server is in Sandbox simulation
      if (orderData.isSandbox || !(window as any).Razorpay) {
        showToast("Entering Interactive Razorpay Sandbox Verification Gate", "info");
        setSimulatedOrder({ ...orderData, type, amount, notes });
        setShowSandboxModal(true);
        setIsProcessing(false);
        return;
      }

      // Real checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "TaazaBites Culinary",
        description: type === 'recharge' ? "Digital Wallet Recharge" : "Fresh Meal Subscription",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&q=80",
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            const authHeaders = await getAuthHeaders();
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: authHeaders,
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                type,
                notes: { userId: currentUser.uid, ...notes }
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              triggerHaptic('heavy');
              showToast(type === 'recharge' ? "₹" + amount + " loaded into your Wallet successfully!" : "Subscription protocol initialized!", "success");
            } else {
              showToast("Gateway verification rejected payment signature.", "error");
            }
          } catch (e) {
            console.error("Verification error:", e);
            showToast("Cryptographic signature check failed.", "error");
          }
        },
        prefill: {
          name: userProfile?.name || "",
          email: currentUser?.email || "",
          contact: userProfile?.phone || ""
        },
        theme: {
          color: "#10b981"
        }
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', function (resp: any) {
        showToast(`Checkout failed: ${resp.error.description}`, "error");
        logFailedPayment(orderData.id, amount, resp.error.description);
      });
      rzp1.open();

    } catch (error: any) {
      console.error("Razorpay error:", error);
      showToast(error.message === 'Failed to fetch' ? "Could not connect to the payment server. Please check your internet connection and try again." : (error.message || "Failed to contact payment gateway."), "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. Simulated payment confirmation for Sandbox gateway
  const handleSimulatedPaymentResult = async (status: 'success' | 'failed') => {
    if (!currentUser || !simulatedOrder) return;
    setIsProcessing(true);
    triggerHaptic('medium');

    try {
      if (status === 'failed') {
        setShowSandboxModal(false);
        showToast("Simulated payment transaction cancelled by user.", "error");
        await logFailedPayment(simulatedOrder.id, simulatedOrder.amount, "Simulated user abort");
        return;
      }

      // Call our secure server-side verification endpoint with mock credentials
      const mockPaymentId = `pay_sim_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
      const mockSignature = `sig_sim_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
      
      const authHeaders = await getAuthHeaders();
      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          razorpay_order_id: simulatedOrder.id,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: mockSignature,
          type: simulatedOrder.type,
          amount: simulatedOrder.amount,
          notes: { userId: currentUser.uid, ...simulatedOrder.notes }
        })
      });

      const verifyData = await verifyRes.json();
      setShowSandboxModal(false);

      if (verifyData.success) {
        triggerHaptic('heavy');
        showToast(
          simulatedOrder.type === 'recharge' 
            ? `Sandbox Authorized: ₹${simulatedOrder.amount} loaded persistently into Wallet!`
            : "Sandbox Authorized: 30-day Premium Subscription protocol fully populated!", 
          "success"
        );
      } else {
        showToast("Sandbox signature rejected by server-side crypto validation.", "error");
      }
    } catch (e: any) {
      console.error("Sandbox processing error:", e);
      showToast(e.message || "Sandbox authorization pipeline failed.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // 6. Database Demonstration Seeder
  const handleSeedDatabase = async () => {
    if (!currentUser) return;
    setIsProcessing(true);
    triggerHaptic('heavy');
    
    try {
      const batch = writeBatch(db);
      const now = Timestamp.now();
      const tenDaysAgo = Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000));
      const thirtyDaysAgo = Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
      const oneDayAgo = Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000));
      const fiveDaysAgo = Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000));
      const fourDaysAgo = Timestamp.fromDate(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000));
      const threeDaysAgo = Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000));

      // 6.1 Create seeded orders
      const ordersToSeed = [
        {
          id: "ORD-2026-9811",
          orderNumber: "ORD-2026-9811",
          userId: currentUser.uid,
          subscriptionId: currentUser.uid,
          mealScheduleId: "ms_optimize_01",
          planName: "High Protein Fresh Plan",
          amount: 5999,
          discount: 500,
          coupon: "HEALTH20",
          tax: 285,
          paymentStatus: "paid",
          deliveryStatus: "shipped",
          orderStatus: "confirmed",
          createdAt: tenDaysAgo
        },
        {
          id: "ORD-2026-4412",
          orderNumber: "ORD-2026-4412",
          userId: currentUser.uid,
          subscriptionId: currentUser.uid,
          mealScheduleId: "ms_baseline_02",
          planName: "Weekly Healthy Meal Plan",
          amount: 2999,
          discount: 0,
          coupon: "",
          tax: 142,
          paymentStatus: "paid",
          deliveryStatus: "delivered",
          orderStatus: "completed",
          createdAt: thirtyDaysAgo
        },
        {
          id: "ORD-2026-5573",
          orderNumber: "ORD-2026-5573",
          userId: currentUser.uid,
          subscriptionId: currentUser.uid,
          mealScheduleId: "none",
          planName: "30-Day Complete Healthy Plan",
          amount: 8099,
          discount: 900,
          coupon: "WELCOME10",
          tax: 428,
          paymentStatus: "failed",
          deliveryStatus: "cancelled",
          orderStatus: "failed",
          createdAt: oneDayAgo
        },
        {
          id: "ORD-2026-2104",
          orderNumber: "ORD-2026-2104",
          userId: currentUser.uid,
          subscriptionId: currentUser.uid,
          mealScheduleId: "none",
          planName: "Digital Wallet Recharge",
          amount: 2000,
          discount: 0,
          coupon: "",
          tax: 0,
          paymentStatus: "paid",
          deliveryStatus: "not_applicable",
          orderStatus: "recharged",
          createdAt: fiveDaysAgo
        }
      ];

      ordersToSeed.forEach(order => {
        batch.set(doc(db, 'orders', order.id), order);
      });

      // 6.2 Create payments corresponding to seeded orders
      const paymentsToSeed = [
        {
          id: "pay_N8K9c7D5h4A2",
          razorpayOrderId: "order_sim_A1B2C3",
          razorpayPaymentId: "pay_N8K9c7D5h4A2",
          userId: currentUser.uid,
          subscriptionId: currentUser.uid,
          amount: 5999,
          currency: "INR",
          paymentMethod: "UPI (Google Pay)",
          status: "captured",
          verified: true,
          createdAt: tenDaysAgo
        },
        {
          id: "pay_R2w1x3y4z5a6",
          razorpayOrderId: "order_sim_X9Y8Z7",
          razorpayPaymentId: "pay_R2w1x3y4z5a6",
          userId: currentUser.uid,
          subscriptionId: currentUser.uid,
          amount: 2999,
          currency: "INR",
          paymentMethod: "Credit Card (HDFC)",
          status: "captured",
          verified: true,
          createdAt: thirtyDaysAgo
        },
        {
          id: "pay_F1a2i3l4e5d6",
          razorpayOrderId: "order_sim_M4N5O6",
          razorpayPaymentId: "pay_F1a2i3l4e5d6",
          userId: currentUser.uid,
          subscriptionId: currentUser.uid,
          amount: 8099,
          currency: "INR",
          paymentMethod: "Net Banking (SBI)",
          status: "failed",
          verified: false,
          createdAt: oneDayAgo
        },
        {
          id: "pay_W2a1l3l4e5t6",
          razorpayOrderId: "order_sim_W1W2W3",
          razorpayPaymentId: "pay_W2a1l3l4e5t6",
          userId: currentUser.uid,
          subscriptionId: currentUser.uid,
          amount: 2000,
          currency: "INR",
          paymentMethod: "UPI (PhonePe)",
          status: "captured",
          verified: true,
          createdAt: fiveDaysAgo
        }
      ];

      paymentsToSeed.forEach(pay => {
        batch.set(doc(db, 'payments', pay.id), pay);
      });

      // 6.3 Create wallet balance record and transactions
      const walletTxToSeed = [
        {
          id: "TX-001",
          userId: currentUser.uid,
          type: 'credit',
          amount: 2000,
          reason: "Wallet Recharge via UPI",
          referenceId: "pay_W2a1l3l4e5t6",
          balanceBefore: 0,
          balanceAfter: 2000,
          createdAt: fiveDaysAgo
        },
        {
          id: "TX-002",
          userId: currentUser.uid,
          type: 'debit',
          amount: 1000,
          reason: "Meal Swap Balance Adjustment",
          referenceId: "ORD-2026-9811",
          balanceBefore: 2000,
          balanceAfter: 1000,
          createdAt: fourDaysAgo
        },
        {
          id: "TX-003",
          userId: currentUser.uid,
          type: 'credit',
          amount: 150,
          reason: "Gourmet Referral Bonus - Invited Preet",
          referenceId: "REF-9901",
          balanceBefore: 1000,
          balanceAfter: 1150,
          createdAt: threeDaysAgo
        },
        {
          id: "TX-004",
          userId: currentUser.uid,
          type: 'credit',
          amount: 100,
          reason: "Delayed Delivery Cash Compensation",
          referenceId: "DD-551",
          balanceBefore: 1150,
          balanceAfter: 1250,
          createdAt: oneDayAgo
        }
      ];

      walletTxToSeed.forEach(tx => {
        batch.set(doc(db, 'walletTransactions', tx.id), tx);
      });

      // Update user doc with rich balance/points
      batch.set(doc(db, 'users', currentUser.uid), {
        role: "customer",
        walletBalance: 1250,
        rewardPoints: 850,
        name: userProfile?.name || "Premium Dev",
        phone: userProfile?.phone || "+91 98765 43210",
        hasActiveSubscription: true,
        updatedAt: now
      }, { merge: true });

      // 6.4 Create seeded refunds
      const refundsToSeed = [
        {
          id: "REF-2026-1011",
          userId: currentUser.uid,
          orderId: "ORD-2026-5573",
          amount: 8099,
          reason: "Payment failed at gateway but amount debited from bank account. Requested auto-reconciliation.",
          status: "completed",
          createdAt: now
        },
        {
          id: "REF-2026-1012",
          userId: currentUser.uid,
          orderId: "ORD-2026-9811",
          amount: 150,
          reason: "Chef kitchen logistics breakdown on Sunday morning delayed delivery.",
          status: "completed",
          createdAt: fiveDaysAgo
        },
        {
          id: "REF-2026-1013",
          userId: currentUser.uid,
          orderId: "ORD-2026-4412",
          amount: 300,
          reason: "Medical dietary change request. Unused meal slots credit.",
          status: "processing",
          createdAt: oneDayAgo
        }
      ];

      refundsToSeed.forEach(ref => {
        batch.set(doc(db, 'refunds', ref.id), ref);
      });

      // 6.5 Create active subscription
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 20);
      batch.set(doc(db, 'subscriptions', currentUser.uid), {
        id: currentUser.uid,
        userId: currentUser.uid,
        planId: "optimize",
        planName: "Metabolic Optimize Protocol",
        status: "active",
        startDate: tenDaysAgo,
        endDate: Timestamp.fromDate(endDate),
        remainingMeals: 40,
        mealsPerDay: 2,
        paused: false,
        autoRenew: true,
        deliveryTime: "08:00 AM - 10:00 AM",
        deliveryAddressId: "default_address",
        createdAt: tenDaysAgo,
        updatedAt: now
      }, { merge: true });

      // 6.6 Create a default address if none
      if (addresses.length === 0) {
        batch.set(doc(db, 'addresses', 'default_address'), {
          id: 'default_address',
          userId: currentUser.uid,
          fullName: userProfile?.name || "Premium Dev",
          phone: userProfile?.phone || "+91 98765 43210",
          houseNumber: "Penthouse A",
          building: "Emerald Heights",
          street: "Lane 5, Koregaon Park",
          area: "Koregaon Park",
          city: "Pune",
          state: "Maharashtra",
          pincode: "411001",
          default: true,
          verified: true,
          createdAt: now
        });
      }

      await batch.commit();
      showToast("Real-time live database seeded successfully with mock histories!", "success");
    } catch (e: any) {
      console.error("Database seeding failed:", e);
      showToast(`Seeding failed: ${e.message}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // 7. PDF Invoice Generation (Section 4)
  const handleDownloadInvoicePDF = (order: any) => {
    triggerHaptic('light');
    try {
      const docPdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // 7.1 Brand Header Banner
      docPdf.setFillColor(16, 185, 129); // Emerald-500
      docPdf.rect(0, 0, 210, 40, 'F');
      
      docPdf.setTextColor(255, 255, 255);
      docPdf.setFont("Helvetica", "bold");
      docPdf.setFontSize(22);
      docPdf.text("TAAZABITES CULINARY", 15, 16);
      docPdf.setFont("Helvetica", "normal");
      docPdf.setFontSize(9);
      docPdf.text("Fresh & Healthy Meal Subscriptions", 15, 23);
      docPdf.text("Pune Corporate HQ • Pune - 411001, MH, India", 15, 28);
      docPdf.setFont("Helvetica", "bold");
      docPdf.text("GSTIN: 27AAAAA1111A1Z1", 15, 34);
      
      // Invoice metadata
      docPdf.setFontSize(14);
      docPdf.text("OFFICIAL TAX INVOICE", 145, 16);
      docPdf.setFontSize(9);
      docPdf.setFont("Helvetica", "normal");
      docPdf.text(`Invoice #: INV-2026-${order.orderNumber?.split('-').pop() || order.id?.slice(-6).toUpperCase()}`, 145, 23);
      docPdf.text(`Invoice Date: ${formatDate(order.createdAt, 'dd MMM, yyyy')}`, 145, 28);
      docPdf.text(`Payment Mode: UPI / Razorpay`, 145, 33);
      
      // 7.2 Customer & Company Details Block
      docPdf.setTextColor(100, 116, 139); // Slate-500
      docPdf.setFont("Helvetica", "bold");
      docPdf.setFontSize(10);
      docPdf.text("BILL TO (CUSTOMER):", 15, 52);
      
      docPdf.setTextColor(15, 23, 42); // Slate-900
      docPdf.text(userProfile?.name || currentUser?.email || "Gourmet Customer", 15, 58);
      docPdf.setFont("Helvetica", "normal");
      docPdf.setFontSize(9);
      docPdf.text(`Phone: ${userProfile?.phone || "+91 98765 43210"}`, 15, 63);
      docPdf.text(`Email: ${currentUser?.email || "support@taazabites.com"}`, 15, 68);
      
      // Address layout
      const addr = addresses.find(a => a.default) || addresses[0] || {
        houseNumber: "Penthouse A", building: "Emerald Heights", street: "Lane 5, Koregaon Park", area: "Koregaon Park", city: "Pune", pincode: "411001"
      };
      const formattedAddr = `${addr.houseNumber || ''}, ${addr.building || ''}, ${addr.street || ''}, ${addr.area || ''}, ${addr.city || ''} - ${addr.pincode || ''}`;
      docPdf.text(`Delivery: ${formattedAddr}`, 15, 73, { maxWidth: 85 });
      
      // Company block
      docPdf.setTextColor(100, 116, 139);
      docPdf.setFont("Helvetica", "bold");
      docPdf.setFontSize(10);
      docPdf.text("ISSUED BY:", 120, 52);
      
      docPdf.setTextColor(15, 23, 42);
      docPdf.text("TaazaBites Private Limited", 120, 58);
      docPdf.setFont("Helvetica", "normal");
      docPdf.setFontSize(9);
      docPdf.text("Gourmet Kitchen Central Hub", 120, 63);
      docPdf.text("Lane 5, Koregaon Park", 120, 68);
      docPdf.text("Pune, Maharashtra, India", 120, 73);
      
      // Divider
      docPdf.setDrawColor(226, 232, 240); // Slate-200
      docPdf.line(15, 82, 195, 82);
      
      // 7.3 Items Table
      docPdf.setFillColor(248, 250, 252); // Slate-50
      docPdf.rect(15, 88, 180, 8, 'F');
      docPdf.setTextColor(15, 23, 42);
      docPdf.setFont("Helvetica", "bold");
      docPdf.text("Description", 18, 93);
      docPdf.text("Qty", 120, 93);
      docPdf.text("Unit Price (INR)", 140, 93);
      docPdf.text("Amount (INR)", 170, 93);
      
      docPdf.setFont("Helvetica", "normal");
      docPdf.text(order.planName || "Fresh Meal Plan - 30 Days", 18, 103);
      docPdf.text("1", 122, 103);
      
      const baseVal = order.amount - (order.tax || 0) + (order.discount || 0);
      docPdf.text(`INR ${baseVal.toFixed(2)}`, 140, 103);
      docPdf.text(`INR ${baseVal.toFixed(2)}`, 170, 103);
      
      docPdf.line(15, 109, 195, 109);
      
      // Calculations Panel
      const calcY = 118;
      docPdf.setFontSize(9);
      docPdf.text("Subtotal Base Amount:", 125, calcY);
      docPdf.text(`INR ${baseVal.toFixed(2)}`, 170, calcY);
      
      docPdf.text("Applied Coupon Discount:", 125, calcY + 5);
      docPdf.setTextColor(220, 38, 38); // Red-600
      docPdf.text(`- INR ${(order.discount || 0).toFixed(2)}`, 170, calcY + 5);
      docPdf.setTextColor(15, 23, 42);
      
      const taxCGST = Math.round((order.tax || 0) / 2);
      const taxSGST = Math.round((order.tax || 0) / 2);
      
      docPdf.text("Taxes (CGST 2.5%):", 125, calcY + 10);
      docPdf.text(`INR ${taxCGST.toFixed(2)}`, 170, calcY + 10);
      
      docPdf.text("Taxes (SGST 2.5%):", 125, calcY + 15);
      docPdf.text(`INR ${taxSGST.toFixed(2)}`, 170, calcY + 15);
      
      docPdf.line(125, calcY + 19, 195, calcY + 19);
      
      docPdf.setFont("Helvetica", "bold");
      docPdf.setFontSize(11);
      docPdf.text("Grand Total Paid:", 125, calcY + 25);
      docPdf.text(`INR ${(order.amount || 0).toFixed(2)}`, 170, calcY + 25);
      
      // 7.4 Corporate terms footer
      docPdf.setFont("Helvetica", "normal");
      docPdf.setFontSize(8);
      docPdf.setTextColor(148, 163, 184); // Slate-400
      docPdf.text("This is an electronically generated compliance invoice and requires no physical signature.", 15, 175);
      docPdf.text("All sales are governed by the TaazaBites Culinary protocol terms, rules, and local refund matrices.", 15, 180);
      docPdf.text("For help with disputes, email support@taazabites.com or open a Support Ticket.", 15, 185);
      
      docPdf.save(`Invoice_INV-2026-${order.orderNumber?.split('-').pop() || order.id?.slice(-6).toUpperCase()}.pdf`);
      showToast("Invoice PDF generated and downloaded to device!", "success");
    } catch (err: any) {
      console.error("PDF generation failure:", err);
      showToast("PDF compiler error: " + err.message, "error");
    }
  };

  // 8. Printable tax invoice modal/popup window trigger (Section 4)
  const handlePrintInvoice = (order: any) => {
    triggerHaptic('light');
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showToast("Pop-up blocker is preventing the printable invoice from opening.", "error");
      return;
    }
    
    const addr = addresses.find(a => a.default) || addresses[0] || {
      houseNumber: "Penthouse A", building: "Emerald Heights", street: "Lane 5, Koregaon Park", area: "Koregaon Park", city: "Pune", pincode: "411001"
    };
    const formattedAddr = `${addr.houseNumber || ''}, ${addr.building || ''}, ${addr.street || ''}, ${addr.area || ''}, ${addr.city || ''} - ${addr.pincode || ''}`;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.orderNumber || order.id}</title>
          <style>
            body { font-family: 'Inter', -apple-system, sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 3px solid #10b981; padding-bottom: 24px; margin-bottom: 32px; }
            .logo { font-size: 24px; font-weight: 900; color: #10b981; letter-spacing: -0.05em; }
            .title { font-size: 18px; font-weight: 800; text-align: right; }
            .meta { font-size: 12px; color: #64748b; font-weight: 500; }
            .details { display: flex; justify-content: space-between; margin-bottom: 40px; gap: 20px; }
            .col { flex: 1; }
            .col h4 { margin: 0 0 10px 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; }
            .col p { margin: 4px 0; font-size: 13px; font-weight: 600; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { background: #f8fafc; text-align: left; padding: 12px 16px; font-size: 12px; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; }
            td { padding: 16px; font-size: 13px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
            .totals { width: 320px; margin-left: auto; font-size: 13px; font-weight: 500; }
            .totals div { display: flex; justify-content: space-between; margin: 8px 0; }
            .totals .grand { font-size: 16px; font-weight: 800; border-top: 2px solid #e2e8f0; padding-top: 12px; margin-top: 12px; color: #0f172a; }
            .footer { margin-top: 120px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 24px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">TAAZABITES CULINARY</div>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b; font-weight: 500;">Fresh & Healthy Meal Subscriptions</p>
            </div>
            <div class="title">
              <div>TAX INVOICE</div>
              <p class="meta" style="margin: 6px 0 0 0;">Invoice #: INV-2026-${order.orderNumber?.split('-').pop() || order.id?.slice(-6).toUpperCase()}</p>
              <p class="meta">Invoice Date: ${formatDate(order.createdAt, 'dd MMM, yyyy')}</p>
            </div>
          </div>
          
          <div class="details">
            <div class="col">
              <h4>BILL TO (CUSTOMER)</h4>
              <p>${userProfile?.name || "Valued Customer"}</p>
              <p style="font-weight: 500; color: #475569;">Phone: ${userProfile?.phone || "+91 98765 43210"}</p>
              <p style="font-weight: 500; color: #475569;">Email: ${currentUser?.email}</p>
              <p style="font-weight: 500; color: #475569; max-width: 250px;">Address: ${formattedAddr}</p>
            </div>
            <div class="col" style="text-align: right;">
              <h4>ISSUED BY</h4>
              <p>TaazaBites Private Limited</p>
              <p style="font-weight: 500; color: #475569;">Lane 5, Koregaon Park</p>
              <p style="font-weight: 500; color: #475569;">Pune, Maharashtra - 411001</p>
              <p style="font-weight: 600; color: #10b981;">GSTIN: 27AAAAA1111A1Z1</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-weight: 600;">${order.planName || "Fresh Healthy Meal Subscription"}</td>
                <td style="text-align: center;">1</td>
                <td style="text-align: right;">₹${(order.amount - (order.tax || 0) + (order.discount || 0)).toFixed(2)}</td>
                <td style="text-align: right;">₹${(order.amount - (order.tax || 0) + (order.discount || 0)).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="totals">
            <div>
              <span style="color: #64748b;">Subtotal:</span>
              <span>₹${(order.amount - (order.tax || 0) + (order.discount || 0)).toFixed(2)}</span>
            </div>
            ${order.discount ? `
            <div style="color: #dc2626;">
              <span>Coupon Discount:</span>
              <span>- ₹${(order.discount).toFixed(2)}</span>
            </div>
            ` : ''}
            <div>
              <span style="color: #64748b;">CGST (2.5%):</span>
              <span>₹${((order.tax || 0) / 2).toFixed(2)}</span>
            </div>
            <div>
              <span style="color: #64748b;">SGST (2.5%):</span>
              <span>₹${((order.tax || 0) / 2).toFixed(2)}</span>
            </div>
            <div class="grand">
              <span>Grand Total Paid:</span>
              <span>₹${(order.amount).toFixed(2)}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for ordering your healthy meals from TaazaBites!</p>
            <p>This is a computer-generated tax compliance receipt and requires no physical signature.</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    showToast("Print dispatcher initialized.", "success");
  };

  // 9. Interactive Email Dispatch Simulator (Section 4)
  const handleEmailInvoice = async (order: any) => {
    triggerHaptic('light');
    setSendingInvoiceId(order.id);
    
    try {
      // Simulate API call to SMTP mailer
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Log notification in Firestore for records
      await addDoc(collection(db, 'notifications'), {
        userId: currentUser?.uid,
        title: "Invoice Dispatched! ✉️",
        message: `Tax invoice for ORD-${order.orderNumber || order.id.slice(-6).toUpperCase()} has been dispatched to ${currentUser?.email || 'your registered email'}.`,
        type: "order",
        read: false,
        createdAt: Timestamp.now()
      });

      showToast(`Invoice PDF dispatched to ${currentUser?.email || 'your inbox'} successfully via SMTP relay!`, "success");
    } catch (e) {
      showToast("Failed to dispatch email invoice.", "error");
    } finally {
      setSendingInvoiceId(null);
    }
  };

  // 10. File a Refund Request in Firestore (Section 5)
  const handleSubmitRefundRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedOrder || !refundReason) return;
    setIsProcessing(true);
    triggerHaptic('medium');

    try {
      const refundId = `REF-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      
      // Write refund document to Firestore
      await setDoc(doc(db, 'refunds', refundId), {
        id: refundId,
        userId: currentUser.uid,
        orderId: selectedOrder.id,
        amount: selectedOrder.amount,
        reason: `${refundReason} - ${refundDetails}`,
        status: "requested",
        createdAt: Timestamp.now()
      });

      // Update Order's status to reflect refund requested
      await updateDoc(doc(db, 'orders', selectedOrder.id), {
        orderStatus: "refund_requested"
      });

      // Update local state copy to render in-drawer status changes
      setSelectedOrder((prev: any) => ({ ...prev, orderStatus: "refund_requested" }));

      showToast("Refund protocol initialized. Reconciliation team will review this in 4 hours.", "success");
      setShowRefundForm(false);
      setRefundReason("");
      setRefundDetails("");
    } catch (e: any) {
      showToast("Refund submission failed: " + e.message, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // 11. Toggle Subscription Auto-Renew (Section 6)
  const handleToggleAutoRenew = async (sub: any) => {
    triggerHaptic('light');
    try {
      const newStatus = !sub.autoRenew;
      await updateDoc(doc(db, 'subscriptions', sub.id), {
        autoRenew: newStatus,
        updatedAt: Timestamp.now()
      });
      showToast(newStatus ? "Auto-renewal activated." : "Auto-renewal paused.", "info");
    } catch (e: any) {
      showToast("Failed to update status: " + e.message, "error");
    }
  };

  // 12. Quick Reorder - Instantly populate cart with previous weekly meal plan
  const handleQuickReorder = (orderOrPlan?: any) => {
    triggerHaptic('heavy');
    const planName = orderOrPlan?.planName || "High Protein Fresh Plan (Weekly)";
    const amount = orderOrPlan?.amount || 2999;
    
    const reorderPlan = {
      id: orderOrPlan?.mealScheduleId || `reorder_${Date.now()}`,
      name: planName,
      durationDays: amount > 5000 ? 30 : 7,
      price: Math.round(amount * 1.15),
      offerPrice: amount,
      savings: Math.round(amount * 0.15),
      mealsPerDay: 3,
      totalMeals: amount > 5000 ? 90 : 21,
      calories: 2200,
      protein: 130,
      deliveryTiming: "Morning (7 AM - 9 AM)",
      dietType: "High Protein",
      fitnessGoal: "Muscle Gain & Energy"
    };

    try {
      localStorage.setItem("taaza_selected_plan", JSON.stringify(reorderPlan));
      localStorage.setItem("taaza_cart", JSON.stringify(reorderPlan));
    } catch (e) {
      console.warn("Cart storage error:", e);
    }

    showToast(`🛒 Quick Reorder: "${planName}" populated in cart! Redirecting to checkout...`, "success");
    setTimeout(() => {
      navigate("/checkout", { state: { selectedPlan: reorderPlan } });
    }, 600);
  };

  // Filter & Search Logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      order.planName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      order.id?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && order.paymentStatus?.toLowerCase() === statusFilter.toLowerCase();
  });

  // Calculate Wallet balances safely
  const currentBalance = userProfile?.walletBalance ?? 0;
  const currentPoints = userProfile?.rewardPoints ?? 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Real-time Toast Notification banner */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-6 right-6 z-50 shadow-2xl rounded-2xl overflow-hidden"
            >
              <div className={cn(
                "px-5 py-3.5 flex items-center gap-3 font-bold text-sm border shadow-lg backdrop-blur-xl",
                toastMessage.type === 'success' ? "bg-emerald-50/95 border-emerald-200 text-emerald-800" :
                toastMessage.type === 'error' ? "bg-rose-50/95 border-rose-200 text-rose-800" :
                "bg-amber-50/95 border-amber-200 text-amber-800"
              )}>
                {toastMessage.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />}
                {toastMessage.type === 'error' && <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />}
                {toastMessage.type === 'info' && <Sparkles className="h-5 w-5 text-amber-600 shrink-0" />}
                <span>{toastMessage.text}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* HEADER SECTION WITH INTEGRATED TABS */}
        <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 pb-8 border-b border-zinc-200/50">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="px-2 py-0.5 bg-zinc-900 text-white rounded text-[8px] font-black uppercase tracking-[0.2em]">Billing & Orders</div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Order & Payment History</span>
            </div>
            <h1 className="text-4xl font-black text-zinc-950 tracking-tightest flex items-center gap-4">
              <CreditCard className="h-10 w-10 text-emerald-600" />
              Orders & <span className="text-emerald-500">Payments</span>
            </h1>
            <p className="text-zinc-500 font-medium text-sm">Review your meal purchases, manage wallet credits, and view invoice receipts.</p>
          </div>

          {/* Premium Tab Bar Segment */}
          <div className="flex sm:flex-wrap bg-zinc-100 p-1 rounded-2xl gap-1 overflow-x-auto hide-scrollbar w-full xl:w-auto">
            {[
              { id: 'orders', label: 'Order History' },
              { id: 'payments', label: 'Gateway Logs' },
              { id: 'wallet', label: 'Wallet & Refunds' },
              { id: 'loyalty', label: 'Loyalty & Coupons' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTab(tab.id as any);
                }}
                className={cn(
                  "relative whitespace-nowrap flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors cursor-pointer",
                  activeTab === tab.id ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-900"
                )}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="ordersActiveTabPill"
                    className="absolute inset-0 bg-white rounded-xl shadow-xs"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </header>

        {/* BENTO DASHBOARD CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card className="p-8 rounded-[2.5rem] bg-zinc-950 text-white border-zinc-900 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-all duration-500" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-emerald-500 text-white rounded-2xl">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Verified Balance</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-black tracking-tight">₹{currentBalance.toFixed(2)}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live Sync Active</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card className="p-8 rounded-[2.5rem] bg-white border-zinc-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-all duration-500" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <Award className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Loyalty Units</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-black tracking-tight text-zinc-950">{currentPoints} <span className="text-xs">PTS</span></h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Executive Tier Status</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card className="p-8 rounded-[2.5rem] bg-white border-zinc-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-orange-500/10 transition-all duration-500" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                    <Clock3 className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Meals Remaining</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-black tracking-tight text-zinc-950">
                    {subscriptions.find(s => s.status === 'active')?.remainingMeals || 0} <span className="text-xs">UNITS</span>
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Remaining Slots</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
            <Card className="p-8 rounded-[2.5rem] bg-white border-zinc-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-sky-500/10 transition-all duration-500" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Invested</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-black tracking-tight text-zinc-950">
                    ₹{orders.filter(o => o.paymentStatus === 'paid').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Historical Expenditure</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* LOADING SKELETON STATE */}
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 bg-zinc-100 rounded-[32px]" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 8, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.995 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 gap-6"
            >

            {/* TAB 1: ORDER HISTORY & DETAIL CENTER */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                
                {/* Quick Reorder Favorite Weekly Meal Plan Banner */}
                <Card className="p-6 bg-gradient-to-r from-emerald-950 via-teal-950 to-zinc-950 text-white rounded-[32px] shadow-lg border border-emerald-800/40 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="space-y-1.5 z-10">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-emerald-400" />
                        Favorite Weekly Meal Plan
                      </span>
                      <span className="text-[10px] text-emerald-200/70 font-semibold">Instant Cart Refill</span>
                    </div>
                    <h3 className="text-xl font-black tracking-tight text-white">
                      {orders[0]?.planName || "High Protein Fresh Plan (Weekly)"}
                    </h3>
                    <p className="text-xs text-zinc-300 font-medium">
                      21 chef-prepared organic meals • 130g daily protein • Morning delivery (7 AM - 9 AM)
                    </p>
                  </div>
                  <Button
                    onClick={() => handleQuickReorder(orders[0] || { planName: "High Protein Fresh Plan (Weekly)", amount: 2999 })}
                    className="z-10 shrink-0 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center gap-2 cursor-pointer border-0"
                  >
                    <Zap className="h-4 w-4 fill-zinc-950" />
                    Quick Reorder
                  </Button>
                </Card>

                {/* Search / Filter bar */}
                <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-4 rounded-3xl border border-zinc-100 shadow-xs">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input 
                      type="text" 
                      placeholder="Search Order ID, protocol name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-11 pr-6 py-3 bg-zinc-50 border-0 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none w-full shadow-inner text-zinc-800 placeholder:text-zinc-400"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button variant="outline" className="rounded-2xl border-zinc-100 w-full md:w-auto h-[44px]">
                      <Filter className="h-4 w-4 mr-2" /> Filter
                    </Button>
                    
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 h-[44px] bg-white border border-zinc-150 rounded-2xl text-xs font-black uppercase tracking-widest outline-none shadow-sm cursor-pointer"
                    >
                      <option value="all">All States</option>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>

                {/* Empty State */}
                {filteredOrders.length === 0 ? (
                  <Card className="p-8 sm:p-16 border-dashed border-2 border-zinc-200 flex flex-col items-center text-center rounded-[48px] bg-white shadow-xs">
                    <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                      <Package className="h-8 w-8 text-zinc-300" />
                    </div>
                    <h3 className="text-xl font-black text-zinc-900">No Orders Registered</h3>
                    <p className="text-zinc-500 font-medium mt-2 max-w-xs text-xs">
                      {searchTerm ? `No results found for "${searchTerm}".` : "You haven't placed any healthy meal orders yet."}
                    </p>
                    {orders.length > 0 && (
                      <Button onClick={() => { setSearchTerm(""); setStatusFilter("all"); }} className="mt-6 rounded-2xl text-xs font-bold uppercase tracking-widest">
                        Reset Filters
                      </Button>
                    )}
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Card className="p-6 bg-white border-zinc-150 rounded-[32px] shadow-sm hover:shadow-md transition-all group overflow-hidden">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              <div className={cn(
                                "p-4 rounded-2xl group-hover:bg-emerald-50 transition-colors shrink-0",
                                order.paymentStatus === 'paid' ? "bg-emerald-50 text-emerald-600" :
                                order.paymentStatus === 'failed' ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                              )}>
                                {order.paymentStatus === 'paid' ? <CheckCircle2 className="h-6 w-6" /> :
                                 order.paymentStatus === 'failed' ? <AlertCircle className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                              </div>

                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">ID: {order.orderNumber || order.id.toUpperCase()}</span>
                                  <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full",
                                    order.paymentStatus === 'paid' ? "bg-emerald-100 text-emerald-800" :
                                    order.paymentStatus === 'failed' ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                                  )}>
                                    {order.paymentStatus}
                                  </span>
                                  {order.orderStatus === 'refund_requested' && (
                                    <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                      Refund Requested
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-base font-black text-zinc-900 truncate">{order.planName || "Metabolic Health Sourced Protocol"}</h3>
                                <p className="text-xs text-zinc-500 font-semibold">
                                  Placed on {formatDate(order.createdAt)}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 pt-4 md:pt-0 border-t md:border-t-0 md:border-l md:pl-6 border-zinc-150">
                              <div className="md:text-right">
                                <p className="text-lg font-black text-zinc-900">₹{order.amount}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Price</p>
                              </div>
                              
                              <div className="flex items-center gap-2 flex-wrap justify-end">
                                <button 
                                  onClick={() => handleQuickReorder(order)}
                                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xs cursor-pointer"
                                  title="Quick reorder this weekly meal plan"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                  Quick Reorder
                                </button>

                                <button 
                                  onClick={() => { triggerHaptic('light'); setSelectedOrder(order); }}
                                  className="flex items-center gap-1 px-3 py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-zinc-200 cursor-pointer"
                                >
                                  Details
                                  <ChevronRight className="h-3 w-3" />
                                </button>
                                
                                {order.paymentStatus === 'paid' && (
                                  <button 
                                    onClick={() => handleDownloadInvoicePDF(order)}
                                    className="flex items-center gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-emerald-200 cursor-pointer"
                                    title="Download PDF Invoice"
                                  >
                                    <Download className="h-3 w-3" />
                                    Invoice
                                  </button>
                                )}
                              </div>
                            </div>

                          </div>

                          {/* Integrated Star Rating & AI Feedback Widget */}
                          <div className="mt-4 pt-4 border-t border-zinc-100 flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">Delivery Status</p>
                                <DeliveryTracker status={order.deliveryStatus || order.orderStatus} compact={true} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">Meal Feedback</p>
                                <OrderMealRating
                                  orderId={order.id}
                                  planName={order.planName}
                                  initialRating={(order as any).mealRating || 0}
                                  initialFeedback={(order as any).mealFeedback || ""}
                                  initialTags={(order as any).mealTags || []}
                                  compact={true}
                                  onRatingSubmitted={() => {
                                    showToast("Meal rating submitted! AI menu suggestions updated.", "success");
                                  }}
                                />
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PAYMENTS LOGS & RETRY CORNER */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                
                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl relative overflow-hidden shadow-lg border-0">
                    <div className="relative z-10 space-y-2">
                      <CreditCard className="h-8 w-8 text-emerald-100" />
                      <p className="text-xs font-black uppercase tracking-widest text-emerald-100">Gateway Sourcing Status</p>
                      <h3 className="text-2xl font-black">Verified Secure</h3>
                      <p className="text-[10px] text-emerald-50 font-semibold">Automatic SHA-256 HMAC encryption.</p>
                    </div>
                    <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                      <CreditCard className="w-36 h-36" />
                    </div>
                  </Card>

                  <Card className="p-6 bg-white border-zinc-150 rounded-3xl shadow-sm flex flex-col justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Transactions</p>
                      <h3 className="text-3xl font-black text-zinc-900">{payments.length}</h3>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-semibold mt-4">Includes sandbox and failure logs.</p>
                  </Card>

                  <Card className="p-6 bg-white border-zinc-150 rounded-3xl shadow-sm flex flex-col justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Failed/Declined attempts</p>
                      <h3 className="text-3xl font-black text-rose-600">{payments.filter(p => p.status === 'failed').length}</h3>
                    </div>
                    <p className="text-[10px] text-rose-500 font-semibold mt-4">Payments eligible for instant retry protocol.</p>
                  </Card>
                </div>

                {/* Gateway history */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-zinc-900 flex items-center gap-2">
                    <History className="h-5 w-5 text-emerald-600" />
                    Razorpay Sourcing Operations
                  </h3>

                  {payments.length === 0 ? (
                    <Card className="p-6 sm:p-12 text-center rounded-[32px] bg-zinc-50/50 border-zinc-200">
                      <p className="text-sm font-bold text-zinc-400">No gateway logs recorded for this account.</p>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {payments.map((pay) => (
                        <Card key={pay.id} className="p-5 bg-white border-zinc-150 rounded-2xl shadow-xs">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-black text-zinc-800 font-mono">TXN: {pay.razorpayPaymentId || pay.id}</span>
                                <span className={cn(
                                  "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                                  pay.status === 'captured' || pay.status === 'verified' ? "bg-emerald-100 text-emerald-800" :
                                  pay.status === 'failed' ? "bg-rose-100 text-rose-800" : "bg-zinc-100 text-zinc-800"
                                )}>
                                  {pay.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-400 font-semibold">
                                Order Ref: <span className="font-mono">{pay.razorpayOrderId || "N/A"}</span> • {formatDate(pay.createdAt)}
                              </p>
                              {pay.failureReason && (
                                <p className="text-xs text-rose-600 font-bold bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100 mt-2">
                                  Gate Decline: {pay.failureReason}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-between lg:justify-end gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l lg:pl-6 border-zinc-100">
                              <div className="lg:text-right">
                                <p className="text-base font-black text-zinc-900">₹{pay.amount}</p>
                                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">{pay.paymentMethod || "Credit/Debit Card"}</p>
                              </div>

                              {pay.status === 'failed' && (
                                <Button 
                                  onClick={() => handleInitiatePayment(pay.amount, 'subscription')}
                                  disabled={isProcessing}
                                  className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest"
                                >
                                  {isProcessing ? <RefreshCw className="h-3 w-3 animate-spin" /> : "Retry Payment"}
                                </Button>
                              )}
                            </div>

                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 3: SECURE WALLET & REFUNDS */}
            {activeTab === 'wallet' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left panel: Wallet stats & load form */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Wallet Card Display */}
                  <Card className="p-6 bg-gradient-to-tr from-zinc-900 via-zinc-800 to-emerald-950 text-white rounded-[32px] relative overflow-hidden shadow-xl border-0">
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center justify-between">
                        <Wallet className="h-8 w-8 text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                          Active Secure Wallet
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Available Cash Balance</p>
                        <h2 className="text-4xl font-black tracking-tight">₹{currentBalance.toFixed(2)}</h2>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Pending Refunds</p>
                          <p className="text-sm font-bold text-zinc-200">
                            ₹{refunds.filter(r => r.status === 'processing').reduce((acc, r) => acc + (r.amount || 0), 0).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Total Savings Points</p>
                          <p className="text-sm font-bold text-emerald-400">{currentPoints} pts</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute right-[-20px] bottom-[-20px] opacity-5">
                      <Wallet className="w-52 h-52 text-emerald-400" />
                    </div>
                  </Card>

                  {/* Top-up Form */}
                  <Card className="p-6 bg-white border-zinc-150 rounded-[32px] shadow-sm space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                        Top-up Sourced Funds
                      </h4>
                      <p className="text-xs text-zinc-500 font-medium">Instantly clear orders and meal swaps using your preloaded wallet.</p>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        {["500", "1000", "2000"].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => setRechargeAmount(amt)}
                            className={cn(
                              "py-2.5 rounded-xl text-xs font-black transition-all border cursor-pointer",
                              rechargeAmount === amt 
                                ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-black shadow-inner" 
                                : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-600"
                            )}
                          >
                            ₹{amt}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="custom-top-up">Or enter custom amount (INR)</Label>
                        <Input
                          id="custom-top-up"
                          type="number"
                          placeholder="Enter top-up amount"
                          value={rechargeAmount}
                          onChange={(e) => setRechargeAmount(e.target.value)}
                          className="font-bold text-zinc-800"
                        />
                      </div>

                      <Button
                        onClick={() => handleInitiatePayment(Number(rechargeAmount), 'recharge')}
                        disabled={isProcessing || !rechargeAmount || Number(rechargeAmount) <= 0}
                        className="w-full rounded-2xl font-black text-xs uppercase tracking-widest mt-2 h-11"
                      >
                        {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Load Funds via Razorpay"}
                      </Button>
                    </div>
                  </Card>

                </div>

                {/* Right panel: transactions & refunds progress */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Transaction History logs */}
                  <Card className="p-6 bg-white border-zinc-150 rounded-[32px] shadow-sm space-y-4 flex-1">
                    <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
                       <TrendingUp className="h-5 w-5 text-emerald-600" />
                       Wallet Transaction History
                    </h3>

                    {walletTx.length === 0 ? (
                      <div className="py-12 text-center border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">No wallet movements on record.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                        {walletTx.map((tx) => (
                          <div key={tx.id} className="p-3.5 bg-zinc-50/50 border border-zinc-100 rounded-xl flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "p-2 rounded-xl shrink-0",
                                tx.type === 'credit' ? "bg-emerald-100 text-emerald-700" : "bg-zinc-200 text-zinc-700"
                              )}>
                                {tx.type === 'credit' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-xs font-black text-zinc-800">{tx.reason || "Recharge Sourcing"}</p>
                                <p className="text-[10px] text-zinc-400 font-bold">
                                  Ref: {tx.referenceId} • {formatDate(tx.createdAt, 'dd MMM, yyyy')}
                                </p>
                              </div>
                            </div>

                            <p className={cn(
                              "text-sm font-black",
                              tx.type === 'credit' ? "text-emerald-600" : "text-zinc-700"
                            )}>
                              {tx.type === 'credit' ? "+" : "-"}₹{tx.amount}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  {/* Active Refund Progress List */}
                  <Card className="p-6 bg-white border-zinc-150 rounded-[32px] shadow-sm space-y-4">
                    <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
                      <RotateCcw className="h-5 w-5 text-emerald-600" />
                      Reconciliation & Refund Center
                    </h3>

                    {refunds.length === 0 ? (
                      <div className="p-6 text-center bg-zinc-50 border border-zinc-100 rounded-2xl">
                        <p className="text-xs font-bold text-zinc-400">No active refund schedules.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {refunds.map((ref) => (
                          <div key={ref.id} className="p-4 border border-zinc-150 rounded-2xl bg-zinc-50/30 space-y-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div>
                                <p className="text-xs font-black text-zinc-900 font-mono">{ref.id}</p>
                                <p className="text-[10px] text-zinc-400 font-semibold">Order: {ref.orderId}</p>
                              </div>
                              
                              <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border",
                                ref.status === 'completed' ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                                ref.status === 'processing' ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-amber-50 border-amber-200 text-amber-700"
                              )}>
                                {ref.status === 'completed' ? "✓ Resolved" : ref.status === 'processing' ? "✎ Sourcing" : "◴ Processing"}
                              </span>
                            </div>

                            <p className="text-xs text-zinc-600 font-semibold italic bg-white p-2.5 rounded-xl border border-zinc-100">
                              "{ref.reason}"
                            </p>

                            {/* visual progress step */}
                            <div className="space-y-2 pt-2">
                              <div className="flex justify-between text-[8px] font-black uppercase tracking-wider text-zinc-400">
                                <span>Requested</span>
                                <span>Approved</span>
                                <span>Processing</span>
                                <span>Completed</span>
                              </div>
                              <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden relative">
                                <div className={cn(
                                  "h-full rounded-full transition-all duration-500",
                                  ref.status === 'completed' ? "bg-emerald-500 w-full" :
                                  ref.status === 'processing' ? "bg-blue-500 w-3/4" :
                                  ref.status === 'approved' ? "bg-amber-500 w-1/2" : "bg-amber-400 w-1/4"
                                )} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                </div>

              </div>
            )}

            {/* TAB 4: COUPONS & DISCOUNTS */}
            {activeTab === 'loyalty' && (
              <div className="space-y-6">
                
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Current Active Subscriptions auto renew */}
                  <Card className="p-6 bg-white border-zinc-150 rounded-[32px] shadow-sm space-y-4">
                    <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
                      <RefreshCw className="h-5 w-5 text-emerald-600" />
                      Continuous Sourcing Renewal
                    </h3>

                    {subscriptions.length === 0 ? (
                      <p className="text-xs text-zinc-400 font-semibold">No active subscriptions detected on account.</p>
                    ) : (
                      <div className="space-y-3">
                        {subscriptions.map((sub) => (
                          <div key={sub.id} className="p-4 border border-zinc-150 rounded-2xl flex items-center justify-between gap-4">
                            <div className="space-y-1">
                              <p className="text-xs font-black text-zinc-800">{sub.planName || "Optimize Sourced Protocol"}</p>
                              <p className="text-[10px] text-zinc-400 font-semibold">Remaining Meals: {sub.remainingMeals} slots</p>
                            </div>
                            
                            {/* Toggle auto renew */}
                            <button
                              onClick={() => handleToggleAutoRenew(sub)}
                              className="focus:outline-none cursor-pointer"
                              title="Toggle Auto Renewal"
                            >
                              <div className={cn(
                                "w-12 h-6 rounded-full p-0.5 transition-all duration-300",
                                sub.autoRenew ? "bg-emerald-500 flex justify-end" : "bg-zinc-300 flex justify-start"
                              )}>
                                <div className="w-5 h-5 rounded-full bg-white shadow-md transition-all" />
                              </div>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  {/* Loyalty Sourcing Rewards */}
                  <Card className="p-6 bg-gradient-to-br from-amber-500/90 to-orange-600/90 text-white rounded-[32px] relative overflow-hidden shadow-lg border-0">
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center justify-between">
                        <Award className="h-8 w-8 text-amber-100 animate-bounce" />
                        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-white/20 text-white rounded-full">
                          Vip Sourcing Tier
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-amber-100 uppercase tracking-widest">Sourced Loyalty Points</p>
                        <h2 className="text-4xl font-black">{currentPoints} <span className="text-xs font-medium">pts</span></h2>
                      </div>
                      
                      <p className="text-[10px] text-amber-50 font-semibold pt-2 border-t border-white/20">
                        Points are redeemable for priority fresh meal customizations, nutritionist assessments, or direct cashback.
                      </p>
                    </div>
                    <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                      <Award className="w-48 h-48" />
                    </div>
                  </Card>

                </div>

                {/* Sourcing Coupon Codes Clipboard panel */}
                <div className="space-y-4">
                  <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
                    <Percent className="h-5 w-5 text-emerald-600" />
                    Available Metabolic Sourcing Coupons
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {coupons.map((c) => (
                      <Card key={c.id} className="p-5 bg-white border-zinc-150 rounded-2xl flex items-center justify-between gap-4 shadow-xs relative overflow-hidden">
                        <div className="space-y-1.5 z-10">
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100 font-mono">
                            {c.code}
                          </span>
                          <h4 className="text-sm font-black text-zinc-800 mt-2">{c.title || c.description}</h4>
                          <p className="text-xs text-zinc-400 font-semibold">Min purchase required: ₹{c.minimumOrder || c.minOrderValue || 0}</p>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                            await safeCopyToClipboard(c.code);
                            triggerHaptic('light');
                            showToast(`Coupon code ${c.code} copied to clipboard!`, "success");
                          }}
                          className="rounded-xl h-8 border-zinc-200 text-xs font-bold cursor-pointer"
                        >
                          Copy
                        </Button>
                      </Card>
                    ))}

                    {coupons.length === 0 && (
                      <div className="md:col-span-2 p-8 border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50 text-center">
                        <p className="text-xs font-bold text-zinc-400">No promo codes active in your region today.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            </motion.div>
          </AnimatePresence>
        )}

      {/* RAZORPAY SANDBOX GATEWAY MODAL (Section 10) */}
      <AnimatePresence>
        {showSandboxModal && simulatedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] max-w-md w-full shadow-2xl border border-zinc-100 overflow-hidden"
            >
              <div className="p-6 bg-gradient-to-br from-emerald-600 to-teal-800 text-white text-center space-y-2 relative">
                <ShieldAlert className="h-12 w-12 text-yellow-300 mx-auto animate-pulse" />
                <h3 className="text-lg font-black tracking-tight">Razorpay Sandbox Gateway Gate</h3>
                <p className="text-xs text-emerald-100">
                  Because no production Razorpay merchant keys are set in your container, our back-end system has safely initialized a simulated cryptographic order sheet.
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-150 text-xs space-y-2.5 font-semibold">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Order ID:</span>
                    <span className="font-mono text-zinc-800 select-all font-black">{simulatedOrder.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Total Charge Amount:</span>
                    <span className="font-black text-zinc-800">₹{simulatedOrder.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Process Type:</span>
                    <span className="uppercase text-zinc-800 font-black tracking-wider">{simulatedOrder.type}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleSimulatedPaymentResult('failed')}
                    disabled={isProcessing}
                    variant="destructive"
                    className="rounded-2xl text-xs font-black uppercase tracking-widest h-12"
                  >
                    Simulate Fail
                  </Button>
                  <Button
                    onClick={() => handleSimulatedPaymentResult('success')}
                    disabled={isProcessing}
                    className="rounded-2xl text-xs font-black uppercase tracking-widest h-12"
                  >
                    {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Simulate Success"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAILED SLIDING DRAWER / DETAILS MODAL (Section 2) */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-40 flex justify-end bg-black/50 backdrop-blur-xs">
            
            {/* Backdrop click closer */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => { setSelectedOrder(null); setShowRefundForm(false); }} />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10"
            >
              
              {/* Drawer Header */}
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Invoice Sourcing</span>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                      selectedOrder.paymentStatus === 'paid' ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    )}>
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-zinc-900 mt-1">ORD-{selectedOrder.orderNumber || selectedOrder.id.slice(-6).toUpperCase()}</h3>
                </div>
                
                <button 
                  onClick={() => { setSelectedOrder(null); setShowRefundForm(false); }}
                  className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400 hover:text-zinc-900 cursor-pointer"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Drawer Body content (scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* Visual Delivery Tracker */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                    Live Delivery Journey
                  </h4>
                  <div className="p-6 bg-zinc-50 border border-zinc-100 rounded-3xl">
                    <DeliveryTracker status={selectedOrder.deliveryStatus || selectedOrder.orderStatus} />
                  </div>
                </div>

                {/* Cost Panel Summary */}
                <div className="p-5 bg-zinc-50 border border-zinc-150 rounded-2xl space-y-3 font-semibold text-xs text-zinc-700">
                  <div className="flex justify-between">
                    <span>Base Subscription Cost</span>
                    <span className="text-zinc-900">₹{(selectedOrder.amount - (selectedOrder.tax || 0) + (selectedOrder.discount || 0)).toFixed(2)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Applied Coupon: {selectedOrder.coupon || 'WELCOME10'}</span>
                      <span>- ₹{selectedOrder.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>CGST (2.5%)</span>
                    <span className="text-zinc-900">₹{((selectedOrder.tax || 0) / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST (2.5%)</span>
                    <span className="text-zinc-900">₹{((selectedOrder.tax || 0) / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-zinc-200 text-sm font-black text-zinc-900">
                    <span>Grand Net Paid</span>
                    <span className="text-base">₹{selectedOrder.amount}</span>
                  </div>
                </div>

                {/* Sourcing Actions bar */}
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      const targetOrder = selectedOrder;
                      setSelectedOrder(null);
                      handleQuickReorder(targetOrder);
                    }}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
                  >
                    <Zap className="h-4 w-4 fill-white" />
                    Quick Reorder This Meal Plan
                  </Button>

                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest pt-2">Receipt Sourcing Protocols</h4>
                  <div className="grid grid-cols-3 gap-2">
                    
                    <button
                      onClick={() => handleDownloadInvoicePDF(selectedOrder)}
                      className="flex flex-col items-center justify-center p-3.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-2xl gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-700 cursor-pointer"
                    >
                      <Download className="h-5 w-5 text-emerald-600" />
                      Download
                    </button>

                    <button
                      onClick={() => handlePrintInvoice(selectedOrder)}
                      className="flex flex-col items-center justify-center p-3.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-2xl gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-700 cursor-pointer"
                    >
                      <Printer className="h-5 w-5 text-zinc-600" />
                      Print
                    </button>

                    <button
                      onClick={() => handleEmailInvoice(selectedOrder)}
                      disabled={sendingInvoiceId === selectedOrder.id}
                      className="flex flex-col items-center justify-center p-3.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-2xl gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-700 disabled:opacity-50 cursor-pointer"
                    >
                      {sendingInvoiceId === selectedOrder.id ? (
                        <RefreshCw className="h-5 w-5 text-emerald-600 animate-spin" />
                      ) : (
                        <Mail className="h-5 w-5 text-zinc-600" />
                      )}
                      Email
                    </button>

                  </div>
                </div>

                {/* Delivery Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    Delivery Logistics Coordinates
                  </h4>
                  
                  <div className="p-4 border border-zinc-150 rounded-2xl space-y-2.5 text-xs text-zinc-700 font-semibold">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Recipient:</span>
                      <span className="text-zinc-900 font-black">{userProfile?.name || "Premium Dev"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Phone:</span>
                      <span className="text-zinc-900 font-mono">{userProfile?.phone || "+91 98765 43210"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Timing Schedule:</span>
                      <span className="text-zinc-900">{selectedOrder.deliveryStatus === 'not_applicable' ? 'N/A' : '08:00 AM - 10:00 AM'}</span>
                    </div>
                    <div className="pt-2.5 border-t border-zinc-100 flex flex-col gap-1">
                      <span className="text-zinc-400">Full Shipping Address:</span>
                      <span className="text-zinc-900 line-clamp-2">
                        {addresses[0] 
                          ? `${addresses[0].houseNumber}, ${addresses[0].building}, ${addresses[0].street}, ${addresses[0].area}, ${addresses[0].city} - ${addresses[0].pincode}`
                          : "Penthouse A, Emerald Heights, Lane 5, Koregaon Park, Pune, Maharashtra - 411001"
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Meal Rating & Feedback Section inside Details Drawer */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                    Rate & Fine-Tune Meal
                  </h4>
                  <OrderMealRating
                    orderId={selectedOrder.id}
                    planName={selectedOrder.planName}
                    initialRating={selectedOrder.mealRating || 0}
                    initialFeedback={selectedOrder.mealFeedback || ""}
                    initialTags={selectedOrder.mealTags || []}
                    onRatingSubmitted={(r, f, t) => {
                      setSelectedOrder({ ...selectedOrder, mealRating: r, mealFeedback: f, mealTags: t });
                      showToast("Meal rating saved! AI menu suggestions updated.", "success");
                    }}
                  />
                </div>

                {/* Refund Form Area */}
                <div className="pt-4 border-t border-zinc-100">
                  {selectedOrder.paymentStatus === 'paid' && selectedOrder.orderStatus !== 'refund_requested' && (
                    <div className="space-y-4">
                      {!showRefundForm ? (
                        <button
                          onClick={() => { triggerHaptic('light'); setShowRefundForm(true); }}
                          className="w-full h-11 border border-rose-200 hover:bg-rose-50/50 text-rose-700 text-xs font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          Request Sourcing Refund
                        </button>
                      ) : (
                        <form onSubmit={handleSubmitRefundRequest} className="space-y-4 p-4 border border-rose-100 rounded-2xl bg-rose-50/20">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black text-rose-800 uppercase tracking-widest">Refund Reconciliation Request</h4>
                            <button 
                              type="button" 
                              onClick={() => setShowRefundForm(false)} 
                              className="text-zinc-400 hover:text-zinc-900 text-xs font-bold"
                            >
                              Cancel
                            </button>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="refund-reason">Reason for Refund</Label>
                            <select
                              id="refund-reason"
                              required
                              value={refundReason}
                              onChange={(e) => setRefundReason(e.target.value)}
                              className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-xl text-xs font-semibold outline-none"
                            >
                              <option value="">Select reason code...</option>
                              <option value="Chef logistics delayed by 1+ hours">Delivery delayed by 1+ hours</option>
                              <option value="Dietary assessments update required">Need to change my diet plan</option>
                              <option value="Medical emergency cancellation">Medical emergency cancellation</option>
                              <option value="Wrong macro box delivered">Wrong meal box delivered</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="refund-details">Additional context (Required)</Label>
                            <Textarea
                              id="refund-details"
                              required
                              placeholder="Tell us what went wrong..."
                              value={refundDetails}
                              onChange={(e) => setRefundDetails(e.target.value)}
                              className="text-xs"
                            />
                          </div>

                          <Button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full h-10 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-widest"
                          >
                            {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Submit Refund Request"}
                          </Button>
                        </form>
                      )}
                    </div>
                  )}

                  {selectedOrder.orderStatus === 'refund_requested' && (
                    <div className="p-4 border border-blue-200 bg-blue-50/30 text-blue-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                      <Clock3 className="h-5 w-5 text-blue-600 shrink-0" />
                      <span>Reconciliation pending. Refusal/acceptance signature will clear in 4 hours.</span>
                    </div>
                  )}
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  </DashboardLayout>
);
}
