import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DeliveryEarning } from "@/types";
import { startOfTodayMs } from "@/lib/status";

function startOfWeekMs() {
  const d = new Date();
  const day = (d.getDay() + 6) % 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d.getTime();
}

function startOfMonthMs() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function usePartnerEarnings(partnerId?: string) {
  const [rows, setRows] = useState<DeliveryEarning[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!partnerId) return;
    const q = query(collection(db, "deliveryEarnings"), where("partnerId", "==", partnerId));
    return onSnapshot(
      q,
      (snap) => {
        setRows(
          snap.docs.map((d) => {
            const data = d.data() as Record<string, unknown>;
            return {
              id: d.id,
              partnerId: String(data.partnerId || ""),
              deliveryId: String(data.deliveryId || ""),
              orderId: String(data.orderId || ""),
              baseAmount: Number(data.baseAmount || 0),
              bonus: Number(data.bonus || 0),
              adjustment: Number(data.adjustment || 0),
              totalAmount: Number(data.totalAmount || 0),
              status: String(data.status || ""),
              createdAt: Number(data.createdAt || 0),
            };
          })
        );
        setLoading(false);
      },
      () => setLoading(false)
    );
  }, [partnerId]);

  const totals = useMemo(() => {
    const sum = (from: number) =>
      rows.filter((r) => r.createdAt >= from).reduce((acc, r) => acc + r.totalAmount, 0);
    const todayCount = rows.filter((r) => r.createdAt >= startOfTodayMs()).length;
    const monthCount = rows.filter((r) => r.createdAt >= startOfMonthMs()).length;
    const monthTotal = sum(startOfMonthMs());
    return {
      today: sum(startOfTodayMs()),
      week: sum(startOfWeekMs()),
      month: monthTotal,
      completed: rows.length,
      avg: monthCount ? monthTotal / monthCount : 0,
      todayCount,
    };
  }, [rows]);

  return { rows, totals, loading };
}
