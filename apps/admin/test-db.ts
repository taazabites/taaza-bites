import { initializeApp } from "firebase/app";
import { initializeFirestore, doc, getDoc } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json";

async function test(dbId: string) {
  try {
    // We use a unique app name for each database ID to avoid registration conflicts
    const app = initializeApp(firebaseConfig, "test-app-" + dbId.replace(/[^a-zA-Z0-9]/g, ""));
    const db = initializeFirestore(app, {}, dbId);
    const snap = await getDoc(doc(db, "settings", "business_profile"));
    console.log(`Database "${dbId}": SUCCESS, exists: ${snap.exists()}`);
  } catch (err: any) {
    console.log(`Database "${dbId}": FAILED, error: ${err.message || err}`);
  }
}

async function run() {
  const candidates = [
    "ai-studio-taazabitesadmint-f2702470-dbd9-4fd8-8d80-708eb0bdb4c2",
    "ai-studio-taazabitescustomer-f2702470-dbd9-4fd8-8d80-708eb0bdb4c2",
    "ai-studio-taazabites-f2702470-dbd9-4fd8-8d80-708eb0bdb4c2",
    "ai-studio-taazabitescustomerportal-f2702470-dbd9-4fd8-8d80-708eb0bdb4c2",
    "(default)"
  ];
  for (const dbId of candidates) {
    await test(dbId);
  }
}

run();
