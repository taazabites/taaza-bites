const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

code = code.replace(/import \{ \n  doc, \n  onSnapshot, \n  updateDoc, \n  serverTimestamp, \n  collection, \n  query, \n  where, \n  orderBy, \n  limit, \n  getDoc,\n  setDoc,\n  addDoc\n\} from 'firebase\/firestore';/, 
`import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  serverTimestamp, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDoc,
  getDocs,
  setDoc,
  addDoc
} from 'firebase/firestore';`);

// We'll just replace the useEffect block from "useEffect(() => {" to "return () => {" for the listeners.
// But it's easier to replace specific onSnapshots.

code = code.replace(/const unsubUser = onSnapshot\(doc\(db, 'users', currentUser.uid\), \(snap\) => \{[\s\S]*?\}, \(err\) => console.error\("User profile listen error:", err\)\);/,
`getDoc(doc(db, 'users', currentUser.uid)).then(snap => { if(snap.exists()) setUserDoc(snap.data()); }).catch(err => console.error(err));`);

code = code.replace(/const unsubHealth = onSnapshot\(doc\(db, 'healthAssessments', currentUser.uid\), \(snap\) => \{[\s\S]*?\}, \(err\) => console.error\("Health assessment listen error:", err\)\);/,
`getDoc(doc(db, 'healthAssessments', currentUser.uid)).then(snap => { if(snap.exists()) setHealthAssessment(snap.data()); else setHealthAssessment(null); }).catch(err => console.error(err));`);

code = code.replace(/const unsubWallet = onSnapshot\(doc\(db, 'wallets', currentUser.uid\), \(snap\) => \{[\s\S]*?\}, \(err\) => console.error\("Wallet listen error:", err\)\);/,
`getDoc(doc(db, 'wallets', currentUser.uid)).then(snap => { if(snap.exists()) setWallet(snap.data()); else setWallet(null); }).catch(err => console.error(err));`);

code = code.replace(/const unsubReward = onSnapshot\(doc\(db, 'rewardPoints', currentUser.uid\), \(snap\) => \{[\s\S]*?\}, \(err\) => console.error\("Rewards listen error:", err\)\);/,
`getDoc(doc(db, 'rewardPoints', currentUser.uid)).then(snap => { if(snap.exists()) setRewards(snap.data()); else setRewards(null); }).catch(err => console.error(err));`);

code = code.replace(/const unsubCoupons = onSnapshot\(couponsQ, \(snap\) => \{[\s\S]*?\}, \(err\) => console.error\("Coupons listen error:", err\)\);/,
`getDocs(couponsQ).then(snap => setCoupons(snap.docs.map(d => ({ id: d.id, ...d.data() })))).catch(err => console.error(err));`);

// And we need to remove them from the cleanup block
code = code.replace(/unsubUser\(\);\n\s*unsubSub\(\);\n\s*unsubHealth\(\);\n\s*unsubWallet\(\);\n\s*unsubReward\(\);\n\s*unsubCoupons\(\);\n\s*unsubSchedule\(\);\n\s*unsubNotif\(\);\n\s*unsubOrder\(\);/,
`unsubSub();\n      unsubSchedule();\n      unsubNotif();\n      unsubOrder();`);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
