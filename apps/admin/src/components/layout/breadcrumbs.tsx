import { Link, useLocation } from "react-router-dom"
import { ChevronRight, Home } from "lucide-react"

const routeNames: Record<string, string> = {
  admin: "Dashboard",
  analytics: "Analytics",
  orders: "Orders",
  pending: "Pending",
  preparing: "Preparing",
  packed: "Packed",
  delivered: "Delivered",
  cancelled: "Cancelled",
  customers: "Customers",
  health: "Health Center",
  addresses: "Addresses",
  wallet: "Wallets",
  rewards: "Rewards Program",
  referrals: "Referrals",
  notes: "Customer Notes",
  subscriptions: "Subscriptions",
  renewals: "Renewals",
  expiring: "Expiring Soon",
  plans: "Subscription Plans",
  kitchen: "Kitchen Hub",
  management: "Kitchen Management",
  operations: "Operations",
  packing: "Packing Line",
  delivery: "Delivery Hub",
  drivers: "Drivers",
  routes: "Route Planning",
  "service-areas": "Service Areas",
  pincodes: "Pincodes",
  branches: "Branches",
  franchises: "Franchises",
  ceo: "CEO Suite",
  bi: "Business Intelligence",
  performance: "Performance",
  inventory: "Inventory",
  stock: "Stock Control",
  suppliers: "Suppliers",
  meals: "Meals & Menu",
  categories: "Meal Categories",
  pricing: "Meal Pricing",
  availability: "Meal Availability",
  scheduler: "Scheduler",
  marketing: "Marketing Dashboard",
  coupons: "Coupons",
  communication: "Communications",
  campaigns: "Campaigns",
  templates: "Notification Templates",
  conversations: "Live Chat",
  notifications: "System Notifications",
  finance: "Finance Hub",
  refunds: "Refund Requests",
  invoices: "Invoices",
  support: "Support Center",
  cms: "CMS & Content",
  "admin-management": "Admin Management",
  "super-admin": "Super Admin Control",
  reports: "Reporting",
  settings: "Settings",
  gateways: "Gateway Settings",
  "audit-logs": "Audit Trail",
  "qa-test": "QA Testing",
};

export function Breadcrumbs() {
  const location = useLocation()
  const pathname = location.pathname

  // Split and filter out empty segments
  const segments = pathname.split("/").filter(Boolean)

  // If we are at the root admin login, unauthorized, or 404 pages, don't show breadcrumbs
  if (pathname.includes("/login") || pathname.includes("/unauthorized") || pathname === "/404") {
    return null
  }

  // Helper to get human-readable name
  const getDisplayName = (segment: string) => {
    if (routeNames[segment]) {
      return routeNames[segment]
    }
    return segment
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <nav 
      aria-label="Breadcrumb" 
      id="breadcrumb-trail"
      className="flex items-center gap-2 px-6 py-2.5 border-b border-border bg-background/95 backdrop-blur-md text-[11px] md:text-xs font-medium text-muted-foreground overflow-x-auto whitespace-nowrap  shrink-0"
    >
      <div className="flex items-center gap-1.5 shrink-0">
        <Link 
          to="/" 
          id="breadcrumb-home-link"
          className="flex items-center gap-1 hover:text-foreground text-muted-foreground/85 transition-colors"
        >
          <Home className="h-3.5 w-3.5" />
          <span>Dashboard</span>
        </Link>
      </div>

      {segments.map((segment, index) => {
        // Skip 'admin' segment in list loop since Dashboard is already prepended as Home
        if (segment === "admin") return null;

        const url = `/${segments.slice(0, index + 1).join("/")}`
        const isLast = index === segments.length - 1
        const displayName = getDisplayName(segment)

        return (
          <div key={url} className="flex items-center gap-2 shrink-0">
            <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
            {isLast ? (
              <span className="text-foreground font-semibold" id={`breadcrumb-current-${segment}`}>
                {displayName}
              </span>
            ) : (
              <Link 
                to={url} 
                id={`breadcrumb-link-${segment}`}
                className="hover:text-foreground text-muted-foreground/85 transition-colors"
              >
                {displayName}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
