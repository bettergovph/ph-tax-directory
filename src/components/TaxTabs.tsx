export interface TaxTab { id: string; label: string; short?: string; hint?: string }

/** A segmented control for switching between the taxes inside a group. State lives in the caller, usually in the URL. */
export default function TaxTabs({ tabs, active, onChange, label }: { tabs: TaxTab[]; active: string; onChange: (id: string) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1 sm:grid-cols-4">
      {tabs.map(tab => (
        <button key={tab.id} type="button" onClick={() => onChange(tab.id)} aria-pressed={active === tab.id}
          className={`rounded-md px-3 py-2 text-sm font-medium ${active === tab.id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
          <span className="sm:hidden">{tab.short ?? tab.label}</span><span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
