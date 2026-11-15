import { FreelancerCalculation, FilingPeriod } from '../types/tax';
import { VAT_RATE } from '../data/taxRules';
import { calculateIncomeTax } from './taxCalculator';

export function calculateFreelancerTax(params: {
  grossSales: number;
  deductions?: number;
  filingPeriod?: FilingPeriod;
}): FreelancerCalculation {
  const { grossSales, deductions = 0, filingPeriod = 'quarterly' } = params;

  // Convert to annual amounts for calculations
  const periodMultiplier = filingPeriod === 'quarterly' ? 4 : 1;
  const annualGrossSales = grossSales * periodMultiplier;
  const annualDeductions = deductions * periodMultiplier;

  // Thresholds (annual)
  const VAT_THRESHOLD = 3000000; // ₱3M
  const FLAT_TAX_THRESHOLD = 3000000; // ₱3M
  const INDIVIDUAL_EXEMPTION = 250000; // ₱250k

  // Determine eligibility and requirements (based on annual amounts)
  const isEligibleFor8Percent = annualGrossSales < FLAT_TAX_THRESHOLD;
  const isVATRequired = annualGrossSales >= VAT_THRESHOLD;

  // Graduated Tax Calculation (annual basis)
  const annualTaxableIncome = Math.max(0, annualGrossSales - annualDeductions - INDIVIDUAL_EXEMPTION);
  const annualGraduatedIncomeTax = calculateIncomeTax(annualTaxableIncome);

  // Other taxes for graduated method (annual basis)
  const percentageTaxApplicable = !isVATRequired;
  const annualPercentageTax = percentageTaxApplicable ? annualGrossSales * 0.03 : 0;
  const annualVatTax = isVATRequired ? annualGrossSales * VAT_RATE : 0;

  // Convert back to period amounts
  const graduatedIncomeTax = annualGraduatedIncomeTax / periodMultiplier;
  const percentageTax = annualPercentageTax / periodMultiplier;
  const vatTax = annualVatTax / periodMultiplier;
  const taxableIncome = annualTaxableIncome / periodMultiplier;

  const graduatedTotalTax = graduatedIncomeTax + percentageTax + vatTax;
  const graduatedNetIncome = grossSales - graduatedTotalTax;

  // 8% Flat Tax Calculation (if eligible)
  let flatTax8Percent = null;
  let flatTaxTotalTax = 0;
  let flatTaxNetIncome = 0;

  if (isEligibleFor8Percent) {
    // Calculate on annual basis then convert to period
    const annualFlatTaxableAmount = Math.max(0, annualGrossSales - INDIVIDUAL_EXEMPTION);
    const annualFlatIncomeTax = annualFlatTaxableAmount * 0.08;
    const flatIncomeTax = annualFlatIncomeTax / periodMultiplier;
    const flatTaxableAmount = annualFlatTaxableAmount / periodMultiplier;
    const exemption = INDIVIDUAL_EXEMPTION / periodMultiplier;

    flatTaxTotalTax = flatIncomeTax + percentageTax + vatTax;
    flatTaxNetIncome = grossSales - flatTaxTotalTax;

    flatTax8Percent = {
      grossSales,
      exemption,
      taxableAmount: flatTaxableAmount,
      incomeTax: flatIncomeTax,
      totalTax: flatTaxTotalTax,
      netIncome: flatTaxNetIncome
    };
  }

  // Determine recommended method (highest net income)
  const recommended = flatTax8Percent && flatTaxNetIncome > graduatedNetIncome
    ? 'flatTax8Percent'
    : 'graduatedTax';

  const bestOptionTotalTax = recommended === 'flatTax8Percent'
    ? (flatTax8Percent?.totalTax || graduatedTotalTax)
    : graduatedTotalTax;

  const bestOptionNetIncome = recommended === 'flatTax8Percent'
    ? (flatTax8Percent?.netIncome || graduatedNetIncome)
    : graduatedNetIncome;

  return {
    grossSales,
    filingPeriod,
    isEligibleFor8Percent,
    isVATRequired,
    incomeTaxOptions: {
      graduatedTax: {
        grossSales,
        deductions,
        taxableIncome,
        incomeTax: graduatedIncomeTax,
        totalTax: graduatedTotalTax,
        netIncome: graduatedNetIncome
      },
      flatTax8Percent
    },
    otherTaxes: {
      percentageTax: {
        applicable: percentageTaxApplicable,
        rate: 0.03,
        amount: percentageTax
      },
      vat: {
        applicable: isVATRequired,
        rate: 0.12,
        amount: vatTax
      }
    },
    recommended,
    summary: {
      method: recommended === 'flatTax8Percent' ? '8% Flat Tax' : 'Graduated Tax',
      totalIncomeTax: recommended === 'flatTax8Percent' ? flatTax8Percent?.incomeTax || 0 : graduatedIncomeTax,
      totalOtherTax: percentageTax + vatTax,
      totalAllTaxes: bestOptionTotalTax,
      netIncome: bestOptionNetIncome
    }
  };
}
