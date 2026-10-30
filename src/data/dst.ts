import { TaxSituation, TaxSource } from '../types/indirect';

export const DST_REVIEWED_DATE = 'October 30, 2026';
/** RA 12214 (CMEPA) rates for debt instruments and original issue of shares apply to documents from this date. */
export const CMEPA_DST_DATE = '2025-07-01';

export const DST_SOURCES: Record<string, TaxSource> = {
  forms: { label: 'BIR · Documentary stamp tax forms', url: 'https://www.bir.gov.ph/bir-forms?tab=Documentary+Stamp+Tax+Return' },
  form2000: { label: 'BIR Form 2000 · rate and ATC table', url: 'https://bir-cdn.bir.gov.ph/local/pdf/2000-DST%20Jan%202018%20final.pdf' },
  form2000ot: { label: 'BIR Form 2000-OT · rate and ATC table', url: 'https://bir-cdn.bir.gov.ph/local/pdf/2000-OT%20January%202018%20ENCS%20v3.pdf' },
  guide2000: { label: '2000 official guidelines · monthly return', url: 'https://bir-cdn.bir.gov.ph/local/pdf/2000%20Guide%20Jan%202018.pdf' },
  guide2000ot: { label: '2000-OT official guidelines · one-time transactions', url: 'https://bir-cdn.bir.gov.ph/local/pdf/2000-OT%20GL%20-%20revised2021.pdf' },
  rr19: { label: 'RR 19-2025 · CMEPA changes to DST from July 1, 2025', url: 'https://bir-cdn.bir.gov.ph/BIR/pdf/RR%20No.%2019-2025%20Digest.pdf' },
};

export type DstInstrumentId = 'loan' | 'mortgage' | 'real-property' | 'lease' | 'shares-issue' | 'shares-transfer' | 'life-insurance' | 'property-insurance';

export interface DstInstrument {
  id: DstInstrumentId;
  label: string;
  section: string;
  /** BIR return the tax is paid with. */
  form: '2000' | '2000-OT';
  /** Rates for this instrument apply to documents dated on or after this date (ISO). */
  fromDate?: string;
  summary: string;
}

export const DST_INSTRUMENTS: DstInstrument[] = [
  { id: 'loan', label: 'Loan agreement, promissory note or other debt instrument', section: 'Sec. 179', form: '2000', fromDate: CMEPA_DST_DATE, summary: '75% of 1% of the issue price. For terms under one year, the tax is prorated by days over 365.' },
  { id: 'mortgage', label: 'Mortgage, pledge or deed of trust', section: 'Sec. 195', form: '2000', summary: '₱40 on the first ₱5,000 secured, plus ₱20 on each additional ₱5,000 or part of it.' },
  { id: 'real-property', label: 'Deed of sale, conveyance or donation of real property', section: 'Sec. 196', form: '2000-OT', summary: '₱15 on each ₱1,000 or part of it, on the higher of the price and the fair market value.' },
  { id: 'lease', label: 'Lease or other hiring agreement', section: 'Sec. 194', form: '2000', summary: '₱6 on the first ₱2,000 of rent a year, plus ₱2 on each additional ₱1,000 or part of it, for each year of the lease.' },
  { id: 'shares-issue', label: 'Original issue of shares of stock', section: 'Sec. 174', form: '2000', fromDate: CMEPA_DST_DATE, summary: '75% of 1% of the par value, or of the actual consideration for shares without par value.' },
  { id: 'shares-transfer', label: 'Sale or transfer of shares not traded on a stock exchange', section: 'Sec. 175', form: '2000-OT', summary: '₱1.50 on each ₱200 or part of it of the par value. For no-par shares, 50% of the tax paid on the original issue.' },
  { id: 'life-insurance', label: 'Life insurance policy', section: 'Sec. 183', form: '2000', summary: 'A set amount by the amount insured, from ₱20 to ₱200. Policies of ₱100,000 or less are exempt.' },
  { id: 'property-insurance', label: 'Property insurance, fidelity bond and other insurance policy', section: 'Sec. 184 · Form 2000 table', form: '2000', summary: '₱0.50 on each ₱4 or part of it of the premium charged.' },
];

export const DST_SITUATIONS: TaxSituation[] = [
  { id: 'monthly', title: 'I signed, issued or accepted a loan, lease, mortgage, insurance policy or share issue', who: 'The person making, signing, issuing, accepting or transferring the document. Registered eDST users file through the eDST system.', forms: ['2000'], deadline: 'Within 5 days after the close of the month the document was made, signed, issued, accepted or transferred', note: 'File the return and pay at an Authorized Agent Bank, or the Revenue Collection Officer where there is no bank, for your Revenue District Office.', sources: ['guide2000', 'form2000'] },
  { id: 'one-time', title: 'I sold real property or transferred shares of stock', who: 'The person making, signing, issuing, accepting or transferring the deed or share transfer. One-time transactions use the 2000-OT.', forms: ['2000-OT'], deadline: 'Within 5 days after the close of the month the document was made, signed, issued, accepted or transferred', note: 'File where the seller or transferor is registered, or where the property is located for real property. Payments above ₱20,000 are made by Manager’s or Cashier’s check, not cash.', sources: ['guide2000ot', 'form2000ot'] },
  { id: 'unstamped', title: 'I need the document to be accepted by an office or a court', who: 'Anyone relying on a taxable document.', forms: ['2000', '2000-OT'], deadline: 'A document that needed a stamp and was not stamped cannot be recorded or used as evidence in court, and a notary cannot notarize it until the tax is paid.', sources: ['guide2000'] },
];
