import { adminDb } from "../../firebase/firebase-admin.ts";
import { FieldValue } from "firebase-admin/firestore";

/**
 * UTILITY: Migrate legacy user data to modular collections.
 * Step 2 of the Migration Plan.
 */
export async function migrateLegacyUsers() {
  console.log("Starting legacy user migration...");
  const usersSnap = await adminDb.collection("users").get();
  
  const batch = adminDb.batch();
  let count = 0;

  for (const doc of usersSnap.docs) {
    const data = doc.data();
    const userId = doc.id;

    // 1. Create Customer Profile
    const profileRef = adminDb.collection("customerProfiles").doc(userId);
    batch.set(profileRef, {
      userId,
      name: data.name || data.displayName || "",
      photoURL: data.photoURL || "",
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    // 2. Create Customer Preferences
    const prefsRef = adminDb.collection("customerPreferences").doc(userId);
    batch.set(prefsRef, {
      userId,
      dietType: data.dietaryPreference || "General",
      deliverySlot: data.deliverySlot || "Morning",
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    count++;
    if (count % 500 === 0) {
      await batch.commit();
      console.log(`Migrated ${count} users...`);
    }
  }

  await batch.commit();
  console.log(`Migration complete. Total users processed: ${count}`);
}
