import { CLASSIFICATIONS, FIRST_TAX_YEAR, currentTaxYear, availableRoutes, allowedPeriods, INCOME_ROUTES, isBusiness, isExemptEntity, isIncentive } from '../data/incomeTax';
import { TAX_BRACKETS } from '../data/taxRules';
import { incomeFields } from './incomeTaxFields';
import { mcitApplies, periodDates, returnForms } from './incomeTaxPeriods';
import { IncomeTaxInput, TaxReturnResult } from '../types/incomeTax';

// Filing forms require whole-peso lines. Parse decimal text without binary-money arithmetic.
export function exactCents(value: string | number): bigint {
  const raw=String(value).trim();
  if (!/^-?\d+(?:\.\d{1,2})?$/.test(raw)) throw new RangeError('Enter a finite amount with at most two decimal places.');
  const negative=raw.startsWith('-');
  const [integer,decimal='']=raw.replace('-','').split('.');
  const cents=BigInt(integer)*100n+BigInt(decimal.padEnd(2,'0'));
  if (cents>100_000_000_000_000n) throw new RangeError('Amount exceeds the supported ₱1 trillion per-line limit.');
  return negative ? -cents : cents;
}
export function filingPeso(value: string | number): bigint {
  const cents=exactCents(value);
  return cents<0n ? -((-cents+50n)/100n) : (cents+50n)/100n;
}
const positive = (n: bigint) => n > 0n ? n : 0n;
const minimum = (a: bigint,b: bigint) => a < b ? a : b;
const maximum = (a: bigint,b: bigint) => a > b ? a : b;
// basis points: 20% = 2000. Round positive form tax lines half-up to a whole peso.
const rateTax = (base: bigint, basisPoints: bigint) => (positive(base)*basisPoints + 5000n)/10000n;
function graduatedBracket(base: bigint) {
  return TAX_BRACKETS.find(bracket=>!Number.isFinite(bracket.max) || base<=BigInt(bracket.max))!;
}
export function graduatedFilingTax(base: bigint): bigint {
  const bracket=graduatedBracket(base);
  return BigInt(bracket.baseAmount)+rateTax(positive(base-BigInt(bracket.min)),BigInt(Math.round(bracket.rate*10000)));
}
export function calculateIncomeTaxReturn(input: IncomeTaxInput): TaxReturnResult {
  const { route, period, classification, values } = input;
  const metadata = INCOME_ROUTES.find(r=>r.id===route);
  const result: TaxReturnResult = {status:'incomplete',errors:[],notes:[],lines:[],forms:returnForms(input),coveredPeriod:'Choose a valid filing period',sources:[metadata?.source || 'bir']};
  const review = (reason: string) => { result.status='needs-review';result.errors.push(reason);return result; };
  if (!Number.isInteger(input.year) || input.year < FIRST_TAX_YEAR || input.year > currentTaxYear()) result.errors.push(`Choose a tax year from ${FIRST_TAX_YEAR} to ${currentTaxYear()}. Earlier rules and future years are not available.`);
  if (!Number.isInteger(input.fiscalMonth) || input.fiscalMonth < 1 || input.fiscalMonth > 12 || !Number.isInteger(input.month) || input.month < 1 || input.month > 12) result.errors.push('Choose a valid month / fiscal year-end.');
  if (!CLASSIFICATIONS[input.taxpayer]?.some(c=>c.value===classification)) result.errors.push('Choose a valid taxpayer classification.');
  if (!availableRoutes(input.taxpayer,classification).some(r=>r.id===route)) result.errors.push('This income route does not apply to the selected taxpayer classification.');
  if (!allowedPeriods(input).includes(period)) result.errors.push('This filing period is not available for the selected income type. There is no Q4 1701Q or 1702Q.');
  if (input.taxpayer==='withholding' && period==='monthly' && ['expanded','final'].includes(route) && input.month%3===0) result.errors.push('The third month is reconciled on the quarterly return; 0619-E/F covers the first two months only.');
  if (!result.errors.length && period!=='transaction') Object.assign(result,periodDates(input));
  const amounts: Record<string,bigint> = {};
  const exact: Record<string,bigint> = {};
  for (const field of incomeFields(input)) {
    const value = values[field.key];
    if (field.type==='check') continue;
    if (field.type==='select') {
      if (value && !field.options?.some(option=>option.value===value)) result.errors.push(`Choose a valid option for ${field.label}.`);
      continue;
    }
    if (field.type==='date') {
      const date = value ? new Date(`${value}T00:00:00Z`) : undefined;
      if (!date || !Number.isFinite(date.getTime()) || date.toISOString().slice(0,10)!==value || Number(value.slice(0,4))!==input.year) result.errors.push(`Enter a valid ${input.year} ${field.label.toLowerCase()}.`);
      continue;
    }
    if (field.type==='year') {
      const year = Number(value);
      if (!value || !Number.isInteger(year) || year < 1900 || year > input.year) result.errors.push(`${field.label} must be between 1900 and ${input.year}.`);
      continue;
    }
    if (!value?.trim()) {
      if (!field.optional) result.errors.push(`Enter ${field.label.toLowerCase()}.`);
      amounts[field.key]=0n;continue;
    }
    try {
      const amount=filingPeso(value);
      const exactAmount=exactCents(value);
      if (exactAmount<0n && !field.allowNegative) result.errors.push(`${field.label} cannot be negative.`);
      amounts[field.key]=amount;exact[field.key]=exactAmount;
    } catch { result.errors.push(`${field.label}: enter a valid amount up to ₱1 trillion, with at most two decimal places.`); }
  }
  if (result.errors.length) return result;
  Object.assign(result,periodDates(input));
  if (route==='specialist') return review('This statutory, treaty or complex fiduciary case needs a verified case-specific treatment. No generic rate has been applied.');
  if (['passive','final'].includes(route) && values.incomeSource==='foreign') return review('The source of this income requires its applicable ordinary-income, exemption or foreign-income treatment. Philippine final-tax rates have not been applied to foreign-source income.');
  if (values.treaty==='true') return review('Confirm the applicable treaty or special exemption before calculating. A statutory default rate would not establish this case’s liability.');
  if (['passive','final'].includes(route) && (values.passiveType || 'interest')==='interest' && values.grandfathered==='true') return review('Pre-July-2025 instruments need their original issue/maturity and renewal rules checked before a rate is applied.');
  if (['passive','nonresident'].includes(route) && values.transactionDate < '2025-07-01') return review('This payment predates the enabled post-July-2025 final-tax rules. Verify its historical treatment.');
  if (route==='final' && result.coveredPeriod.slice(0,10) < '2025-07-01') return review('This remittance period includes dates before the enabled July-2025 final-tax rules. A historical or split-period calculation is required.');
  if (route==='edr' && result.coveredPeriod.slice(0,10) < '2024-11-28') return review('This fiscal period crosses the EDR rate change. A split-period calculation is required.');
  if (values.installment==='true') return review('Installment transactions require the permitted gain recognition and collection schedule. This ordinary cash-transaction calculator has not assumed that schedule.');
  const amount = (key: string) => amounts[key] ?? 0n;
  const cents = (key: string) => exact[key] ?? 0n;
  const line = (label:string,n:bigint,detail?:string) => result.lines.push({label,amount:Number(n),detail});
  const graduatedLine = (label: string, base: bigint) => {
    const bracket=graduatedBracket(base);
    const tax=graduatedFilingTax(base);
    const pesos=(n:bigint)=>`₱${Number(n).toLocaleString('en-PH')}`;
    const formula=bracket.rate===0 ? 'Within the ₱250,000 tax-free bracket' : `${pesos(BigInt(bracket.baseAmount))} + ${bracket.rate*100}% × (${pesos(positive(base))} − ${pesos(BigInt(bracket.min))})`;
    line(label,tax,formula);
    if (['compensation','ordinary','business','mixed','fiduciary'].includes(route)) { result.marginalRate=bracket.rate; result.assessmentBase=Number(positive(base)); }
    return tax;
  };
  /** Subtract unused prior-year losses (NOLCO), never below zero. Returns the amount used. */
  const lossLine=(base:bigint,available:bigint)=>{
    const used=minimum(available,positive(base));
    line('Unused losses from earlier years (NOLCO) subtracted',used,used<available ? `₱${Number(available-used).toLocaleString('en-PH')} left to use in later years, if still within 3 years` : undefined);
    return used;
  };
  if (period==='annual' && ['compensation','mixed','mixed8'].includes(route) && values.grossPay?.trim()) {
    const gross=amount('grossPay'),bonuses=amount('bonuses'),freeBonus=minimum(bonuses,90000n);
    const exempt=freeBonus+amount('deMinimis')+amount('contributions')+amount('otherExemptPay');
    if (bonuses+amount('deMinimis')+amount('contributions')+amount('otherExemptPay')>gross) {result.errors.push('The amounts you subtract cannot be more than your total pay.');return result;}
    line('Total pay before deductions',gross);
    line('Tax-free 13th-month pay and bonuses',freeBonus,bonuses>freeBonus ? `Only ₱90,000 is tax-free; ₱${Number(bonuses-freeBonus).toLocaleString('en-PH')} is taxed` : 'Up to ₱90,000 a year');
    if (amount('deMinimis')) line('Tax-free small benefits (de minimis)',amount('deMinimis'));
    if (amount('contributions')) line('SSS, PhilHealth, Pag-IBIG and union dues',amount('contributions'));
    if (amount('otherExemptPay')) line('Other tax-free pay',amount('otherExemptPay'));
    amounts.compensation=gross-exempt;
    line('Taxable pay',amounts.compensation);
    result.notes.push('Dependents are not deductible. Since 2018 (TRAIN law), the 0% tax on the first ₱250,000 replaced the old personal and dependent exemptions.');
  }
  let liability=0n;
  let credits=0n;
  const annual = period==='annual';
  const isCorporateRecipient = input.taxpayer==='corporation' || ['domestic','resident-foreign','nonresident-foreign'].includes(classification);
  function corporate(prefix=''): bigint {
    const key = (name:string) => prefix ? prefix+name[0].toUpperCase()+name.slice(1) : name;
    let taxable=amount(key('corporateIncome'));
    if (!prefix && values.corpMethod==='osd') {
      const gross=amount('corpGross'),osd=rateTax(gross,4000n);
      line('Company gross income',gross);line('Optional standard deduction (OSD)',osd,'40% × gross income');
      taxable=gross-osd;
    } else if (!prefix && amount('corpNolco')>0n) taxable-=lossLine(taxable,amount('corpNolco'));
    let rate=2500n;
    if (['domestic','partnership','gocc'].includes(classification) && values[key('corporateTreatment')]==='small') {
      const annualTaxable=annual ? cents(key('corporateIncome')) : cents(key('annualIncome'));
      const qualifies=annualTaxable<=500_000_000n && cents(key('assets'))<=10_000_000_000n;
      if (qualifies) rate=2000n;
      else result.notes.push('The 20% domestic eligibility tests were not both met; standard 25% has been used.');
      if (!annual) result.notes.push('The 20% quarterly eligibility calculation uses the supplied full-year projection. Reconcile the rate against actual annual results.');
    }
    const rcit=rateTax(taxable,rate);
    const eligible=mcitApplies(Number(values[key('commenced')]),input.year);
    const mcit=eligible ? rateTax(amount(key('mcitGross')),200n) : 0n;
    const controls=maximum(rcit,mcit);
    const carry=amount(key('excessMcit'));
    if (carry>0n && values[key('mcitCreditConfirmed')]!=='true') result.errors.push('Confirm that the MCIT carryover has been verified, is unexpired and may be applied.');
    const usable=rcit>mcit ? minimum(carry,rcit) : 0n;
    if (carry>0n && usable===0n) result.notes.push('Prior-year excess MCIT has not been applied because normal tax does not exceed MCIT.');
    const label=prefix ? 'Non-registered activity · ' : '';
    line(`${label}Regular taxable income / (loss)`,taxable);
    line(`${label}RCIT`,rcit,`${Number(rate)/100}% × positive taxable income`);
    line(`${label}MCIT`,mcit,eligible ? '2% × separately supplied MCIT gross income' : `Not yet applicable; first eligible taxable year is ${Number(values[key('commenced')])+4}.`);
    line(`${label}Controlling tax`,controls,'Higher of RCIT and applicable MCIT, not their sum');
    if (usable>0n) line('Verified prior-year excess MCIT used',usable);
    result.sources.push('corporate','mcit');
    return controls-usable;
  }
  if (route==='compensation' || route==='ordinary') {
    const base=amount('compensation')*(period==='projection' ? 12n : 1n);
    liability=classification==='nra-not-engaged' ? rateTax(base,2500n) : graduatedLine('Graduated income tax',base);
    line('Taxable income used',base,period==='projection' ? 'Monthly taxable compensation × 12; constant-income projection' : 'Actual annual taxable income');
    result.rate=classification==='nra-not-engaged' ? '25% NRANETB gross-basis treatment' : '2023-onward graduated schedule';
    if (values.substituted==='true') {
      if (annual && amount('withheld2316')!==liability) result.errors.push('Substituted filing requires correctly withheld compensation tax. The entered 2316 withholding does not match the calculated annual tax.');
      if (values.employers==='multiple' || classification.startsWith('nra-')) result.errors.push('Substituted filing has not been established for this classification or multiple-employer case.');
      result.notes.push('Substituted filing is based on your confirmation of all BIR qualifications. 2316 is an employer-issued certificate, not a personal return.');
      if (annual) {result.statutoryDeadline=undefined;result.deadlineRule='No personal 1700 deadline asserted for confirmed qualified substituted filing; employer certificate obligations remain.';}
    }
    if (route==='compensation' && values.substituted!=='true') result.notes.push('1700 is the reference return if self-filing is required. A calculation alone does not establish a filing obligation.');
    if (period==='projection') result.notes.push('This is an annual planning estimate. Annual tax ÷ 12 is a monthly equivalent, not exact payroll withholding.');
  } else if (isBusiness(route) || route==='fiduciary') {
    const flat=['business8','mixed8'].includes(route);
    let base=amount('businessTaxable');
    if (route==='fiduciary' && values.fiduciaryBase!=='true') return review('Confirm the fiduciary taxable base after the applicable deductions, exemptions and distributions. No generic trust election has been assumed.');
    if (flat || values.deductionMethod==='itemized' || values.deductionMethod==='osd') {
      base=amount('sales')+amount('otherIncome');
      line('Cumulative net sales / fees',amount('sales'));
      if (!flat) {
        const deduction=values.deductionMethod==='osd' ? rateTax(amount('sales'),4000n) : amount('costs')+amount('expenses');
        base-=deduction;line(values.deductionMethod==='osd' ? 'Individual OSD · 40% of net sales' : 'Allowed costs and itemized deductions',deduction);
      }
      line('Other ordinary business income',amount('otherIncome'));
    }
    if (!flat && route!=='fiduciary' && amount('nolco')>0n) base-=lossLine(base,amount('nolco'));
    if (flat) {
      if (values.eightElection!=='true' || values.vatRegistered==='yes') return review('8% requires a valid election and all eligibility conditions, including non-VAT status. Use the graduated route if not eligible.');
      if (cents('sales')+cents('otherIncome')>300_000_000n) return review('Cumulative qualifying gross income exceeds ₱3 million. Recompute under the applicable graduated rules and credit prior payments; 8% has not been capped or applied.');
      const reduction=route==='business8' ? 250000n : 0n;
      line('Single cumulative 8% reduction',minimum(positive(base),reduction),route==='mixed8' ? 'No second ₱250,000 reduction for mixed-income business' : 'Applied once to the year-to-date base');
      const business=rateTax(positive(base-reduction),800n);
      line('8% business income tax',business);liability=business;result.rate='8% on eligible business base';
      if (annual && route==='mixed8') {const compensationTax=graduatedLine('Graduated tax on compensation',amount('compensation'));liability+=compensationTax;}
    } else {
      line('Cumulative taxable business / fiduciary income',base);
      const combined=base+(annual && route==='mixed' ? amount('compensation') : 0n);
      if (annual && route==='mixed') line('Annual taxable compensation',amount('compensation'));
      liability=graduatedLine('Graduated income tax',combined);result.rate='2023-onward graduated schedule';
      line('Graduated tax base',positive(combined));
    }
    if (!annual) result.notes.push('Cumulative income from the start of the year; compensation and 2316 withholding are excluded from 1701Q. No annualization or division by four.');
    if (annual && values.formChoice==='ms' && result.forms[0]!=='1701-MS') result.notes.push('1701-MS eligibility was not established for the registered size, activities or tax regimes. The appropriate standard annual form is shown.');
  } else if (route==='corporate') {
    if (isExemptEntity(classification) && values.taxableScopeConfirmed!=='true') return review('Separate exempt income from taxable income before calculating. Only income outside the exemption is taxed at the regular corporate rate.');
    liability=corporate();
    if (isExemptEntity(classification)) result.notes.push('Only income outside the exemption is included. Exempt income is reported separately on 1702-MX at 0%.');
  }
  else if (isIncentive(route)) {
    if (values.approvedRegime!=='true') return review('Confirm the approved regime, activity and covered dates. Registration alone does not establish ITH, SCIT or EDR eligibility.');
    const rate=route==='ith' ? 0n : route==='scit' ? 500n : 2000n;
    liability=rateTax(amount('registeredBase'),rate);
    line('Registered-activity tax base',amount('registeredBase'),route==='scit' ? 'SCIT gross income earned, already determined under the approved definition' : 'Covered taxable income after permitted deductions');
    line('Registered-activity income tax',liability,`${Number(rate)/100}%`);
    if (values.otherActivity==='true') liability+=corporate('other');
    result.notes.push('This estimate relies on verified approved dates and activity allocations. Other agency shares, if relevant, must follow the approved allocation; they are not added as another income tax here.');
  } else if (route==='school') {
    if (values.qualifiedInstitution!=='true') return review('Confirm that the institution qualifies under the applicable school/nonprofit-hospital rules.');
    if (cents('unrelatedGross')>cents('totalGross')) result.errors.push('Unrelated-business gross income cannot exceed total gross income.');
    const unrelated=cents('unrelatedGross')*2n>cents('totalGross');
    if (unrelated && mcitApplies(Number(values.commenced),input.year) && !values.institutionMcitGross?.trim()) result.errors.push('Enter the separately determined MCIT gross-income base for this regular-tax fallback.');
    const normal=rateTax(amount('institutionIncome'),unrelated ? 2500n : 1000n);
    const mcit=unrelated && mcitApplies(Number(values.commenced),input.year) ? rateTax(amount('institutionMcitGross'),200n) : 0n;
    liability=maximum(normal,mcit);
    line('Institutional tax before MCIT',normal,unrelated ? 'Unrelated income exceeds 50%; regular 25% applies to the whole taxable base' : '10% qualifying preferential treatment');
    if (unrelated) {line('Applicable MCIT',mcit);result.notes.push('For this regular-tax fallback, the separately supplied MCIT base is used, not the gross-income denominator of the unrelated-business test.');}
    result.sources.push('mcit');
  } else if (route==='exempt') {
    if (values.exemptConfirmed!=='true') return review(classification==='gpp' ? 'Confirm general professional partnership status before using 1702-EX.' : 'Confirm the legal exemption, and that there is no other taxable income, before using 1702-EX.');
    if (classification==='gpp') {
      const gross=amount('gppGross');
      const osd=values.gppDeductionMethod==='osd';
      const deductions=osd ? rateTax(gross,4000n) : amount('gppDeductions');
      line('Gross income',gross);
      line(osd ? 'Optional standard deduction (OSD)' : 'Itemized deductions',deductions,osd ? '40% × gross income' : undefined);
      line('Net income / (loss) for distribution to partners',gross-deductions);
      line('GPP income tax',0n,'0% · the partnership itself pays no income tax (Sec. 26)');
      result.notes.push('Each partner reports their share of the net income on their own income tax return at graduated rates. The 8% option does not apply to a GPP share. The GPP withholds creditable tax on each share and issues Form 2307.');
    } else {
      line('Exempt entity income tax',0n);
      result.notes.push('Zero tax does not remove the annual filing requirement.');
    }
  } else if (route==='property') {
    if (values.capitalAsset!=='true') return review('Confirm Philippine location and qualifying capital-asset treatment. Ordinary assets do not use this 6% CGT route.');
    if (['resident-foreign','nonresident-foreign'].includes(classification)) return review('Foreign-corporate property transfers need their applicable corporate income-tax treatment; 6% has not been applied automatically.');
    if (values.propertyExemption==='exempt') return review('The claimed exemption needs its specific conditions and filing requirements checked. No automatic zero-tax exemption has been assumed.');
    const base=maximum(amount('sellingPrice'),maximum(amount('zonalValue'),amount('assessorValue')));
    liability=rateTax(base,600n);line('Highest applicable price / fair market value',base);result.rate='6% capital gains tax';
  } else if (route==='shares') {
    if (values.sharesCapital!=='true') return review('Confirm capital-asset and unlisted-share treatment. Listed securities and dealer ordinary assets use different routes.');
    if (values.issuer==='foreign') return review('Current law covers additional foreign-share cases, but the exact filing mechanics on legacy domestic-share forms require current BIR confirmation. No form-completion calculation has been assumed.');
    const net=annual ? amount('capitalGains')-amount('capitalLosses') : amount('proceeds')-amount('basis');
    liability=rateTax(net,1500n);line('Net capital gain / (loss)',net);result.rate='15% of positive covered net gain';
    if (annual) {credits=amount('cgtPaid');result.notes.push('Transaction CGT already paid is credited in the annual consolidation; it is not charged again.');}
  } else if (route==='passive' || route==='final') {
    const type=values.passiveType || 'interest';
    let rate=2000n;
    const nonresident=['non-resident-citizen','nra-engaged','nra-not-engaged','nonresident-foreign'].includes(classification);
    const restricted=['nra-not-engaged','nonresident-foreign'].includes(classification);
    if (restricted) rate=2500n;
    if (type==='interest' && values.depositSystem==='expanded' && nonresident) rate=0n;
    if (type==='dividend') {
      rate=isCorporateRecipient ? classification==='nonresident-foreign' ? values.taxSparing==='true' ? 1500n : 2500n : 0n : classification==='nra-engaged' ? 2000n : classification==='nra-not-engaged' ? 2500n : 1000n;
    }
    if (type==='literary' && !isCorporateRecipient && !restricted) rate=1000n;
    if (type==='prize' && cents('paymentBase')<=1_000_000n && !restricted) return review('A qualifying prize of ₱10,000 or less is ordinary income, not this final-tax route. Include it with other ordinary annual income instead.');
    if (type==='lotto' && route==='final' && values.lottoPaymentsTaxable!=='true') return review('Classify each Lotto payment against its individual threshold before aggregating this quarter’s taxable payments.');
    if (type==='lotto' && route==='passive' && cents('paymentBase')<=1_000_000n && !restricted) rate=0n;
    if (type==='branch') {
      if (classification!=='resident-foreign') return review('Branch profit remittance requires a resident foreign corporate branch and a covered non-exempt remittance.');
      rate=1500n;result.notes.push('Use profits applied/earmarked for remittance. This is separate from the branch’s corporate income-tax calculation.');
    }
    if (isCorporateRecipient && ['prize','winnings','lotto'].includes(type)) return review('Corporate prizes/winnings need classification as ordinary or another applicable category; the individual final-tax rule has not been reused.');
    liability=rateTax(amount('paymentBase'),rate);line('Covered gross income payment(s)',amount('paymentBase'));result.rate=`${Number(rate)/100}% statutory treatment`;
    if (values.taxSparing==='true') result.notes.push('The 15% NRFC dividend treatment relies on your confirmation of the tax-sparing conditions.');
    if (route==='passive') {result.notes.push('These remittance forms belong to the payor/bank. The recipient receives 2306; do not claim this final tax as an ordinary income-tax credit.');result.statutoryDeadline=undefined;}
  } else if (route==='nonresident') {
    if (values.generalNonresident!=='true') return review('Verify this payment belongs to the general 25% category, rather than a special rate, capital gain, exemption or treaty.');
    liability=rateTax(amount('paymentBase'),2500n);line('Covered Philippine-source gross income',amount('paymentBase'));result.rate='25% general gross-basis treatment';
    result.notes.push('1601-FQ is a payor remittance reference, not an automatic recipient quarterly corporate return.');result.statutoryDeadline=undefined;
  } else if (route==='payroll') {
    liability=amount('taxWithheld')+amount('adjustment');line('Actual payroll income tax withheld',amount('taxWithheld'));line('Prior-month adjustment',amount('adjustment'));
    if (liability<0n) result.errors.push('Adjustments produce negative withholding; review the over-remittance/adjustment process separately.');
  } else if (route==='expanded') {
    if (values.withholdingObligation!=='true') return review('Confirm the withholding obligation and covered payment category before applying these rates.');
    const corporatePayee=isCorporateRecipient;
    const type=values.expandedType || 'professional';
    let rate=type==='rent' ? 500n : type==='goods' ? 100n : type==='services' ? 200n : corporatePayee ? 1500n : 1000n;
    if (['non-resident-citizen','nra-engaged','nra-not-engaged','nonresident-foreign'].includes(classification)) return review('This non-resident payee normally needs final/specific withholding treatment, not the resident expanded-withholding rates.');
    if (type==='professional' && cents('payeeAnnualGross')<cents('paymentBase')) result.errors.push('The declared annual payee gross base cannot be less than the covered period payment base.');
    if (type==='professional' && values.lowerDeclaration==='true' && cents('payeeAnnualGross')<=(corporatePayee ? 72_000_000n : 300_000_000n)) rate=corporatePayee ? 1000n : 500n;
    liability=rateTax(amount('paymentBase'),rate);line('Covered payment base',amount('paymentBase'));result.rate=`${Number(rate)/100}% covered expanded-withholding rate`;
    result.notes.push('This calculation covers the selected payment category only. Confirm its applicable ATC and any exemption; designated supplier rates do not apply to every payor.');
  } else if (route==='fringe') {
    if (values.taxableFringe!=='true') return review('Confirm covered taxable fringe benefits and permitted monetary valuation before grossing up.');
    const taxRate=classification==='nra-not-engaged' ? 25n : 35n;
    const divisor=100n-taxRate;
    // Tax is MV × rate / (100-rate); retain rational precision until tax is rounded.
    liability=(amount('benefitValue')*taxRate+divisor/2n)/divisor;
    line('Taxable monetary benefit value',amount('benefitValue'));
    result.rate=`${taxRate}% on grossed-up value · divisor ${divisor}%`;
    result.notes.push('Employer-borne fringe-benefit tax; excluded from the employee compensation calculator.');
  }
  if (result.errors.length) return result;
  if (input.taxpayer==='withholding') credits=amount('priorRemittances');
  else if (!['shares','property','passive','nonresident','exempt'].includes(route) && period!=='projection') {
    credits=amount('withheld2316')+amount('withheld2307')+amount('priorPayments')+amount('priorYearCredit')+(values.amended==='true' ? amount('amendedPaid') : 0n);
  }
  line('Income tax due',liability);
  line('Tax already paid or taken out (credits)',credits);
  line(liability-credits<0n ? 'Overpaid (excess credits)' : 'Balance payable',liability-credits);
  result.status='calculated';result.liability=Number(liability);result.credits=Number(credits);result.balance=Number(liability-credits);
  if (result.assessmentBase!==undefined) result.effectiveRate=result.assessmentBase>0 ? Number(liability)/result.assessmentBase : 0;
  if (liability-credits<0n) result.notes.push('Excess credits/overpayment is shown; this does not establish eligibility for an automatic cash refund.');
  result.notes.push('Filing line inputs and computed tax lines are rounded to whole pesos. Statutory deadlines are shown without holiday or extension adjustments.');
  result.sources=[...new Set(result.sources)];
  return result;
}
