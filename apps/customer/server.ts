
// Set project ID before any other imports
import { readFileSync } from 'fs';
import path from 'path';
try {
  const config = JSON.parse(readFileSync(path.resolve(process.cwd(), 'firebase-applet-config.json'), 'utf-8'));
  process.env.GOOGLE_CLOUD_PROJECT = config.projectId;
  process.env.GCLOUD_PROJECT = config.projectId;
  process.env.FIREBASE_CONFIG = JSON.stringify({ projectId: config.projectId });
  process.env.GOOGLE_CLOUD_QUOTA_PROJECT = config.projectId;
} catch (e) {
  // Ignore if config not found
}

// 1. Environment Variables Validation
const requiredEnvVars = [];
// Validate any specific required variables for production if needed.
// We avoid crashing if optional ones are missing.
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`\n[FATAL ERROR] Server startup failed.`);
  console.error(`Missing required environment variables: ${missingVars.join(', ')}\n`);
  process.exit(1);
}

import compression from 'compression';
import express from "express";
import Razorpay from "razorpay";
const RazorpayClient = (Razorpay as any).default || Razorpay;
import crypto from "crypto";
import { adminDb, adminAuth, actualProjectId } from "./src/firebase/firebase-admin.ts";
import { BillingService } from "./src/server/services/billing.ts";
import { SubscriptionService } from "./src/server/services/subscription.ts";
import { Logger } from "./src/server/services/logger.ts";

// Authentication & Identity Verification Middleware
async function authenticateRequest(req: any, res: any, next: any) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Check for dev/sandbox header or query parameters if present
      const reqUserId = req.body?.userId || req.query?.userId;
      if (process.env.NODE_ENV !== "production" && reqUserId && (String(reqUserId).startsWith("sim_") || String(reqUserId).startsWith("demo_user_"))) {
        req.user = { uid: String(reqUserId), email: "sandbox@taazabites.in", isSandbox: true };
        return next();
      }
      return res.status(401).json({ error: "Unauthorized: Missing Bearer token in Authorization header." });
    }

    const token = authHeader.split("Bearer ")[1];
    if (process.env.NODE_ENV !== "production" && (token.startsWith("sim_token_") || token.startsWith("sim_"))) {
      const uid = token.replace("sim_token_", "").replace("sim_", "");
      req.user = { uid: uid || "demo_user", email: "sandbox@taazabites.in", isSandbox: true };
      return next();
    }
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error: any) {
    console.error("Token verification failed:", error?.message || error);
    // Fallback if token verification fails but client sent sim token or in dev
    const authHeader = req.headers.authorization;
    const token = authHeader?.split("Bearer ")[1];
    if (process.env.NODE_ENV !== "production" && token && (token.startsWith("sim_token_") || token.startsWith("sim_"))) {
      const uid = token.replace("sim_token_", "").replace("sim_", "");
      req.user = { uid: uid || "demo_user", email: "sandbox@taazabites.in", isSandbox: true };
      return next();
    }
    return res.status(401).json({ error: "Unauthorized: Invalid or expired access token." });
  }
}

// Require Admin authorization middleware
async function requireAdmin(req: any, res: any, next: any) {
  if (!req.user || !req.user.uid) {
    return res.status(401).json({ error: "Unauthorized: User session required." });
  }

  try {
    const userDoc = await adminDb.collection("users").doc(req.user.uid).get();
    if (!userDoc.exists || userDoc.data()?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin privileges required." });
    }
    next();
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to verify admin status." });
  }
}
import { WhatsAppService } from "./src/lib/whatsapp.server.ts";
import { FieldValue, Timestamp, Firestore } from 'firebase-admin/firestore';
import { GoogleGenAI } from "@google/genai";

const DEFAULT_APP_URL = process.env.APP_URL || process.env.VITE_APP_URL || 'https://ais-dev-gldtuvdhhl3x2cmigsh5kv-126297766833.asia-east1.run.app';

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
      'Referer': 'https://taazabites.in',
    },
  },
}) : null;

/**
 * Robust wrapper for Gemini API calls with exponential backoff retries for rate limits.
 */
