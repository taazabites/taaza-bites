
export type Role =
  | 'Super Admin'
  | 'Admin'
  | 'Operations Manager'
  | 'Kitchen Manager'
  | 'Kitchen Staff'
  | 'Delivery Manager'
  | 'Delivery Partner'
  | 'Finance Manager'
  | 'Marketing Manager'
  | 'CRM Executive'
  | 'Support Executive'
  | 'Inventory Manager'
  | 'Analytics Viewer'
  | 'Read Only Auditor';

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
  | 'manage_notes'
  | 'manage_payments'
  | 'manage_refunds'
  | 'manage_invoices'
  | 'read_only';

export const RolePermissions: Record<Role, Permission[]> = {
  'Super Admin': ['manage_all'],
  'Admin': ['manage_customers', 'manage_orders', 'manage_subscriptions', 'manage_reports', 'manage_kitchen', 'manage_menu', 'manage_inventory', 'manage_drivers', 'manage_routes', 'manage_deliveries', 'manage_service_areas', 'manage_tickets', 'manage_notes', 'manage_payments', 'manage_refunds', 'manage_invoices'],
  'Operations Manager': ['manage_customers', 'manage_orders', 'manage_subscriptions', 'manage_reports'],
  'Kitchen Manager': ['manage_kitchen', 'manage_menu', 'manage_inventory'],
  'Kitchen Staff': ['manage_kitchen'],
  'Delivery Manager': ['manage_drivers', 'manage_routes', 'manage_deliveries', 'manage_service_areas'],
  'Delivery Partner': ['manage_deliveries'],
  'Finance Manager': ['manage_payments', 'manage_refunds', 'manage_invoices', 'manage_reports'],
  'Marketing Manager': ['manage_reports'],
  'CRM Executive': ['manage_customers', 'manage_subscriptions', 'manage_notes'],
  'Support Executive': ['manage_customers', 'manage_tickets', 'manage_notes'],
  'Inventory Manager': ['manage_inventory'],
  'Analytics Viewer': ['read_only'],
  'Read Only Auditor': ['read_only']
};

export const hasPermission = (role: Role, permission: Permission): boolean => {
  if (role === 'Super Admin') return true;
  return RolePermissions[role].includes(permission) || RolePermissions[role].includes('manage_all');
};
