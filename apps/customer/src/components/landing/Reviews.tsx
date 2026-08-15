import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../../firebase/db';

interface Review {
  id: string;
  userName?: string;
  comments?: string;
  overallRating?: number;
  approved?: boolean;
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const snap = await getDocs(
        query(collection(db, 'customerReviews'), where('approved', '==', true), limit(12))
      );
      setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review)));
    } catch (err) {
      console.warn('Reviews fetch failed', err);
      setError('Reviews could not be loaded right now.');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="py-24 bg-zinc-50 border-t border-zinc-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-zinc-950 tracking-tighter">Customer reviews</h2>
          <p className="text-zinc-500 mt-3 font-medium">Only approved reviews from real customers. No sample quotes.</p>
        </div>
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => <div key={i} className="h-48 rounded-3xl bg-zinc-100 animate-pulse" />)}
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-sm text-rose-600">{error}</p>
            <button onClick={load} className="mt-3 text-sm font-bold underline">Retry</button>
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-center text-sm text-zinc-500">Reviews will appear here after customers share them.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <motion.article key={r.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2rem] border border-zinc-100">
                <Quote className="w-6 h-6 text-emerald-500 mb-4" />
                <p className="text-zinc-700 text-sm leading-relaxed">{r.comments}</p>
                <div className="mt-6 flex items-center justify-between">
                  <p className="font-bold text-zinc-900">{r.userName || 'Customer'}</p>
                  <span className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                    <Star className="w-4 h-4 fill-current" />
                    {r.overallRating || 5}
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
