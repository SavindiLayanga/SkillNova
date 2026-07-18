import { format, formatDistanceToNow, isToday as isDateToday, isYesterday as isDateYesterday } from 'date-fns';
import { toZonedTime } from 'date-fns-tz'; // toZonedTime replaces utcToZonedTime in date-fns-tz v3

export function getZonedDate(dateInput, timezone) {
  if (!dateInput) return null;
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return null;
    return timezone ? toZonedTime(date, timezone) : date;
  } catch {
    return null;
  }
}

export function formatDate(dateInput, prefs) {
  const zonedDate = getZonedDate(dateInput, prefs?.timezone);
  if (!zonedDate) return "-";
  
  try {
    // Basic mapping: DD/MM/YYYY to date-fns dd/MM/yyyy
    let fmt = (prefs?.dateFormat || "dd/MM/yyyy")
      .replace('DD', 'dd')
      .replace('YYYY', 'yyyy');
      
    return format(zonedDate, fmt);
  } catch {
    return "N/A";
  }
}

export function formatTime(dateInput, prefs) {
  const zonedDate = getZonedDate(dateInput, prefs?.timezone);
  if (!zonedDate) return "-";
  
  try {
    const is24h = prefs?.timeFormat === "24h";
    return format(zonedDate, is24h ? "HH:mm" : "hh:mm a");
  } catch {
    return "N/A";
  }
}

export function formatDateTime(dateInput, prefs) {
  const dateStr = formatDate(dateInput, prefs);
  const timeStr = formatTime(dateInput, prefs);
  
  if (dateStr === "-" || timeStr === "-") return "-";
  if (dateStr === "N/A" || timeStr === "N/A") return "N/A";
  
  return `${dateStr} ${timeStr}`;
}

export function formatRelativeTime(dateInput) {
  if (!dateInput) return "-";
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "-";
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "N/A";
  }
}

export function isToday(dateInput, prefs) {
  const zonedDate = getZonedDate(dateInput, prefs?.timezone);
  if (!zonedDate) return false;
  return isDateToday(zonedDate);
}

export function isYesterday(dateInput, prefs) {
  const zonedDate = getZonedDate(dateInput, prefs?.timezone);
  if (!zonedDate) return false;
  return isDateYesterday(zonedDate);
}
