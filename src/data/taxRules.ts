import { TaxBracket } from '../types/tax';

// Annual graduated income tax, effective January 1, 2023 onward.
// Source: BIR RR 11-2018, annualized withholding table (page 29).
// https://bir-cdn.bir.gov.ph/local/pdf/Digest%20RR%2011-2018.pdf
export const TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 250000, rate: 0.00, baseAmount: 0 },
  { min: 250000, max: 400000, rate: 0.15, baseAmount: 0 },
  { min: 400000, max: 800000, rate: 0.20, baseAmount: 22500 },
  { min: 800000, max: 2000000, rate: 0.25, baseAmount: 102500 },
  { min: 2000000, max: 8000000, rate: 0.30, baseAmount: 402500 },
  { min: 8000000, max: Number.POSITIVE_INFINITY, rate: 0.35, baseAmount: 2202500 }
];

export const VAT_RATE = 0.12;
