import React, {
  useState,
  useEffect,
  useCallback,
  lazy,
  Suspense,
  useLayoutEffect,
  useRef,
  Component,
} from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import AnimateOnView from "./components/AnimateOnView";
import { Favicon } from "./components/Favicon";
import RenderOnView from "./components/RenderOnView";
import { ScrollProgress } from "./components/ScrollProgress";
import { AuthProvider } from "./context/AuthContext";
const AuthModal = lazy(() => import("./components/AuthModal").then(m => ({ default: m.AuthModal })));
const LocalCoverageHub = lazy(() => import("./components/LocalCoverageHub").then(m => ({ default: m.LocalCoverageHub })));
const ScientificExpertiseSection = lazy(() => import("./components/ScientificExpertiseSection").then(m => ({ default: m.ScientificExpertiseSection })));
const TrustBadges = lazy(() => import("./components/TrustBadges").then(m => ({ default: m.TrustBadges })));
const WhyUs = lazy(() => import("./components/WhyUs").then(m => ({ default: m.WhyUs })));
const QualityMetrics = lazy(() => import("./components/WhyUs").then(m => ({ default: m.QualityMetrics })));
const LandingInteractiveShowcase = lazy(() => import("./components/LandingInteractiveShowcase").then(m => ({ default: m.LandingInteractiveShowcase })));
import { MobileBottomNav } from "./components/MobileBottomNav";
import { WhatsAppIcon, WHATSAPP_CONSULTATION_HREF } from "./components/WhatsAppSupportDrawer";
import { LogisticsDrawer } from "./components/LogisticsDrawer";
import { SEO } from "./components/SEO";
import { Breadcrumbs } from "./components/Breadcrumbs";
import { PackageOpen, Sparkles } from "lucide-react";

import { AppLoader } from "./components/AppLoader";
import { AnimatePresence } from "motion/react";

