
export type AnalyticsEvent = 
  | 'view_item'
  | 'add_to_cart'
  | 'begin_checkout'
  | 'add_payment_info'
  | 'purchase'
  | 'complete_registration'
  | 'complete_health_assessment'
  | 'login'
  | 'sign_up'
  | 'wallet_topup'
  | 'referral_shared';

export interface EventParams {
  item_id?: string;
  item_name?: string;
  value?: number;
  currency?: string;
  transaction_id?: string;
  coupon?: string;
  method?: string;
  [key: string]: any;
}

export const Analytics = {
  track: (event: AnalyticsEvent, params?: EventParams) => {
    // Only run on client
    if (typeof window === 'undefined') return;

    // Track in Google Analytics if available
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', event, params);
    }

    // Track in custom Firestore analytics collection for backup/custom reporting
    // This is optional but useful for funnel analysis on the admin panel later
    if (params?.userId) {
       // We could call an API or use firestore directly
       // For now, console log for debugging in dev
       if (process.env.NODE_ENV !== 'production') {
         console.log(`[Analytics] ${event}`, params);
       }
    }
  },

  trackPurchase: (params: { transaction_id: string; value: number; coupon?: string }) => {
    Analytics.track('purchase', {
      ...params,
      currency: 'INR',
      items: [{
        item_name: 'Subscription Plan',
        quantity: 1,
        price: params.value
      }]
    });
  },

  trackHealthAssessment: (userId: string, goals: string[]) => {
    Analytics.track('complete_health_assessment', {
      userId,
      goals: goals.join(','),
      timestamp: new Date().toISOString()
    });
  }
};
