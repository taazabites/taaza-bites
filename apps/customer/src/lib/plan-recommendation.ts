import { calculateNutrition } from './nutrition-utils';
import type { NormalizedPlan } from './plan-normalize';

export const GOALS = ['Weight Loss', 'Muscle Gain', 'Healthy Lifestyle', 'Maintenance'] as const;
export type GoalId = (typeof GOALS)[number];

const GOAL_MAP: Record<string, GoalId> = {
  'weight-loss': 'Weight Loss',
  weightloss: 'Weight Loss',
  'weight loss': 'Weight Loss',
  'muscle-gain': 'Muscle Gain',
  musclegain: 'Muscle Gain',
  'muscle gain': 'Muscle Gain',
  'healthy-lifestyle': 'Healthy Lifestyle',
  healthylifestyle: 'Healthy Lifestyle',
  'healthy life': 'Healthy Lifestyle',
  'healthy lifestyle': 'Healthy Lifestyle',
  maintenance: 'Maintenance',
  'high-protein': 'Muscle Gain',
};

export function normalizeGoal(raw: string | string[] | undefined): GoalId {
  const first = Array.isArray(raw) ? raw[0] : raw;
  if (!first) return 'Healthy Lifestyle';
  return GOAL_MAP[String(first).trim().toLowerCase()] || (GOALS.includes(first as GoalId) ? (first as GoalId) : 'Healthy Lifestyle');
}

export function nutritionForProfile(input: {
  gender?: string;
  age?: number | string;
  height?: number | string;
  weight?: number | string;
  activityLevel?: string;
  goal?: string | string[];
}) {
  const activityRaw = String(input.activityLevel || 'moderate').toLowerCase().replace(/\s+/g, '');
  const activity =
    activityRaw.includes('sedentary') ? 'sedentary' :
    activityRaw.includes('very') || activityRaw.includes('athlete') ? 'veryActive' :
    activityRaw.includes('active') ? 'moderatelyActive' : 'moderate';

  const goal = normalizeGoal(input.goal);
  const nutritionGoal =
    goal === 'Weight Loss' ? 'weightLoss' :
    goal === 'Muscle Gain' ? 'muscleGain' : 'maintenance';

  return calculateNutrition(
    String(input.gender || 'male'),
    Number(input.age) || 30,
    Number(input.height) || 170,
    Number(input.weight) || 70,
    activity,
    nutritionGoal
  );
}

export function recommendPlan(
  plans: NormalizedPlan[],
  opts: { mealsPerDay?: number; goal?: string | string[]; calories?: number }
): NormalizedPlan | null {
  const active = plans.filter((p) => p.active);
  if (!active.length) return null;

  const meals = Math.max(1, Number(opts.mealsPerDay) || 2);
  const scored = active.map((plan) => {
    let score = 0;
    if (plan.mealsPerDay === meals) score += 40;
    else score -= Math.abs(plan.mealsPerDay - meals) * 8;
    if (plan.popular) score += 10;
    if (opts.calories && plan.calories) {
      score -= Math.min(25, Math.abs(plan.calories - opts.calories) / 40);
    }
    const goal = normalizeGoal(opts.goal);
    if (plan.goal && String(plan.goal).toLowerCase().includes(goal.toLowerCase().split(' ')[0])) {
      score += 12;
    }
    if (plan.durationDays >= 15) score += 6;
    score -= plan.sortOrder / 10;
    return { plan, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.plan || active[0];
}

export function whyThisPlan(plan: NormalizedPlan, goal: GoalId, calories: number, protein: number): string {
  return `${plan.planName} matches a ${plan.mealsPerDay}-meal daily cadence for ${plan.durationDays} days (${plan.totalMeals} meals). Your estimated needs are about ${calories} kcal and ${protein}g protein per day for a ${goal.toLowerCase()} focus. This is a general nutrition estimate, not medical advice.`;
}
