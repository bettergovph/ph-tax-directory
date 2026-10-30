// Quarterly percentage tax return (BIR Form 2551Q). Item numbers are the form's own.
import { PT_CATEGORIES, PtCategory } from '../data/percentageTax';
import { formatPesos, half, parseAmount } from './money';

export { formatPesos };
export type Quarter = 1 | 2 | 3 | 4;
export const MAX_PT_LINES = 6; // the form has six ATC lines

export interface PtLineInput { atc: string; receipts: string }
export interface PtInput {
  year: number;
  quarter: Quarter;
  lines: PtLineInput[];
  /** Items 15 to 17 and 20 to 22, typed as text. */
  values: Record<string, string>;
}
export const PT_VALUE_FIELDS = [
  { key: 'creditableWithheld', item: '15', label: 'Creditable percentage tax withheld (per Form 2307)', hint: 'Percentage tax a payer withheld from your income, shown on the certificate they gave you.' },
  { key: 'previousPaid', item: '16', label: 'Tax paid on the return previously filed', hint: 'Only if this is an amended return.' },
  { key: 'otherCredits', item: '17', label: 'Other tax credits or payments' },
  { key: 'surcharge', item: '20', label: 'Surcharge', hint: 'Only if filing late. Enter the amount BIR or the eBIRForms system shows.' },
  { key: 'interest', item: '21', label: 'Interest' },
  { key: 'compromise', item: '22', label: 'Compromise penalty' },
] as const;

export interface PtLineResult { atc: string; label: string; receipts: bigint; rateBp: bigint; tax: bigint; temporaryRate: boolean }
export interface PtLine { item: string; label: string; amount: bigint; strong?: boolean }
export interface PtResult {
  rows: PtLineResult[];
  lines: PtLine[];
  totalReceipts: bigint;
  totalTaxDue: bigint;
  /** Item 24. Negative means overpayment. */
  totalAmountPayable: bigint;
  overpayment: bigint;
}

/** Quarters from July 1, 2020 to June 30, 2023, when CREATE cut the Sec. 116 rate to 1%. */
export function inCreateWindow(year: number, quarter: Quarter): boolean {
  return (year === 2020 && quarter >= 3) || year === 2021 || year === 2022 || (year === 2023 && quarter <= 2);
}
export const ptRateBp = (category: PtCategory, year: number, quarter: Quarter): bigint =>
  category.createWindow && inCreateWindow(year, quarter) ? 100n : category.bp;

export function calculatePercentageTax(input: PtInput): { errors: Record<string, string>; result?: PtResult } {
  const errors: Record<string, string> = {};
  const rows: PtLineResult[] = [];
  input.lines.forEach((line, i) => {
    const category = PT_CATEGORIES.find(c => c.atc === line.atc);
    if (!category) { errors[`line-${i}`] = 'Choose the kind of business.'; return; }
    const parsed = parseAmount(line.receipts);
    if ('error' in parsed) { errors[`line-${i}`] = parsed.error; return; }
    const rateBp = ptRateBp(category, input.year, input.quarter);
    rows.push({ atc: category.atc, label: category.label, receipts: parsed.centavos, rateBp, tax: half(parsed.centavos * rateBp, 10000n), temporaryRate: rateBp !== category.bp });
  });
  const amounts: Record<string, bigint> = {};
  for (const field of PT_VALUE_FIELDS) {
    const parsed = parseAmount(input.values[field.key]);
    if ('error' in parsed) errors[field.key] = parsed.error; else amounts[field.key] = parsed.centavos;
  }
  if (Object.keys(errors).length) return { errors };

  const totalReceipts = rows.reduce((sum, r) => sum + r.receipts, 0n);
  const item14 = rows.reduce((sum, r) => sum + r.tax, 0n);
  const item18 = amounts.creditableWithheld + amounts.previousPaid + amounts.otherCredits;
  const item19 = item14 - item18;
  const item23 = amounts.surcharge + amounts.interest + amounts.compromise;
  const item24 = item19 + item23;
  return {
    errors,
    result: {
      rows, totalReceipts, totalTaxDue: item14, totalAmountPayable: item24, overpayment: item24 < 0n ? -item24 : 0n,
      lines: [
        { item: '14', label: 'Total tax due', amount: item14, strong: true },
        { item: '18', label: 'Total tax credits and payments', amount: item18 },
        { item: '19', label: item19 < 0n ? 'Overpayment' : 'Tax still payable', amount: item19 },
        { item: '23', label: 'Total penalties', amount: item23 },
        { item: '24', label: item24 < 0n ? 'Total overpayment' : 'Total amount payable', amount: item24, strong: true },
      ],
    },
  };
}
