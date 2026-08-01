/**
 * Safe Clipboard Operations with Protection against Clipboard Hijacking & Injection Attacks
 * - Prevents ANSI escape sequence injection
 * - Strips zero-width invisible tracking/payload characters
 * - Strips dangerous terminal control characters
 * - Enforces max length limits to prevent Clipboard DoS
 */

export function sanitizeClipboardText(input: string, maxLength = 5000): string {
  if (!input || typeof input !== 'string') return '';

  let sanitized = input
    // 1. Strip ANSI escape sequences (terminal injection protection)
    .replace(/\u001b\[[0-9;]*[a-zA-Z]/g, '')
    // 2. Strip Zero-Width and invisible characters (invisible tracking / prompt injection protection)
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // 3. Strip dangerous ASCII control characters (\x00-\x08, \x0B, \x0C, \x0E-\x1F, \x7F)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // 4. Normalize spaces
    .trim();

  // 5. Enforce safety length boundary
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
}

export async function safeCopyToClipboard(text: string, maxLength = 5000): Promise<boolean> {
  const cleanText = sanitizeClipboardText(text, maxLength);
  if (!cleanText) return false;

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(cleanText);
      return true;
    }
  } catch (err) {
    console.warn("navigator.clipboard.writeText failed, using fallback execCommand:", err);
  }

  // Fallback method for iFrame or restricted environments
  try {
    const textArea = document.createElement("textarea");
    textArea.value = cleanText;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (fallbackErr) {
    console.error("Clipboard copy failed entirely:", fallbackErr);
    return false;
  }
}
