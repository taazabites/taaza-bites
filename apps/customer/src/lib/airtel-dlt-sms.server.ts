/**
 * Airtel IQ + DLT transactional SMS (server-only).
 * Never import this from Vite client code — credentials must stay on the server.
 *
 * Docs: POST https://iqsms.airtel.in/api/v1/send-sms
 * Auth: HTTP Basic (AIRTEL_IQ_USERNAME / AIRTEL_IQ_PASSWORD)
 */

import { randomInt } from "crypto";

export type AirtelMessageType =
  | "TRANSACTIONAL"
  | "SERVICE_IMPLICIT"
  | "SERVICE_EXPLICIT"
  | "PROMOTIONAL";

export type SmsTemplateKey =
  | "LOGIN_OTP"
  | "WELCOME"
  | "ORDER_CONFIRM"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "ORDER_PREPARING"
  | "PARTNER_ASSIGNED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERY_OTP"
  | "ORDER_DELIVERED"
  | "DELIVERY_DELAYED"
  | "ORDER_CANCELLED"
  | "SUBSCRIPTION_ACTIVATED"
  | "SUBSCRIPTION_PAYMENT_SUCCESS"
  | "SUBSCRIPTION_RENEWAL_REMINDER"
  | "SUBSCRIPTION_RENEWED"
  | "SUBSCRIPTION_EXPIRING"
  | "SUBSCRIPTION_PAUSED"
  | "SUBSCRIPTION_RESUMED"
  | "SUBSCRIPTION_PAYMENT_FAILED"
  | "MEAL_DELIVERY_REMINDER"
  | "DAILY_MEAL_REMINDER"
  | "DELIVERY_OTP_RESEND"
  | "PROFILE_UPDATED"
  | "SECURITY_OTP"
  | "PROMO_GENERAL"
  | "PROMO_SUBSCRIPTION"
  | "PROMO_REORDER"
  | "PROMO_NEW_CUSTOMER"
  | "PROMO_RENEWAL";

type TemplateDef = {
  envKey: string;
  messageType: AirtelMessageType;
  /** Exact DLT-approved copy with {#var#} placeholders replaced by callers via buildMessage */
  build: (...vars: string[]) => string;
};

