import { useEffect, useRef } from "react";
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../firebase/db";
import { useAuth } from "../context/AuthContext";

/**
 * Client-side subscription lifecycle reminders:
 * - 1 day before expiry
 * - 3 days after expiry if no new active subscription / order
 *
 * Writes to Firestore `notifications` (in-app). FCM push can attach later.
 */
export function useSubscriptionLifecycleNotifications() {
  const { currentUser } = useAuth();
  const ran = useRef(false);

  useEffect(() => {
    if (!currentUser?.uid || ran.current) return;
    ran.current = true;

    const run = async () => {
      try {
        const uid = currentUser.uid;
        const subsSnap = await getDocs(
          query(collection(db, "subscriptions"), where("userId", "==", uid), limit(20))
        );

        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;

        for (const docSnap of subsSnap.docs) {
          const sub = docSnap.data() as any;
          const endRaw = sub.endDate?.toDate ? sub.endDate.toDate() : sub.endDate ? new Date(sub.endDate) : null;
          if (!endRaw || Number.isNaN(endRaw.getTime())) continue;
          const end = endRaw.getTime();
          const status = String(sub.status || "").toLowerCase();

          // 1 day before expiry
          const msUntilEnd = end - now;
          if (msUntilEnd > 0 && ["active", "paused", "expiring"].includes(status)) {
            const daysLeft = Math.ceil(msUntilEnd / dayMs);
            if ([7, 3, 1].includes(daysLeft)) {
              await maybeNotify(uid, `expiry_${daysLeft}d_${docSnap.id}`, {
                title: daysLeft === 1 ? "Subscription expires tomorrow" : `Subscription expires in ${daysLeft} days`,
                message:
                  "Renew now so your meals continue without a break.",
                type: "renewal",
                link: `/plans?mode=renew&subscriptionId=${docSnap.id}`,
              });
            }
          }

          // 3 days after expiry — win-back if still inactive
          const msAfterEnd = now - end;
          if (msAfterEnd >= 3 * dayMs && msAfterEnd < 4 * dayMs) {
            const hasActive = subsSnap.docs.some((d) => {
              const s = d.data() as any;
              return String(s.status || "").toLowerCase() === "active";
            });
            if (!hasActive) {
              await maybeNotify(uid, `expired_winback_${docSnap.id}`, {
                title: "We miss your healthy meals",
                message:
                  "It's been 3 days since your plan ended. Come back with a special renewal offer waiting for you.",
                type: "offer",
                link: "/plans",
              });
            }
          }
        }
      } catch (err) {
        console.warn("[lifecycle-notifications]", err);
      }
    };

    run();
  }, [currentUser?.uid]);
}

async function maybeNotify(
  userId: string,
  dedupeKey: string,
  payload: { title: string; message: string; type: string; link: string }
) {
  const flagKey = `taaza_notif_${dedupeKey}`;
  if (localStorage.getItem(flagKey)) return;

  await addDoc(collection(db, "notifications"), {
    userId,
    title: payload.title,
    message: payload.message,
    type: payload.type,
    link: payload.link,
    read: false,
    createdAt: serverTimestamp(),
    dedupeKey,
  });

  localStorage.setItem(flagKey, "1");
}
