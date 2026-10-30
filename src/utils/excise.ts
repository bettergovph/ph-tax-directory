// Excise tax on the core products: alcohol, tobacco, petroleum, sweetened beverages and automobiles.
import { AUTO_TIERS, EXCISE_FIRST_YEAR, EXCISE_PRODUCTS, ExciseProduct, ExciseRate } from '../data/excise';
import { formatPesos, half, parseAmount, parseQuantity } from './money';

export { formatPesos };
export const AUTO_ID = 'auto';
export type VehicleKind = 'regular' | 'hybrid' | 'exempt';

/** Per-unit specific rate in centavos for a year. `computed` means the year is past BIR's published table and the law's annual increase was applied. */
export function exciseRate(rate: ExciseRate, year: number): { centavos: bigint; computed: boolean } | undefined {
  if (rate.kind === 'flat') return { centavos: rate.centavos, computed: false };
  const first = Math.min(...Object.keys(rate.byYear).map(Number));
  if (year < first) return undefined;
  if (year <= rate.lastYear) return { centavos: rate.byYear[year], computed: false };
  let centavos = rate.byYear[rate.lastYear];
  // Each year the previous year's rounded rate rises by the statutory percentage, rounded to the centavo. This reproduces BIR's published figures.
  for (let y = rate.lastYear + 1; y <= year; y++) centavos = half(centavos * (100n + rate.annualPct), 100n);
  return { centavos, computed: true };
}

export interface ExciseInput {
  productId: string;
  year: number;
  /** Units: proof liters, liters, packs, sticks, kilograms, or number of vehicles. */
  quantity: string;
  /** Net price per unit without excise and VAT. For automobiles, the net manufacturer's or importer's selling price of one vehicle. */
  netPrice: string;
  vehicle?: VehicleKind;
}
export interface ExciseLine { label: string; detail: string; amount: bigint }
export interface ExciseResult {
  lines: ExciseLine[];
  total: bigint;
  year: number;
  /** True when the specific rate for this year was worked out from the legal annual increase, not read from BIR's table. */
  computedRate: boolean;
  notes: string[];
}

const hundredths = (h: bigint) => `${h / 100n}${h % 100n ? '.' + String(h % 100n).padStart(2, '0').replace(/0$/, '') : ''}`;

export function calculateExcise(input: ExciseInput): { errors: Record<string, string>; result?: ExciseResult } {
  const errors: Record<string, string> = {};
  if (!Number.isInteger(input.year) || input.year < EXCISE_FIRST_YEAR) errors.year = `This calculator covers ${EXCISE_FIRST_YEAR} onward.`;
  const quantity = parseQuantity(input.quantity);
  if ('error' in quantity) errors.quantity = quantity.error;
  const price = parseAmount(input.netPrice);
  if ('error' in price) errors.netPrice = price.error;
  if (Object.keys(errors).length) return { errors };
  const qty = (quantity as { hundredths: bigint }).hundredths;
  const unitPrice = (price as { centavos: bigint }).centavos;

  if (input.productId === AUTO_ID) {
    const tier = AUTO_TIERS.find(t => t.upTo === null || unitPrice <= t.upTo)!;
    const kind = input.vehicle ?? 'regular';
    const bp = kind === 'exempt' ? 0n : kind === 'hybrid' ? tier.bp / 2n : tier.bp;
    const perVehicle = half(unitPrice * bp, 10000n);
    const notes = ['The tax rate for the price bracket applies to the whole net selling price.', 'Purely electric vehicles and pick-ups are exempt. Hybrids pay half the rate for their bracket.'];
    return { errors, result: { lines: [{ label: 'Excise tax on automobiles', detail: `${bp / 100n}${bp % 100n ? '.' + String(bp % 100n) : ''}% of the net selling price, × ${hundredths(qty)} vehicle(s)`, amount: half(perVehicle * qty, 100n) }], total: half(perVehicle * qty, 100n), year: input.year, computedRate: false, notes } };
  }

  const product: ExciseProduct | undefined = EXCISE_PRODUCTS.find(p => p.id === input.productId);
  if (!product) return { errors: { productId: 'Choose a product.' } };
  const lines: ExciseLine[] = [];
  const notes: string[] = [];
  let computedRate = false;
  if (product.exempt) {
    notes.push(product.note ?? 'This product is exempt from excise tax.');
    return { errors, result: { lines: [{ label: 'Excise tax', detail: 'Exempt', amount: 0n }], total: 0n, year: input.year, computedRate: false, notes } };
  }
  if (product.specific) {
    const rate = exciseRate(product.specific, input.year);
    if (!rate) return { errors: { year: `No rate is available for ${input.year}.` } };
    computedRate = rate.computed;
    lines.push({ label: 'Specific tax', detail: `${hundredths(qty)} ${product.unit} × ${formatPesos(rate.centavos)}`, amount: half(qty * rate.centavos, 100n) });
  }
  if (product.adValoremBp) {
    const base = half(unitPrice * qty, 100n);
    lines.push({ label: 'Ad valorem tax', detail: `${product.adValoremBp / 100n}% of ${formatPesos(base)}`, amount: half(base * product.adValoremBp, 10000n) });
  }
  if (computedRate) notes.push(`BIR’s rate table stops at 2024. The ${input.year} rate shown is worked out from the yearly increase in the law, and BIR’s own figure may differ by rounding. Check the latest BIR issuance before you file.`);
  if (product.note) notes.push(product.note);
  return { errors, result: { lines, total: lines.reduce((sum, l) => sum + l.amount, 0n), year: input.year, computedRate, notes } };
}
