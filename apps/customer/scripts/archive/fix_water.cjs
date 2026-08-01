const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

code = code.replace(/const saved = localStorage\.getItem\("water_consumed_today"\);/g, 
`const todayKey = \`water_consumed_\${new Date().toISOString().split('T')[0]}\`;
      const saved = localStorage.getItem(todayKey);`);

code = code.replace(/localStorage\.setItem\("water_consumed_today", waterConsumed\.toString\(\)\);/g, 
`const todayKey = \`water_consumed_\${new Date().toISOString().split('T')[0]}\`;
    localStorage.setItem(todayKey, waterConsumed.toString());`);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
