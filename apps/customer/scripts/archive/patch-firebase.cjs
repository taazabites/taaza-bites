const fs = require('fs');

let clientCode = fs.readFileSync('src/firebase/firebase.ts', 'utf8');
clientCode = clientCode.replace(
  /const firebaseConfig = \{[\s\S]*?\};/,
  `const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || config.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || config.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || config.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || config.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || config.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || config.appId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || config.firestoreDatabaseId
};`
);
fs.writeFileSync('src/firebase/firebase.ts', clientCode);

let adminCode = fs.readFileSync('src/firebase/firebase-admin.ts', 'utf8');
adminCode = adminCode.replace(
  /const dbId = \!config\.firestoreDatabaseId \|\| config\.firestoreDatabaseId === "\(default\)"[\s\S]*?\: config\.firestoreDatabaseId;/,
  `const dbId = process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || 
  (!config.firestoreDatabaseId || config.firestoreDatabaseId === "(default)"
    ? undefined
    : config.firestoreDatabaseId);`
);
fs.writeFileSync('src/firebase/firebase-admin.ts', adminCode);

console.log("Firebase config updated.");
