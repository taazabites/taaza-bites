import { hasAnyPermission, hasPermission, Permission } from "./rbac";

export type NavAccess = {
  title: string;
  href?: string;
  permissions?: Permission[];
};

const PREFIX_RULES: { prefix: string; permissions: Permission[] }[] = [
  { prefix: "/super-admin", permissions: ["manage_roles", "manage_all"] },
  { prefix: "/admin-management", permissions: ["manage_roles", "manage_all"] },
  { prefix: "/audit-logs", permissions: ["view_audit", "manage_all"] },
  { prefix: "/customers/health", permissions: ["view_health"] },
  { prefix: "/health", permissions: ["view_health"] },
  { prefix: "/crm", permissions: ["manage_customers"] },
  { prefix: "/customers", permissions: ["manage_customers"] },
  { prefix: "/subscriptions", permissions: ["manage_subscriptions"] },
  { prefix: "/plans", permissions: ["manage_subscriptions"] },
  { prefix: "/orders", permissions: ["manage_orders"] },
  { prefix: "/kitchen", permissions: ["manage_kitchen"] },
  { prefix: "/meals", permissions: ["manage_menu"] },
  { prefix: "/scheduler", permissions: ["manage_kitchen"] },
  { prefix: "/delivery", permissions: ["manage_deliveries"] },
  { prefix: "/service-areas", permissions: ["manage_service_areas"] },
  { prefix: "/finance", permissions: ["manage_payments"] },
  { prefix: "/coupons", permissions: ["manage_coupons"] },
  { prefix: "/support", permissions: ["manage_tickets"] },
  { prefix: "/complaints", permissions: ["manage_complaints"] },
  { prefix: "/analytics", permissions: ["view_analytics"] },
  { prefix: "/reports", permissions: ["manage_reports"] },
  { prefix: "/retention", permissions: ["view_analytics", "manage_customers"] },
  { prefix: "/funnel", permissions: ["view_analytics"] },
  { prefix: "/inventory", permissions: ["manage_inventory"] },
  { prefix: "/ceo", permissions: ["view_analytics"] },
  { prefix: "/bi", permissions: ["view_analytics"] },
];

export function canAccessPath(role: string | undefined | null, pathname: string): boolean {
  if (!role) return false;
  if (hasPermission(role, "manage_all")) return true;
  const match = PREFIX_RULES
    .filter((rule) => pathname === rule.prefix || pathname.startsWith(rule.prefix + "/") || pathname === rule.prefix)
    .sort((a, b) => b.prefix.length - a.prefix.length)[0];
  if (!match) return true;
  return hasAnyPermission(role, match.permissions);
}

export function canSeeNavItem(role: string | undefined | null, href?: string): boolean {
  if (!href) return true;
  return canAccessPath(role, href.split("?")[0]);
}
