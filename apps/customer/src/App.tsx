import { Suspense, lazy, useEffect, ComponentType } from 'react';
import { Routes, Route, useLocation, Outlet, Navigate } from 'react-router-dom';
import ErrorBoundary from "./components/common/ErrorBoundary";
import Layout from './components/layout/Layout';
import PageSkeleton from './components/layout/PageSkeleton';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop';
import NetworkStatusBanner from './components/common/NetworkStatusBanner';
import { useAuth } from './context/AuthContext';
import { initMarketingScripts, Analytics } from './utils/analytics';
import { APIProvider } from '@vis.gl/react-google-maps';

const API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
  "";
// Helper for dynamic lazy imports with automatic chunk retry on network/version mismatch
const lazyWithRetry = <T extends ComponentType<any>>(componentImport: () => Promise<{ default: T }>) =>
  lazy(async () => {
    try {
      const component = await componentImport();
      // If we succeed, we can clear the reload flag for future chunks
      sessionStorage.removeItem('page_reloaded_for_chunk');
      return component;
    } catch (error) {
      const pageHasBeenReloaded = sessionStorage.getItem('page_reloaded_for_chunk');
      if (!pageHasBeenReloaded) {
        sessionStorage.setItem('page_reloaded_for_chunk', 'true');
        window.location.reload();
        // Return a promise that never resolves while page is reloading
        return new Promise(() => {});
      }
      throw error;
    }
  });

const LandingPage = lazyWithRetry(() => import('./pages/LandingPage'));

const ErrorBoundaryLayout = () => (
  <ErrorBoundary>
    <Outlet />
  </ErrorBoundary>
);

// Lazy load pages with chunk auto-retry
const HealthHub = lazyWithRetry(() => import('./pages/PremiumDashboard'));
const Plans = lazyWithRetry(() => import('./pages/Plans'));
const HealthAssessment = lazyWithRetry(() => import('./pages/HealthAssessment'));
const Checkout = lazyWithRetry(() => import('./pages/Checkout'));
const Payment = lazyWithRetry(() => import('./pages/Payment'));
const PaymentSuccess = lazyWithRetry(() => import('./pages/PaymentSuccess'));
const PaymentIssue = lazyWithRetry(() => import('./pages/PaymentIssue'));
const WelcomeJourney = lazyWithRetry(() => import('./pages/WelcomeJourney'));
const MealDetailExperience = lazyWithRetry(() => import('./pages/MealDetailExperience'));
const DeliveryExperience = lazyWithRetry(() => import('./pages/DeliveryExperience'));
const Meals = lazyWithRetry(() => import('./pages/Meals'));
const CalendarPage = lazyWithRetry(() => import('./pages/Calendar'));
const ProfilePage = lazyWithRetry(() => import('./pages/Profile'));
const Orders = lazyWithRetry(() => import('./pages/Orders'));
const WalletPage = lazyWithRetry(() => import('./pages/Wallet'));
const ReferPage = lazyWithRetry(() => import('./pages/Refer'));
const RewardsPage = lazyWithRetry(() => import('./pages/Rewards'));
const SupportPage = lazyWithRetry(() => import('./pages/Support'));
const AddressesPage = lazyWithRetry(() => import('./pages/Addresses'));
const SubscriptionsPage = lazyWithRetry(() => import('./pages/Subscriptions'));
const ProgressPage = lazyWithRetry(() => import('./pages/Progress'));
const NotificationsPage = lazyWithRetry(() => import('./pages/Notifications'));
const FAQPage = lazyWithRetry(() => import('./pages/FAQ'));
const FeedbackPage = lazyWithRetry(() => import('./pages/Feedback'));
const CommunityPage = lazyWithRetry(() => import('./pages/Community'));
const AICoachPage = lazyWithRetry(() => import('./pages/AICoach'));
const PlanDetailsPage = lazyWithRetry(() => import('./pages/PlanDetails'));
const LoginOTP = lazyWithRetry(() => import('./pages/LoginOTP'));
const NotFound = lazyWithRetry(() => import('./pages/NotFound'));
const OrderReview = lazyWithRetry(() => import('./pages/OrderReview'));
const MenuPage = lazyWithRetry(() => import('./pages/public/Menu'));
const CustomerProfile = lazyWithRetry(() => import('./pages/CustomerProfile'));
const PrivacyPolicy = lazyWithRetry(() => import('./pages/public/Privacy'));
const TermsConditions = lazyWithRetry(() => import('./pages/public/Terms'));
const HowItWorksPage = lazyWithRetry(() => import('./pages/public/HowItWorks'));
const AboutPage = lazyWithRetry(() => import('./pages/public/About'));
const ContactPage = lazyWithRetry(() => import('./pages/public/Contact'));
const CorporatePage = lazyWithRetry(() => import('./pages/public/Corporate'));
const GiftPlansPage = lazyWithRetry(() => import('./pages/public/GiftPlans'));
const BlogPage = lazyWithRetry(() => import('./pages/public/Blog'));
const CareersPage = lazyWithRetry(() => import('./pages/public/Careers'));
const PublicPricingPage = lazyWithRetry(() => import('./pages/public/Pricing'));
const PublicFAQPage = lazyWithRetry(() => import('./pages/public/FAQ'));
const DeliverySetup = lazyWithRetry(() => import('./pages/DeliverySetup'));
const DeliveryAreaCheck = lazyWithRetry(() => import('./pages/DeliveryAreaCheck'));
const DeliveryAreas = lazyWithRetry(() => import('./pages/DeliveryAreas'));
const DeliverySlot = lazyWithRetry(() => import('./pages/DeliverySlot'));
const PerformancePage = lazyWithRetry(() => import('./pages/Performance'));
const OperationsCockpit = lazyWithRetry(() => import('./pages/OperationsCockpit'));
const KitchenDashboard = lazyWithRetry(() => import('./pages/KitchenDashboard'));
const EnterpriseAdmin = lazyWithRetry(() => import('./pages/EnterpriseAdmin'));
const AIEngine = lazyWithRetry(() => import('./pages/AIEngine'));

