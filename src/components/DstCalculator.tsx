import { useMemo, useState } from 'react';
import { CalendarDays, FileSignature, RotateCcw } from 'lucide-react';
import { DST_INSTRUMENTS, DstInstrumentId } from '@/data/dst';
import { DST_FIELDS, DstField, calculateDst, formatPesos } from '@/utils/dst';
import { FormReferences } from '@/components/TaxReferences';
import { CalcLayout, DateField, MoneyInput, NumberInput, ResultHeadline, ResultNotes, ResultRows, SelectField } from '@/components/calc/CalcParts';

const dateFormat = new Intl.DateTimeFormat('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
const instrumentOptions = DST_INSTRUMENTS.map(i => ({ value: i.id, label: `${i.label} (${i.section})` }));
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

export default function DstCalculator() {
  const [instrument, setInstrument] = useState<DstInstrumentId>('loan');
  const [date, setDate] = useState(today);
  const [values, setValues] = useState<Record<string, string>>({});
  const info = DST_INSTRUMENTS.find(i => i.id === instrument)!;
  const fields = DST_FIELDS[instrument];
  const get = (field: DstField) => values[field.key] ?? field.default ?? '';
  const visible = fields.filter(f => !f.showWhen || Object.entries(f.showWhen).every(([key, v]) => (values[key] ?? fields.find(x => x.key === key)?.default ?? '') === v));
  const touched = visible.some(f => f.kind !== 'choice' && (values[f.key] ?? '').trim() !== '');
  const { errors, result } = useMemo(() => calculateDst({ instrument, date, values }), [instrument, date, values]);
  const changeInstrument = (next: string) => { setInstrument(next as DstInstrumentId); setValues({}); };
  const set = (key: string) => (value: string) => setValues(v => ({ ...v, [key]: value }));

  const inputs = <>
    <SelectField label="What kind of document is it?" value={instrument} onChange={changeInstrument} options={instrumentOptions} hint={info.summary} />
    <DateField label="Date the document is made, signed, issued, accepted or transferred" value={date} onChange={setDate} error={errors.date} />
    {visible.map(field => field.kind === 'money' ? <MoneyInput key={field.key} label={field.label} value={values[field.key] ?? ''} onChange={set(field.key)} error={errors[field.key]} hint={field.hint} />
      : field.kind === 'integer' ? <NumberInput key={field.key} label={field.label} value={get(field)} onChange={set(field.key)} error={errors[field.key]} hint={field.hint} placeholder={field.key === 'years' ? '1' : '0'} />
      : <SelectField key={field.key} label={field.label} value={get(field)} onChange={set(field.key)} options={field.choices ?? []} hint={field.hint} />)}
    <button type="button" onClick={() => setValues({})} disabled={!touched} className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 disabled:text-gray-400"><RotateCcw className="h-4 w-4" aria-hidden="true" />Clear amounts</button>
  </>;

  const resultPanel = errors.date ? <p className="text-sm text-red-700">{errors.date}</p>
    : Object.keys(errors).length > 0 ? <p className="text-sm text-red-700">Fix the highlighted fields to see the result.</p>
    : !touched || !result ? <p className="text-sm text-purple-800">Enter the amounts from the document to see the tax.</p>
    : <>
      <ResultHeadline label="Documentary stamp tax" value={formatPesos(result.total)} />
      <div className="mt-4"><ResultRows rows={[...result.lines.map((l, i) => ({ key: String(i), label: l.label, detail: l.detail, value: formatPesos(l.amount) })), ...(result.lines.length > 1 ? [{ key: 'total', label: 'DST payable', value: formatPesos(result.total), strong: true }] : [])]} /></div>
      <p className="mt-4 flex items-start gap-2 text-sm text-purple-900"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span>File BIR Form {result.form} and pay by <strong>{dateFormat.format(result.dueDate)}</strong>, the 5th day after the end of the month of the document.</span></p>
      <ResultNotes notes={result.notes} />
    </>;

  return <div className="space-y-4 sm:space-y-6">
    <CalcLayout title="Documentary stamp tax calculator" icon={<FileSignature className="h-5 w-5 sm:h-6 sm:w-6" />}
      intro="Work out the documentary stamp tax (DST) on a document: a loan, deed of sale of land or a house, lease, mortgage, shares of stock or an insurance policy. Pick the document, enter its date and amounts, and see the tax and the BIR form to file."
      inputs={inputs} result={resultPanel}
      footnote="An estimate for the common documents, using BIR’s rate tables and the law as amended through RA 12214 (CMEPA). Other documents, such as checks and bills of lading, are not covered. Weekend and holiday moves to the due date are not counted." />
    <div className="rounded-xl bg-white p-4 shadow-lg sm:p-6">
      <h2 className="mb-3 text-base font-semibold text-gray-900">File it with</h2>
      <FormReferences numbers={[info.form]} />
    </div>
  </div>;
}
