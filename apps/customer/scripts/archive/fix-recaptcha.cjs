const fs = require('fs');

let authCode = fs.readFileSync('src/firebase/auth.ts', 'utf8');

const setupCode = `export const setupRecaptcha = (containerId: string) => {
  if ((window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch (e) {
      // Ignore clear errors
    }
    (window as any).recaptchaVerifier = null;
  }
  
  (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved, allow signInWithPhoneNumber.
    }
  });
  
  return (window as any).recaptchaVerifier;
};`;

authCode = authCode.replace(/export const setupRecaptcha = \([^}]+};/m, setupCode);

// Wait, the regex might not match correctly. Let's just do a string replace on the exact text.
