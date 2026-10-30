// Documentary stamp tax on the common instruments. Rates: BIR Forms 2000 and 2000-OT (rate tables), NIRC as amended by
// TRAIN (RA 10963), and RA 12214 (CMEPA) for debt instruments and original issue of shares from July 1, 2025.
import { DST_INSTRUMENTS, DstInstrument, DstInstrumentId } from '../data/dst';
import { ceilDiv, formatPesos, half, parseAmount } from './money';

export { formatPesos };

export interface DstInput {
  instrument: DstInstrumentId;
  /** Date of the document, yyyy-mm-dd. */
  date: string;
  /** Typed amounts and choices, keyed by the field names in DST_FIELDS. */
  values: Record<string, string>;
}
export interface DstField { key: string; label: string; kind: 'money' | 'integer' | 'choice'; hint?: string; choices?: { value: string; label: string }[]; default?: string; showWhen?: Record<string, string> }

const yesNo = [{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }];
export const DST_FIELDS: Record<DstInstrumentId, DstField[]> = {
  loan: [
    { key: 'amount', kind: 'money', label: 'Loan amount or issue price' },
    { key: 'term', kind: 'choice', label: 'Term of the loan', choices: [{ value: 'year', label: 'One year or more' }, { value: 'days', label: 'Less than one year' }], default: 'year' },
    { key: 'days', kind: 'integer', label: 'Number of days', hint: 'From 1 to 364 days.', showWhen: { term: 'days' } },
    { key: 'security', kind: 'choice', label: 'Is the loan secured by a mortgage, pledge or similar contract?', default: 'none', choices: [{ value: 'none', label: 'No' }, { value: 'separate', label: 'Yes, in a separate document' }, { value: 'single', label: 'Yes, all in one document' }], hint: 'Only one DST is paid on a loan and the contracts that secure it.' },
  ],
  mortgage: [{ key: 'amount', kind: 'money', label: 'Amount secured' }],
  'real-property': [
    { key: 'price', kind: 'money', label: 'Selling price or consideration' },
    { key: 'fmv', kind: 'money', label: 'Fair market value', hint: 'The higher of the zonal value and the assessor’s value. The tax is based on the higher of this and the price.' },
    { key: 'government', kind: 'choice', label: 'Is the Government a party, or is this a foreclosure sale?', choices: yesNo, default: 'no', hint: 'If yes, the tax is based on the actual consideration only.' },
  ],
  lease: [
    { key: 'rent', kind: 'money', label: 'Rent for one year', hint: 'The total rent for a year of the lease.' },
    { key: 'years', kind: 'integer', label: 'Number of years in the lease term', default: '1' },
  ],
  'shares-issue': [{ key: 'base', kind: 'money', label: 'Par value of the shares, or the actual consideration for shares without par value' }],
  'shares-transfer': [
    { key: 'par', kind: 'choice', label: 'Do the shares have a par value?', choices: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No par value' }], default: 'yes' },
    { key: 'parValue', kind: 'money', label: 'Total par value of the shares sold', showWhen: { par: 'yes' } },
    { key: 'original', kind: 'money', label: 'DST paid on the original issue of these shares', showWhen: { par: 'no' } },
  ],
  'life-insurance': [{ key: 'insured', kind: 'money', label: 'Amount insured' }],
  'property-insurance': [{ key: 'premium', kind: 'money', label: 'Premium charged' }],
};

export interface DstLine { label: string; detail: string; amount: bigint }
export interface DstResult {
  lines: DstLine[];
  total: bigint;
  form: DstInstrument['form'];
  /** Last day to file and pay: the 5th day after the close of the month of the document. */
  dueDate: Date;
  notes: string[];
}

const isVisible = (field: DstField, values: Record<string, string>, fields: DstField[]) =>
  !field.showWhen || Object.entries(field.showWhen).every(([key, value]) => (values[key] ?? fields.find(f => f.key === key)?.default ?? '') === value);

const parseDate = (iso: string): Date | undefined => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return undefined;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.getFullYear() === Number(m[1]) && d.getMonth() === Number(m[2]) - 1 && d.getDate() === Number(m[3]) ? d : undefined;
};