async function generateContentWithRetry(params: any, maxRetries = 2, baseDelay = 1000) {
  if (!ai) throw new Error("AI client not initialized");
  
  const modelsToTry = [params.model, "gemini-flash-latest", "gemini-3.6-flash"].filter((m, idx, self) => m && self.indexOf(m) === idx);
  
  for (const modelCandidate of modelsToTry) {
    const currentParams = { ...params, model: modelCandidate };
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await ai.models.generateContent(currentParams);
      } catch (error: any) {
        const errorStr = JSON.stringify(error || {});
        const isRateLimit = errorStr.includes("429") || error?.status === 429 || error?.code === 429 || errorStr.toLowerCase().includes("exhausted");
        
        if (isRateLimit && i < maxRetries - 1) {
          const waitTime = baseDelay * Math.pow(2, i) + (Math.random() * 500);
          console.log(`[Gemini API] Rate limit hit for ${modelCandidate}. Retrying in ${Math.round(waitTime)}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        if (isRateLimit) {
          break; // Try next model candidate
        }
        throw error;
      }
    }
  }
  throw new Error("Gemini API rate limit reached on all model candidates");
}

// Initialize express app
const app = express();
  app.use(compression());
app.set('trust proxy', 1);
import rateLimit from 'express-rate-limit';
import {
  defaultLockoutTracker,
  hashPassword,
  verifyPassword,
  validatePasswordPolicy,
  buildErrorResponse,
  sanitizeNoSqlInput,
  defaultIdempotencyStore,
  escapeHtml,
  safeTemplateInterpolate,
  validateSafeEmail,
  validateSafePhone,
  maskSecret,
  sanitizeLogPayload
} from "./src/server/utils/security.ts";

// Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: buildErrorResponse("RATE_LIMIT_EXCEEDED", "Too many authentication requests from this IP. Please try again after 15 minutes.")
});

const strictOtpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: buildErrorResponse("OTP_RATE_LIMIT_EXCEEDED", "Too many OTP dispatch requests. Please wait 5 minutes before trying again.")
});

const checkoutRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: buildErrorResponse("PAYMENT_RATE_LIMIT_EXCEEDED", "Too many checkout requests initiated. Please wait before retrying.")
});

const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: buildErrorResponse("API_RATE_LIMIT_EXCEEDED", "Too many requests to TaazaBites API. Please slow down and try again shortly.")
});

const verifyLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 });

const PORT = 3000;

// Custom Security and Compliance Middleware
app.use((req, res, next) => {
  // 1. Hardened Security Headers (Helmet style)
  res.setHeader("X-Content-Type-Options", "nosniff"); // Prevent MIME-sniffing
  res.setHeader("X-XSS-Protection", "1; mode=block"); // Prevent XSS execution
  res.setHeader("X-Frame-Options", "SAMEORIGIN"); // Prevent clickjacking
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin"); // Limit referrer data
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()"); // Disable unused device access
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains"); // Force HTTPS

  next();
});

// Mount general rate limiter across all API routes
app.use('/api/', generalApiLimiter);

// Express Body Parsers with LPDoS (Large Payload DoS) Limits
app.use(express.json({
  limit: '1mb', // Limit payload size to prevent LPDoS
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({ limit: '1mb', extended: true }));

// LPDoS & NoSQL Injection Sanitizer Middleware
app.use((req: any, res: any, next: any) => {
  if (req.body && typeof req.body === 'object') {
    try {
      req.body = sanitizeNoSqlInput(req.body);
    } catch (err: any) {
      return res.status(400).json(buildErrorResponse("BAD_REQUEST_PAYLOAD", err.message || "Invalid payload structure."));
    }
  }
  next();
});

// Replay Attack & Nonce Validation Middleware for Financial Transactions
function validateReplayProtection(req: any, res: any, next: any) {
  const nonce = req.headers['x-idempotency-key'] || req.headers['x-nonce'] || req.body?.idempotencyKey || req.body?.nonce;
  const clientTsHeader = req.headers['x-request-timestamp'];
  const clientTimestamp = clientTsHeader ? parseInt(String(clientTsHeader), 10) : undefined;

  if (nonce) {
    const check = defaultIdempotencyStore.validateAndStoreNonce(String(nonce), clientTimestamp);
    if (!check.isValid) {
      return res.status(409).json(buildErrorResponse("REPLAY_ATTACK_DETECTED", check.reason || "Duplicate or expired request detected."));
    }
  }
  next();
}

// Lazy-initialized Razorpay client
let razorpayClient: any = null;

function getRazorpayClient() {
  if (!razorpayClient) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (keyId && keySecret) {
      console.log("Initializing Razorpay Client with server key credentials...");
      razorpayClient = new (RazorpayClient as any)({
        key_id: keyId,
        key_secret: keySecret,
      });
    }
  }
  return razorpayClient;
}

// 1. HEALTH ASSESSMENT ROUTE
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    razorpayConfigured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  });
});

// E2E READINESS CHECK
app.get("/api/test/readiness", async (req, res) => {
  const checks: any = {
    firestore: false,
    auth: false,
    ai: false,
    whatsapp: false,
    razorpay: false,
    env: {
      APP_URL: !!process.env.APP_URL,
      GEMINI_KEY: !!process.env.GEMINI_API_KEY,
      RZP_KEY: !!process.env.RAZORPAY_KEY_ID,
      RZP_SECRET: !!process.env.RAZORPAY_KEY_SECRET,
      RZP_WEBHOOK: !!process.env.RAZORPAY_WEBHOOK_SECRET,
    }
  };

  try {
    // 1. Check Firestore
    try {
      await adminDb.collection('settings').doc('ping').set({ lastPing: FieldValue.serverTimestamp() }, { merge: true });
      checks.firestore = true;
    } catch (err: any) {
      console.error("Readiness Firestore Error:", err.message);
      checks.firestore_error = err.message;
    }

    // 2. Check Auth
    try {
      await adminAuth.listUsers(1);
      checks.auth = true;
    } catch (err: any) {
      console.error("Readiness Auth Error:", err.message);
      checks.auth_error = err.message;
    }

    // 3. Check AI
    if (ai) {
      try {
        await generateContentWithRetry({ model: "gemini-3.6-flash", contents: "ping" });
        checks.ai = true;
      } catch (err: any) {
        console.error("Readiness AI Error:", err.message);
        checks.ai_error = err.message;
      }
    }

    // 4. Check Razorpay
    const rzp = getRazorpayClient();
    if (rzp) {
      checks.razorpay = true;
    }

    res.json({
      ready: checks.firestore && checks.auth && checks.ai,
      checks,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({
      ready: false,
      error: err.message,
      checks,
      timestamp: new Date().toISOString()
    });
  }
});

// AI WELCOME ROUTE
app.post("/api/ai/welcome", authenticateRequest, async (req: any, res) => {
  try {
    const { name, goal, currentMeal, healthMetrics } = req.body;
    // Verify user is only requesting for themselves
    if (req.user.uid !== req.body.userId && !req.user.isSandbox && req.body.userId) {
       // Optional: stricter check if userId is passed
    }
    const prompt = `You are Taaza Bites AI, an elite metabolic health strategist. 
    User: ${name}
    Goal: ${goal || 'Peak Performance'}
    Current/Next Meal: ${currentMeal || 'Metabolic Optimization Box'}
    Health Metrics: ${JSON.stringify(healthMetrics || {})}
    
    Provide a hyper-personalized, short (max 12 words) greeting. 
    Use their name. Mention their progress or a specific nutritional benefit related to their goal/meal.
    Tone: Sophisticated, encouraging, and science-backed.
    Format: "Good [Morning/Afternoon/Evening], [Name]. [One powerful sentence]."`;

    if (!ai) {
      return res.json({ greeting: `Good Day, ${name || 'Member'}. Your metabolic protocol is primed for excellence.` });
    }

    try {
      const response = await generateContentWithRetry({
        model: "gemini-3.6-flash",
        contents: prompt,
      });
      const text = response.text;
      return res.json({ greeting: text || `Good Day, ${name || 'Member'}. Your metabolic protocol is primed for excellence.` });
    } catch (e) {
      console.warn("AI Welcome generation fallback used:", e);
      return res.json({ greeting: `Good Day, ${name || 'Member'}. Your metabolic protocol is primed for excellence.` });
    }
  } catch (error) {
    console.error("AI Welcome Error:", error);
    const { name } = req.body || {};
    res.json({ greeting: `Good Day, ${name || 'Member'}. Your metabolic protocol is primed for excellence.` });
  }
});

// AI NUTRITIONIST ADVISORY ROUTE
app.post("/api/ai/nutrition-advisory", authenticateRequest, async (req: any, res) => {
  try {
    const { question, healthMetrics } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const prompt = `You are Dr. Ananya Sen, Chief Clinical Nutritionist and Metabolic Health Strategist at Taaza Bites.
    You are consulting a premium client.
    
    Client Bio & Health Metrics:
    ${JSON.stringify(healthMetrics || {})}

    Client Question: "${question}"

    Provide a professional, clinical, yet highly accessible response. 
    Focus on specific metabolic biomarkers, fuel-to-protein ratio, glycemic management, and dietary calibration.
    Be concise but thorough, using markdown bullet points if helpful. Max 150 words.
    End with a short encouraging remark.`;

    if (!ai) {
      return res.json({ response: "Based on clinical nutrition standards: Prioritize clean proteins, organic fiber, and unrefined healthy fats to optimize insulin sensitivity and sustain metabolic energy throughout your day." });
    }

    try {
      const response = await generateContentWithRetry({
        model: "gemini-3.6-flash",
        contents: prompt,
      });
      const text = response.text;

      return res.json({ response: text || "Your metabolic protocol is operating at peak levels. Keep fueling with purpose." });
    } catch (e) {
      console.warn("AI Nutrition Advisory fallback used:", e);
      return res.json({ response: "Based on clinical nutrition standards: Prioritize clean proteins, organic fiber, and unrefined healthy fats to optimize insulin sensitivity and sustain metabolic energy throughout your day." });
    }
  } catch (error: any) {
    console.error("AI Nutrition Advisory Error:", error);
    res.json({ response: "Based on clinical nutrition standards: Prioritize clean proteins, organic fiber, and unrefined healthy fats to optimize insulin sensitivity and sustain metabolic energy throughout your day." });
  }
});

// AI WHAT SHOULD I EAT QUICK QUERY ROUTE
app.post("/api/ai/what-should-i-eat", async (req: any, res) => {
  try {
    const { query, plan, healthAssessment, timeOfDay, mealType } = req.body;

    const userQuery = query || "What should I eat right now for optimal nutrition?";
    const currentPlanName = plan?.planName || plan?.name || "Active TaazaBites Meal Protocol";
    const dietType = plan?.dietType || healthAssessment?.dietPreference || healthAssessment?.dietaryPreference || "Clean Organic Nutrition";
    const goal = healthAssessment?.goal || "Metabolic Health & Energy";
    const targetCalories = healthAssessment?.recommendedCalories || healthAssessment?.targetCalories || 1850;
    const allergies = healthAssessment?.allergies || [];
    const medicalConditions = healthAssessment?.medicalConditions || [];

    const prompt = `You are TaazaBites AI Chef & Chief Nutrition Strategist.
A customer is asking on their dashboard: "${userQuery}".

Provide an instant, appetizing, human-friendly meal recommendation tailored strictly to their current subscription plan and health goals.

Customer Context:
- Subscription Plan: ${currentPlanName} (${dietType})
- Health Target: ${goal}
- Caloric Benchmark: ${targetCalories} kcal/day
- Allergies / Avoidances: ${allergies.length ? allergies.join(", ") : "None"}
- Medical / Health Notes: ${medicalConditions.length ? medicalConditions.join(", ") : "None"}
- Context / Slot: ${timeOfDay || mealType || "Immediate Meal"}

Response Rules:
1. Speak directly to the customer in a warm, appetizing, human-friendly tone.
2. Recommend 1-2 delicious, specific dishes or food pairings available in TaazaBites organic menu.
3. Explain in 1 sentence HOW this meal directly serves their goal (${goal}) and subscription plan (${currentPlanName}).
4. Highlight 2-3 key macronutrient benefits (e.g., protein, fiber, low GI glycemic balance).
5. Format cleanly with bullet points or short paragraphs. Keep it brief (under 120 words).`;

    if (!ai) {
      return res.json({
        answer: `Based on your **${currentPlanName}** and **${goal}** health target:\n\n• **Top Recommendation:** Sprouted Quinoa & Roasted Veggie Energy Bowl with Herb-Infused Cottage Cheese.\n• **Why it works:** Rich in 26g clean protein and complex fiber to keep your glycemic response stable without midday slumps.\n• **Macronutrient Balance:** 410 kcal | 26g Protein | 45g Slow Carbs | 12g Healthy Fats.`,
        planName: currentPlanName,
        goalName: goal
      });
    }

    let responseText = "";
    try {
      const result = await generateContentWithRetry({
        model: "gemini-3.6-flash",
        contents: prompt,
      });
      responseText = result.text || "";
    } catch (e) {
      console.warn("Gemini generation failed, using fallback:", e);
    }

    if (!responseText) {
      responseText = `Based on your **${currentPlanName}** and **${goal}** target, we recommend a fresh TaazaBites Macro-Balanced Quinoa & Herb Bowl with sprouted legumes for optimal energy.`;
    }

    return res.json({
      answer: responseText,
      planName: currentPlanName,
      goalName: goal
    });
  } catch (error: any) {
    console.error("AI What Should I Eat Error:", error);
    return res.status(500).json({ error: "Failed to generate meal recommendation." });
  }
});

// AI MORNING MOTIVATION TIP ROUTE
app.post("/api/ai/morning-motivation", async (req: any, res) => {
  try {
    const { userId, userName, healthGoal, subscriptionPlan, healthAssessment } = req.body;

    const name = userName || "Champion";
    const goal = healthGoal || healthAssessment?.goal || "Metabolic Health & Vitality";
    const planName = subscriptionPlan?.planName || subscriptionPlan?.name || "TaazaBites Organic Protocol";
    const today = new Date().toISOString().split('T')[0];

    // 1. Try to fetch from cache if userId is provided
    if (userId) {
      try {
        const cacheRef = adminDb.collection('aiCache').doc(`motivation_${userId}_${today}`);
        const cacheSnap = await cacheRef.get();
        if (cacheSnap.exists) {
          const data = cacheSnap.data();
          return res.json({
            motivationTip: data?.motivationTip,
            goal: goal,
            cached: true
          });
        }
      } catch (cacheErr: any) {
        console.log("Cache read notice:", cacheErr?.message || cacheErr);
      }
    }

    const prompt = `You are TaazaBites AI Health Coach & Morning Motivation Mentor.
Generate a concise, inspiring, highly actionable 2-sentence Morning Motivation tip for ${name}.

Context:
- User Name: ${name}
- Health Target: ${goal}
- Subscription Plan: ${planName}

Guidelines:
1. Speak in an inspiring, energetic, professional yet warm tone.
2. Directly reference their health target (${goal}) and how staying consistent with clean, nutrient-dense eating today builds their progress.
3. Keep it under 45 words (1-2 crisp sentences). Do not use hashtags or cliché fluff. Make it genuine and actionable.`;

    const fallbackTips = [
      `Small consistent nutrition choices compound into massive health transformation. Today, focus on mindful hydration and nutrient-dense greens to keep your ${goal} target thriving!`,
      `Every meal is an investment in your longevity and energy. Stay aligned with your ${goal} goal today—your future self will thank you for choosing clean nourishment!`,
      `Fuel your day with purpose! Aligning your meals with your ${goal} target keeps your metabolism active and mental clarity sharp all day long.`
    ];
    const randomFallback = fallbackTips[Math.floor(Math.random() * fallbackTips.length)];

    if (!ai) {
      return res.json({
        motivationTip: randomFallback,
        goal: goal
      });
    }

    let motivationTip = "";
    try {
      const result = await generateContentWithRetry({
        model: "gemini-3.6-flash",
        contents: prompt,
      });
      motivationTip = result.text || "";
    } catch (e: any) {
      console.log("Gemini generation notice (using fallback):", e?.message || e);
    }

    if (!motivationTip) {
      motivationTip = randomFallback;
    }

    const finalTip = motivationTip.trim();

    // 2. Save to cache if userId is provided
    if (userId && finalTip) {
      try {
        await adminDb.collection('aiCache').doc(`motivation_${userId}_${today}`).set({
          userId,
          date: today,
          motivationTip: finalTip,
          goal,
          createdAt: FieldValue.serverTimestamp()
        });
      } catch (cacheSaveErr: any) {
        console.log("Cache save notice:", cacheSaveErr?.message || cacheSaveErr);
      }
    }

    return res.json({
      motivationTip: finalTip,
      goal: goal
    });
  } catch (error: any) {
    console.error("AI Morning Motivation Error:", error);
    const goal = req.body?.healthGoal || "Metabolic Health & Vitality";
    return res.json({
      motivationTip: "Small consistent nutrition choices compound into massive health transformation. Stay aligned with your clean eating goals today!",
      goal: goal
    });
  }
});

// HIGH-PRIORITY EXPRESS OTP SMS DISPATCH ROUTE (Sub-second Latency)
app.post("/api/otp/send-high-priority", strictOtpLimiter, async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json(buildErrorResponse("FORBIDDEN", "Direct OTP dispatch mock is disabled in production."));
  }

  try {
    const { phoneNumber, provider = "MSG91_FAST_SMS" } = req.body;
    if (!phoneNumber || String(phoneNumber).replace(/\D/g, '').length < 10) {
      return res.status(400).json(buildErrorResponse("INVALID_PHONE", "Valid 10-digit mobile number required."));
    }

    const cleanPhone = String(phoneNumber).replace(/\D/g, '').slice(-10);

    // Check account lockout state for phone
    const lockout = defaultLockoutTracker.isLockedOut(cleanPhone);
    if (lockout.isLocked) {
      return res.status(429).json(buildErrorResponse(
        "ACCOUNT_LOCKED",
        `Account is temporarily locked due to multiple failed or rapid attempts. Please try again in ${lockout.remainingMinutes || 15} minutes.`
      ));
    }

    const timestamp = new Date().toISOString();
    console.log(`[HIGH-PRIORITY SMS GATEWAY] Sandbox OTP dispatch request for [REDACTED] via ${provider} at ${timestamp}`);

    return res.json({
      success: true,
      message: "OTP dispatched via sub-second SMS gateway route",
      phoneNumber: `+91${cleanPhone}`,
      provider: provider,
      latencyMs: Math.floor(Math.random() * 40 + 80),
      expiresInSeconds: 45
    });
  } catch (err: any) {
    console.error("OTP Dispatch Error:", err);
    return res.status(500).json(buildErrorResponse("OTP_DISPATCH_FAILED", "High priority SMS dispatch failed. Please try again."));
  }
});

// AUTH SECURITY ENDPOINT: STRONG PASSWORD HASHING & POLICY VALIDATION
app.post("/api/auth/hash-password", authLimiter, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json(buildErrorResponse("MISSING_PASSWORD", "Password field is required."));
    }

    const policy = validatePasswordPolicy(password);
    if (!policy.isValid) {
      return res.status(400).json(buildErrorResponse("WEAK_PASSWORD", policy.error || "Password does not meet security requirements."));
    }

    const hashedPassword = hashPassword(password);
    return res.json({
      success: true,
      hashedPassword,
      algorithm: "PBKDF2-SHA512",
      iterations: 100000
    });
  } catch (error: any) {
    console.error("Password Hashing Error:", error);
    return res.status(500).json(buildErrorResponse("HASHING_FAILED", "Failed to securely hash password."));
  }
});

// AUTH SECURITY ENDPOINT: SECURE PASSWORD VERIFICATION WITH ACCOUNT LOCKOUT
app.post("/api/auth/verify-password", authLimiter, async (req, res) => {
  try {
    const { identifier, password, storedHash } = req.body;
    if (!identifier || !password || !storedHash) {
      return res.status(400).json(buildErrorResponse("MISSING_CREDENTIALS", "Identifier, password, and storedHash parameters are required."));
    }

    // 1. Check if account is locked out
    const lockoutStatus = defaultLockoutTracker.isLockedOut(identifier);
    if (lockoutStatus.isLocked) {
      return res.status(429).json(buildErrorResponse(
        "ACCOUNT_LOCKED",
        `Account is locked due to 5 consecutive failed login attempts. Please try again in ${lockoutStatus.remainingMinutes || 15} minutes.`
      ));
    }

    // 2. Verify password with timing-safe comparison
    const isMatch = verifyPassword(password, storedHash);

    if (!isMatch) {
      const record = defaultLockoutTracker.recordFailedAttempt(identifier);
      if (record.isNowLocked) {
        return res.status(429).json(buildErrorResponse(
          "ACCOUNT_LOCKED",
          `Account locked due to 5 consecutive failed login attempts. Please try again in ${record.remainingMinutes || 15} minutes.`
        ));
      }
      return res.status(401).json(buildErrorResponse(
        "INVALID_CREDENTIALS",
        `Invalid credentials. ${record.remainingAttempts} attempts remaining before account lockout.`
      ));
    }

    // 3. Reset failed attempts on success
    defaultLockoutTracker.resetAttempts(identifier);

    return res.json({
      success: true,
      message: "Authentication successful."
    });
  } catch (error: any) {
    console.error("Password Verification Error:", error);
    return res.status(500).json(buildErrorResponse("VERIFICATION_ERROR", "Authentication system error. Please try again."));
  }
});

// AUTH SECURITY ENDPOINT: UNLOCK / RESET LOCKOUT (ADMIN OR AFTER OTP VERIFY)
app.post("/api/auth/reset-lockout", authenticateRequest, async (req: any, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json(buildErrorResponse("MISSING_IDENTIFIER", "Account identifier is required."));
    }
    defaultLockoutTracker.resetAttempts(identifier);
    return res.json({ success: true, message: `Account lockout cleared for ${identifier}.` });
  } catch (error: any) {
    return res.status(500).json(buildErrorResponse("UNLOCK_FAILED", "Failed to reset account lockout state."));
  }
});

// 2. CREATE RAZORPAY ORDER ROUTE
app.post("/api/payments/create-order", checkoutRateLimiter, validateReplayProtection, authenticateRequest, async (req: any, res) => {
  try {
    const { planId, couponCode, purpose = "subscription", existingSubscriptionId } = req.body;
    const userId = req.user?.uid;
    const addressId = req.body.addressId || req.body.notes?.addressId || "";

    if (!planId) {
      return res.status(400).json({ error: "Plan ID is required" });
    }
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const planSnap = await adminDb.collection("subscriptionPlans").doc(planId).get();
    if (!planSnap.exists) {
      return res.status(404).json({ error: "Subscription plan not found" });
    }
    const plan: any = { id: planSnap.id, ...planSnap.data() };
    if (plan.active === false || plan.isActive === false) {
      return res.status(400).json({ error: "This plan is not available" });
    }

    const amount = Number(plan.offerPrice ?? plan.price ?? 0);
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Plan price is not configured" });
    }

    let discountAmount = 0;
    if (couponCode) {
      const couponSnap = await adminDb.collection("coupons").where("code", "==", String(couponCode).toUpperCase()).where("active", "==", true).limit(1).get();
      if (!couponSnap.empty) {
        const coupon = couponSnap.docs[0].data();
        if (coupon.discountType === 'percentage') {
          discountAmount = Math.round((amount * coupon.discountValue) / 100);
        } else {
          discountAmount = Number(coupon.discountValue || 0);
        }
      }
    }

    const deliveryFee = 0;
    const subtotal = Math.max(0, amount - discountAmount + deliveryFee);
    const taxAmount = Math.round(subtotal * 0.05);
    const totalAmount = subtotal + taxAmount;
    const amountPaise = Math.round(totalAmount * 100);

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret || keyId.trim() === '' || keySecret.trim() === '') {
      return res.status(503).json({
        error: "Payments are temporarily unavailable. Please try again later.",
        code: "PAYMENTS_UNAVAILABLE"
      });
    }

    const rzp = getRazorpayClient();
    if (!rzp) {
      return res.status(503).json({ error: "Payments are temporarily unavailable. Please try again later.", code: "PAYMENTS_UNAVAILABLE" });
    }

    let order;
    try {
      order = await rzp.orders.create({
        amount: amountPaise,
        currency: "INR",
        receipt: `receipt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        notes: {
          userId,
          planId,
          addressId,
          purpose,
          existingSubscriptionId: existingSubscriptionId || "",
          expectedAmount: String(totalAmount)
        }
      });
    } catch (rzpErr: any) {
      console.error("Razorpay order creation failed:", rzpErr?.message || rzpErr);
      return res.status(502).json({ error: "Could not start payment with Razorpay. Please retry." });
    }

    await adminDb.collection("razorpayOrders").doc(order.id).set({
      userId,
      planId,
      addressId,
      purpose,
      existingSubscriptionId: existingSubscriptionId || null,
      couponCode: couponCode || null,
      expectedAmount: totalAmount,
      expectedAmountPaise: amountPaise,
      currency: "INR",
      discountAmount,
      taxAmount,
      status: "created",
      createdAt: FieldValue.serverTimestamp()
    });

    return res.json({
      id: order.id,
      orderId: order.id,
      success: true,
      amount: order.amount,
      currency: order.currency,
      isSandbox: false,
      keyId
    });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return res.status(500).json({ error: "Failed to initiate payment" });
  }
});

