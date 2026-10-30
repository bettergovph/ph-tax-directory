import { ReactNode, useId, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { GlossaryText } from '@/components/TaxTerms';

export const controlClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200';

const FieldLabel = ({ id, label, item }: { id: string; label: string; item?: string }) => (
  <label htmlFor={id} className="mb-1 flex items-baseline justify-between gap-2 text-sm font-medium text-gray-800">
    <span>{label}</span>{item && <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-normal text-gray-600">Item {item}</span>}
  </label>
);
const FieldNotes = ({ id, error, hint }: { id: string; error?: string; hint?: string }) => <>
  {error && <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-red-700">{error}</p>}
  {hint && <GlossaryText text={hint} className="mt-1 text-xs leading-relaxed text-gray-500" />}
</>;

/** A peso amount box. Strips anything that is not a digit, comma or dot. */
export function MoneyInput({ label, item, value, onChange, error, hint, placeholder = '0.00' }: {
  label: string; item?: string; value: string; onChange: (value: string) => void; error?: string; hint?: string; placeholder?: string;
}) {
  const id = useId();
  return <div>
    <FieldLabel id={id} label={label} item={item} />
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true">₱</span>
      <input id={id} type="text" inputMode="decimal" autoComplete="off" value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value.replace(/[^0-9.,]/g, ''))}
        aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined}
        className={`${controlClass} pl-8 ${error ? 'border-red-400' : ''}`} />
    </div>
    <FieldNotes id={id} error={error} hint={hint} />
  </div>;
}

/** A plain number box, such as litres, packs, days or years. */
export function NumberInput({ label, value, onChange, error, hint, placeholder = '0', unit }: {
  label: string; value: string; onChange: (value: string) => void; error?: string; hint?: string; placeholder?: string; unit?: string;
}) {
  const id = useId();
  return <div>
    <FieldLabel id={id} label={label} />
    <div className="relative">
      <input id={id} type="text" inputMode="decimal" autoComplete="off" value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value.replace(/[^0-9.,]/g, ''))}
        aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined}
        className={`${controlClass} ${unit ? 'pr-20' : ''} ${error ? 'border-red-400' : ''}`} />
      {unit && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500" aria-hidden="true">{unit}</span>}
    </div>
    <FieldNotes id={id} error={error} hint={hint} />
  </div>;
}

export function SelectField({ label, value, onChange, options, error, hint }: {
  label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; error?: string; hint?: string;
}) {
  const id = useId();
  return <div>
    <FieldLabel id={id} label={label} />
    <select id={id} value={value} onChange={e => onChange(e.target.value)} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} className={`${controlClass} ${error ? 'border-red-400' : ''}`}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    <FieldNotes id={id} error={error} hint={hint} />
  </div>;
}

export function DateField({ label, value, onChange, error, hint }: { label: string; value: string; onChange: (value: string) => void; error?: string; hint?: string }) {
  const id = useId();
  return <div>
    <FieldLabel id={id} label={label} />
    <input id={id} type="date" value={value} onChange={e => onChange(e.target.value)} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} className={`${controlClass} ${error ? 'border-red-400' : ''}`} />
    <FieldNotes id={id} error={error} hint={hint} />
  </div>;
}

/** A collapsible group of inputs, open by default or when something in it is already filled in. */
export function CalcSection({ title, intro, startOpen, children }: { title: string; intro?: string; startOpen: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(startOpen);
  return <details open={open} onToggle={e => setOpen(e.currentTarget.open)} className="rounded-lg border border-gray-200 bg-gray-50/60">
    <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-3 text-sm font-semibold text-blue-800 [&::-webkit-details-marker]:hidden">
      <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} aria-hidden="true" />{title}
    </summary>
    <div className="space-y-4 border-t border-gray-200 px-3 pb-4 pt-3">
      {intro && <GlossaryText text={intro} className="text-xs leading-relaxed text-gray-600" />}
      {children}
    </div>
  </details>;
}

/** Calculator layout: inputs on the left, a sticky result panel on the right. */
export function CalcLayout({ title, intro, icon, inputs, result, footnote }: { title: string; intro: string; icon: ReactNode; inputs: ReactNode; result: ReactNode; footnote: string }) {
  return <div className="rounded-xl bg-white p-4 shadow-lg sm:p-6">
    <div className="mb-4 flex items-center gap-3"><span className="text-blue-600" aria-hidden="true">{icon}</span><h2 className="text-lg font-semibold text-gray-900 sm:text-xl">{title}</h2></div>
    <GlossaryText className="mb-5 text-sm leading-relaxed text-gray-600" text={intro} />
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
      <div className="space-y-4">{inputs}</div>
      <div className="lg:sticky lg:top-4 lg:self-start">
        <div className="rounded-lg bg-purple-50 p-4" aria-live="polite">{result}</div>
        <p className="mt-3 text-xs leading-relaxed text-gray-500">{footnote}</p>
      </div>
    </div>
  </div>;
}

/** Headline figure plus a list of labelled amounts. */
export function ResultHeadline({ label, value }: { label: string; value: string }) {
  return <><p className="text-xs font-semibold uppercase tracking-wide text-purple-700">{label}</p><p className="mt-1 text-3xl font-bold text-purple-950">{value}</p></>;
}
export function ResultRows({ rows }: { rows: { key: string; tag?: string; label: string; detail?: string; value: string; strong?: boolean }[] }) {
  return <dl className="space-y-1.5">{rows.map(r => <div key={r.key} className={`flex items-start justify-between gap-3 text-sm ${r.strong ? 'border-t border-purple-200 pt-1.5 font-semibold text-purple-950' : 'text-purple-800'}`}>
    <dt className="flex-1">{r.tag && <span className="mr-1.5 rounded bg-white/70 px-1 text-xs text-purple-700">{r.tag}</span>}{r.label}{r.detail && <span className="block text-xs font-normal text-purple-700">{r.detail}</span>}</dt>
    <dd className="text-right tabular-nums">{r.value}</dd>
  </div>)}</dl>;
}
export const ResultNotes = ({ notes }: { notes: string[] }) => notes.length ? <ul className="mt-4 space-y-2 border-t border-purple-200 pt-3 text-xs leading-relaxed text-purple-900">{notes.map(n => <li key={n}>{n}</li>)}</ul> : null;
