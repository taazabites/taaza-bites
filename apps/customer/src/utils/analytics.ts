import { doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/db';
import { auth } from '../firebase/core';

// Declare global types for third-party scripts
declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

// Ensure dataLayer is initialized
if (typeof window !== 'undefined' && !window.dataLayer) {
  window.dataLayer = [];
}

/**
 * Initialize GA4, Meta Pixel and GTM scripts dynamically in the DOM
 */
export function initMarketingScripts(gtmId = 'GTM-T5NZB88', ga4Id = 'G-W0N9L6W', pixelId = '123456789012345') {
  if (typeof window === 'undefined') return;

  console.log('Initializing Growth & Marketing Scripts...');

  // 1. Google Tag Manager
  if (!document.getElementById('gtm-script')) {
    const gtmScript = document.createElement('script');
    gtmScript.id = 'gtm-script';
    gtmScript.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${gtmId}');`;
    document.head.appendChild(gtmScript);

    // GTM NoScript (fallback)
    const gtmNoScript = document.createElement('noscript');
    gtmNoScript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    document.body.insertBefore(gtmNoScript, document.body.firstChild);
  }

  // 2. Google Analytics 4
  if (!document.getElementById('ga4-script')) {
    const ga4ScriptUrl = document.createElement('script');
    ga4ScriptUrl.id = 'ga4-script-url';
    ga4ScriptUrl.async = true;
    ga4ScriptUrl.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
    document.head.appendChild(ga4ScriptUrl);

    const ga4Script = document.createElement('script');
    ga4Script.id = 'ga4-script';
    ga4Script.innerHTML = `window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', '${ga4Id}', { send_page_view: false });`;
    document.head.appendChild(ga4Script);
  }

  // 3. Meta Pixel
  if (!document.getElementById('pixel-script')) {
    const pixelScript = document.createElement('script');
    pixelScript.id = 'pixel-script';
    pixelScript.innerHTML = `!function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');`;
    document.head.appendChild(pixelScript);
  }
}

/**
 * Log analytics event to Firestore for admin analytics dashboard & dispatch to live scripts
 */
export async function trackEvent(
  eventName: string,
  category = 'general',
  params: Record<string, any> = {},
  value?: number
) {
  if (typeof window === 'undefined') return;

  const userId = auth.currentUser?.uid || 'anonymous';
  const timestamp = new Date().toISOString();

  // 1. Google Tag Manager (DataLayer push)
  window.dataLayer.push({
    event: eventName,
    eventCategory: category,
    eventParams: params,
    eventValue: value,
    userId: userId,
    timestamp: timestamp
  });

  // 2. Google Analytics 4 (Direct push if available)
  if (window.gtag) {
    window.gtag('event', eventName, {
      event_category: category,
      ...params,
      value: value,
      user_id: userId
    });
  }

  // 3. Meta Pixel (Standard Event mapping if applicable)
  if (window.fbq) {
    const standardMetaEventsMap: Record<string, string> = {
      view_item: 'ViewContent',
      begin_checkout: 'InitiateCheckout',
      purchase: 'Purchase',
      sign_up: 'CompleteRegistration',
      lead_generation: 'Lead'
    };

    const metaEvent = standardMetaEventsMap[eventName];
    if (metaEvent) {
      if (metaEvent === 'Purchase') {
        window.fbq('track', 'Purchase', {
          value: value || params.price || 0,
          currency: 'INR',
          content_name: params.planName || 'Meal Subscription'
        });
      } else {
        window.fbq('track', metaEvent, {
          content_name: params.planName || undefined,
          value: value || params.price || undefined,
          currency: value || params.price ? 'INR' : undefined
        });
      }
    } else {
      // Track as custom event in Pixel
      window.fbq('trackCustom', eventName, params);
    }
  }

  // 4. Firestore Analytics Log (Provides exact, accurate live telemetry for Admin Marketing & Analytics dashboards!)
  // DISABLED TO PREVENT FIREBASE QUOTA EXHAUSTION IN DEV ENVIRONMENT
  /*
  try {
    // Sanitize params to remove undefined values, as Firestore doesn't support them
    const sanitizedParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );

    const eventPayload = {
      eventName,
      category,
      userId,
      path: window.location.pathname,
      params: sanitizedParams,
      value: value || null,
      referrer: document.referrer || '',
      device: navigator.userAgent,
      createdAt: serverTimestamp()
    };
    await addDoc(collection(db, 'analyticsEvents'), eventPayload);
    console.log(`[ANALYTICS ENGINE]: Tracked "${eventName}" successfully in Firestore & scripts.`);
  } catch (error) {
    console.error('Failed to log analytics event to Firestore:', error);
  }
  */
}

// Standard Event helpers for easy import across the pages
export const Analytics = {
  trackPageView: (path: string, title?: string) => {
    trackEvent('page_view', 'engagement', { path, title });
    // Also trigger custom pixel pageview
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  },
  trackSignUp: (userId: string, email: string, name?: string) => {
    trackEvent('sign_up', 'onboarding', { userId, email, name });
    trackEvent('lead_generation', 'onboarding', { userId, email, name });
  },
  trackLogin: (userId: string, email: string) => {
    trackEvent('login', 'auth', { userId, email });
  },
  trackPlanView: (planId: string, planName: string, price: number) => {
    trackEvent('view_item', 'ecommerce', { planId, planName, price }, price);
  },
  trackAddToCart: (planId: string, planName: string, price: number) => {
    trackEvent('add_to_cart', 'ecommerce', { planId, planName, price }, price);
  },
  trackCheckoutStarted: (planId: string, planName: string, price: number) => {
    trackEvent('begin_checkout', 'ecommerce', { planId, planName, price }, price);
  },
  trackPaymentSuccess: (userId: string, orderId: string, amount: number, planId: string, planName: string) => {
    trackEvent('payment_success', 'subscription_funnel', { userId, orderId, amount, planId, planName }, amount);
    trackEvent('purchase', 'ecommerce', { userId, orderId, amount, planId, planName }, amount);
  },
  trackPaymentStarted: (planId: string, planName: string, amount: number) => {
    trackEvent('payment_started', 'subscription_funnel', { planId, planName, amount }, amount);
  },
  trackPaymentFailed: (planId: string, reason?: string) => {
    trackEvent('payment_failed', 'subscription_funnel', { planId, reason });
  },
  trackSubscriptionView: () => {
    trackEvent('subscription_view', 'subscription_funnel', {});
  },
  trackPlanSelected: (planId: string, planName: string) => {
    trackEvent('plan_selected', 'subscription_funnel', { planId, planName });
  },
  trackSubscriptionActivated: (userId: string, subscriptionId: string, planName: string, amount: number) => {
    trackEvent('subscription_activated', 'subscription', { userId, subscriptionId, planName, amount }, amount);
  },
  trackReferralSuccess: (referrerId: string, referredId: string, pointsEarned: number) => {
    trackEvent('referral_success', 'growth', { referrerId, referredId, pointsEarned });
  }
};
