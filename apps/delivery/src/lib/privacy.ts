export function maskPhone(phone?: string | null): string {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length < 4) return "••••";
  return `•••• ${digits.slice(-4)}`;
}

export function firstName(name?: string | null): string {
  const part = String(name || "Customer").trim().split(/\s+/)[0];
  return part || "Customer";
}

export function displayOrderId(orderId?: string, fallbackId?: string): string {
  const raw = orderId || fallbackId || "";
  if (!raw) return "ORDER";
  if (raw.toUpperCase().startsWith("TB") || raw.startsWith("ORDER")) return `#${raw}`;
  return `#${raw.slice(0, 10).toUpperCase()}`;
}
