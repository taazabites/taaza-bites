const trimSlash = (url: string) => url.replace(/\/$/, '');

export const PORTAL_LINKS = {
  customerHome: trimSlash(import.meta.env.VITE_CUSTOMER_URL || '/app'),
  adminHome: trimSlash(import.meta.env.VITE_ADMIN_URL || '/admin'),
  landingHome: trimSlash(import.meta.env.VITE_LANDING_URL || '/'),
  deliveryHome: trimSlash(import.meta.env.VITE_DELIVERY_URL || '/partner'),
} as const;
