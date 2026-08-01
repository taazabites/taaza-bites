const fs = require('fs');

let authCode = fs.readFileSync('src/firebase/auth.ts', 'utf8');

const setupCode = `export const setupRecaptcha = (containerId: string) => {
  if (!(window as any).recaptchaVerifier) {
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      }
    });
  }
  return (window as any).recaptchaVerifier;
};`;

const newSetupCode = `export const setupRecaptcha = (containerId: string) => {
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

authCode = authCode.replace(setupCode, newSetupCode);

fs.writeFileSync('src/firebase/auth.ts', authCode);
console.log("Fixed recaptcha");
