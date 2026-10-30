import { useSearchParams } from 'react-router-dom';
import { INDIRECT_TOPICS, IndirectTopic } from '@/types/indirect';
import { PT_REVIEWED_DATE, PT_SOURCES, PT_SITUATIONS } from '@/data/percentageTax';
import { EXCISE_REVIEWED_DATE, EXCISE_SITUATIONS, EXCISE_SOURCES } from '@/data/excise';
import { DST_REVIEWED_DATE, DST_SITUATIONS, DST_SOURCES } from '@/data/dst';
import TaxTabs from '@/components/TaxTabs';
import { GlossaryText } from '@/components/TaxTerms';
import VATCalculator from '@/components/VATCalculator';
import PercentageTaxCalculator from '@/components/PercentageTaxCalculator';
import ExciseTaxCalculator from '@/components/ExciseTaxCalculator';
import DstCalculator from '@/components/DstCalculator';
import IndirectGuide from '@/components/IndirectGuide';

const isTopic = (value: string | null): value is IndirectTopic => INDIRECT_TOPICS.some(t => t.id === value);

/** Indirect taxes: VAT, percentage tax, excise tax and documentary stamp tax, each with a calculator and a guide. The tab is the `tax` URL parameter. */
export default function IndirectTaxes() {
  const [params, setParams] = useSearchParams();
  const requested = params.get('tax');
  const topic: IndirectTopic = isTopic(requested) ? requested : 'vat';
  const info = INDIRECT_TOPICS.find(t => t.id === topic)!;

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="rounded-xl bg-white p-4 shadow-lg sm:p-6" aria-labelledby="indirect-heading">
        <h2 id="indirect-heading" className="text-lg font-semibold text-gray-900 sm:text-xl">Indirect taxes</h2>
        <GlossaryText className="mt-1 mb-4 text-sm leading-relaxed text-gray-600" text="An indirect tax is paid to BIR by the seller, maker or one party to a document, but the cost is built into the price, so the buyer or customer ends up bearing it. Income tax, capital gains tax, estate tax and donor’s tax are direct taxes. They are covered under Direct Taxes." />
        <TaxTabs label="Indirect tax" tabs={INDIRECT_TOPICS} active={topic} onChange={id => setParams({ tax: id })} />
        <p className="mt-3 text-sm text-gray-600">{info.description}.</p>
      </section>

      {topic === 'vat' && <VATCalculator />}
      {topic === 'percentage' && <>
        <PercentageTaxCalculator />
        <IndirectGuide situations={PT_SITUATIONS} sources={PT_SOURCES} reviewedDate={PT_REVIEWED_DATE} faqTopic="percentage" faqHeading="Percentage tax questions" />
      </>}
      {topic === 'excise' && <>
        <ExciseTaxCalculator />
        <IndirectGuide formsHeading="Which excise return do I file?" situations={EXCISE_SITUATIONS} sources={EXCISE_SOURCES} reviewedDate={EXCISE_REVIEWED_DATE} faqTopic="excise" faqHeading="Excise tax questions" />
      </>}
      {topic === 'dst' && <>
        <DstCalculator />
        <IndirectGuide situations={DST_SITUATIONS} sources={DST_SOURCES} reviewedDate={DST_REVIEWED_DATE} faqTopic="dst" faqHeading="Documentary stamp tax questions" />
      </>}
    </div>
  );
}
