import { MapPin, Salad, Truck } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import {
  daysUntil,
  mealsCompletedOf,
  mealsRemainingOf,
  planNameOf,
  resolveSubscriptionStatus,
  totalMealsOf,
} from '../../lib/subscription-lifecycle';
import { deliveryLabel, normalizeDeliveryStatus } from '../../lib/delivery-status';
import { format } from 'date-fns';

function MealRow({ label, meal }: { label: string; meal?: any }) {
  const status = meal ? deliveryLabel(meal.deliveryStatus || meal.status) : 'Not scheduled';
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-zinc-100 last:border-0">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400">{label}</p>
        <p className="text-sm font-bold text-zinc-900 mt-0.5">{meal?.mealName || meal?.name || 'Chef’s menu'}</p>
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{status}</span>
    </div>
  );
}

export function SubscriptionHomeCards({
  customerName,
  subscription,
  todayMeals,
  address,
  streak,
  delivery,
  onRenew,
}: {
  customerName?: string;
  subscription?: any;
  todayMeals?: any[];
  address?: any;
  streak?: number;
  delivery?: any;
  onRenew?: () => void;
}) {
  const hour = new Date().getHours();
  const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const status = resolveSubscriptionStatus(subscription);
  const daysLeft = daysUntil(subscription?.endDate);
  const remaining = mealsRemainingOf(subscription);
  const completed = mealsCompletedOf(subscription);
  const total = totalMealsOf(subscription);
  const progress = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  const nextDate = subscription?.nextDeliveryDate;
  const nextLabel = nextDate ? format(nextDate?.toDate ? nextDate.toDate() : new Date(nextDate), 'EEE, d MMM') : '—';
  const meals = todayMeals || [];
  const breakfast = meals.find((m) => /break/i.test(m.mealType || ''));
  const lunch = meals.find((m) => /lunch/i.test(m.mealType || ''));
  const dinner = meals.find((m) => /dinner/i.test(m.mealType || ''));
  const addr =
    subscription?.deliveryAddress?.street ||
    address?.street ||
    [address?.houseNumber, address?.area, address?.city].filter(Boolean).join(', ') ||
    'No address on file';
  const partner = delivery?.partnerName || delivery?.driverName || delivery?.driver?.name;
  const savings = Number(subscription?.planSnapshot?.savings || subscription?.savings || 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
          {hello}{customerName ? `, ${customerName.split(' ')[0]}` : ''}
        </h1>
        <div className="mt-2 flex items-center gap-2">
          <StatusBadge status={subscription?.status} endDate={subscription?.endDate} />
          <span className="text-xs font-medium text-zinc-500">Today’s subscription status</span>
        </div>
      </div>

      {(status === 'expiring' || (daysLeft !== null && daysLeft <= 7 && daysLeft >= 0)) && (
        <button
          onClick={onRenew}
          className="w-full rounded-2xl bg-orange-600 text-white font-black text-sm py-3.5"
        >
          Renew Subscription
        </button>
      )}

      <section className="rounded-[1.75rem] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Salad className="h-4 w-4 text-emerald-600" />
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">Today’s Meals</h2>
        </div>
        {meals.length === 0 ? (
          <p className="text-sm text-zinc-500">No meals are scheduled for today.</p>
        ) : (
          <>
            <MealRow label="Breakfast" meal={breakfast} />
            <MealRow label="Lunch" meal={lunch} />
            <MealRow label="Dinner" meal={dinner} />
          </>
        )}
      </section>

      <section className="rounded-[1.75rem] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">Subscription</h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-zinc-400 text-xs">Current plan</dt>
            <dd className="font-bold">{planNameOf(subscription)}</dd>
          </div>
          <div>
            <dt className="text-zinc-400 text-xs">Days remaining</dt>
            <dd className="font-bold">{daysLeft === null ? '—' : Math.max(0, daysLeft)}</dd>
          </div>
          <div>
            <dt className="text-zinc-400 text-xs">Meals remaining</dt>
            <dd className="font-bold">{remaining}</dd>
          </div>
          <div>
            <dt className="text-zinc-400 text-xs">Next delivery</dt>
            <dd className="font-bold">{nextLabel}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-zinc-400 text-xs">Renewal date</dt>
            <dd className="font-bold">
              {subscription?.endDate
                ? format(
                    subscription.endDate?.toDate ? subscription.endDate.toDate() : new Date(subscription.endDate),
                    'd MMM yyyy'
                  )
                : '—'}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-[1.75rem] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">Progress</h2>
        <div className="h-2 rounded-full bg-zinc-100 overflow-hidden mb-3">
          <div className="h-full bg-emerald-500" style={{ width: `${progress}%` }} />
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-zinc-400 text-xs">Meals completed</dt>
            <dd className="font-bold">{completed}</dd>
          </div>
          <div>
            <dt className="text-zinc-400 text-xs">Current streak</dt>
            <dd className="font-bold">{streak ?? 0} days</dd>
          </div>
          <div>
            <dt className="text-zinc-400 text-xs">Plan progress</dt>
            <dd className="font-bold">{progress}%</dd>
          </div>
          <div>
            <dt className="text-zinc-400 text-xs">Money saved</dt>
            <dd className="font-bold">{savings > 0 ? `₹${savings.toLocaleString()}` : '—'}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-[1.75rem] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Truck className="h-4 w-4 text-emerald-600" />
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">Delivery</h2>
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-zinc-400">Date</dt>
            <dd className="font-bold">{nextLabel}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-400">Status</dt>
            <dd className="font-bold capitalize">{deliveryLabel(delivery?.deliveryStatus || delivery?.status)}</dd>
          </div>
          {delivery?.mealType && (
            <div className="flex justify-between">
              <dt className="text-zinc-400">Meal</dt>
              <dd className="font-bold">{delivery.mealType}</dd>
            </div>
          )}
          <div className="flex gap-2">
            <MapPin className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
            <dd className="font-medium text-zinc-700 dark:text-zinc-300">{addr}</dd>
          </div>
          {partner && (
            <p className="text-xs text-zinc-500">Delivery partner: {partner}</p>
          )}
        </dl>
      </section>
    </div>
  );
}
