import React from 'react';
import { Card } from '../ui/primitives';
import { ShieldCheck, CalendarClock, ArrowUpRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Subscription } from '../../firebase/collections';

interface SubscriptionWidgetProps {
  subscription?: Subscription;
}

export default function SubscriptionWidget({ subscription }: SubscriptionWidgetProps) {
  if (!subscription) return null;

  return (
    <Card className="bg-emerald-600 dark:bg-emerald-500 text-white border-none p-6 rounded-[2rem] relative overflow-hidden shadow-xl shadow-emerald-600/20 dark:shadow-none">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none" />
      
      <div className="flex items-start justify-between relative z-10 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-200" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">
              Active Plan
            </span>
          </div>
          <h3 className="text-xl font-black tracking-tight">{subscription.planName}</h3>
        </div>
        <Link to="/dashboard/subscriptions" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">Remaining</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-200" />
          </div>
          <p className="text-2xl font-black">{subscription.daysRemaining} <span className="text-sm font-bold text-emerald-200">meals</span></p>
        </div>
        
        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">Renewal</span>
            <CalendarClock className="w-3.5 h-3.5 text-emerald-200" />
          </div>
          <p className="text-2xl font-black">
            {Math.max(0, Math.ceil((new Date((subscription.endDate as any)?.toDate ? (subscription.endDate as any).toDate() : subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} 
            <span className="text-sm font-bold text-emerald-200"> days</span>
          </p>
        </div>
      </div>
    </Card>
  );
}
