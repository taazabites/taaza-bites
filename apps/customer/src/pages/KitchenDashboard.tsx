import { useState, useEffect } from 'react';
import { KitchenService, DeliveryService } from '@/src/firebase/services';
import { KitchenQueueItem, MealStatus } from '@/src/firebase/collections';
import { Card } from '@/src/components/ui/primitives';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, Package, Utensils } from 'lucide-react';

export default function KitchenDashboard() {
  const [queue, setQueue] = useState<KitchenQueueItem[]>([]);

  useEffect(() => {
    const unsubscribe = KitchenService.subscribeToKitchenQueue((items) => {
      setQueue(items);
    });
    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (id: string, status: MealStatus) => {
    await KitchenService.updateMealStatus(id, status);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-black text-zinc-900">Kitchen Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Queue */}
        <KitchenColumn 
          title="Pending / Preparing" 
          items={queue.filter(i => ['Pending', 'Preparing', 'Cooking'].includes(i.status))} 
          onUpdate={handleStatusUpdate}
        />
        
        {/* Packing Station */}
        <KitchenColumn 
          title="Packing" 
          items={queue.filter(i => i.status === 'Packing')} 
          onUpdate={handleStatusUpdate}
        />
        
        {/* Ready for Dispatch */}
        <KitchenColumn 
          title="Ready / Dispatched" 
          items={queue.filter(i => ['Ready', 'Dispatched'].includes(i.status))} 
          onUpdate={handleStatusUpdate}
        />
      </div>
    </div>
  );
}

function KitchenColumn({ title, items, onUpdate }: { title: string, items: KitchenQueueItem[], onUpdate: (id: string, status: MealStatus) => void }) {
  return (
    <Card className="p-4 bg-white/50 backdrop-blur-xl border-zinc-200">
      <h2 className="text-lg font-bold text-zinc-800 mb-4">{title}</h2>
      <div className="space-y-3">
        {items.map(item => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-white border border-zinc-100 shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-sm text-zinc-900">{item.customerName}</span>
              <span className="text-[10px] font-mono bg-zinc-100 px-2 py-1 rounded-full">{item.deliverySlot}</span>
            </div>
            <p className="text-xs text-zinc-500 mb-2">{item.subscriptionPlan} - {item.mealType}</p>
            <div className="flex gap-3 mb-3 text-[10px] font-bold">
               <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">🔥 {Math.floor(Math.random() * 200 + 400)} kcal</span>
               <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">💪 {Math.floor(Math.random() * 20 + 20)}g Protein</span>
            </div>
            
            <div className="flex gap-2">
              {item.status === 'Pending' && <button onClick={() => onUpdate(item.id, 'Preparing')} className="text-xs font-bold text-blue-600">Start Prep</button>}
              {item.status === 'Preparing' && <button onClick={() => onUpdate(item.id, 'Cooking')} className="text-xs font-bold text-orange-600">Start Cooking</button>}
              {item.status === 'Cooking' && <button onClick={() => onUpdate(item.id, 'Packing')} className="text-xs font-bold text-purple-600">Pack</button>}
              {item.status === 'Packing' && <button onClick={() => onUpdate(item.id, 'Ready')} className="text-xs font-bold text-emerald-600">Ready</button>}
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
