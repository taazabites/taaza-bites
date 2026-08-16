/**
 * Shared demo credentials for local dashboard preview.
 * These are intentionally non-production passwords.
 */
export const DEMO_PASSWORD = "DemoAdmin!234";

export const DEMO_SUPER_ADMIN = {
  email: "admin@taazabites.in",
  password: DEMO_PASSWORD,
  name: "Demo Super Admin",
  role: "Super Admin" as const,
};

export const DEMO_ADMIN = {
  email: "demo.admin@taazabites.in",
  password: DEMO_PASSWORD,
  name: "Demo Admin",
  role: "Admin" as const,
};

export const ALLOW_SIMULATED_AUTH =
  import.meta.env.VITE_ALLOW_SIMULATED_AUTH === "true" ||
  import.meta.env.VITE_ALLOW_SIMULATED_AUTH === "1";

export const DEMO_STORAGE_KEY = "taaza_admin_demo";
