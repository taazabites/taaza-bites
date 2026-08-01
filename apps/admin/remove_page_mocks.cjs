const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

function removeMocks(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Remove `const mockQueue = [ ... ];`
  content = content.replace(/const\s+mockQueue\s*=\s*\[[\s\S]*?\];/g, '');
  
  // Remove `const mockPacking = [ ... ];`
  content = content.replace(/const\s+mockPacking\s*=\s*\[[\s\S]*?\];/g, '');
  
  // Remove `for (const item of mockQueue) { ... }`
  content = content.replace(/for\s*\(\s*const\s+item\s+of\s+mockQueue\s*\)\s*{[\s\S]*?}/g, '');
  content = content.replace(/for\s*\(\s*const\s+item\s+of\s+mockPacking\s*\)\s*{[\s\S]*?}/g, '');

  // Remove dynamic mocks from `expiring.tsx`, `renewals.tsx`, `subscriptions.tsx`
  content = content.replace(/const\s+dynamicExpiringMocks\s*=\s*\[[\s\S]*?\];/g, '');
  content = content.replace(/dynamicExpiringMocks\.forEach\([^)]+\)\s*{[\s\S]*?}\)/g, '');
  
  content = content.replace(/const\s+dynamicRenewalsMocks\s*=\s*\[[\s\S]*?\];/g, '');
  content = content.replace(/dynamicRenewalsMocks\.forEach\([^)]+\)\s*{[\s\S]*?}\)/g, '');
  
  content = content.replace(/const\s+dynamicMocks\s*=\s*\[[\s\S]*?\];/g, '');
  content = content.replace(/dynamicMocks\.forEach\([^)]+\)\s*{[\s\S]*?}\)/g, '');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Removed mock injection in", filePath);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      removeMocks(fullPath);
    }
  }
}

processDirectory(pagesDir);