import { ToastProvider } from "./components/Toast";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;
  public props: ErrorBoundaryProps;
  private errorRef: React.RefObject<HTMLDivElement>;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
    this.props = props;
    this.errorRef = React.createRef();
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    setTimeout(() => {
      if (this.errorRef.current) {
        this.errorRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          ref={this.errorRef}
          className="min-h-[200px] flex flex-col items-center justify-center p-8 text-center bg-red-50/50 rounded-2xl border border-red-200 m-4 shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-[pulse_3s_ease-in-out_infinite]"
        >
          <div>
            <h3 className="text-lg font-serif mb-2 text-red-800">
              Something went wrong
            </h3>
            <p className="text-sm text-red-600/80 mb-4">
              We couldn't load this section. Please try refreshing.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 transition-colors text-white rounded-full text-xs font-bold uppercase tracking-widest"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import { getSchemasForPath } from "./components/schemaData";
import {
  BlogSkeleton,
  BlogPostSkeleton,
  PolicySkeleton,
  DashboardSkeleton,
  FormSkeleton,
  ArticleSkeleton,
  FooterSkeleton,
  GenericSectionSkeleton,
  MenuSkeleton,
} from "./components/Skeletons";

const prefetchRegistry: { [key: string]: () => Promise<any> } = {};

const lazyWithRetry = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  pathKey?: string
) => {
  const lazyComponent = lazy(() =>
    importFn().catch((error) => {
      console.error("Dynamic import failed, retrying in 1s...", error);
      return new Promise<{ default: T }>((resolve, reject) => {
        setTimeout(() => {
          importFn()
            .then(resolve)
            .catch((err) => {
              console.error("Dynamic import retry failed, reloading page...", err);
              window.location.reload();
              reject(err);
            });
        }, 1000);
      });
    })
  );

  if (pathKey) {
    prefetchRegistry[pathKey] = importFn;
  }

  return lazyComponent;
};

if (typeof window !== "undefined") {
  (window as any).prefetchComponent = (path: string) => {
    const importer = prefetchRegistry[path];
    if (importer) {
      importer().catch(() => {});
    }
  };
}

const About = lazyWithRetry(() =>
  import("./components/About").then((m) => ({ default: m.About })),
  "/about"
);
const Menu = lazyWithRetry(() =>
  import("./components/Menu").then((m) => ({ default: m.Menu })),
  "/menu"
);
const Subscriptions = lazyWithRetry(() =>
  import("./components/Subscriptions").then((m) => ({
    default: m.Subscriptions,
  })),
  "/subscriptions-engine"
);
const SubscriptionsBrowsePage = lazyWithRetry(() =>
  import("./components/SubscriptionsBrowsePage").then((m) => ({
    default: m.SubscriptionsBrowsePage,
  })),
  "/subscriptions"
);
const ProductsPage = lazyWithRetry(() =>
  import("./components/ProductsPage").then((m) => ({
    default: m.ProductsPage,
  })),
  "/products"
);
const OrderNowPage = lazyWithRetry(() =>
  import("./components/OrderNowPage").then((m) => ({
    default: m.OrderNowPage,
  })),
  "/order"
);
const CorporateBooking = lazyWithRetry(() =>
  import("./components/CorporateBooking").then((m) => ({
    default: m.CorporateBooking,
  })),
  "/corporate-booking"
);
const Testimonials = lazyWithRetry(() =>
  import("./components/Testimonials").then((m) => ({
    default: m.Testimonials,
  })),
  "/testimonials"
);
const CtaSection = lazyWithRetry(() =>
  import("./components/CtaSection").then((m) => ({ default: m.CtaSection })),
  "/cta-section"
);
const DeliveryCoverage = lazyWithRetry(() =>
  import("./components/DeliveryCoverage").then((m) => ({
    default: m.DeliveryCoverage,
  })),
  "/delivery-coverage"
);
const Faq = lazyWithRetry(() =>
  import("./components/Faq").then((m) => ({ default: m.Faq })),
  "/faq"
);
const Footer = lazyWithRetry(() =>
  import("./components/Footer").then((m) => ({ default: m.Footer })),
  "/footer"
);
const ShippingPolicy = lazyWithRetry(() =>
  import("./components/ShippingPolicy").then((m) => ({
    default: m.ShippingPolicy,
  })),
  "/shipping"
);
const ReturnRefundPolicy = lazyWithRetry(() =>
  import("./components/ReturnRefundPolicy").then((m) => ({
    default: m.ReturnRefundPolicy,
  })),
  "/refund"
);
const ContactPage = lazyWithRetry(() =>
  import("./components/ContactPage").then((m) => ({ default: m.ContactPage })),
  "/contact"
);
const CareersPage = lazyWithRetry(() =>
  import("./components/CareersPage").then((m) => ({ default: m.CareersPage })),
  "/careers"
);
const SeoMealPlanPage = lazyWithRetry(() =>
  import("./components/SeoMealPlanPage").then((m) => ({ default: m.SeoMealPlanPage })),
  "/seo-meal-plan"
);
const DebugPage = lazyWithRetry(() =>
  import("./components/DebugPage").then((m) => ({ default: m.DebugPage })),
  "/debug"
);
const UserDashboard = lazyWithRetry(() =>
  import("./components/UserDashboard").then((m) => ({
    default: m.UserDashboard,
  })),
  "/dashboard"
);
const NutritionalInsights = lazyWithRetry(() =>
  import("./components/NutritionalInsights").then((m) => ({
    default: m.NutritionalInsights,
  })),
  "/insights"
);
const PrivacyPolicy = lazyWithRetry(() =>
  import("./components/PrivacyPolicy").then((m) => ({
    default: m.PrivacyPolicy,
  })),
  "/privacy"
);
const TermsOfUse = lazyWithRetry(() =>
  import("./components/TermsOfUse").then((m) => ({ default: m.TermsOfUse })),
  "/terms"
);
const HealthAssessmentForm = lazyWithRetry(() =>
  import("./components/HealthAssessmentForm").then((m) => ({
    default: m.HealthAssessmentForm,
  })),
  "/health-assessment"
);
const Blog = lazyWithRetry(() =>
  import("./components/Blog").then((m) => ({ default: m.Blog })),
  "/blog"
);
const BlogPost = lazyWithRetry(() =>
  import("./components/BlogPost").then((m) => ({ default: m.BlogPost })),
  "/blog-post"
);
const Commutes = lazyWithRetry(() =>
  import("./components/Commutes").then((m) => ({ default: m.Commutes })),
  "/commutes"
);
const NutritionApproach = lazyWithRetry(() =>
  import("./components/NutritionApproach").then((m) => ({
    default: m.NutritionApproach,
  })),
  "/nutrition-approach"
);
const MacroCalculator = lazyWithRetry(() =>
  import("./components/MacroCalculator").then((m) => ({
    default: m.MacroCalculator,
  })),
  "/macro-calculator"
);
const SeoStrategyHub = lazyWithRetry(() =>
  import("./components/SeoStrategyHub").then((m) => ({
    default: m.SeoStrategyHub,
  })),
  "/seo-strategy"
);
const NotFound = lazyWithRetry(() =>
  import("./components/NotFound").then((m) => ({
    default: m.NotFound,
  })),
  "/not-found"
);

import { seoConfig, PageMetadata } from "./seoConfig";

const pathToSectionIdMap: { [key: string]: string } = {
  "/": "hero",
  "/home": "hero",
  "/weight-loss-meal-plan-bangalore": "subscriptions",
  "/high-protein-meals-bangalore": "subscriptions",
  "/pcos-meal-plan-bangalore": "subscriptions",
  "/healthy-food-subscription-bangalore": "subscriptions",
  "/menu": "menu",
  "/about": "about",

  "/why-us": "why-us",
  "/quality": "quality",
  "/testimonials": "testimonials",
  "/faq": "faq",
  "/shipping": "shipping",
  "/refund": "refund",
  "/contact": "contact",
  "/dashboard": "dashboard",
  "/insights": "insights",
  "/privacy": "privacy",
  "/terms": "terms",
  "/health-assessment": "health-assessment",
  "/blog": "blog",
  "/nutrition-approach": "insights",
  "/macro-calculator": "insights",
  "/meal-delivery-hsr-layout": "subscriptions",
  "/meal-delivery-koramangala": "subscriptions",
  "/meal-delivery-whitefield": "subscriptions",
  "/meal-delivery-indiranagar": "subscriptions",
  "/meal-delivery-sarjapur-road": "subscriptions",
  "/meal-delivery-kasavanahalli": "subscriptions",
  "/meal-delivery-haralur": "subscriptions",
  "/meal-delivery-bellandur": "subscriptions",
  "/meal-delivery-marathahalli": "subscriptions",
  "/meal-delivery-electronic-city": "subscriptions",
  "/meal-delivery-jp-nagar": "subscriptions",
  "/meal-delivery-jayanagar": "subscriptions",
  "/meal-delivery-btm-layout": "subscriptions",
  "/meal-delivery-hebbal": "subscriptions",
  "/meal-delivery-yelahanka": "subscriptions",
  "/meal-delivery-mahadevapura": "subscriptions",
  "/protein-meals-bellandur": "subscriptions",
  "/keto-meals-sarjapur-road": "subscriptions",
  "/healthy-food-subscription-indiranagar": "subscriptions",
  "/weight-loss-meals-koramangala": "subscriptions",
};

const STANDALONE_PATHS = [
  "/subscriptions",
  "/products",
  "/order",
  "/corporate-booking",
  "/blog",
  "/shipping",
  "/refund",
  "/dashboard",
  "/privacy",
  "/terms",
  "/health-assessment",
  "/commutes",
  "/careers",
  "/weight-loss-meal-plan-bangalore",
  "/high-protein-meals-bangalore",
  "/pcos-meal-plan-bangalore",
  "/healthy-food-subscription-bangalore",
  "/protein-meals-bellandur",
  "/keto-meals-sarjapur-road",
  "/healthy-food-subscription-indiranagar",
  "/weight-loss-meals-koramangala",
  "/debug",
  "/nutrition-approach",
  "/macro-calculator",
  "/meal-delivery-hsr-layout",
  "/meal-delivery-koramangala",
  "/meal-delivery-whitefield",
  "/meal-delivery-indiranagar",
  "/meal-delivery-sarjapur-road",
  "/meal-delivery-kasavanahalli",
  "/meal-delivery-haralur",
  "/meal-delivery-bellandur",
  "/meal-delivery-marathahalli",
  "/meal-delivery-electronic-city",
  "/meal-delivery-jp-nagar",
  "/meal-delivery-jayanagar",
  "/meal-delivery-btm-layout",
  "/meal-delivery-hebbal",
  "/meal-delivery-yelahanka",
  "/meal-delivery-mahadevapura",
  "/contact",
  "/seo-strategy",
];

const isStandalonePath = (path: string) => {
  if (STANDALONE_PATHS.includes(path)) return true;
  if (path.startsWith("/blog/")) return true;
  return false;
};

const LazyContent: React.FC<{
  onNavigate: (p: string) => void;
  activeHash?: string;
  currentPath?: string;
}> = ({ onNavigate, activeHash, currentPath }) => {
  const isTargeted = useCallback(
    (id: string) =>
      activeHash === `#${id}` ||
      (currentPath && pathToSectionIdMap[currentPath] === id),
    [activeHash, currentPath],
  );

  const isValidPath = currentPath === "/" ||
                      pathToSectionIdMap[currentPath || ""] !== undefined ||
                      STANDALONE_PATHS.includes(currentPath || "") ||
                      currentPath === "/seo-strategy" ||
                      currentPath?.startsWith("/blog/");

  if (!isValidPath) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <NotFound onNavigate={onNavigate} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (currentPath === "/subscriptions")
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <SubscriptionsBrowsePage onNavigate={onNavigate} />
        </Suspense>
      </ErrorBoundary>
    );

  if (currentPath === "/products")
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <ProductsPage onNavigate={onNavigate} />
        </Suspense>
      </ErrorBoundary>
    );

  if (currentPath === "/order")
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <OrderNowPage onNavigate={onNavigate} />
        </Suspense>
      </ErrorBoundary>
    );

  if (currentPath === "/corporate-booking")
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <CorporateBooking />
        </Suspense>
      </ErrorBoundary>
    );

  if (currentPath === "/blog")
    return (
      <ErrorBoundary>
        <Suspense fallback={<BlogSkeleton />}>
          <Blog onNavigate={onNavigate} />
        </Suspense>
      </ErrorBoundary>
    );
  if (currentPath?.startsWith("/blog/"))
    return (
      <ErrorBoundary>
        <Suspense fallback={<BlogPostSkeleton />}>
          <BlogPost
            postId={currentPath.split("/")[2]}
            onNavigate={onNavigate}
          />
        </Suspense>
      </ErrorBoundary>
    );
  if (currentPath === "/shipping")
    return (
      <ErrorBoundary>
        <Suspense fallback={<PolicySkeleton />}>
          <ShippingPolicy />
        </Suspense>
      </ErrorBoundary>
    );
  if (currentPath === "/refund")
    return (
      <ErrorBoundary>
        <Suspense fallback={<PolicySkeleton />}>
          <ReturnRefundPolicy />
        </Suspense>
      </ErrorBoundary>
    );
  if (currentPath === "/dashboard")
    return (
      <ErrorBoundary>
        <Suspense fallback={<DashboardSkeleton />}>
          <UserDashboard />
        </Suspense>
      </ErrorBoundary>
    );
  if (currentPath === "/privacy")
    return (
      <ErrorBoundary>
        <Suspense fallback={<PolicySkeleton />}>
          <PrivacyPolicy />
        </Suspense>
      </ErrorBoundary>
    );
  if (currentPath === "/terms")
    return (
      <ErrorBoundary>
        <Suspense fallback={<PolicySkeleton />}>
          <TermsOfUse />
        </Suspense>
      </ErrorBoundary>
    );
  if (currentPath === "/health-assessment")
    return (
      <ErrorBoundary>
        <Suspense fallback={<FormSkeleton />}>
          <HealthAssessmentForm />
        </Suspense>
      </ErrorBoundary>
    );
  if (currentPath === "/commutes")
    return (
      <ErrorBoundary>
        <Suspense fallback={<ArticleSkeleton />}>
          <Commutes />
        </Suspense>
      </ErrorBoundary>
    );
  if (currentPath === "/careers")
    return (
      <ErrorBoundary>
        <Suspense fallback={<ArticleSkeleton />}>
          <CareersPage />
        </Suspense>
      </ErrorBoundary>
    );
  if (currentPath === "/contact")
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <ContactPage />
        </Suspense>
      </ErrorBoundary>
    );
  if (currentPath === "/weight-loss-meal-plan-bangalore")
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <SeoMealPlanPage
            title={<>Best Weight Loss Meal Plan <span className="text-[#059669] italic">in Bangalore</span></>}
            description="Our scientifically-backed weight loss meal delivery focuses on caloric deficit without compromising vital macro and micro-nutrients. Freshly crafted in Bengaluru."
            keyword="weight loss meal plan"
            onNavigate={onNavigate}
          />
        </Suspense>
      </ErrorBoundary>
    );
  if (currentPath === "/high-protein-meals-bangalore")
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <SeoMealPlanPage
            title={<>High Protein Meals Delivered <span className="text-[#059669] italic">in Bangalore</span></>}
            description="Achieve your hypertrophy goals with high-protein, perfectly portioned meals crafted for athletes and active professionals in Bengaluru."
            keyword="high protein meals"
            onNavigate={onNavigate}
          />
        </Suspense>
      </ErrorBoundary>
    );
  if (currentPath === "/pcos-meal-plan-bangalore")
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <SeoMealPlanPage
            title={<>PCOS Supportive Meal Plan <span className="text-[#059669] italic">in Bangalore</span></>}
            description="Manage hormones and reduce insulin resistance with our specialized PCOS meal subscriptions. Low-GI, anti-inflammatory, and delicious."
            keyword="pcos meal plan"
            onNavigate={onNavigate}
          />
        </Suspense>
      </ErrorBoundary>
    );
  if (currentPath === "/healthy-food-subscription-bangalore")
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <SeoMealPlanPage
            title={<>The Ultimate Healthy Food Subscription <span className="text-[#059669] italic">in Bangalore</span></>}
            description="Your daily nutrition sorted. Subscribe to Bengaluru's top macro-calculated, fresh-cooked healthy food delivery."
            keyword="healthy food subscription"
            onNavigate={onNavigate}
          />
        </Suspense>
      </ErrorBoundary>
    );
  if (currentPath === "/protein-meals-bellandur")
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <SeoMealPlanPage
            title={<>High Protein Meal Delivery <span className="text-[#059669] italic">in Bellandur</span></>}
            description="Achieve your fitness goals with Bangalore's top-rated high-protein, calorie-counted meal subscriptions in Bellandur tech hubs."
            keyword="protein meals bellandur"
            localityKey="bellandur"
            onNavigate={onNavigate}
          />
        </Suspense>
      </ErrorBoundary>
    );
  if (currentPath === "/keto-meals-sarjapur-road")
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <SeoMealPlanPage
            title={<>Premium Keto Meal Delivery <span className="text-[#059669] italic">on Sarjapur Road</span></>}
            description="Scientifically balanced low-carb and ketogenic meal plans delivered fresh across Sarjapur and Kasavanahalli."
            keyword="keto meals sarjapur road"
            localityKey="sarjapur"
            onNavigate={onNavigate}
          />
        </Suspense>
      </ErrorBoundary>
    );
  if (currentPath === "/healthy-food-subscription-indiranagar")
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <SeoMealPlanPage
            title={<>Healthy Food Subscription <span className="text-[#059669] italic">in Indiranagar</span></>}
            description="Enjoy clean eating with premium macro-calculated Indian diet subscriptions delivered fresh daily to your Indiranagar home or office."
            keyword="healthy food subscription indiranagar"
            localityKey="indiranagar"
            onNavigate={onNavigate}
          />
        </Suspense>
      </ErrorBoundary>
    );
  if (currentPath === "/weight-loss-meals-koramangala")
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <SeoMealPlanPage
            title={<>Weight Loss Meal Plan <span className="text-[#059669] italic">in Koramangala</span></>}
            description="Lose fat effectively with calorie-deficit, chef-crafted healthy meal subscriptions delivered fresh daily in Koramangala."
            keyword="weight loss meals koramangala"
            localityKey="koramangala"
            onNavigate={onNavigate}
          />
        </Suspense>
      </ErrorBoundary>
    );
  if (currentPath === "/meal-delivery-hsr-layout")
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <SeoMealPlanPage
            title={<>Premium Healthy Meal Delivery <span className="text-[#059669] italic">in HSR Layout</span></>}
            description="Freshly prepared, preservative-free, and macro-calculated diet meals delivered daily to your doorstep in HSR Layout, Bengaluru."
            keyword="meal delivery hsr layout"
            localityKey="hsr"
            onNavigate={onNavigate}
          />
        </Suspense>
      </ErrorBoundary>
    );
  if (currentPath === "/meal-delivery-koramangala")
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <SeoMealPlanPage
            title={<>Premium Healthy Meal Delivery <span className="text-[#059669] italic">in Koramangala</span></>}
            description="Support your fitness goals with Bangalore's finest calorie-counted, high-protein meal delivery in Koramangala."
            keyword="meal delivery koramangala"
            localityKey="koramangala"
            onNavigate={onNavigate}
          />
        </Suspense>
      </ErrorBoundary>
    );
  if (currentPath === "/meal-delivery-whitefield")
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <SeoMealPlanPage
            title={<>Premium Healthy Meal Delivery <span className="text-[#059669] italic">in Whitefield</span></>}
            description="Dietician-approved weight loss, high-protein, and keto meals delivered to homes and offices in Whitefield, Bangalore."
            keyword="meal delivery whitefield"
            localityKey="whitefield"
            onNavigate={onNavigate}
          />
        </Suspense>
      </ErrorBoundary>
    );
  if (currentPath === "/meal-delivery-indiranagar")
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <SeoMealPlanPage
            title={<>Premium Healthy Meal Delivery <span className="text-[#059669] italic">in Indiranagar</span></>}
            description="Clean, nutrient-dense, and highly customizable diet subscriptions delivered hyper-fresh daily in Indiranagar, Bengaluru."
            keyword="meal delivery indiranagar"
            localityKey="indiranagar"
            onNavigate={onNavigate}
          />
        </Suspense>
      </ErrorBoundary>
    );
  if (currentPath === "/meal-delivery-sarjapur-road")
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <SeoMealPlanPage
            title={<>Premium Healthy Meal Delivery <span className="text-[#059669] italic">on Sarjapur Road</span></>}
            description="Fresh, delicious macro-precise diet plans delivered across Sarjapur Road, Haralur Road, and Kasavanahalli."
            keyword="meal delivery sarjapur road"
            localityKey="sarjapur"
            onNavigate={onNavigate}
          />
        </Suspense>
      </ErrorBoundary>
    );
  if (currentPath === "/meal-delivery-kasavanahalli")
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <SeoMealPlanPage
            title={<>Premium Healthy Meal Delivery <span className="text-[#059669] italic">in Kasavanahalli</span></>}
            description="Clean, nutrient-dense, and highly customizable diet subscriptions delivered hyper-fresh daily in Kasavanahalli, Bengaluru."
            keyword="meal delivery kasavanahalli"
            localityKey="kasavanahalli"
            onNavigate={onNavigate}
          />
        </Suspense>
      </ErrorBoundary>
    );

  if (currentPath === "/meal-delivery-haralur")
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <SeoMealPlanPage
            title={<>Premium Healthy Meal Delivery <span className="text-[#059669] italic">in Haralur</span></>}
            description="Clean, nutrient-dense, and highly customizable diet subscriptions delivered hyper-fresh daily in Haralur, Bengaluru."
            keyword="meal delivery haralur"
            localityKey="haralur"
            onNavigate={onNavigate}
          />
        </Suspense>
      </ErrorBoundary>
    );

  if (currentPath === "/meal-delivery-bellandur")
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <SeoMealPlanPage
            title={<>Premium Healthy Meal Delivery <span className="text-[#059669] italic">in Bellandur</span></>}
            description="Clean, nutrient-dense, and highly customizable diet subscriptions delivered hyper-fresh daily in Bellandur, Bengaluru."
            keyword="meal delivery bellandur"
            localityKey="bellandur"
            onNavigate={onNavigate}
          />
        </Suspense>
      </ErrorBoundary>
    );

  if (currentPath === "/meal-delivery-marathahalli")
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <SeoMealPlanPage
            title={<>Premium Healthy Meal Delivery <span className="text-[#059669] italic">in Marathahalli</span></>}
            description="Clean, nutrient-dense, and highly customizable diet subscriptions delivered hyper-fresh daily in Marathahalli, Bengaluru."
            keyword="meal delivery marathahalli"
            localityKey="marathahalli"
            onNavigate={onNavigate}
          />
        </Suspense>
      </ErrorBoundary>
    );

  if (currentPath === "/meal-delivery-electronic-city")
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <SeoMealPlanPage
            title={<>Premium Healthy Meal Delivery <span className="text-[#059669] italic">in Electronic City</span></>}
            description="Clean, nutrient-dense, and highly customizable diet subscriptions delivered hyper-fresh daily in Electronic City, Bengaluru."
            keyword="meal delivery electronic city"
            localityKey="electronic-city"
            onNavigate={onNavigate}
          />
        </Suspense>
      </ErrorBoundary>
    );

  if (currentPath === "/meal-delivery-jp-nagar")
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <SeoMealPlanPage
            title={<>Premium Healthy Meal Delivery <span className="text-[#059669] italic">in JP Nagar</span></>}
            description="Clean, nutrient-dense, and highly customizable diet subscriptions delivered hyper-fresh daily in JP Nagar, Bengaluru."
            keyword="meal delivery jp nagar"
            localityKey="jp-nagar"
            onNavigate={onNavigate}
          />
        </Suspense>
      </ErrorBoundary>
    );

  if (currentPath === "/meal-delivery-jayanagar")
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <SeoMealPlanPage
            title={<>Premium Healthy Meal Delivery <span className="text-[#059669] italic">in Jayanagar</span></>}
            description="Clean, nutrient-dense, and highly customizable diet subscriptions delivered hyper-fresh daily in Jayanagar, Bengaluru."
            keyword="meal delivery jayanagar"
            localityKey="jayanagar"
            onNavigate={onNavigate}
          />
        </Suspense>
      </ErrorBoundary>
    );

  if (currentPath === "/meal-delivery-btm-layout")
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <SeoMealPlanPage
            title={<>Premium Healthy Meal Delivery <span className="text-[#059669] italic">in BTM Layout</span></>}
            description="Clean, nutrient-dense, and highly customizable diet subscriptions delivered hyper-fresh daily in BTM Layout, Bengaluru."
            keyword="meal delivery btm layout"
            localityKey="btm-layout"
            onNavigate={onNavigate}
          />
        </Suspense>
      </ErrorBoundary>
    );

  if (currentPath === "/meal-delivery-hebbal")
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <SeoMealPlanPage
            title={<>Premium Healthy Meal Delivery <span className="text-[#059669] italic">in Hebbal</span></>}
            description="Clean, nutrient-dense, and highly customizable diet subscriptions delivered hyper-fresh daily in Hebbal, Bengaluru."
            keyword="meal delivery hebbal"
            localityKey="hebbal"
            onNavigate={onNavigate}
          />
        </Suspense>
      </ErrorBoundary>
    );

  if (currentPath === "/meal-delivery-yelahanka")
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <SeoMealPlanPage
            title={<>Premium Healthy Meal Delivery <span className="text-[#059669] italic">in Yelahanka</span></>}
            description="Clean, nutrient-dense, and highly customizable diet subscriptions delivered hyper-fresh daily in Yelahanka, Bengaluru."
            keyword="meal delivery yelahanka"
            localityKey="yelahanka"
            onNavigate={onNavigate}
          />
        </Suspense>
      </ErrorBoundary>
    );

  if (currentPath === "/meal-delivery-mahadevapura")
    return (
      <ErrorBoundary>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <SeoMealPlanPage
            title={<>Premium Healthy Meal Delivery <span className="text-[#059669] italic">in Mahadevapura</span></>}
            description="Clean, nutrient-dense, and highly customizable diet subscriptions delivered hyper-fresh daily in Mahadevapura, Bengaluru."
            keyword="meal delivery mahadevapura"
            localityKey="mahadevapura"
            onNavigate={onNavigate}
          />
        </Suspense>
      </ErrorBoundary>
    );

  if (currentPath === "/debug")
    return (
      <ErrorBoundary>
        <Suspense fallback={<ArticleSkeleton />}>
          <DebugPage />
        </Suspense>
      </ErrorBoundary>
    );
  if (currentPath === "/nutrition-approach")
    return (
      <ErrorBoundary>
        <Suspense fallback={<ArticleSkeleton />}>
          <NutritionApproach />
        </Suspense>
      </ErrorBoundary>
    );
  if (currentPath === "/macro-calculator")
    return (
      <ErrorBoundary>
        <Suspense fallback={<ArticleSkeleton />}>
          <MacroCalculator />
        </Suspense>
      </ErrorBoundary>
    );
  if (currentPath === "/seo-strategy")
    return (
      <ErrorBoundary>
        <Suspense fallback={<ArticleSkeleton />}>
          <SeoStrategyHub />
        </Suspense>
      </ErrorBoundary>
    );

  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      <AnimateOnView>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <TrustBadges />
        </Suspense>
      </AnimateOnView>
      <AnimateOnView>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <WhyUs />
        </Suspense>
      </AnimateOnView>

      <ErrorBoundary>
        <RenderOnView
          id="insights"
          forceRender={isTargeted("insights")}
          placeholderHeight="600px"
          fallback={<GenericSectionSkeleton />}
        >
          <AnimateOnView>
            <NutritionalInsights />
          </AnimateOnView>
        </RenderOnView>
      </ErrorBoundary>

      <ErrorBoundary>
        <RenderOnView
          id="subscriptions"
          forceRender={isTargeted("subscriptions")}
          placeholderHeight="600px"
          fallback={<GenericSectionSkeleton />}
        >
          <AnimateOnView>
            <Subscriptions />
          </AnimateOnView>
        </RenderOnView>
      </ErrorBoundary>
      <ErrorBoundary>
        <RenderOnView
          id="menu"
          forceRender={isTargeted("menu")}
          placeholderHeight="600px"
          fallback={<MenuSkeleton />}
        >
          <AnimateOnView>
            <Menu onNavigate={onNavigate} />
          </AnimateOnView>
        </RenderOnView>
      </ErrorBoundary>
      <ErrorBoundary>
        <RenderOnView
          id="about"
          forceRender={isTargeted("about")}
          fallback={<GenericSectionSkeleton />}
        >
          <AnimateOnView>
            <About />
          </AnimateOnView>
        </RenderOnView>
      </ErrorBoundary>

      <ErrorBoundary>
        <RenderOnView
          id="coverage"
          forceRender={isTargeted("coverage")}
          fallback={<GenericSectionSkeleton />}
        >
          <AnimateOnView>
            <DeliveryCoverage />
          </AnimateOnView>
        </RenderOnView>
      </ErrorBoundary>

      <ErrorBoundary>
        <RenderOnView
          id="testimonials"
          forceRender={isTargeted("testimonials")}
          fallback={<GenericSectionSkeleton />}
        >
          <AnimateOnView>
            <Testimonials />
          </AnimateOnView>
        </RenderOnView>
      </ErrorBoundary>
      <ErrorBoundary>
        <RenderOnView
          id="contact"
          forceRender={isTargeted("contact")}
          fallback={<GenericSectionSkeleton />}
        >
          <AnimateOnView>
            <ContactPage />
          </AnimateOnView>
        </RenderOnView>
      </ErrorBoundary>
      <ErrorBoundary>
        <RenderOnView
          id="faq"
          forceRender={isTargeted("faq")}
          fallback={<GenericSectionSkeleton />}
        >
          <AnimateOnView>
            <Faq />
          </AnimateOnView>
        </RenderOnView>
      </ErrorBoundary>
      <AnimateOnView>
        <Suspense fallback={<GenericSectionSkeleton />}>
          <QualityMetrics />
        </Suspense>
      </AnimateOnView>
      <Suspense fallback={<GenericSectionSkeleton />}>
        <ScientificExpertiseSection />
      </Suspense>
      <ErrorBoundary>
        <RenderOnView
          id="cta-section"
          placeholderHeight="300px"
          fallback={<GenericSectionSkeleton />}
        >
          <CtaSection />
        </RenderOnView>
      </ErrorBoundary>
    </div>
  );
};

