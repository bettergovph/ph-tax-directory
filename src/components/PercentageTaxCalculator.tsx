import { useMemo, useState } from 'react';
import { CalendarDays, Percent, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { PT_CATEGORIES } from '@/data/percentageTax';
import { MAX_PT_LINES, PT_VALUE_FIELDS, PtLineInput, Quarter, calculatePercentageTax, formatPesos } from '@/utils/percentageTax';
import { quarterDueDate } from '@/utils/dates';
import { FormReferences } from '@/components/TaxReferences';
import { GlossaryText } from '@/components/TaxTerms';
import { CalcLayout, CalcSection, MoneyInput, ResultHeadline, ResultNotes, ResultRows, SelectField } from '@/components/calc/CalcParts';

const dateFormat = new Intl.DateTimeFormat('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
const QUARTERS = [
  { value: '1', label: '1st quarter (Jan–Mar)' }, { value: '2', label: '2nd quarter (Apr–Jun)' },
  { value: '3', label: '3rd quarter (Jul–Sep)' }, { value: '4', label: '4th quarter (Oct–Dec)' },
];
const categoryOptions = PT_CATEGORIES.map(c => ({ value: c.atc, label: `${c.label} (${Number(c.bp) / 100}%, ${c.section})` }));
const blankLine = (): PtLineInput => ({ atc: PT_CATEGORIES[0].atc, receipts: '' });

export default function PercentageTaxCalculator() {
  const now = new Date();
  const closed = Math.floor(now.getMonth() / 3);
  const [quarter, setQuarter] = useState<Quarter>((closed === 0 ? 4 : closed) as Quarter);
  const [year, setYear] = useState(closed === 0 ? now.getFullYear() - 1 : now.getFullYear());
  const [lines, setLines] = useState<PtLineInput[]>([blankLine()]);
  const [values, setValues] = useState<Record<string, string>>({});
  const { errors, result } = useMemo(() => calculatePercentageTax({ year, quarter, lines, values }), [year, quarter, lines, values]);
  const touched = lines.some(l => l.receipts.trim() !== '') || Object.values(values).some(v => v.trim() !== '');
  const years = Array.from({ length: 8 }, (_, i) => now.getFullYear() + 1 - i);
  const setLine = (i: number, patch: Partial<PtLineInput>) => setLines(ls => ls.map((l, j) => j === i ? { ...l, ...patch } : l));
  const usesTemporaryRate = result?.rows.some(r => r.temporaryRate);
  const penaltyFilled = PT_VALUE_FIELDS.filter(f => ['surcharge', 'interest', 'compromise'].includes(f.key)).some(f => (values[f.key] ?? '').trim() !== '');
  const creditFilled = ['creditableWithheld', 'previousPaid', 'otherCredits'].some(k => (values[k] ?? '').trim() !== '');

  const inputs = <>
    <div className="grid gap-3 sm:grid-cols-2">
      <SelectField label="Quarter" value={String(quarter)} onChange={v => setQuarter(Number(v) as Quarter)} options={QUARTERS} />
      <SelectField label="Year" value={String(year)} onChange={v => setYear(Number(v))} options={years.map(y => ({ value: String(y), label: String(y) }))} />
    </div>
    <p className="flex items-start gap-2 text-sm text-gray-700"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" /><span>Due <strong>{dateFormat.format(quarterDueDate(year, quarter))}</strong>, the 25th day after the quarter closes, for calendar-year filers.</span></p>

    <CalcSection title="Sales or receipts for the quarter" intro="Add a line for each kind of business you have. The form has room for six. Enter gross sales or receipts without any VAT." startOpen>
      {lines.map((line, i) => <div key={i} className="space-y-3 rounded-lg border border-gray-200 bg-white p-3">
        <SelectField label={`Business ${lines.length > 1 ? i + 1 : ''}`.trim()} value={line.atc} onChange={v => setLine(i, { atc: v })} options={categoryOptions} />
        <MoneyInput label="Gross sales or receipts" item="Sched. 1" value={line.receipts} onChange={v => setLine(i, { receipts: v })} error={errors[`line-${i}`]} />
        {lines.length > 1 && <button type="button" onClick={() => setLines(ls => ls.filter((_, j) => j !== i))} className="inline-flex items-center gap-1.5 text-sm text-red-700"><Trash2 className="h-4 w-4" aria-hidden="true" />Remove this line</button>}
      </div>)}
      {lines.length < MAX_PT_LINES && <button type="button" onClick={() => setLines(ls => [...ls, blankLine()])} className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700"><Plus className="h-4 w-4" aria-hidden="true" />Add another line</button>}
    </CalcSection>

    <CalcSection title="Tax credits and payments" intro="Percentage tax already withheld from you or paid before, which lowers what you pay now." startOpen={creditFilled}>
      {PT_VALUE_FIELDS.filter(f => ['creditableWithheld', 'previousPaid', 'otherCredits'].includes(f.key)).map(f => <MoneyInput key={f.key} label={f.label} item={f.item} value={values[f.key] ?? ''} onChange={v => setValues(x => ({ ...x, [f.key]: v }))} error={errors[f.key]} hint={'hint' in f ? f.hint : undefined} />)}
    </CalcSection>
    <CalcSection title="Penalties (only if filing late)" startOpen={penaltyFilled}>
      {PT_VALUE_FIELDS.filter(f => ['surcharge', 'interest', 'compromise'].includes(f.key)).map(f => <MoneyInput key={f.key} label={f.label} item={f.item} value={values[f.key] ?? ''} onChange={v => setValues(x => ({ ...x, [f.key]: v }))} error={errors[f.key]} hint={'hint' in f ? f.hint : undefined} />)}
    </CalcSection>
    <button type="button" onClick={() => { setLines([blankLine()]); setValues({}); }} disabled={!touched} className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 disabled:text-gray-400"><RotateCcw className="h-4 w-4" aria-hidden="true" />Clear all amounts</button>
  </>;

  const notes: string[] = [];
  if (usesTemporaryRate) notes.push('This quarter falls in the July 2020 to June 2023 period when the Sec. 116 rate was cut to 1%.');
  if (result && result.rows.some(r => r.atc === 'PT 010')) notes.push('If you chose the 8% income tax option, you do not pay percentage tax. Use the Income Tax calculator instead.');

  const resultPanel = Object.keys(errors).length > 0 ? <p className="text-sm text-red-700">Fix the highlighted amounts to see the result.</p>
    : !touched || !result ? <p className="text-sm text-purple-800">Enter your sales or receipts to see the computation.</p>
    : <>
      <ResultHeadline label={result.totalAmountPayable < 0n ? 'Overpayment (Item 24)' : 'Total amount payable (Item 24)'} value={formatPesos(result.totalAmountPayable < 0n ? result.overpayment : result.totalAmountPayable)} />
      <div className="mt-4 space-y-4">
        <div><h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-purple-700">Schedule 1 · tax due by line</h3>
          <ResultRows rows={result.rows.map((r, i) => ({ key: `${r.atc}-${i}`, tag: r.atc, label: `${formatPesos(r.receipts)} × ${Number(r.rateBp) / 100}%`, detail: r.label, value: formatPesos(r.tax) }))} /></div>
        <div><h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-purple-700">Part II · total tax payable</h3>
          <ResultRows rows={result.lines.map(l => ({ key: l.item, tag: l.item, label: l.label, value: formatPesos(l.amount), strong: l.strong }))} /></div>
      </div>
      <ResultNotes notes={notes} />
    </>;

  return <div className="space-y-4 sm:space-y-6">
    <CalcLayout title="Quarterly percentage tax return (BIR Form 2551Q)" icon={<Percent className="h-5 w-5 sm:h-6 sm:w-6" />}
      intro="Work out the percentage tax for a quarter. Each line shows the Item number on Form 2551Q. Percentage tax is for sellers who are not VAT-registered, and for industries the law taxes this way, such as carriers, banks and insurers."
      inputs={inputs} result={resultPanel}
      footnote="An estimate that follows the 2551Q rate table. Check it against the official form and BIR guidelines before filing." />
    <div className="rounded-xl bg-white p-4 shadow-lg sm:p-6">
      <h2 className="mb-3 text-base font-semibold text-gray-900">File it with</h2>
      <FormReferences numbers={['2551Q']} />
      <GlossaryText className="mt-3 text-xs text-gray-500" text="Not sure whether you owe VAT or percentage tax? Sales over ₱3 million in 12 months mean VAT." />
    </div>
  </div>;
}
