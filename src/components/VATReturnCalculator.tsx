import { useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, FileText, RotateCcw } from 'lucide-react';
import { VAT_FIELDS, VAT_SECTIONS, VatField, VatLine, VatSection, calculateVatReturn, formatPesos, vatDueDate } from '@/utils/vatReturn';
import { FormReferences, SourceLinks } from '@/components/TaxReferences';
import { GlossaryText } from '@/components/TaxTerms';
import { CalcSection, MoneyInput } from '@/components/calc/CalcParts';
import { VAT_SOURCES } from '@/data/vat';

const SECTION_ORDER: VatSection[] = ['sales', 'purchases', 'carried', 'deductions', 'credits', 'penalties'];
const OPEN_BY_DEFAULT: VatSection[] = ['sales', 'purchases'];
const PART_TITLES: Record<VatLine['part'], string> = { 'IV-sales': 'Sales and output VAT', 'IV-input': 'Input VAT', 'IV-result': 'Result of Part IV', II: 'Part II · total tax payable' };
const dateFormat = new Intl.DateTimeFormat('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
const QUARTERS = [
  { value: 1, label: '1st quarter (Jan–Mar)' }, { value: 2, label: '2nd quarter (Apr–Jun)' },
  { value: 3, label: '3rd quarter (Jul–Sep)' }, { value: 4, label: '4th quarter (Oct–Dec)' },
] as const;

export default function VATReturnCalculator() {
  const now = new Date();
  const [values, setValues] = useState<Record<string, string>>({});
  const [salesIncludeVat, setSalesIncludeVat] = useState(false);
  // Start on the quarter that closed most recently, since that is the one being filed.
  const closed = Math.floor(now.getMonth() / 3);
  const [quarter, setQuarter] = useState<1 | 2 | 3 | 4>((closed === 0 ? 4 : closed) as 1 | 2 | 3 | 4);
  const [year, setYear] = useState(closed === 0 ? now.getFullYear() - 1 : now.getFullYear());
  const set = (key: string) => (value: string) => setValues(v => ({ ...v, [key]: value }));
  const { errors, result } = useMemo(() => calculateVatReturn(values, { salesIncludeVat }), [values, salesIncludeVat]);
  const touched = Object.values(values).some(v => v.trim() !== '');
  const hasErrors = Object.keys(errors).length > 0;
  const years = Array.from({ length: 4 }, (_, i) => now.getFullYear() + 1 - i);
  const due = vatDueDate(year, quarter);
  const grouped = result ? (['IV-sales', 'IV-input', 'IV-result', 'II'] as const).map(part => ({ part, lines: result.lines.filter(l => l.part === part) })) : [];

  const fieldsFor = (section: VatSection) => VAT_FIELDS.filter(f => f.section === section);
  const renderField = (field: VatField) => field.taxKey
    ? <div key={field.key} className="grid gap-3 sm:grid-cols-2">
        <MoneyInput label={`${field.label}: amount without VAT`} item={`${field.item}A`} value={values[field.key] ?? ''} onChange={set(field.key)} error={errors[field.key]} />
        <MoneyInput label="Input VAT" item={`${field.item}B`} value={values[field.taxKey] ?? ''} onChange={set(field.taxKey)} error={errors[field.taxKey]}
          placeholder={result ? formatPesos(result.purchaseTax[field.key] ?? 0n).replace('₱', '') : '12% of amount'} hint="Leave blank to use 12% of the amount." />
      </div>
    : <MoneyInput key={field.key} label={field.label} item={field.item} value={values[field.key] ?? ''} onChange={set(field.key)} error={errors[field.key]} hint={field.hint} />;

  return <div className="space-y-4 sm:space-y-6">
    <div className="rounded-xl bg-white p-4 shadow-lg sm:p-6">
      <div className="mb-4 flex items-center gap-3"><FileText className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" aria-hidden="true" /><h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Quarterly VAT return (BIR Form 2550Q)</h2></div>
      <GlossaryText className="mb-5 text-sm leading-relaxed text-gray-600" text="Work out the VAT you owe for a quarter. Each line shows the Item number on Form 2550Q, so you can copy the answers onto your return. VAT-registered businesses file this every quarter, even with no sales." />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label htmlFor="vat-quarter" className="mb-1 block text-sm font-medium text-gray-800">Quarter</label>
              <select id="vat-quarter" value={quarter} onChange={e => setQuarter(Number(e.target.value) as 1 | 2 | 3 | 4)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base">{QUARTERS.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}</select></div>
            <div><label htmlFor="vat-year" className="mb-1 block text-sm font-medium text-gray-800">Year</label>
              <select id="vat-year" value={year} onChange={e => setYear(Number(e.target.value))} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base">{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
          </div>
          <p className="flex items-start gap-2 text-sm text-gray-700"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" /><span>Due <strong>{dateFormat.format(due)}</strong>, the 25th day after the quarter closes, for calendar-year filers. Fiscal-year quarters and weekend or holiday moves are not counted.</span></p>
          <label className="flex items-start gap-2 text-sm text-gray-800"><input type="checkbox" checked={salesIncludeVat} onChange={e => setSalesIncludeVat(e.target.checked)} className="mt-1 rounded text-blue-600 focus:ring-blue-500" /><span>My VATable sales figure already includes the 12% VAT</span></label>

          {SECTION_ORDER.map(section => {
            const filled = fieldsFor(section).some(f => (values[f.key] ?? '').trim() !== '' || (f.taxKey && (values[f.taxKey] ?? '').trim() !== ''));
            return <CalcSection key={section} title={VAT_SECTIONS[section].title} intro={VAT_SECTIONS[section].intro} startOpen={OPEN_BY_DEFAULT.includes(section) || filled}>{fieldsFor(section).map(renderField)}</CalcSection>;
          })}
          <button type="button" onClick={() => { setValues({}); setSalesIncludeVat(false); }} disabled={!touched && !salesIncludeVat} className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 disabled:text-gray-400"><RotateCcw className="h-4 w-4" aria-hidden="true" />Clear all amounts</button>
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-lg bg-purple-50 p-4" aria-live="polite">
            {hasErrors && <p className="text-sm text-red-700">Fix the highlighted amounts to see the result.</p>}
            {!hasErrors && result && !touched && <p className="text-sm text-purple-800">Enter your sales and purchases to see the computation.</p>}
            {!hasErrors && result && touched && <>
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">{result.totalAmountPayable < 0n ? 'Excess credits (Item 26)' : 'Total amount payable (Item 26)'}</p>
              <p className="mt-1 text-3xl font-bold text-purple-950">{formatPesos(result.totalAmountPayable < 0n ? result.excessCredits : result.totalAmountPayable)}</p>
              {result.excessInput > 0n && <p className="mt-3 flex items-start gap-2 text-sm text-purple-900"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span>Your input VAT is higher than your output VAT by {formatPesos(result.excessInput)}. Nothing is payable for VAT, and you can usually carry this to Item 38 of next quarter’s return.</span></p>}
              {result.excessCredits > 0n && result.excessInput === 0n && <p className="mt-3 text-sm text-purple-900">Your credits are higher than the tax due. Ask BIR how to use or recover the extra before relying on it.</p>}
              <div className="mt-4 space-y-4">
                {grouped.map(({ part, lines }) => <div key={part}>
                  <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-purple-700">{PART_TITLES[part]}</h3>
                  <dl className="space-y-1.5">{lines.map(l => <div key={l.item} className={`flex items-start justify-between gap-3 text-sm ${l.strong ? 'border-t border-purple-200 pt-1.5 font-semibold text-purple-950' : 'text-purple-800'}`}>
                    <dt className="flex-1"><span className="mr-1.5 rounded bg-white/70 px-1 text-xs text-purple-700">{l.item}</span>{l.label}</dt><dd className="text-right tabular-nums">{formatPesos(l.amount)}</dd></div>)}</dl>
                </div>)}
              </div>
            </>}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-gray-500">An estimate that follows the 2550Q April 2024 (ENCS) layout. It does not build Schedules 1, 3 or 4 for you, so enter their totals above. Check your return against the official form and BIR guidelines before filing.</p>
        </div>
      </div>
    </div>

    <div className="rounded-xl bg-white p-4 shadow-lg sm:p-6">
      <h2 className="mb-3 text-base font-semibold text-gray-900">File it with</h2>
      <FormReferences numbers={['2550Q']} />
      <div className="mt-3"><SourceLinks ids={['guide2550q', 'bir']} sources={VAT_SOURCES} /></div>
    </div>
  </div>;
}
