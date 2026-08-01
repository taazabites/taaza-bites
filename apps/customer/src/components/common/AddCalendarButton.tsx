import React, { useState, useRef, useEffect } from 'react';
import { CalendarPlus, Calendar, Download, ChevronDown } from 'lucide-react';
import { parseMealDateTime, getGoogleCalendarUrl, downloadIcsFile } from '../../utils/calendar';
import { cn } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';

interface AddCalendarButtonProps {
  id: string;
  dateStr: string; // e.g., "2026-07-27"
  mealType: string; // e.g., "Breakfast"
  mealName: string; // e.g., "High-Protein Scrambled Eggs"
  deliveryTimeStr?: string; // e.g., "08:30 AM"
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  className?: string;
  variant?: 'outline' | 'ghost' | 'emerald' | 'white';
  showLabel?: boolean;
}

export function AddCalendarButton({
  id,
  dateStr,
  mealType,
  mealName,
  deliveryTimeStr,
  calories,
  protein,
  carbs,
  fat,
  className,
  variant = 'outline',
  showLabel = true,
}: AddCalendarButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  // Close the dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPayload = () => {
    const { start, end } = parseMealDateTime(dateStr, mealType, deliveryTimeStr);
    
    // Construct descriptions
    const macros = [
      protein !== undefined ? `${protein}g P` : '',
      carbs !== undefined ? `${carbs}g C` : '',
      fat !== undefined ? `${fat}g F` : '',
    ].filter(Boolean).join(' | ');

    const description = `Your freshly prepared Taaza Bites ${mealType} delivery is scheduled!\n\n` +
      `Meal: ${mealName}\n` +
      (calories ? `Calories: ${calories} kcal\n` : '') +
      (macros ? `Macros: ${macros}\n\n` : '\n') +
      `Stay fresh, healthy and eat delicious!`;

    return {
      id,
      title: `Taaza Bites: ${mealType} Delivery (${mealName})`,
      description,
      location: 'Your registered delivery address',
      start,
      end,
    };
  };

  const handleGoogleCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const payload = getPayload();
      const url = getGoogleCalendarUrl(payload);
      window.open(url, '_blank', 'noopener,noreferrer');
      showToast(`Opening Google Calendar for your ${mealType} reminder!`, 'success');
    } catch (error) {
      showToast('Could not open Google Calendar.', 'error');
    }
    setIsOpen(false);
  };

  const handleIcsDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const payload = getPayload();
      downloadIcsFile(payload);
      showToast(`Downloaded delivery reminder (.ics) for ${mealType}!`, 'success');
    } catch (error) {
      showToast('Could not download the calendar file.', 'error');
    }
    setIsOpen(false);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // Button classes
  const buttonBase = "relative flex items-center justify-center gap-1.5 font-bold transition-all active:scale-95 text-xs rounded-xl cursor-pointer";
  
  const variants = {
    outline: "border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-3 py-1.5",
    ghost: "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 p-2",
    emerald: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/10 px-3 py-1.5",
    white: "bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/20 px-3 py-1.5",
  };

  return (
    <div className={cn("relative inline-block text-left", className)} ref={containerRef}>
      <button
        onClick={toggleDropdown}
        className={cn(buttonBase, variants[variant])}
        title="Add to calendar / Set reminder"
      >
        <CalendarPlus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        {showLabel && <span className="whitespace-nowrap">Add to Calendar</span>}
        <ChevronDown className={cn("w-3 h-3 opacity-60 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-zinc-900 border border-zinc-200/95 dark:border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <div className="px-3 py-1.5 border-b border-zinc-100 dark:border-zinc-800/80 mb-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Set Meal Reminder
            </span>
          </div>

          <button
            onClick={handleGoogleCalendar}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-left transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Google Calendar</span>
          </button>

          <button
            onClick={handleIcsDownload}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-left transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>iCal / Outlook (.ics)</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default AddCalendarButton;
