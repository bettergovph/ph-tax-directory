import { TaxSituation, TaxSource } from '../types/indirect';

export const EXCISE_REVIEWED_DATE = 'October 30, 2026';
/** First year the calculator covers. BIR's published tables start their current schedule in 2020 and are stable from 2021. */
export const EXCISE_FIRST_YEAR = 2021;

export const EXCISE_SOURCES: Record<string, TaxSource> = {
  bir: { label: 'BIR · Excise Tax and rate tables', url: 'https://www.bir.gov.ph/excise-tax' },
  forms: { label: 'BIR · Excise tax return forms', url: 'https://www.bir.gov.ph/bir-forms?tab=Excise+Tax+Return' },
  rr7: { label: 'RR 7-2021 · RA 11467 alcohol, tobacco and vapor rates', url: 'https://bir-cdn.bir.gov.ph/local/pdf/RR%20No.%207-2021.pdf' },
  ra11346: { label: 'RA 11346 · tobacco excise', url: 'https://www.lawphil.net/statutes/repacts/ra2019/ra_11346_2019.html' },
  ra11900: { label: 'RA 11900 · vaporized nicotine products', url: 'https://lawphil.net/statutes/repacts/ra2022/ra_11900_2022.html' },
  rr14: { label: 'RR 14-2022 · vapor product rules and rates', url: 'https://bir-cdn.bir.gov.ph/local/pdf/RR%2014-2022.pdf' },
  guide2200an: { label: '2200-AN official guidelines · automobiles', url: 'https://bir-cdn.bir.gov.ph/local/pdf/2200-AN%20Jan%202018%20ENCS%20guidelines%20final----.pdf' },
  guide2200s: { label: '2200-S official guidelines · sweetened beverages', url: 'https://bir-cdn.bir.gov.ph/local/pdf/2200-S%20%20Jan%202018%20Guide%20revised.pdf' },
};

/** A per-unit rate that changes each year (centavos). After `lastYear` the law raises it by `annualPct` every year. */
export interface RateTable { kind: 'table'; byYear: Record<number, bigint>; lastYear: number; annualPct: bigint }
/** A per-unit rate that does not change from year to year. */
export interface FlatRate { kind: 'flat'; centavos: bigint }
export type ExciseRate = RateTable | FlatRate;

export type ExciseGroup = 'alcohol' | 'tobacco' | 'petroleum' | 'beverage' | 'auto';
export const EXCISE_GROUPS: { id: ExciseGroup; label: string; form: string }[] = [
  { id: 'alcohol', label: 'Alcohol', form: '2200-A' },
  { id: 'tobacco', label: 'Tobacco', form: '2200-T' },
  { id: 'petroleum', label: 'Petroleum', form: '2200-P' },
  { id: 'beverage', label: 'Sweetened beverages', form: '2200-S' },
  { id: 'auto', label: 'Automobiles', form: '2200-AN' },
];

export interface ExciseProduct {
  id: string;
  group: ExciseGroup;
  label: string;
  /** What the quantity is counted in, e.g. "proof liter". */
  unit: string;
  specific?: ExciseRate;
  /** Ad valorem rate in basis points (2200 = 22%), applied to the net price. */
  adValoremBp?: bigint;
  /** Label for the net price box when the product has an ad valorem part. */
  priceLabel?: string;
  exempt?: boolean;
  note?: string;
}

const table = (byYear: Record<number, number>, annualPct: bigint): RateTable => {
  const years = Object.keys(byYear).map(Number);
  return { kind: 'table', byYear: Object.fromEntries(years.map(y => [y, BigInt(byYear[y])])), lastYear: Math.max(...years), annualPct };
};
const flat = (centavos: number): FlatRate => ({ kind: 'flat', centavos: BigInt(centavos) });