const TEMPLATES: Record<SmsTemplateKey, TemplateDef> = {
  LOGIN_OTP: {
    envKey: "AIRTEL_DLT_OTP_TEMPLATE_ID",
    messageType: "SERVICE_IMPLICIT",
    build: (otp) =>
      `Your Taaza Bites verification code is ${otp}. Valid for 10 minutes. Do not share this code with anyone.`,
  },
  WELCOME: {
    envKey: "AIRTEL_DLT_WELCOME_TEMPLATE_ID",
    messageType: "SERVICE_IMPLICIT",
    build: (name) =>
      `Welcome to Taaza Bites, ${name}! Your account has been created successfully. Enjoy fresh and healthy meals delivered to you.`,
  },
  ORDER_CONFIRM: {
    envKey: "AIRTEL_DLT_ORDER_CONFIRM_TEMPLATE_ID",
    messageType: "SERVICE_IMPLICIT",
    build: (name, orderId, deliveryDate) =>
      `Dear ${name}, your Taaza Bites order ${orderId} has been confirmed. Your fresh meal is scheduled for delivery on ${deliveryDate}.`,
  },
  PAYMENT_SUCCESS: {
    envKey: "AIRTEL_DLT_PAYMENT_SUCCESS_TEMPLATE_ID",
    messageType: "SERVICE_IMPLICIT",
    build: (amount, orderId) =>
      `Payment of Rs.${amount} for Taaza Bites order ${orderId} was successful. Thank you for choosing Taaza Bites.`,
  },
  PAYMENT_FAILED: {
    envKey: "AIRTEL_DLT_PAYMENT_FAILED_TEMPLATE_ID",
    messageType: "SERVICE_IMPLICIT",
    build: (name, orderId) =>
      `Dear ${name}, payment for your Taaza Bites order ${orderId} could not be completed. Please try again to confirm your order.`,
  },
  ORDER_PREPARING: {
    envKey: "AIRTEL_DLT_ORDER_PREPARING_TEMPLATE_ID",
    messageType: "SERVICE_IMPLICIT",
    build: (orderId) =>
      `Your Taaza Bites order ${orderId} is being freshly prepared. We will update you when it is out for delivery.`,
  },
  PARTNER_ASSIGNED: {
    envKey: "AIRTEL_DLT_PARTNER_ASSIGNED_TEMPLATE_ID",
    messageType: "SERVICE_IMPLICIT",
    build: (orderId) =>
      `Your Taaza Bites order ${orderId} has been assigned for delivery and will reach you shortly.`,
  },
  OUT_FOR_DELIVERY: {
    envKey: "AIRTEL_DLT_OUT_FOR_DELIVERY_TEMPLATE_ID",
    messageType: "SERVICE_IMPLICIT",
    build: (orderId) =>
      `Your Taaza Bites order ${orderId} is out for delivery. Please be available to receive your fresh meal.`,
  },
  DELIVERY_OTP: {
    envKey: "AIRTEL_DLT_DELIVERY_OTP_TEMPLATE_ID",
    messageType: "SERVICE_IMPLICIT",
    build: (otp) =>
      `Your Taaza Bites delivery verification OTP is ${otp}. Share this OTP with our delivery partner to confirm delivery. Do not share it with anyone else.`,
  },
  ORDER_DELIVERED: {
    envKey: "AIRTEL_DLT_ORDER_DELIVERED_TEMPLATE_ID",
    messageType: "SERVICE_IMPLICIT",
    build: (orderId) =>
      `Your Taaza Bites order ${orderId} has been delivered successfully. Thank you for choosing Taaza Bites.`,
  },
  DELIVERY_DELAYED: {
    envKey: "AIRTEL_DLT_DELIVERY_DELAYED_TEMPLATE_ID",
    messageType: "SERVICE_IMPLICIT",
    build: (name, orderId) =>
      `Dear ${name}, your Taaza Bites order ${orderId} is delayed due to delivery circumstances. We apologise for the inconvenience.`,
  },
  ORDER_CANCELLED: {
    envKey: "AIRTEL_DLT_ORDER_CANCELLED_TEMPLATE_ID",
    messageType: "SERVICE_IMPLICIT",
    build: (name, orderId) =>
      `Dear ${name}, your Taaza Bites order ${orderId} has been cancelled. Refund details will be shared if applicable.`,
  },
  SUBSCRIPTION_ACTIVATED: {
    envKey: "AIRTEL_DLT_SUBSCRIPTION_ACTIVATED_TEMPLATE_ID",
    messageType: "SERVICE_IMPLICIT",
    build: (name, subscriptionId) =>
      `Dear ${name}, your Taaza Bites subscription ${subscriptionId} is now active. Your meals will be delivered as per your selected schedule.`,
  },
  SUBSCRIPTION_PAYMENT_SUCCESS: {
    envKey: "AIRTEL_DLT_SUBSCRIPTION_PAYMENT_SUCCESS_TEMPLATE_ID",
    messageType: "SERVICE_IMPLICIT",
    build: (amount, subscriptionId) =>
      `Payment of Rs.${amount} for your Taaza Bites subscription ${subscriptionId} was successful. Your subscription is active.`,
  },
  SUBSCRIPTION_RENEWAL_REMINDER: {
    envKey: "AIRTEL_DLT_SUBSCRIPTION_RENEWAL_TEMPLATE_ID",
    messageType: "SERVICE_IMPLICIT",
    build: (name, subscriptionId, renewalDate) =>
      `Dear ${name}, your Taaza Bites subscription ${subscriptionId} is scheduled for renewal on ${renewalDate}. Please ensure your payment details are updated.`,
  },
  SUBSCRIPTION_RENEWED: {
    envKey: "AIRTEL_DLT_SUBSCRIPTION_RENEWED_TEMPLATE_ID",
    messageType: "SERVICE_IMPLICIT",
    build: (name, subscriptionId, nextDelivery) =>
      `Dear ${name}, your Taaza Bites subscription ${subscriptionId} has been renewed successfully. Your next meal delivery is scheduled for ${nextDelivery}.`,
  },
  SUBSCRIPTION_EXPIRING: {
    envKey: "AIRTEL_DLT_SUBSCRIPTION_EXPIRY_TEMPLATE_ID",
    messageType: "SERVICE_IMPLICIT",
    build: (name, subscriptionId, expiryDate) =>
      `Dear ${name}, your Taaza Bites subscription ${subscriptionId} expires on ${expiryDate}. Renew to continue receiving your meals.`,
  },
  SUBSCRIPTION_PAUSED: {
    envKey: "AIRTEL_DLT_SUBSCRIPTION_PAUSED_TEMPLATE_ID",
    messageType: "SERVICE_IMPLICIT",
    build: (name, subscriptionId, pauseFrom) =>
      `Dear ${name}, your Taaza Bites subscription ${subscriptionId} has been paused from ${pauseFrom}.`,
  },
  SUBSCRIPTION_RESUMED: {
    envKey: "AIRTEL_DLT_SUBSCRIPTION_RESUMED_TEMPLATE_ID",
    messageType: "SERVICE_IMPLICIT",
    build: (name, subscriptionId, nextDelivery) =>
      `Dear ${name}, your Taaza Bites subscription ${subscriptionId} has been resumed. Your next meal delivery is scheduled for ${nextDelivery}.`,
  },
  SUBSCRIPTION_PAYMENT_FAILED: {
    envKey: "AIRTEL_DLT_SUBSCRIPTION_PAYMENT_FAILED_TEMPLATE_ID",
    messageType: "SERVICE_IMPLICIT",
    build: (name, subscriptionId) =>
      `Dear ${name}, payment for your Taaza Bites subscription ${subscriptionId} could not be completed. Please update your payment details.`,
  },
  MEAL_DELIVERY_REMINDER: {
    envKey: "AIRTEL_DLT_MEAL_DELIVERY_REMINDER_TEMPLATE_ID",
    messageType: "SERVICE_IMPLICIT",
    build: (name, mealName, deliveryDate) =>
      `Dear ${name}, your Taaza Bites meal ${mealName} is scheduled for delivery on ${deliveryDate}. Please be available to receive your meal.`,
  },
  DAILY_MEAL_REMINDER: {
    envKey: "AIRTEL_DLT_DAILY_MEAL_REMINDER_TEMPLATE_ID",
    messageType: "SERVICE_IMPLICIT",
    build: (name, time) =>
      `Dear ${name}, your Taaza Bites meal is scheduled for delivery today at ${time}. Please be available to receive your meal.`,
  },
  DELIVERY_OTP_RESEND: {
    envKey: "AIRTEL_DLT_DELIVERY_OTP_RESEND_TEMPLATE_ID",
    messageType: "SERVICE_IMPLICIT",
    build: (otp) =>
      `Your Taaza Bites delivery verification OTP is ${otp}. Share this OTP with our delivery partner to confirm delivery. Do not share it with anyone else.`,
  },
  PROFILE_UPDATED: {
    envKey: "AIRTEL_DLT_PROFILE_UPDATED_TEMPLATE_ID",
    messageType: "SERVICE_IMPLICIT",
    build: (name) =>
      `Dear ${name}, your Taaza Bites account details have been updated successfully.`,
  },
  SECURITY_OTP: {
    envKey: "AIRTEL_DLT_SECURITY_OTP_TEMPLATE_ID",
    messageType: "SERVICE_IMPLICIT",
    build: (otp) =>
      `Your Taaza Bites verification code is ${otp}. Valid for 10 minutes. Do not share this code with anyone.`,
  },
  PROMO_GENERAL: {
    envKey: "AIRTEL_DLT_PROMO_GENERAL_TEMPLATE_ID",
    messageType: "PROMOTIONAL",
    build: (code, amount) =>
      `Taaza Bites: Enjoy fresh and healthy meals with our latest offer. Use code ${code} to get Rs.${amount} off. Terms apply.`,
  },
  PROMO_SUBSCRIPTION: {
    envKey: "AIRTEL_DLT_PROMO_SUBSCRIPTION_TEMPLATE_ID",
    messageType: "PROMOTIONAL",
    build: (code) =>
      `Taaza Bites: Get fresh healthy meals delivered with our subscription plans. Use code ${code} to enjoy our special offer. Terms apply.`,
  },
  PROMO_REORDER: {
    envKey: "AIRTEL_DLT_PROMO_REORDER_TEMPLATE_ID",
    messageType: "PROMOTIONAL",
    build: (code) =>
      `Taaza Bites: Ready for your next healthy meal? Order fresh meals today and enjoy our current offer. Use code ${code}. Terms apply.`,
  },
  PROMO_NEW_CUSTOMER: {
    envKey: "AIRTEL_DLT_PROMO_NEW_CUSTOMER_TEMPLATE_ID",
    messageType: "PROMOTIONAL",
    build: (code, amount) =>
      `Taaza Bites: Welcome offer for you! Use code ${code} to get Rs.${amount} off your order. Terms apply.`,
  },
  PROMO_RENEWAL: {
    envKey: "AIRTEL_DLT_PROMO_RENEWAL_TEMPLATE_ID",
    messageType: "PROMOTIONAL",
    build: (code) =>
      `Taaza Bites: Renew your meal subscription and enjoy our special offer. Use code ${code}. Terms apply.`,
  },
};

