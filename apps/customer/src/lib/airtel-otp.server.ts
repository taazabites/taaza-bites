/**
 * In-memory OTP challenge store for Airtel DLT login / security OTP.
 * Server process memory only — fine for single-instance; use Redis if you scale horizontally.
 */

import { createHash, timingSafeEqual } from "crypto";
import {
  generateNumericOtp,
  normalizePhone10,
  sendAirtelTemplateSms,
  type SmsTemplateKey,
} from "./airtel-dlt-sms.server.ts";

type OtpPurpose = "login" | "security" | "delivery";

type OtpRecord = {
  hash: string;
  expiresAt: number;
  attempts: number;
  purpose: OtpPurpose;
};

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const store = new Map<string, OtpRecord>();

function pepper(): string {
  return process.env.PASSWORD_PEPPER || process.env.OTP_PEPPER || "TAAZABITES_OTP_PEPPER";
}

function key(purpose: OtpPurpose, phone10: string): string {
  return `${purpose}:${phone10}`;
}

function hashOtp(otp: string, phone10: string): string {
  return createHash("sha256").update(`${pepper()}:${phone10}:${otp}`).digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export type IssueOtpResult = {
  success: boolean;
  simulated?: boolean;
  expiresInSeconds: number;
  error?: string;
  /** Dev-only: never returned in production */
  debugOtp?: string;
};

export async function issueAirtelOtp(
  phone: string,
  purpose: OtpPurpose = "login"
): Promise<IssueOtpResult> {
  const phone10 = normalizePhone10(phone);
  if (phone10.length !== 10) {
    return { success: false, expiresInSeconds: 0, error: "Invalid phone number" };
  }

  const otp = generateNumericOtp(6);
  const templateKey: SmsTemplateKey =
    purpose === "delivery"
      ? "DELIVERY_OTP"
      : purpose === "security"
        ? "SECURITY_OTP"
        : "LOGIN_OTP";

  const send = await sendAirtelTemplateSms(templateKey, phone10, [otp]);
  if (!send.success) {
    return {
      success: false,
      expiresInSeconds: 0,
      error: send.error || "Failed to send OTP SMS",
    };
  }

  store.set(key(purpose, phone10), {
    hash: hashOtp(otp, phone10),
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
    purpose,
  });

  const result: IssueOtpResult = {
    success: true,
    simulated: send.simulated,
    expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
  };

  if (send.simulated && process.env.NODE_ENV !== "production") {
    result.debugOtp = otp;
    console.log(`[AIRTEL OTP][DEV] ${purpose} OTP for …${phone10.slice(-4)} = ${otp}`);
  }

  return result;
}

export type VerifyOtpResult = {
  ok: boolean;
  error?: string;
  remainingAttempts?: number;
};

export function verifyAirtelOtp(
  phone: string,
  otp: string,
  purpose: OtpPurpose = "login"
): VerifyOtpResult {
  const phone10 = normalizePhone10(phone);
  const record = store.get(key(purpose, phone10));

  if (!record) {
    return { ok: false, error: "No active OTP. Please request a new code." };
  }

  if (Date.now() > record.expiresAt) {
    store.delete(key(purpose, phone10));
    return { ok: false, error: "OTP expired. Please request a new code." };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    store.delete(key(purpose, phone10));
    return { ok: false, error: "Too many invalid attempts. Please request a new code." };
  }

  const incoming = String(otp || "").replace(/\D/g, "");
  if (incoming.length !== 6) {
    return { ok: false, error: "Enter the full 6-digit OTP." };
  }

  const match = safeEqualHex(hashOtp(incoming, phone10), record.hash);
  if (!match) {
    record.attempts += 1;
    const remaining = Math.max(0, MAX_ATTEMPTS - record.attempts);
    if (remaining === 0) store.delete(key(purpose, phone10));
    return {
      ok: false,
      error: "Invalid verification code.",
      remainingAttempts: remaining,
    };
  }

  store.delete(key(purpose, phone10));
  return { ok: true };
}
