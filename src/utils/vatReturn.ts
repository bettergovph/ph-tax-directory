// Quarterly VAT return (BIR Form 2550Q, April 2024 ENCS). Item numbers below are the form's own,
// so every line a user sees can be copied straight onto the return. Amounts are bigint centavos.

import { formatPesos, half, parseAmount } from './money';

export { formatPesos, parseAmount };
export const VAT_RATE_BP = 1200n;

export type VatSection = 'sales' | 'carried' | 'purchases' | 'deductions' | 'credits' | 'penalties';

export interface VatField {
  key: string;
  section: VatSection;
  /** Form item the amount goes on, e.g. "31A". */
  item: string;
  label: string;
  hint?: string;
  /** Purchase rows: the key of the optional input-tax amount that goes with this purchase amount. */
  taxKey?: string;
}

export const VAT_SECTIONS: Record<VatSection, { title: string; intro: string }> = {
  sales: { title: 'Sales and output VAT', intro: 'Enter your sales for the quarter without VAT. Output VAT is worked out for you.' },
  carried: { title: 'Input VAT brought into this quarter', intro: 'Input VAT you may still claim from earlier periods or special rules. Leave blank if none.' },
  purchases: { title: 'Purchases this quarter', intro: 'Enter the purchase amount without VAT. Input VAT is worked out at 12%. If your invoices show a different VAT amount, type it in the input VAT box.' },
  deductions: { title: 'Input VAT you cannot claim this quarter', intro: 'These reduce the input VAT you can use. Leave blank if none.' },
  credits: { title: 'Tax credits and payments', intro: 'VAT already withheld from you or paid before, which lowers what you pay now.' },
  penalties: { title: 'Penalties (only if filing late)', intro: 'Enter the amounts BIR or the eBIRForms system shows. Leave blank if you are filing on time.' },
};

