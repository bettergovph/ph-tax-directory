import { useId, useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Globe } from 'lucide-react';
import { FAQ } from '@/types/directory';
import { Badge, Card } from '@/components/ui';

export type FaqLanguage = 'en' | 'fil';

/** Accordion of FAQs. Shared by the FAQs page and topic pages such as VAT. */
export function FaqList({ items, language = 'en' }: { items: FAQ[]; language?: FaqLanguage }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const baseId = useId();
  return (
    <div className="space-y-4">
      {items.map(faq => {
        const isExpanded = expanded === faq.id;
        const question = language === 'fil' && faq.questionFil ? faq.questionFil : faq.question;
        const answer = language === 'fil' && faq.answerFil ? faq.answerFil : faq.answer;
        const panelId = `${baseId}-${faq.id}`;
        return (
          <Card key={faq.id} padding="none" className="overflow-hidden">
            <button
              type="button"
              onClick={() => setExpanded(isExpanded ? null : faq.id)}
              aria-expanded={isExpanded}
              aria-controls={panelId}
              className="w-full p-4 sm:p-6 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 pr-2 sm:pr-4 leading-relaxed">{question}</h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                    {faq.tags.map(tag => <Badge key={tag} variant="gray" size="sm">{tag}</Badge>)}
                  </div>
                </div>
                {isExpanded
                  ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
                  : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" aria-hidden="true" />}
              </div>
            </button>
            {isExpanded && (
              <div id={panelId} className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-gray-100">
                <div className="pt-3 sm:pt-4">
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">{answer}</p>
                  {faq.relatedForms && faq.relatedForms.length > 0 && (
                    <div className="pt-3 sm:pt-4 border-t border-gray-100">
                      <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" aria-hidden="true" />Related Forms
                      </h4>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {faq.relatedForms.map(form => (
                          <a key={form} href={`#/forms-library?form=${form}`} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100">BIR Form {form}</a>
                        ))}
                      </div>
                    </div>
                  )}
                  {((language === 'en' && faq.answerFil) || (language === 'fil' && faq.answer !== answer)) && (
                    <div className="mt-3 sm:mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-4 h-4 text-gray-600" aria-hidden="true" />
                        <span className="text-xs sm:text-sm font-medium text-gray-700">{language === 'en' ? 'Filipino Translation:' : 'English Translation:'}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{language === 'en' ? faq.answerFil : faq.answer}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
