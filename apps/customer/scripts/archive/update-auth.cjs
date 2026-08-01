const fs = require('fs');

let authCode = fs.readFileSync('src/firebase/auth.ts', 'utf8');

const domainCheckCode = `
const isAuthorizedDomain = () => {
  const hostname = window.location.hostname;
  const allowed = [
    'subscription.taazabites.in',
    'taazabites.in',
    'localhost'
  ];
  const allowedSuffixes = [
    '.firebaseapp.com',
    '.hosted.app',
    '.run.app' // Often used in Cloud Run/AI Studio previews
  ];
  
  if (allowed.includes(hostname)) return true;
  if (allowedSuffixes.some(suffix => hostname.endsWith(suffix))) return true;
  
  return false;
};
`;

authCode = authCode.replace("export const setupRecaptcha", domainCheckCode + "\nexport const setupRecaptcha");

authCode = authCode.replace(
  "return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);",
  `if (!isAuthorizedDomain()) {
      throw new Error(\`Unauthorized Domain: Please add "\${window.location.hostname}" to Firebase Authentication -> Settings -> Authorized Domains.\`);
    }
    
    return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);`
);

fs.writeFileSync('src/firebase/auth.ts', authCode);
console.log("Updated auth.ts");
