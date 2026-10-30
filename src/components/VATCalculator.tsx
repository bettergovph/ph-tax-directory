import React, { useState, useEffect } from 'react';
import { FileText, Calculator } from 'lucide-react';
import { calculateVAT } from '@/utils/taxCalculator';
import VATGuide from '@/components/VATGuide';
import VATReturnCalculator from '@/components/VATReturnCalculator';
import { GlossaryText } from '@/components/TaxTerms';

interface VATCalculation {
  vatAmount: number;
  netAmount: number;
  grossAmount: number;
}

const VATCalculator: React.FC = () => {
  const [mode, setMode] = useState<'return' | 'convert'>('return');
  const [amount, setAmount] = useState<string>('');
  const [isVATInclusive, setIsVATInclusive] = useState<boolean>(false);
  const [calculation, setCalculation] = useState<VATCalculation | null>(null);

  useEffect(() => {
    const numericAmount = parseFloat(amount) || 0;

    if (numericAmount > 0) {
      const result = calculateVAT(numericAmount, isVATInclusive);
      setCalculation(result);
    } else {
      setCalculation(null);
    }
  }, [amount, isVATInclusive]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div role="group" aria-label="Calculator type" className="inline-flex rounded-lg bg-gray-100 p-1">
        {([['return', 'Quarterly VAT return (2550Q)'], ['convert', 'Add or remove 12% VAT']] as const).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setMode(id)} aria-pressed={mode === id}
            className={`rounded-md px-3 py-2 text-sm font-medium ${mode === id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>{label}</button>
        ))}
      </div>

      {mode === 'return' ? <VATReturnCalculator /> : (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">VAT Calculator</h2>
          </div>

          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="vatType"
                      checked={!isVATInclusive}
                      onChange={() => setIsVATInclusive(false)}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs sm:text-sm text-gray-700">VAT Exclusive (add 12% VAT)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="vatType"
                      checked={isVATInclusive}
                      onChange={() => setIsVATInclusive(true)}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs sm:text-sm text-gray-700">VAT Inclusive (extract 12% VAT)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isVATInclusive ? 'VAT Inclusive Amount' : 'VAT Exclusive Amount'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="10,000"
                    className="w-full pl-8 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            {calculation && (
              <div className="space-y-4 lg:space-y-0">
                <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
                  <h3 className="font-medium text-purple-900 mb-3 flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    <span className="text-sm sm:text-base">VAT Calculation (12%)</span>
                  </h3>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between items-start">
                      <span className="text-purple-700 flex-1 pr-2">Net Amount (VAT Exclusive):</span>
                      <span className="font-medium text-purple-900 text-right">{formatCurrency(calculation.netAmount)}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-purple-700 flex-1 pr-2">VAT Amount (12%):</span>
                      <span className="font-medium text-purple-900 text-right">{formatCurrency(calculation.vatAmount)}</span>
                    </div>
                    <div className="flex justify-between items-start border-t border-purple-200 pt-2 font-semibold">
                      <span className="text-purple-900 flex-1 pr-2">Gross Amount (VAT Inclusive):</span>
                      <span className="text-purple-700 text-right">{formatCurrency(calculation.grossAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-indigo-800 mb-1 text-sm sm:text-base">VAT Information</h4>
            <GlossaryText
              className="text-xs sm:text-sm text-indigo-700 leading-relaxed"
              text="Value Added Tax (VAT) is currently set at 12% in the Philippines. VAT-registered businesses must charge VAT on their sales and can claim input VAT on their purchases. Some goods and services may be VAT-exempt or zero-rated. Businesses with sales of ₱3 million a year or less can stay non-VAT and pay percentage tax instead."
            />
          </div>
        </div>
      </div>

      <VATGuide />
    </div>
  );
};

export default VATCalculator;