// Source: BIR "Excise Tax Rates" table (bir.gov.ph/excise-tax). Alcohol under RA 11467, tobacco under RA 11346 and RA 11467,
// petroleum under RA 10963. From 2025 alcohol rises 6% a year; from 2024 tobacco rises 5% a year.
export const EXCISE_PRODUCTS: ExciseProduct[] = [
  { id: 'spirits', group: 'alcohol', label: 'Distilled spirits', unit: 'proof liter', specific: table({ 2021: 4700, 2022: 5200, 2023: 5900, 2024: 6600 }, 6n), adValoremBp: 2200n, priceLabel: 'Net retail price per proof liter, without excise and VAT', note: 'Spirits pay both an ad valorem tax of 22% of the net retail price and a specific tax per proof liter. A proof liter is a liter of liquor at the standard proof strength, so ask your producer or the BIR guidelines how to convert your volume.' },
  { id: 'wine', group: 'alcohol', label: 'Wines (still, sparkling and champagne)', unit: 'liter', specific: table({ 2021: 5300, 2022: 5618, 2023: 5955, 2024: 6312 }, 6n), note: 'One specific rate per liter, whatever the price. Fortified wines above 25% alcohol are taxed as distilled spirits.' },
  { id: 'beer', group: 'alcohol', label: 'Beer and other fermented liquors', unit: 'liter', specific: table({ 2021: 3700, 2022: 3900, 2023: 4100, 2024: 4300 }, 6n), note: 'Applies to fermented liquors from factories and from micro-breweries, pubs and restaurants. Tuba, basi, tapuy and similar liquors are not covered.' },
  { id: 'cigarettes', group: 'tobacco', label: 'Cigarettes (hand or machine packed)', unit: 'pack of 20', specific: table({ 2021: 5000, 2022: 5500, 2023: 6000, 2024: 6300 }, 5n), note: 'Tax per pack of twenty. Other packings are taxed in the same proportion.' },
  { id: 'cigars', group: 'tobacco', label: 'Cigars', unit: 'stick', specific: table({ 2021: 683, 2022: 710, 2023: 738, 2024: 775 }, 5n), adValoremBp: 2000n, priceLabel: 'Net retail price per cigar, without excise and VAT', note: 'Cigars pay both an ad valorem tax of 20% of the net retail price and a specific tax per stick.' },
  { id: 'heated', group: 'tobacco', label: 'Heated tobacco products', unit: 'pack of 20', specific: table({ 2021: 2750, 2022: 3000, 2023: 3250, 2024: 3413 }, 5n), note: 'Tax per pack of twenty units. Vapor products are not in this calculator. See RA 11900 and RR 14-2022 for their rates.' },
  { id: 'gasoline', group: 'petroleum', label: 'Gasoline: regular, unleaded premium, naphtha and similar', unit: 'liter', specific: flat(1000) },
  { id: 'diesel', group: 'petroleum', label: 'Diesel and similar fuel oils', unit: 'liter', specific: flat(600) },
  { id: 'kerosene', group: 'petroleum', label: 'Kerosene', unit: 'liter', specific: flat(500), note: 'Kerosene used as aviation fuel is taxed at the aviation fuel rate.' },
  { id: 'aviation', group: 'petroleum', label: 'Aviation turbo jet fuel, aviation gas, and kerosene used as aviation fuel', unit: 'liter', specific: flat(400) },
  { id: 'lpg', group: 'petroleum', label: 'Liquefied petroleum gas (LPG)', unit: 'kilogram', specific: flat(300) },
  { id: 'lpg-motive', group: 'petroleum', label: 'LPG used for motive power', unit: 'kilogram', specific: flat(600) },
  { id: 'bunker', group: 'petroleum', label: 'Bunker fuel oil and similar fuels', unit: 'liter', specific: flat(600) },
  { id: 'lubricants', group: 'petroleum', label: 'Lubricating oils, greases and base stock', unit: 'kilogram', specific: flat(1000) },
  { id: 'ssb', group: 'beverage', label: 'Sweetened beverages with caloric or non-caloric sweeteners, or a mix', unit: 'liter', specific: flat(600), note: 'Tax per liter of volume capacity.' },
  { id: 'ssb-hfcs', group: 'beverage', label: 'Sweetened beverages made with high fructose corn syrup (HFCS)', unit: 'liter', specific: flat(1200), note: 'Applies to pure HFCS, or HFCS combined with any other sweetener.' },
  { id: 'ssb-exempt', group: 'beverage', label: 'Beverages sweetened only with coconut sap sugar or steviol glycosides', unit: 'liter', exempt: true, note: 'These are exempt from excise tax.' },
];

export interface AutoTier { upTo: bigint | null; bp: bigint; label: string }
/** Excise on automobiles by net manufacturer's or importer's selling price (centavos), rate on the whole price. */
export const AUTO_TIERS: AutoTier[] = [
  { upTo: 60_000_000n, bp: 400n, label: 'Up to ₱600,000: 4%' },
  { upTo: 100_000_000n, bp: 1000n, label: 'Over ₱600,000 to ₱1,000,000: 10%' },
  { upTo: 400_000_000n, bp: 2000n, label: 'Over ₱1,000,000 to ₱4,000,000: 20%' },
  { upTo: null, bp: 5000n, label: 'Over ₱4,000,000: 50%' },
];

export const EXCISE_SITUATIONS: TaxSituation[] = [
  { id: 'alcohol', title: 'I make or produce alcohol products', who: 'Manufacturers and producers of distilled spirits, wines and fermented liquors, and anyone holding untaxed alcohol removed from the place of production.', forms: ['2200-A'], deadline: 'Before the products are removed from the place of production. A separate return for each place of production.', sources: ['forms', 'bir'] },
  { id: 'tobacco', title: 'I make tobacco, heated tobacco or vapor products', who: 'Manufacturers and producers, and wholesalers and redrying-plant owners for the inspection fee.', forms: ['2200-T'], deadline: 'Before removal from the place of production', sources: ['forms', 'bir'] },
  { id: 'petroleum', title: 'I make or refine petroleum products', who: 'Manufacturers, refiners and blenders, importers or buyers who resell kerosene as aviation fuel, and users of denatured alcohol for motive power.', forms: ['2200-P'], deadline: 'Before removal from the place of production', sources: ['forms', 'bir'] },
  { id: 'beverages', title: 'I make sweetened beverages', who: 'Manufacturers and producers, and anyone holding untaxed sweetened beverages removed from the place of production.', forms: ['2200-S'], deadline: 'Before removal from the place of production', sources: ['guide2200s', 'forms'] },
  { id: 'autos', title: 'I make or assemble automobiles, or sell jewelry, perfume or yachts', who: 'Manufacturers, producers and assemblers of automobiles and non-essential goods, and buyers who resell an automobile not previously taxed.', forms: ['2200-AN'], deadline: 'Before removal from the place of production', sources: ['guide2200an', 'forms'] },
  { id: 'imports', title: 'I import excisable goods', who: 'Importers and owners of imported excisable goods.', forms: [], deadline: 'Before the goods are released from customs custody. The Bureau of Customs collects it, so use the Customs calculator for imports.', sources: ['bir'] },
];