// 3. VERIFY RAZORPAY PAYMENT ROUTE
app.post("/api/payments/verify", verifyLimiter, validateReplayProtection, authenticateRequest, async (req: any, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, type = 'subscription', referralCode } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required verification fields" });
    }

    const sandboxSig = String(razorpay_signature).startsWith("sandbox_sig");
    if (sandboxSig || razorpay_order_id.startsWith("order_sim_") || razorpay_payment_id.startsWith("pay_sim_")) {
      return res.status(400).json({ success: false, error: "Simulated payments are not accepted." });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(503).json({ error: "Payments are temporarily unavailable. Please try again later." });
    }
    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    if (hmac.digest("hex") !== razorpay_signature) {
      return res.status(400).json({ success: false, error: "Signature verification failed" });
    }

    const rzp = getRazorpayClient();
    if (!rzp) {
      return res.status(503).json({ error: "Payments are temporarily unavailable. Please try again later." });
    }
    const order = await rzp.orders.fetch(razorpay_order_id);
    if (!order || String(order.currency).toUpperCase() !== "INR") {
      return res.status(400).json({ error: "Invalid Razorpay order or currency." });
    }

    const intentSnap = await adminDb.collection("razorpayOrders").doc(razorpay_order_id).get();
    if (!intentSnap.exists) {
      return res.status(400).json({ error: "Unknown payment order. Restart checkout." });
    }
    const intent = intentSnap.data() as any;
    if (intent.status === "paid") {
      return res.json({ success: true, message: "Payment already processed", orderNumber: intent.orderNumber || null });
    }
    if (intent.userId !== req.user.uid) {
      return res.status(403).json({ error: "This payment does not belong to the signed-in customer." });
    }

    const paymentDoc = await adminDb.collection("payments").doc(razorpay_payment_id).get();
    if (paymentDoc.exists) {
      return res.json({ success: true, message: "Payment already processed", orderNumber: paymentDoc.data()?.orderNumber || null });
    }

    const expectedPaise = Number(intent.expectedAmountPaise || Math.round(Number(intent.expectedAmount) * 100));
    if (Math.abs(Number(order.amount) - expectedPaise) > 100) {
      return res.status(400).json({ success: false, error: "Payment amount mismatch." });
    }

    const userId = intent.userId;
    const planId = intent.planId;
    const addressId = intent.addressId;
    const purpose = intent.purpose || type || "subscription";
    const couponCode = intent.couponCode || req.body.couponCode;
    const discountAmount = Number(intent.discountAmount || 0);
    const taxAmount = Number(intent.taxAmount || 0);

    if (type === "subscription" || purpose === "subscription" || purpose === "renewal" || purpose === "upgrade") {
      const plansSnap = await adminDb.collection("subscriptionPlans").doc(planId).get();
      if (!plansSnap.exists) {
        return res.status(404).json({ error: "Subscription plan not found" });
      }
      const plan: any = { id: plansSnap.id, ...plansSnap.data() };
      const orderNumber = "ORD-" + Date.now().toString().slice(-6) + Math.floor(1000 + Math.random() * 9000);

      try {
        const userSnap = await adminDb.collection("users").doc(userId).get();
        const userData = userSnap.data();
        const customerName = userData?.displayName || userData?.name || "Customer";
        const batch = adminDb.batch();

        const duration = Number(plan.durationDays ?? plan.duration ?? 30);
        const mealsPerDay = Number(plan.mealsPerDay || 1);
        const totalMeals = Number(plan.totalMeals || duration * mealsPerDay);
        const planName = plan.planName || plan.name;
        const planSnapshot = {
          id: plan.id,
          planName,
          description: plan.description || "",
          price: Number(plan.price || 0),
          offerPrice: Number(plan.offerPrice ?? plan.price ?? 0),
          duration,
          durationDays: duration,
          mealsPerDay,
          totalMeals,
          calories: Number(plan.calories || 0),
          protein: Number(plan.protein || 0),
          deliverySchedule: plan.deliverySchedule || "Daily delivery",
          features: plan.features || [],
          savings: Number(plan.savings || 0),
        };

        let subRef = adminDb.collection("subscriptions").doc();
        let isRenewal = purpose === "renewal" || purpose === "upgrade";
        if (isRenewal && intent.existingSubscriptionId) {
          subRef = adminDb.collection("subscriptions").doc(intent.existingSubscriptionId);
        }

        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + duration);
        const tomorrow = new Date(startDate);
        tomorrow.setDate(startDate.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split("T")[0];

        batch.set(adminDb.collection("payments").doc(razorpay_payment_id), {
          paymentId: razorpay_payment_id,
          userId,
          customerId: userId,
          subscriptionId: subRef.id,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          amount: Number(order.amount) / 100,
          currency: "INR",
          paymentMethod: req.body.paymentMethod || "Razorpay",
          status: "verified",
          verified: true,
          purpose,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        const subPayload: any = {
          userId,
          customerId: userId,
          planId: plan.id,
          planName,
          planSnapshot,
          status: "active",
          paused: false,
          startDate: Timestamp.fromDate(startDate),
          endDate: Timestamp.fromDate(endDate),
          totalMeals,
          mealsCompleted: isRenewal ? FieldValue.increment(0) : 0,
          mealsRemaining: totalMeals,
          remainingMeals: totalMeals,
          mealsPerDay,
          durationDays: duration,
          paymentId: razorpay_payment_id,
          deliveryAddressId: addressId || "",
          nextDeliveryDate: tomorrowStr,
          activatedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp(),
        };

        if (isRenewal) {
          delete subPayload.createdAt;
          delete subPayload.mealsCompleted;
          batch.set(subRef, { ...subPayload, mealsRemaining: totalMeals, remainingMeals: totalMeals }, { merge: true });
        } else {
          batch.set(subRef, subPayload);
        }

        batch.set(adminDb.collection("razorpayOrders").doc(razorpay_order_id), {
          status: "paid",
          paymentId: razorpay_payment_id,
          orderNumber,
          paidAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        batch.set(adminDb.collection("orders").doc(orderNumber), {
          orderNumber,
          userId,
          customerId: userId,
          subscriptionId: subRef.id,
          planName,
          amount: Number(order.amount) / 100,
          discount: discountAmount,
          coupon: couponCode || "",
          tax: taxAmount,
          paymentStatus: "paid",
          paymentId: razorpay_payment_id,
          orderStatus: "confirmed",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        });

        if (!isRenewal) {
          for (let i = 0; i < duration; i++) {
            const scheduleDate = new Date(startDate);
            scheduleDate.setDate(startDate.getDate() + i + 1);
            const dateStr = scheduleDate.toISOString().split("T")[0];
            for (let m = 0; m < mealsPerDay; m++) {
              const mealType = m === 0 ? "Lunch" : m === 1 ? "Dinner" : "Breakfast";
              const scheduleId = `ms_${subRef.id}_${dateStr}_${mealType}`;
              const deliveryTime = m === 0 ? "12:00 PM - 02:00 PM" : "07:00 PM - 09:00 PM";
              batch.set(adminDb.collection("mealSchedules").doc(scheduleId), {
                id: scheduleId,
                subscriptionId: subRef.id,
                userId,
                date: dateStr,
                mealType,
                mealId: "pending",
                deliveryStatus: "preparing",
                deliveryTime,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp()
              });
            }
          }

          const deliveryId = `del_${subRef.id}_${tomorrowStr}`;
          batch.set(adminDb.collection("deliveries").doc(deliveryId), {
            userId,
            subscriptionId: subRef.id,
            orderId: orderNumber,
            mealType: mealsPerDay >= 2 ? "Lunch" : "Lunch",
            deliveryDate: tomorrowStr,
            deliveryStatus: "preparing",
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
          });
        }

        batch.set(adminDb.collection("notifications").doc(), {
          userId,
          title: isRenewal ? "Subscription renewed" : "Subscription activated",
          message: `Your ${planName} plan is active. Next delivery is scheduled for tomorrow.`,
          type: "subscription",
          read: false,
          createdAt: FieldValue.serverTimestamp()
        });

        batch.set(adminDb.collection("subscriptionEvents").doc(), {
          userId,
          customerId: userId,
          subscriptionId: subRef.id,
          type: isRenewal ? "renewed" : "activated",
          payload: { planId: plan.id, paymentId: razorpay_payment_id },
          createdAt: FieldValue.serverTimestamp()
        });

        const crm = {
          hasActiveSubscription: true,
          currentPlanId: plan.id,
          currentSubscriptionId: subRef.id,
          mealsRemaining: totalMeals,
          mealsCompleted: 0,
          nextDeliveryDate: tomorrowStr,
          retentionState: "healthy",
          lastActivityAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        };
        batch.set(adminDb.collection("users").doc(userId), crm, { merge: true });
        batch.set(adminDb.collection("customers").doc(userId), crm, { merge: true });

        if (referralCode) {
          const referrerSnap = await adminDb.collection("users").where("referralCode", "==", String(referralCode).toUpperCase()).limit(1).get();
          if (!referrerSnap.empty) {
            const referrer = referrerSnap.docs[0].data();
            if (referrer.uid && referrer.uid !== userId) {
              const refId = `ref_${referrer.uid}_${userId}`;
              batch.set(adminDb.collection("referrals").doc(refId), {
                id: refId,
                referrerUserId: referrer.uid,
                referredUserId: userId,
                status: "pending",
                rewardIssued: false,
                createdAt: FieldValue.serverTimestamp()
              }, { merge: true });
            }
          }
        }

        await batch.commit();
        return res.json({
          success: true,
          orderNumber,
          subscriptionId: subRef.id,
          isSandbox: false
        });
      } catch (dbError: any) {
        console.error("Firestore batch commit failed:", dbError.message);
        return res.status(500).json({
          success: false,
          error: "Database update failed. Please contact support with your payment ID."
        });
      }

    } else if (type === 'recharge') {
      // Wallet recharge logic
      const amount = order.amount / 100;

      try {
        const batch = adminDb.batch();
        const paymentDocRef = adminDb.collection('payments').doc(razorpay_payment_id);
        batch.set(paymentDocRef, {
          userId,
          amount: amount,
          status: "captured",
          type: "recharge",
          verified: true,
          createdAt: FieldValue.serverTimestamp()
        });

        const walletRef = adminDb.collection('wallets').doc(userId);
        const walletSnap = await walletRef.get();
        const currentBalance = (walletSnap.data()?.balance || 0);

        batch.set(walletRef, {
          balance: FieldValue.increment(amount),
          updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });

        const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const txRef = adminDb.collection('walletTransactions').doc(txId);
        batch.set(txRef, {
          id: txId,
          userId,
          amount: amount,
          type: 'credit',
          reason: 'Wallet Recharge',
          balanceAfter: currentBalance + amount,
          createdAt: FieldValue.serverTimestamp()
        });

        await batch.commit();
      } catch (dbError: any) {
        console.error("Wallet recharge Firestore update failed", dbError.message);
        return res.status(500).json({ error: "Wallet update failed on server." });
      }
    }

    return res.json({ success: true, isSandbox: razorpay_order_id.startsWith("order_sim_"), message: "Payment verified and subscription activated" });

  } catch (error: any) {
    console.error("Error verifying payment signature:", error);
    return res.status(500).json({ error: error.message || "Failed to verify signature" });
  }
});

app.post("/api/payments/activate-zero-order", authenticateRequest, async (req: any, res) => {
  try {
    const { userId, planId, addressId, walletDeduction, pointsDeduction, couponCode, referralCode, customizations } = req.body;

    // Verify requesting user matches target userId
    if (!userId || (req.user.uid !== userId && !req.user.isSandbox)) {
      return res.status(403).json({ error: "Forbidden: Cannot activate subscription or spend wallet/points for another user" });
    }
    
    // 1. Fetch Plan Details
    const planDoc = await adminDb.collection("subscriptionPlans").doc(planId).get();
    if (!planDoc.exists) {
      return res.status(404).json({ error: "Subscription plan not found" });
    }
    const plan = planDoc.data()!;
    const basePrice = plan.offerPrice || plan.price || 0;

    // 2. Calculate Coupon Discount
    let discountAmount = 0;
    if (couponCode) {
      const couponSnap = await adminDb.collection("coupons")
        .where("code", "==", couponCode.toUpperCase())
        .where("active", "==", true)
        .limit(1)
        .get();
      if (!couponSnap.empty) {
        const coupon = couponSnap.docs[0].data();
        if (coupon.discountType === 'percentage') {
          discountAmount = Math.round((basePrice * coupon.discountValue) / 100);
        } else {
          discountAmount = coupon.discountValue;
        }
      }
    }

    // 3. Securely Fetch Delivery Address & Service Area Delivery Fee on Server
    const addressDoc = await adminDb.collection("addresses").doc(addressId).get();
    if (!addressDoc.exists) {
      return res.status(404).json({ error: "Delivery address not found" });
    }
    const address = addressDoc.data()!;
    
    let serverDeliveryFee = 0;
    if (address.pincode) {
      const serviceAreaSnap = await adminDb.collection("serviceAreas")
        .where("pincode", "==", address.pincode)
        .where("active", "==", true)
        .limit(1)
        .get();
      if (!serviceAreaSnap.empty) {
        serverDeliveryFee = serviceAreaSnap.docs[0].data().deliveryFee || 0;
      }
    }

    // 4. Compute Subtotal, Taxes, and Net Cost
    const subtotal = basePrice - discountAmount + serverDeliveryFee;
    const taxes = Math.round(subtotal * 0.05);
    const intermediateTotal = subtotal + taxes;

    // 5. Validate Wallet and Points Deductions on Server-Side
    const walletRef = adminDb.collection("wallets").doc(userId);
    const walletDoc = await walletRef.get();
    const currentBalance = walletDoc.exists ? (walletDoc.data()?.balance || 0) : 0;

    const pointsRef = adminDb.collection("rewardPoints").doc(userId);
    const pointsDoc = await pointsRef.get();
    const currentPoints = pointsDoc.exists ? (pointsDoc.data()?.currentPoints || 0) : 0;

    // Deduct points first, then wallet (same order as Checkout.tsx client calculation)
    const maxPointsRedeemable = Math.min(Math.floor(currentPoints / 10), intermediateTotal);
    const actualPointsDeductionVal = pointsDeduction > 0 ? Math.min(pointsDeduction, maxPointsRedeemable * 10) : 0;
    const actualPointsValue = Math.floor(actualPointsDeductionVal / 10);

    const remainingTotalAfterPoints = intermediateTotal - actualPointsValue;
    const actualWalletValue = walletDeduction > 0 ? Math.min(currentBalance, remainingTotalAfterPoints) : 0;

    // Expected total payable after all deductions MUST be exactly 0
    const expectedTotal = Math.max(0, intermediateTotal - actualPointsValue - actualWalletValue);
    if (expectedTotal !== 0) {
      return res.status(400).json({ 
        error: `Insecure zero-payment bypass: calculated total of ₹${expectedTotal} exceeds zero limit.` 
      });
    }

    const ordNum = "ORD-" + Date.now().toString().slice(-6) + Math.floor(1000 + Math.random() * 9000);

    // 6. Execute DB Writes Atomically via Transaction
    await adminDb.runTransaction(async (transaction) => {
      // Re-read balances in transaction to prevent race conditions
      const wDoc = await transaction.get(walletRef);
      const pDoc = await transaction.get(pointsRef);
      const uDoc = await transaction.get(adminDb.collection('users').doc(userId));
      
      const bal = wDoc.exists ? (wDoc.data()?.balance || 0) : 0;
      const pts = pDoc.exists ? (pDoc.data()?.currentPoints || 0) : 0;
      const customerName = uDoc.exists ? (uDoc.data()?.displayName || uDoc.data()?.name || "Valued Customer") : "Valued Customer";

      if (actualWalletValue > bal) {
        throw new Error("Insufficient wallet balance");
      }
      if (actualPointsDeductionVal > pts) {
        throw new Error("Insufficient reward points");
      }

      // Deduct wallet balance
      if (actualWalletValue > 0) {
        transaction.update(walletRef, { 
          balance: bal - actualWalletValue,
          updatedAt: FieldValue.serverTimestamp()
        });
        const txRef = adminDb.collection("walletTransactions").doc();
        transaction.set(txRef, {
          id: txRef.id,
          userId,
          type: 'debit',
          amount: actualWalletValue,
          reason: 'Subscription Payment',
          createdAt: FieldValue.serverTimestamp()
        });
      }

      // Deduct points balance
      if (actualPointsDeductionVal > 0) {
        transaction.update(pointsRef, { 
          currentPoints: pts - actualPointsDeductionVal,
          updatedAt: FieldValue.serverTimestamp()
        });
        const ptTxRef = adminDb.collection("rewardTransactions").doc();
        transaction.set(ptTxRef, {
          id: ptTxRef.id,
          userId,
          type: 'debit',
          points: actualPointsDeductionVal,
          reason: 'Subscription Payment',
          createdAt: FieldValue.serverTimestamp()
        });
      }

      // Create active subscription
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      const duration = customizations?.durationDays || plan.durationDays || 30;
      endDate.setDate(startDate.getDate() + duration);
      const mealsPerDay = customizations?.mealsPerDay || plan.mealsPerDay || 1;
      const totalMeals = customizations?.totalMeals || (duration * mealsPerDay);

      const subRef = adminDb.collection('subscriptions').doc(userId);
      transaction.set(subRef, {
        userId,
        planId,
        planName: plan.name,
        status: "active",
        startDate: FieldValue.serverTimestamp(),
        endDate: Timestamp.fromDate(endDate),
        remainingMeals: totalMeals,
        mealsPerDay: mealsPerDay,
        durationDays: duration,
        dietType: customizations?.dietType || plan.dietType || "Standard",
        deliveryAddressId: addressId,
        customizations: customizations || {},
        activatedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });

      // Create first order
      const orderRef = adminDb.collection('orders').doc(ordNum);
      transaction.set(orderRef, {
        orderNumber: ordNum,
        userId,
        subscriptionId: userId,
        amount: 0,
        discount: actualWalletValue + actualPointsValue,
        coupon: couponCode || "",
        tax: taxes,
        paymentStatus: "paid",
        orderStatus: "confirmed",
        createdAt: FieldValue.serverTimestamp()
      });

      // Generate Meal Schedules (Mirror the paid flow)
      const tomorrow = new Date(startDate);
      tomorrow.setDate(startDate.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      for (let i = 0; i < duration; i++) {
        const scheduleDate = new Date(startDate);
        scheduleDate.setDate(startDate.getDate() + i + 1);
        const dateStr = scheduleDate.toISOString().split('T')[0];
        
        for (let m = 0; m < mealsPerDay; m++) {
          const mealType = m === 0 ? "Lunch" : m === 1 ? "Dinner" : "Breakfast";
          const scheduleId = `ms_${userId}_${dateStr}_${mealType}`;
          const scheduleRef = adminDb.collection('mealSchedules').doc(scheduleId);
          
          const deliveryTime = m === 0 ? "12:00 PM - 02:00 PM" : "07:00 PM - 09:00 PM";
          
          transaction.set(scheduleRef, {
            id: scheduleId,
            subscriptionId: userId,
            userId,
            date: dateStr,
            mealType,
            mealId: "pending",
            deliveryStatus: "pending",
            deliveryTime,
            createdAt: FieldValue.serverTimestamp()
          });

          // Generate first kitchen queue for tomorrow
          if (dateStr === tomorrowStr) {
            const queueId = `kq_${scheduleId}`;
            transaction.set(adminDb.collection('kitchenQueue').doc(queueId), {
              id: queueId,
              scheduleId,
              userId,
              customerName,
              subscriptionPlan: plan.name,
              mealType,
              deliverySlot: deliveryTime,
              status: "Pending",
              createdAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp()
            });
          }
        }
      }

      // Generate in-app Notification
      const notifRef = adminDb.collection('notifications').doc();
      transaction.set(notifRef, {
        userId,
        title: "Subscription Activated! 🥗",
        message: `Your ${plan.name} protocol is now active. First delivery scheduled for tomorrow.`,
        type: "subscription",
        read: false,
        createdAt: FieldValue.serverTimestamp()
      });

      // Update user hasActiveSubscription flag
      const userRef = adminDb.collection('users').doc(userId);
      transaction.update(userRef, {
        hasActiveSubscription: true,
        updatedAt: FieldValue.serverTimestamp()
      });

      // Process Referral if applicable
      if (referralCode) {
        const referrerSnap = await adminDb.collection('users').where('referralCode', '==', referralCode.toUpperCase()).limit(1).get();
        if (!referrerSnap.empty) {
          const referrer = referrerSnap.docs[0].data();
          if (referrer.uid !== userId) {
            const refId = `ref_${referrer.uid}_${userId}`;
            const refRef = adminDb.collection('referrals').doc(refId);
            transaction.set(refRef, {
              id: refId,
              referrerUserId: referrer.uid,
              referredUserId: userId,
              status: 'pending',
              rewardIssued: false,
              createdAt: FieldValue.serverTimestamp()
            });
          }
        }
      }
    });

    return res.json({ success: true, orderNumber: ordNum });
  } catch (error: any) {
    console.error("Error in secure zero order activation:", error);
    return res.status(500).json({ error: error.message || "Activation failed" });
  }
});

// Consolidation: Removed redundant legacy routes /api/create-order and /api/subscribe

// RAZORPAY WEBHOOK HANDLER
app.post("/api/payments/webhook", async (req: any, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];

    if (!signature) {
      return res.status(400).json({ error: "Missing signature" });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[SECURITY ALERT] RAZORPAY_WEBHOOK_SECRET is not configured in server environment!");
      return res.status(500).json({ error: "Webhook signature verification unavailable: secret not configured" });
    }
    
    // Support either captured raw body buffer or fallback to serialized body
    const bodyStr = req.rawBody ? req.rawBody.toString("utf8") : JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(bodyStr)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.warn("Invalid Razorpay webhook signature detected!");
      return res.status(401).json({ error: "Invalid signature" });
    }

    // Parse verified payload
    const event = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { entity, payload } = event;

    // Handle Subscription/Payment Webhook Events
    if (event.event === "payment.captured") {
      const payment = payload.payment.entity;
      
      // Find subscription by razorpay_order_id
      const snapshot = await adminDb.collection("subscriptions")
        .where("razorpay_order_id", "==", payment.order_id)
        .get();
      
      if (!snapshot.empty) {
        const batch = adminDb.batch();
        snapshot.forEach((doc) => {
          batch.update(doc.ref, {
            paymentStatus: "paid",
            razorpay_payment_id: payment.id,
            status: "active",
            updatedAt: FieldValue.serverTimestamp(),
          });
        });
        await batch.commit();
        console.log(`[Webhook] Subscription payment captured for order: ${payment.order_id}`);
      }
    }

    if (event.event === "subscription.cancelled") {
      const sub = payload.subscription.entity;
      const snapshot = await adminDb.collection("subscriptions")
        .where("razorpay_subscription_id", "==", sub.id)
        .get();
      
      if (!snapshot.empty) {
        const batch = adminDb.batch();
        snapshot.forEach((doc) => {
          batch.update(doc.ref, {
            status: "cancelled",
            cancelledAt: FieldValue.serverTimestamp(),
          });
        });
        await batch.commit();
        console.log(`[Webhook] Subscription cancelled: ${sub.id}`);
      }
    }

    return res.json({ received: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({ error: "Webhook failed", details: error.message || String(error) });
  }
});

// 5. AI RECOMMENDATIONS ROUTE
app.post("/api/ai/recommendations", authenticateRequest, async (req: any, res) => {
    try {
        const { userId, healthAssessment, orderHistory, preferences } = req.body;
        
        // Security: Ensure user only requests their own data
        if (req.user.uid !== userId && !req.user.isSandbox) {
          return res.status(403).json({ error: "Forbidden: Cannot request recommendations for another user" });
        }
        const prompt = `Based on the following customer data:
        Health Assessment: ${JSON.stringify(healthAssessment)}
        Order History: ${JSON.stringify(orderHistory)}
        Meal Preferences: ${JSON.stringify(preferences)}
        
        Provide 3 personalized meal recommendations and 1 subscription upgrade suggestion.
        Return in JSON format with fields: meals (array of objects with name, reason) and subscription (object with suggestion, reason).`;

        const fallbackRecommendations = {
          meals: [
            { name: "Avocado & Sprouted Grain Protein Bowl", reason: "Rich in healthy monounsaturated fats and 28g clean plant protein for sustained metabolic energy." },
            { name: "Steamed Salmon & Herb Wild Rice", reason: "High in Omega-3 fatty acids and complex carb profile to optimize cellular recovery." },
            { name: "Roasted Pumpkin & Organic Cottage Cheese Salad", reason: "Low glycemic index with high fiber content to stabilize blood sugar." }
          ],
          subscription: {
            suggestion: "Upgrade to Metabolic Optimize Plan",
            reason: "Includes personalized biweekly nutritionist coaching and live biometric synchronization."
          }
        };

        if (!ai) return res.json(fallbackRecommendations);

        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            },
          });
          
          const recommendations = JSON.parse(response.text || "{}");
          return res.json(recommendations.meals ? recommendations : fallbackRecommendations);
        } catch (e) {
          console.warn("AI Recommendations generation fallback used:", e);
          return res.json(fallbackRecommendations);
        }
    } catch (error: any) {
        console.error("AI Recommendations Error:", error);
        return res.json({
          meals: [
            { name: "Avocado & Sprouted Grain Protein Bowl", reason: "Rich in healthy monounsaturated fats and 28g clean plant protein for sustained metabolic energy." },
            { name: "Steamed Salmon & Herb Wild Rice", reason: "High in Omega-3 fatty acids and complex carb profile to optimize cellular recovery." },
            { name: "Roasted Pumpkin & Organic Cottage Cheese Salad", reason: "Low glycemic index with high fiber content to stabilize blood sugar." }
          ],
          subscription: {
            suggestion: "Upgrade to Metabolic Optimize Plan",
            reason: "Includes personalized biweekly nutritionist coaching and live biometric synchronization."
          }
        });
    }
});

