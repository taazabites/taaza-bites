import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string;
  noIndex?: boolean;
  ogType?: string;
  ogImage?: string;
  schemaType?: 'Organization' | 'FoodService' | 'MenuItem' | 'WebPage';
}

const SITE_NAME = 'TaazaBites';
const DEFAULT_DOMAIN = typeof window !== 'undefined' ? window.location.origin : 'https://taazabites.com';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1200';

const ROUTE_SEO_MAP: Record<string, SeoConfig> = {
  '/': {
    title: 'TaazaBites | Gourmet Daily Tiffins & Fresh Meal Subscriptions',
    description: 'Experience chef-crafted, fresh, healthy daily meal subscriptions delivered right to your doorstep. Tailored nutrition for Keto, High Protein, Weight Loss & Pure Veg diets.',
    keywords: 'meal subscription, daily tiffin service, fresh healthy food, keto meals, high protein diet, tiffin delivery, gourmet meal prep',
    ogType: 'website',
    schemaType: 'FoodService',
  },
  '/about': {
    title: 'Our Story & Culinary Philosophy | TaazaBites',
    description: 'Learn how TaazaBites combines organic farm-fresh ingredients, expert nutritionist oversight, and zero-preservative cooking to transform daily eating.',
    keywords: 'about taazabites, healthy meal story, organic daily tiffin, nutritionist meal prep, fresh ingredient kitchen',
    schemaType: 'Organization',
  },
  '/how-it-works': {
    title: 'How It Works - Seamless Daily Meal Subscriptions | TaazaBites',
    description: 'Select your diet goals, customize your weekly menu rotation, and enjoy hot, eco-friendly tiffin deliveries delivered right on schedule.',
    keywords: 'how meal subscription works, tiffin process, custom meal plan steps, daily food delivery instructions',
    schemaType: 'WebPage',
  },
  '/menu': {
    title: 'Weekly Menu & Daily Culinary Selections | TaazaBites',
    description: 'Explore our rotating weekly menu of macro-calculated, gourmet meals. Pure Veg, Non-Veg, Keto, and High Protein options crafted fresh daily.',
    keywords: 'weekly menu, daily tiffin menu, keto dishes, high protein meals, pure veg tiffin, healthy food menu',
    schemaType: 'MenuItem',
  },
  '/pricing': {
    title: 'Transparent Meal Subscription Plans & Pricing | TaazaBites',
    description: 'Flexible daily, weekly, and monthly meal plans starting at budget-friendly rates with zero lock-in contracts and free delivery.',
    keywords: 'meal plan cost, tiffin price list, cheap healthy meal subscription, monthly food delivery rates',
    schemaType: 'WebPage',
  },
  '/plans': {
    title: 'Personalized Nutrition & Goal-Based Meal Plans | TaazaBites',
    description: 'Find your perfect meal plan tailored to Weight Loss, Muscle Gain, Diabetes Management, Keto, or Balanced Daily Wellness.',
    keywords: 'weight loss meal plan, muscle building tiffin, keto subscription, diabetic friendly food delivery',
    schemaType: 'WebPage',
  },
  '/delivery-areas': {
    title: 'Delivery Coverage Areas & Pincode Checker | TaazaBites',
    description: 'Check if TaazaBites delivers fresh daily meals to your home or corporate office address in real-time.',
    keywords: 'meal delivery areas, tiffin pincode search, city coverage, delivery locations',
    schemaType: 'WebPage',
  },
  '/delivery-availability': {
    title: 'Check Food Delivery Availability in Your Pincode | TaazaBites',
    description: 'Verify instant delivery slot availability for breakfast, lunch, and dinner tiffins at your location.',
    keywords: 'pincode checker, delivery slot availability, instant tiffin lookup',
    schemaType: 'WebPage',
  },
  '/faq': {
    title: 'Frequently Asked Questions & Support | TaazaBites',
    description: 'Get clear answers regarding pause/cancel policies, food safety standards, packaging eco-materials, and payment options.',
    keywords: 'taazabites faq, subscription pause rules, tiffin delivery questions, food safety hygiene',
    schemaType: 'WebPage',
  },
  '/contact': {
    title: 'Contact Us & Nutrition Consultant Support | TaazaBites',
    description: 'Have questions? Connect with our customer support team or schedule a 1-on-1 diet session with our certified nutritionists.',
    keywords: 'contact taazabites, customer care, nutritionist helpline, support chat',
    schemaType: 'Organization',
  },
  '/corporate': {
    title: 'Corporate Meal Plans & Office Catering Solutions | TaazaBites',
    description: 'Fuel your team with healthy, macro-balanced daily employee meals, executive tiffins, and corporate event catering.',
    keywords: 'corporate meal delivery, office lunch subscription, team catering, healthy workplace meals',
    schemaType: 'Organization',
  },
  '/gift': {
    title: 'Gift a Healthy Meal Subscription | TaazaBites',
    description: 'Gift nutritious, chef-crafted daily meal subscriptions to loved ones, friends, or colleagues with custom gift cards.',
    keywords: 'gift meal plan, healthy food gift card, tiffin gift voucher, food subscription gift',
    schemaType: 'WebPage',
  },
  '/gifts': {
    title: 'Gift Healthy Meal Subscriptions | TaazaBites',
    description: 'Share wellness with friends and family using TaazaBites prepaid meal plan gift vouchers.',
    keywords: 'gift meal plan, healthy gift card, food subscription gift',
    schemaType: 'WebPage',
  },
  '/gift-plans': {
    title: 'Gift Healthy Meal Subscriptions | TaazaBites',
    description: 'Share wellness with friends and family using TaazaBites prepaid meal plan gift vouchers.',
    keywords: 'gift meal plan, healthy gift card, food subscription gift',
    schemaType: 'WebPage',
  },
  '/blog': {
    title: 'Wellness, Nutrition & Healthy Eating Blog | TaazaBites',
    description: 'Read expert nutrition advice, diet guides, macro breakdown tips, and healthy lifestyle articles from our certified dietitians.',
    keywords: 'nutrition blog, diet tips, keto guide, macro counting articles, healthy eating advice',
    schemaType: 'WebPage',
  },
  '/careers': {
    title: 'Join Our Team - Careers at TaazaBites',
    description: 'Explore job opportunities in culinary arts, logistics, software engineering, and nutrition at TaazaBites.',
    keywords: 'taazabites careers, kitchen jobs, culinary hiring, food tech engineering jobs',
    schemaType: 'Organization',
  },
  '/privacy': {
    title: 'Privacy Policy & Data Security | TaazaBites',
    description: 'Read how TaazaBites protects customer data, user accounts, location metrics, and payment details.',
    keywords: 'privacy policy, data security, user data protection',
    noIndex: true,
  },
  '/terms': {
    title: 'Terms & Conditions | TaazaBites',
    description: 'Review the service terms, subscription refund rules, and user agreement for TaazaBites.',
    keywords: 'terms and conditions, user agreement, refund policy',
    noIndex: true,
  },
  '/refund-policy': {
    title: 'Refund & Cancellation Policy | TaazaBites',
    description: 'Learn about our transparent 100% satisfaction guarantee, cancellation grace periods, and instant wallet refunds.',
    keywords: 'refund policy, cancellation rules, wallet refund',
    noIndex: true,
  },
  '/login': {
    title: 'Instant OTP Login & Access Account | TaazaBites',
    description: 'Log in securely with mobile OTP to manage your active meal subscriptions, pause deliveries, or view rewards.',
    keywords: 'login taazabites, account access, mobile otp login',
    noIndex: true,
  },
  '/login-otp': {
    title: 'Mobile OTP Verification | TaazaBites Ecosystem',
    description: 'Verify your phone number with instant secure 6-digit OTP code.',
    noIndex: true,
  },
  '/health-assessment': {
    title: 'AI Health Assessment & Calorie Calculator | TaazaBites',
    description: 'Calculate your exact daily Total Daily Energy Expenditure (TDEE), BMI, and macro targets using our AI health engine.',
    keywords: 'ai health assessment, tdee calculator, macro recommendation, bmi calculator',
    schemaType: 'WebPage',
  },
  '/order-review': {
    title: 'Order Review & Subscription Customization | TaazaBites',
    description: 'Review chosen dishes, customize portion sizes, add notes for the chef, and review pricing breakdown.',
    noIndex: true,
  },
  '/checkout': {
    title: 'Secure Checkout & Payment Gateway | TaazaBites',
    description: 'Complete your meal subscription order with 256-bit encryption via Razorpay, UPI, Cards, or Wallet.',
    noIndex: true,
  },
  '/payment': {
    title: 'Payment Authorization | TaazaBites',
    description: 'Securing transaction credentials and finalizing meal subscription.',
    noIndex: true,
  },
  '/payment-success': {
    title: 'Subscription Confirmed! | TaazaBites',
    description: 'Your meal plan subscription has been successfully activated. Get ready for fresh meals!',
    noIndex: true,
  },
  '/payment-issue': {
    title: 'Payment Status & Resolution | TaazaBites',
    description: 'Information regarding payment status and assistance options.',
    noIndex: true,
  },
  '/welcome-journey': {
    title: 'Welcome to TaazaBites! Onboarding Journey',
    description: 'Set your dietary preferences, delivery time windows, and favorite dishes.',
    noIndex: true,
  },
  '/dashboard': {
    title: 'My Dashboard & Nutrition Hub | TaazaBites',
    description: 'View today’s upcoming meals, track live delivery status, manage wallet balance, and log daily calories.',
    noIndex: true,
  },
  '/dashboard/todays-meals': {
    title: 'Today’s Meal Schedule & Calorie Tracking | TaazaBites',
    description: 'Track today’s chef special dishes, macro breakdown, and driver ETA.',
    noIndex: true,
  },
  '/meals': {
    title: 'My Daily Meals & Rotation | TaazaBites Dashboard',
    description: 'Manage your daily meal choices and upcoming tiffin calendar.',
    noIndex: true,
  },
  '/dashboard/calendar': {
    title: 'Subscription Calendar & Pause Manager | TaazaBites',
    description: 'Pause specific dates, substitute meals, or shift delivery locations on your interactive calendar.',
    noIndex: true,
  },
  '/dashboard/orders': {
    title: 'Order History & Invoices | TaazaBites',
    description: 'View past subscription receipts, download tax invoices, and re-order previous favorites.',
    noIndex: true,
  },
  '/orders': {
    title: 'My Orders & Subscription History | TaazaBites',
    description: 'View complete order log and delivery history.',
    noIndex: true,
  },
  '/dashboard/wallet': {
    title: 'My TaazaWallet & Cashback Rewards | TaazaBites',
    description: 'Manage digital wallet funds, apply promo coupons, and view referral earnings.',
    noIndex: true,
  },
  '/wallet': {
    title: 'TaazaWallet & Balance | TaazaBites',
    description: 'Manage wallet funds and voucher redemptions.',
    noIndex: true,
  },
  '/dashboard/refer': {
    title: 'Refer Friends & Earn ₹250 Credits | TaazaBites',
    description: 'Share your exclusive referral link with friends and earn ₹250 wallet credit for every signup.',
    noIndex: true,
  },
  '/refer': {
    title: 'Refer & Earn Rewards | TaazaBites',
    description: 'Earn subscription credits by referring your friends.',
    noIndex: true,
  },
  '/dashboard/rewards': {
    title: 'Loyalty Club & Milestone Badges | TaazaBites',
    description: 'Redeem TaazaPoints for free gourmet add-ons, plan upgrades, and partner discounts.',
    noIndex: true,
  },
  '/rewards': {
    title: 'Loyalty Rewards & Badges | TaazaBites',
    description: 'Track your loyalty tier and redeem earned points.',
    noIndex: true,
  },
  '/dashboard/community': {
    title: 'Health Community & Fitness Feeds | TaazaBites',
    description: 'Connect with fellow health enthusiasts, share meal reviews, and join wellness challenges.',
    noIndex: true,
  },
  '/community': {
    title: 'TaazaBites Community & Social Hub',
    description: 'Join fitness discussions and share your healthy eating journey.',
    noIndex: true,
  },
  '/dashboard/ai-coach': {
    title: 'AI Nutritionist & Fitness Assistant | TaazaBites',
    description: 'Ask instant dietary questions, get meal swap advice, and optimize macro distribution with AI.',
    noIndex: true,
  },
  '/ai-coach': {
    title: 'AI Coach & Nutrition Guidance | TaazaBites',
    description: 'AI-powered personal nutrition assistant.',
    noIndex: true,
  },
  '/dashboard/support': {
    title: 'Customer Help & Support Ticket Portal | TaazaBites',
    description: 'Get fast support for delivery delays, meal feedback, or subscription modifications.',
    noIndex: true,
  },
  '/support': {
    title: 'Help Desk & Customer Support | TaazaBites',
    description: 'Submit support tickets or chat with customer service.',
    noIndex: true,
  },
  '/dashboard/addresses': {
    title: 'Saved Delivery Addresses | TaazaBites',
    description: 'Manage home, office, and secondary delivery locations with GPS pins.',
    noIndex: true,
  },
  '/addresses': {
    title: 'Manage Addresses | TaazaBites',
    description: 'Update your active home and work delivery addresses.',
    noIndex: true,
  },
  '/dashboard/notifications': {
    title: 'Alerts & Delivery Notifications | TaazaBites',
    description: 'Stay updated on driver arrival, daily menu drops, and cashback alerts.',
    noIndex: true,
  },
  '/notifications': {
    title: 'My Notifications | TaazaBites',
    description: 'View real-time alerts and subscription updates.',
    noIndex: true,
  },
  '/dashboard/subscriptions': {
    title: 'Active Subscription Management | TaazaBites',
    description: 'Upgrade plan tiers, switch dietary categories, or change delivery time slots.',
    noIndex: true,
  },
  '/subscriptions': {
    title: 'My Subscriptions | TaazaBites',
    description: 'Manage active meal plans and renewals.',
    noIndex: true,
  },
  '/delivery-experience': {
    title: 'Live Driver GPS Tracking & Delivery | TaazaBites',
    description: 'Track your delivery partner on a live interactive map in real-time.',
    noIndex: true,
  },
  '/performance': {
    title: 'App Performance & Core Web Vitals Monitor | TaazaBites',
    description: 'System diagnostic metrics and real-time app speed monitoring.',
    noIndex: true,
  },
  '/operations': {
    title: 'Kitchen Operations & Logistics Cockpit | TaazaBites',
    description: 'Real-time dispatch controls, route optimization, and batch preparation monitors.',
    noIndex: true,
  },
  '/kitchen': {
    title: 'Chef Kitchen Station & Meal Assembly | TaazaBites',
    description: 'Display screen for chef prep, dietary flags, and packaging lines.',
    noIndex: true,
  },
  '/enterprise-admin': {
    title: 'Enterprise Management Console | TaazaBites Admin',
    description: 'Executive analytics, revenue reporting, inventory, and operational metrics.',
    noIndex: true,
  },
  '/ai-engine': {
    title: 'AI Recommendation Engine & Analytics | TaazaBites Admin',
    description: 'Machine learning model management for meal personalization.',
    noIndex: true,
  },
  '/progress': {
    title: 'My Weight & Calorie Progress | TaazaBites',
    description: 'Track weight history, weekly calorie deficit, and health goals over time.',
    noIndex: true,
  },
  '/feedback': {
    title: 'Meal Feedback & Chef Ratings | TaazaBites',
    description: 'Rate recent meals and provide taste notes directly to our culinary team.',
    noIndex: true,
  },
  '/profile': {
    title: 'My Account Settings & Preferences | TaazaBites',
    description: 'Update profile information, dietary restrictions, allergens, and password.',
    noIndex: true,
  },
  '/settings': {
    title: 'Account Settings & Dietary Preferences | TaazaBites',
    description: 'Configure notifications, security, and meal preferences.',
    noIndex: true,
  },
};

