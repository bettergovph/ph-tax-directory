import { TaxSituation, TaxSource } from '../types/indirect';

export const PT_REVIEWED_DATE = 'October 30, 2026';
export const PT_SOURCES: Record<string, TaxSource> = {
  bir: { label: 'BIR · Percentage Tax', url: 'https://www.bir.gov.ph/percentage-tax' },
  form: { label: 'BIR Form 2551Q · rates and ATC table', url: 'https://bir-cdn.bir.gov.ph/local/pdf/2551Q%20Jan%202018%20ENCS%20final%20rev%203_copy.pdf' },
  guide: { label: '2551Q official guidelines', url: 'https://bir-cdn.bir.gov.ph/local/pdf/2551Q_%20Jan%202018%20Guide.pdf' },
  create: { label: 'RR 4-2021 · temporary 1% rate, July 2020 to June 2023', url: 'https://bir-cdn.bir.gov.ph/local/pdf/RR%20No.%204-2021_copy.pdf' },
  forms: { label: 'BIR · VAT and percentage tax forms', url: 'https://www.bir.gov.ph/bir-forms?tab=VAT%2FPercentage+Tax+Returns' },
};

export interface PtCategory {
  atc: string;
  label: string;
  section: string;
  /** Rate in basis points: 300 means 3%. */
  bp: bigint;
  /** Sec. 116 only: the rate was cut to 1% for quarters from July 1, 2020 to June 30, 2023 (CREATE). */
  createWindow?: boolean;
}

// Rates are the 2551Q (January 2018 ENCS) ATC table, which BIR still publishes.
export const PT_CATEGORIES: PtCategory[] = [
  { atc: 'PT 010', section: 'Sec. 116', label: 'Not VAT-registered: sales or receipts of ₱3 million or less', bp: 300n, createWindow: true },
  { atc: 'PT 040', section: 'Sec. 117', label: 'Domestic carriers and keepers of garages', bp: 300n },
  { atc: 'PT 041', section: 'Sec. 118', label: 'International carriers', bp: 300n },
  { atc: 'PT 060', section: 'Sec. 119', label: 'Franchises on gas and water utilities', bp: 200n },
  { atc: 'PT 070', section: 'Sec. 119', label: 'Franchises of radio and TV broadcasters with annual gross receipts of ₱10 million or less', bp: 300n },
  { atc: 'PT 090', section: 'Sec. 120', label: 'Overseas dispatch, message or conversation originating from the Philippines', bp: 1000n },
  { atc: 'PT 105', section: 'Sec. 121', label: 'Banks and quasi-banks: interest, commissions and discounts, maturity of 5 years or less', bp: 500n },
  { atc: 'PT 101', section: 'Sec. 121', label: 'Banks and quasi-banks: interest, commissions and discounts, maturity of more than 5 years', bp: 100n },
  { atc: 'PT 102', section: 'Sec. 121', label: 'Banks and quasi-banks: dividends, equity shares and net income of subsidiaries', bp: 0n },
  { atc: 'PT 103', section: 'Sec. 121', label: 'Banks and quasi-banks: royalties, rentals, profits from exchange and other gross income', bp: 700n },
  { atc: 'PT 104', section: 'Sec. 121', label: 'Banks and quasi-banks: net trading gains on foreign currency, debt securities and derivatives', bp: 700n },
  { atc: 'PT 113', section: 'Sec. 122', label: 'Other non-bank financial intermediaries: interest, commissions and discounts, maturity of 5 years or less', bp: 500n },
  { atc: 'PT 114', section: 'Sec. 122', label: 'Other non-bank financial intermediaries: interest, commissions and discounts, maturity of more than 5 years', bp: 100n },
  { atc: 'PT 115', section: 'Sec. 122', label: 'Other non-bank financial intermediaries: all other gross income', bp: 500n },
  { atc: 'PT 120', section: 'Sec. 123', label: 'Life insurance premiums', bp: 200n },
  { atc: 'PT 130', section: 'Sec. 124', label: 'Agents of foreign insurance companies: insurance agents', bp: 400n },
  { atc: 'PT 132', section: 'Sec. 124', label: 'Agents of foreign insurance companies: owners of property insured directly with foreign insurers', bp: 500n },
  { atc: 'PT 140', section: 'Sec. 125', label: 'Cockpits', bp: 1800n },
  { atc: 'PT 150', section: 'Sec. 125', label: 'Amusement places such as cabarets, night and day clubs, karaoke and music lounges', bp: 1800n },
  { atc: 'PT 160', section: 'Sec. 125', label: 'Boxing exhibitions', bp: 1000n },
  { atc: 'PT 170', section: 'Sec. 125', label: 'Professional basketball games', bp: 1500n },
  { atc: 'PT 180', section: 'Sec. 125', label: 'Jai-alai and race tracks', bp: 3000n },
];

export const PT_SITUATIONS: TaxSituation[] = [
  { id: 'non-vat', title: 'I am not VAT-registered and my sales are ₱3 million or less', who: 'Small sellers, freelancers and professionals who did not choose the 8% income tax option.', forms: ['2551Q'], deadline: '25 days after the end of each taxable quarter', note: 'If you chose the 8% income tax option, it replaces percentage tax, so you do not file 2551Q. Individuals mark their income tax choice on the first quarter return of the year.', sources: ['guide', 'form'] },
  { id: 'industries', title: 'My business is a carrier, franchise holder, bank, insurer or entertainment place', who: 'Industries that pay percentage tax by law, whatever their size.', forms: ['2551Q'], deadline: '25 days after the end of each taxable quarter', note: 'The calculator lists each industry rate under the Tax Code sections 117 to 125.', sources: ['guide', 'form'] },
  { id: 'withheld', title: 'I pay a supplier and must withhold percentage tax', who: 'Government offices, and payers whose payees chose to pay percentage tax through withholding.', forms: ['1600-PT'], deadline: '10th day of the month after the month of withholding', sources: ['forms'] },
  { id: 'shares', title: 'I sell listed shares or run a public offering', who: 'Stock brokers and corporate issuers.', forms: ['2552'], deadline: '5 banking days from collection, or 30 days from listing for a primary offering', sources: ['forms'] },
  { id: 'special', title: 'I owe percentage tax under a special law', who: 'Taxpayers named in a special law, not in the Tax Code.', forms: ['2553'], deadline: 'The due date written in that special law', sources: ['forms'] },
  { id: 'register', title: 'I want to register or change my tax type', who: 'New businesses, and those moving between percentage tax and VAT.', forms: ['1901', '1903', '1905'], deadline: 'Register before starting. Use 1905 to change tax types later.', sources: ['forms'] },
];
