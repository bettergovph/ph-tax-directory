export interface TaxSource { label: string; url: string }

/** One "which form do I file?" case on an indirect-tax guide. */
export interface TaxSituation {
  id: string;
  title: string;
  who: string;
  forms: string[];
  deadline: string;
  note?: string;
  sources: string[];
}

/** A topic page on the Indirect Taxes screen. */
export type IndirectTopic = 'vat' | 'percentage' | 'excise' | 'dst';
export const INDIRECT_TOPICS: { id: IndirectTopic; label: string; short: string; description: string }[] = [
  { id: 'vat', label: 'VAT', short: 'VAT', description: '12% on sales of goods and services' },
  { id: 'percentage', label: 'Percentage tax', short: 'Percentage', description: 'Business tax for non-VAT sellers and special industries' },
  { id: 'excise', label: 'Excise tax', short: 'Excise', description: 'Alcohol, tobacco, fuel, sweetened drinks and cars' },
  { id: 'dst', label: 'Documentary stamp tax', short: 'DST', description: 'Loans, property sales, leases, shares and insurance' },
];
