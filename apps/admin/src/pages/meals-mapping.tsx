import { useEffect, useState } from "react";
import { collection, doc, getDocs, limit, query, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "../contexts/auth-context";
import { writeAuditLog } from "../lib/audit-log";
import { toast } from "sonner";

export default function MealsMappingPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Record<string, any>[]>([]);
  const [meals, setMeals] = useState<Record<string, any>[]>([]);
  const [planId, setPlanId] = useState("");
  const [mealId, setMealId] = useState("");

  useEffect(() => {
    Promise.all([
      getDocs(query(collection(db, "subscriptionPlans"), limit(100))),
      getDocs(query(collection(db, "meals"), limit(200))),
    ]).then(([p, m]) => {
      setPlans(p.docs.map((d) => ({ id: d.id, ...d.data() })));
      setMeals(m.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const save = async () => {
    if (!planId || !mealId) return;
    const id = `${planId}_${mealId}`;
    await setDoc(doc(db, "planMealMaps", id), {
      planId,
      mealId,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }, { merge: true });
    await writeAuditLog({
      adminId: user?.id,
      adminName: user?.name,
      action: "UPDATE",
      entityType: "planMealMap",
      entityId: id,
      newValue: { planId, mealId },
    });
    toast.success("Mapping saved to Firestore.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Plan Mapping</h1>
        <p className="text-sm text-zinc-400 mt-1">Attach meals to subscription plans. Historical planSnapshot on customers is not changed.</p>
      </div>
      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader><CardTitle className="text-white text-base">Map meal → plan</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-3">
          <select className="bg-zinc-900 border border-zinc-800 rounded px-2 py-2" value={planId} onChange={(e) => setPlanId(e.target.value)}>
            <option value="">Select plan</option>
            {plans.map((p) => <option key={p.id} value={p.id}>{p.name || p.id}</option>)}
          </select>
          <select className="bg-zinc-900 border border-zinc-800 rounded px-2 py-2" value={mealId} onChange={(e) => setMealId(e.target.value)}>
            <option value="">Select meal</option>
            {meals.map((m) => <option key={m.id} value={m.id}>{m.mealName || m.name || m.id}</option>)}
          </select>
          <Button onClick={save} className="bg-emerald-600 text-zinc-950">Save mapping</Button>
        </CardContent>
      </Card>
      <p className="text-xs text-zinc-500">
        {plans.length === 0 && meals.length === 0 ? "No plans or meals in this Firestore database yet." : `${plans.length} plans · ${meals.length} meals`}
      </p>
    </div>
  );
}
