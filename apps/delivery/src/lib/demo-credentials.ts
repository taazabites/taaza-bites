/** Demo partner credentials for local dashboard preview */
export const DEMO_PARTNER = {
  phone: "9876543210",
  name: "Demo Delivery Partner",
  uid: "sim_partner_9876543210",
};

export const ALLOW_SIMULATED_AUTH =
  import.meta.env.DEV ||
  import.meta.env.VITE_ALLOW_SIMULATED_AUTH === "true" ||
  import.meta.env.VITE_ALLOW_SIMULATED_AUTH === "1";

export const DEMO_STORAGE_KEY = "taaza_partner_demo";
