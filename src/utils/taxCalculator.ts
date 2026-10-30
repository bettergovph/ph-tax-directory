import { TaxCalculation, CustomsCalculation, IncomePeriod } from '../types/tax';
import { TAX_BRACKETS, VAT_RATE } from '../data/taxRules';

function getIncomeTaxBracket(annualTaxableIncome: number) {
  if (!Number.isFinite(annualTaxableIncome) || annualTaxableIncome < 0) {
    throw new RangeError('Taxable income must be a finite, non-negative amount.');
  }
  return TAX_BRACKETS.find(bracket => annualTaxableIncome <= bracket.max)!;
}

export function calculateIncomeTax(annualTaxableIncome: number): number {
  const bracket = getIncomeTaxBracket(annualTaxableIncome);
  return bracket.baseAmount + Math.max(0, annualTaxableIncome - bracket.min) * bracket.rate;
}

// The input is already taxable compensation, after applicable exclusions.
// A monthly input projects the same taxable compensation across all 12 months.
export function calculateTax(taxableIncome: number, period: IncomePeriod = 'annual'): TaxCalculation {
  const annualTaxableIncome = period === 'monthly' ? taxableIncome * 12 : taxableIncome;
  const bracket = getIncomeTaxBracket(annualTaxableIncome);
  const excessIncome = Math.max(0, annualTaxableIncome - bracket.min);
  const taxOnExcess = excessIncome * bracket.rate;
  const annualTax = calculateIncomeTax(annualTaxableIncome);

  return {
    annualTaxableIncome,
    monthlyTaxEquivalent: annualTax / 12,
    annualTax,
    marginalRate: bracket.rate,
    effectiveRate: annualTaxableIncome > 0 ? annualTax / annualTaxableIncome : 0,
    bracketMinimum: bracket.min,
    baseTax: bracket.baseAmount,
    excessIncome,
    taxOnExcess,
  };
}

export function calculateVAT(amount: number, isVATInclusive: boolean = false): { vatAmount: number; netAmount: number; grossAmount: number } {
  if (isVATInclusive) {
    const netAmount = amount / (1 + VAT_RATE);
    const vatAmount = amount - netAmount;
    return {
      vatAmount,
      netAmount,
      grossAmount: amount
    };
  } else {
    const vatAmount = amount * VAT_RATE;
    const grossAmount = amount + vatAmount;
    return {
      vatAmount,
      netAmount: amount,
      grossAmount
    };
  }
}


export function calculateCustomsDuty(params: {
  fobFcaValue: number;
  freight: number;
  exchangeRate: number;
  rateOfDuty: number;
  isDangerousCargo?: boolean;
  brokerageFee?: number;
  exciseTaxRate?: number;
}): CustomsCalculation {
  const {
    fobFcaValue,
    freight,
    exchangeRate,
    rateOfDuty,
    isDangerousCargo = false,
    brokerageFee = 0,
    exciseTaxRate = 0
  } = params;

  // Calculate insurance (2% for general cargo, 4% for dangerous cargo)
  const insuranceRate = isDangerousCargo ? 0.04 : 0.02;
  const insurance = fobFcaValue * insuranceRate;

  // Calculate total dutiable value in foreign currency
  const totalDutiableValueForeign = fobFcaValue + freight + insurance;

  // Convert to PHP
  const totalDutiableValuePHP = totalDutiableValueForeign * exchangeRate;

  // Calculate customs duty
  const customsDuty = totalDutiableValuePHP * (rateOfDuty / 100);

  // Calculate excise tax (if applicable)
  const exciseTax = exciseTaxRate > 0 ? totalDutiableValuePHP * (exciseTaxRate / 100) : 0;

  // Fixed charges based on BOC tax estimator
  const importProcessingCharge = 250;
  const birDocumentaryStampTax = 30;
  const customsDocumentaryStamp = 100;

  // Calculate total landed cost
  const totalLandedCost = totalDutiableValuePHP + customsDuty + exciseTax +
    brokerageFee + importProcessingCharge +
    birDocumentaryStampTax + customsDocumentaryStamp;

  // Calculate VAT (12% of total landed cost)
  const vat = totalLandedCost * VAT_RATE;

  // Calculate total tax amount
  const totalTaxAmount = customsDuty + vat + exciseTax + importProcessingCharge +
    birDocumentaryStampTax + customsDocumentaryStamp;

  return {
    goods: {
      ahtnCode: '',
      description: '',
      rateOfDuty
    },
    dutiableValue: {
      fobFcaValue,
      freight,
      insurance,
      totalDutiableValueForeign,
      exchangeRate,
      totalDutiableValuePHP
    },
    charges: {
      customsDuty,
      exciseTax,
      brokerageFee,
      importProcessingCharge,
      birDocumentaryStampTax,
      customsDocumentaryStamp,
      totalLandedCost
    },
    summary: {
      customsDuty,
      vat,
      exciseTax,
      importProcessingCharge,
      birDocumentaryStampTax,
      customsDocumentaryStamp,
      totalTaxAmount
    }
  };
}
