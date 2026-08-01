import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from '../firebase/db';
import { doc, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";
import { Package, Clock, User, Phone, MapPin } from "lucide-react";
import { Card } from "@/src/components/ui/primitives";
import DashboardLayout from "../components/dashboard/DashboardLayout";

export default function OrderTracking() {
  const { orderId } = useParams();
  const [tracking, setTracking] = useState<any>(null);

  useEffect(() => {
    if (!orderId) return;
    const unsub = onSnapshot(doc(db, 'orders', orderId), (doc) => {
        if (doc.exists()) setTracking(doc.data());
    });
    return unsub;
  }, [orderId]);

  if (!tracking) return <DashboardLayout><div className="p-10">Loading tracking...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-8 p-6">
        <h1 className="text-2xl font-black">Live Order Tracking</h1>
        <Card className="p-6 rounded-3xl bg-white shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="font-bold text-lg">Order #{orderId?.slice(-6)}</h2>
                    <p className="text-emerald-600 font-bold">{tracking.status}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-zinc-500">ETA</p>
                    <p className="font-black text-xl">{tracking.eta || '30 mins'}</p>
                </div>
            </div>
            {/* Timeline Placeholder */}
            <div className="space-y-4">
                <div className="h-2 w-full bg-zinc-100 rounded-full"><div className="h-full bg-emerald-500 rounded-full" style={{width: '60%'}}></div></div>
            </div>
        </Card>

        <section className="grid grid-cols-2 gap-4">
            <Card className="p-4 rounded-3xl bg-white shadow-sm flex items-center gap-3">
                <User className="text-emerald-500" />
                <div>
                    <p className="text-xs text-zinc-400">Driver</p>
                    <p className="font-bold">{tracking.driverName || 'Rahul'}</p>
                </div>
            </Card>
            <Card className="p-4 rounded-3xl bg-white shadow-sm flex items-center gap-3">
                <Phone className="text-emerald-500" />
                <div>
                    <p className="text-xs text-zinc-400">Contact</p>
                    <p className="font-bold">{tracking.driverPhone || '+91 98765 43210'}</p>
                </div>
            </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}
