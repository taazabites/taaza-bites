const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

serverCode = serverCode.replace(
  'const response = await ai.generateContent({',
  `if (!ai) throw new Error("Gemini API is not configured");
        const response = await ai.generateContent({`
);

fs.writeFileSync('server.ts', serverCode);
console.log("Gemini ai validation injected.");
