const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

function removeMocks(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  content = content.replace(/const\s+dynamicExpiringMocks[\s\S]*?\];/g, '');
  content = content.replace(/dynamicExpiringMocks\.forEach\([\s\S]*?}\)/g, '');
  
  content = content.replace(/const\s+dynamicRenewalsMocks[\s\S]*?\];/g, '');
  content = content.replace(/dynamicRenewalsMocks\.forEach\([\s\S]*?}\)/g, '');
  
  content = content.replace(/const\s+dynamicMocks[\s\S]*?\];/g, '');
  content = content.replace(/dynamicMocks\.forEach\([\s\S]*?}\)/g, '');

  content = content.replace(/const\s+mockTemplates[\s\S]*?\];/g, '');

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
