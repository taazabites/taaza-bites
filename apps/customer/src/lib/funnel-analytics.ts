import { trackEvent } from '../utils/analytics';

const FUNNEL_EVENTS = [
  'subscription_view',
  'plan_selected',
  'health_assessment_started',
  'health_assessment_completed',
  'checkout_started',
  'payment_started',
  'payment_success',
  'payment_failed',
  'subscription_activated',
  'subscription_paused',
  'subscription_resumed',
  'subscription_skipped',
  'subscription_renewed',
  'subscription_cancelled',
] as const;

export type FunnelEvent = (typeof FUNNEL_EVENTS)[number];

const SENSITIVE = /age|weight|height|allerg|medical|gender|bmi|calorie|protein|condition/i;

export function trackFunnel(event: FunnelEvent, params: Record<string, unknown> = {}) {
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (SENSITIVE.test(key)) continue;
    if (value === undefined) continue;
    safe[key] = value;
  }
  trackEvent(event, 'subscription_funnel', safe);
}
