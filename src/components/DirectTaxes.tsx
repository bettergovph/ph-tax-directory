import { useSearchParams } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import IncomeTaxCalculator from '@/components/IncomeTaxCalculator';
import TaxTabs, { TaxTab } from '@/components/TaxTabs';
import { GlossaryText } from '@/components/TaxTerms';

const TABS: TaxTab[] = [
  { id: 'income', label: 'Income tax', short: 'Income' },
  { id: 'capital-gains', label: 'Capital gains tax', short: 'Capital gains' },
  { id: 'estate', label: 'Estate tax', short: 'Estate' },
  { id: 'donors', label: 'Donor’s tax', short: 'Donor’s' },
];
const CAPITAL_GAINS_ROUTES = [
  { title: 'Sale of land or a building', rate: '6%', form: 'BIR Form 1706', href: '#/tax-calculators/income?taxpayer=individual&classification=resident-citizen&route=property', text: 'Real property that is a capital asset: 6% of the highest of the selling price, zonal value or assessor’s value.' },
  { title: 'Sale of shares not on the stock exchange', rate: '15%', form: 'BIR Forms 1707 and 1707-A', href: '#/tax-calculators/income?taxpayer=individual&classification=resident-citizen&route=shares', text: 'Unlisted shares: 15% of the net gain.' },
];

function ComingSoon({ title, text }: { title: string; text: string }) {
  return <section className="rounded-xl bg-white p-6 shadow-lg sm:p-8" aria-labelledby="coming-soon-heading">
    <div className="flex items-center gap-3"><Clock className="h-5 w-5 text-gray-500" aria-hidden="true" /><h2 id="coming-soon-heading" className="text-lg font-semibold text-gray-900 sm:text-xl">{title}: coming soon</h2></div>
    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">{text}</p>
    <p className="mt-3 text-sm text-gray-600">Meanwhile, see the <a href="https://www.bir.gov.ph/" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">BIR website</a> for the official forms and guidance.</p>
  </section>;
}

/** Direct taxes: income tax (the existing calculator), capital gains (links into it), and estate and donor's tax (not built yet). The tab is the `tab` URL parameter. */
export default function DirectTaxes() {
  const [params, setParams] = useSearchParams();
  const requested = params.get('tab');
  const tab = TABS.some(t => t.id === requested) ? requested! : 'income';
  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="rounded-xl bg-white p-4 shadow-lg sm:p-6" aria-labelledby="direct-heading">
        <h2 id="direct-heading" className="text-lg font-semibold text-gray-900 sm:text-xl">Direct taxes</h2>
        <GlossaryText className="mt-1 mb-4 text-sm leading-relaxed text-gray-600" text="A direct tax is paid by the person who bears the cost, with no way to pass it on. Income tax, capital gains tax, estate tax and donor’s tax are direct taxes. VAT, percentage tax, excise tax and documentary stamp tax are indirect taxes." />
        <TaxTabs label="Direct tax" tabs={TABS} active={tab} onChange={id => setParams(id === 'income' ? {} : { tab: id })} />
      </section>

      {tab === 'income' && <IncomeTaxCalculator key={params.toString()} />}
      {tab === 'capital-gains' && <section className="rounded-xl bg-white p-4 shadow-lg sm:p-6" aria-labelledby="cgt-heading">
        <h2 id="cgt-heading" className="text-lg font-semibold text-gray-900 sm:text-xl">Capital gains tax</h2>
        <GlossaryText className="mt-1 text-sm leading-relaxed text-gray-600" text="Capital gains tax is charged when you sell property that is a capital asset, such as land, a house or shares that are not on the stock exchange. It is worked out in the Income Tax calculator. Choose your case below." />
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">{CAPITAL_GAINS_ROUTES.map(route => <li key={route.title} className="flex flex-col rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{route.rate} · {route.form}</p>
          <h3 className="mt-1 font-semibold text-gray-900">{route.title}</h3>
          <GlossaryText className="mt-1 text-sm text-gray-600" text={route.text} />
          <a href={route.href} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:underline">Open the calculator<ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
        </li>)}</ul>
      </section>}
      {tab === 'estate' && <ComingSoon title="Estate tax" text="Estate tax is charged on the transfer of a person’s property after they die. A calculator and guide for it are planned." />}
      {tab === 'donors' && <ComingSoon title="Donor’s tax" text="Donor’s tax is charged on property you give away during your lifetime. A calculator and guide for it are planned." />}
    </div>
  );
}
