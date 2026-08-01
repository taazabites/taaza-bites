import { addDays, format, parseISO, isWeekend, getDay, differenceInDays } from "date-fns";

export interface SmartPauseSuggestion {
  id: string;
  type: "long_weekend" | "work_trip" | "extended_vacation" | "holiday_season" | "pattern_match";
  title: string;
  subtitle: string;
  startDate: string; // YYYY-MM-DD
  resumeDate: string; // YYYY-MM-DD
  durationDays: number;
  reasoning: string;
  confidenceScore: number; // 0-100
  estimatedMealsSaved: number;
  estimatedAmountSaved: number;
  badgeText: string;
  autoResumeSupported: boolean;
}

export interface TravelPatternProfile {
  personaTitle: string;
  personaDescription: string;
  iconName: string;
  totalPastPauses: number;
  totalDaysFrozen: number;
  mealsPreserved: number;
  amountSaved: number;
  avgPauseDurationDays: number;
  topTravelDay: string; // e.g., "Friday - Monday"
  autoResumeEnabledByDefault: boolean;
}

export interface UpcomingHolidayWindow {
  id: string;
  holidayName: string;
  dateRangeText: string;
  startDate: string;
  suggestedResumeDate: string;
  durationDays: number;
  description: string;
}

// Simulated / Historical Pause Record
export interface PauseHistoryRecord {
  id: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  reason: string;
  autoResumed: boolean;
  createdAt: string;
}

// Preset Indian & International Long Weekend Calendar Windows
export const UPCOMING_HOLIDAY_FREEZES: UpcomingHolidayWindow[] = [
  {
    id: "ind_day_2026",
    holidayName: "Independence Day Long Weekend",
    dateRangeText: "Aug 15 - Aug 18, 2026",
    startDate: "2026-08-15",
    suggestedResumeDate: "2026-08-19",
    durationDays: 4,
    description: "4-day holiday weekend. Pause deliveries and save 8 meals automatically."
  },
  {
    id: "gandhi_jayanti_2026",
    holidayName: "Gandhi Jayanti Long Weekend",
    dateRangeText: "Oct 02 - Oct 05, 2026",
    startDate: "2026-10-02",
    suggestedResumeDate: "2026-10-06",
    durationDays: 4,
    description: "Oct 2 Friday long weekend. Auto-resume on Tuesday morning fresh."
  },
  {
    id: "diwali_2026",
    holidayName: "Diwali Festive Break",
    dateRangeText: "Nov 06 - Nov 11, 2026",
    startDate: "2026-11-06",
    suggestedResumeDate: "2026-11-12",
    durationDays: 6,
    description: "6-day Diwali holiday freeze. Zero wasted credits during home celebrations."
  },
  {
    id: "year_end_2026",
    holidayName: "Year-End Travel & New Year",
    dateRangeText: "Dec 25, 2026 - Jan 02, 2027",
    startDate: "2026-12-25",
    suggestedResumeDate: "2027-01-03",
    durationDays: 9,
    description: "Extended 9-day holiday pause. Smart notification before Jan 3 resume."
  }
];

// Sample default user pause history for smart AI analysis
export const DEFAULT_PAUSE_HISTORY: PauseHistoryRecord[] = [
  {
    id: "p1",
    startDate: "2026-05-15",
    endDate: "2026-05-18",
    durationDays: 3,
    reason: "Weekend trip to Coorg",
    autoResumed: true,
    createdAt: "2026-05-14T10:00:00Z"
  },
  {
    id: "p2",
    startDate: "2026-06-12",
    endDate: "2026-06-16",
    durationDays: 4,
    reason: "Goa getaway weekend",
    autoResumed: true,
    createdAt: "2026-06-11T14:30:00Z"
  },
  {
    id: "p3",
    startDate: "2026-07-03",
    endDate: "2026-07-07",
    durationDays: 4,
    reason: "Monsoon retreat",
    autoResumed: true,
    createdAt: "2026-07-02T09:15:00Z"
  }
];

/**
 * Calculates smart resume suggestions based on selected start date and historical travel patterns
 */
