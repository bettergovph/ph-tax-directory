import { useState } from 'react';
import { ArrowRight, Users } from 'lucide-react';
import { CLASSIFICATION_NOTES, TAXPAYER_CATEGORIES } from '@/data/taxpayerCategories';
import { periodLabel, REVIEWED_DATE, allowedPeriods, availableRoutes } from '@/data/incomeTax';
import { TaxpayerKind } from '@/types/incomeTax';
import { FormReferences, SourceLinks } from './TaxReferences';
export default function TaxpayerCategories() {
  const [kind,setKind]=useState<TaxpayerKind>('individual');
  const category=TAXPAYER_CATEGORIES.find(c=>c.id===kind)!;
  const [classification,setClassification]=useState('resident-citizen');
  const routes=availableRoutes(kind,classification);
  return <div className="space-y-5">
    <header className="rounded-2xl bg-white p-5 shadow-lg sm:p-8"><p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-700">Understand your filing</p><h1 className="flex items-center gap-3 text-2xl font-bold text-slate-950"><Users className="h-6 w-6 text-blue-600" />Taxpayer Categories</h1><p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">Taxpayer classification, income type and filing role are separate decisions. Explore the available tax treatments, periods and BIR forms for each.</p><p className="mt-3 text-xs text-slate-400">Sources reviewed {REVIEWED_DATE}</p></header>
    <div className="rounded-2xl bg-white p-5 shadow-lg sm:p-8">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Taxpayer type">{TAXPAYER_CATEGORIES.map(c=><button key={c.id} onClick={()=>{setKind(c.id);setClassification(c.classifications[0].value);}} aria-pressed={kind===c.id} className={`rounded-lg px-4 py-2.5 text-sm font-medium ${kind===c.id ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{c.name}</button>)}</div>
      <p className="mt-5 text-sm leading-relaxed text-slate-600">{category.description}</p>
      <label htmlFor="category-classification" className="mb-2 mt-5 block text-sm font-semibold text-slate-800">{kind==='withholding' ? 'Recipient classification' : 'Classification'}</label><select id="category-classification" value={classification} onChange={e=>setClassification(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white p-3 text-base text-slate-900 focus:ring-2 focus:ring-blue-300">{category.classifications.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}</select>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{CLASSIFICATION_NOTES[classification]}</p>
      <div className="mt-4"><SourceLinks ids={['scope','bir']} /></div>
    </div>
    <div className="space-y-4">{routes.map(route=><article key={route.id} className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900">{route.name}</h2><p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{route.description}</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">{route.rate}</span></div>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">Periods: {allowedPeriods({route:route.id,values:{passiveType:'interest'}}).map(p=>periodLabel(p,kind)).join(' · ')}. Eligibility and exemptions determine actual filing obligations.</p>
      <details className="mt-4 border-t border-slate-100 pt-4"><summary className="cursor-pointer text-sm font-medium text-slate-700">Applicable form references & source</summary><div className="mt-4"><FormReferences numbers={route.forms} /></div><div className="mt-4"><SourceLinks ids={[route.source]} /></div></details>
      <a href={`#/tax-calculators/income?taxpayer=${kind}&classification=${classification}&route=${route.id}`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline">{route.id==='specialist' ? 'Review this classification' : 'Open this calculator'}<ArrowRight className="h-4 w-4" /></a>
    </article>)}</div>
    <p className="rounded-lg bg-blue-50 p-4 text-sm leading-relaxed text-blue-900">Business filing size, the elected 8% regime, and the corporate 20% rate have different eligibility rules. Qualified minimum-wage and other exempt income must be excluded from the relevant taxable compensation base; exempt income does not automatically remove every filing obligation.</p>
  </div>;
}
