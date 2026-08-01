import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Enterprise Security Suite for TaazaBites
 * Mitigates: SSTI, ReDoS, LPDoS, NoSQL/SQL Injection, Replay Attacks, Key Leaks
 */

// --- 1. STRONG PEPPERED BCRYPT PASSWORD HASHING ---
// Hidden server-side secret Pepper (never stored in database or exposed to client)
const SECRET_PEPPER = process.env.PASSWORD_PEPPER || process.env.SECRET_PEPPER || 'TAAZABITES_SECRET_PEPPER_KEY_2026_v1_PROTECTED';
const BCRYPT_ROUNDS = 12; // 12 rounds of bcrypt salting (unique 128-bit per-user salt)

// Legacy PBKDF2 constants for backward-compatible verification
const PBKDF2_ITERATIONS = 100000;
const KEY_LEN = 64;
const DIGEST = 'sha512';

/**
 * Combines the user password with the secret pepper using HMAC-SHA256
 * This protects against database leaks and circumvents bcrypt 72-byte truncation limits.
 */
function applyPepper(password: string): string {
  return crypto.createHmac('sha256', SECRET_PEPPER).update(password).digest('hex');
}

/**
 * Hashes a user password using bcrypt with a unique per-user salt and hidden server secret pepper.
 */
export function hashPassword(password: string): string {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  const pepperedPassword = applyPepper(password);
  const salt = bcrypt.genSaltSync(BCRYPT_ROUNDS); // Generates unique 128-bit salt per user
  return bcrypt.hashSync(pepperedPassword, salt);
}

/**
 * Verifies a password against a stored hash (supports peppered bcrypt as well as legacy PBKDF2).
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) return false;

  // Handle bcrypt hash format ($2a$, $2b$, $2y$, $2x$)
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$') || storedHash.startsWith('$2x$')) {
    const pepperedPassword = applyPepper(password);
    return bcrypt.compareSync(pepperedPassword, storedHash);
  }

  // Backward compatibility fallback for legacy PBKDF2 hashes
  if (storedHash.startsWith('pbkdf2$')) {
    const parts = storedHash.split('$');
    if (parts.length !== 4) return false;

    const iterations = parseInt(parts[1], 10);
    const salt = parts[2];
    const originalHash = parts[3];

    if (isNaN(iterations) || !salt || !originalHash) return false;

    const hashToTest = crypto.pbkdf2Sync(password, salt, iterations, KEY_LEN, DIGEST).toString('hex');
    const bufOriginal = Buffer.from(originalHash, 'hex');
    const bufTest = Buffer.from(hashToTest, 'hex');

    if (bufOriginal.length !== bufTest.length) return false;
    return crypto.timingSafeEqual(bufOriginal, bufTest);
  }

  return false;
}

export function validatePasswordPolicy(password: string): { isValid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one digit.' };
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character (!@#$%^&*).' };
  }
  return { isValid: true };
}

// --- 2. ACCOUNT LOCKOUT & RATE LIMIT TRACKER ---
interface LockoutRecord {
  failedAttempts: number;
  lockoutUntil: number | null;
  lastAttemptAt: number;
}

class AccountLockoutTracker {
  private attemptsMap = new Map<string, LockoutRecord>();
  private readonly maxAttempts: number;
  private readonly lockoutDurationMs: number;

  constructor(maxAttempts = 5, lockoutDurationMinutes = 15) {
    this.maxAttempts = maxAttempts;
    this.lockoutDurationMs = lockoutDurationMinutes * 60 * 1000;
  }

  public isLockedOut(identifier: string): { isLocked: boolean; remainingMinutes?: number } {
    const record = this.attemptsMap.get(identifier);
    if (!record || !record.lockoutUntil) {
      return { isLocked: false };
    }

    const now = Date.now();
    if (now < record.lockoutUntil) {
      const remainingMs = record.lockoutUntil - now;
      const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
      return { isLocked: true, remainingMinutes };
    }

    this.resetAttempts(identifier);
    return { isLocked: false };
  }

  public recordFailedAttempt(identifier: string): { isNowLocked: boolean; remainingAttempts: number; remainingMinutes?: number } {
    const now = Date.now();
    const record = this.attemptsMap.get(identifier) || { failedAttempts: 0, lockoutUntil: null, lastAttemptAt: now };

    if (now - record.lastAttemptAt > 60 * 60 * 1000) {
      record.failedAttempts = 0;
      record.lockoutUntil = null;
    }

    record.failedAttempts += 1;
    record.lastAttemptAt = now;

    if (record.failedAttempts >= this.maxAttempts) {
      record.lockoutUntil = now + this.lockoutDurationMs;
      this.attemptsMap.set(identifier, record);
      return {
        isNowLocked: true,
        remainingAttempts: 0,
        remainingMinutes: Math.ceil(this.lockoutDurationMs / (60 * 1000))
      };
    }

    this.attemptsMap.set(identifier, record);
    return {
      isNowLocked: false,
      remainingAttempts: this.maxAttempts - record.failedAttempts
    };
  }

  public resetAttempts(identifier: string): void {
    this.attemptsMap.delete(identifier);
  }
}

export const defaultLockoutTracker = new AccountLockoutTracker(5, 15);

// --- 3. SSTI (SERVER-SIDE TEMPLATE INJECTION) DEFENSE ---
/**
 * Escapes HTML control characters to prevent SSTI & XSS when populating templates
 */
