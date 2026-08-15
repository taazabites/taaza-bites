import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { NormalizedPlan } from '../../lib/plan-normalize';

export function LivePlanGrid({
  plans,
  selectedId,
  recommendedId,
  loading,
  error,
  onRetry,
  onSelect,
}: {
  plans: NormalizedPlan[];
  selectedId?: string;
  recommendedId?: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onSelect: (plan: NormalizedPlan) => void;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-64 rounded-3xl bg-zinc-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-100 bg-rose-50 p-6 text-center">
        <p className="text-sm font-medium text-rose-700">{error}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-3 text-sm font-bold text-rose-800 underline">
            Retry
          </button>
        )}
      </div>
    );
  }

  if (!plans.length) {
    return (
      <div className="rounded-3xl border border-zinc-100 bg-zinc-50 p-8 text-center text-sm font-medium text-zinc-500">
        No active subscription plans are available right now. Please try again shortly.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {plans.map((plan) => {
        const selected = selectedId === plan.id;
        const recommended = recommendedId === plan.id;
        return (
          <button
            key={plan.id}
            type="button"
            onClick={() => onSelect(plan)}
            className={cn(
              'text-left rounded-[2rem] border-2 p-6 transition-all relative bg-white',
              selected ? 'border-emerald-600 shadow-lg' : 'border-zinc-100 hover:border-zinc-200',
              plan.popular && !selected ? 'ring-1 ring-emerald-100' : ''
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-zinc-900">{plan.planName}</h3>
                {plan.description && (
                  <p className="mt-1 text-sm text-zinc-500">{plan.description}</p>
                )}
              </div>
              {(plan.popular || recommended) && (
                <span className="shrink-0 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1">
                  {recommended ? 'Recommended' : 'Popular'}
                </span>
              )}
            </div>

            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="text-3xl font-black tracking-tight">₹{plan.offerPrice.toLocaleString()}</p>
                <p className="text-xs font-bold text-emerald-700">₹{plan.pricePerMeal}/meal</p>
                {plan.savings > 0 && (
                  <p className="text-xs font-bold text-rose-600 mt-1">Save ₹{plan.savings.toLocaleString()}</p>
                )}
              </div>
              {selected && (
                <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold text-zinc-600">
              <div className="rounded-2xl bg-zinc-50 p-3">{plan.durationDays} days</div>
              <div className="rounded-2xl bg-zinc-50 p-3">{plan.mealsPerDay} meals/day</div>
              <div className="rounded-2xl bg-zinc-50 p-3">{plan.totalMeals} meals</div>
              <div className="rounded-2xl bg-zinc-50 p-3">
                {plan.calories ? `${plan.calories} kcal` : 'Macros on menu'}
              </div>
            </div>
            {plan.protein > 0 && (
              <p className="mt-2 text-xs font-medium text-zinc-500">{plan.protein}g protein target</p>
            )}
            {plan.features?.length > 0 && (
              <ul className="mt-4 space-y-1.5">
                {plan.features.slice(0, 4).map((f) => (
                  <li key={f} className="text-xs text-zinc-600 flex gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            )}
          </button>
        );
      })}
    </div>
  );
}