export interface ArticleSchemaData {
  headline: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  category?: string;
  readTime?: string;
  wordCount?: number;
  articleBody?: string;
}

export interface ProductSchemaData {
  name: string;
  description: string;
  sku: string;
  mpn?: string;
  price: number | string;
  currency?: string;
  image?: string;
  category?: string;
  ratingValue?: number | string;
  reviewCount?: number | string;
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
}

export interface DynamicSeoHelmetProps {
  articleData?: ArticleSchemaData;
  productData?: ProductSchemaData;
  customSchema?: Record<string, any>;
}

export function DynamicSeoHelmet({ articleData, productData, customSchema }: DynamicSeoHelmetProps = {}) {
  const location = useLocation();
  const currentPath = location.pathname;

  // Derive dynamic fallback configuration for unlisted dynamic routes
  let seoConfig: SeoConfig = ROUTE_SEO_MAP[currentPath] || {
    title: 'TaazaBites | Fresh Gourmet Daily Meal Subscriptions',
    description: 'Chef-crafted daily meal subscriptions delivered fresh. Personalized nutrition for Keto, High Protein, Weight Loss, and Balanced diets.',
    keywords: 'taazabites, meal delivery, daily tiffin, healthy food subscription',
  };

  // Dynamic route handling for parameter routes like /plans/:id or /meal-experience/:id
  if (!ROUTE_SEO_MAP[currentPath]) {
    if (currentPath.startsWith('/plans/')) {
      const planName = currentPath.split('/plans/')[1]?.replace(/[-_]/g, ' ') || 'Specialized Plan';
      const capitalizedPlan = planName.charAt(0).toUpperCase() + planName.slice(1);
      seoConfig = {
        title: `${capitalizedPlan} Subscription Details | TaazaBites`,
        description: `Explore macro ratios, ingredients, and weekly dish rotation for the ${capitalizedPlan} at TaazaBites.`,
        keywords: `${planName} meal plan, ${planName} diet, healthy food subscription`,
      };
    } else if (currentPath.startsWith('/meal-experience/')) {
      seoConfig = {
        title: 'Chef Special Meal Insights & Nutritional Breakdown | TaazaBites',
        description: 'Detailed ingredient provenance, macro distribution, and heating instructions for your meal.',
        noIndex: true,
      };
    } else if (currentPath.startsWith('/dashboard') || currentPath.startsWith('/hub')) {
      seoConfig = {
        title: 'My Account Dashboard | TaazaBites',
        description: 'Manage your active meal subscriptions, daily tiffin schedule, and rewards balance.',
        noIndex: true,
      };
    }
  }

  const canonicalUrl = `${DEFAULT_DOMAIN}${currentPath}`;
  const fullTitle = seoConfig.title.includes('TaazaBites') ? seoConfig.title : `${seoConfig.title} | ${SITE_NAME}`;
  const metaDescription = seoConfig.description;
  const keywordsStr = seoConfig.keywords || 'meal subscription, daily tiffin service, fresh healthy food, gourmet meals';
  const ogType = seoConfig.ogType || (articleData ? 'article' : productData ? 'product' : 'website');
  const ogImage = articleData?.image || productData?.image || seoConfig.ogImage || DEFAULT_IMAGE;

  // Static reference data for rich blog Article markup
  const BLOG_ARTICLES = [
    {
      headline: "Understanding the Glycemic Index for Longevity",
      description: "How managing your insulin spikes today can add years to your life tomorrow.",
      author: "Dr. Ananya Sharma",
      datePublished: "2026-07-20T08:00:00+05:30",
      dateModified: "2026-07-21T10:00:00+05:30",
      category: "Science",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fm=webp&fit=crop&q=80&w=800",
      readTime: "8 min",
      wordCount: 1450
    },
    {
      headline: "5 Hidden Ingredients Wrecking Your Focus",
      description: "Refined oils and hidden sugars are the silent killers of cognitive performance.",
      author: "Vikram Mehta",
      datePublished: "2026-07-15T09:30:00+05:30",
      dateModified: "2026-07-16T11:00:00+05:30",
      category: "Nutrition",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fm=webp&fit=crop&q=80&w=800",
      readTime: "5 min",
      wordCount: 980
    },
    {
      headline: "Morning Routines of High-Performing Leaders",
      description: "Why what you eat before 9 AM defines your entire day's output.",
      author: "Rohan Das",
      datePublished: "2026-07-12T07:15:00+05:30",
      dateModified: "2026-07-13T09:00:00+05:30",
      category: "Lifestyle",
      image: "https://images.unsplash.com/photo-1494390248081-4e521a5940db?auto=format&fm=webp&fit=crop&q=80&w=800",
      readTime: "12 min",
      wordCount: 2100
    }
  ];

  // Static reference data for rich meal plan Product markup
  const MEAL_PLAN_PRODUCTS = [
    {
      name: "TaazaBites Weight Loss & Metabolic Reset Subscription",
      description: "Calorie-deficit, high-fiber, chef-crafted daily meals delivered fresh. Designed for steady fat loss and insulin sensitivity.",
      sku: "TB-PLAN-WEIGHTLOSS",
      mpn: "TB-WL-30D",
      price: "255.00",
      ratingValue: "4.9",
      reviewCount: "1420",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1200",
      calories: "450 kcal",
      protein: "35 grams",
      carbs: "40 grams",
      fat: "14 grams"
    },
    {
      name: "TaazaBites High Protein Muscle Gain Subscription",
      description: "45g+ protein per meal with complex carbs and healthy fats for athletic performance, muscle recovery, and stamina.",
      sku: "TB-PLAN-MUSCLE",
      mpn: "TB-HP-30D",
      price: "285.00",
      ratingValue: "4.95",
      reviewCount: "980",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1200",
      calories: "650 kcal",
      protein: "50 grams",
      carbs: "60 grams",
      fat: "18 grams"
    },
    {
      name: "TaazaBites Clean Keto & Low Carb Subscription",
      description: "Ultra-low carb (<20g net carbs/day) gourmet meals rich in healthy fats, cold-pressed oils, and organic greens.",
      sku: "TB-PLAN-KETO",
      mpn: "TB-KT-30D",
      price: "295.00",
      ratingValue: "4.88",
      reviewCount: "750",
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=1200",
      calories: "550 kcal",
      protein: "38 grams",
      carbs: "12 grams",
      fat: "38 grams"
    },
    {
      name: "TaazaBites PCOS & Hormonal Balance Subscription",
      description: "Low-GI, anti-inflammatory meals crafted with seed cycling principles, omega-3 fats, and organic whole grains.",
      sku: "TB-PLAN-PCOS",
      mpn: "TB-PC-30D",
      price: "270.00",
      ratingValue: "4.92",
      reviewCount: "630",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1200",
      calories: "480 kcal",
      protein: "32 grams",
      carbs: "45 grams",
      fat: "16 grams"
    },
    {
      name: "TaazaBites Diabetic Care & Low-GI Tiffin Subscription",
      description: "Doctor-approved low glycemic index meals with slow-digesting fibers to prevent blood sugar spikes.",
      sku: "TB-PLAN-DIABETIC",
      mpn: "TB-DB-30D",
      price: "260.00",
      ratingValue: "4.91",
      reviewCount: "810",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1200",
      calories: "460 kcal",
      protein: "30 grams",
      carbs: "42 grams",
      fat: "14 grams"
    }
  ];

  // Helper to format a single Article / BlogPosting JSON-LD
  const formatArticleSchema = (article: {
    headline: string;
    description: string;
    author: string;
    datePublished: string;
    dateModified?: string;
    category?: string;
    image?: string;
    wordCount?: number;
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.headline,
    description: article.description,
    image: [article.image || DEFAULT_IMAGE],
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    inLanguage: 'en-IN',
    articleSection: article.category || 'Nutrition',
    wordCount: article.wordCount || 1200,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl
    },
    author: {
      '@type': 'Person',
      name: article.author,
      jobTitle: 'Health & Nutrition Specialist'
    },
    publisher: {
      '@type': 'Organization',
      name: 'TaazaBites Health Kitchens',
      url: DEFAULT_DOMAIN,
      logo: {
        '@type': 'ImageObject',
        url: `${DEFAULT_DOMAIN}/og-image.svg`
      }
    }
  });

  // Helper to format a single Product JSON-LD for meal plans
  const formatProductSchema = (prod: {
    name: string;
    description: string;
    sku: string;
    mpn?: string;
    price: number | string;
    currency?: string;
    image?: string;
    ratingValue?: number | string;
    reviewCount?: number | string;
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: prod.name,
    description: prod.description,
    image: [prod.image || DEFAULT_IMAGE],
    sku: prod.sku,
    mpn: prod.mpn || prod.sku,
    category: 'Food & Beverage > Meal Subscriptions',
    brand: {
      '@type': 'Brand',
      name: 'TaazaBites'
    },
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      priceCurrency: prod.currency || 'INR',
      price: String(prod.price),
      priceValidUntil: '2027-12-31',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'TaazaBites'
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0.00',
          currency: prod.currency || 'INR'
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'IN'
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY'
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY'
          }
        }
      }
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: String(prod.ratingValue || '4.9'),
      reviewCount: String(prod.reviewCount || '1200'),
      bestRating: '5',
      worstRating: '1'
    },
    review: [
      {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5'
        },
        author: {
          '@type': 'Person',
          name: 'Priya Sharma'
        },
        datePublished: '2026-06-15',
        reviewBody: 'The daily delivery is hot and punctually delivered. High quality protein and zero post-meal sluggishness!'
      },
      {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5'
        },
        author: {
          '@type': 'Person',
          name: 'Rahul Varma'
        },
        datePublished: '2026-07-02',
        reviewBody: 'Great macro proportions and taste. Pausing deliveries on weekends is super seamless.'
      }
    ],
    nutrition: {
      '@type': 'NutritionInformation',
      calories: prod.calories || '450 kcal',
      proteinContent: prod.protein || '35 grams',
      carbohydrateContent: prod.carbs || '40 grams',
      fatContent: prod.fat || '14 grams'
    }
  });

  // Generate structured JSON-LD data for SEO richness
  const getStructuredSchema = () => {
    if (customSchema) {
      return customSchema;
    }

    if (articleData) {
      return formatArticleSchema(articleData);
    }

    if (productData) {
      return formatProductSchema(productData);
    }

    // Route-level auto-generation for Blog page
    if (currentPath === '/blog') {
      return {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Blog',
            name: 'TaazaBites Science & Nutrition Knowledge Hub',
            description: 'Deep dives into nutrition, metabolic biology, and lifestyle optimization.',
            url: canonicalUrl,
            publisher: {
              '@type': 'Organization',
              name: 'TaazaBites',
              logo: {
                '@type': 'ImageObject',
                url: `${DEFAULT_DOMAIN}/og-image.svg`
              }
            },
            blogPost: BLOG_ARTICLES.map(art => formatArticleSchema(art))
          },
          ...BLOG_ARTICLES.map(art => formatArticleSchema(art))
        ]
      };
    }

    // Route-level auto-generation for Plans / Pricing / Menu pages
    if (currentPath === '/plans' || currentPath === '/pricing' || currentPath === '/menu' || currentPath.startsWith('/plans/')) {
      return {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'ItemList',
            name: 'TaazaBites Gourmet Meal Subscriptions',
            description: 'Chef-crafted, macro-balanced daily meal plans tailored to health outcomes.',
            numberOfItems: MEAL_PLAN_PRODUCTS.length,
            itemListElement: MEAL_PLAN_PRODUCTS.map((prod, idx) => ({
              '@type': 'ListItem',
              position: idx + 1,
              item: formatProductSchema(prod)
            }))
          },
          ...MEAL_PLAN_PRODUCTS.map(prod => formatProductSchema(prod))
        ]
      };
    }

    if (seoConfig.schemaType === 'FoodService' || currentPath === '/') {
      return {
        '@context': 'https://schema.org',
        '@type': 'FoodService',
        name: 'TaazaBites',
        description: 'Gourmet daily tiffin and fresh meal subscription service.',
        url: DEFAULT_DOMAIN,
        logo: `${DEFAULT_DOMAIN}/og-image.svg`,
        image: ogImage,
        servesCuisine: ['Indian', 'Healthy', 'Keto', 'Continental', 'Diet Food'],
        priceRange: '₹₹',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'IN',
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Meal Subscription Plans',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Weight Loss Plan',
                description: 'Calorie-deficit chef meals designed for steady fat loss.'
              }
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'High Protein Muscle Plan',
                description: '45g+ protein per meal for active fitness lifestyles.'
              }
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Keto Clean Plan',
                description: 'Ultra-low carb gourmet meals crafted with healthy fats.'
              }
            }
          ]
        }
      };
    }

    if (seoConfig.schemaType === 'Organization' || currentPath === '/about') {
      return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'TaazaBites',
        url: DEFAULT_DOMAIN,
        logo: `${DEFAULT_DOMAIN}/og-image.svg`,
        sameAs: [
          'https://instagram.com/taazabites',
          'https://facebook.com/taazabites',
          'https://twitter.com/taazabites'
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+91-1800-TAAZA-BITES',
          contactType: 'customer service',
          availableLanguage: ['English', 'Hindi']
        }
      };
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'TaazaBites',
      url: DEFAULT_DOMAIN,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${DEFAULT_DOMAIN}/menu?search={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };
  };

  return (
    <Helmet>
      {/* Primary HTML Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywordsStr && <meta name="keywords" content={keywordsStr} />}
      <meta name="author" content="TaazaBites Health Kitchens" />

      {/* Robots Indexing Directive */}
      {seoConfig.noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Canonical Link */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook Meta Tags */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* Mobile & App Experience Meta */}
      <meta name="theme-color" content="#059669" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-title" content="TaazaBites" />

      {/* Structured JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify(getStructuredSchema())}
      </script>
    </Helmet>
  );
}
