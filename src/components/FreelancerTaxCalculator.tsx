import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, Receipt, Percent, TrendingUp, Award, AlertCircle, Calendar } from 'lucide-react';
import { calculateFreelancerTax } from '@/utils/freelancerTaxCalculator';
import { FreelancerCalculation, FilingPeriod } from '@/types/tax';

const FreelancerTaxCalculator: React.FC = () => {
  const [grossSales, setGrossSales] = useState<string>('');
  const [deductions, setDeductions] = useState<string>('');
  const [filingPeriod, setFilingPeriod] = useState<FilingPeriod>('quarterly');
  const [calculation, setCalculation] = useState<FreelancerCalculation | null>(null);

  // Calculate taxes when inputs change
  useEffect(() => {
    const sales = parseFloat(grossSales) || 0;
    const deductionsAmount = parseFloat(deductions) || 0;

    if (sales > 0) {
      const result = calculateFreelancerTax({
        grossSales: sales,
        deductions: deductionsAmount,
        filingPeriod
      });
      setCalculation(result);
    } else {
      setCalculation(null);
    }
  }, [grossSales, deductions, filingPeriod]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (rate: number): string => {
    return `${(rate * 100).toFixed(1)}%`;
  };


  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Beta Notice */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-orange-800 mb-1 text-sm sm:text-base flex items-center gap-2">
              Beta Testing
              <span className="bg-orange-200 text-orange-800 text-xs font-medium px-2 py-0.5 rounded">BETA</span>
            </h4>
            <p className="text-xs sm:text-sm text-orange-700 leading-relaxed">
              This freelancer tax calculator is currently in beta testing. Features and calculations may be refined based on user feedback.
              Please verify all calculations with official BIR sources.
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Freelancer Tax Calculator</h2>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filing Period
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filingPeriod}
                onChange={(e) => setFilingPeriod(e.target.value as FilingPeriod)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base appearance-none bg-white"
              >
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Annual</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {filingPeriod === 'quarterly' ? 'Quarterly' : 'Annual'} Gross Sales/Receipts
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
              <input
                type="text"
                value={grossSales}
                onChange={(e) => setGrossSales(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder={filingPeriod === 'quarterly' ? '250,000.00' : '1,000,000.00'}
                className="w-full pl-8 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {filingPeriod === 'quarterly' ? 'Quarterly' : 'Annual'} Business Deductions
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
              <input
                type="text"
                value={deductions}
                onChange={(e) => setDeductions(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder={filingPeriod === 'quarterly' ? '100,000.00' : '400,000.00'}
                className="w-full pl-8 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Business expenses with proper receipts/documentation</p>
          </div>
        </div>
      </div>

      {calculation && (
        <>
          {/* Tax Eligibility Status */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Tax Registration Status</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Annual Equivalent</h3>
                <p className="text-lg font-semibold text-gray-600">
                  {formatCurrency(calculation.grossSales * (calculation.filingPeriod === 'quarterly' ? 4 : 1))}
                </p>
              </div>

              <div className={`rounded-lg p-4 ${calculation.isEligibleFor8Percent ? 'bg-green-50' : 'bg-red-50'}`}>
                <h3 className={`font-medium mb-2 ${calculation.isEligibleFor8Percent ? 'text-green-900' : 'text-red-900'}`}>
                  8% Flat Tax Eligibility
                </h3>
                <p className={`text-sm ${calculation.isEligibleFor8Percent ? 'text-green-700' : 'text-red-700'}`}>
                  {calculation.isEligibleFor8Percent ? 'Eligible (< ₱3M)' : 'Not Eligible (≥ ₱3M)'}
                </p>
              </div>

              <div className={`rounded-lg p-4 ${calculation.isVATRequired ? 'bg-orange-50' : 'bg-green-50'}`}>
                <h3 className={`font-medium mb-2 ${calculation.isVATRequired ? 'text-orange-900' : 'text-green-900'}`}>
                  VAT Registration
                </h3>
                <p className={`text-sm ${calculation.isVATRequired ? 'text-orange-700' : 'text-green-700'}`}>
                  {calculation.isVATRequired ? 'Required (≥ ₱3M)' : 'Optional (< ₱3M)'}
                </p>
              </div>
            </div>
          </div>

          {/* Income Tax Options Comparison */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Income Tax Options</h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {/* Graduated Tax */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-blue-900">Graduated Tax (0%-35%)</h3>
                  {calculation.recommended === 'graduatedTax' && (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                      <Award className="w-3 h-3" />
                      Recommended
                    </span>
                  )}
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Gross Sales:</span>
                    <span className="font-medium">{formatCurrency(calculation.incomeTaxOptions.graduatedTax.grossSales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Less: Deductions:</span>
                    <span className="font-medium">{formatCurrency(calculation.incomeTaxOptions.graduatedTax.deductions)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Less: Exemption:</span>
                    <span className="font-medium">{formatCurrency(calculation.filingPeriod === 'quarterly' ? 62500 : 250000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Taxable Income:</span>
                    <span className="font-medium">{formatCurrency(calculation.incomeTaxOptions.graduatedTax.taxableIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Income Tax:</span>
                    <span className="font-medium">{formatCurrency(calculation.incomeTaxOptions.graduatedTax.incomeTax)}</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-2 font-semibold">
                    <span className="text-blue-900">Net Income (after income tax):</span>
                    <span>{formatCurrency(calculation.incomeTaxOptions.graduatedTax.netIncome)}</span>
                  </div>
                </div>
              </div>

              {/* 8% Flat Tax */}
              {calculation.incomeTaxOptions.flatTax8Percent && (
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-green-900">8% Flat Tax</h3>
                    {calculation.recommended === 'flatTax8Percent' && (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        <Award className="w-3 h-3" />
                        Recommended
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Gross Sales:</span>
                      <span className="font-medium">{formatCurrency(calculation.incomeTaxOptions.flatTax8Percent.grossSales)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Less: Exemption:</span>
                      <span className="font-medium">{formatCurrency(calculation.incomeTaxOptions.flatTax8Percent.exemption)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Taxable Amount:</span>
                      <span className="font-medium">{formatCurrency(calculation.incomeTaxOptions.flatTax8Percent.taxableAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Income Tax (8%):</span>
                      <span className="font-medium">{formatCurrency(calculation.incomeTaxOptions.flatTax8Percent.incomeTax)}</span>
                    </div>
                    <div className="flex justify-between border-t border-green-200 pt-2 font-semibold">
                      <span className="text-green-900">Net Income (after income tax):</span>
                      <span>{formatCurrency(calculation.incomeTaxOptions.flatTax8Percent.netIncome)}</span>
                    </div>
                  </div>
                </div>
              )}

              {!calculation.incomeTaxOptions.flatTax8Percent && (
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">8% Flat Tax not available</p>
                    <p className="text-gray-500 text-xs mt-1">Only for annual gross sales below ₱3M</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Other Taxes */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <Percent className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Other Taxes</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className={`rounded-lg p-4 ${calculation.otherTaxes.percentageTax.applicable ? 'bg-orange-50' : 'bg-gray-50'}`}>
                <h3 className={`font-medium mb-2 ${calculation.otherTaxes.percentageTax.applicable ? 'text-orange-900' : 'text-gray-600'}`}>
                  Percentage Tax (3%)
                </h3>
                {calculation.otherTaxes.percentageTax.applicable ? (
                  <div className="space-y-1 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-orange-700">Rate:</span>
                      <span className="font-medium">{formatPercentage(calculation.otherTaxes.percentageTax.rate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-700">Amount:</span>
                      <span className="font-medium">{formatCurrency(calculation.otherTaxes.percentageTax.amount)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Not applicable (VAT registered)</p>
                )}
              </div>

              <div className={`rounded-lg p-4 ${calculation.otherTaxes.vat.applicable ? 'bg-red-50' : 'bg-gray-50'}`}>
                <h3 className={`font-medium mb-2 ${calculation.otherTaxes.vat.applicable ? 'text-red-900' : 'text-gray-600'}`}>
                  VAT (12%)
                </h3>
                {calculation.otherTaxes.vat.applicable ? (
                  <div className="space-y-1 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-red-700">Rate:</span>
                      <span className="font-medium">{formatPercentage(calculation.otherTaxes.vat.rate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-700">Amount:</span>
                      <span className="font-medium">{formatCurrency(calculation.otherTaxes.vat.amount)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">{`Not required (< ₱3M annually)`}</p>
                )}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Tax Summary</h2>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-700">Recommended Method:</span>
                  <span className="font-medium">{calculation.summary.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Income Tax:</span>
                  <span className="font-medium">{formatCurrency(calculation.summary.totalIncomeTax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Other Taxes (Percentage/VAT):</span>
                  <span className="font-medium">{formatCurrency(calculation.summary.totalOtherTax)}</span>
                </div>
                <div className="flex justify-between border-t border-purple-200 pt-2 font-semibold text-base">
                  <span className="text-purple-900">Total Tax Amount:</span>
                  <span className="text-purple-600">{formatCurrency(calculation.summary.totalAllTaxes)}</span>
                </div>
                <div className="flex justify-between border-t border-purple-200 pt-2 font-bold text-lg">
                  <span className="text-purple-900">Net Income After All Taxes:</span>
                  <span className="text-green-600">{formatCurrency(calculation.summary.netIncome)}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Important Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <Receipt className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-800 mb-2 text-sm sm:text-base">
              BIR Filing Requirements - {calculation?.filingPeriod === 'quarterly' ? 'Quarterly' : 'Annual'} Filing
            </h4>
            <div className="text-xs sm:text-sm text-blue-700 leading-relaxed space-y-2">
              {calculation?.filingPeriod === 'quarterly' && (
                <>
                  <div>
                    <strong>Quarterly Income Tax:</strong> BIR Form 1701Q (May 15, Aug 15, Nov 15, Jan 31)
                  </div>
                  <div>
                    <strong>Monthly Percentage Tax/VAT:</strong> BIR Form 2551M/2550M (25th of following month)
                  </div>
                  <div>
                    <strong>Annual Income Tax Return:</strong> BIR Form 1701 (April 15 of following year)
                  </div>
                </>
              )}
              {calculation?.filingPeriod === 'yearly' && (
                <>
                  <div>
                    <strong>Annual Income Tax Return:</strong> BIR Form 1701 (April 15 of following year)
                  </div>
                  <div>
                    <strong>Monthly Percentage Tax/VAT:</strong> BIR Form 2551M/2550M (25th of following month)
                  </div>
                  <div>
                    <strong>Note:</strong> If selecting annual filing, ensure you meet BIR requirements for this option
                  </div>
                </>
              )}
              <div>
                <strong>Registration:</strong> Must register as self-employed with BIR and obtain TIN/COR
              </div>
              <div>
                <strong>Tax Method:</strong> Choose between Graduated Tax (0%-35%) or 8% Flat Tax - must be consistently applied
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-amber-800 mb-1 text-sm sm:text-base">Important Disclaimer</h4>
            <div className="text-xs sm:text-sm text-amber-700 leading-relaxed space-y-1">
              <p>• This is an <strong>educational and reference tool</strong> only for freelancers and self-employed individuals.</p>
              <p>• Tax calculations are based on current BIR regulations (2025) including the ₱3M thresholds for 8% flat tax and VAT registration.</p>
              <p>• <strong>Filing period calculations</strong> are estimates - actual tax obligations depend on your chosen filing method and business structure.</p>
              <p>• <strong>Percentage tax (3%) and VAT (12%)</strong> calculations assume standard rates - special cases may apply differently.</p>
              <p>• Actual tax computation should be verified with the <strong>Bureau of Internal Revenue (BIR)</strong> or a licensed tax professional.</p>
              <p>• <strong>Important:</strong> Register with BIR as self-employed and obtain proper TIN/COR before conducting business.</p>
              <p>• Consider consulting a tax professional for complex situations, multiple income sources, or business registration requirements.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerTaxCalculator;