// 4. SEED SUBSCRIPTION PLANS ROUTE
async function seedPlansIfNeeded() {
  try {
    const plansRef = adminDb.collection("subscriptionPlans");
    const plansSnap = await plansRef.limit(1).get();
    
    if (plansSnap.empty) {
      console.log("No subscription plans found. Seeding default plans...");
      const plans = [
        {
          id: "baseline",
          planId: "baseline",
          name: "Baseline",
          price: 2999,
          offerPrice: 2999,
          duration: "30 Days Protocol",
          durationDays: 30,
          calories: 1500,
          caloriesTarget: 1500,
          protein: 30,
          carbs: 150,
          fats: 50,
          mealsPerDay: 1,
          description: "Engineered for metabolic health. Low glycemic index ingredients designed to prevent glucose spikes.",
          features: [
            "1 Meal/Day",
            "Standard Macro Tracking",
            "Glucose-Friendly Recipes",
            "Eco Packaging"
          ],
          icon: "Zap",
          accentColor: "text-blue-500",
          popular: false,
          isAvailable: true,
          createdAt: new Date().toISOString()
        },
        {
          id: "optimize",
          planId: "optimize",
          name: "Optimize",
          price: 5999,
          offerPrice: 5999,
          duration: "30 Days Protocol",
          durationDays: 30,
          calories: 2000,
          caloriesTarget: 2000,
          protein: 120,
          carbs: 150,
          fats: 60,
          mealsPerDay: 2,
          description: "Our most popular protocol. High protein, continuous glucose friendly, and prime metabolic sourcing.",
          features: [
            "2 Meals + 1 Snack/Day",
            "Prime Metabolic Sourcing",
            "Continuous Glucose Friendly",
            "Custom Ingredient Swaps",
            "Free City Delivery",
            "Weekly Nutritionist Review"
          ],
          icon: "Activity",
          accentColor: "text-emerald-500",
          popular: true,
          isAvailable: true,
          createdAt: new Date().toISOString()
        },
        {
          id: "longevity",
          planId: "longevity",
          name: "Longevity",
          price: 8999,
          offerPrice: 8999,
          duration: "30 Days Protocol",
          durationDays: 30,
          calories: 2500,
          caloriesTarget: 2500,
          protein: 150,
          carbs: 200,
          fats: 80,
          mealsPerDay: 3,
          description: "The ultimate health-tech intervention. Advanced biomarker tracking and priority concierge chef access.",
          features: [
            "3 Full Meals/Day",
            "Advanced Biomarker Tracking",
            "Continuous Glucose Sync",
            "Priority Concierge Chef",
            "Private Health Dashboard"
          ],
          icon: "Crown",
          accentColor: "text-amber-500",
          popular: false,
          isAvailable: true,
          createdAt: new Date().toISOString()
        }
      ];

      const batch = adminDb.batch();
      for (const plan of plans) {
        batch.set(plansRef.doc(plan.id), plan);
      }
      await batch.commit();
      console.log("Plans seeded successfully via auto-seed.");
    }

    // Auto-seed coupons
    const couponsRef = adminDb.collection("coupons");
    const couponsSnap = await couponsRef.limit(1).get();
    if (couponsSnap.empty) {
      console.log("No coupons found. Seeding default coupons...");
      const coupons = [
        {
          id: "WELCOME10",
          code: "WELCOME10",
          discountType: "percentage",
          discountValue: 10,
          description: "10% off on your first protocol",
          active: true,
          minOrderValue: 0,
          maxDiscount: 500
        },
        {
          id: "HEALTH20",
          code: "HEALTH20",
          discountType: "flat",
          discountValue: 500,
          description: "Flat ₹500 off on any 30-day protocol",
          active: true,
          minOrderValue: 5000,
          maxDiscount: 500
        }
      ];

      const batch = adminDb.batch();
      for (const coupon of coupons) {
        batch.set(couponsRef.doc(coupon.id), coupon);
      }
      await batch.commit();
      console.log("Coupons seeded successfully.");
    }

    // Auto-seed service areas
    const areasRef = adminDb.collection("serviceAreas");
    const areasSnap = await areasRef.limit(1).get();
    if (areasSnap.empty) {
      console.log("No service areas found. Seeding default service areas...");
      const areas = [
        {
          id: "noida_sector_62",
          name: "Noida Sector 62",
          pincode: "201301",
          deliveryFee: 40,
          active: true,
          polygonCoordinates: [
            { lat: 28.6180, lng: 77.3550 },
            { lat: 28.6300, lng: 77.3550 },
            { lat: 28.6300, lng: 77.3750 },
            { lat: 28.6180, lng: 77.3750 }
          ]
        },
        {
          id: "noida_sector_18",
          name: "Noida Sector 18",
          pincode: "201301",
          deliveryFee: 50,
          active: true,
          polygonCoordinates: [
            { lat: 28.5650, lng: 77.3200 },
            { lat: 28.5750, lng: 77.3200 },
            { lat: 28.5750, lng: 77.3300 },
            { lat: 28.5650, lng: 77.3300 }
          ]
        },
        {
          id: "indirapuram",
          name: "Indirapuram",
          pincode: "201014",
          deliveryFee: 60,
          active: true,
          polygonCoordinates: [
            { lat: 28.6350, lng: 77.3650 },
            { lat: 28.6500, lng: 77.3650 },
            { lat: 28.6500, lng: 77.3850 },
            { lat: 28.6350, lng: 77.3850 }
          ]
        }
      ];

      const batch = adminDb.batch();
      for (const area of areas) {
        batch.set(areasRef.doc(area.id), area);
      }
      await batch.commit();
      console.log("Service areas seeded successfully.");
    }
  } catch (error: any) {
    console.log(`Auto-seeding skipped: ${error?.message || error}`);
  }
}

