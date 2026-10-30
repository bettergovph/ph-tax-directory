import React, { useState } from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle, Users, Building, Receipt } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TaxDeadline {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  frequency: 'monthly' | 'quarterly' | 'annually';
  category: 'individual' | 'business' | 'withholding' | 'all';
  form?: string;
  priority: 'high' | 'medium' | 'low';
  applicableTo: string[];
}

const TAX_DEADLINES: TaxDeadline[] = [
  // Monthly Deadlines
  {
    id: 'withholding-compensation',
    title: 'Withholding Tax on Compensation',
    description: 'Monthly remittance of income tax withheld from employees',
    dueDate: '10th of following month',
    frequency: 'monthly',
    category: 'withholding',
    form: 'BIR Form 1601C',
    priority: 'high',
    applicableTo: ['All employers', 'Withholding agents']
  },
  {
    id: 'withholding-expanded',
    title: 'Expanded Withholding Tax',
    description: 'Monthly remittance of expanded withholding tax',
    dueDate: '10th of following month',
    frequency: 'monthly',
    category: 'withholding',
    form: 'BIR Form 1601E',
    priority: 'high',
    applicableTo: ['Withholding agents', 'Government agencies']
  },

  {
    id: 'withholding-vat-pt',
    title: 'VAT and Percentage Tax Withheld',
    description: 'Monthly remittance of VAT or percentage tax withheld, mainly by government offices paying private suppliers',
    dueDate: '10th of following month',
    frequency: 'monthly',
    category: 'withholding',
    form: 'BIR Form 1600-VT / 1600-PT',
    priority: 'medium',
    applicableTo: ['Government offices', 'Withholding agents']
  },
  {
    id: 'dst-monthly',
    title: 'Documentary Stamp Tax',
    description: 'Return and payment for documents made, signed, issued, accepted or transferred during the month',
    dueDate: 'Within 5 days after the end of the month',
    frequency: 'monthly',
    category: 'business',
    form: 'BIR Form 2000 / 2000-OT',
    priority: 'medium',
    applicableTo: ['Parties to loans, leases, mortgages, insurance policies, property sales and share transfers']
  },

  // Quarterly Deadlines
  {
    id: 'income-tax-individual',
    title: 'Quarterly Income Tax (Individual)',
    description: 'Quarterly income tax return for self-employed and professionals',
    dueDate: 'Last day of month following quarter',
    frequency: 'quarterly',
    category: 'individual',
    form: 'BIR Form 1701Q',
    priority: 'high',
    applicableTo: ['Self-employed', 'Professionals', 'Business owners']
  },
  {
    id: 'income-tax-corporate',
    title: 'Quarterly Income Tax (Corporate)',
    description: 'Quarterly corporate income tax return',
    dueDate: 'Last day of month following quarter',
    frequency: 'quarterly',
    category: 'business',
    form: 'BIR Form 1702Q',
    priority: 'high',
    applicableTo: ['Corporations']
  },
  {
    id: 'percentage-tax',
    title: 'Quarterly Percentage Tax',
    description: 'Percentage tax for non-VAT registered businesses',
    dueDate: '25 days after the end of each taxable quarter',
    frequency: 'quarterly',
    category: 'business',
    form: 'BIR Form 2551Q',
    priority: 'medium',
    applicableTo: ['Non-VAT registered businesses']
  },
  {
    id: 'vat-quarterly',
    title: 'Quarterly VAT Return',
    description: 'Quarterly value-added tax return and payment. Replaces the monthly 2550M for transactions from January 1, 2023 (RMC 5-2023).',
    dueDate: '25th day following the close of each taxable quarter',
    frequency: 'quarterly',
    category: 'business',
    form: 'BIR Form 2550Q',
    priority: 'high',
    applicableTo: ['VAT-registered businesses']
  },

  // Annual Deadlines
  {
    id: 'annual-itr-individual',
    title: 'Annual Income Tax Return (Individual)',
    description: 'Annual income tax return for individuals',
    dueDate: 'April 15',
    frequency: 'annually',
    category: 'individual',
    form: 'BIR Form 1700/1701',
    priority: 'high',
    applicableTo: ['All individual taxpayers']
  },
  {
    id: 'annual-itr-corporate',
    title: 'Annual Income Tax Return (Corporate)',
    description: 'Annual corporate income tax return',
    dueDate: 'April 15',
    frequency: 'annually',
    category: 'business',
    form: 'BIR Form 1702',
    priority: 'high',
    applicableTo: ['All corporations']
  },
  {
    id: 'compensation-certificate',
    title: 'Certificate of Compensation Payment',
    description: 'Issuance of BIR Form 2316 to employees',
    dueDate: 'January 31',
    frequency: 'annually',
    category: 'withholding',
    form: 'BIR Form 2316',
    priority: 'high',
    applicableTo: ['All employers']
  }
];

