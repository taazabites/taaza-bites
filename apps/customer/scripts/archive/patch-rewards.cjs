const fs = require('fs');

let servicesCode = fs.readFileSync('src/firebase/services.ts', 'utf8');

const redeemPointsFunction = `  redeemPoints: async (userId: string, points: number, amount: number) => {
    return runTransaction(db, async (transaction) => {
      const rewardRef = doc(db, 'rewardPoints', userId);
      const rewardDoc = await transaction.get(rewardRef);
      if (!rewardDoc.exists()) throw new Error("Reward account not found");
      
      const currentPoints = rewardDoc.data().currentPoints || 0;
      if (currentPoints < points) throw new Error("Insufficient points");

      const walletRef = doc(db, 'wallets', userId);
      const walletDoc = await transaction.get(walletRef);

      transaction.update(rewardRef, {
        currentPoints: currentPoints - points,
        updatedAt: serverTimestamp()
      });

      const txRef = doc(collection(db, 'rewardTransactions'));
      transaction.set(txRef, {
        userId,
        type: 'debit',
        points: points,
        reason: 'Redeemed for wallet credit',
        referenceId: txRef.id,
        createdAt: serverTimestamp()
      });

      let currentBalance = 0;
      if (walletDoc.exists()) {
        currentBalance = walletDoc.data().balance || 0;
        transaction.update(walletRef, {
          balance: currentBalance + amount,
          updatedAt: serverTimestamp()
        });
      } else {
        transaction.set(walletRef, {
          userId,
          balance: amount,
          cashbackAvailable: 0,
          cashbackPending: 0,
          cashbackLifetime: 0,
          updatedAt: serverTimestamp()
        });
      }

      const walletTxRef = doc(collection(db, 'walletTransactions'));
      transaction.set(walletTxRef, {
        userId,
        type: 'credit',
        amount: amount,
        reason: 'Reward points redemption',
        referenceId: txRef.id,
        balanceBefore: currentBalance,
        balanceAfter: currentBalance + amount,
        createdAt: serverTimestamp()
      });
    });
  },`;

servicesCode = servicesCode.replace(
  "  getTransactions: (userId: string) => getDocuments<RewardTransaction>('rewardTransactions', [",
  redeemPointsFunction + "\n  getTransactions: (userId: string) => getDocuments<RewardTransaction>('rewardTransactions', ["
);

fs.writeFileSync('src/firebase/services.ts', servicesCode);
console.log('Patched services.ts');