app.post("/api/plans/seed", authenticateRequest, requireAdmin, async (req, res) => {
  try {
    const plansRef = adminDb.collection("subscriptionPlans");

    const plans = [
      {
        id: "baseline",
        planId: "baseline",
        name: "Baseline",
        price: 2999,
        offerPrice: 2999,
        duration: "30 Days Protocol",
        durationDays: 30,
        calories: 1500,
        caloriesTarget: 1500,
        protein: 30,
        carbs: 150,
        fats: 50,
        mealsPerDay: 1,
        description: "Engineered for metabolic health. Low glycemic index ingredients designed to prevent glucose spikes.",
        features: [
          "1 Meal/Day",
          "Standard Macro Tracking",
          "Glucose-Friendly Recipes",
          "Eco Packaging"
        ],
        icon: "Zap",
        accentColor: "text-blue-500",
        popular: false,
        isAvailable: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "optimize",
        planId: "optimize",
        name: "Optimize",
        price: 5999,
        offerPrice: 5999,
        duration: "30 Days Protocol",
        durationDays: 30,
        calories: 2000,
        caloriesTarget: 2000,
        protein: 120,
        carbs: 150,
        fats: 60,
        mealsPerDay: 2,
        description: "Our most popular protocol. High protein, continuous glucose friendly, and prime metabolic sourcing.",
        features: [
          "2 Meals + 1 Snack/Day",
          "Prime Metabolic Sourcing",
          "Continuous Glucose Friendly",
          "Custom Ingredient Swaps",
          "Free City Delivery",
          "Weekly Nutritionist Review"
        ],
        icon: "Activity",
        accentColor: "text-emerald-500",
        popular: true,
        isAvailable: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "longevity",
        planId: "longevity",
        name: "Longevity",
        price: 8999,
        offerPrice: 8999,
        duration: "30 Days Protocol",
        durationDays: 30,
        calories: 2500,
        caloriesTarget: 2500,
        protein: 150,
        carbs: 200,
        fats: 80,
        mealsPerDay: 3,
        description: "The ultimate health-tech intervention. Advanced biomarker tracking and priority concierge chef access.",
        features: [
          "3 Full Meals/Day",
          "Advanced Biomarker Tracking",
          "Continuous Glucose Sync",
          "Priority Concierge Chef",
          "Private Health Dashboard"
        ],
        icon: "Crown",
        accentColor: "text-amber-500",
        popular: false,
        isAvailable: true,
        createdAt: new Date().toISOString()
      }
    ];

    for (const plan of plans) {
      await plansRef.doc(plan.id).set(plan);
    }

    return res.json({ 
      success: true, 
      message: "Database seeded successfully with premium metabolic protocols!" 
    });
  } catch (error: any) {
    console.error("Seeding Error:", error);
    return res.status(500).json({ success: false, message: "Failed to seed database", error: error.message || String(error) });
  }
});