export const App: React.FC = () => {
  const isNavigatingRef = useRef(false);
  const [isAppLoaded, setIsAppLoaded] = useState(() => {
    try {
      return sessionStorage.getItem('tb_app_loaded') === 'true';
    } catch (e) {
      console.warn("Storage access denied:", e);
      return false;
    }
  });

  const handleAppLoaded = useCallback(() => {
    try {
      sessionStorage.setItem('tb_app_loaded', 'true');
    } catch (e) {
      console.warn("Storage write denied:", e);
    }
    setIsAppLoaded(true);
  }, []);

  const getNormalizedPath = useCallback(() => {
    const path =
      window.location.pathname.replace(/\.html$/, "").replace(/\/$/, "") || "/";
    return path + window.location.hash;
  }, []);

  const [currentPage, setCurrentPage] = useState(getNormalizedPath);


  const currentPathStr = currentPage.split("#")[0];
  const currentMetadata = seoConfig[currentPathStr] || seoConfig["/"];

  const breadcrumbs = [{ name: "Home", item: "https://www.taazabites.in" }];

  if (
    currentPathStr &&
    currentPathStr !== "/" &&
    currentMetadata.breadcrumbName
  ) {
    breadcrumbs.push({
      name: currentMetadata.breadcrumbName,
      item: currentMetadata.canonical,
    });
  }

  useEffect(() => {
    // Analytics & setup hooks can go here
    // Legacy DOM Loader Cleanup (for Service Worker cache invalidation edge cases)
    const legacyLoader = document.getElementById("initial-loader");
    if (legacyLoader && legacyLoader.parentNode) {
      legacyLoader.parentNode.removeChild(legacyLoader);
    }

    // Safety Fallback: Guarantee that the application is marked as loaded within 1.5 seconds under all conditions.
    // This prevents a blank/frozen screen if AppLoader is blocked or sessionStorage access fails in sandboxed iframes.
    const safetyTimer = setTimeout(() => {
      setIsAppLoaded(true);
    }, 1500);

    return () => clearTimeout(safetyTimer);
  }, []);

  // SEO, OG, Twitter and AEO/GEO Schema injection are handled gracefully and dynamically below in the <SEO> component inside the return layout, eliminating duplicate head updates.

  useLayoutEffect(() => {
    if (
      window.location.hash === "" &&
      (window.location.pathname === "/" ||
        window.location.pathname === "/index.html")
    ) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant" as ScrollBehavior,
      });
    }
  }, []);

  const scrollToSection = useCallback((pagePath: string) => {
    const [path, hash] = pagePath.includes("#")
      ? pagePath.split("#")
      : [pagePath, undefined];
    const targetId = hash || pathToSectionIdMap[path || "/"];

    if (!targetId) {
      window.scrollTo({
        top: 0,
        left: 0,
      });
      return;
    }

    let attempts = 0;
    const tryScroll = () => {
      if (targetId) {
        const el = document.getElementById(targetId);
        if (el) {
          const offset = window.innerWidth < 1024 ? 80 : 120;
          window.scrollTo({
            top: el.getBoundingClientRect().top + window.pageYOffset - offset,
            behavior: "smooth",
          });
        } else if (attempts < 20) {
          attempts++;
          setTimeout(tryScroll, 100);
        }
      }
    };
    tryScroll();
  }, []);

  useEffect(() => {
    // Scroll to the targeted section on initial mount if landing on a homepage section
    const path = window.location.pathname;
    if (!isStandalonePath(path)) {
      scrollToSection(currentPage);
    }
  }, []);

  useEffect(() => {
    if (isNavigatingRef.current) {
      scrollToSection(currentPage);
    }
  }, [currentPage, scrollToSection]);

  const handlePageNavigate = useCallback(
    (path: string) => {
      isNavigatingRef.current = true;
      const sanitizedPath =
        path.replace(/\.html$/, "").replace(/\/$/, "") || "/";

      if (window.location.pathname + window.location.hash !== sanitizedPath) {
        window.history.pushState(null, "", sanitizedPath);
      }

      setCurrentPage((prev) => {
        if (prev === sanitizedPath) {
          scrollToSection(sanitizedPath);
          setTimeout(() => {
            isNavigatingRef.current = false;
          }, 1000);
          return prev;
        }
        return sanitizedPath;
      });

      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 1000);
    },
    [scrollToSection],
  );

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-40% 0px -60% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (isNavigatingRef.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          const path = Object.keys(pathToSectionIdMap).find(
            (key) => pathToSectionIdMap[key] === id,
          );

          if (path && path !== window.location.pathname) {
            window.history.replaceState(null, "", path);
            setCurrentPage(path);
          }
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions,
    );

    // Observe all sections after a short delay to ensure they are rendered
    const timeoutId = setTimeout(() => {
      Object.values(pathToSectionIdMap).forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const syncState = () => {
      isNavigatingRef.current = true;
      setCurrentPage(getNormalizedPath());
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 1000);
    };
    window.addEventListener("popstate", syncState);
    window.addEventListener("hashchange", syncState);
    return () => {
      window.removeEventListener("popstate", syncState);
      window.removeEventListener("hashchange", syncState);
    };
  }, [getNormalizedPath]);

  useEffect(() => {
    // Dynamic PageView tracking for SPA transitions to ensure precise Meta Pixel coverage
    if (typeof window !== "undefined" && (window as any).fbq) {
      try {
        (window as any).fbq("track", "PageView");
      } catch (e) {
        console.error("Meta Pixel SPA tracking error:", e);
      }
    }
  }, [currentPage]);

  const isEmbedMode = typeof window !== "undefined" && window.location.search.includes("embed=true");
  const isDarkPage = currentPathStr === "/debug" || currentPathStr === "/careers";
  const isFocusMode = currentPathStr === "/health-assessment" || isEmbedMode;
  const hideSiteHeader =
    isFocusMode ||
    currentPathStr === "/subscriptions" ||
    currentPathStr === "/products" ||
    currentPathStr === "/order";

  return (
    <AuthProvider>
      <ToastProvider>
        <AnimatePresence>
          {!isAppLoaded && <AppLoader onComplete={handleAppLoaded} />}
        </AnimatePresence>
        <div
          className={`app-container ${isDarkPage ? "bg-black" : "bg-[#F5F2ED]"} text-[#1A1A1A] font-sans antialiased ${!isFocusMode ? "pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-0" : ""} min-h-screen relative w-full overflow-x-hidden ${isAppLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-1000 ease-in-out`}
        >
          <SEO
            title={
              seoConfig[currentPage.split("#")[0]]?.title ||
              "Taazabites™ | Healthy Indian Diet Meal Delivery Bengaluru"
            }
            description={
              seoConfig[currentPage.split("#")[0]]?.description ||
              "Taazabites delivers fresh, chef-crafted premium diet meals across Bengaluru."
            }
            canonical={
              seoConfig[currentPage.split("#")[0]]?.canonical ||
              "https://www.taazabites.in"
            }
            ogImage={seoConfig[currentPage.split("#")[0]]?.ogImage}
            breadcrumbs={breadcrumbs}
            schemas={getSchemasForPath(currentPage.split("#")[0])}
          />
          <Favicon />
          
          {!hideSiteHeader && (
             <>
               <ScrollProgress />
               <Header
                 currentPage={currentPage.split("#")[0]}
                 onNavigate={handlePageNavigate}
               />
             </>
          )}

          <main
            id="main-content"
            className="min-h-screen flex flex-col w-full overflow-x-hidden"
            role="main"
          >
            {!isStandalonePath(currentPage.split("#")[0]) && (
              <>
                <Hero onNavigate={handlePageNavigate} />
                <Suspense fallback={<GenericSectionSkeleton />}>
                   <LandingInteractiveShowcase onNavigate={handlePageNavigate} />
                </Suspense>
                <Suspense fallback={<GenericSectionSkeleton />}>
                   <LocalCoverageHub />
                </Suspense>
                <Suspense fallback={<GenericSectionSkeleton />}>
                   <ScientificExpertiseSection />
                </Suspense>
              </>
            )}
            {currentPathStr !== "/subscriptions" &&
              currentPathStr !== "/products" &&
              currentPathStr !== "/order" && (
              <Breadcrumbs currentPage={currentPage} onNavigate={handlePageNavigate} />
            )}
            <AnimateOnView>
              <LazyContent
                onNavigate={handlePageNavigate}
                currentPath={currentPage.split("#")[0]}
                activeHash={
                  currentPage.split("#")[1]
                    ? `#${currentPage.split("#")[1]}`
                    : undefined
                }
              />
            </AnimateOnView>
          </main>
          
          {!isFocusMode && (
            <>
              <footer role="contentinfo">
                <ErrorBoundary>
                  <Suspense fallback={<FooterSkeleton />}>
                    <Footer
                      currentPage={currentPage.split("#")[0]}
                      onNavigate={handlePageNavigate}
                    />
                  </Suspense>
                </ErrorBoundary>
              </footer>
              <MobileBottomNav
                currentPath={currentPage.split("#")[0]}
                onNavigate={handlePageNavigate}
              />
              <Suspense fallback={null}>
                <LogisticsDrawer />
                <AuthModal />
              </Suspense>

              {/* WhatsApp — opens chat directly (no intermediate drawer) */}
              <div className="flex fixed bottom-20 md:bottom-8 right-4 md:right-6 lg:right-10 z-[400] flex-col items-end gap-3 pointer-events-none">
                <a
                  href={WHATSAPP_CONSULTATION_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 rounded-full shadow-[0_8px_30px_rgba(37,211,102,0.4)] border border-white/20 flex items-center justify-center transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  aria-label="24/7 WhatsApp Support"
                >
                  <WhatsAppIcon className="w-6 h-6 text-white" />
                </a>

                {currentPathStr !== "/subscriptions" &&
                  currentPathStr !== "/products" &&
                  currentPathStr !== "/order" && (
                  <button
                    type="button"
                    onClick={() => handlePageNavigate("/subscriptions")}
                    className="pointer-events-auto hidden md:flex bg-[#1A1A1A] hover:bg-black text-white px-5 py-3.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1 group items-center gap-2.5 border border-white/10 cursor-pointer"
                    aria-label="Subscribe"
                  >
                    <div className="relative">
                      <PackageOpen className="w-5 h-5 relative z-10 text-[#F59E0B]" />
                    </div>
                    <span className="font-bold tracking-wider text-sm uppercase">
                      Subscribe
                    </span>
                  </button>
                )}
              </div>

              {currentPathStr !== "/subscriptions" &&
                currentPathStr !== "/products" &&
                currentPathStr !== "/order" && (
                <button
                  onClick={() => handlePageNavigate("/corporate-booking")}
                  className="hidden md:flex fixed bottom-8 left-8 z-[100] bg-[#1A1A1A] hover:bg-black text-white p-4 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1 group items-center gap-2 border border-white/10"
                  aria-label="Corporate Services"
                >
                  <span className="text-xl">🤝</span>
                  <span className="font-bold tracking-wide pr-1 text-base uppercase">
                    Services
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      </ToastProvider>
    </AuthProvider>
  );
};
