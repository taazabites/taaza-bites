const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

const validationCode = `
// 1. Environment Variables Validation
const requiredEnvVars = [];
// Validate any specific required variables for production if needed.
// We avoid crashing if optional ones are missing.
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(\`\\n[FATAL ERROR] Server startup failed.\`);
  console.error(\`Missing required environment variables: \${missingVars.join(', ')}\\n\`);
  process.exit(1);
}
`;

serverCode = serverCode.replace(
  'import express from "express";',
  validationCode + '\nimport express from "express";'
);

// We should also replace the top-level genAI initialization so it doesn't crash on startup if key is missing.
serverCode = serverCode.replace(
  'const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);',
  'const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;'
);
serverCode = serverCode.replace(
  'const ai = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });',
  'const ai = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;'
);

fs.writeFileSync('server.ts', serverCode);
console.log("Environment validation injected.");
