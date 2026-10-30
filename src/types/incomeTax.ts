export type TaxpayerKind = 'individual' | 'fiduciary' | 'corporation' | 'withholding';
export type FilingPeriod = 'annual' | 'q1' | 'q2' | 'q3' | 'q4' | 'monthly' | 'transaction' | 'projection';
export type IncomeRoute = 'compensation' | 'ordinary' | 'business' | 'business8' | 'mixed' | 'mixed8' | 'fiduciary' | 'corporate' | 'ith' | 'scit' | 'edr' | 'school' | 'exempt' | 'property' | 'shares' | 'passive' | 'nonresident' | 'payroll' | 'expanded' | 'final' | 'fringe' | 'specialist';
export interface IncomeTaxInput {
  taxpayer: TaxpayerKind;
  classification: string;
  route: IncomeRoute;
  period: FilingPeriod;
  year: number;
  fiscalMonth: number;
  month: number;
  values: Record<string, string>;
}
export interface Choice { value: string; label: string }
export interface TaxField {
  key: string;
  label: string;
  help?: string;
  type?: 'amount' | 'select' | 'check' | 'date' | 'year';
  options?: Choice[];
  optional?: boolean;
  allowNegative?: boolean;
  /** Optional fields grouped under a collapsed section with this title. */
  section?: string;
}
export interface IncomeRouteInfo {
  id: IncomeRoute;
  name: string;
  description: string;
  taxpayers: TaxpayerKind[];
  source: string;
  forms: string[];
  rate: string;
  category: string;
  effective: string;
}
export interface CalculationLine { label: string; amount?: number; detail?: string }
export interface TaxReturnResult {
  status: 'calculated' | 'incomplete' | 'needs-review';
  errors: string[];
  notes: string[];
  lines: CalculationLine[];
  forms: string[];
  liability?: number;
  credits?: number;
  balance?: number;
  rate?: string;
  marginalRate?: number;
  effectiveRate?: number;
  assessmentBase?: number;
  coveredPeriod: string;
  statutoryDeadline?: string;
  deadlineRule?: string;
  sources: string[];
}