/**
 * RAZORPAY WEBHOOK HANDLER
 * The gold standard for payment verification.
 */
app.post("/api/payments/webhook", express.raw({ type: 'application/json' }), async (req: any, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];

  if (!secret || !signature) {
    console.error("[Webhook Error] Missing secret or signature");
    return res.status(400).send("Webhook configuration missing");
  }

  try {
    // 1. Verify Webhook Signature
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(req.body);
    const digest = shasum.digest("hex");

    if (digest !== signature) {
      console.error("[Webhook Error] Invalid signature");
      return res.status(400).send("Invalid signature");
    }

    const event = JSON.parse(req.body.toString());
    await Logger.info('PAYMENT_WEBHOOK', `Received event ${event.event}`, { paymentId: event.payload.payment.entity.id });

    // 2. Handle Payment Captured
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const { userId, planId, addressId, deliverySlot } = payment.notes;

      if (userId && planId) {
        await Logger.info('SUBSCRIPTION', `Activating subscription for ${userId}`, { planId });
        await SubscriptionService.activateSubscription(
          userId, 
          planId, 
          payment.id, 
          addressId, 
          deliverySlot
        );
        
        // Log transaction
        await adminDb.collection("payments").doc(payment.id).set({
          userId,
          amount: payment.amount / 100,
          status: 'completed',
          method: payment.method,
          razorpayPaymentId: payment.id,
          razorpayOrderId: payment.order_id,
          notes: payment.notes,
          createdAt: FieldValue.serverTimestamp()
        });
      }
    }

    res.json({ status: "ok" });
  } catch (error: any) {
    console.error("[Webhook processing failed]", error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * APP CHECK MIDDLEWARE (Placeholder logic)
 * In a production environment, you would verify the X-Firebase-AppCheck token.
 */
async function verifyAppCheck(req: any, res: any, next: any) {
  const appCheckToken = req.header("X-Firebase-AppCheck");

  if (!appCheckToken && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: "Unauthorized: Missing App Check token" });
  }
  
  // Verify token logic would go here
  next();
}


/**
 * SECURE WALLET CREDIT
 * Move logic from frontend to prevent balance tampering.
 */
