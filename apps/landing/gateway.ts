import http from "http";
import type { Express, Request, RequestHandler } from "express";
import { createProxyMiddleware, type RequestHandler as ProxyHandler } from "http-proxy-middleware";

const CUSTOMER_UPSTREAM = process.env.CUSTOMER_UPSTREAM || "http://127.0.0.1:3000";
const ADMIN_UPSTREAM = process.env.ADMIN_UPSTREAM || "http://127.0.0.1:3001";
const DELIVERY_UPSTREAM = process.env.DELIVERY_UPSTREAM || "http://127.0.0.1:3003";

const ADMIN_API_PREFIXES = [
  "/api/me",
  "/api/super-admin",
  "/api/partner",
  "/api/delivery",
  "/api/webhooks",
  "/api/razorpay",
  "/api/settings",
  "/api/gupshup",
  "/api/cron",
  "/api/maps",
  "/api/notifications",
  "/api/ops",
  "/api/coupons",
];

const CUSTOMER_API_PREFIXES = [
  "/api/ai",
  "/api/communication",
  "/api/wallet",
  "/api/subscriptions",
  "/api/rewards",
  "/api/otp",
  "/api/plans",
];

function prefixFilter(prefix: string) {
  return (pathname: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function spaProxy(target: string, label: string, pathFilter: (pathname: string) => boolean): ProxyHandler {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    ws: true,
    xfwd: true,
    pathFilter,
    timeout: 120000,
    proxyTimeout: 120000,
    on: {
      error(err, _req, res) {
        console.error(`[gateway:${label}]`, err.message);
        const r = res as { headersSent?: boolean; writeHead?: Function; end?: Function };
        if (!r.headersSent && r.writeHead) {
          r.writeHead(502, { "Content-Type": "application/json" });
          r.end(JSON.stringify({ error: `${label} app is not running`, target }));
        }
      },
    },
  });
}

function matchesPrefix(path: string, prefixes: string[]) {
  return prefixes.some((p) => path === p || path.startsWith(`${p}/`));
}

function isAdminOrigin(req: Request) {
  const appHeader = String(req.headers["x-taaza-app"] || "").toLowerCase();
  const referer = String(req.headers.referer || "");
  const origin = String(req.headers.origin || "");
  return (
    appHeader === "admin" ||
    referer.includes("/admin") ||
    origin.includes("/admin") ||
    origin.includes(":3001")
  );
}

/** Split /api/auth and /api/payments so they never silently hit the wrong Express app. */
function resolveApiUpstream(req: Request): "admin" | "customer" | null {
  const path = req.path;

  if (path === "/api/auth/verify-token" || path.startsWith("/api/auth/verify-token/")) {
    return "admin";
  }
  if (path === "/api/auth" || path.startsWith("/api/auth/")) {
    return "customer";
  }

  if (path.startsWith("/api/payments")) {
    if (path.startsWith("/api/payments/refund") || path === "/api/payments/config") {
      return "admin";
    }
    if (path.startsWith("/api/payments/activate-zero-order") || path.startsWith("/api/payments/webhook")) {
      return "customer";
    }
    return isAdminOrigin(req) ? "admin" : "customer";
  }

  if (matchesPrefix(path, ADMIN_API_PREFIXES)) return "admin";
  if (matchesPrefix(path, CUSTOMER_API_PREFIXES)) return "customer";
  return null;
}

const customerProxy = spaProxy(CUSTOMER_UPSTREAM, "customer", prefixFilter("/app"));
const adminProxy = spaProxy(ADMIN_UPSTREAM, "admin", prefixFilter("/admin"));
const deliveryProxy = spaProxy(DELIVERY_UPSTREAM, "delivery", prefixFilter("/partner"));
const adminApiProxy = spaProxy(ADMIN_UPSTREAM, "admin-api", () => true);
const customerApiProxy = spaProxy(CUSTOMER_UPSTREAM, "customer-api", () => true);

/** Mount path-prefix proxies so one host serves landing + /app + /admin + /partner */
export function mountAppGateway(app: Express) {
  app.use((req, res, next) => {
    if (req.path === "/app" || req.path === "/admin" || req.path === "/partner") {
      const query = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
      return res.redirect(302, `${req.path}/${query}`);
    }
    next();
  });

  // Do not mount on '/app' etc. — Express would strip the prefix and Vite base would 302-loop.
  app.use(customerProxy as unknown as RequestHandler);
  app.use(deliveryProxy as unknown as RequestHandler);
  app.use(adminProxy as unknown as RequestHandler);

  app.use((req, res, next) => {
    const upstream = resolveApiUpstream(req);
    if (upstream === "admin") {
      return (adminApiProxy as unknown as RequestHandler)(req, res, next);
    }
    if (upstream === "customer") {
      return (customerApiProxy as unknown as RequestHandler)(req, res, next);
    }
    next();
  });

  console.log(
    `[gateway] /app → ${CUSTOMER_UPSTREAM} | /admin → ${ADMIN_UPSTREAM} | /partner → ${DELIVERY_UPSTREAM}`
  );
}

import type { Socket } from "net";

export function attachGatewayWebSockets(server: http.Server) {
  server.on("upgrade", (req, socket, head) => {
    const netSocket = socket as Socket;
    const url = req.url || "";
    if (url.startsWith("/app")) {
      customerProxy.upgrade?.(req, netSocket, head);
      return;
    }
    if (url.startsWith("/partner")) {
      deliveryProxy.upgrade?.(req, netSocket, head);
      return;
    }
    if (url.startsWith("/admin")) {
      adminProxy.upgrade?.(req, netSocket, head);
    }
  });
}
