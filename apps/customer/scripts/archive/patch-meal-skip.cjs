const fs = require('fs');

let servicesCode = fs.readFileSync('src/firebase/services.ts', 'utf8');

// 1. Add runTransaction, doc to imports from 'firebase/firestore'
if (!servicesCode.includes('runTransaction')) {
  servicesCode = servicesCode.replace(
    "import { \n  collection,",
    "import { \n  runTransaction,\n  doc,\n  collection,"
  );
}

// 2. Replace skipMeal and unskipMeal
const skipMealRegex = /skipMeal: \(scheduleId: string\) => updateDocument\('mealSchedules', scheduleId, {[\s\S]*?}\),/;
const unskipMealRegex = /unskipMeal: \(scheduleId: string\) => updateDocument\('mealSchedules', scheduleId, {[\s\S]*?}\)/;

const newSkipUnskip = `skipMeal: async (scheduleId: string, userId: string) => {
    return runTransaction(db, async (transaction) => {
      const scheduleRef = doc(db, 'mealSchedules', scheduleId);
      const scheduleDoc = await transaction.get(scheduleRef);
      if (!scheduleDoc.exists()) throw new Error("Schedule not found");
      
      const walletRef = doc(db, 'wallets', userId);
      const walletDoc = await transaction.get(walletRef);
      
      const refundAmount = 350; // Assume 350 per meal

      transaction.update(scheduleRef, {
        deliveryStatus: 'skipped',
        updatedAt: serverTimestamp()
      });

      if (walletDoc.exists()) {
        const newBalance = (walletDoc.data().balance || 0) + refundAmount;
        transaction.update(walletRef, {
          balance: newBalance,
          updatedAt: serverTimestamp()
        });
      } else {
        transaction.set(walletRef, {
          userId,
          balance: refundAmount,
          cashbackAvailable: 0,
          cashbackPending: 0,
          cashbackLifetime: 0,
          updatedAt: serverTimestamp()
        });
      }
      
      const txRef = doc(collection(db, 'walletTransactions'));
      transaction.set(txRef, {
        userId,
        type: 'credit',
        amount: refundAmount,
        reason: 'Refund for skipped meal',
        referenceId: scheduleId,
        balanceBefore: walletDoc.exists() ? walletDoc.data().balance || 0 : 0,
        balanceAfter: (walletDoc.exists() ? walletDoc.data().balance || 0 : 0) + refundAmount,
        createdAt: serverTimestamp()
      });
    });
  },
  unskipMeal: async (scheduleId: string, userId: string) => {
    return runTransaction(db, async (transaction) => {
      const scheduleRef = doc(db, 'mealSchedules', scheduleId);
      const scheduleDoc = await transaction.get(scheduleRef);
      if (!scheduleDoc.exists()) throw new Error("Schedule not found");
      
      const walletRef = doc(db, 'wallets', userId);
      const walletDoc = await transaction.get(walletRef);
      
      const deductAmount = 350;

      transaction.update(scheduleRef, {
        deliveryStatus: 'pending',
        updatedAt: serverTimestamp()
      });

      let currentBalance = 0;
      if (walletDoc.exists()) {
        currentBalance = walletDoc.data().balance || 0;
        const newBalance = Math.max(0, currentBalance - deductAmount);
        transaction.update(walletRef, {
          balance: newBalance,
          updatedAt: serverTimestamp()
        });
      }
      
      const txRef = doc(collection(db, 'walletTransactions'));
      transaction.set(txRef, {
        userId,
        type: 'debit',
        amount: deductAmount,
        reason: 'Debit for restored meal',
        referenceId: scheduleId,
        balanceBefore: currentBalance,
        balanceAfter: Math.max(0, currentBalance - deductAmount),
        createdAt: serverTimestamp()
      });
    });
  }`;

servicesCode = servicesCode.replace(skipMealRegex, '');
servicesCode = servicesCode.replace(unskipMealRegex, newSkipUnskip);

fs.writeFileSync('src/firebase/services.ts', servicesCode);
console.log('Patched services.ts');