const mortgageTax = (secured: bigint) => secured === 0n ? 0n : 4000n + 2000n * ceilDiv(secured > 500000n ? secured - 500000n : 0n, 500000n);

export function calculateDst(input: DstInput): { errors: Record<string, string>; result?: DstResult } {
  const errors: Record<string, string> = {};
  const instrument = DST_INSTRUMENTS.find(i => i.id === input.instrument);
  if (!instrument) return { errors: { instrument: 'Choose a document.' } };
  const date = parseDate(input.date);
  if (!date) return { errors: { date: 'Enter the date of the document.' } };
  if (instrument.fromDate && input.date < instrument.fromDate) {
    return { errors: { date: `The rates for this document changed on July 1, 2025, so this calculator covers documents dated on or after that day.` } };
  }
  const fields = DST_FIELDS[instrument.id];
  const get = (key: string) => input.values[key] ?? fields.find(f => f.key === key)?.default ?? '';
  const money: Record<string, bigint> = {};
  const whole: Record<string, bigint> = {};
  for (const field of fields) {
    if (!isVisible(field, input.values, fields)) continue;
    if (field.kind === 'money') {
      const parsed = parseAmount(get(field.key));
      if ('error' in parsed) errors[field.key] = parsed.error; else money[field.key] = parsed.centavos;
    } else if (field.kind === 'integer') {
      const text = get(field.key).trim();
      if (!/^\d{1,6}$/.test(text) || BigInt(text) < 1n) errors[field.key] = 'Enter a whole number of 1 or more.'; else whole[field.key] = BigInt(text);
    }
  }
  if (Object.keys(errors).length) return { errors };

  const lines: DstLine[] = [];
  const notes: string[] = [];
  switch (instrument.id) {
    case 'loan': {
      const amount = money.amount;
      const days = get('term') === 'days' ? whole.days : undefined;
      if (days !== undefined && days > 364n) return { errors: { days: 'A term of one year or more is taxed in full. Choose that option, or enter 364 days or less.' } };
      const tax = days === undefined ? half(amount * 75n, 10000n) : half(amount * 75n * days, 10000n * 365n);
      const detail = days === undefined ? `75% of 1% of ${formatPesos(amount)}` : `75% of 1% of ${formatPesos(amount)} × ${days}/365 days`;
      lines.push({ label: 'DST on the loan (Sec. 179)', detail, amount: tax });
      const security = get('security');
      if (security !== 'none') {
        const mortgage = mortgageTax(amount);
        lines.push({ label: 'DST if taxed as a mortgage (Sec. 195)', detail: 'Shown for comparison only', amount: mortgage });
        if (security === 'single') {
          notes.push('Because one document covers the loan and its security, the mortgage rate in Sec. 195 is applied to the full amount of the loan, and it is treated as one taxable transaction.');
          return { errors, result: { lines, total: mortgage, form: instrument.form, dueDate: new Date(date.getFullYear(), date.getMonth() + 1, 5), notes } };
        }
        notes.push('Only one DST is paid on the loan agreement, promissory note and the contracts that secure the loan. The total below is whichever of the two is higher.');
        const total = tax > mortgage ? tax : mortgage;
        return { errors, result: { lines, total, form: instrument.form, dueDate: new Date(date.getFullYear(), date.getMonth() + 1, 5), notes } };
      }
      return finish(lines, tax, instrument, date, notes);
    }
    case 'mortgage': {
      const tax = mortgageTax(money.amount);
      lines.push({ label: 'DST on the mortgage (Sec. 195)', detail: `₱40 on the first ₱5,000, plus ₱20 for each additional ₱5,000 or part of it, on ${formatPesos(money.amount)}`, amount: tax });
      notes.push('If this mortgage secures a loan, only one DST is paid for both. Use the loan option instead.');
      return finish(lines, tax, instrument, date, notes);
    }
    case 'real-property': {
      const gov = get('government') === 'yes';
      const base = gov || money.price >= money.fmv ? money.price : money.fmv;
      const tax = 1500n * ceilDiv(base, 100000n);
      lines.push({ label: 'DST on the deed of sale (Sec. 196)', detail: `₱15 for each ₱1,000 or part of it, on ${formatPesos(base)}${gov ? ' (actual consideration)' : ' (higher of price and fair market value)'}`, amount: tax });
      notes.push('For a sale paid in installments, the tax is due when the deed of absolute sale is signed, and is based on the price or fair market value at the time of the contract to sell.');
      return finish(lines, tax, instrument, date, notes);
    }
    case 'lease': {
      const rent = money.rent;
      const perYear = rent === 0n ? 0n : 600n + 200n * ceilDiv(rent > 200000n ? rent - 200000n : 0n, 100000n);
      const years = whole.years;
      lines.push({ label: 'DST for each year of the lease (Sec. 194)', detail: `₱6 on the first ₱2,000, plus ₱2 for each additional ₱1,000 or part of it, on ${formatPesos(rent)}`, amount: perYear });
      const tax = perYear * years;
      if (years > 1n) lines.push({ label: `× ${years} years of the lease`, detail: 'The tax is counted for each year of the term', amount: tax });
      return finish(lines, tax, instrument, date, notes);
    }
    case 'shares-issue': {
      const tax = half(money.base * 75n, 10000n);
      lines.push({ label: 'DST on the original issue of shares (Sec. 174)', detail: `75% of 1% of ${formatPesos(money.base)}`, amount: tax });
      notes.push('Stock dividends are taxed on the actual value of each share.');
      return finish(lines, tax, instrument, date, notes);
    }
    case 'shares-transfer': {
      const tax = get('par') === 'no' ? half(money.original * 50n, 100n) : 150n * ceilDiv(money.parValue, 20000n);
      lines.push({ label: 'DST on the sale or transfer of shares (Sec. 175)', detail: get('par') === 'no' ? `50% of the ${formatPesos(money.original)} paid on the original issue` : `₱1.50 for each ₱200 or part of it, on ${formatPesos(money.parValue)} par value`, amount: tax });
      notes.push('Shares sold or traded through a local or foreign stock exchange are exempt from DST. Only one tax is collected on each sale or transfer.');
      return finish(lines, tax, instrument, date, notes);
    }
    case 'life-insurance': {
      const v = money.insured;
      const tax = v <= 10_000_000n ? 0n : v <= 30_000_000n ? 2000n : v <= 50_000_000n ? 5000n : v <= 75_000_000n ? 10000n : v <= 100_000_000n ? 15000n : 20000n;
      lines.push({ label: 'DST on the life insurance policy (Sec. 183)', detail: tax === 0n ? 'Policies of ₱100,000 or less are exempt' : `Set amount for ${formatPesos(v)} insured`, amount: tax });
      return finish(lines, tax, instrument, date, notes);
    }
    case 'property-insurance': {
      const tax = 50n * ceilDiv(money.premium, 400n);
      lines.push({ label: 'DST on the policy', detail: `₱0.50 for each ₱4 or part of it, on a ${formatPesos(money.premium)} premium`, amount: tax });
      return finish(lines, tax, instrument, date, notes);
    }
  }
}

function finish(lines: DstLine[], total: bigint, instrument: DstInstrument, date: Date, notes: string[]) {
  notes.push('The law makes the person who makes, signs, issues, accepts or transfers the document liable. Who actually pays is usually set in the contract.');
  return { errors: {}, result: { lines, total, form: instrument.form, dueDate: new Date(date.getFullYear(), date.getMonth() + 1, 5), notes } as DstResult };
}
