/**
 * Input Validation & Sanitization Utility for TaazaBites Application
 * Provides unified cleaning, escaping, and validation methods across forms and APIs.
 */

// Basic HTML entity escaping to prevent XSS injection
export function sanitizeString(input: string, maxLen = 500): string {
  if (!input || typeof input !== 'string') return '';
  
  // Trim whitespace
  let clean = input.trim();
  
  // Remove HTML tags
  clean = clean.replace(/<[^>]*>?/gm, '');
  
  // Replace sensitive HTML characters with entities
  clean = clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  return clean.slice(0, maxLen);
}

// Validate and clean Indian / International Phone Numbers
export function validatePhone(phone: string): { isValid: boolean; cleanPhone: string; error?: string } {
  if (!phone) return { isValid: false, cleanPhone: '', error: 'Phone number is required.' };
  
  // Strip all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Check standard 10 digit Indian number or international with country code
  if (digits.length === 10) {
    return { isValid: true, cleanPhone: `+91${digits}` };
  } else if (digits.length === 12 && digits.startsWith('91')) {
    return { isValid: true, cleanPhone: `+${digits}` };
  } else if (digits.length >= 10 && digits.length <= 15) {
    return { isValid: true, cleanPhone: `+${digits}` };
  }
  
  return { isValid: false, cleanPhone: digits, error: 'Please enter a valid 10-digit mobile number.' };
}

// Validate Email Address
export function validateEmail(email: string): { isValid: boolean; cleanEmail: string; error?: string } {
  if (!email) return { isValid: false, cleanEmail: '', error: 'Email address is required.' };
  
  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(cleanEmail)) {
    return { isValid: false, cleanEmail, error: 'Please enter a valid email address.' };
  }
  
  return { isValid: true, cleanEmail };
}

// Validate Indian Postal Pincode (6 digits)
export function validatePincode(pincode: string): { isValid: boolean; cleanPincode: string; error?: string } {
  if (!pincode) return { isValid: false, cleanPincode: '', error: 'Pincode is required.' };
  
  const digits = pincode.replace(/\D/g, '');
  
  if (digits.length !== 6) {
    return { isValid: false, cleanPincode: digits, error: 'Pincode must be exactly 6 digits.' };
  }
  
  return { isValid: true, cleanPincode: digits };
}

// Validate Person / Display Name
export function validateName(name: string): { isValid: boolean; cleanName: string; error?: string } {
  if (!name) return { isValid: false, cleanName: '', error: 'Name is required.' };
  
  const cleanName = sanitizeString(name, 100);
  
  if (cleanName.length < 2) {
    return { isValid: false, cleanName, error: 'Name must be at least 2 characters long.' };
  }
  
  return { isValid: true, cleanName };
}

// Validate Amount or Quantity
export function validatePositiveNumber(value: number | string, min = 1, max = 1000000): { isValid: boolean; amount: number; error?: string } {
  const num = typeof value === 'number' ? value : parseFloat(value);
  
  if (isNaN(num) || num < min) {
    return { isValid: false, amount: 0, error: `Value must be at least ${min}.` };
  }
  
  if (num > max) {
    return { isValid: false, amount: max, error: `Value cannot exceed ${max}.` };
  }
  
  return { isValid: true, amount: num };
}
