const fs = require('fs');
let content = fs.readFileSync('src/main.tsx', 'utf8');

const targetContent = `// Filter out specific noisy console errors
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' && 
    args[0].includes('Detected an update time that is in the future')
  ) {
    return;
  }
  originalConsoleError(...args);
};`;

const replacementContent = `// Filter out specific noisy console errors
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const msg = args.map(a => typeof a === 'string' ? a : String(a)).join(' ');
  if (msg.includes('Detected an update time that is in the future')) {
    return;
  }
  originalConsoleError(...args);
};`;

if (content.includes(targetContent)) {
  content = content.replace(targetContent, replacementContent);
  fs.writeFileSync('src/main.tsx', content);
  console.log('Main patched successfully.');
} else {
  console.log('Target content not found.');
}
