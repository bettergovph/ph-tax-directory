import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Calculator, Info } from 'lucide-react';
import { TaxType } from '@/types/tax';
import { DirectorySection } from '@/types/directory';
import Navigation from '@/components/Navigation';
import TaxTypeSelector from '@/components/TaxTypeSelector';
import CompensationTaxCalculator from '@/components/CompensationTaxCalculator';
import VATCalculator from '@/components/VATCalculator';
import CustomsDutyCalculator from '@/components/CustomsDutyCalculator';
import FreelancerTaxCalculator from '@/components/FreelancerTaxCalculator';
import TaxpayerCategories from '@/components/TaxpayerCategories';
import FormsLibrary from '@/components/FormsLibrary';
import FilingCalendar from '@/components/FilingCalendar';
import TaxRates from '@/components/TaxRates';
import FAQs from '@/components/FAQs';
import Footer from './Footer';

const TaxDirectory: React.FC = () => {
  const location = useLocation();
  const { taxType } = useParams<{ taxType?: string }>();
  const navigate = useNavigate();

  // Determine current section from pathname
  const getCurrentSection = (): DirectorySection => {
    const path = location.pathname.slice(1); // Remove leading slash
    const section = path.split('/')[0];

    const validSections: DirectorySection[] = ['tax-calculators', 'taxpayer-categories', 'forms-library', 'filing-calendar', 'tax-rates', 'faqs'];
    return validSections.includes(section as DirectorySection) ? section as DirectorySection : 'tax-calculators';
  };

  // Determine current tax type from URL parameter or default
  const getCurrentTaxType = (): TaxType => {
    if (taxType && ['compensation', 'vat', 'customs', 'freelancer'].includes(taxType as TaxType)) {
      return taxType as TaxType;
    }
    return 'compensation';
  };

  const activeSection = getCurrentSection();
  const selectedTaxType = getCurrentTaxType();

  // Handle tax type change within calculators
  const handleTaxTypeChange = (newTaxType: TaxType) => {
    navigate(`/tax-calculators/${newTaxType}`);
  };

  const renderCalculator = () => {
    switch (selectedTaxType) {
      case 'compensation':
        return <CompensationTaxCalculator />;
      case 'vat':
        return <VATCalculator />;
      case 'customs':
        return <CustomsDutyCalculator />;
      case 'freelancer':
        return <FreelancerTaxCalculator />;
      default:
        return <CompensationTaxCalculator />;
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'tax-calculators':
        return (
          <>
            <TaxTypeSelector selectedType={selectedTaxType} onTypeChange={handleTaxTypeChange} />
            {renderCalculator()}
          </>
        );
      case 'taxpayer-categories':
        return <TaxpayerCategories />;
      case 'forms-library':
        return <FormsLibrary />;
      case 'filing-calendar':
        return <FilingCalendar />;
      case 'tax-rates':
        return <TaxRates />;
      case 'faqs':
        return <FAQs />;
      default:
        return (
          <>
            <TaxTypeSelector selectedType={selectedTaxType} onTypeChange={handleTaxTypeChange} />
            {renderCalculator()}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Navigation */}
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-grow">

        {/* Dynamic Content */}
        {renderContent()}

        {/* Disclaimer */}
        <div className="mt-6 sm:mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">Important Disclaimer</h4>
              <p className="text-xs sm:text-sm text-yellow-700 leading-relaxed">
                This platform is intended for general informational and educational purposes only.
                It does not provide official tax, legal, or financial advice and should not be relied upon as a substitute for
                guidance from the <a href="https://www.bir.gov.ph/" target="_blank" rel="noopener noreferrer" className="text-yellow-800 hover:text-yellow-900 underline font-medium">Bureau of Internal Revenue (BIR)</a> or a licensed professional.
                For advice specific to your situation, please consult the appropriate government agency or a qualified tax advisor.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TaxDirectory;
