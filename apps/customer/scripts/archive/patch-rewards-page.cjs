const fs = require('fs');

let pageCode = fs.readFileSync('src/pages/Rewards.tsx', 'utf8');

// Import RewardService
if (!pageCode.includes('RewardService')) {
  pageCode = pageCode.replace(
    'import { useToast } from "@/src/context/ToastContext";',
    'import { useToast } from "@/src/context/ToastContext";\nimport { RewardService } from "../firebase/services";'
  );
}

// Add state for redeeming
if (!pageCode.includes('isRedeeming')) {
  pageCode = pageCode.replace(
    'const [transactions, setTransactions] = useState<RewardTransaction[]>([]);',
    'const [transactions, setTransactions] = useState<RewardTransaction[]>([]);\n  const [isRedeeming, setIsRedeeming] = useState(false);'
  );
}

// Add handleRedeem function
const handleRedeem = `
  const handleRedeem = async () => {
    if (!currentUser || !reward) return;
    const pointsToRedeem = 500; // E.g., 500 points for 50 rs
    const amountToCredit = 50;

    if (reward.currentPoints < pointsToRedeem) {
      showToast(\`You need at least \${pointsToRedeem} points to redeem.\`, 'error');
      return;
    }

    setIsRedeeming(true);
    try {
      await RewardService.redeemPoints(currentUser.uid, pointsToRedeem, amountToCredit);
      showToast(\`Successfully redeemed \${pointsToRedeem} points for ₹\${amountToCredit}\`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to redeem points', 'error');
    } finally {
      setIsRedeeming(false);
    }
  };
`;

if (!pageCode.includes('handleRedeem')) {
  pageCode = pageCode.replace(
    'return () => {',
    handleRedeem + '\n    return () => {'
  );
}

// Replace Redeem button
pageCode = pageCode.replace(
  '<Button className="bg-white hover:bg-zinc-100 text-emerald-700 rounded-2xl py-6 px-8 h-auto font-black text-sm uppercase tracking-widest shadow-xl">',
  '<Button onClick={handleRedeem} disabled={isRedeeming} className="bg-white hover:bg-zinc-100 text-emerald-700 rounded-2xl py-6 px-8 h-auto font-black text-sm uppercase tracking-widest shadow-xl">'
);
pageCode = pageCode.replace(
  'Redeem Points',
  '{isRedeeming ? "Redeeming..." : "Redeem Points"}'
);

fs.writeFileSync('src/pages/Rewards.tsx', pageCode);
console.log('Patched Rewards.tsx');
