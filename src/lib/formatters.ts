/**
 * Currency formatting utility.
 * Formats a number as currency with appropriate locale and symbol.
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  compact: boolean = false
): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 1 : 2,
    notation: compact ? "compact" : "standard",
  });
  return formatter.format(amount);
}

/**
 * Formats a number as a percentage.
 */
export function formatPercent(
  value: number,
  decimals: number = 2
): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formats a large number with compact notation (e.g., 1.2M, 500K).
 */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Formats a number with comma separators.
 */
export function formatNumber(
  value: number,
  decimals: number = 0
): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formats a simulation quarter label (e.g., "Y1 Q2").
 */
export function formatQuarter(year: number, quarter: number): string {
  return `Y${year} Q${quarter}`;
}

/**
 * Formats a date to a readable string.
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Returns a color class for positive/negative change indicators.
 */
export function getChangeColor(value: number): string {
  if (value > 0) return "text-emerald-600";
  if (value < 0) return "text-red-500";
  return "text-muted-foreground";
}

/**
 * Returns a formatted change string with + or - prefix.
 */
export function formatChange(value: number, decimals: number = 2): string {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(decimals)}%`;
}

/**
 * Returns a risk level badge color.
 */
export function getRiskColor(level: string): string {
  switch (level) {
    case "low":
      return "bg-emerald-100 text-emerald-800";
    case "medium":
      return "bg-amber-100 text-amber-800";
    case "high":
      return "bg-red-100 text-red-800";
    case "very_high":
      return "bg-red-200 text-red-900";
    case "critical":
      return "bg-red-300 text-red-950";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
