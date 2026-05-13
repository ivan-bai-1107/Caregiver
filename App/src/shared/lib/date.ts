import { format, isToday, isTomorrow } from "date-fns";
import { zhCN } from "date-fns/locale";

export function normalizeServerDateTime(value: string) {
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
    return value.replace(" ", "T");
  }

  return value;
}

export function formatDashboardDate(date = new Date()) {
  return format(date, "yyyy年M月d日 · EEEE", { locale: zhCN });
}

export function formatDateTimeLocalValue(date = new Date()) {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function formatMonthDayLabel(isoDate: string) {
  return format(new Date(normalizeServerDateTime(isoDate)), "MM-dd");
}

export function formatDateLabel(isoDate: string) {
  return format(new Date(normalizeServerDateTime(isoDate)), "M月d日", { locale: zhCN });
}

export function formatDateTimeLabel(isoDate: string) {
  return format(new Date(normalizeServerDateTime(isoDate)), "M月d日 HH:mm", { locale: zhCN });
}

export function formatRelativeScheduleLabel(isoDate: string) {
  const value = new Date(normalizeServerDateTime(isoDate));

  if (isToday(value)) {
    return `今天 ${format(value, "HH:mm")}`;
  }

  if (isTomorrow(value)) {
    return `明天 ${format(value, "HH:mm")}`;
  }

  return format(value, "M月d日 HH:mm", { locale: zhCN });
}
