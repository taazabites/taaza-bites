export type Role =
  | 'Super Admin'
  | 'Admin'
  | 'Operations Manager'
  | 'Kitchen Manager'
  | 'Kitchen Staff'
  | 'Delivery Manager'
  | 'Delivery Partner'
  | 'Finance Manager'
  | 'Finance'
  | 'Marketing Manager'
  | 'CRM Executive'
  | 'CRM Manager'
  | 'Support Executive'
  | 'Support Staff'
  | 'Inventory Manager'
  | 'Analytics Viewer'
  | 'Read Only Auditor'
  | 'Nutritionist';

export type Permission =
  | 'manage_all'
  | 'manage_customers'
  | 'manage_orders'
  | 'manage_subscriptions'
  | 'manage_reports'
  | 'manage_kitchen'
  | 'manage_menu'
  | 'manage_inventory'
  | 'manage_drivers'
  | 'manage_routes'
  | 'manage_deliveries'
  | 'manage_service_areas'
  | 'manage_tickets'
  | 'manage_complaints'
  | 'manage_notes'
  | 'manage_payments'
  | 'manage_refunds'
  | 'manage_invoices'
  | 'manage_coupons'
  | 'view_health'
  | 'view_analytics'
  | 'view_audit'
  | 'manage_roles'
  | 'change_payment_status'
  | 'read_only';

export const RolePermissions: Record<string, Permission[]> = {
  'Super Admin': ['manage_all'],
  'Admin': [
    'manage_customers', 'manage_orders', 'manage_subscriptions', 'manage_reports',
    'manage_kitchen', 'manage_menu', 'manage_inventory', 'manage_drivers',
    'manage_routes', 'manage_deliveries', 'manage_service_areas', 'manage_tickets',
    'manage_complaints', 'manage_notes', 'manage_payments', 'manage_refunds',
    'manage_invoices', 'manage_coupons', 'view_health', 'view_analytics',
    'view_audit', 'change_payment_status',
  ],
  'Operations Manager': [
    'manage_customers', 'manage_orders', 'manage_subscriptions', 'manage_reports',
    'manage_deliveries', 'manage_tickets', 'manage_complaints', 'view_analytics',
  ],
  'CRM Manager': [
    'manage_customers', 'manage_subscriptions', 'manage_notes', 'manage_tickets',
    'manage_complaints', 'view_health', 'view_analytics',
  ],
  'CRM Executive': [
    'manage_customers', 'manage_subscriptions', 'manage_notes', 'manage_tickets',
    'manage_complaints', 'view_health', 'view_analytics',
  ],
  'Kitchen Manager': ['manage_kitchen', 'manage_menu', 'manage_inventory', 'manage_orders'],
  'Kitchen Staff': ['manage_kitchen', 'manage_orders'],
  'Delivery Manager': ['manage_drivers', 'manage_routes', 'manage_deliveries', 'manage_service_areas'],
  'Delivery Partner': ['manage_deliveries'],
  'Finance Manager': ['manage_payments', 'manage_refunds', 'manage_invoices', 'manage_reports', 'change_payment_status', 'view_analytics'],
  'Finance': ['manage_payments', 'manage_refunds', 'manage_invoices', 'manage_reports', 'change_payment_status', 'view_analytics'],
  'Marketing Manager': ['manage_coupons', 'manage_reports', 'view_analytics'],
  'Support Executive': ['manage_customers', 'manage_orders', 'manage_tickets', 'manage_complaints', 'manage_notes'],
  'Support Staff': ['manage_customers', 'manage_orders', 'manage_tickets', 'manage_complaints', 'manage_notes'],
  'Inventory Manager': ['manage_inventory'],
  'Analytics Viewer': ['read_only', 'view_analytics', 'manage_reports'],
  'Read Only Auditor': ['read_only', 'view_audit', 'view_analytics'],
  'Nutritionist': ['view_health', 'manage_customers'],
};

export function normalizeRole(role: string | undefined | null): string {
  if (!role) return 'Read Only Auditor';
  if (role === 'superAdmin') return 'Super Admin';
  if (role === 'admin') return 'Admin';
  if (role === 'CRM Executive') return 'CRM Manager';
  if (role === 'Support Executive') return 'Support Staff';
  if (role === 'Finance') return 'Finance Manager';
  return role;
}

export const hasPermission = (role: string | undefined | null, permission: Permission): boolean => {
  const normalized = normalizeRole(role);
  if (normalized === 'Super Admin') return true;
  const perms = RolePermissions[normalized] || RolePermissions[role || ''] || [];
  return perms.includes(permission) || perms.includes('manage_all');
};

export function hasAnyPermission(role: string | undefined | null, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function canViewHealth(role: string | undefined | null): boolean {
  return hasPermission(role, 'view_health');
}

export function canChangePaymentStatus(role: string | undefined | null): boolean {
  return hasPermission(role, 'change_payment_status');
}