export type AirtelConfigStatus = {
  configured: boolean;
  loginOtpReady: boolean;
  missing: string[];
  header: string;
  baseUrl: string;
};

function env(name: string): string {
  return String(process.env[name] || "").trim();
}

export function getAirtelConfigStatus(): AirtelConfigStatus {
  const required = [
    "AIRTEL_IQ_USERNAME",
    "AIRTEL_IQ_PASSWORD",
    "AIRTEL_IQ_CUSTOMER_ID",
    "AIRTEL_DLT_ENTITY_ID",
    "AIRTEL_DLT_HEADER_ID",
    "AIRTEL_DLT_OTP_TEMPLATE_ID",
  ];
  const missing = required.filter((k) => !env(k));
  const forceLogin = env("AIRTEL_DLT_LOGIN_ENABLED").toLowerCase() === "true";
  return {
    configured: missing.length === 0,
    // Force flag lets you exercise the OTP API path in sandbox (SMS logged, not sent)
    loginOtpReady: missing.length === 0 || forceLogin,
    missing,
    header: env("AIRTEL_DLT_HEADER_ID") || "TAAZAB",
    baseUrl: env("AIRTEL_IQ_BASE_URL") || "https://iqsms.airtel.in",
  };
}

function toIndiaMsisdn(phone: string): string {
  const digits = String(phone).replace(/\D/g, "");
  const last10 = digits.slice(-10);
  if (last10.length !== 10) {
    throw new Error("INVALID_PHONE");
  }
  return `91${last10}`;
}

