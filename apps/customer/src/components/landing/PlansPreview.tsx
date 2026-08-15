import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionPlans } from '../../lib/plans-cache';
import { normalizePlan } from '../../lib/plan-normalize';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { LivePlanGrid } from '../plans/LivePlanGrid';

export default function PlansPreview() {
  const navigate = useNavigate();
  const { plans, loading } = useSubscriptionPlans();
  const live = (plans || []).map(normalizePlan).filter((p) => p.active).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section className="py-24 bg-zinc-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
        >
            <span className="text-emerald-600 font-black uppercase tracking-widest text-xs px-3.5 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">Clear Pricing</span>
            <h2 className="text-4xl md:text-6xl font-black text-zinc-950 tracking-tighter mt-4 mb-4">Subscribe to <span className="text-emerald-600">Health</span></h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto font-medium">Live plans from our menu. Pause, skip, or cancel from your dashboard after you subscribe.</p>
        </motion.div>

        <LivePlanGrid
          plans={live}
          loading={loading}
          onSelect={() => navigate('/health-assessment')}
        />

        {!loading && live.length > 0 && (
          <div className="text-center mt-10">
            <button
              onClick={() => navigate('/health-assessment')}
              className={cn("px-8 py-4 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest")}
            >
              Start with a health assessment
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
