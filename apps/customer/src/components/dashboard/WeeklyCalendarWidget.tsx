import React from 'react';
import { Card } from '../ui/primitives';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { Check, PauseCircle, Clock, FastForward, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MealSchedule } from '../../firebase/collections';

interface WeeklyCalendarProps {
  schedules: MealSchedule[];
}

export default function WeeklyCalendarWidget({ schedules }: WeeklyCalendarProps) {
  const today = new Date();
  const startDate = startOfWeek(today, { weekStartsOn: 1 }); // Monday

  const days = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'delivered': return <Check className="w-3 h-3 text-emerald-500" />;
      case 'skipped': return <FastForward className="w-3 h-3 text-amber-500" />;
      case 'paused': return <PauseCircle className="w-3 h-3 text-rose-500" />;
      case 'pending':
      case 'scheduled': return <Clock className="w-3 h-3 text-zinc-400" />;
      default: return <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700" />;
    }
  };

  return (
    <Card className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-white/5 p-6 rounded-[2rem]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Weekly Outlook</h2>
          <p className="text-sm font-bold text-zinc-900 dark:text-white">Your Meal Rhythm</p>
        </div>
        <Link to="/dashboard/calendar" className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </Link>
      </div>

      <div className="flex justify-between items-stretch">
        {days.map((date) => {
          const isToday = isSameDay(date, today);
          const dateStr = format(date, 'yyyy-MM-dd');
          const schedule = schedules.find(s => s.date === dateStr);
          const status = schedule?.deliveryStatus || (schedule as any)?.status;
          
          return (
            <Link 
              key={date.toISOString()} 
              to={`/dashboard/calendar?date=${dateStr}`}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <span className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`}>
                {format(date, 'EE').charAt(0)}
              </span>
              
              <div 
                className={`w-8 h-12 sm:w-10 sm:h-14 rounded-full flex flex-col items-center justify-between py-2 transition-all group-hover:scale-105
                  ${isToday 
                    ? 'bg-zinc-900 dark:bg-white shadow-md' 
                    : 'bg-zinc-50 dark:bg-zinc-800/50'
                  }
                `}
              >
                <span className={`text-xs font-bold ${isToday ? 'text-white dark:text-zinc-900' : 'text-zinc-500'}`}>
                  {format(date, 'd')}
                </span>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isToday ? 'bg-white/10 dark:bg-black/10' : 'bg-white dark:bg-zinc-900 shadow-sm'}`}>
                  {getStatusIcon(status)}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
