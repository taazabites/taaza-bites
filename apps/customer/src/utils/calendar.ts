/**
 * Utility for generating Calendar event files (.ics) and Google Calendar deep links
 */

export function parseMealDateTime(dateStr: string, mealType: string, deliveryTimeStr?: string): { start: Date; end: Date } {
  // Parse dateStr "YYYY-MM-DD"
  const dateParts = dateStr.split('-');
  const year = parseInt(dateParts[0], 10) || 2026;
  const month = (parseInt(dateParts[1], 10) || 1) - 1;
  const day = parseInt(dateParts[2], 10) || 1;

  // Default hours based on mealType
  let hour = 8;
  let minute = 0;

  const mealTypeLower = (mealType || '').toLowerCase();
  if (mealTypeLower === 'breakfast') {
    hour = 8;
  } else if (mealTypeLower === 'lunch') {
    hour = 13;
  } else if (mealTypeLower === 'dinner') {
    hour = 19;
  }

  // Override if deliveryTimeStr is provided, e.g. "08:30 AM" or "1:15 PM"
  if (deliveryTimeStr) {
    const timeRegex = /(\d+):(\d+)\s*(AM|PM)/i;
    const match = deliveryTimeStr.match(timeRegex);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const isPm = match[3].toUpperCase() === 'PM';

      if (isPm && h < 12) h += 12;
      if (!isPm && h === 12) h = 0;

      hour = h;
      minute = m;
    }
  }

  const start = new Date(year, month, day, hour, minute);
  const end = new Date(year, month, day, hour + 1, minute); // Default duration 1 hour
  return { start, end };
}

export function formatToUTCString(date: Date): string {
  try {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
  } catch (error) {
    // Fallback if Date is invalid
    const fallback = new Date();
    return fallback.toISOString().replace(/-|:|\.\d\d\d/g, "");
  }
}

export interface CalendarEventPayload {
  id: string;
  title: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
}

export function getGoogleCalendarUrl(event: CalendarEventPayload): string {
  const startStr = formatToUTCString(event.start);
  const endStr = formatToUTCString(event.end);
  const queryParams = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startStr}/${endStr}`,
    details: event.description,
    location: event.location,
  });
  return `https://calendar.google.com/calendar/render?${queryParams.toString()}`;
}

export function downloadIcsFile(event: CalendarEventPayload) {
  const startStr = formatToUTCString(event.start);
  const endStr = formatToUTCString(event.end);
  const cleanDescription = event.description.replace(/\n/g, '\\n');
  const cleanSummary = event.title.replace(/[,;]/g, '\\$&');

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Taaza Bites//Meal Reminders//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `SUMMARY:${cleanSummary}`,
    `UID:meal-${event.id || Math.floor(Math.random() * 1000000)}@taazabites.app`,
    'SEQUENCE:0',
    'STATUS:CONFIRMED',
    'TRANSP:TRANSPARENT',
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `DESCRIPTION:${cleanDescription}`,
    `LOCATION:${event.location}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  const icsString = icsLines.join('\r\n');
  const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `taaza-bites-delivery-${event.id}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
