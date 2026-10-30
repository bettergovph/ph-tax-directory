import { TAX_BRACKETS } from './taxRules';
export interface IncomeRateTable {
  id: string;
  category: string;
  title: string;
  description: string;
  effective: string;
  source: string;
  rows: { appliesTo: string; base: string; rule: string; forms: string[] }[];
}
const pesos=(value:number)=>`₱${value.toLocaleString('en-PH')}`;
export const TAX_RATES: IncomeRateTable[] = [
  {id:'graduated',category:'Individual',title:'Graduated individual income tax',description:'Compensation and qualifying ordinary business, professional, mixed and fiduciary income. Quarterly business calculations use the cumulative base; compensation is reconciled annually.',effective:'January 1, 2023 onward',source:'graduated',rows:TAX_BRACKETS.map(bracket=>({appliesTo:bracket.min===0 ? 'Up to ₱250,000' : `Over ${pesos(bracket.min)}${Number.isFinite(bracket.max) ? ` to ${pesos(bracket.max)}` : ''}`,base:'Annual or applicable cumulative taxable income',rule:bracket.rate===0 ? '₱0' : `${bracket.baseAmount ? `${pesos(bracket.baseAmount)} + ` : ''}${bracket.rate*100}% of excess over ${pesos(bracket.min)}`,forms:['1700','1701Q','1701','1701A','1701-MS']}))},
  {id:'eight',category:'Individual',title:'Elected 8% business income tax',description:'Eligibility, non-VAT status and a valid election are required. The ₱3 million qualifying annual gross-income limit is different from registered filing size.',effective:'TRAIN · election and eligibility required',source:'eight',rows:[
    {appliesTo:'Purely self-employed / professional',base:'Cumulative qualifying net sales + qualifying other non-operating income',rule:'8% × positive excess over ₱250,000; reduction applied once cumulatively',forms:['1701Q','1701A','1701-MS']},
    {appliesTo:'Mixed-income business component',base:'Cumulative qualifying business gross base',rule:'8% with no extra ₱250,000 reduction; graduated compensation tax is added annually',forms:['1701Q','1701']},
  ]},
  {id:'corporate',category:'Corporate',title:'Regular corporate and minimum income tax',description:'RCIT and MCIT use different bases. Compare them where applicable; do not add them together. Ordinary domestic 20% eligibility requires both annual tests.',effective:'25% / 20% from July 1, 2020; 2% MCIT restored July 1, 2023',source:'corporate',rows:[
    {appliesTo:'Domestic corporation · general',base:'Net taxable income',rule:'25%',forms:['1702Q','1702-RT']},
    {appliesTo:'Qualifying domestic corporation',base:'Net taxable income ≤ ₱5m AND qualifying assets ≤ ₱100m, excluding specified land',rule:'20%; annual eligibility tests are not divided by four',forms:['1702Q','1702-RT']},
    {appliesTo:'Resident foreign corporation · general',base:'Philippine-source net taxable income',rule:'25%',forms:['1702Q','1702-RT']},
    {appliesTo:'Applicable regular-tax domestic / resident foreign corporation',base:'Legally defined MCIT gross income',rule:'2%, from the fourth taxable year following the first taxable year of operations; compare to RCIT',forms:['1702Q','1702-RT']},
  ]},
  {id:'incentives',category:'Corporate',title:'Approved incentives and preferential treatment',description:'Verify legal qualification, approved activity and covered dates. Separate registered, non-registered and exempt income.',effective:'Regime-specific; EDR 20% from November 28, 2024',source:'corporate',rows:[
    {appliesTo:'Approved ITH activity',base:'Income covered by the approved holiday',rule:'0% on covered income; other activities assessed separately',forms:['1702Q','1702-MX']},
    {appliesTo:'Approved SCIT activity',base:'Regime-specific gross income earned',rule:'5%; not gross sales or RCIT taxable income',forms:['1702Q','1702-MX']},
    {appliesTo:'Registered EDR activity',base:'Taxable income after permitted enhanced deductions',rule:'20%; other activity follows its own applicable treatment',forms:['1702Q','1702-MX']},
    {appliesTo:'Qualifying proprietary school / nonprofit hospital',base:'Relevant taxable income; unrelated-business test applies',rule:'10% qualifying treatment restored July 1, 2023; temporary 1% has expired',forms:['1702Q','1702-MX']},
    {appliesTo:'Qualified exempt entity / GPP',base:'Legally exempt / pass-through income',rule:'No entity income tax on that base; applicable information filing and partner taxation remain',forms:['1702-EX']},
  ]},
  {id:'passive',category:'Final tax',title:'Common passive-income final taxes',description:'These are selected statutory cases, not a universal rate for every recipient. Check income source, recipient class, exemptions, treaties and instrument grandfathering.',effective:'Post-July 1, 2025 rules',source:'passive',rows:[
    {appliesTo:'Covered citizens / resident aliens and domestic or resident foreign corporations',base:'Covered bank-deposit interest / yield',rule:'Generally 20%; non-resident expanded-system exceptions and grandfathering can apply',forms:['1602Q','2306']},
    {appliesTo:'Qualifying individual recipient of a domestic-company dividend',base:'Gross cash / property dividend',rule:'10%; NRAETB generally 20%, NRANETB generally 25%, subject to applicable exceptions',forms:['1601-FQ','2306']},
    {appliesTo:'Domestic / resident foreign corporate dividend recipient',base:'Covered domestic intercorporate dividend',rule:'Exempt under the applicable intercorporate rule',forms:['2306']},
    {appliesTo:'Covered individual passive royalties',base:'Gross passive royalty',rule:'Generally 20%; qualifying book, literary and musical royalties 10%; recipient exceptions apply',forms:['1601-FQ','2306']},
    {appliesTo:'Covered individual prizes / winnings',base:'Gross income payment',rule:'Generally 20%; qualifying prizes ≤ ₱10,000 are ordinary income; PCSO/Lotto ≤ ₱10,000 can be exempt',forms:['1601-FQ','2306']},
  ]},
  {id:'nonresident',category:'Final tax',title:'Non-resident and branch-remittance rules',description:'Specific income categories and treaty eligibility override general defaults. These are payor-withholding routes, not automatically the recipient’s regular quarterly ITR.',effective:'Current category-specific rules',source:'passive',rows:[
    {appliesTo:'NRFC / NRANETB · covered general receipts',base:'Philippine-source gross income in the general category',rule:'Generally 25%; no automatic ordinary expense deduction',forms:['1601-FQ','2306']},
    {appliesTo:'NRFC domestic-company dividend',base:'Gross dividend',rule:'15% only with verified tax-sparing conditions; otherwise applicable statutory/treaty treatment',forms:['1601-FQ','2306']},
    {appliesTo:'Covered resident foreign branch',base:'Profits applied / earmarked for remittance',rule:'Generally 15%, subject to regime and treaty exceptions; separate from RCIT',forms:['1601-FQ','2306']},
  ]},
  {id:'capital',category:'Capital gains',title:'Capital gains on covered transactions',description:'Confirm seller, asset classification, issuer, transaction date and exemptions. Ordinary assets and listed-share transactions require different treatment.',effective:'Current qualifying transactions; CMEPA source/issuer checks apply',source:'passive',rows:[
    {appliesTo:'Eligible Philippine real-property capital asset',base:'Highest applicable selling price, zonal value or assessor fair market value',rule:'6%; do not apply universally to foreign corporate sellers or ordinary assets',forms:['1706']},
    {appliesTo:'Covered unlisted shares classified as capital assets',base:'Net gain after allowable basis and costs',rule:'15%; annual consolidation allows permitted loss netting and credits transaction CGT already paid',forms:['1707','1707-A']},
  ]},
  {id:'withholding',category:'Withholding',title:'Selected expanded and fringe-benefit taxes',description:'The payment and withholding-agent obligation must qualify. Expanded withholding is normally a recipient credit; it is not an additional final tax on all business income.',effective:'Applicable TRAIN withholding rules and category conditions',source:'graduated',rows:[
    {appliesTo:'Covered individual professional fees',base:'Covered gross income-payment base',rule:'5% within ₱3m annual threshold with required declaration/conditions; otherwise applicable 10%',forms:['0619-E','1601-EQ','2307']},
    {appliesTo:'Covered non-individual professional fees',base:'Covered gross income-payment base',rule:'10% within ₱720,000 annual threshold with required declaration/conditions; otherwise applicable 15%',forms:['0619-E','1601-EQ','2307']},
    {appliesTo:'Covered real-property rentals',base:'Applicable rental payment base',rule:'5%; confirm covered lease and withholding obligation',forms:['0619-E','1601-EQ','2307']},
    {appliesTo:'Designated agent’s covered goods / service payments',base:'Applicable covered payment base',rule:'1% goods / 2% services; not every payor or every supplier transaction',forms:['0619-E','1601-EQ','2307']},
    {appliesTo:'Covered fringe benefits of employees other than rank and file',base:'Permitted monetary value, grossed up',rule:'Generally MV ÷ 65% × 35%; covered NRANETB MV ÷ 75% × 25%',forms:['1603Q','1604-F']},
  ]},
];