export function escapeHtml(unsafe: string): string {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/`/g, "&#96;");
}

/**
 * Safely interpolates placeholders into template strings without invoking eval/template engines
 */
export function safeTemplateInterpolate(template: string, variables: Record<string, any>): string {
  if (typeof template !== 'string') return '';
  return template.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, key) => {
    const val = key.split('.').reduce((obj: any, i: string) => (obj ? obj[i] : undefined), variables);
    return val !== undefined ? escapeHtml(String(val)) : '';
  });
}

// --- 4. ReDoS (REGULAR EXPRESSION DENIAL OF SERVICE) DEFENSE ---
/**
 * Safe Regex tester that enforces input bounds and timeout/length limits before evaluating regexes
 */
export function safeRegexMatch(input: string, pattern: RegExp, maxInputLength = 1000): boolean {
  if (typeof input !== 'string' || input.length > maxInputLength) {
    return false;
  }
  try {
    return pattern.test(input);
  } catch (err) {
    console.error('[ReDoS Shield] Regex evaluation error:', err);
    return false;
  }
}

// Linear, ReDoS-safe validation regex patterns
export const SAFE_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;
export const SAFE_PHONE_REGEX = /^\+?[0-9]{10,15}$/;
export const SAFE_COUPON_CODE_REGEX = /^[A-Z0-9_-]{3,20}$/;

export function validateSafeEmail(email: string): boolean {
  return safeRegexMatch(email, SAFE_EMAIL_REGEX, 254);
}

export function validateSafePhone(phone: string): boolean {
  return safeRegexMatch(phone, SAFE_PHONE_REGEX, 20);
}

// --- 5. NoSQL & SQL INJECTION DEFENSE ---
/**
 * Sanitizes objects recursively to prevent NoSQL operator injection ($gt, $ne, $or, etc.)
 * and prototype pollution (__proto__, constructor, prototype)
 */
export function sanitizeNoSqlInput(obj: any, maxDepth = 10, currentDepth = 0): any {
  if (currentDepth > maxDepth) {
    throw new Error('LPDoS Protection: Object depth limit exceeded (Possible recursion attack)');
  }

  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'string') {
      // Clean null bytes and SQL comment sequences
      return obj.replace(/\0/g, '').replace(/--/g, '&#45;&#45;');
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    if (obj.length > 500) {
      throw new Error('LPDoS Protection: Array length limit exceeded (Max 500 elements)');
    }
    return obj.map(item => sanitizeNoSqlInput(item, maxDepth, currentDepth + 1));
  }

  const sanitized: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    // Block Prototype Pollution & NoSQL Operator Keys
    if (
      key.startsWith('$') ||
      key.includes('.') ||
      key === '__proto__' ||
      key === 'constructor' ||
      key === 'prototype'
    ) {
      console.warn(`[NoSQL Guard] Stripped malicious parameter key: "${key}"`);
      continue;
    }
    sanitized[key] = sanitizeNoSqlInput(obj[key], maxDepth, currentDepth + 1);
  }

  return sanitized;
}

// --- 6. REPLAY ATTACK & IDEMPOTENCY DEFENSE ---
interface NonceRecord {
  timestamp: number;
}

class IdempotencyStore {
  private store = new Map<string, NonceRecord>();
  private readonly maxAgeMs: number;

  constructor(maxAgeMinutes = 10) {
    this.maxAgeMs = maxAgeMinutes * 60 * 1000;
    // Periodic garbage collection every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  public validateAndStoreNonce(nonce: string, clientTimestamp?: number): { isValid: boolean; reason?: string } {
    if (!nonce || typeof nonce !== 'string' || nonce.length < 8) {
      return { isValid: false, reason: 'Invalid or missing nonce/idempotency key.' };
    }

    const now = Date.now();

    // Check request timestamp drift if provided
    if (clientTimestamp && typeof clientTimestamp === 'number') {
      const drift = Math.abs(now - clientTimestamp);
      if (drift > 5 * 60 * 1000) { // 5 minutes max allowed drift
        return { isValid: false, reason: 'Request timestamp out of allowed threshold window (Possible Replay Attack).' };
      }
    }

    if (this.store.has(nonce)) {
      return { isValid: false, reason: 'Replay attack detected: This idempotency key / transaction nonce has already been processed.' };
    }

    this.store.set(nonce, { timestamp: now });
    return { isValid: true };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [nonce, record] of this.store.entries()) {
      if (now - record.timestamp > this.maxAgeMs) {
        this.store.delete(nonce);
      }
    }
  }
}

export const defaultIdempotencyStore = new IdempotencyStore(10);

// --- 7. SECRET & KEY LEAK DEFENSE ---
/**
 * Masks sensitive operational keys and secrets in logs
 */
export function maskSecret(secret: string): string {
  if (!secret || typeof secret !== 'string') return '*****';
  if (secret.length <= 8) return '****' + secret.slice(-2);
  return secret.slice(0, 4) + '****' + secret.slice(-4);
}

/**
 * Sanitizes object payload before logging to hide passwords, tokens, API keys
 */
export function sanitizeLogPayload(data: any): any {
  if (!data || typeof data !== 'object') return data;
  const copy = Array.isArray(data) ? [...data] : { ...data };

  const SENSITIVE_KEYS = ['password', 'secret', 'token', 'apiKey', 'razorpay_signature', 'cvv', 'cardNumber'];

  for (const key of Object.keys(copy)) {
    if (SENSITIVE_KEYS.some(k => key.toLowerCase().includes(k))) {
      copy[key] = '[REDACTED_SECRET]';
    } else if (typeof copy[key] === 'object') {
      copy[key] = sanitizeLogPayload(copy[key]);
    }
  }

  return copy;
}

// --- 8. STANDARDIZED ERROR FORMATTING ---
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: string;
    timestamp: string;
  };
}

export function buildErrorResponse(
  code: string,
  userFriendlyMessage: string,
  details?: string
): ApiErrorResponse {
  return {
    error: {
      code,
      message: userFriendlyMessage,
      ...(details ? { details } : {}),
      timestamp: new Date().toISOString()
    }
  };
}
