import { IncomeTaxInput } from '../types/incomeTax';
const iso = (date: Date) => date.toISOString().slice(0, 10);
const day = (year: number, month: number, date: number) => new Date(Date.UTC(year, month, date));
const longDate = (date: Date) => date.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
/** Readable deadline. A deadline on a Saturday or Sunday moves to the next working day; holidays are not checked. */
export function deadlineInfo(isoDate: string) {
  const due = new Date(`${isoDate}T00:00:00Z`);
  const shift = [1, 0, 0, 0, 0, 0, 2][due.getUTCDay()];
  const moved = day(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate() + shift);
  return { date: longDate(moved), iso: iso(moved), weekend: shift ? longDate(due) : undefined };
}
export const mcitApplies = (firstTaxableYear: number, currentTaxableYear: number) => currentTaxableYear >= firstTaxableYear + 4;
export function periodDates(input: IncomeTaxInput) {
  const corporate = input.taxpayer === 'corporation' && !['property', 'passive', 'nonresident'].includes(input.route);
  const endMonth = corporate ? input.fiscalMonth : 12;
  const startYear = endMonth === 12 ? input.year : input.year - 1;
  const startMonth = endMonth === 12 ? 0 : endMonth;
  const start = day(startYear, startMonth, 1);
  const annualEnd = day(input.year, endMonth, 0);
  const q = input.period.startsWith('q') ? Number(input.period[1]) : 0;
  const end = q ? day(startYear, startMonth + q * 3, 0) : annualEnd;
  const withholding = input.taxpayer === 'withholding';
  if (input.period === 'transaction') {
    const transaction = input.values.transactionDate;
    const due = transaction && ['property', 'shares'].includes(input.route) ? iso(day(Number(transaction.slice(0,4)), Number(transaction.slice(5,7))-1, Number(transaction.slice(8,10))+30)) : undefined;
    return { coveredPeriod: transaction || 'Select the transaction date', statutoryDeadline: due, deadlineRule: due ? 'Within 30 days after the transaction (ordinary cash transaction).' : 'Recipient calculation; the payor has separate withholding/remittance obligations.' };
  }
  if (input.period === 'projection') return { coveredPeriod: `Monthly amount projected over 12 months · ${input.year}`, deadlineRule: 'Planning estimate, not a filing-period calculation.' };
  if (withholding && input.period === 'monthly') {
    const groupDays: Record<string, number> = { A:15, B:14, C:13, D:12, E:11 };
    const efps = input.values.channel === 'efps';
    const dueDay = efps ? groupDays[input.values.efpsGroup || 'A'] : input.route === 'payroll' && input.month === 12 ? 15 : 10;
    return { coveredPeriod: `${iso(day(input.year,input.month-1,1))} to ${iso(day(input.year,input.month,0))}`, statutoryDeadline: iso(day(input.year,input.month,dueDay)), deadlineRule: efps ? `eFPS group ${input.values.efpsGroup || 'A'} published baseline schedule.` : input.route === 'payroll' && input.month === 12 ? 'December compensation remittance: January 15 of the following year.' : 'Non-eFPS baseline: 10th day of following month.' };
  }
  if (withholding && q) {
    const quarterStart = day(input.year, (q-1)*3, 1);
    const quarterEnd = day(input.year, q*3, 0);
    return { coveredPeriod: `${iso(quarterStart)} to ${iso(quarterEnd)} · this quarter only`, statutoryDeadline: iso(day(input.year,q*3+1,0)), deadlineRule:'Last day of the month following the calendar quarter.' };
  }
  if (input.period === 'annual') return { coveredPeriod:`${iso(start)} to ${iso(end)}`, statutoryDeadline: corporate ? iso(day(input.year,endMonth+3,15)) : `${input.year+1}-04-15`, deadlineRule:corporate ? `15th day of the 4th month after the tax year ends on ${iso(end)}.` : `April 15 after the ${input.year} tax year ends.` };
  return { coveredPeriod:`${iso(start)} to ${iso(end)} · cumulative year to date`, statutoryDeadline:corporate ? iso(day(end.getUTCFullYear(),end.getUTCMonth(),end.getUTCDate()+60)) : `${input.year}-${String([0,5,8,11][q]).padStart(2,'0')}-15`, deadlineRule:corporate ? 'Within 60 days after the taxable quarter closes.' : 'Q1 May 15; Q2 August 15; Q3 November 15. No Q4 1701Q.' };
}
export function returnForms(input: IncomeTaxInput): string[] {
  const {route,period,values} = input;
  if (route === 'specialist') return [];
  if (route === 'compensation') return values.substituted === 'true' && period === 'annual' ? ['2316'] : ['1700','2316'];
  if (route === 'ordinary') return ['1700'];
  if (['business','business8','mixed','mixed8','fiduciary'].includes(route)) {
    const mixed = ['mixed','mixed8'].includes(route);
    if (period !== 'annual') return ['1701Q','2307'];
    const eligibleMS = ['micro','small'].includes(values.registeredSize) && values.multipleActivities !== 'yes' && route !== 'mixed8';
    const annual = values.formChoice === 'ms' && eligibleMS ? '1701-MS' : !mixed && route !== 'fiduciary' && (route === 'business8' || values.deductionMethod === 'osd') ? '1701A' : '1701';
    return [annual, ...(mixed ? ['2316'] : []), '2307'];
  }
  if (route === 'corporate') return [period === 'annual' ? ['cooperative','exempt-entity'].includes(input.classification) ? '1702-MX' : '1702-RT' : '1702Q','2307'];
  if (['ith','scit','edr','school'].includes(route)) return [period === 'annual' ? '1702-MX' : '1702Q','2307'];
  if (route === 'exempt') return ['1702-EX'];
  if (route === 'property') return ['1706'];
  if (route === 'shares') return [period === 'annual' ? '1707-A' : '1707'];
  if (route === 'payroll') return ['1601-C','1604-C','2316'];
  if (route === 'expanded') return [period === 'monthly' ? '0619-E' : '1601-EQ','2307','1604-E'];
  if (route === 'fringe') return ['1603Q','1604-F'];
  if (route === 'nonresident') return ['1601-FQ','2306'];
  if (route === 'final') return [values.passiveType === 'interest' ? '1602Q' : period === 'monthly' ? '0619-F' : '1601-FQ','2306','1604-F'];
  return [values.passiveType === 'interest' ? '1602Q' : '1601-FQ','2306'];
}
