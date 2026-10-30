import { IncomeTaxInput, TaxField } from '../types/incomeTax';
import { isBusiness, isExemptEntity, isIncentive } from '../data/incomeTax';
const amount = (key: string, label: string, help?: string, optional = false, allowNegative = false): TaxField => ({key,label,help,optional,allowNegative});
const select = (key: string, label: string, pairs: string[][], help?: string): TaxField => ({key,label,type:'select',options:pairs.map(([value,label])=>({value,label})),help});
const check = (key: string, label: string, help?: string): TaxField => ({key,label,type:'check',help});
const date = (key: string, label: string): TaxField => ({key,label,type:'date'});
const yesNo = [['no','No'],['yes','Yes']];
const PAY_HELP = 'Help me work out my taxable pay';
const LOSS_HELP = 'Losses from earlier years (NOLCO)';
const CORP_OSD = 'Use the 40% standard deduction (OSD)';
/** Short explanation shown at the top of each collapsed section. */
export const SECTION_NOTES: Record<string,string> = {
  [PAY_HELP]: 'Start from your total pay. We subtract the parts the law does not tax. Dependents such as children are not deductible: since 2018, everyone’s first ₱250,000 a year is taxed at 0% instead.',
  [LOSS_HELP]: 'If your business lost money in any of the last 3 years, you can subtract the unused loss now. It can only bring taxable income down to zero. Not available with the 40% standard deduction or the 8% option.',
  [CORP_OSD]: 'Instead of listing actual expenses, a company may subtract 40% of its gross income. Choose this in the first quarter and use it for the whole year.',
};
const opt = (field: TaxField, section: string): TaxField => ({...field, optional: true, section});
/** Gross-to-taxable pay helper for employees. When gross pay is entered, it replaces the taxable pay field. */
function payFields(values: Record<string,string>, label: string, help: string): TaxField[] {
  const usesHelper = !!values.grossPay?.trim();
  return [
    ...(usesHelper ? [] : [amount('compensation',label,`${help} Or open “${PAY_HELP}” below.`)]),
    opt(amount('grossPay','Total pay from your employer this year, before anything is taken out','Include basic pay, overtime, allowances, 13th-month pay and bonuses. Your Form 2316 shows this. When you fill this in, we work out your taxable pay; clear it to type taxable pay directly.'),PAY_HELP),
    opt(amount('bonuses','13th-month pay and other bonuses included above','Up to ₱90,000 a year is tax-free. Anything above that is taxed.'),PAY_HELP),
    opt(amount('deMinimis','Small tax-free benefits included above (de minimis)','Such as rice, uniform, medical or laundry allowances, within BIR’s limits for each one.'),PAY_HELP),
    opt(amount('contributions','Your SSS, PhilHealth, Pag-IBIG and union dues','Only your own share, as taken out of your pay. Your employer’s share is not part of your pay.'),PAY_HELP),
    opt(amount('otherExemptPay','Other tax-free pay included above','For example, a minimum wage earner’s minimum wage, and their holiday, overtime, night-shift and hazard pay.'),PAY_HELP),
  ];
}
const lossField = (key: string): TaxField => opt(amount(key,'Unused business losses from the last 3 years','Only losses not yet used. If the taxable profit you entered already has them subtracted, leave this blank.'),LOSS_HELP);
export function incomeFields(input: IncomeTaxInput): TaxField[] {
  const {route,period,values,taxpayer,classification} = input;
  const annual = period === 'annual';
  const fields: TaxField[] = [];
  if (route === 'specialist') return [];
  if (period === 'transaction') fields.push(date('transactionDate','Date of sale or income payment'));
  if (['passive','final'].includes(route)) {
    fields.push(select('passiveType','What kind of payment is it?',[
      ['interest','Bank interest or similar investment earnings'],['dividend','Dividend from a Philippine company'],['royalty','Royalty from use of your property or rights'],['literary','Royalty from books, writing or music'],['prize','Prize above ₱10,000'],['winnings','Other winnings'],['lotto','PCSO / Lotto winnings'],...(taxpayer !== 'individual' ? [['branch','Branch profits sent to its overseas head office']] : []),
    ]));
    fields.push(select('incomeSource','Where was the income earned?',[['philippines','Income earned from Philippine sources'],['foreign','Income earned from foreign sources']]));
    if (route==='final' && values.passiveType==='lotto') fields.push(check('lottoPaymentsTaxable','I checked that each Lotto payment included here is above its tax-free limit'));
    fields.push(amount('paymentBase',route === 'final' ? 'Total payments subject to this tax for the selected period' : 'Payment before income tax is taken out','Include only one kind of income and one type of person or company receiving it in each calculation.'));
    if ((values.passiveType || 'interest') === 'interest') fields.push(select('depositSystem','Type of bank deposit',[['ordinary','Peso or other ordinary bank deposit'],['expanded','Foreign-currency deposit under the special bank system (EFCDS)']]),check('grandfathered','This deposit or investment may still follow rules from before July 2025'));
    if (values.passiveType === 'dividend' && classification === 'nonresident-foreign') fields.push(check('taxSparing','I verified that this foreign company qualifies for the reduced 15% dividend tax'));
    fields.push(check('treaty','A tax agreement between countries or a special tax exception may apply'));
  } else if (route === 'compensation' || route === 'ordinary') {
    const label = period === 'projection' ? 'Monthly pay subject to income tax' : 'Yearly income subject to income tax';
    const help = 'Taxable income means the amount BIR taxes after tax-free amounts and allowed deductions are removed. For salary, use the taxable pay on your employer’s record, not your take-home pay.';
    if (route === 'compensation' && annual) fields.push(...payFields(values,label,help));
    else fields.push(amount('compensation',label,help));
    if (route === 'compensation' && annual) fields.push(select('employers','How many employers did you have this year?',[['one','One'],['multiple','More than one']]),check('substituted','My employer can file for me, and I meet all BIR conditions (substituted filing)','This means your employer handles the annual filing. You must meet every BIR condition, including having only one employer and the correct tax taken out of your pay.'));
  } else if (isBusiness(route)) {
    const flat = ['business8','mixed8'].includes(route);
    if (!flat) fields.push(select('deductionMethod','How would you like to work out taxable business income?',[['taxable','I already know my taxable business income'],['itemized','Subtract actual business costs and expenses BIR allows'],...(!classification.startsWith('nra-') ? [['osd','Use the standard 40% deduction (OSD)']] : [])],'A deduction reduces income before tax is calculated. Itemized deductions use actual allowed costs; the optional standard deduction (OSD) uses 40% of net sales instead. Do not subtract actual costs again when using OSD.'));
    if (!flat && (values.deductionMethod || 'taxable') === 'taxable') fields.push(amount('businessTaxable','Taxable business profit or loss so far this year','Add amounts from January 1 through the end of the selected period. Taxable profit is income left after deductions BIR allows; enter a loss as a negative amount.',false,true));
    else {
      fields.push(amount('sales','Sales or professional fees so far this year','Use sales or fees after refunds, sales allowances and discounts, before subtracting business costs. Include totals from the start of the year through the selected period.'));
      if (!flat && values.deductionMethod === 'itemized') fields.push(amount('costs','Direct costs of goods sold or services provided','Costs directly linked to what you sold or the services you delivered, as allowed by BIR. Include the total so far this year.'),amount('expenses','Other business expenses BIR allows you to subtract','These are itemized deductions: actual expenses allowed by BIR. Do not include direct costs you entered above a second time.'));
      fields.push(amount('otherIncome','Other business income subject to regular income tax','Include the total so far this year. Leave out income taxed separately through final tax, such as covered bank interest.',true));
    }
    if (flat) fields.push(select('vatRegistered','Is your business registered for value-added tax (VAT)?',yesNo),check('eightElection','I chose the 8% option with BIR on time and meet all its conditions','You must qualify for the 8% option, including the ₱3 million yearly income limit and not being VAT-registered. Income from a general professional partnership and other excluded income do not qualify.'));
    if (!flat && annual && values.deductionMethod !== 'osd') fields.push(lossField('nolco'));
    if (['mixed','mixed8'].includes(route) && annual) fields.push(...payFields(values,'Yearly pay from employment subject to income tax','Add taxable pay from all relevant employers, after removing tax-free amounts. Your BIR Form 2316 shows your employer’s figures.'));
    if (annual) fields.push(select('formChoice','Which yearly tax form would you like to use?',[['standard','Use the standard form that fits my income and deductions'],['ms','Use the simpler 1701-MS form, if I qualify']]),select('registeredSize','Business size registered with BIR',[['unknown','Not specified'],['micro','Micro'],['small','Small'],['other','Medium / large']]),select('multipleActivities','Do you have two or more business activities?',yesNo));
  } else if (route === 'fiduciary') {
    fields.push(amount('businessTaxable','Taxable estate or trust profit or loss so far this year','Use the amount already worked out under estate or trust rules, after allowed deductions, tax-free amounts and payments to beneficiaries. Enter a loss as a negative amount.',false,true),check('fiduciaryBase','I have checked the taxable income under the estate or trust rules'));
  } else if (route === 'corporate') {
    fields.push(...corporateFields(input));
    if (isExemptEntity(classification)) fields.push(check('taxableScopeConfirmed','I included only income that the exemption does not cover',classification === 'cooperative' ? 'Under RA 9520, a cooperative that deals only with members, or has accumulated reserves and undivided net savings of ₱10 million or less, is generally exempt. A larger cooperative is taxed on income from dealings with non-members. Report exempt income separately on 1702-MX.' : 'Income from the organization’s property, and from activities conducted for profit, is taxable whatever it is used for. Report exempt income separately on 1702-MX.'));
  }
  else if (isIncentive(route)) {
    fields.push(amount('registeredBase',route === 'scit' ? 'Income used for the approved 5% company tax (SCIT)' : 'Taxable income from the activity covered by the approval','Use the income amount required by your approved tax scheme, not total sales. Include only the approved activity and dates. Enter a loss as a negative amount where allowed.',false,route !== 'scit'),check('approvedRegime','The company has approval for this tax scheme, activity and period'),check('otherActivity','The company also earns income outside the approved activity'));
    if (values.otherActivity === 'true') fields.push(...corporateFields(input,'other'));
  } else if (route === 'school') fields.push(amount('institutionIncome','School or hospital taxable profit or loss so far this year',undefined,false,true),amount('totalGross','Total gross income so far this year'),amount('unrelatedGross','Gross income from unrelated businesses so far this year'),amount('institutionMcitGross','Income used for minimum company tax (MCIT)','Needed only if normal company tax and minimum company tax apply. Calculate this income separately under MCIT rules; do not copy the total used for the unrelated-business test.',true),{key:'commenced',label:'Year the first business tax year ended',type:'year'},check('qualifiedInstitution','I verified that this privately owned school or nonprofit hospital qualifies for the special rate'));
  else if (route === 'exempt') {
    if (classification === 'gpp') {
      fields.push(amount('gppGross','Partnership gross income for the year','Fees and other receipts, less returns, discounts and direct costs of services.'),select('gppDeductionMethod','How should deductions be worked out?',[['itemized','Subtract actual expenses BIR allows (itemized)'],['osd','Use the standard 40% deduction (OSD)']],'The partnership computes net income like a corporation, but pays no income tax on it. Partners pay tax on their shares.'));
      if (values.gppDeductionMethod !== 'osd') fields.push(amount('gppDeductions','Allowable itemized deductions'));
      fields.push(check('exemptConfirmed','I verified this is a general professional partnership whose partners only practice their common profession'));
    } else fields.push(check('exemptConfirmed','I verified the legal exemption, and the entity has no other taxable income this year','If some income is taxable, choose “Regular corporate income” instead. That return is 1702-MX.'));
  }
  else if (route === 'property') fields.push(amount('sellingPrice','Full selling price before deductions'),amount('zonalValue','Property value set by BIR (zonal value)','Use the total BIR zonal value for this property, not the value per square metre.'),amount('assessorValue','Property value set by the local assessor','Use the local assessor’s total fair market value for the property, rather than the assessed value used to compute property tax.'),check('capitalAsset','I verified that this Philippine property qualifies as a capital asset','A capital asset is generally property held for personal use or investment. Property held for sale or used in business may follow different rules; verify its BIR classification.'),select('propertyExemption','Does a tax exemption apply to this sale?',[['taxable','Taxable sale paid in full'],['exempt','I am claiming a tax exemption']]),check('installment','Payment is by installments, or the sale has conditions'));
  else if (route === 'shares') {
    fields.push(select('issuer','Company whose shares are being sold',[['domestic','Company formed under Philippine law'],['foreign','Company formed under foreign law']]),check('sharesCapital','I verified that these shares qualify as capital assets and are not traded on any stock exchange'));
    if (annual) fields.push(amount('capitalGains','Total share-sale profits included for the year'),amount('capitalLosses','Share-sale losses BIR allows you to subtract for the year',undefined,true),amount('cgtPaid','Capital gains tax already paid on these sales',undefined,true));
    else fields.push(amount('proceeds','Amount received from selling the shares'),amount('basis','Share purchase cost and sale costs BIR allows','This is the allowable tax cost basis plus permitted transaction costs. Use the BIR basis rules if the shares were inherited, gifted or otherwise acquired.'),check('installment','The buyer is paying in installments'));
    fields.push(check('treaty','A tax agreement between countries or a special legal exemption may apply'));
  } else if (route === 'nonresident') fields.push(amount('paymentBase','Philippine-source income before deductions'),check('generalNonresident','I verified that this payment follows the general 25% rule with no special exception'),check('treaty','A tax agreement between countries or a special exemption may apply'));
  else if (route === 'payroll') fields.push(amount('taxWithheld','Total income tax taken out of employees’ pay','Add the income tax already worked out for each employee. Do not apply one tax bracket to the combined payroll.'),amount('adjustment','Correction for income tax from earlier months','Enter a positive amount to add tax or a negative amount to reduce it.',true,true));
  else if (route === 'expanded') {
    fields.push(select('expandedType','What are you paying for?',[['professional','Professional fee'],['rent','Rent for land or a building covered by withholding rules'],['goods','Goods, if BIR requires you to withhold on supplier payments'],['services','Services, if BIR requires you to withhold on supplier payments']]),amount('paymentBase','Payment amount subject to withholding tax','Withholding means tax you take out before paying someone and send to BIR. Exclude VAT from this amount where BIR requires it.'));
    if ((values.expandedType || 'professional') === 'professional') fields.push(amount('payeeAnnualGross','Payment recipient’s yearly income before deductions','The recipient is the person or company you pay. Use their declared yearly income to check which withholding rate applies.'),check('lowerDeclaration','The recipient supplied the required declaration and qualifies for the lower professional-fee rate'));
    fields.push(check('withholdingObligation','BIR requires me to take out tax on this kind of payment'));
  } else if (route === 'fringe') fields.push(amount('benefitValue','Peso value of employee benefits subject to this tax','Fringe benefits are job benefits beyond salary. Enter their value under BIR rules before adding the employer-paid tax (gross-up).'),check('taxableFringe','These benefits are taxable under the rules for managers or supervisors, rather than rank-and-file staff'));
  if (taxpayer === 'withholding') {
    fields.push(amount('priorRemittances','Tax already sent to BIR for this same period','For a quarterly calculation, include payments already sent for its earlier months. Count each payment only once.',true));
    if (period === 'monthly') {
      fields.push(select('channel','How do you file with BIR?',[['non-efps','Other filing methods (not eFPS)'],['efps','BIR Electronic Filing and Payment System (eFPS)']],'eFPS is BIR’s online filing and payment system. Due dates can depend on your assigned filing group.'));
      if (values.channel === 'efps') fields.push(select('efpsGroup','Your BIR eFPS filing group',[['A','A'],['B','B'],['C','C'],['D','D'],['E','E']]));
    }
  } else if (['compensation','ordinary','business','business8','mixed','mixed8','fiduciary','corporate','ith','scit','edr','school'].includes(route) && period !== 'projection') {
    if (['compensation','ordinary','mixed','mixed8'].includes(route) && annual) fields.push(amount('withheld2316','Income tax taken out of your pay (Form 2316)','Use the eligible income tax withheld shown on the certificate your employer gives you. Add the amounts from relevant employers.',true));
    if (!['compensation','ordinary'].includes(route)) fields.push(amount('withheld2307','Income tax taken out of business payments (Form 2307)','Add eligible income-tax amounts from your Form 2307 certificates so far this year. These count as tax already paid. Leave out final tax, VAT and percentage tax.',true),amount('priorPayments','Income tax you paid for earlier quarters this year','Enter amounts actually paid to BIR. Do not repeat tax taken out of payments or simply enter the tax calculated on an earlier return.',true));
    fields.push(amount('priorYearCredit','Unused regular income tax paid in a previous year','Enter only an amount verified as available to carry forward and use now. Minimum company tax (MCIT) and foreign-tax credits are handled separately.',true));
    fields.push(check('amended','I am correcting a tax return I already filed'));
    if (values.amended === 'true') fields.push(amount('amendedPaid','Tax already paid on the return you are correcting'));
  }
  return fields;
}
function corporateFields(input: IncomeTaxInput, prefix=''): TaxField[] {
  const p = (key: string) => prefix ? prefix+key[0].toUpperCase()+key.slice(1) : key;
  const values = input.values;
  const domestic = ['domestic','partnership','gocc'].includes(input.classification);
  const osd = !prefix && values.corpMethod === 'osd';
  const fields: TaxField[] = [
    ...(osd ? [] : [amount(p('corporateIncome'),prefix ? 'Taxable profit or loss outside the approved activity' : 'Company taxable profit or loss so far this tax year','Use income after company deductions BIR allows. Enter a loss as a negative amount. To use the 40% standard deduction instead, open the section below.',false,true)]),
    ...(prefix ? [] : [{...select('corpMethod','How should company deductions be worked out?',[['taxable','I already know the taxable profit'],['osd','Subtract 40% of gross income (OSD)']]),section:CORP_OSD}]),
    ...(osd ? [{...amount('corpGross','Company gross income so far this tax year','Sales or revenue, less returns, discounts and the direct cost of what was sold. Add other income taxed at the normal rate.'),section:CORP_OSD}] : []),
    {key:p('commenced'),label:'Year the first business tax year ended',type:'year'},
  ];
  if (!prefix && !osd && input.period === 'annual') fields.push(lossField('corpNolco'));
  const firstYear=Number(values[p('commenced')]);
  if (firstYear>=1900 && input.year>=firstYear+4) fields.push(amount(p('mcitGross'),'Gross income used for minimum company tax (MCIT)','Use the total so far this tax year, calculated under MCIT rules. Gross income generally means sales less returns, discounts and direct costs, before other business expenses; check the rules for your industry.'));
  if (domestic) {
    fields.push(select(p('corporateTreatment'),'Which company tax rate should we check?',[['standard','Standard 25% company tax'],['small','Check if this Philippine company qualifies for 20%']]));
    if (values[p('corporateTreatment')] === 'small') {
      fields.push(amount(p('assets'),'Total company assets used for the 20% rate test','Assets are things the company owns. For this test, exclude the land where its office, plant and equipment stand, as required by BIR.'));
      if (input.period !== 'annual') fields.push(amount(p('annualIncome'),'Expected taxable company profit for the full year','Use a full-year estimate to check the lower rate. Check it again against actual results when filing the yearly return.',false,true));
    }
  }
  fields.push(amount(p('excessMcit'),'Unused minimum company tax from earlier years (MCIT)','Enter only a verified amount that has not expired and may reduce normal company tax under BIR rules.',true));
  if (Number(values[p('excessMcit')])>0) fields.push(check(p('mcitCreditConfirmed'),'I verified that this unused minimum company tax is still valid and can be used'));
  return fields;
}
