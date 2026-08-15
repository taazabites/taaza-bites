import type { SubscriptionPlan } from '../firebase/collections';

export interface NormalizedPlan {
  id: string;
  planName: string;
  name: string;
  description: string;
  price: number;
  offerPrice: number;
  duration: number;
  durationDays: number;
  mealsPerDay: number;
  totalMeals: number;
  calories: number;
  protein: number;
  deliverySchedule: string;
  features: string[];
  savings: number;
  popular: boolean;
  active: boolean;
  sortOrder: number;
  dietType?: string;
  goal?: string;
  mealTypes?: string[];
  image?: string;
  pricePerMeal: number;
  raw: Record<string, unknown>;
}

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function asBool(value: unknown): boolean {
  return value === true || value === 'true';
}

export function isPlanActive(plan: Partial<SubscriptionPlan> & Record<string, unknown>): boolean {
  if (plan.active === false || plan.isAvailable === false) return false;
  if (plan.active === true || plan.isAvailable === true) return true;
  if ((plan as any).isActive === false) return false;
  return (plan as any).isActive !== false;
}

export function normalizePlan(plan: any): NormalizedPlan {
  const planName = asString(plan.planName || plan.name, 'Meal Plan');
  const price = asNumber(plan.price);
  const offerPrice = asNumber(plan.offerPrice, price);
  const durationDays = asNumber(plan.durationDays ?? plan.duration, 30);
  const mealsPerDay = Math.max(1, asNumber(plan.mealsPerDay, 1));
  const totalMeals = asNumber(plan.totalMeals, durationDays * mealsPerDay);
  const listPrice = price > 0 ? price : offerPrice;
  const sellPrice = offerPrice > 0 ? offerPrice : price;
  const savings = asNumber(plan.savings, Math.max(0, listPrice - sellPrice));
  const features = Array.isArray(plan.features) ? plan.features.map(String) : [];

  return {
    id: plan.id,
    planName,
    name: planName,
    description: asString(plan.description),
    price: listPrice,
    offerPrice: sellPrice,
    duration: durationDays,
    durationDays,
    mealsPerDay,
    totalMeals,
    calories: asNumber(plan.calories),
    protein: asNumber(plan.protein),
    deliverySchedule: asString(plan.deliverySchedule, 'Daily delivery'),
    features,
    savings,
    popular: asBool(plan.popular),
    active: isPlanActive(plan),
    sortOrder: asNumber(plan.sortOrder ?? plan.displayOrder, 99),
    dietType: plan.dietType,
    goal: plan.goal,
    mealTypes: plan.mealTypes,
    image: plan.image,
    pricePerMeal: totalMeals > 0 ? Math.round(sellPrice / totalMeals) : sellPrice,
    raw: plan as Record<string, unknown>,
  };
}

export function toPlanSnapshot(plan: NormalizedPlan) {
  return {
    id: plan.id,
    planName: plan.planName,
    description: plan.description,
    price: plan.price,
    offerPrice: plan.offerPrice,
    duration: plan.durationDays,
    durationDays: plan.durationDays,
    mealsPerDay: plan.mealsPerDay,
    totalMeals: plan.totalMeals,
    calories: plan.calories,
    protein: plan.protein,
    deliverySchedule: plan.deliverySchedule,
    features: plan.features,
    savings: plan.savings,
    popular: plan.popular,
  };
}
