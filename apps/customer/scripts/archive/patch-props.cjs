const fs = require('fs');

let spCode = fs.readFileSync('src/components/SubscriptionPlans.tsx', 'utf8');
spCode = spCode.replace(
  'export default function SubscriptionPlans() {',
  `export default function SubscriptionPlans(props: any) {`
);
fs.writeFileSync('src/components/SubscriptionPlans.tsx', spCode);

let cpCode = fs.readFileSync('src/components/CustomizationPanel.tsx', 'utf8');
cpCode = cpCode.replace(
  'export default function CustomizationPanel() {',
  `export default function CustomizationPanel(props: any) {`
);
fs.writeFileSync('src/components/CustomizationPanel.tsx', cpCode);
