import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { AuthProvider } from "./contexts/auth-context"
import { APIProvider } from '@vis.gl/react-google-maps'
import { ProtectedRoute } from "./components/ProtectedRoute"
import { AdminLayout } from "./components/layout/admin-layout"
import { Toaster } from "sonner"
import { ErrorBoundary } from "./components/ErrorBoundary"

// Eagerly import primary core routes for instant zero-latency link navigation
import LoginPage from "./pages/login"
import DashboardPage from "./pages/dashboard"
const OrdersDashboardPage = lazyWithRetry(() => import("./pages/orders/orders-dashboard"));
const OrdersListPage = lazyWithRetry(() => import("./pages/orders/orders-list"));
const OrdersGeneratePage = lazyWithRetry(() => import("./pages/orders/orders-generate"));
const OrdersReportsPage = lazyWithRetry(() => import("./pages/orders/orders-reports"));
import CustomersPage from "./pages/customers"
import SubscriptionsPage from "./pages/subscriptions"
import KitchenPage from "./pages/kitchen"
import DeliveryPage from "./pages/delivery"
import AnalyticsPage from "./pages/analytics"
import FinancePage from "./pages/finance"
import SettingsPage from "./pages/settings"

// Helper to retry lazy loading on failure (such as when chunk hashes change after edit/deployment)
function lazyWithRetry(componentImport: () => Promise<any>) {
  return lazy(() => 
    componentImport().catch((error) => {
      console.error("Dynamic import failed, reloading page to fetch latest bundle:", error);
      const lastReload = sessionStorage.getItem("last-chunk-reload");
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload) > 10000) {
        sessionStorage.setItem("last-chunk-reload", now.toString());
        window.location.reload();
      }
      return { default: () => <div className="p-8 text-center text-zinc-400">Loading latest updates...</div> };
    })
  );
}

// Lazy load secondary page modules with prefetching support
const RenewalsPage = lazyWithRetry(() => import("./pages/renewals"))
const ExpiringPage = lazyWithRetry(() => import("./pages/expiring"))
const KitchenManagementPage = lazyWithRetry(() => import("./pages/kitchen-management"));
const KitchenBoardPage = lazyWithRetry(() => import("./pages/kitchen-board"));
const KitchenPlannerPage = lazyWithRetry(() => import("./pages/kitchen-planner"));
const KitchenRecipesPage = lazyWithRetry(() => import("./pages/kitchen-recipes"));
const KitchenConsumptionPage = lazyWithRetry(() => import("./pages/kitchen-consumption"));
const KitchenStaffPage = lazyWithRetry(() => import("./pages/kitchen-staff"));
const KitchenReportsPage = lazyWithRetry(() => import("./pages/kitchen-reports"));
const OperationsDashboardPage = lazyWithRetry(() => import("./pages/operations-dashboard"));
const KitchenPackingPage = lazyWithRetry(() => import("./pages/kitchen-packing"));
const SupportPage = lazyWithRetry(() => import("./pages/support"))
const CustomerAddressesPage = lazyWithRetry(() => import("./pages/customer-addresses"))
const CustomerNotesPage = lazyWithRetry(() => import("./pages/customer-notes"))
const ReportsPage = lazyWithRetry(() => import("./pages/reports"))
const MealsPage = lazyWithRetry(() => import("./pages/meals"));
const MealsCategoriesPage = lazyWithRetry(() => import("./pages/meals-categories"));
const MealsPricingPage = lazyWithRetry(() => import("./pages/meals-pricing"));
const MealsAvailabilityPage = lazyWithRetry(() => import("./pages/meals-availability"));
const MenuPlannerPage = lazyWithRetry(() => import("./pages/menu-planner"));
const HealthPage = lazyWithRetry(() => import("./pages/health"))
const WalletPage = lazyWithRetry(() => import("./pages/wallet"))
const RewardsPage = lazyWithRetry(() => import("./pages/rewards"))
const InventoryPage = lazyWithRetry(() => import("./pages/inventory"))
const SchedulerPage = lazyWithRetry(() => import("./pages/scheduler"))
const MarketingPage = lazyWithRetry(() => import("./pages/marketing"))
const CouponsPage = lazyWithRetry(() => import("./pages/coupons"))
const NotificationsPage = lazyWithRetry(() => import("./pages/notifications"))
const CommunicationDashboard = lazyWithRetry(() => import("./pages/communication/dashboard"))
const CampaignManager = lazyWithRetry(() => import("./pages/communication/campaigns"))
const TemplateManager = lazyWithRetry(() => import("./pages/communication/templates"))
const ConversationManager = lazyWithRetry(() => import("./pages/communication/conversations"))
const NotificationCenter = lazyWithRetry(() => import("./pages/communication/notifications"))
const GatewaySettingsPage = lazyWithRetry(() => import("./pages/communication/settings"))
const CMSPage = lazyWithRetry(() => import("./pages/cms"))
const AdminManagementPage = lazyWithRetry(() => import("./pages/admin-management"))
const SuperAdminPage = lazyWithRetry(() => import("./pages/super-admin"))
const SubscriptionPlansPage = lazyWithRetry(() => import("./pages/plans"))
const ServiceAreasPage = lazyWithRetry(() => import("./pages/service-areas"))
const AuditLogsPage = lazyWithRetry(() => import("./pages/audit-logs"))
const BranchesPage = lazyWithRetry(() => import("./pages/branches"))
const FranchisesPage = lazyWithRetry(() => import("./pages/franchises"))
const OperationsPage = lazyWithRetry(() => import("./pages/operations"))
const CEODashboardPage = lazyWithRetry(() => import("./pages/ceo-dashboard"))
const BIPage = lazyWithRetry(() => import("./pages/business-intelligence"))
const CorporatePage = lazyWithRetry(() => import("./pages/corporate"))
const PerformancePage = lazyWithRetry(() => import("./pages/performance"))
const QATestPage = lazyWithRetry(() => import("./pages/qa-test"))
const AIDashboardPage = lazyWithRetry(() => import("./pages/ai-dashboard"))
const CrmCommandCenterPage = lazyWithRetry(() => import("./pages/crm-command-center"))
const CrmCustomersPage = lazyWithRetry(() => import("./pages/crm-customers"))
const Customer360Page = lazyWithRetry(() => import("./pages/customer-360"))
const CrmRenewalsPage = lazyWithRetry(() => import("./pages/crm-renewals"))
const ComplaintsPage = lazyWithRetry(() => import("./pages/complaints"))
const MealsMappingPage = lazyWithRetry(() => import("./pages/meals-mapping"))
const RetentionPage = lazyWithRetry(() => import("./pages/retention"))
const FunnelPage = lazyWithRetry(() => import("./pages/funnel"))
const NotificationArchitecturePage = lazyWithRetry(() => import("./pages/notification-architecture"))
const UnauthorizedPage = lazyWithRetry(() => import("./pages/unauthorized"))
const NotFoundPage = lazyWithRetry(() => import("./pages/not-found"))

