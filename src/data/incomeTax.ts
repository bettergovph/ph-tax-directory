import { Choice, FilingPeriod, IncomeRouteInfo, IncomeTaxInput, TaxpayerKind } from '../types/incomeTax';

export const REVIEWED_DATE = 'October 18, 2026';
/** Earliest tax year the calculator's rules cover. Later years follow today's date, so the year list updates itself. */
export const FIRST_TAX_YEAR = 2025;
export const currentTaxYear = () => new Date().getFullYear();
export const taxYears = (latest = currentTaxYear()) => Array.from({ length: Math.max(1, latest - FIRST_TAX_YEAR + 1) }, (_, i) => latest - i);
export const SOURCES = {
  bir: { label: 'BIR income-tax guidance', url: 'https://www.bir.gov.ph/income-tax' },
  graduated: { label: 'RR 11-2018 · 2023-onward brackets and withholding', url: 'https://bir-cdn.bir.gov.ph/local/pdf/Digest%20RR%2011-2018.pdf' },
  eight: { label: 'RMO 23-2018 · elected 8% treatment', url: 'https://bir-cdn.bir.gov.ph/local/pdf/RMO%20NO.23-2018.pdf' },
  corporate: { label: 'RR 7-2025 · corporate and EDR rates', url: 'https://bir-cdn.bir.gov.ph/BIR/pdf/RR%207-2025.pdf' },
  mcit: { label: 'RMC 69-2023 · MCIT and institutional rates', url: 'https://bir-cdn.bir.gov.ph/local/pdf/RMC%20No.%2069-2023%20v2.pdf' },
  school: { label: 'RR 3-2022 · institutional eligibility', url: 'https://bir-cdn.bir.gov.ph/local/pdf/RR%20No.%203-2022.pdf' },
  passive: { label: 'RR 21-2025 · CMEPA income treatment', url: 'https://bir-cdn.bir.gov.ph/BIR/pdf/RR%20No.%2021-2025%20Digest.pdf' },
  incentives: { label: 'BOI · CREATE MORE incentive routes', url: 'https://www.boi.gov.ph/wp-content/uploads/2025/02/Doing-Business-in-the-Philippines-2025.pdf' },
  ms: { label: '1701-MS official instructions', url: 'https://bir-cdn.bir.gov.ph/BIR/pdf/1701-MS%20Guide%20August%202024%20ENCS_Final.pdf' },
  msChannel: { label: 'RMC 37-2026 · electronic 1701-MS filing', url: 'https://bir-cdn.bir.gov.ph/BIR/pdf/RMC%20No.%2037-2026%20Digest.pdf' },
  scope: { label: 'RMC 97-2021 · income-source scope', url: 'https://bir-cdn.bir.gov.ph/local/pdf/RMC%20No.%2097-2021.pdf' },
};
export const TAXPAYER_KINDS: Choice[] = [
  { value: 'individual', label: 'Individual' }, { value: 'corporation', label: 'Corporation or other entity' },
  { value: 'fiduciary', label: 'Estate or trust' }, { value: 'withholding', label: 'Employer / withholding agent' },
];
const individualClasses: Choice[] = [
  { value: 'resident-citizen', label: 'Resident citizen' }, { value: 'non-resident-citizen', label: 'Non-resident citizen / qualifying OFW' },
  { value: 'resident-alien', label: 'Resident alien' }, { value: 'nra-engaged', label: 'Non-resident alien engaged in trade/business' },
  { value: 'nra-not-engaged', label: 'Non-resident alien not engaged in trade/business' },
];
export const CLASSIFICATIONS: Record<TaxpayerKind, Choice[]> = {
  individual: individualClasses,
  corporation: [
    { value: 'domestic', label: 'Domestic corporation' }, { value: 'resident-foreign', label: 'Resident foreign corporation' },
    { value: 'nonresident-foreign', label: 'Non-resident foreign corporation' }, { value: 'partnership', label: 'Taxable domestic partnership / association' },
    { value: 'gocc', label: 'Taxable GOCC / instrumentality' }, { value: 'gpp', label: 'General professional partnership (GPP)' },
    { value: 'cooperative', label: 'CDA-registered cooperative' }, { value: 'exempt-entity', label: 'Qualified exempt organization (Sec. 30 / 27(C))' }, { value: 'special-entity', label: 'Other statutory / specialist entity' },
  ],
  fiduciary: [{ value: 'estate', label: 'Taxable estate during settlement' }, { value: 'trust', label: 'Taxable trust' }, { value: 'complex-trust', label: 'Exempt / complex fiduciary arrangement' }],
  withholding: [...individualClasses, { value: 'domestic', label: 'Domestic corporate payee' }, { value: 'resident-foreign', label: 'Resident foreign corporate payee' }, { value: 'nonresident-foreign', label: 'Non-resident foreign corporate payee' }],
};
const route = (id: IncomeRouteInfo['id'], name: string, description: string, taxpayers: TaxpayerKind[], source: string, forms: string[], rate: string, category: string, effective = '2025–2026 calculation periods') => ({ id, name, description, taxpayers, source, forms, rate, category, effective });
export const INCOME_ROUTES: IncomeRouteInfo[] = [
  route('compensation', 'Compensation income', 'Taxable salary and employment income; annual reconciliation or a separate monthly planning estimate.', ['individual'], 'graduated', ['1700', '2316'], '0%–35%; separate NRANETB treatment', 'Individual', 'January 1, 2023 onward'),
  route('ordinary', 'Other ordinary income', 'Annual ordinary non-business income after determining the applicable tax treatment.', ['individual'], 'graduated', ['1700'], '0%–35%', 'Individual', 'January 1, 2023 onward'),
  route('business', 'Business / profession · graduated', 'Use a taxable base, itemized deductions or eligible sales-based OSD.', ['individual'], 'graduated', ['1701Q', '1701', '1701A', '1701-MS', '2307'], '0%–35%', 'Individual', 'January 1, 2023 onward'),
  route('business8', 'Business / profession · elected 8%', 'Qualifying pure business income, with a single cumulative ₱250,000 reduction.', ['individual'], 'eight', ['1701Q', '1701A', '1701-MS', '2307'], '8%', 'Individual', 'TRAIN · election and eligibility required'),
  route('mixed', 'Mixed income · graduated', 'Business-only quarterly returns; combine compensation and business in the annual return.', ['individual'], 'graduated', ['1701Q', '1701', '1701-MS', '2316', '2307'], '0%–35%', 'Individual', 'January 1, 2023 onward'),
  route('mixed8', 'Mixed income · 8% business', 'Graduated compensation tax plus 8% business tax; no second ₱250,000 reduction.', ['individual'], 'eight', ['1701Q', '1701', '2316', '2307'], 'Graduated + 8%', 'Individual', 'TRAIN · election and eligibility required'),
  route('fiduciary', 'Estate / trust income', 'Enter the taxable fiduciary base after verified deductions and distributions; not estate transfer tax.', ['fiduciary'], 'graduated', ['1701Q', '1701', '2307'], '0%–35%', 'Fiduciary', 'January 1, 2023 onward'),
  route('corporate', 'Regular corporate income', 'Compare normal corporate tax with MCIT when applicable, using distinct tax bases.', ['corporation'], 'corporate', ['1702Q', '1702-RT', '2307'], '25% / qualifying 20%; MCIT 2%', 'Corporate', '25%/20% from July 2020; MCIT 2% from July 2023'),
  route('ith', 'Approved income tax holiday', 'Covered registered activity only; keep unregistered regular income separate.', ['corporation'], 'incentives', ['1702Q', '1702-MX'], '0% on approved covered income', 'Incentives', 'Approved incentive dates govern'),
  route('scit', 'Approved special corporate income tax', 'Use the approved SCIT gross-income-earned base, not sales or RCIT taxable income.', ['corporation'], 'incentives', ['1702Q', '1702-MX'], '5%', 'Incentives', 'Approved incentive dates govern'),
  route('edr', 'Enhanced deductions regime', '20% on registered-activity taxable income after permitted enhanced deductions.', ['corporation'], 'corporate', ['1702Q', '1702-MX'], '20%', 'Incentives', 'November 28, 2024 onward'),
  route('school', 'Qualifying school / nonprofit hospital', 'Test qualification and unrelated-business income before applying preferential treatment.', ['corporation'], 'school', ['1702Q', '1702-MX'], '10% if qualified; regular treatment otherwise', 'Corporate', '10% restored July 1, 2023'),
  route('exempt', 'GPP / exempt income only', 'GPP net income for partners’ shares, or exempt income with no other taxable income. Entities with taxable income use regular corporate income instead.', ['corporation'], 'bir', ['1702-EX'], '0% at entity level', 'Exempt', 'Legal exemption and scope must be established'),
  route('property', 'Real-property capital gains', 'Qualifying Philippine capital assets; use the highest applicable consideration or fair market value.', ['individual', 'corporation'], 'passive', ['1706'], '6%', 'Capital gains', 'Current qualifying capital-asset treatment'),
  route('shares', 'Unlisted-share capital gains', 'Transaction tax or annual gain/loss reconciliation; credit CGT already paid.', ['individual', 'corporation'], 'passive', ['1707', '1707-A'], '15%', 'Capital gains', 'Current rules; foreign-share filing requires confirmation'),
  route('passive', 'Passive income / branch remittance', 'Recipient-specific deposit interest, dividends, royalties, prizes, winnings and branch remittance.', ['individual', 'corporation'], 'passive', ['1601-FQ', '1602Q', '2306'], 'By income and recipient', 'Final tax', 'July 1, 2025 onward; grandfathering can apply'),
  route('nonresident', 'Non-resident gross-basis income', 'General Philippine-source gross-basis rule; exceptions and treaty relief need separate review.', ['individual', 'corporation'], 'passive', ['1601-FQ', '2306'], 'Generally 25%, subject to exceptions', 'Final tax', 'Current general rule'),
  route('payroll', 'Compensation withholding remittance', 'Reconcile actual payroll income tax withheld; do not apply one bracket to the combined payroll.', ['withholding'], 'graduated', ['1601-C', '1604-C', '2316'], 'Actual payroll tax withheld', 'Withholding', 'Monthly remittance'),
  route('expanded', 'Expanded withholding', 'Covered professional, rent and designated supplier payments; verify withholding-agent obligations.', ['withholding'], 'graduated', ['0619-E', '1601-EQ', '1604-E', '2307'], 'By payment and eligibility', 'Withholding', 'RR 11-2018 and applicable ATC rules'),
  route('final', 'Final withholding remittance', 'One verified payment category and recipient class per calculation; reconcile prior remittances.', ['withholding'], 'passive', ['0619-F', '1601-FQ', '1602Q', '1604-F', '2306'], 'By income and recipient', 'Withholding', 'July 1, 2025 onward; grandfathering can apply'),
  route('fringe', 'Fringe-benefit income tax', 'Covered taxable benefits of employees other than rank and file; employer-borne gross-up.', ['withholding'], 'graduated', ['1603Q', '1604-F'], '35% / qualifying NRANETB 25%', 'Withholding', 'TRAIN · taxable benefits only'),
  route('specialist', 'Special statutory / treaty case', 'Carriers, specialized banking, foreign lessors, complex trusts and other special-law arrangements.', ['individual', 'corporation', 'fiduciary', 'withholding'], 'bir', [], 'Case-specific', 'Specialist', 'Applicable law and approval govern'),
];
export function availableRoutes(taxpayer: TaxpayerKind, classification: string) {
  return INCOME_ROUTES.filter(r => {
    if (!r.taxpayers.includes(taxpayer)) return false;
    if (classification === 'complex-trust' || classification === 'special-entity') return r.id === 'specialist';
    if (taxpayer === 'corporation' && classification === 'gpp') return ['exempt', 'specialist'].includes(r.id);
    if (taxpayer === 'corporation' && isExemptEntity(classification)) return ['exempt', 'corporate', 'specialist'].includes(r.id);
    if (taxpayer === 'corporation' && classification === 'nonresident-foreign') return ['nonresident', 'passive', 'shares', 'specialist'].includes(r.id);
    if (taxpayer === 'individual' && classification === 'nra-not-engaged') return ['compensation', 'nonresident', 'property', 'shares', 'passive', 'specialist'].includes(r.id);
    if (['business8', 'mixed8'].includes(r.id) && classification === 'nra-engaged') return false;
    if (r.id === 'nonresident' && !['nra-not-engaged', 'nonresident-foreign'].includes(classification)) return false;
    if (r.id === 'school' && classification === 'resident-foreign') return false;
    if (['payroll','fringe'].includes(r.id) && ['domestic', 'resident-foreign', 'nonresident-foreign'].includes(classification)) return false;
    if (r.id === 'expanded' && ['non-resident-citizen','nra-engaged','nra-not-engaged','nonresident-foreign'].includes(classification)) return false;
    return true;
  });
}
export const PERIOD_LABELS: Record<FilingPeriod, string> = { annual: 'Annual', q1: 'Q1 · cumulative', q2: 'Q2 · cumulative', q3: 'Q3 · cumulative', q4: 'Q4', monthly: 'Monthly remittance', transaction: 'Per transaction', projection: 'Monthly planning estimate' };
export function allowedPeriods(input: Pick<IncomeTaxInput, 'route' | 'values'>): FilingPeriod[] {
  if (['specialist', 'exempt', 'ordinary'].includes(input.route)) return ['annual'];
  if (input.route === 'compensation') return ['annual', 'projection'];
  if (input.route === 'property') return ['transaction'];
  if (input.route === 'shares') return ['transaction', 'annual'];
  if (['passive', 'nonresident'].includes(input.route)) return ['transaction'];
  if (input.route === 'payroll') return ['monthly'];
  if (input.route === 'fringe') return ['q1', 'q2', 'q3', 'q4'];
  if (['expanded', 'final'].includes(input.route)) {
    if (input.route === 'final' && (input.values.passiveType || 'interest') === 'interest') return ['q1', 'q2', 'q3', 'q4'];
    return ['monthly', 'q1', 'q2', 'q3', 'q4'];
  }
  return ['annual', 'q1', 'q2', 'q3'];
}
export const isExemptEntity = (classification: string) => ['cooperative', 'exempt-entity'].includes(classification);
export const isBusiness = (route: string) => ['business', 'business8', 'mixed', 'mixed8'].includes(route);
export const isIncentive = (route: string) => ['ith', 'scit', 'edr'].includes(route);

export const periodLabel = (period: FilingPeriod, taxpayer: TaxpayerKind) => taxpayer === 'withholding' && period.startsWith('q') ? `${period.toUpperCase()} · this quarter only` : PERIOD_LABELS[period];
