import { ExternalLink, FileText } from 'lucide-react';
import { FORM_BY_NUMBER } from '@/data/birForms';
import { SOURCES } from '@/data/incomeTax';
import { FORM_PLAIN } from '@/data/taxGlossary';
export function FormReferences({ numbers }: { numbers: string[] }) {
  return <div className="space-y-3">{numbers.map(number => {
    const form = FORM_BY_NUMBER[number];
    return form ? <div key={number} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <a href={form.downloadUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:underline"><FileText className="h-4 w-4" />BIR {number}<ExternalLink className="h-3 w-3" /><span className="sr-only"> official PDF, opens in new tab</span></a>
        <a href={`#/forms-library?form=${number}`} className="text-xs text-gray-600 underline">Eligibility & instructions</a>
      </div>
      <p className="mt-1 text-sm text-gray-700">{FORM_PLAIN[number]?.what ?? form.title}</p>
      <p className="mt-1 text-xs leading-relaxed text-gray-500">{FORM_PLAIN[number] ? `Who uses it: ${FORM_PLAIN[number].who}` : form.role}</p>
    </div> : null;
  })}</div>;
}
export function SourceLinks({ ids, sources = SOURCES }: { ids: string[]; sources?: Record<string, { label: string; url: string }> }) {
  return <div className="flex flex-wrap gap-x-4 gap-y-2">{[...new Set(ids)].map(id => {
    const source = sources[id];
    return source ? <a key={id} href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-700 underline">{source.label}</a> : null;
  })}</div>;
}
