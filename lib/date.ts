import type { FinancialPeriod, PeriodPreset } from "@/lib/types";

export const TODAY = "2026-09-26";

const toIso = (date: Date) => date.toISOString().slice(0, 10);

export function getPeriod(preset: PeriodPreset, customStart?: string, customEnd?: string): FinancialPeriod {
  const today = new Date(`${TODAY}T12:00:00Z`);
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth();
  const labels: Record<PeriodPreset, string> = {
    month: "Este mes",
    quarter: "Este trimestre",
    ytd: "Año a la fecha",
    "12m": "Últimos 12 meses",
    custom: "Rango personalizado",
  };

  let start: Date;
  if (preset === "month") start = new Date(Date.UTC(year, month, 1, 12));
  else if (preset === "quarter") start = new Date(Date.UTC(year, Math.floor(month / 3) * 3, 1, 12));
  else if (preset === "ytd") start = new Date(Date.UTC(year, 0, 1, 12));
  else if (preset === "12m") start = new Date(Date.UTC(year, month - 11, 1, 12));
  else start = new Date(`${customStart ?? `${year}-01-01`}T12:00:00Z`);

  const end = preset === "custom" ? new Date(`${customEnd ?? TODAY}T12:00:00Z`) : today;
  return { start: toIso(start), end: toIso(end), label: labels[preset], preset };
}

export function getPreviousPeriod(period: FinancialPeriod): FinancialPeriod {
  const start = new Date(`${period.start}T12:00:00Z`);
  const end = new Date(`${period.end}T12:00:00Z`);
  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  const previousEnd = new Date(start);
  previousEnd.setUTCDate(previousEnd.getUTCDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setUTCDate(previousStart.getUTCDate() - days + 1);
  return {
    start: toIso(previousStart),
    end: toIso(previousEnd),
    label: "Período anterior",
    preset: "custom",
  };
}

export function inPeriod(date: string, period: FinancialPeriod) {
  return date >= period.start && date <= period.end;
}

export function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return toIso(value);
}

export function monthKey(date: string) {
  return date.slice(0, 7);
}

export function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("es-UY", { month: "short", year: "2-digit", timeZone: "UTC" })
    .format(new Date(Date.UTC(year, month - 1, 1)))
    .replace(" de ", " ’");
}
