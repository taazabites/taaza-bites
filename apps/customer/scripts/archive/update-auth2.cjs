const fs = require('fs');

let authCode = fs.readFileSync('src/firebase/auth.ts', 'utf8');

authCode = authCode.replace(
  "console.error('Error signing in with phone:', error);",
  `console.error('Error signing in with phone:', error);
    if ((error as any).code === 'auth/captcha-check-failed' || (error as any).code === 'auth/unauthorized-domain') {
       throw new Error(\`Unauthorized Domain: Please add "\${window.location.hostname}" to Firebase Authentication -> Settings -> Authorized Domains.\`);
    }`
);

fs.writeFileSync('src/firebase/auth.ts', authCode);
console.log("Updated auth.ts error handling");