export function generateSmartPauseSuggestions(
  selectedStartDate: string,
  history: PauseHistoryRecord[] = DEFAULT_PAUSE_HISTORY,
  mealsPerDay: number = 2,
  pricePerMeal: number = 130
): SmartPauseSuggestion[] {
  let startObj: Date;
  try {
    startObj = parseISO(selectedStartDate);
  } catch {
    startObj = new Date();
  }

  const startDayOfWeek = getDay(startObj); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat

  // Option 1: Weekend Getaway (3-4 Days) -> Resumes Monday Morning
  let longWeekendResume: Date;
  if (startDayOfWeek === 5) {
    // Starting Friday -> Resume Tuesday (4 days) or Monday
    longWeekendResume = addDays(startObj, 3); // Friday -> Resume Monday
  } else if (startDayOfWeek === 6) {
    // Starting Saturday -> Resume Tuesday
    longWeekendResume = addDays(startObj, 3);
  } else {
    // Midweek -> 3 days
    longWeekendResume = addDays(startObj, 3);
  }
  const lwStartStr = format(startObj, "yyyy-MM-dd");
  const lwResumeStr = format(longWeekendResume, "yyyy-MM-dd");
  const lwDays = Math.max(1, differenceInDays(longWeekendResume, startObj));
  const lwMeals = lwDays * mealsPerDay;

  // Option 2: Work Trip / 5-Day Freeze -> Resumes Next Work Week
  const workTripResume = addDays(startObj, 5);
  const wtResumeStr = format(workTripResume, "yyyy-MM-dd");
  const wtDays = 5;
  const wtMeals = wtDays * mealsPerDay;

  // Option 3: Full 7-Day Vacation -> Resumes Same Day Next Week
  const vacationResume = addDays(startObj, 7);
  const vacResumeStr = format(vacationResume, "yyyy-MM-dd");
  const vacDays = 7;
  const vacMeals = vacDays * mealsPerDay;

  // Option 4: Smart Pattern Match from History
  // Analyze average pause duration in history
  const totalDays = history.reduce((acc, curr) => acc + curr.durationDays, 0);
  const avgDuration = history.length > 0 ? Math.round(totalDays / history.length) : 4;
  const patternResume = addDays(startObj, avgDuration);
  const patternResumeStr = format(patternResume, "yyyy-MM-dd");

  return [
    {
      id: "smart_weekend_getaway",
      type: "long_weekend",
      title: "Weekend Getaway (Resume Monday)",
      subtitle: `${lwDays} Days Freeze · Auto-resumes ${format(longWeekendResume, "EEE, MMM d")}`,
      startDate: lwStartStr,
      resumeDate: lwResumeStr,
      durationDays: lwDays,
      reasoning: `Matches typical Friday-Sunday weekend travel pattern. Fresh breakfast ready when you return on ${format(longWeekendResume, "EEEE")}.`,
      confidenceScore: 96,
      estimatedMealsSaved: lwMeals,
      estimatedAmountSaved: lwMeals * pricePerMeal,
      badgeText: "AI Recommended ⚡",
      autoResumeSupported: true
    },
    {
      id: "smart_pattern_history",
      type: "pattern_match",
      title: `Frequent ${avgDuration}-Day Travel Pattern`,
      subtitle: `${avgDuration} Days Freeze · Resumes ${format(patternResume, "EEE, MMM d")}`,
      startDate: lwStartStr,
      resumeDate: patternResumeStr,
      durationDays: avgDuration,
      reasoning: `Based on your past ${history.length} vacation freezes averaging ${avgDuration} days. 100% credit rollover guaranteed.`,
      confidenceScore: 88,
      estimatedMealsSaved: avgDuration * mealsPerDay,
      estimatedAmountSaved: avgDuration * mealsPerDay * pricePerMeal,
      badgeText: "Matches Your History 📊",
      autoResumeSupported: true
    },
    {
      id: "smart_work_trip",
      type: "work_trip",
      title: "5-Day Work / Business Trip",
      subtitle: `${wtDays} Days Freeze · Resumes ${format(workTripResume, "EEE, MMM d")}`,
      startDate: lwStartStr,
      resumeDate: wtResumeStr,
      durationDays: wtDays,
      reasoning: "Ideal for mid-week business trips. Keeps subscription paused through the working week.",
      confidenceScore: 82,
      estimatedMealsSaved: wtMeals,
      estimatedAmountSaved: wtMeals * pricePerMeal,
      badgeText: "Business Traveler 💼",
      autoResumeSupported: true
    },
    {
      id: "smart_extended_vacation",
      type: "extended_vacation",
      title: "1-Week Full Vacation Freeze",
      subtitle: `${vacDays} Days Freeze · Resumes ${format(vacationResume, "EEE, MMM d")}`,
      startDate: lwStartStr,
      resumeDate: vacResumeStr,
      durationDays: vacDays,
      reasoning: "Complete 7-day pause with pre-return reminder sent 24h before resuming.",
      confidenceScore: 75,
      estimatedMealsSaved: vacMeals,
      estimatedAmountSaved: vacMeals * pricePerMeal,
      badgeText: "Holiday Escape 🏖️",
      autoResumeSupported: true
    }
  ];
}

/**
 * Computes travel persona and statistics from pause history
 */
export function analyzeTravelPatternProfile(
  history: PauseHistoryRecord[] = DEFAULT_PAUSE_HISTORY,
  mealsPerDay: number = 2,
  pricePerMeal: number = 130
): TravelPatternProfile {
  const totalPastPauses = history.length;
  const totalDaysFrozen = history.reduce((acc, h) => acc + h.durationDays, 0);
  const mealsPreserved = totalDaysFrozen * mealsPerDay;
  const amountSaved = mealsPreserved * pricePerMeal;
  const avgPauseDurationDays = totalPastPauses > 0 ? parseFloat((totalDaysFrozen / totalPastPauses).toFixed(1)) : 0;

  let personaTitle = "Weekend Getaway Explorer";
  let personaDescription = "You frequently freeze subscriptions during weekends to explore new places without losing meal credits.";
  let iconName = "Plane";

  if (avgPauseDurationDays >= 6) {
    personaTitle = "Seasonal Vacationer";
    personaDescription = "You take extended 1-2 week breaks during holidays. Smart Pause automatically extends your plan validity.";
    iconName = "Sun";
  } else if (avgPauseDurationDays <= 2.5) {
    personaTitle = "Quick Trip Adventurer";
    personaDescription = "You use short 2-day pauses for quick getaways. Smart Auto-Resume keeps your meals aligned seamlessly.";
    iconName = "Compass";
  }

  return {
    personaTitle,
    personaDescription,
    iconName,
    totalPastPauses: totalPastPauses || 3,
    totalDaysFrozen: totalDaysFrozen || 11,
    mealsPreserved: mealsPreserved || 22,
    amountSaved: amountSaved || 2860,
    avgPauseDurationDays: avgPauseDurationDays || 3.7,
    topTravelDay: "Fri - Mon",
    autoResumeEnabledByDefault: true
  };
}
