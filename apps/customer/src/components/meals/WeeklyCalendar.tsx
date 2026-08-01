import { useState, useEffect } from "react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { Card } from "@/src/components/ui/primitives";
import { cn } from "@/src/lib/utils";
import { CheckCircle2, Circle, ChevronLeft, ChevronRight } from "lucide-react";

interface WeeklyCalendarProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
}

export default function WeeklyCalendar({ onDateSelect, selectedDate }: WeeklyCalendarProps) {
  const [startDate, setStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  const days = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Meal Timeline</h3>
        <div className="flex gap-1">
          <button 
            onClick={() => setStartDate(addDays(startDate, -7))}
            className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-zinc-400" />
          </button>
          <button 
            onClick={() => setStartDate(addDays(startDate, 7))}
            className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          
          return (
            <button
              key={day.toString()}
              onClick={() => onDateSelect(day)}
              className={cn(
                "flex flex-col items-center py-4 rounded-2xl border-2 transition-all group",
                isSelected 
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20" 
                  : "bg-white border-zinc-100 text-zinc-600 hover:border-zinc-200"
              )}
            >
              <span className={cn(
                "text-[10px] font-black uppercase tracking-tighter mb-1",
                isSelected ? "text-emerald-100" : "text-zinc-400"
              )}>
                {format(day, 'EEE')}
              </span>
              <span className="text-lg font-black">{format(day, 'd')}</span>
              {isToday && !isSelected && (
                <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