const FilingCalendar: React.FC = () => {
  const [selectedFrequency, setSelectedFrequency] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const frequencies = [
    { id: 'all', name: 'All Frequencies' },
    { id: 'monthly', name: 'Monthly' },
    { id: 'quarterly', name: 'Quarterly' },
    { id: 'annually', name: 'Annual' }
  ];

  const categories = [
    { id: 'all', name: 'All Categories', icon: Calendar },
    { id: 'individual', name: 'Individual', icon: Users },
    { id: 'business', name: 'Business', icon: Building },
    { id: 'withholding', name: 'Withholding Tax', icon: Receipt }
  ];

  const filteredDeadlines = TAX_DEADLINES.filter(deadline => {
    const matchesFrequency = selectedFrequency === 'all' || deadline.frequency === selectedFrequency;
    const matchesCategory = selectedCategory === 'all' || deadline.category === selectedCategory || deadline.category === 'all';
    return matchesFrequency && matchesCategory;
  });

  const getPriorityClasses = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return AlertTriangle;
      case 'medium': return Clock;
      case 'low': return CheckCircle;
      default: return Clock;
    }
  };

  const getFrequencyClasses = (frequency: string) => {
    switch (frequency) {
      case 'monthly': return 'bg-blue-100 text-blue-800';
      case 'quarterly': return 'bg-green-100 text-green-800';
      case 'annually': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Filing Calendar</h2>
            <p className="text-sm sm:text-base text-gray-600">Tax deadlines and filing reminders by taxpayer type</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Frequency</label>
            <select
              value={selectedFrequency}
              onChange={(e) => setSelectedFrequency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {frequencies.map(freq => (
                <option key={freq.id} value={freq.id}>{freq.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid gap-4">
        {filteredDeadlines.map((deadline) => {
          const PriorityIcon = getPriorityIcon(deadline.priority);
          const priorityClasses = getPriorityClasses(deadline.priority);
          const frequencyClasses = getFrequencyClasses(deadline.frequency);

          return (
            <div key={deadline.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium", frequencyClasses)}>
                      <Calendar className="w-3 h-3" />
                      {deadline.frequency}
                    </div>
                    <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium", priorityClasses)}>
                      <PriorityIcon className="w-3 h-3" />
                      {deadline.priority} priority
                    </div>
                    {deadline.form && (
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                        {deadline.form}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{deadline.title}</h3>
                  <p className="text-gray-600 mb-3">{deadline.description}</p>

                  <div className="flex items-center gap-2 text-lg font-medium text-orange-700 mb-3">
                    <Clock className="w-5 h-5" />
                    <span>Due: {deadline.dueDate}</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Applicable To:</h4>
                    <div className="flex flex-wrap gap-2">
                      {deadline.applicableTo.map((item, index) => (
                        <span key={index} className="bg-blue-50 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDeadlines.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No deadlines found</h3>
          <p className="text-gray-600">Try adjusting your filter criteria.</p>
        </div>
      )}

      {/* Important Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-yellow-800 mb-2">Important Reminders</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Deadlines falling on weekends or holidays are moved to the next business day</li>
              <li>• Late filing incurs penalties and interest charges</li>
              <li>• Electronic filing (eBIRForms) is available for most returns</li>
              <li>• Always verify current deadlines with the BIR as they may change</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilingCalendar;
