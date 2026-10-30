import IndirectGuide from '@/components/IndirectGuide';
import { VAT_REVIEWED_DATE, VAT_SITUATIONS, VAT_SOURCES } from '@/data/vat';

/** Forms, plain-language terms and FAQs for the VAT tab. */
export default function VATGuide() {
  return <IndirectGuide situations={VAT_SITUATIONS} sources={VAT_SOURCES} reviewedDate={VAT_REVIEWED_DATE} faqTopic="vat" faqHeading="VAT questions" />;
}
