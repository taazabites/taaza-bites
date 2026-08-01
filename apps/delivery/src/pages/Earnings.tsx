import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { IndianRupee, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { format, startOfDay, startOfWeek, startOfMonth } from "date-fns";

interface Settlement {
  id: string;
  amount: number;
  type: 'delivery_fee' | 'bonus' | 'penalty' | 'tip';
  timestamp: number;
  description: string;
}

export default function Earnings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [settlements, setSettlements] = useState<Settlement[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchEarnings = async () => {
      try {
        const q = query(
          collection(db, "deliverySettlements"),
          where("partnerId", "==", user.uid),
          orderBy("timestamp", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Settlement[];
        
        setSettlements(data);
      } catch (error) {
        console.error("Error fetching settlements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [user]);

  if (loading) {
    return <div className="p-8 flex justify-center">Loading earnings...</div>;
  }

  const now = new Date();
  const todayStart = startOfDay(now).getTime();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }).getTime();
  const monthStart = startOfMonth(now).getTime();

  const aggregate = (filterFn: (s: Settlement) => boolean) => {
    const filtered = settlements.filter(filterFn);
    return {
      total: filtered.reduce((acc, s) => acc + (s.type === 'penalty' ? -s.amount : s.amount), 0),
      deliveries: filtered.reduce((acc, s) => acc + (s.type === 'delivery_fee' ? s.amount : 0), 0),
      bonuses: filtered.reduce((acc, s) => acc + (s.type === 'bonus' || s.type === 'tip' ? s.amount : 0), 0),
      penalties: filtered.reduce((acc, s) => acc + (s.type === 'penalty' ? s.amount : 0), 0),
    };
  };

  const daily = aggregate(s => s.timestamp >= todayStart);
  const weekly = aggregate(s => s.timestamp >= weekStart);
  const monthly = aggregate(s => s.timestamp >= monthStart);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Earnings</h2>
        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full font-semibold flex items-center gap-2">
          <Wallet className="size-4" />
          Balance: ₹{monthly.total.toFixed(2)}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-6 bg-emerald-600 rounded-2xl text-white border-none shadow-lg">
          <p className="text-emerald-100 font-medium text-sm mb-1 uppercase tracking-wider">Today's Earnings</p>
          <p className="text-4xl font-bold mb-4">₹{daily.total.toFixed(2)}</p>
          <div className="space-y-1 text-sm text-emerald-50">
            <div className="flex justify-between">
              <span>Deliveries</span>
              <span>₹{daily.deliveries.toFixed(2)}</span>
            </div>
            {daily.bonuses > 0 && (
              <div className="flex justify-between">
                <span>Tips & Bonuses</span>
                <span>+₹{daily.bonuses.toFixed(2)}</span>
              </div>
            )}
            {daily.penalties > 0 && (
              <div className="flex justify-between text-red-200">
                <span>Penalties</span>
                <span>-₹{daily.penalties.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 font-medium text-sm mb-1 uppercase tracking-wider">This Week</p>
          <p className="text-3xl font-bold text-slate-800 mb-4">₹{weekly.total.toFixed(2)}</p>
          <div className="space-y-1 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Deliveries</span>
              <span className="font-medium text-slate-800">₹{weekly.deliveries.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tips & Bonuses</span>
              <span className="font-medium text-emerald-600">+₹{weekly.bonuses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Penalties</span>
              <span className="font-medium text-red-600">-₹{weekly.penalties.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 font-medium text-sm mb-1 uppercase tracking-wider">This Month</p>
          <p className="text-3xl font-bold text-slate-800 mb-4">₹{monthly.total.toFixed(2)}</p>
          <div className="space-y-1 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Deliveries</span>
              <span className="font-medium text-slate-800">₹{monthly.deliveries.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tips & Bonuses</span>
              <span className="font-medium text-emerald-600">+₹{monthly.bonuses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Penalties</span>
              <span className="font-medium text-red-600">-₹{monthly.penalties.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Transactions</h3>
        {settlements.length === 0 ? (
          <div className="text-center py-8 text-slate-500 bg-white rounded-xl border border-slate-200">
            No recent transactions
          </div>
        ) : (
          <div className="space-y-3">
            {settlements.slice(0, 20).map((s) => (
              <div key={s.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
                    s.type === 'penalty' ? 'bg-red-50 text-red-600' :
                    s.type === 'bonus' || s.type === 'tip' ? 'bg-emerald-50 text-emerald-600' :
                    'bg-slate-50 text-slate-600'
                  }`}>
                    {s.type === 'penalty' ? <ArrowDownRight className="size-5" /> : <ArrowUpRight className="size-5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{s.description || 'Delivery Pay'}</p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(s.timestamp), 'MMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                </div>
                <div className={`font-bold text-lg ${
                  s.type === 'penalty' ? 'text-red-600' : 'text-slate-800'
                }`}>
                  {s.type === 'penalty' ? '-' : '+'}₹{s.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