export function normalizePhone10(phone: string): string {
  return String(phone).replace(/\D/g, "").slice(-10);
}

export type SendSmsResult = {
  success: boolean;
  simulated?: boolean;
  messageRequestId?: string;
  error?: string;
  templateKey?: SmsTemplateKey;
};

export async function sendAirtelTemplateSms(
  templateKey: SmsTemplateKey,
  phone: string,
  vars: string[] = []
): Promise<SendSmsResult> {
  const def = TEMPLATES[templateKey];
  if (!def) {
    return { success: false, error: `Unknown template: ${templateKey}` };
  }

  const templateId = env(def.envKey);
  const entityId = env("AIRTEL_DLT_ENTITY_ID");
  const sourceAddress = env("AIRTEL_DLT_HEADER_ID") || "TAAZAB";
  const customerId = env("AIRTEL_IQ_CUSTOMER_ID");
  const username = env("AIRTEL_IQ_USERNAME");
  const password = env("AIRTEL_IQ_PASSWORD");
  const baseUrl = env("AIRTEL_IQ_BASE_URL") || "https://iqsms.airtel.in";

  const message = def.build(...vars);

  if (!templateId || !entityId || !customerId || !username || !password) {
    console.log(
      `[AIRTEL DLT SMS][SIMULATED] ${templateKey} → [REDACTED] | missing credentials or template id (${def.envKey})`
    );
    console.log(`[AIRTEL DLT SMS][SIMULATED] body: ${message}`);
    return { success: true, simulated: true, templateKey };
  }

  let destinationAddress: string;
  try {
    destinationAddress = toIndiaMsisdn(phone);
  } catch {
    return { success: false, error: "Invalid phone number", templateKey };
  }

  const authHeader = Buffer.from(`${username}:${password}`).toString("base64");
  const payload = {
    customerId,
    destinationAddress,
    dltTemplateId: templateId,
    entityId,
    message,
    messageType: def.messageType,
    sourceAddress,
    priority: templateKey === "LOGIN_OTP" || templateKey === "DELIVERY_OTP" || templateKey === "SECURITY_OTP",
  };

  try {
    const response = await fetch(`${baseUrl}/api/v1/send-sms`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const raw = await response.text();
    let data: any = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = { raw };
    }

    if (!response.ok) {
      console.error(`[AIRTEL DLT SMS] HTTP ${response.status}:`, data?.errorMessage || raw.slice(0, 300));
      return {
        success: false,
        error: data?.errorMessage || `Airtel SMS failed (${response.status})`,
        templateKey,
      };
    }

    if (data?.errorMessage) {
      console.error(`[AIRTEL DLT SMS] API error:`, data.errorMessage);
      return { success: false, error: data.errorMessage, templateKey };
    }

    console.log(
      `[AIRTEL DLT SMS] Sent ${templateKey} requestId=${data?.messageRequestId || "n/a"}`
    );
    return {
      success: true,
      messageRequestId: data?.messageRequestId,
      templateKey,
    };
  } catch (err: any) {
    console.error(`[AIRTEL DLT SMS] Exception:`, err?.message || err);
    return { success: false, error: err?.message || "SMS send failed", templateKey };
  }
}

export function generateNumericOtp(length = 6): string {
  const max = 10 ** length;
  return String(randomInt(0, max)).padStart(length, "0");
}

export { TEMPLATES };
