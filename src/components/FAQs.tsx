import React, { useState } from 'react';
import { HelpCircle, Search, Globe } from 'lucide-react';
import { FAQS } from '@/data/faqs';
import { Button, Card, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import { FaqList } from '@/components/FaqList';

const FAQs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [language, setLanguage] = useState<'en' | 'fil'>('en');

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'general', name: 'General' },
    { id: 'individual', name: 'Individual Tax' },
    { id: 'business', name: 'Business Tax' },
    { id: 'vat', name: 'VAT' },
    { id: 'percentage', name: 'Percentage Tax' },
    { id: 'excise', name: 'Excise Tax' },
    { id: 'dst', name: 'Documentary Stamp Tax' },
    { id: 'withholding', name: 'Withholding Tax' },
    { id: 'contributions', name: 'Contributions' },
    { id: 'property', name: 'Property Tax' }
  ];

  const filteredFAQs = FAQS.filter(faq => {
    const matchesSearch = (
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (faq.questionFil && faq.questionFil.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (faq.answerFil && faq.answerFil.toLowerCase().includes(searchTerm.toLowerCase())) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory || faq.taxType === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold">Frequently Asked Questions</CardTitle>
            <CardDescription>Common tax questions answered in plain language</CardDescription>
          </div>
        </CardHeader>

        {/* Language Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-600" />
            <span className="text-sm sm:text-base font-medium text-gray-700">Language:</span>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant="toggle"
              size="sm"
              active={language === 'en'}
              onClick={() => setLanguage('en')}
              className="px-3 py-1.5 sm:py-1 rounded-md"
            >
              English
            </Button>
            <Button
              variant="toggle"
              size="sm"
              active={language === 'fil'}
              onClick={() => setLanguage('fil')}
              className="px-3 py-1.5 sm:py-1 rounded-md"
            >
              Filipino
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search questions, answers, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <FaqList items={filteredFAQs} language={language} />

      {filteredFAQs.length === 0 && (
        <Card padding="lg" className="text-center">
          <HelpCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No questions found</h3>
          <p className="text-sm sm:text-base text-gray-600">Try adjusting your search or filter criteria.</p>
        </Card>
      )}

      {/* Additional Help */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-medium text-blue-900 mb-2">Still have questions?</h3>
        <p className="text-xs sm:text-sm text-blue-700 mb-3 leading-relaxed">
          Can't find the answer you're looking for? Visit the official BIR website or contact your local Revenue District Office for assistance.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href="https://www.bir.gov.ph"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-xs sm:text-sm"
          >
            <Globe className="w-4 h-4" />
            Visit BIR Website
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQs;