import { HelpCircle } from 'lucide-react';
import { FAQS } from '@/data/faqs';
import { FAQ } from '@/types/directory';
import { TaxSituation, TaxSource } from '@/types/indirect';
import { FaqList } from '@/components/FaqList';
import { FormReferences, SourceLinks } from '@/components/TaxReferences';
import { GlossaryText, TermsPanel } from '@/components/TaxTerms';

interface IndirectGuideProps {
  /** Heading above the "which form" list, e.g. "Which BIR form do I file?". */
  formsHeading?: string;
  formsIntro?: string;
  situations: TaxSituation[];
  sources: Record<string, TaxSource>;
  reviewedDate: string;
  faqTopic: NonNullable<FAQ['taxType']>;
  faqHeading: string;
}

/** Forms, plain-language terms and FAQs for one indirect tax. Rendered below its calculator. */
export default function IndirectGuide({ formsHeading = 'Which BIR form do I file?', formsIntro = 'Pick the line that matches you. Each form links to the official BIR PDF.', situations, sources, reviewedDate, faqTopic, faqHeading }: IndirectGuideProps) {
  const faqs = FAQS.filter(faq => faq.taxType === faqTopic);
  const screenText = [...situations.flatMap(s => [s.title, s.who, s.deadline, s.note ?? '']), ...faqs.flatMap(f => [f.question, f.answer])];
  const headingId = `${faqTopic}-forms-heading`;
  return (
    <div className="space-y-4 sm:space-y-6">
      <section aria-labelledby={headingId} className="rounded-xl bg-white p-4 shadow-lg sm:p-6">
        <h2 id={headingId} className="text-lg font-semibold text-gray-900 sm:text-xl">{formsHeading}</h2>
        <p className="mt-1 text-sm text-gray-600">{formsIntro}</p>
        <div className="mt-4 space-y-3">
          {situations.map(situation => (
            <details key={situation.id} className="rounded-lg border border-gray-200 p-3 sm:p-4">
              <summary className="cursor-pointer text-sm font-semibold text-gray-900 sm:text-base">{situation.title}</summary>
              <div className="mt-3 space-y-3">
                <p className="text-sm text-gray-600"><span className="font-medium text-gray-800">Who: </span>{situation.who}</p>
                <p className="text-sm text-gray-600"><span className="font-medium text-gray-800">Due: </span>{situation.deadline}</p>
                {situation.note && <GlossaryText text={situation.note} className="text-sm text-gray-600" />}
                {situation.forms.length > 0 && <FormReferences numbers={situation.forms} />}
                <SourceLinks ids={situation.sources} sources={sources} />
              </div>
            </details>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-500">References reviewed {reviewedDate}. Confirm filing channels and deadline extensions with BIR before filing.</p>
      </section>

      <section aria-labelledby={`${faqTopic}-faq-heading`} className="space-y-4">
        <div className="flex items-center gap-2"><HelpCircle className="h-5 w-5 text-purple-600" aria-hidden="true" /><h2 id={`${faqTopic}-faq-heading`} className="text-lg font-semibold text-gray-900 sm:text-xl">{faqHeading}</h2></div>
        <FaqList items={faqs} />
        <a href="#/faqs" className="inline-block text-sm font-medium text-blue-700 underline">See all FAQs</a>
      </section>

      <div className="overflow-hidden rounded-xl bg-white shadow-lg"><TermsPanel texts={screenText} /></div>
    </div>
  );
}
