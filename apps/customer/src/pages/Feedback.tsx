import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  Send,
  Heart,
  CheckCircle,
  Clock,
  Check,
  X,
  Plus,
  ShieldCheck,
  Sparkles,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button, Card } from '../components/ui/primitives';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { cn, formatDate } from '../lib/utils';
import { db } from '../firebase/db';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  onSnapshot, 
  increment,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  overallRating: number;
  taste: number;
  packaging: number;
  freshness: number;
  portionSize: number;
  delivery: number;
  comments: string;
  status: 'pending' | 'approved' | 'rejected';
  helpfulCount: number;
  isVerified?: boolean;
  replies?: { author: string; message: string; createdAt: any }[];
  createdAt: any;
}

export default function FeedbackPage() {
  const { currentUser, userData, isAdmin } = useAuth();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'public' | 'submit' | 'admin'>('public');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [adminQueue, setAdminQueue] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Form State
  const [ratings, setRatings] = useState({
    taste: 5,
    packaging: 5,
    freshness: 5,
    portionSize: 5,
    delivery: 5,
  });
  const [comments, setComments] = useState('');

  // Overall rating calculation
  const overallRating = Number(
    ((ratings.taste + ratings.packaging + ratings.freshness + ratings.portionSize + ratings.delivery) / 5).toFixed(1)
  );

  // 1. Fetch public (approved) reviews
  useEffect(() => {
    const q = query(
      collection(db, 'customerReviews'),
      where('status', '==', 'approved')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Review[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Review);
      });
      setReviews(items);
    }, (error) => {
      console.error("Error loading approved reviews:", error);
    });

    return unsubscribe;
  }, []);

  // 2. Fetch admin (pending) reviews if current user is admin
  useEffect(() => {
    if (!isAdmin) return;

    const q = query(
      collection(db, 'customerReviews'),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Review[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Review);
      });
      setAdminQueue(items);
    }, (error) => {
      console.error("Error loading admin queue:", error);
    });

    return unsubscribe;
  }, [isAdmin]);

  // 3. Check if user has verified purchase
  useEffect(() => {
    if (!currentUser) return;

    const checkVerification = async () => {
      try {
        const orderQuery = query(
          collection(db, 'orders'),
          where('userId', '==', currentUser.uid),
          limit(1)
        );
        const orderSnap = await getDocs(orderQuery);

        const subQuery = query(
          collection(db, 'subscriptions'),
          where('userId', '==', currentUser.uid),
          limit(1)
        );
        const subSnap = await getDocs(subQuery);

        setIsVerified(!orderSnap.empty || !subSnap.empty);
      } catch (err) {
        console.error("Error checking verification badge:", err);
      }
    };

    checkVerification();
  }, [currentUser]);

  // Submit Review
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast("Please log in to submit a review.", "error");
      return;
    }
    if (comments.trim().length < 10) {
      showToast("Please share a bit more detail (min 10 characters).", "error");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'customerReviews'), {
        userId: currentUser.uid,
        userName: userData?.name || currentUser.displayName || "Anonymous Protocol",
        userPhoto: currentUser.photoURL || "",
        overallRating,
        taste: ratings.taste,
        packaging: ratings.packaging,
        freshness: ratings.freshness,
        portionSize: ratings.portionSize,
        delivery: ratings.delivery,
        comments,
        status: 'pending', // Pending admin approval
        helpfulCount: 0,
        isVerified,
        replies: [],
        createdAt: serverTimestamp()
      });

      showToast("Review submitted! It will appear publicly once approved by administrators.", "success");
      setComments('');
      setRatings({ taste: 5, packaging: 5, freshness: 5, portionSize: 5, delivery: 5 });
      setActiveTab('public');
    } catch (error) {
      console.error("Error saving review:", error);
      showToast("Could not submit review. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Upvote Helpfulness
  const handleHelpful = async (reviewId: string) => {
    try {
      const docRef = doc(db, 'customerReviews', reviewId);
      await updateDoc(docRef, {
        helpfulCount: increment(1)
      });
      showToast("Thank you for your feedback!", "success");
    } catch (err) {
      showToast("Error updating helpful count", "error");
    }
  };

  // Admin: Approve
  const handleApprove = async (reviewId: string) => {
    try {
      const docRef = doc(db, 'customerReviews', reviewId);
      await updateDoc(docRef, { status: 'approved' });
      showToast("Review approved and published!", "success");
    } catch (err) {
      showToast("Failed to approve review", "error");
    }
  };

  // Admin: Reject
  const handleReject = async (reviewId: string) => {
    try {
      const docRef = doc(db, 'customerReviews', reviewId);
      await updateDoc(docRef, { status: 'rejected' });
      showToast("Review rejected.", "success");
    } catch (err) {
      showToast("Failed to reject review", "error");
    }
  };

  // Star Input Helper
  const StarInput = ({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) => (
    <div className="flex justify-between items-center bg-zinc-50/50 p-4 rounded-2xl border border-zinc-100">
      <span className="text-xs font-black uppercase tracking-wider text-zinc-500">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star 
              className={cn(
                "h-6 w-6 transition-colors", 
                star <= value ? "fill-amber-400 text-amber-400" : "text-zinc-200"
              )} 
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
            <Sparkles className="h-3 w-3" /> VERIFIED EXPERIENCE REPORT
          </div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Customer Reviews</h1>
          <p className="text-zinc-500 font-medium max-w-lg mx-auto">
            Explore authentic logs from the Taaza Bites community, verified by real order ledgers.
          </p>
        </header>

        {/* Navigation Tabs */}
        <div className="flex justify-center border-b border-zinc-200">
          <div className="flex gap-8 -mb-px">
            <button
              onClick={() => setActiveTab('public')}
              className={cn(
                "pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all",
                activeTab === 'public' ? "border-emerald-500 text-zinc-950 font-black" : "border-transparent text-zinc-400 hover:text-zinc-600"
              )}
            >
              Verified Reviews ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('submit')}
              className={cn(
                "pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all",
                activeTab === 'submit' ? "border-emerald-500 text-zinc-950 font-black" : "border-transparent text-zinc-400 hover:text-zinc-600"
              )}
            >
              Write Review
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={cn(
                  "pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2",
                  activeTab === 'admin' ? "border-amber-500 text-amber-600 font-black" : "border-transparent text-zinc-400 hover:text-amber-500"
                )}
              >
                Approval Queue
                <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-black">
                  {adminQueue.length}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === 'public' && (
              <motion.div
                key="public"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                {/* Side Summary */}
                <div className="space-y-6">
                  <Card className="p-8 border-zinc-100 bg-white rounded-[40px] shadow-sm">
                    <h3 className="text-lg font-black text-zinc-900 mb-6">Metrics Summary</h3>
                    
                    {reviews.length === 0 ? (
                      <div className="text-center py-6 text-zinc-400 font-bold text-sm">
                        No reviews logged yet. Be the first to review!
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="text-center border-b border-zinc-100 pb-6">
                          <div className="text-5xl font-black text-zinc-900">
                            {(reviews.reduce((acc, r) => acc + r.overallRating, 0) / reviews.length).toFixed(1)}
                          </div>
                          <div className="flex justify-center gap-1 my-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <div className="text-xs font-black uppercase tracking-widest text-zinc-400">
                            Based on {reviews.length} logs
                          </div>
                        </div>

                        {/* Attribute Breakdown */}
                        <div className="space-y-4">
                          {[
                            { name: "Taste Profile", key: 'taste' },
                            { name: "Freshness", key: 'freshness' },
                            { name: "Packaging Detail", key: 'packaging' },
                            { name: "Portion Adequacy", key: 'portionSize' },
                            { name: "Delivery Ingress", key: 'delivery' }
                          ].map((attr) => {
                            const avg = (reviews.reduce((acc, r) => acc + (r[attr.key as keyof Review] as number), 0) / reviews.length).toFixed(1);
                            return (
                              <div key={attr.name} className="space-y-1">
                                <div className="flex justify-between text-xs font-black uppercase tracking-wider text-zinc-500">
                                  <span>{attr.name}</span>
                                  <span className="font-bold text-zinc-800">{avg}/5</span>
                                </div>
                                <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-emerald-500 h-full rounded-full transition-all" 
                                    style={{ width: `${(Number(avg) / 5) * 100}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </Card>

                  <Card className="p-8 border-emerald-100 bg-emerald-50/20 rounded-[40px]">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 mb-6 shadow-md shadow-emerald-500/5">
                      <Heart className="h-6 w-6" />
                    </div>
                    <h4 className="text-md font-black text-zinc-900 mb-2">Real Feedback Promise</h4>
                    <p className="text-xs font-medium text-zinc-500 leading-relaxed">
                      Every rating is tied to a verified account. We don't filter constructive feedback; transparency shapes our gourmet protocols.
                    </p>
                  </Card>
                </div>

                {/* Reviews List */}
                <div className="md:col-span-2 space-y-6">
                  {reviews.length === 0 ? (
                    <div className="text-center py-24 bg-white border border-zinc-100 rounded-[48px] shadow-sm">
                      <div className="max-w-xs mx-auto space-y-4">
                        <MessageSquare className="h-12 w-12 text-zinc-300 mx-auto" />
                        <h3 className="text-lg font-black text-zinc-900">Protocol Ledger is Empty</h3>
                        <p className="text-sm font-medium text-zinc-400 leading-relaxed">
                          No active reviews meet approval criteria. Be the trail blazer and post your feedback today!
                        </p>
                        <Button 
                          onClick={() => setActiveTab('submit')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs uppercase tracking-widest py-4 px-6 h-auto"
                        >
                          Write a Review
                        </Button>
                      </div>
                    </div>
                  ) : (
                    reviews.map((r) => (
                      <Card key={r.id} className="p-8 border-zinc-100 bg-white rounded-[40px] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        {/* Rating Corner */}
                        <div className="absolute top-8 right-8 flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-full">
                          <Star className="h-4 w-4 fill-emerald-600 text-emerald-600" />
                          <span className="text-xs font-black">{r.overallRating}</span>
                        </div>

                        {/* User Metadata */}
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 bg-zinc-100 border border-zinc-200 rounded-full flex items-center justify-center text-lg font-black text-zinc-700 overflow-hidden">
                            {r.userPhoto ? (
                              <img src={r.userPhoto} alt={r.userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                            ) : (
                              r.userName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-black text-zinc-950">{r.userName}</h4>
                              {r.isVerified && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                  <ShieldCheck className="h-3 w-3" /> Verified Purchase
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400">
                              Logged on {r.createdAt instanceof Timestamp ? formatDate(r.createdAt.toDate()) : "Recent Session"}
                            </span>
                          </div>
                        </div>

                        {/* Comments */}
                        <p className="text-sm font-medium text-zinc-600 leading-relaxed mb-6 bg-zinc-50/50 p-5 rounded-3xl border border-zinc-100 italic">
                          "{r.comments}"
                        </p>

                        {/* Attribute Badges */}
                        <div className="flex flex-wrap gap-2.5 mb-6">
                          {[
                            { name: "Taste", score: r.taste },
                            { name: "Freshness", score: r.freshness },
                            { name: "Packaging", score: r.packaging },
                            { name: "Portion", score: r.portionSize },
                            { name: "Delivery", score: r.delivery },
                          ].map((a) => (
                            <span key={a.name} className="text-[10px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full flex items-center gap-1">
                              {a.name}: <span className="text-zinc-950">{a.score}★</span>
                            </span>
                          ))}
                        </div>

                        {/* Footer Controls */}
                        <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
                          <button
                            onClick={() => handleHelpful(r.id)}
                            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-emerald-600 transition-colors"
                          >
                            <ThumbsUp className="h-4 w-4" /> Helpful ({r.helpfulCount})
                          </button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'submit' && (
              <motion.div
                key="submit"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-2xl mx-auto"
              >
                {!currentUser ? (
                  <div className="text-center py-16 bg-white border border-zinc-100 rounded-[48px] p-8 shadow-sm">
                    <h3 className="text-xl font-black text-zinc-900 mb-2">Authentication Required</h3>
                    <p className="text-zinc-500 font-medium mb-6">You must be logged in to file telemetry logs and submit reviews.</p>
                  </div>
                ) : (
                  <Card className="p-10 border-zinc-100 bg-white rounded-[48px] shadow-md space-y-8">
                    <div className="space-y-2 border-b border-zinc-100 pb-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-zinc-900">Submit Your Protocol Review</h3>
                        <span className="text-xl font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
                          {overallRating}★
                        </span>
                      </div>
                      <p className="text-xs font-medium text-zinc-400">
                        Score across our operational protocols. This logs directly to public feedback database.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <StarInput label="Taste Profile" value={ratings.taste} onChange={(v) => setRatings({ ...ratings, taste: v })} />
                        <StarInput label="Gourmet Freshness" value={ratings.freshness} onChange={(v) => setRatings({ ...ratings, freshness: v })} />
                        <StarInput label="Packaging Detail" value={ratings.packaging} onChange={(v) => setRatings({ ...ratings, packaging: v })} />
                        <StarInput label="Portion Size" value={ratings.portionSize} onChange={(v) => setRatings({ ...ratings, portionSize: v })} />
                        <div className="md:col-span-2">
                          <StarInput label="Delivery Experience" value={ratings.delivery} onChange={(v) => setRatings({ ...ratings, delivery: v })} />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-wider text-zinc-500 block">Comments & Gourmet Insights</label>
                        <textarea
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          placeholder="Rate the dishes, menu customizability, calories tracking accuracy, or customer service..."
                          className="w-full p-6 rounded-[32px] border-2 border-zinc-100 focus:border-emerald-500 outline-none transition-all font-bold text-sm min-h-[160px] resize-none bg-zinc-50/50"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 rounded-2xl bg-zinc-900 hover:bg-black text-white font-black uppercase tracking-widest text-xs h-auto"
                      >
                        {loading ? "Filing Report..." : "Submit Verified Review"} <Send className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </Card>
                )}
              </motion.div>
            )}

            {activeTab === 'admin' && isAdmin && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-3xl mx-auto space-y-6"
              >
                <div className="flex justify-between items-center bg-amber-50 border border-amber-100 p-6 rounded-[32px]">
                  <div>
                    <h3 className="text-sm font-black text-amber-800">Admin Moderation Console</h3>
                    <p className="text-xs font-medium text-amber-600">Pending reviews must be explicitly approved to join the public ledger.</p>
                  </div>
                  <span className="bg-amber-600 text-white font-black text-xs px-3 py-1.5 rounded-full">
                    {adminQueue.length} Pending
                  </span>
                </div>

                {adminQueue.length === 0 ? (
                  <div className="text-center py-20 bg-white border border-zinc-100 rounded-[48px] p-8 shadow-sm">
                    <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-lg font-black text-zinc-900">Queue Cleared!</h3>
                    <p className="text-sm font-medium text-zinc-400">All submitted feedback has been processed.</p>
                  </div>
                ) : (
                  adminQueue.map((r) => (
                    <Card key={r.id} className="p-8 border-zinc-100 bg-white rounded-[40px] shadow-sm relative">
                      <div className="absolute top-8 right-8 bg-amber-50 text-amber-700 font-mono text-xs px-3 py-1 rounded-full font-black uppercase">
                        Pending
                      </div>

                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center font-black text-zinc-700">
                          {r.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-zinc-900">{r.userName}</h4>
                          <span className="text-[10px] text-zinc-400">Rating: {r.overallRating}★</span>
                        </div>
                      </div>

                      <p className="text-sm font-medium text-zinc-600 bg-zinc-50 p-4 rounded-2xl border border-zinc-100 italic mb-6">
                        "{r.comments}"
                      </p>

                      <div className="flex justify-end gap-3 border-t border-zinc-100 pt-4">
                        <button
                          onClick={() => handleReject(r.id)}
                          className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-rose-500 hover:text-rose-700 transition-colors"
                        >
                          <X className="h-4 w-4" /> Reject
                        </button>
                        <button
                          onClick={() => handleApprove(r.id)}
                          className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-all"
                        >
                          <Check className="h-4 w-4" /> Approve & Publish
                        </button>
                      </div>
                    </Card>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}
