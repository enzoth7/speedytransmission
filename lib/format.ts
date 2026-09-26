export const formatCurrency = (value: number, compact = false, decimals = 0) =>
  new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "USD",
    notation: compact ? "compact" : "standard",
    minimumFractionDigits: compact ? 0 : decimals,
    maximumFractionDigits: compact ? 1 : decimals,
  }).format(value);

export const formatPercent = (value: number) =>
  new Intl.NumberFormat("es-UY", { style: "percent", maximumFractionDigits: 1 }).format(value / 100);

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat("es-UY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
