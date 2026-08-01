const trimSlash = (url: string) => url.replace(/\/$/, '');

export const PORTAL_LINKS = {
  customerHome: trimSlash(import.meta.env.VITE_CUSTOMER_URL || 'http://localhost:3000'),
  adminHome: trimSlash(import.meta.env.VITE_ADMIN_URL || 'http://localhost:3001'),
  landingHome: trimSlash(import.meta.env.VITE_LANDING_URL || 'http://localhost:3002'),
  deliveryHome: trimSlash(import.meta.env.VITE_DELIVERY_URL || 'http://localhost:3003'),
} as const;