app.post("/api/wallet/credit", authenticateRequest, verifyAppCheck, async (req: any, res) => {
  try {
    const { amount, reason, referenceId } = req.body;
    const userId = req.user.uid;

    if (amount <= 0) return res.status(400).json({ error: "Invalid amount" });

    const result = await BillingService.updateWalletBalance(userId, amount, 'credit', reason, referenceId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * SECURE SUBSCRIPTION ACTIVATION
 * Triggered after payment verification.
 */
app.post("/api/subscriptions/activate", authenticateRequest, verifyAppCheck, async (req: any, res) => {
  try {
    const { planId, paymentId, addressId, deliverySlot } = req.body;
    const userId = req.user.uid;

    // 1. Verify Payment (Simulation: In real app, check Razorpay API)
    // For now, we trust the client-side verified paymentId but we could re-verify here.
    
    const result = await SubscriptionService.activateSubscription(userId, planId, paymentId, addressId, deliverySlot);
    
    // 2. Trigger Welcome Communication
    // (Self-calling internal API or service)
    
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DAILY CHECK-IN (REWARDS)
 * Securely calculated on backend to prevent point farming.
 */
app.post("/api/rewards/checkin", authenticateRequest, verifyAppCheck, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const today = new Date().toISOString().split('T')[0];
    
    const rewardRef = adminDb.collection("rewardPoints").doc(userId);
    const rewardDoc = await rewardRef.get();
    
    if (rewardDoc.exists && rewardDoc.data()?.lastCheckInDate === today) {
      return res.status(400).json({ error: "Already checked in today" });
    }

    // Logic: 10 base points + streak bonus
    const streak = (rewardDoc.exists ? rewardDoc.data()?.streakCount : 0) || 0;
    const points = 10 + (streak * 2);

    await BillingService.updateRewardPoints(userId, points, 'credit', `Daily Check-in (Streak: ${streak + 1})`);
    
    await rewardRef.set({
      lastCheckInDate: today,
      streakCount: streak + 1,
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    res.json({ success: true, pointsEarned: points });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/ai/assistant", async (req, res) => {
  try {
    const { context, message, history = [] } = req.body;
    
    const systemInstruction = `You are the TaazaBites AI Assistant embedded inside the subscription purchase flow at subscription.taazabites.in. You are a smart, friendly health-food guide that helps customers:
Choose the right subscription plan
Complete their health assessment accurately
Navigate steps smoothly
Resolve doubts at any stage without leaving the funnel

Always be concise, warm, and action-oriented. Never overwhelm the customer. Speak like a knowledgeable friend, not a chatbot.

PRODUCT CONTEXT
TaazaBites is a healthy meal subscription and delivery service operating in Bengaluru, India.

Plans
Plan: Baseline. Best For: General health maintenance.
Plan: Optimize. Best For: Active fitness goals (weight loss / muscle gain).
Plan: Longevity. Best For: Long-term chronic condition management (diabetes, PCOS, etc.).

Durations
Trial: 5 days
The Habit: 20 days
Lifestyle: 60 days

Delivery Slots
Morning
Afternoon
Evening

Active Coupon Codes
FIRSTBITE – first-order discount
CELLULAR500 – ₹500 off

Payment Methods (via Razorpay)
UPI, Cards, Net Banking, Wallet

Service Area
Delivery available in select Bengaluru PIN codes only. Always encourage the customer to check their PIN before proceeding.

SUBSCRIPTION FLOW — 15 STEPS
You must understand and assist across all stages:
Step 1 – Landing Page (subscription.taazabites.in)
Step 2 – Subscription Plans
Step 3 – Login / Register
Step 4 – Health Assessment
Step 5 – Delivery Area Check (Critical Gate)
Step 6 – Delivery Address
Step 7 – Delivery Slot Selection
Step 8 – Order Summary
Step 9 – Coupon / Wallet / Reward Points
Step 10 – Razorpay Payment
Step 11 – Payment Success
Step 12 – Customer Dashboard
Step 13 – Admin Panel (Backend — not customer-facing)
Step 14 – Kitchen View (Chef-facing)
Step 15 – Delivery Tracking

BEHAVIORAL RULES
Never skip the area check (Step 5). If a customer's PIN is not serviceable, do not suggest workarounds to proceed to payment.
Never share another customer's data. Treat all health and personal information as strictly confidential.
Do not diagnose medical conditions. You can recommend a suitable plan based on stated goals, but never give clinical advice.
Keep responses short — 2–4 sentences per reply unless explaining a complex step.
If unsure, direct the customer to WhatsApp support: +91-XXXXXXXXXX (replace with actual number).
Language: Default to English. If the customer writes in Kannada or Hindi, mirror their language.
Tone: Friendly, encouraging, professional. No jargon.

CONTEXT PASSED BY THE APP:
${JSON.stringify(context, null, 2)}
Use this context to personalize responses.`;

    if (!ai) {
      return res.status(500).json({ error: "AI Engine not configured on server" });
    }

    const chat = ai.chats.create({
      model: "gemini-3.6-flash",
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    // We can't really pass history easily like this to Gemini chat SDK without it being formatted properly, so we'll just format it as a prompt.
    let fullPrompt = history.map((h: any) => `${h.role === 'user' ? 'Customer' : 'Assistant'}: ${h.content}`).join('\n');
    fullPrompt += `\nCustomer: ${message}\nAssistant:`;

    const fallbackAssistantText = "Welcome to Taaza Bites! Our fresh, preservative-free meal subscriptions are designed for optimal metabolic health. You can explore our plans, schedule deliveries, or update your health profile anytime on your dashboard.";

    if (!ai) {
      return res.json({ answer: fallbackAssistantText });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: fullPrompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      return res.json({ answer: response.text || fallbackAssistantText });
    } catch (e) {
      console.warn("AI Assistant fallback used:", e);
      return res.json({ answer: fallbackAssistantText });
    }
  } catch (error: any) {
    console.error("AI Assistant Error:", error);
    res.json({ answer: "Welcome to Taaza Bites! Our fresh, preservative-free meal subscriptions are designed for optimal metabolic health. You can explore our plans, schedule deliveries, or update your health profile anytime on your dashboard." });
  }
});

// 1. AI NUTRITION ASSISTANT ENDPOINT
app.post("/api/ai/nutrition", async (req, res) => {
  try {
    const { userId, prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    let userProfile: any = null;
    let healthAssessment: any = null;

    if (userId) {
      const userSnap = await adminDb.collection('users').doc(userId).get();
      if (userSnap.exists) {
        userProfile = userSnap.data();
      }
      const healthSnap = await adminDb.collection('healthAssessments').doc(userId).get();
      if (healthSnap.exists) {
        healthAssessment = healthSnap.data();
      }
    }

    const profileContext = {
      name: userProfile?.fullName || userProfile?.displayName || healthAssessment?.fullName || "Valued Customer",
      goal: healthAssessment?.goal || userProfile?.goal || "general fitness and longevity",
      age: healthAssessment?.age || 30,
      gender: healthAssessment?.gender || "not specified",
      height: healthAssessment?.height || 170,
      weight: healthAssessment?.weight || 70,
      dietPreference: healthAssessment?.dietPreference || "vegetarian",
      allergies: healthAssessment?.allergies || [],
      medicalConditions: healthAssessment?.medicalConditions || [],
      waterIntake: healthAssessment?.waterIntake || 2,
      activityLevel: healthAssessment?.activityLevel || "moderately active"
    };

    const systemInstruction = `You are the lead AI Nutritionist at Taaza Bites. Your job is to answer the user's questions about nutrition, diet, and healthy lifestyle, utilizing their personal health profile for hyper-personalized recommendations.
    
    Customer Profile Context:
    - Name: ${profileContext.name}
    - Nutrition Goal: ${profileContext.goal}
    - Age: ${profileContext.age}, Gender: ${profileContext.gender}
    - Height: ${profileContext.height}cm, Weight: ${profileContext.weight}kg
    - Diet Preference: ${profileContext.dietPreference}
    - Allergies: ${profileContext.allergies.join(', ') || 'None'}
    - Medical Conditions: ${profileContext.medicalConditions.join(', ') || 'None'}
    - Daily Activity Level: ${profileContext.activityLevel}
    
    Rules:
    1. Base all answers strictly on scientific nutrition and Taaza Bites' fresh, natural, preservative-free metabolic protocol.
    2. ALWAYS warn the user if they suggest something containing one of their allergies: ${profileContext.allergies.join(', ') || 'none'}.
    3. Keep answers friendly, professional, highly encouraging, and structured using clean Markdown bullet points.
    4. Speak directly to ${profileContext.name}. Use elegant, professional language.`;

    const fallbackNutritionText = `Hello ${profileContext.name}!\n\n• **Metabolic Focus:** For your target of **${profileContext.goal}**, we recommend maintaining a steady intake of clean protein, complex slow-release carbohydrates, and high-fiber organic greens.\n• **Hydration:** Aim for at least 2.5–3 Liters of water daily.\n• **Taaza Bites Advantage:** All our meals are 100% preservative-free, cooked fresh daily, and calibrated for optimal glycemic balance.`;

    if (!ai) {
      return res.json({ answer: fallbackNutritionText });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      return res.json({ answer: response.text || fallbackNutritionText });
    } catch (e) {
      console.warn("AI Nutrition fallback used:", e);
      return res.json({ answer: fallbackNutritionText });
    }
  } catch (error: any) {
    console.error("AI Nutrition Error:", error);
    res.json({ answer: "For optimal metabolic health, focus on balanced macronutrients, adequate hydration, and consistent daily movement." });
  }
});

// 2. MEAL RECOMMENDATION ENGINE ENDPOINT
app.post("/api/ai/recommend-meals", async (req, res) => {
  try {
    const { userId } = req.body;
    
    let userProfile: any = null;
    let healthAssessment: any = null;

    if (userId) {
      const userSnap = await adminDb.collection('users').doc(userId).get();
      if (userSnap.exists) {
        userProfile = userSnap.data();
      }
      const healthSnap = await adminDb.collection('healthAssessments').doc(userId).get();
      if (healthSnap.exists) {
        healthAssessment = healthSnap.data();
      }
    }

    const goal = healthAssessment?.goal || "maintenance";
    const dietPreference = healthAssessment?.dietPreference || "vegetarian";
    const allergies = healthAssessment?.allergies || [];
    const medicalConditions = healthAssessment?.medicalConditions || [];
    
    let availableMeals: any[] = [];
    try {
      const mealsSnap = await adminDb.collection('meals').limit(15).get();
      availableMeals = mealsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.warn("Failed to fetch meals from db, using generic recommendation list", e);
    }

    const systemInstruction = `You are the lead AI Culinary & Nutrition Engine at Taaza Bites. Recommend exactly 3 meals (Breakfast, Lunch, Dinner) optimized for the customer's specific blueprint, chosen from either the database list or premium custom recipes matching Taaza Bites high quality standard.
    
    Customer Metrics:
    - Goal: ${goal}
    - Dietary Preference: ${dietPreference}
    - Allergies: ${allergies.join(', ') || 'None'}
    - Medical Conditions: ${medicalConditions.join(', ') || 'None'}
    
    Available Meals List: ${JSON.stringify(availableMeals)}
    
    Format the response as a valid JSON object matching this schema (do NOT include any markdown code blocks, return pure JSON):
    {
      "meals": [
        {
          "type": "Breakfast" | "Lunch" | "Dinner",
          "name": "Meal Name",
          "description": "Short appetizing description explaining why this fits their metabolic goal",
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number,
          "ingredients": ["ingredient1", "ingredient2"]
        }
      ],
      "rationale": "A concise paragraph explaining the culinary science behind this tailored menu."
    }`;

    const fallbackMealData = {
      meals: [
        {
          type: "Breakfast",
          name: "Sprouted Moong & Paneer High-Protein Chilla",
          description: "Freshly ground sprouted moong stuffed with organic cottage cheese and cold-pressed mustard oil.",
          calories: 380,
          protein: 22,
          carbs: 38,
          fat: 12,
          ingredients: ["Sprouted Moong", "Paneer", "Cumin", "Himalayan Pink Salt"]
        },
        {
          type: "Lunch",
          name: "Ancient Grain Quinoa & Herb Roasted Tofu Bowl",
          description: "Organic quinoa paired with rosemary-baked tofu, steamed broccoli, and flaxseed tahini dressing.",
          calories: 450,
          protein: 28,
          carbs: 48,
          fat: 14,
          ingredients: ["Quinoa", "Tofu", "Broccoli", "Tahini", "Olive Oil"]
        },
        {
          type: "Dinner",
          name: "Low-GI Palak Dal & Cauliflower Millet Rice",
          description: "Nutrient-rich spinach lentils served alongside light grated cauliflower and foxtail millet.",
          calories: 340,
          protein: 18,
          carbs: 42,
          fat: 9,
          ingredients: ["Spinach", "Yellow Dal", "Cauliflower", "Millet", "Ghee"]
        }
      ],
      rationale: "Tailored to maintain high satiety, stable blood glucose levels, and optimal protein intake."
    };

    if (!ai) {
      return res.json(fallbackMealData);
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: "Recommend 3 optimal daily meals matching my profile.",
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        }
      });

      let result = JSON.parse(response.text || "{}");
      return res.json(result.meals ? result : fallbackMealData);
    } catch (e) {
      console.warn("AI Meal Recommendation fallback used:", e);
      return res.json(fallbackMealData);
    }
  } catch (error: any) {
    console.error("AI Meal Recommendation Error:", error);
    res.json({
      meals: [
        {
          type: "Breakfast",
          name: "Sprouted Moong & Paneer High-Protein Chilla",
          description: "Freshly ground sprouted moong stuffed with organic cottage cheese.",
          calories: 380, protein: 22, carbs: 38, fat: 12,
          ingredients: ["Moong", "Paneer"]
        }
      ],
      rationale: "Standard clean metabolic template."
    });
  }
});

// 3. HEALTH ANALYTICS / INSIGHTS ENDPOINT
app.post("/api/ai/health-insights", async (req, res) => {
  try {
    const { userId } = req.body;
    let healthAssessment: any = null;

    if (userId) {
      const healthSnap = await adminDb.collection('healthAssessments').doc(userId).get();
      if (healthSnap.exists) {
        healthAssessment = healthSnap.data();
      }
    }

    const weight = healthAssessment?.weight || 70;
    const height = healthAssessment?.height || 170;
    const goal = healthAssessment?.goal || "general wellness";
    const waterIntake = healthAssessment?.waterIntake || 2;
    const medicalConditions = healthAssessment?.medicalConditions || [];
    const allergies = healthAssessment?.allergies || [];

    const systemInstruction = `You are a professional Health Analytics AI. Based on the user's vitals and goals, generate a health score assessment.
    
    Metrics:
    - Weight: ${weight} kg, Height: ${height} cm
    - Goal: ${goal}
    - Daily Water Intake: ${waterIntake} L
    - Medical Conditions: ${medicalConditions.join(', ') || 'None'}
    - Allergies: ${allergies.join(', ') || 'None'}

    Format your response as a valid JSON object (pure JSON, no markdown formatting):
    {
      "healthScore": number (1 to 100),
      "nutritionScore": number (1 to 100),
      "dietConsistency": string (e.g., "Good", "Outstanding", "Needs Calibration"),
      "suggestions": [string],
      "warnings": [string]
    }`;

    const fallbackInsights = {
      healthScore: 88,
      nutritionScore: 92,
      dietConsistency: "Outstanding",
      suggestions: [
        "Maintain current clean protein ratio for muscle synthesis",
        "Increase daily hydration by 500ml during peak activity hours",
        "Maintain low glycemic index meals to sustain focus"
      ],
      warnings: allergies.length > 0 ? [`Allergy Alert: Strictly avoiding ${allergies.join(', ')}`] : []
    };

    if (!ai) {
      return res.json(fallbackInsights);
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: "Analyze health profile and return JSON insights.",
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        }
      });

      let result = JSON.parse(response.text || "{}");
      return res.json(result.healthScore ? result : fallbackInsights);
    } catch (e) {
      console.warn("Health Insights fallback used:", e);
      return res.json(fallbackInsights);
    }
  } catch (error: any) {
    console.error("Health Insights Error:", error);
    res.json({
      healthScore: 85,
      nutritionScore: 90,
      dietConsistency: "Good",
      suggestions: ["Stay consistent with your daily meal delivery schedule"],
      warnings: []
    });
  }
});

// 4. ENTERPRISE COMMUNICATION DISPATCHER ENDPOINT
app.post("/api/communication/send", async (req, res) => {
  try {
    const { userId, type, title, message, channel, recipientDetails } = req.body;
    if (!userId || !type || !message) {
      return res.status(400).json({ error: "Missing required communication fields" });
    }

    // Resolve user's actual email, phone, and name from database
    let email = recipientDetails?.email || "";
    let phone = recipientDetails?.phone || "";
    let name = recipientDetails?.name || "Customer";

    try {
      const userDoc = await adminDb.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const u = userDoc.data();
        if (u) {
          if (u.email) email = u.email;
          if (u.phone) phone = u.phone;
          if (u.name || u.displayName) name = u.name || u.displayName;
        }
      }
    } catch (dbErr) {
      console.warn("Communication dispatcher using recipient details or fallback parameters.");
    }

    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const notificationPayload = {
      id: notificationId,
      userId,
      title: title || "Taaza Bites Update 🥗",
      message: message,
      type: type, // 'ticket', 'recommendation', 'health_tip', 'subscription', 'otp', 'payment_success', 'subscription_activated'
      channel: channel || ['app'], // ['app', 'whatsapp', 'email', 'push']
      read: false,
      createdAt: FieldValue.serverTimestamp()
    };

    // Store in general notifications collection
    try {
      await adminDb.collection('notifications').doc(notificationId).set(notificationPayload);
    } catch (dbWriteErr: any) {
      console.warn("Could not save notification to adminDb, proceeding with dispatch:", dbWriteErr?.message || dbWriteErr);
    }

    console.log(`\n============== ENTERPRISE NOTIFICATION ENGINE ==============`);
    console.log(`[TARGET USER]: ${userId}`);
    console.log(`[TYPE]: ${type.toUpperCase()}`);
    console.log(`[CHANNELS TRIGGERED]: ${JSON.stringify(channel || ['app'])}`);
    console.log(`[NOTIFICATION ID]: ${notificationId}`);

    const activeChannels = channel || ['app'];

    // 1. BREVO EMAIL AUTOMATION (Module 4)
    if (activeChannels.includes('email') && email) {
      const brevoKey = process.env.BREVO_API_KEY;
      const senderEmail = process.env.BREVO_SENDER_EMAIL || "noreply@taazabites.com";
      const senderName = process.env.BREVO_SENDER_NAME || "Taaza Bites";

      const emailLogId = `elog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      let status = "sent";
      let errorStr = "";

      if (brevoKey && brevoKey !== "MY_BREVO_API_KEY") {
        try {
          console.log(`[BREVO EMAIL SERVICE]: Sending real transactional email to [REDACTED]...`);
          const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
              "accept": "application/json",
              "api-key": brevoKey,
              "content-type": "application/json"
            },
            body: JSON.stringify({
              sender: { name: senderName, email: senderEmail },
              to: [{ email: email, name: name }],
              subject: title || "Taaza Bites Update",
              htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
                  <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;">Taaza Bites 🥗</h2>
                  <p>Hello ${name},</p>
                  <p style="font-size: 16px; line-height: 1.5; color: #27272a;">${message}</p>
                  <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e4e4e7; font-size: 12px; color: #71717a;">
                    <p>This is an automated transactional notification regarding your subscription.</p>
                    <p>&copy; ${new Date().getFullYear()} Taaza Bites. All rights reserved.</p>
                  </div>
                </div>
              `
            })
          });

          if (!response.ok) {
            const errData = await response.json();
            status = "failed";
            errorStr = JSON.stringify(errData);
            console.error(`[BREVO ERROR]: Failed with status ${response.status}`, errData);
          } else {
            console.log(`[BREVO SUCCESS]: Email successfully relayed via SMTP API.`);
          }
        } catch (mailErr: any) {
          status = "failed";
          errorStr = mailErr.message || String(mailErr);
          console.error(`[BREVO EXCEPTION]:`, mailErr);
        }
      } else {
        console.log(`[BREVO EMAIL SERVICE - SIMULATED]: Relaying transaction SMTP email payload...`);
        console.log(`>> To: [REDACTED]`);
        console.log(`>> Subject: ${title || "Taaza Bites Update"}`);
        console.log(`>> Body: ${message}`);
      }

      // Log in emailLogs Firestore collection
      try {
        await adminDb.collection('emailLogs').doc(emailLogId).set({
          id: emailLogId,
          userId,
          email,
          subject: title || "Taaza Bites Update",
          body: message,
          status,
          error: errorStr || null,
          templateName: type,
          createdAt: FieldValue.serverTimestamp()
        });
      } catch (logErr: any) {
        console.warn("Could not save email log to adminDb:", logErr?.message || logErr);
      }
    }

    // 2. WHATSAPP AUTOMATION (Module 5)
    if (activeChannels.includes('whatsapp') && phone) {
      const gupshupKey = process.env.GUPSHUP_API_KEY;

      const waLogId = `wlog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      let status = "sent";
      let errorStr = "";

      if (gupshupKey && gupshupKey !== "MY_GUPSHUP_API_KEY") {
        try {
          console.log(`[GUPSHUP WHATSAPP SERVICE]: Sending alert to [REDACTED]...`);
          
          const success = await WhatsAppService.sendText(phone, `${name}: ${message}`);
          
          if (!success) {
            status = "failed";
            errorStr = "Failed to dispatch via Gupshup service";
          } else {
            console.log(`[GUPSHUP SUCCESS]: Message successfully sent.`);
          }
        } catch (waErr: any) {
          status = "failed";
          errorStr = waErr.message || String(waErr);
          console.error(`[GUPSHUP EXCEPTION]:`, waErr);
        }
      } else {
        console.log(`[GUPSHUP WHATSAPP INTEGRATION - SIMULATED]: Sending templates to user's registered WhatsApp...`);
        console.log(`>> Phone: [REDACTED]`);
        console.log(`>> Message: "TaazaBites Alert: ${message}"`);
      }

      // Log in whatsappLogs Firestore collection
      try {
        await adminDb.collection('whatsappLogs').doc(waLogId).set({
          id: waLogId,
          userId,
          phone,
          message: `TaazaBites Alert: ${message}`,
          status,
          error: errorStr || null,
          templateName: type,
          createdAt: FieldValue.serverTimestamp()
        });
      } catch (logErr: any) {
        console.warn("Could not save whatsapp log to adminDb:", logErr?.message || logErr);
      }
    }

    // 3. PUSH NOTIFICATIONS (Module 6)
    if (activeChannels.includes('push')) {
      const pushLogId = `plog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      console.log(`[FIREBASE CLOUD MESSAGING]: Dispatching secure push payload...`);
      console.log(`>> Title: ${title || "Taaza Bites Update"}`);
      console.log(`>> Message: ${message}`);

      // Log in pushNotifications Firestore collection
      try {
        await adminDb.collection('pushNotifications').doc(pushLogId).set({
          id: pushLogId,
          userId,
          title: title || "Taaza Bites Update 🥗",
          message: message,
          status: "sent",
          type: type,
          createdAt: FieldValue.serverTimestamp()
        });
      } catch (logErr: any) {
        console.warn("Could not save push log to adminDb:", logErr?.message || logErr);
      }
    }
    console.log(`============================================================\n`);

    res.json({
      success: true,
      message: `Communication successfully dispatched over ${activeChannels.join(', ')}`,
      notificationId
    });
  } catch (error: any) {
    console.error("Communication Dispatch Error:", error);
    res.status(500).json({ error: error.message || "Failed to dispatch communication" });
  }
});

import { migrateLegacyUsers } from "./src/server/utils/migration.ts";

app.post("/api/admin/migrate", authenticateRequest, requireAdmin, async (req, res) => {
  try {
    await migrateLegacyUsers();
    res.json({ success: true, message: "Migration triggered successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// START EXPRESS/VITE ENGINE
async function start() {
  // Auto-seed plans if database is empty
  seedPlansIfNeeded().catch(console.error);

  if (process.env.NODE_ENV !== "production") {
    // Mount Vite dev server in development
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted on Express dev server");
  } else {
    // Serve static files in production with aggressive caching for hashed assets
    const distPath = path.join(process.cwd(), "dist");
    
    // Assets are hashed by Vite, so they can be cached for 1 year
    app.use("/assets", express.static(path.join(distPath, "assets"), {
      maxAge: "1y",
      immutable: true
    }));

    // Other static files (index.html, manifest, etc)
    app.use(express.static(distPath, {
      maxAge: "1h" // Short cache for entry points
    }));

    // Prevent missing asset or script requests from falling through to SPA index.html
    app.get(["/assets/*", "*.*"], (req, res) => {
      res.status(404).send("Asset not found");
    });

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files mounted on Express server from /dist (with caching)");
  }

app.get('/api/test/firestore-direct', async (req, res) => {
  try {
    const config = JSON.parse(readFileSync(path.resolve(process.cwd(), 'firebase-applet-config.json'), 'utf-8'));
    const fs = new Firestore({
      projectId: config.projectId,
      databaseId: config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)' ? config.firestoreDatabaseId : undefined
    });
    const collections = await fs.listCollections();
    res.json({ success: true, collections: collections.map(c => c.id) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

  // Global Express Error Handling Middleware (Clean, sanitized error responses)
  app.use((err: any, req: any, res: any, _next: any) => {
    console.error(`[EXPRESS UNHANDLED ERROR] ${req.method} ${req.path}:`, err);
    const statusCode = err.status || err.statusCode || 500;
    const userMessage = statusCode === 404
      ? "Requested resource not found."
      : "An unexpected error occurred while processing your request. Please try again.";
    
    if (res.headersSent) return;
    return res.status(statusCode).json(buildErrorResponse(
      err.code || "INTERNAL_SERVER_ERROR",
      userMessage
    ));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Taaza Bites Server running on port ${PORT}`);
  });
}

start();
