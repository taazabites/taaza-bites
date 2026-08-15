import { PUBLIC_PATHS } from "./publicPaths";

export const WHATSAPP_NUMBER = "917975771457";

const trimSlash = (url: string) => url.replace(/\/$/, "");

/** Vite client + Node/tsx safe env read */
const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};

function portalUrl(viteKey: string, fallback: string): string {
  return trimSlash(
    env[viteKey] ||
      (typeof process !== "undefined" ? process.env[viteKey] : undefined) ||
      fallback
  );
}

/**
 * Same-origin paths on the public website host.
 * Production: https://www.taazabites.in/app | /admin | /partner
 * Override with absolute URLs in env only if apps are hosted separately.
 */
export const CUSTOMER_APP_URL = portalUrl("VITE_CUSTOMER_URL", PUBLIC_PATHS.customer);
export const ADMIN_APP_URL = portalUrl("VITE_ADMIN_URL", PUBLIC_PATHS.admin);
export const DELIVERY_APP_URL = portalUrl("VITE_DELIVERY_URL", PUBLIC_PATHS.delivery);

export const PORTAL_LINKS = {
  customer: CUSTOMER_APP_URL,
  subscribe: CUSTOMER_APP_URL,
  order: "/order",
  customerHome: CUSTOMER_APP_URL,
  customerLogin: `${CUSTOMER_APP_URL}/login`,
  adminHome: ADMIN_APP_URL,
  adminLogin: `${ADMIN_APP_URL}/login`,
  deliveryHome: DELIVERY_APP_URL,
  deliveryLogin: `${DELIVERY_APP_URL}/login`,
} as const;
