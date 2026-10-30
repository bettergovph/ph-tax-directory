import { useId, useState } from 'react';
import { BookOpen, X } from 'lucide-react';
import { GLOSSARY, GlossaryTerm, splitTerms, termsIn } from '@/data/taxGlossary';

/** Text with tax words underlined. Tapping a word shows a plain-language definition right below the text. */
export function GlossaryText({ text, className }: { text: string; className?: string }) {
  const [open, setOpen] = useState<GlossaryTerm>();
  const id = useId();
  return <span className={`block ${className ?? ''}`}>
    {splitTerms(text).map((part, i) => part.term
      ? <button key={i} type="button" onClick={() => setOpen(open?.id === part.term!.id ? undefined : part.term)} aria-expanded={open?.id === part.term.id} aria-controls={id} className="cursor-help underline decoration-blue-400 decoration-dotted underline-offset-2 hover:text-blue-800 focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-blue-300">{part.text}</button>
      : <span key={i}>{part.text}</span>)}
    {open && <span id={id} role="note" className="mt-2 block rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs leading-relaxed text-slate-700">
      <span className="flex items-start justify-between gap-2"><strong className="text-slate-900">{open.term}</strong><button type="button" onClick={() => setOpen(undefined)} aria-label={`Close ${open.term} definition`} className="text-slate-400 hover:text-slate-700"><X className="h-3.5 w-3.5" /></button></span>
      <span className="mt-1 block">{open.simple}</span>
      {open.example && <span className="mt-1 block text-slate-600"><span className="font-medium">Example: </span>{open.example}</span>}
    </span>}
  </span>;
}

function TermList({ terms }: { terms: GlossaryTerm[] }) {
  return <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">{terms.map(term => <div key={term.id}>
    <dt className="text-sm font-semibold text-slate-900">{term.term}</dt>
    <dd className="mt-1 text-sm leading-relaxed text-slate-600">{term.simple}{term.example && <span className="mt-1 block text-xs text-slate-500"><span className="font-medium">Example: </span>{term.example}</span>}</dd>
  </div>)}</dl>;
}

/** Plain-language definitions for the tax words currently on screen, with the full glossary below. */
export function TermsPanel({ texts }: { texts: string[] }) {
  const terms = termsIn(texts);
  const others = GLOSSARY.filter(term => !terms.some(t => t.id === term.id)).sort((a, b) => a.term.localeCompare(b.term));
  return <section aria-labelledby="terms-heading" className="border-t border-slate-100 px-5 py-6 sm:px-8">
    <h2 id="terms-heading" className="flex items-center gap-2 text-base font-semibold text-slate-900"><BookOpen className="h-5 w-5 text-blue-600" />Tax words explained</h2>
    <p className="mt-1 mb-5 text-sm text-slate-500">Simple meanings of the tax words used above. You can also tap any underlined word for its meaning.</p>
    {terms.length > 0 && <TermList terms={terms} />}
    <details className="mt-6 border-t border-slate-100 pt-4"><summary className="cursor-pointer text-sm font-medium text-blue-700">More tax words ({others.length})</summary><div className="mt-4"><TermList terms={others} /></div></details>
  </section>;
}