export const VAT_FIELDS: VatField[] = [
  { key: 'vatableSales', section: 'sales', item: '31A', label: 'VATable sales', hint: 'Sales that carry the regular 12% VAT, without the VAT.' },
  { key: 'zeroRatedSales', section: 'sales', item: '32A', label: 'Zero-rated sales', hint: 'Sales taxed at 0%, such as many export sales.' },
  { key: 'exemptSales', section: 'sales', item: '33A', label: 'VAT-exempt sales', hint: 'Sales the law excludes from VAT.' },
  { key: 'uncollectedOutput', section: 'sales', item: '35B', label: 'Output VAT on uncollected receivables', hint: 'Output VAT you may deduct on sales you could not collect on.' },
  { key: 'recoveredOutput', section: 'sales', item: '36B', label: 'Output VAT on recovered uncollected receivables', hint: 'Output VAT you deducted before, on amounts you have now collected.' },

  { key: 'carriedOver', section: 'carried', item: '38B', label: 'Input tax carried over from previous quarter', hint: 'The excess input tax shown as a negative on last quarter’s return (Item 61).' },
  { key: 'deferredCapital', section: 'carried', item: '39B', label: 'Input tax deferred on capital goods above ₱1 million', hint: 'From Schedule 1 of your earlier return. Leave blank if none.' },
  { key: 'transitional', section: 'carried', item: '40B', label: 'Transitional input tax' },
  { key: 'presumptive', section: 'carried', item: '41B', label: 'Presumptive input tax', hint: 'A set percentage of purchases the law lets certain businesses claim, such as processors of some food products.' },
  { key: 'otherInput', section: 'carried', item: '42B', label: 'Other input tax' },

  { key: 'domesticPurchases', taxKey: 'domesticTax', section: 'purchases', item: '44', label: 'Domestic purchases' },
  { key: 'nonResidentPurchases', taxKey: 'nonResidentTax', section: 'purchases', item: '45', label: 'Services rendered by non-residents' },
  { key: 'importPurchases', taxKey: 'importTax', section: 'purchases', item: '46', label: 'Importations' },
  { key: 'otherPurchases', taxKey: 'otherPurchasesTax', section: 'purchases', item: '47', label: 'Other purchases' },
  { key: 'noInputPurchases', section: 'purchases', item: '48A', label: 'Domestic purchases with no input tax', hint: 'Purchases that carry no VAT, so there is no input tax to claim. Reported for information.' },
  { key: 'exemptImportations', section: 'purchases', item: '49A', label: 'VAT-exempt importations', hint: 'Imports that are exempt from VAT. Reported for information.' },

  { key: 'deferredForNext', section: 'deductions', item: '52B', label: 'Capital goods input tax deferred to later periods', hint: 'Input tax on capital goods above ₱1 million that you spread over later periods (Schedule 1).' },
  { key: 'exemptDirectInput', section: 'deductions', item: 'Sch. 2', label: 'Input tax directly used for VAT-exempt sales', hint: 'Input tax on purchases used only to make exempt sales. It cannot be claimed.' },
  { key: 'exemptSharedInput', section: 'deductions', item: 'Sch. 2', label: 'Input tax shared by all your activities', hint: 'Input tax that cannot be tied to one activity. The share that belongs to exempt sales is worked out for you, using your exempt sales over total sales.' },
  { key: 'refundClaimed', section: 'deductions', item: '54B', label: 'VAT refund / TCC claimed', hint: 'Input VAT you already claimed as a refund or tax credit certificate, so it cannot be used again.' },
  { key: 'unpaidPayables', section: 'deductions', item: '55B', label: 'Input VAT on unpaid payables', hint: 'Input VAT on purchases you have not paid for yet.' },
  { key: 'otherDeductions', section: 'deductions', item: '56B', label: 'Other deductions from input tax' },
  { key: 'settledUnpaid', section: 'deductions', item: '58B', label: 'Input VAT on settled unpaid payables previously deducted', hint: 'Added into your deductions, as Item 59 of the form instructs.' },

  { key: 'creditableWithheld', section: 'credits', item: '16', label: 'Creditable VAT withheld', hint: 'VAT taken out of payments to you, for example by government offices. See Schedule 3 and your certificates.' },
  { key: 'advanceVat', section: 'credits', item: '17', label: 'Advance VAT payments', hint: 'Advance VAT paid by millers or others, with official receipts (Schedule 4).' },
  { key: 'previousPaid', section: 'credits', item: '18', label: 'VAT paid on the return previously filed', hint: 'Only if this is an amended return.' },
  { key: 'otherCredits', section: 'credits', item: '19', label: 'Other credits or payments' },

  { key: 'surcharge', section: 'penalties', item: '22', label: 'Surcharge' },
  { key: 'interest', section: 'penalties', item: '23', label: 'Interest' },
  { key: 'compromise', section: 'penalties', item: '24', label: 'Compromise penalty' },
];

/** Optional input-tax boxes that sit beside a purchase amount. Blank means 12% of the purchase amount. */
export const VAT_TAX_KEYS = VAT_FIELDS.flatMap(f => f.taxKey ? [f.taxKey] : []);

export type VatValues = Record<string, string>;
export interface VatOptions { salesIncludeVat?: boolean }

export interface VatLine {
  item: string;
  label: string;
  amount: bigint;
  /** Section the line belongs to, for grouping on screen. */
  part: 'IV-sales' | 'IV-input' | 'IV-result' | 'II';
  strong?: boolean;
}

export interface VatReturnResult {
  lines: VatLine[];
  totalSales: bigint;
  outputVat: bigint;
  totalAllowableInput: bigint;
  /** Item 61. Negative means excess input tax to carry to the next quarter (Item 38). */
  netVatPayable: bigint;
  /** Item 26. Negative means excess credits. */
  totalAmountPayable: bigint;
  excessInput: bigint;
  excessCredits: bigint;
  purchaseTax: Record<string, bigint>;
}

const rate = (centavos: bigint) => half(centavos * VAT_RATE_BP, 10000n);

