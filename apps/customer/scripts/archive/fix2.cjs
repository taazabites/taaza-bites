const fs = require('fs');
let code = fs.readFileSync('src/pages/Checkout.tsx', 'utf8');

code = code.replace(/        } else {\n          const initialWallet = {[\s\S]*?\/\* write removed \*\/\n        }/,
`        } else {
          setWalletBalance(0);
        }`);

code = code.replace(/        if \(rewardSnap\.exists\(\)\) {/,
`        const rewardSnap = await getDoc(doc(db, 'rewardPoints', user.uid));
        if (rewardSnap.exists()) {`);

code = code.replace(/        } else {\n          const initialRewards = {[\s\S]*?\/\* write removed \*\/\n        }/,
`        } else {
          setRewardPoints(0);
        }`);

fs.writeFileSync('src/pages/Checkout.tsx', code);