// Prefetch remaining routes in background on load
if (typeof window !== "undefined") {
  const prefetchSecondaryRoutes = () => {
    setTimeout(() => {
      const routes = [
        () => import("./pages/meals"),
        () => import("./pages/inventory"),
        () => import("./pages/plans"),
        () => import("./pages/service-areas"),
        () => import("./pages/reports"),
        () => import("./pages/marketing"),
        () => import("./pages/coupons"),
        () => import("./pages/support")
      ];
      routes.forEach(fn => fn().catch(() => {}));
    }, 500);
  };
  
  if (window.requestIdleCallback) {
    window.requestIdleCallback(prefetchSecondaryRoutes);
  } else {
    window.addEventListener('load', prefetchSecondaryRoutes);
  }
}

// Lightweight Top Progress Loader
function RouteLoader() {
  return (
    <div className="w-full h-1 bg-zinc-900 overflow-hidden relative">
      <div className="h-full bg-emerald-500 animate-pulse w-3/4" />
    </div>
  )
}

const API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';

function SafeAPIProvider({ children }: { children: React.ReactNode }) {
  if (!API_KEY) {
    return <>{children}</>;
  }
  return (
    <APIProvider apiKey={API_KEY} version="weekly" libraries={['places', 'marker']}>
      {children}
    </APIProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" expand={false} richColors theme="dark" />
      <BrowserRouter basename="/admin">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<Suspense fallback={<RouteLoader />}><UnauthorizedPage /></Suspense>} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route element={<Suspense fallback={<RouteLoader />}><Outlet /></Suspense>}>
                <Route path="/" element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
                <Route path="/analytics" element={<ErrorBoundary><AnalyticsPage /></ErrorBoundary>} />
                
                <Route path="/orders" element={<ErrorBoundary><OrdersDashboardPage /></ErrorBoundary>} />
                <Route path="/orders/list" element={<ErrorBoundary><OrdersListPage /></ErrorBoundary>} />
                <Route path="/orders/pending" element={<ErrorBoundary><OrdersListPage /></ErrorBoundary>} />
                <Route path="/orders/preparing" element={<ErrorBoundary><OrdersListPage /></ErrorBoundary>} />
                <Route path="/orders/packed" element={<ErrorBoundary><OrdersListPage /></ErrorBoundary>} />
                <Route path="/orders/out" element={<ErrorBoundary><OrdersListPage /></ErrorBoundary>} />
                <Route path="/orders/delivered" element={<ErrorBoundary><OrdersListPage /></ErrorBoundary>} />
                <Route path="/orders/cancelled" element={<ErrorBoundary><OrdersListPage /></ErrorBoundary>} />
                <Route path="/orders/generate" element={<ErrorBoundary><OrdersGeneratePage /></ErrorBoundary>} />
                <Route path="/orders/reports" element={<ErrorBoundary><OrdersReportsPage /></ErrorBoundary>} />
                
                <Route path="/crm/customers/:customerId" element={<ErrorBoundary><Customer360Page /></ErrorBoundary>} />
                <Route path="/crm/renewals" element={<ErrorBoundary><CrmRenewalsPage /></ErrorBoundary>} />
                <Route path="/crm" element={<ErrorBoundary><CrmCustomersPage /></ErrorBoundary>} />
                <Route path="/crm/:segment" element={<ErrorBoundary><CrmCustomersPage /></ErrorBoundary>} />
                <Route path="/complaints" element={<ErrorBoundary><ComplaintsPage /></ErrorBoundary>} />
                <Route path="/meals/mapping" element={<ErrorBoundary><MealsMappingPage /></ErrorBoundary>} />
                <Route path="/retention" element={<ErrorBoundary><RetentionPage /></ErrorBoundary>} />
                <Route path="/funnel" element={<ErrorBoundary><FunnelPage /></ErrorBoundary>} />
                <Route path="/communication/architecture" element={<ErrorBoundary><NotificationArchitecturePage /></ErrorBoundary>} />
                <Route path="/customers" element={<ErrorBoundary><CustomersPage /></ErrorBoundary>} />
                <Route path="/customers/:tab" element={<ErrorBoundary><CustomersPage /></ErrorBoundary>} />
                
                <Route path="/subscriptions" element={<ErrorBoundary><SubscriptionsPage /></ErrorBoundary>} />
                <Route path="/subscriptions/renewals" element={<ErrorBoundary><RenewalsPage /></ErrorBoundary>} />
                <Route path="/subscriptions/expiring" element={<ErrorBoundary><ExpiringPage /></ErrorBoundary>} />
                <Route path="/plans" element={<ErrorBoundary><SubscriptionPlansPage /></ErrorBoundary>} />

                <Route path="/kitchen" element={<ErrorBoundary><KitchenPage /></ErrorBoundary>} />
                <Route path="/kitchen/planner" element={<ErrorBoundary><KitchenPlannerPage /></ErrorBoundary>} />
                <Route path="/kitchen/board" element={<ErrorBoundary><KitchenBoardPage /></ErrorBoundary>} />
                <Route path="/kitchen/recipes" element={<ErrorBoundary><KitchenRecipesPage /></ErrorBoundary>} />
                <Route path="/kitchen/consumption" element={<ErrorBoundary><KitchenConsumptionPage /></ErrorBoundary>} />
                <Route path="/kitchen/staff" element={<ErrorBoundary><KitchenStaffPage /></ErrorBoundary>} />
                <Route path="/kitchen/reports" element={<ErrorBoundary><KitchenReportsPage /></ErrorBoundary>} />
                <Route path="/kitchen/management" element={<ErrorBoundary><KitchenManagementPage /></ErrorBoundary>} />
                <Route path="/operations/dashboard" element={<ErrorBoundary><OperationsDashboardPage /></ErrorBoundary>} />
                <Route path="/kitchen/packing" element={<ErrorBoundary><KitchenPackingPage /></ErrorBoundary>} />
                
                <Route path="/delivery" element={<ErrorBoundary><SafeAPIProvider><DeliveryPage /></SafeAPIProvider></ErrorBoundary>} />
                <Route path="/delivery/drivers" element={<ErrorBoundary><SafeAPIProvider><DeliveryPage /></SafeAPIProvider></ErrorBoundary>} />
                <Route path="/delivery/routes" element={<ErrorBoundary><SafeAPIProvider><DeliveryPage /></SafeAPIProvider></ErrorBoundary>} />
                
                <Route path="/service-areas" element={<ErrorBoundary><SafeAPIProvider><ServiceAreasPage /></SafeAPIProvider></ErrorBoundary>} />
                <Route path="/service-areas/pincodes" element={<ErrorBoundary><SafeAPIProvider><ServiceAreasPage /></SafeAPIProvider></ErrorBoundary>} />
                
                <Route path="/branches" element={<ErrorBoundary><BranchesPage /></ErrorBoundary>} />
                <Route path="/franchises" element={<ErrorBoundary><FranchisesPage /></ErrorBoundary>} />
                <Route path="/corporate" element={<ErrorBoundary><CorporatePage /></ErrorBoundary>} />
                <Route path="/operations" element={<ErrorBoundary><OperationsPage /></ErrorBoundary>} />
                <Route path="/ceo" element={<ErrorBoundary><CEODashboardPage /></ErrorBoundary>} />
                <Route path="/bi" element={<ErrorBoundary><BIPage /></ErrorBoundary>} />
                <Route path="/performance" element={<ErrorBoundary><PerformancePage /></ErrorBoundary>} />
                
                <Route path="/inventory" element={<ErrorBoundary><InventoryPage /></ErrorBoundary>} />
                <Route path="/inventory/stock" element={<ErrorBoundary><InventoryPage /></ErrorBoundary>} />
                <Route path="/inventory/suppliers" element={<ErrorBoundary><InventoryPage /></ErrorBoundary>} />
                <Route path="/inventory/orders" element={<ErrorBoundary><InventoryPage /></ErrorBoundary>} />
                <Route path="/inventory/packaging" element={<ErrorBoundary><InventoryPage /></ErrorBoundary>} />
                <Route path="/inventory/analytics" element={<ErrorBoundary><InventoryPage /></ErrorBoundary>} />
                
                <Route path="/meals" element={<ErrorBoundary><MealsPage /></ErrorBoundary>} />
                <Route path="/meals/categories" element={<ErrorBoundary><MealsCategoriesPage /></ErrorBoundary>} />
                <Route path="/meals/pricing" element={<ErrorBoundary><MealsPricingPage /></ErrorBoundary>} />
                <Route path="/meals/availability" element={<ErrorBoundary><MealsAvailabilityPage /></ErrorBoundary>} />
                <Route path="/meals/planner" element={<ErrorBoundary><MenuPlannerPage /></ErrorBoundary>} />
                <Route path="/scheduler" element={<ErrorBoundary><SchedulerPage /></ErrorBoundary>} />

                <Route path="/marketing" element={<ErrorBoundary><MarketingPage /></ErrorBoundary>} />
                <Route path="/coupons" element={<ErrorBoundary><CouponsPage /></ErrorBoundary>} />
                <Route path="/communication" element={<ErrorBoundary><CommunicationDashboard /></ErrorBoundary>} />
                <Route path="/communication/campaigns" element={<ErrorBoundary><CampaignManager /></ErrorBoundary>} />
                <Route path="/communication/templates" element={<ErrorBoundary><TemplateManager /></ErrorBoundary>} />
                <Route path="/communication/conversations" element={<ErrorBoundary><ConversationManager /></ErrorBoundary>} />
                <Route path="/communication/notifications" element={<ErrorBoundary><NotificationCenter /></ErrorBoundary>} />
                <Route path="/notifications" element={<ErrorBoundary><NotificationsPage /></ErrorBoundary>} />

                <Route path="/finance" element={<ErrorBoundary><FinancePage /></ErrorBoundary>} />
                <Route path="/finance/refunds" element={<ErrorBoundary><FinancePage /></ErrorBoundary>} />
                <Route path="/finance/invoices" element={<ErrorBoundary><FinancePage /></ErrorBoundary>} />
                <Route path="/support" element={<ErrorBoundary><SupportPage /></ErrorBoundary>} />
                <Route path="/cms" element={<ErrorBoundary><CMSPage /></ErrorBoundary>} />
                <Route path="/admin-management" element={<ErrorBoundary><AdminManagementPage /></ErrorBoundary>} />
                <Route path="/super-admin" element={<ErrorBoundary><SuperAdminPage /></ErrorBoundary>} />
                <Route path="/reports" element={<ErrorBoundary><ReportsPage /></ErrorBoundary>} />
                <Route path="/settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
                <Route path="/settings/gateways" element={<ErrorBoundary><GatewaySettingsPage /></ErrorBoundary>} />
                <Route path="/audit-logs" element={<ErrorBoundary><AuditLogsPage /></ErrorBoundary>} />
                <Route path="/qa-test" element={<ErrorBoundary><QATestPage /></ErrorBoundary>} />
                <Route path="/ai-dashboard" element={<ErrorBoundary><AIDashboardPage /></ErrorBoundary>} />
                <Route path="/crm-command" element={<ErrorBoundary><CrmCommandCenterPage /></ErrorBoundary>} />

                {/* Convenience Aliases */}
                <Route path="/health" element={<Navigate to="/customers/health" replace />} />
                <Route path="/wallet" element={<Navigate to="/customers/wallet" replace />} />
                <Route path="/rewards" element={<Navigate to="/customers/rewards" replace />} />
                <Route path="/referrals" element={<Navigate to="/customers/referrals" replace />} />
                <Route path="/customer-addresses" element={<Navigate to="/customers/addresses" replace />} />
                <Route path="/customer-notes" element={<Navigate to="/customers/notes" replace />} />
                </Route>
            </Route>
          </Route>

          <Route path="/404" element={<Suspense fallback={<RouteLoader />}><NotFoundPage /></Suspense>} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
