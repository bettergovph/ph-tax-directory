/** The given day of the month after a calendar quarter closes, e.g. the 25th day after the quarter for VAT and percentage tax. */
export function quarterDueDate(year: number, quarter: 1 | 2 | 3 | 4, day = 25): Date {
  return new Date(year, quarter * 3, day);
}