export function calculateVatReturn(values: VatValues, options: VatOptions = {}): { errors: Record<string, string>; result?: VatReturnResult } {
  const errors: Record<string, string> = {};
  const amounts: Record<string, bigint> = {};
  const blank: Record<string, boolean> = {};
  for (const key of [...VAT_FIELDS.map(f => f.key), ...VAT_TAX_KEYS]) {
    const parsed = parseAmount(values[key]);
    if ('error' in parsed) errors[key] = parsed.error;
    else { amounts[key] = parsed.centavos; blank[key] = (values[key] ?? '').trim() === ''; }
  }
  if (Object.keys(errors).length) return { errors };
  const a = (key: string) => amounts[key] ?? 0n;

  // Part IV: sales and output tax
  const vatableNet = options.salesIncludeVat ? half(a('vatableSales') * 100n, 112n) : a('vatableSales');
  const item31B = rate(vatableNet);
  const item34A = vatableNet + a('zeroRatedSales') + a('exemptSales');
  const item34B = item31B;
  const item37B = item34B - a('uncollectedOutput') + a('recoveredOutput');

  // Part IV: allowable input tax
  const item43B = a('carriedOver') + a('deferredCapital') + a('transitional') + a('presumptive') + a('otherInput');
  const purchaseTax: Record<string, bigint> = {};
  let item50A = 0n;
  let item50B = 0n;
  for (const field of VAT_FIELDS.filter(f => f.taxKey)) {
    const purchase = a(field.key);
    const tax = blank[field.taxKey!] ? rate(purchase) : a(field.taxKey!);
    purchaseTax[field.key] = tax;
    item50A += purchase;
    item50B += tax;
  }
  item50A += a('noInputPurchases') + a('exemptImportations');
  const item51B = item43B + item50B;

  // Schedule 2: input tax attributable to VAT-exempt sales (direct + ratable share of shared input tax)
  const ratable = item34A === 0n ? 0n : half(a('exemptSales') * a('exemptSharedInput'), item34A);
  const item53B = a('exemptDirectInput') + ratable;
  const item57B = a('deferredForNext') + item53B + a('refundClaimed') + a('unpaidPayables') + a('otherDeductions');
  const item59B = item57B + a('settledUnpaid');
  const item60B = item51B - item59B;
  const item61 = item37B - item60B;

  // Part II: total tax payable
  const item20 = a('creditableWithheld') + a('advanceVat') + a('previousPaid') + a('otherCredits');
  const item21 = item61 - item20;
  const item25 = a('surcharge') + a('interest') + a('compromise');
  const item26 = item21 + item25;

  const lines: VatLine[] = [
    { part: 'IV-sales', item: '31B', label: 'Output VAT on VATable sales (12%)', amount: item31B },
    { part: 'IV-sales', item: '34A', label: 'Total sales', amount: item34A },
    { part: 'IV-sales', item: '37B', label: 'Total adjusted output tax due', amount: item37B, strong: true },
    { part: 'IV-input', item: '43B', label: 'Input tax brought into this quarter', amount: item43B },
    { part: 'IV-input', item: '50A', label: 'Total current purchases', amount: item50A },
    { part: 'IV-input', item: '50B', label: 'Input tax on this quarter’s purchases', amount: item50B },
    { part: 'IV-input', item: '51B', label: 'Total available input tax', amount: item51B },
    { part: 'IV-input', item: '53B', label: 'Input tax attributable to VAT-exempt sales', amount: item53B },
    { part: 'IV-input', item: '59B', label: 'Adjusted deductions from input tax', amount: item59B },
    { part: 'IV-input', item: '60B', label: 'Total allowable input tax', amount: item60B, strong: true },
    { part: 'IV-result', item: '61', label: item61 < 0n ? 'Excess input tax' : 'Net VAT payable', amount: item61, strong: true },
    { part: 'II', item: '20', label: 'Total tax credits and payments', amount: item20 },
    { part: 'II', item: '21', label: item21 < 0n ? 'Excess credits' : 'Tax still payable', amount: item21 },
    { part: 'II', item: '25', label: 'Total penalties', amount: item25 },
    { part: 'II', item: '26', label: item26 < 0n ? 'Total excess credits' : 'Total amount payable', amount: item26, strong: true },
  ];

  return {
    errors,
    result: {
      lines, totalSales: item34A, outputVat: item37B, totalAllowableInput: item60B, netVatPayable: item61,
      totalAmountPayable: item26, excessInput: item61 < 0n ? -item61 : 0n, excessCredits: item26 < 0n ? -item26 : 0n, purchaseTax,
    },
  };
}

/** Statutory due date of a calendar-quarter return: the 25th day after the quarter closes. */
export function vatDueDate(year: number, quarter: 1 | 2 | 3 | 4): Date {
  return new Date(year, quarter * 3, 25);
}
