import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/primitives';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/db';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { RazorpayService } from '../firebase/services';
import { useToast } from '../context/ToastContext';
import { Loader2 } from 'lucide-react';

export default function OrderReview() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [assessment, setAssessment] = useState<any>(null);

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      // Fetch draft
      const draftQ = query(collection(db, 'subscriptionDrafts'), where('customerId', '==', currentUser.uid));
      const draftSnap = await getDocs(draftQ);
      if (!draftSnap.empty) {
        const docs = draftSnap.docs;
        docs.sort((a, b) => {
            const dateA = a.data().updatedAt?.toMillis() || 0;
            const dateB = b.data().updatedAt?.toMillis() || 0;
            return dateB - dateA;
        });
        const d = { id: docs[0].id, ...docs[0].data() } as any;
        setDraft(d);

        // Fetch plan
        const planSnap = await getDocs(query(collection(db, 'subscriptionPlans'), where('id', '==', d.selectedPlanId)));
        if (!planSnap.empty) setPlan(planSnap.docs[0].data());

        // Fetch health assessment
        const haQ = query(collection(db, 'healthAssessments'), where('userId', '==', currentUser.uid));
        const haSnap = await getDocs(haQ);
        if (!haSnap.empty) {
            const haDocs = haSnap.docs;
            haDocs.sort((a, b) => {
                const dateA = a.data().createdAt?.toMillis() || 0;
                const dateB = b.data().createdAt?.toMillis() || 0;
                return dateB - dateA;
            });
            setAssessment(haDocs[0].data());
        }
      }
    };
    fetchData();
  }, [currentUser]);

  const handleProceedToPayment = async () => {
    if (!currentUser || !draft || !plan) return;
    setLoading(true);

    try {
      const amount = plan.offerPrice + (draft.deliveryCharge || 0);
      const order = await RazorpayService.createOrder(amount, currentUser.uid, plan.id, draft.deliveryAreaId, draft.deliveryCharge || 0);

      if (order.isSandbox) {
        const mockPaymentId = `pay_sim_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
        await RazorpayService.verifyPayment({
          razorpay_order_id: order.id || order.orderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: "sandbox_sig_approved",
          amount: amount,
          notes: { userId: currentUser.uid, planId: plan.id, addressId: draft.address }
        });
        showToast("Payment successful! 🎉", "success");
        navigate('/dashboard');
        return;
      }

      if (!(window as any).Razorpay) {
        await new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      }

      const options = {
        key: order.keyId || "rzp_test_mock_key",
        amount: order.amount,
        currency: order.currency || "INR",
        order_id: order.orderId || order.id,
        name: "TaazaBites",
        description: `Subscription: ${plan.name}`,
        handler: async (response: any) => {
          try {
            await RazorpayService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: amount,
              notes: { userId: currentUser.uid, planId: plan.id, addressId: draft.address }
            });
            showToast("Payment successful!", "success");
            navigate('/dashboard');
          } catch (e) {
            showToast("Payment verification failed", "error");
          }
        },
        prefill: {
          name: assessment?.name || "",
          email: assessment?.email || "",
          contact: assessment?.phone || ""
        },
        theme: { color: "#10b981" }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (e: any) {
      showToast(e.message === 'Failed to fetch' ? "Could not connect to the payment server. Please check your internet connection and try again." : (e.message || "Payment initialization failed"), "error");
    } finally {
      setLoading(false);
    }
  };

  if (!draft || !plan) return <div className="p-12 text-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-zinc-50 py-12 px-6">
      <Helmet><title>Order Review | TaazaBites</title></Helmet>
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
        <h1 className="text-3xl font-black tracking-tighter mb-4">Order Review</h1>
        <div className="space-y-6">
          <section>
            <h2 className="font-bold text-zinc-900">Subscription Plan</h2>
            <p className="text-zinc-600">{plan.name} - {plan.duration}</p>
          </section>
          <section>
            <h2 className="font-bold text-zinc-900">Delivery Address</h2>
            <p className="text-zinc-600">{draft.address}</p>
          </section>
          <div className="border-t pt-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{plan.offerPrice + (draft.deliveryCharge || 0)}</span>
            </div>
          </div>
          <Button onClick={handleProceedToPayment} disabled={loading} className="w-full">
            {loading ? <Loader2 className="animate-spin" /> : 'Proceed to Payment'}
          </Button>
        </div>
      </div>
    </main>
  );
}
