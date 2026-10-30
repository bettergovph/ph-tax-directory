import React from 'react';
import { TaxType, TAX_TYPES } from '@/types/tax';
import { Calculator, User, Receipt } from 'lucide-react';
import { Card, Badge } from '@/components/ui';

interface TaxTypeSelectorProps {
  selectedType: TaxType;
  onTypeChange: (type: TaxType) => void;
}

const SHORT_LABELS: Partial<Record<TaxType, string>> = { income: 'Direct', indirect: 'Indirect', customs: 'Customs' };

const getIcon = (type: TaxType) => {
  switch (type) {
    case 'income':
    case 'compensation':
      return <User className="w-5 h-5" />;
    case 'indirect':
      return <Receipt className="w-5 h-5" />;
    default:
      return <Calculator className="w-5 h-5" />;
  }
};

const TaxTypeSelector: React.FC<TaxTypeSelectorProps> = ({ selectedType, onTypeChange }) => {
  return (
    <Card className="mb-4 sm:mb-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Select Tax Group</h2>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {TAX_TYPES.map((taxType) => (
          <button
            key={taxType.id}
            onClick={() => onTypeChange(taxType.id)}
            className={`p-2 sm:p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md active:scale-95 ${selectedType === taxType.id
              ? 'border-blue-500 bg-blue-50 shadow-md'
              : 'border-gray-200 hover:border-blue-300'
              }`}
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <div className={`flex-shrink-0 ${selectedType === taxType.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                {getIcon(taxType.id)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-medium text-sm sm:text-base mb-1 ${selectedType === taxType.id ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                  <span className="hidden sm:inline">{taxType.name}</span><span className="sm:hidden">{SHORT_LABELS[taxType.id] ?? taxType.name}</span>
                </h3>
                <p className={`hidden sm:block text-xs sm:text-sm leading-relaxed ${selectedType === taxType.id ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                  {taxType.description}
                </p>
                {taxType.rate && (
                  <div className="mt-2 hidden sm:block">
                    <Badge variant={selectedType === taxType.id ? 'blue' : 'gray'} size="sm">
                      {taxType.rate}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};

export default TaxTypeSelector;
