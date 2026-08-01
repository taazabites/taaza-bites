import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: any, formatStr: string = 'dd MMM, yyyy • hh:mm a') {
  if (!date) return '---';
  try {
    // Handle Firestore Timestamp
    const d = typeof date.toDate === 'function' ? date.toDate() : new Date(date);
    if (isNaN(d.getTime())) return '---';
    return format(d, formatStr);
  } catch (e) {
    return '---';
  }
}