const Home = () => {
  const { currentUser } = useAuth();
  
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <LandingPage />;
};

export default function App() {
  const location = useLocation();

  useEffect(() => {
    initMarketingScripts();
    // Auto-capture ?ref= referral code parameter
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref');
    if (refParam) {
      localStorage.setItem('taaza_ref_code', refParam.trim().toUpperCase());
    }
  }, []);

  useEffect(() => {
    Analytics.trackPageView(location.pathname);
  }, [location.pathname]);

  return (
    <APIProvider apiKey={API_KEY} version="weekly" libraries={['places', 'geometry']}>
      <Layout>
        <ErrorBoundary>
          <NetworkStatusBanner />
          <ScrollToTop />
          <Suspense fallback={<PageSkeleton />}>
            <Routes>
            <Route element={<ErrorBoundaryLayout />}>
              {/* Public / Marketing Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/pricing" element={<PublicPricingPage />} />
              <Route path="/delivery-areas" element={<DeliveryAreas />} />
              <Route path="/delivery-availability" element={<DeliveryAreas />} />
              <Route path="/faq" element={<PublicFAQPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/corporate" element={<CorporatePage />} />
              <Route path="/gift" element={<GiftPlansPage />} />
              <Route path="/gifts" element={<GiftPlansPage />} />
              <Route path="/gift-plans" element={<GiftPlansPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsConditions />} />
              <Route path="/refund-policy" element={<TermsConditions />} />
              
              <Route path="/plans" element={<Plans />} />
              <Route path="/plans/:id" element={<PlanDetailsPage />} />
              <Route path="/health-assessment" element={<HealthAssessment />} />
              <Route path="/login-otp" element={<LoginOTP />} />
              <Route path="/login" element={<LoginOTP />} />
              <Route path="/performance" element={<PerformancePage />} />
              <Route path="/order-review" element={<ProtectedRoute><OrderReview /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><CustomerProfile /></ProtectedRoute>} />

              {/* Protected Onboarding / Checkout Flows */}
              <Route path="/subscribe/area-check" element={<ProtectedRoute><DeliveryAreaCheck /></ProtectedRoute>} />
              <Route path="/subscribe/address" element={<ProtectedRoute><DeliverySetup /></ProtectedRoute>} />
              <Route path="/subscribe/slot" element={<ProtectedRoute><DeliverySlot /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
              <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
              <Route path="/payment-issue" element={<ProtectedRoute><PaymentIssue /></ProtectedRoute>} />
              <Route path="/payment-failed" element={<ProtectedRoute><PaymentIssue /></ProtectedRoute>} />
              <Route path="/welcome-journey" element={<ProtectedRoute><WelcomeJourney /></ProtectedRoute>} />
              <Route path="/meal-experience/:mealId" element={<ProtectedRoute><MealDetailExperience /></ProtectedRoute>} />
              <Route path="/delivery-experience" element={<ProtectedRoute><DeliveryExperience /></ProtectedRoute>} />

              {/* Dashboard & App Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><HealthHub /></ProtectedRoute>} />
              <Route path="/dashboard/todays-meals" element={<ProtectedRoute><Meals /></ProtectedRoute>} />
              <Route path="/dashboard/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
              <Route path="/dashboard/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/dashboard/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
              <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
              <Route path="/dashboard/refer" element={<ProtectedRoute><ReferPage /></ProtectedRoute>} />
              <Route path="/dashboard/rewards" element={<ProtectedRoute><RewardsPage /></ProtectedRoute>} />
              <Route path="/dashboard/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
              <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
              <Route path="/dashboard/ai-coach" element={<ProtectedRoute><AICoachPage /></ProtectedRoute>} />
              <Route path="/ai-coach" element={<ProtectedRoute><AICoachPage /></ProtectedRoute>} />
              <Route path="/dashboard/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
              <Route path="/dashboard/addresses" element={<ProtectedRoute><AddressesPage /></ProtectedRoute>} />
              <Route path="/dashboard/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              <Route path="/dashboard/subscriptions" element={<ProtectedRoute><SubscriptionsPage /></ProtectedRoute>} />
              <Route path="/dashboard/operations" element={<ProtectedRoute><OperationsCockpit /></ProtectedRoute>} />
              <Route path="/operations" element={<ProtectedRoute><OperationsCockpit /></ProtectedRoute>} />
              <Route path="/kitchen" element={<ProtectedRoute><KitchenDashboard /></ProtectedRoute>} />
              <Route path="/enterprise-admin" element={<ProtectedRoute><EnterpriseAdmin /></ProtectedRoute>} />
              <Route path="/ai-engine" element={<ProtectedRoute><AIEngine /></ProtectedRoute>} />
              <Route path="/dashboard/faq" element={<FAQPage />} />
              <Route path="/dashboard/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
              <Route path="/refer" element={<ProtectedRoute><ReferPage /></ProtectedRoute>} />
              <Route path="/rewards" element={<ProtectedRoute><RewardsPage /></ProtectedRoute>} />
              <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
              <Route path="/addresses" element={<ProtectedRoute><AddressesPage /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              <Route path="/subscriptions" element={<ProtectedRoute><SubscriptionsPage /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />

              {/* Hub Route Aliases */}
              <Route path="/hub" element={<ProtectedRoute><HealthHub /></ProtectedRoute>} />
              <Route path="/hub/addresses" element={<ProtectedRoute><AddressesPage /></ProtectedRoute>} />
              <Route path="/hub/todays-meals" element={<ProtectedRoute><Meals /></ProtectedRoute>} />
              <Route path="/hub/menu" element={<ProtectedRoute><Meals /></ProtectedRoute>} />
              <Route path="/hub/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
              <Route path="/hub/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/hub/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
              <Route path="/hub/refer" element={<ProtectedRoute><ReferPage /></ProtectedRoute>} />
              <Route path="/hub/rewards" element={<ProtectedRoute><RewardsPage /></ProtectedRoute>} />
              <Route path="/hub/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
              <Route path="/hub/ai-coach" element={<ProtectedRoute><AICoachPage /></ProtectedRoute>} />
              <Route path="/hub/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
              <Route path="/hub/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              <Route path="/hub/subscriptions" element={<ProtectedRoute><SubscriptionsPage /></ProtectedRoute>} />
              <Route path="/hub/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
              <Route path="/hub/settings" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/hub/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              {/* Wildcard 404 */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Layout>
    </APIProvider>
  );
}

