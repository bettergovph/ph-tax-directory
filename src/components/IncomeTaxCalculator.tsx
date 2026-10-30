import { ReactNode, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight, Calculator, CheckCircle2, ChevronRight, FileText, Info, RotateCcw } from 'lucide-react';
import { CLASSIFICATIONS, INCOME_ROUTES, periodLabel, TAXPAYER_KINDS, allowedPeriods, availableRoutes, currentTaxYear, taxYears } from '@/data/incomeTax';
import { PLAIN_CLASSIFICATION, PLAIN_PERIOD, PLAIN_ROUTE, PLAIN_TAXPAYER } from '@/data/taxGlossary';
import { IncomeTaxInput, IncomeRoute, TaxField, TaxpayerKind, FilingPeriod } from '@/types/incomeTax';
import { SECTION_NOTES, incomeFields } from '@/utils/incomeTaxFields';
import { calculateIncomeTaxReturn } from '@/utils/incomeTaxCalculator';
import { deadlineInfo } from '@/utils/incomeTaxPeriods';
import { FormReferences, SourceLinks } from './TaxReferences';
import { GlossaryText, TermsPanel } from './TaxTerms';

const Plain = ({ text }: { text?: string }) => text ? <p className="mt-1.5 text-sm leading-relaxed text-slate-700"><span className="font-medium">In simple words: </span>{text}</p> : null;
/** Optional fields, closed until opened. Starts open only if something in it is already filled in. */
function OptionalSection({ title, startOpen, children }: { title: string; startOpen: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(startOpen);
  return <details open={open} onToggle={e => setOpen(e.currentTarget.open)} className="group rounded-lg border border-slate-200 bg-slate-50/60">
    <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-sm font-medium text-blue-800 [&::-webkit-details-marker]:hidden"><ChevronRight className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90" />{title}<span className="ml-auto text-xs font-normal text-slate-400">Optional</span></summary>
    <div className="space-y-4 border-t border-slate-200 px-3 pb-4 pt-3">{SECTION_NOTES[title] && <GlossaryText text={SECTION_NOTES[title]} className="text-xs leading-relaxed text-slate-600" />}{children}</div>
  </details>;
}
const money = (amount: number) => new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP',minimumFractionDigits:2}).format(amount);
const control = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200';
const defaults = {deductionMethod:'taxable',vatRegistered:'no',formChoice:'standard',registeredSize:'unknown',multipleActivities:'no',corporateTreatment:'standard',otherCorporateTreatment:'standard',propertyExemption:'taxable',issuer:'domestic',passiveType:'interest',depositSystem:'ordinary',expandedType:'professional',employers:'one',channel:'non-efps',efpsGroup:'A'};
function initialInput(params: URLSearchParams): IncomeTaxInput {
  const taxpayer = TAXPAYER_KINDS.some(c=>c.value===params.get('taxpayer')) ? params.get('taxpayer') as TaxpayerKind : 'individual';
  const classification = CLASSIFICATIONS[taxpayer].some(c=>c.value===params.get('classification')) ? params.get('classification')! : CLASSIFICATIONS[taxpayer][0].value;
  const routes=availableRoutes(taxpayer,classification);
  const route=routes.some(r=>r.id===params.get('route')) ? params.get('route') as IncomeRoute : routes[0].id;
  const input:IncomeTaxInput={taxpayer,classification,route,period:'annual',year:currentTaxYear(),fiscalMonth:12,month:1,values:{...defaults}};
  const periods=allowedPeriods(input);input.period=periods.includes('annual') ? 'annual' : periods[0];return input;
}
export default function IncomeTaxCalculator() {
  const [params] = useSearchParams();
  const [input,setInput]=useState(()=>initialInput(params));
  const [showErrors,setShowErrors]=useState(false);
  const routeInfo=INCOME_ROUTES.find(r=>r.id===input.route)!;
  const fields=incomeFields(input);
  const result=calculateIncomeTaxReturn(input);
  const updateValues=(key:string,value:string) => {
    setInput(current=>{
      const next={...current,values:{...(['passiveType','expandedType','deductionMethod'].includes(key) ? defaults : current.values),[key]:value}};
      const periods=allowedPeriods(next);
      if (!periods.includes(next.period)) next.period=periods[0];
      return next;
    });
  };
  const resetFor=(change:Partial<IncomeTaxInput>)=>{
    setInput(current=>{
      const next={...current,...change,values:{...defaults}};
      if (change.taxpayer) next.classification=CLASSIFICATIONS[next.taxpayer][0].value;
      const routes=availableRoutes(next.taxpayer,next.classification);
      if (!routes.some(r=>r.id===next.route)) next.route=routes[0].id;
      const periods=allowedPeriods(next);
      const requested=change.period || (!change.route && !change.classification && !change.taxpayer ? current.period : undefined);
      next.period=requested && periods.includes(requested) ? requested : periods.includes('annual') ? 'annual' : periods[0];
      return next;
    });setShowErrors(false);
  };
  const scope = input.taxpayer==='fiduciary' ? 'Use the already established fiduciary taxable base, with its applicable income-source, deduction and distribution rules.' : ['resident-citizen','domestic','partnership','gocc','gpp','cooperative','exempt-entity'].includes(input.classification) ? 'Use applicable worldwide taxable income. Keep final-tax and exempt income separate.' : 'Use applicable Philippine-source taxable income. Citizenship, residence, treaties and the nature of income affect scope.';
  const periods=allowedPeriods(input);
  const complete=result.status==='calculated';
  const recipientFinal=['passive','nonresident'].includes(input.route);
  const deadline=result.statutoryDeadline ? deadlineInfo(result.statutoryDeadline) : undefined;
  const screenText=[input.taxpayer==='withholding' ? '' : scope,routeInfo.description,result.coveredPeriod,result.deadlineRule ?? '',...fields.flatMap(f=>[f.label,f.help ?? '',...(f.options?.map(o=>o.label) ?? [])]),...(complete ? [...result.lines.flatMap(l=>[l.label,l.detail ?? '']),...result.notes,result.rate ?? '','marginal rate effective rate'] : result.errors),...result.forms];
  const renderField=(field:TaxField)=>{
    const value=input.values[field.key] || '';
    if (field.type==='check') return <div key={field.key} className="flex items-start gap-3 text-sm leading-relaxed text-slate-700"><input id={`tax-${field.key}`} type="checkbox" checked={value==='true'} onChange={e=>updateValues(field.key,String(e.target.checked))} className="mt-1 h-4 w-4 shrink-0 accent-blue-600" /><div><label htmlFor={`tax-${field.key}`} className="cursor-pointer">{field.label}</label>{field.help && <GlossaryText text={field.help} className="mt-1 text-xs text-slate-500" />}</div></div>;
    return <div key={field.key}>
      <label htmlFor={`tax-${field.key}`} className="mb-1.5 block text-sm font-medium text-slate-800">{field.label}{field.optional && <span className="ml-1 font-normal text-slate-400">(optional)</span>}</label>
      {field.type==='select' ? <select id={`tax-${field.key}`} value={value || field.options?.[0].value} onChange={e=>updateValues(field.key,e.target.value)} className={control}>{field.options?.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select> : field.type==='date' ? <input id={`tax-${field.key}`} type="date" value={value} min={`${input.year}-01-01`} max={`${input.year}-12-31`} onChange={e=>updateValues(field.key,e.target.value)} className={control} aria-describedby={field.help ? `${field.key}-help` : undefined} /> : <div className="relative">{field.type!=='year' && <span className="absolute left-3 top-2.5 text-slate-400" aria-hidden="true">₱</span>}<input id={`tax-${field.key}`} type="number" inputMode={field.type==='year' ? 'numeric' : 'decimal'} step={field.type==='year' ? '1' : '0.01'} min={field.type==='year' ? 1900 : field.allowNegative ? undefined : 0} max={field.type==='year' ? input.year : 1000000000000} placeholder={field.optional ? '0' : field.type==='year' ? '2022' : 'Enter amount'} value={value} onChange={e=>updateValues(field.key,e.target.value)} className={`${control} ${field.type!=='year' ? 'pl-8' : ''}`} aria-describedby={field.help ? `${field.key}-help` : undefined} /></div>}
      {field.help && <span id={`${field.key}-help`}><GlossaryText text={field.help} className="mt-1.5 text-xs leading-relaxed text-slate-500" /></span>}
    </div>;
  };
  const renderFields=()=>{
    const out:ReactNode[]=[];
    for (let i=0;i<fields.length;) {
      const section=fields[i].section;
      if (!section) {out.push(renderField(fields[i]));i++;continue;}
      const group:TaxField[]=[];
      while (i<fields.length && fields[i].section===section) group.push(fields[i++]);
      out.push(<OptionalSection key={`${input.route}-${section}`} title={section} startOpen={group.some(f=>f.type!=='select' && !!input.values[f.key]?.trim()) || group.some(f=>f.type==='select' && !!input.values[f.key] && input.values[f.key]!==f.options?.[0].value)}>{group.map(renderField)}</OptionalSection>);
    }
    return out;
  };
  return <section aria-labelledby="income-heading" className="overflow-hidden rounded-2xl bg-white shadow-lg">
    <div className="border-b border-slate-100 px-5 py-6 sm:px-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-700">Philippine income tax</p>
      <h1 id="income-heading" className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Income Tax Calculator</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">Answer a few questions about who is filing and how the money was earned. We work out the income tax, subtract tax you already paid, and show which BIR form to use. Tap any underlined word to see what it means.</p>
    </div>
    <div className="grid lg:grid-cols-[1.1fr_1fr]">
      <form onSubmit={e=>{e.preventDefault();setShowErrors(true);document.getElementById('tax-result')?.scrollIntoView({behavior:'smooth',block:'start'});}} className="space-y-6 px-5 py-6 sm:px-8">
        <fieldset className="space-y-4"><legend className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">01 · Who is filing</legend>
          <div><label htmlFor="taxpayer-kind" className="mb-1.5 block text-sm font-medium text-slate-800">Who is filing?</label><select id="taxpayer-kind" value={input.taxpayer} onChange={e=>resetFor({taxpayer:e.target.value as TaxpayerKind})} className={control}>{TAXPAYER_KINDS.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select><Plain text={PLAIN_TAXPAYER[input.taxpayer]} /></div>
          <div><label htmlFor="classification" className="mb-1.5 block text-sm font-medium text-slate-800">{input.taxpayer==='withholding' ? 'Who are you paying?' : 'Which best describes the filer?'}</label><select id="classification" value={input.classification} onChange={e=>resetFor({classification:e.target.value})} className={control}>{CLASSIFICATIONS[input.taxpayer].map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select><Plain text={PLAIN_CLASSIFICATION[input.classification]} /><GlossaryText text={input.taxpayer==='withholding' ? 'The payee’s classification helps determine the tax treatment. You file as the withholding agent.' : scope} className="mt-1.5 text-xs leading-relaxed text-slate-500" /></div>
          <div><label htmlFor="income-route" className="mb-1.5 block text-sm font-medium text-slate-800">What kind of income is it?</label><select id="income-route" value={input.route} onChange={e=>resetFor({route:e.target.value as IncomeRoute})} className={control}>{availableRoutes(input.taxpayer,input.classification).map(route=><option key={route.id} value={route.id}>{route.name}</option>)}</select><Plain text={PLAIN_ROUTE[input.route]} /><GlossaryText text={routeInfo.description} className="mt-1.5 text-xs leading-relaxed text-slate-500" /></div>
        </fieldset>
        <fieldset className="space-y-4 border-t border-slate-100 pt-5"><legend className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">02 · Which period</legend>
          <div className="grid grid-cols-2 gap-3">
            <div><label htmlFor="tax-year" className="mb-1.5 block text-sm font-medium text-slate-800">{input.taxpayer==='corporation' ? 'Tax year ending' : 'Tax year'}</label><select id="tax-year" value={input.year} onChange={e=>resetFor({year:Number(e.target.value)})} className={control}>{taxYears().map(year=><option key={year}>{year}</option>)}</select></div>
            <div><label htmlFor="filing-period" className="mb-1.5 block text-sm font-medium text-slate-800">Period</label><select id="filing-period" value={input.period} onChange={e=>resetFor({period:e.target.value as FilingPeriod})} className={control}>{periods.map(period=><option key={period} value={period}>{periodLabel(period,input.taxpayer)}</option>)}</select></div>
          </div>
          {input.taxpayer==='corporation' && !['property','passive','nonresident'].includes(input.route) && <div><label htmlFor="fiscal-end" className="mb-1.5 block text-sm font-medium text-slate-800">Month the tax year ends</label><select id="fiscal-end" value={input.fiscalMonth} onChange={e=>resetFor({fiscalMonth:Number(e.target.value)})} className={control}>{Array.from({length:12},(_,i)=><option key={i} value={i+1}>{new Date(Date.UTC(2026,i,1)).toLocaleString('en-PH',{month:'long',timeZone:'UTC'})}{i===11 ? ' · calendar year' : ' · fiscal year'}</option>)}</select></div>}
          {input.period==='monthly' && <div><label htmlFor="remit-month" className="mb-1.5 block text-sm font-medium text-slate-800">Remittance month</label><select id="remit-month" value={input.month} onChange={e=>resetFor({month:Number(e.target.value)})} className={control}>{Array.from({length:12},(_,i)=><option key={i} value={i+1}>{new Date(Date.UTC(2026,i,1)).toLocaleString('en-PH',{month:'long',timeZone:'UTC'})}</option>)}</select></div>}
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600"><p className="font-medium text-slate-700">{PLAIN_PERIOD[input.period]}</p><GlossaryText text={`${result.coveredPeriod}${input.period.startsWith('q') && input.taxpayer!=='withholding' ? ' · Enter cumulative amounts, not this quarter alone.' : ''}`} className="mt-0.5" /></div>
        </fieldset>
        <fieldset className="space-y-4 border-t border-slate-100 pt-5"><legend className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">03 · Your income and tax already paid</legend>{fields.length ? renderFields() : <p className="text-sm leading-relaxed text-slate-600">This case needs its specific statutory, treaty or fiduciary rules checked before an estimate is available. The reference information remains available below.</p>}</fieldset>
        <div className="flex flex-wrap items-center gap-3"><button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">Review calculation<ArrowRight className="h-4 w-4" /></button><button type="button" onClick={()=>{setInput(initialInput(params));setShowErrors(false);}} className="inline-flex items-center gap-1.5 px-2 py-2 text-sm text-slate-500 hover:text-slate-900"><RotateCcw className="h-4 w-4" />Reset</button></div>
        <p className="text-xs leading-relaxed text-slate-500">This works out income tax only, not SSS, PhilHealth or Pag-IBIG, or take-home pay. Amounts are rounded to whole pesos, like on BIR forms. Changing who is filing, the kind of income or the period clears the amounts you entered.</p>
      </form>
      <aside id="tax-result" className="min-w-0 scroll-mt-24 border-t border-slate-100 bg-slate-50/80 px-5 py-6 sm:px-8 lg:border-l lg:border-t-0">
        <div className="lg:sticky lg:top-24">
          <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-slate-900"><Calculator className="h-5 w-5 text-blue-600" />Your income tax calculation</h2>
          <div aria-live="polite" aria-atomic="true">
            {complete ? <>
              <p className="text-sm text-slate-600">{input.period==='projection' ? 'Estimated income tax for the year' : recipientFinal ? 'Income tax on the payment' : 'Income tax due'}</p>
              <p data-testid="tax-liability" className="mt-1 break-words text-4xl font-bold tracking-tight text-blue-950">{money(result.liability!)}</p>
              {input.period==='projection' ? <p className="mt-2 text-sm text-slate-600">Monthly equivalent {money(result.liability!/12)}</p> : !recipientFinal && <dl className="mt-5 space-y-3 border-y border-slate-200 py-4 text-sm"><div className="flex flex-wrap justify-between gap-2"><dt className="text-slate-500">Tax you already paid or had taken out</dt><dd>{money(result.credits!)}</dd></div><div className="flex flex-wrap justify-between gap-2 font-semibold"><dt>{result.balance!<0 ? 'You overpaid by' : 'You still need to pay'}</dt><dd data-testid="tax-balance" className="text-blue-900">{money(Math.abs(result.balance!))}</dd></div></dl>}
              {result.marginalRate!==undefined && <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500"><div><dt className="inline">Marginal rate </dt><dd className="inline font-semibold text-slate-800">{(result.marginalRate*100).toFixed(0)}%</dd></div><div><dt className="inline">Effective rate </dt><dd className="inline font-semibold text-slate-800">{(result.effectiveRate!*100).toFixed(2)}%</dd></div></dl>}
              {result.rate && <p className="mt-3 text-xs font-medium text-blue-700">{result.rate}</p>}
              <details open className="mt-5"><summary className="cursor-pointer text-sm font-semibold text-slate-800">How we got this number</summary><dl className="mt-3 space-y-3">{result.lines.map((line,i)=><div key={i} className="text-sm"><div className="flex flex-wrap justify-between gap-x-3 gap-y-1"><dt className="text-slate-600">{line.label}</dt>{line.amount!==undefined && <dd className="font-medium tabular-nums text-slate-900">{money(line.amount)}</dd>}</div>{line.detail && <GlossaryText text={line.detail} className="mt-0.5 text-xs leading-relaxed text-slate-500" />}</div>)}</dl></details>
            </> : result.status==='needs-review' ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-4"><h3 className="text-sm font-semibold text-amber-950">Please check this first</h3><ul className="mt-2 space-y-2 text-sm leading-relaxed text-amber-900">{result.errors.map(error=><li key={error}><GlossaryText text={error} /></li>)}</ul></div> : <div className="py-6"><FileText className="mb-3 h-8 w-8 text-slate-300" /><p className="font-medium text-slate-800">Your result will show here</p><p className="mt-2 text-sm leading-relaxed text-slate-500">Fill in the amounts and tick the boxes that apply. You will see your tax, what you already paid, and how we worked it out.</p>{showErrors && <ul role="alert" className="mt-4 space-y-2 text-sm text-red-700">{result.errors.map(error=><li key={error}>{error}</li>)}</ul>}</div>}
          </div>
          {complete && result.notes.length>0 && <details className="mt-5 border-t border-slate-200 pt-4"><summary className="cursor-pointer text-sm font-medium text-slate-700">Things to know about this result</summary><ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-600">{result.notes.map(note=><li key={note} className="flex gap-2"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /><GlossaryText text={note} /></li>)}</ul></details>}
          <section className="mt-6 border-t border-slate-200 pt-5" aria-label="Applicable BIR forms"><h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900"><CheckCircle2 className="h-4 w-4 text-blue-600" />{recipientFinal ? 'Forms for the payer, and your proof of tax' : 'BIR forms to use'}</h3><FormReferences numbers={result.forms} />{!result.forms.length && <p className="text-sm text-slate-500">The right form depends on the special law or tax treaty that applies. Ask BIR or a tax adviser.</p>}
            {deadline && <div className="mt-4 rounded-lg bg-white p-3 text-sm"><p className="font-medium text-slate-800">File and pay by {deadline.date}</p><p className="mt-1 text-xs leading-relaxed text-slate-500">{result.deadlineRule}{deadline.weekend ? ` The usual date, ${deadline.weekend}, falls on a weekend, so it moves to the next working day.` : ''} If this date is a holiday or BIR extends it, the deadline can change.</p></div>}
            {!deadline && result.deadlineRule && <GlossaryText text={result.deadlineRule} className="mt-3 text-xs leading-relaxed text-slate-500" />}
          </section>
          <div className="mt-5 border-t border-slate-200 pt-4"><SourceLinks ids={[...result.sources,'scope']} /></div>
        </div>
      </aside>
    </div>
    <TermsPanel texts={screenText} />
  </section>;
}
