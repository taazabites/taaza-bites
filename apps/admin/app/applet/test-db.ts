import { initializeApp } from "firebase/app";
import { initializeFirestore, doc, getDoc } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json";

async function test(dbId: string) {
  try {
    const app = initializeApp(firebaseConfig, "test-app-" + dbId.replace(/[^a-zA-Z0-9]/g, ""));
    const db = initializeFirestore(app, {}, dbId);
    const snap = await getDoc(doc(db, "settings", "business_profile"));
    console.log(`Database "${dbId}": SUCCESS, exists: ${snap.exists()}`);
    return true;
  } catch (err: any) {
    const msg = err.message || "";
    if (msg.includes("Missing or insufficient permissions")) {
      console.log(`Database "${dbId}": EXISTS (permission denied as expected)`);
      return true;
    } else {
      // Database does not exist (not-found)
      return false;
    }
  }
}

async function run() {
  const prefixes = [
    "taazabites",
    "taazabitescustomer",
    "taazabites-customer",
    "taazabitescust",
    "taazabites-cust",
    "taazabitesb2c",
    "taazabites-b2c",
    "taazabitescustomerp",
    "taazabites-customerp",
    "taazabitescustomerportal",
    "taazabites-customerportal",
    "taazabitesportal",
    "taazabites-portal",
    "taazabitesclient",
    "taazabites-client",
    "taazabitesweb",
    "taazabites-web",
    "taazabiteswebsite",
    "taazabites-website",
    "taazabitesstorefront",
    "taazabites-storefront",
    "taazabitesuser",
    "taazabites-user",
    "taazabites-admin",
    "taazabitesadmin"
  ];
  
  const appletId = "f2702470-dbd9-4fd8-8d80-708eb0bdb4c2";
  
  for (const prefix of prefixes) {
    const dbId = `ai-studio-${prefix}-${appletId}`;
    await test(dbId);
  }
}

run();
