export type DatePreset = "today" | "yesterday" | "7d" | "30d" | "custom";

export interface DateRange {
  start: Date;
  end: Date;
  preset: DatePreset;
}

export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "object" && value !== null && typeof (value as { toDate?: () => Date }).toDate === "function") {
    const d = (value as { toDate: () => Date }).toDate();
    return d instanceof Date && !Number.isNaN(d.getTime()) ? d : null;
  }
  if (typeof value === "object" && value !== null && "seconds" in (value as object)) {
    const seconds = Number((value as { seconds: number }).seconds);
    if (!Number.isNaN(seconds)) return new Date(seconds * 1000);
  }
  const d = new Date(value as string | number);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function daysUntil(value: unknown): number | null {
  const end = toDate(value);
  if (!end) return null;
  return Math.ceil((end.getTime() - Date.now()) / 86400000);
}

export function daysSince(value: unknown): number | null {
  const start = toDate(value);
  if (!start) return null;
  return Math.floor((Date.now() - start.getTime()) / 86400000);
}

export function inRange(value: unknown, range: DateRange): boolean {
  const d = toDate(value);
  if (!d) return false;
  return d.getTime() >= range.start.getTime() && d.getTime() <= range.end.getTime();
}

export function presetRange(preset: DatePreset, customStart?: Date, customEnd?: Date): DateRange {
  const now = new Date();
  if (preset === "today") return { preset, start: startOfDay(now), end: endOfDay(now) };
  if (preset === "yesterday") {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    return { preset, start: startOfDay(y), end: endOfDay(y) };
  }
  if (preset === "7d") {
    const s = new Date(now);
    s.setDate(s.getDate() - 6);
    return { preset, start: startOfDay(s), end: endOfDay(now) };
  }
  if (preset === "30d") {
    const s = new Date(now);
    s.setDate(s.getDate() - 29);
    return { preset, start: startOfDay(s), end: endOfDay(now) };
  }
  return {
    preset: "custom",
    start: startOfDay(customStart || now),
    end: endOfDay(customEnd || now),
  };
}

export function previousRange(range: DateRange): DateRange {
  const ms = range.end.getTime() - range.start.getTime();
  const end = new Date(range.start.getTime() - 1);
  const start = new Date(end.getTime() - ms);
  return { preset: "custom", start, end };
}

export function formatInr(amount: number): string {
  const n = Number(amount) || 0;
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function formatDate(value: unknown): string {
  const d = toDate(value);
  if (!d) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(value: unknown): string {
  const d = toDate(value);
  if (!d) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function monthKey(value: unknown): string | null {
  const d = toDate(value);
  if (!d) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
