const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

/** "2024-10" → "Oct 2024". Deterministic, so server and client render identically. */
export function formatMonth(yearMonth: string): string {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(yearMonth);
  if (!match) throw new Error(`Expected "YYYY-MM", received "${yearMonth}"`);
  return `${MONTHS[Number(match[2]) - 1]} ${match[1]}`;
}
