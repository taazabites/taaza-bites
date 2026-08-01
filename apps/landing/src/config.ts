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

/** Sibling app base URLs — override via .env for local/prod */
export const CUSTOMER_APP_URL = portalUrl("VITE_CUSTOMER_URL", "http://localhost:3000");
export const ADMIN_APP_URL = portalUrl("VITE_ADMIN_URL", "http://localhost:3001");
export const DELIVERY_APP_URL = portalUrl("VITE_DELIVERY_URL", "http://localhost:3003");

/** Portal entry points used by landing CTAs + Phase 2 redirect */
export const PORTAL_LINKS = {
  /** Subscribe / meal plans / order flow → customer panel */
  customer: CUSTOMER_APP_URL,
  subscribe: CUSTOMER_APP_URL,
  order: CUSTOMER_APP_URL,
  customerHome: CUSTOMER_APP_URL,
  customerLogin: `${CUSTOMER_APP_URL}/login`,
  /** Staff — keep subtle (footer), not hero */
  adminHome: ADMIN_APP_URL,
  adminLogin: `${ADMIN_APP_URL}/admin/login`,
  /** Delivery partners */
  deliveryHome: DELIVERY_APP_URL,
  deliveryLogin: `${DELIVERY_APP_URL}/login`,
} as const;
