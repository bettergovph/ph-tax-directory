import { useMemo, useState } from 'react';
import { Flame, RotateCcw } from 'lucide-react';
import { AUTO_TIERS, EXCISE_FIRST_YEAR, EXCISE_GROUPS, EXCISE_PRODUCTS, ExciseGroup } from '@/data/excise';
import { AUTO_ID, VehicleKind, calculateExcise, formatPesos } from '@/utils/excise';
import { FormReferences } from '@/components/TaxReferences';
import { CalcLayout, MoneyInput, NumberInput, ResultHeadline, ResultNotes, ResultRows, SelectField } from '@/components/calc/CalcParts';

const VEHICLES: { value: VehicleKind; label: string }[] = [
  { value: 'regular', label: 'Gasoline or diesel car' }, { value: 'hybrid', label: 'Hybrid (half the rate)' }, { value: 'exempt', label: 'Purely electric or pick-up (exempt)' },
];
const groupOptions = EXCISE_GROUPS.map(g => ({ value: g.id, label: g.label }));
const firstProduct = (group: ExciseGroup) => group === 'auto' ? AUTO_ID : EXCISE_PRODUCTS.find(p => p.group === group)!.id;

export default function ExciseTaxCalculator() {
  const thisYear = new Date().getFullYear();
  const [group, setGroup] = useState<ExciseGroup>('alcohol');
  const [productId, setProductId] = useState(firstProduct('alcohol'));
  const [year, setYear] = useState(thisYear);
  const [quantity, setQuantity] = useState('');
  const [netPrice, setNetPrice] = useState('');
  const [vehicle, setVehicle] = useState<VehicleKind>('regular');

  const isAuto = group === 'auto';
  const product = EXCISE_PRODUCTS.find(p => p.id === productId);
  const groupInfo = EXCISE_GROUPS.find(g => g.id === group)!;
  const productOptions = EXCISE_PRODUCTS.filter(p => p.group === group).map(p => ({ value: p.id, label: p.label }));
  const needsPrice = isAuto || Boolean(product?.adValoremBp);
  const unit = isAuto ? 'vehicle' : product?.unit ?? 'unit';
  const years = Array.from({ length: thisYear - EXCISE_FIRST_YEAR + 2 }, (_, i) => thisYear + 1 - i);
  const touched = quantity.trim() !== '' || netPrice.trim() !== '';
  const { errors, result } = useMemo(
    () => calculateExcise({ productId, year, quantity, netPrice: needsPrice ? netPrice : '', vehicle }),
    [productId, year, quantity, netPrice, vehicle, needsPrice],
  );
  const changeGroup = (next: string) => { setGroup(next as ExciseGroup); setProductId(firstProduct(next as ExciseGroup)); setQuantity(''); setNetPrice(''); };

  const inputs = <>
    <SelectField label="Kind of product" value={group} onChange={changeGroup} options={groupOptions} />
    {!isAuto && <SelectField label="Product" value={productId} onChange={setProductId} options={productOptions} />}
    {isAuto && <SelectField label="Type of vehicle" value={vehicle} onChange={v => setVehicle(v as VehicleKind)} options={VEHICLES} hint="Purely electric vehicles and pick-ups are exempt. Hybrids pay half the rate." />}
    <SelectField label="Year the goods are removed or sold" value={String(year)} onChange={v => setYear(Number(v))} options={years.map(y => ({ value: String(y), label: String(y) }))} error={errors.year} hint="Rates change each year for alcohol and tobacco." />
    <NumberInput label={isAuto ? 'Number of vehicles' : 'Quantity'} unit={unit} value={quantity} onChange={setQuantity} error={errors.quantity} placeholder="0" />
    {needsPrice && <MoneyInput label={isAuto ? 'Net manufacturer’s or importer’s selling price of one vehicle, without excise and VAT' : product?.priceLabel ?? 'Net price per unit'} value={netPrice} onChange={setNetPrice} error={errors.netPrice} />}
    {isAuto && <ul className="space-y-1 text-xs text-gray-600" aria-label="Rate by price bracket">{AUTO_TIERS.map(t => <li key={t.label}>{t.label}</li>)}</ul>}
    {product?.note && !isAuto && <p className="text-xs leading-relaxed text-gray-600">{product.note}</p>}
    <button type="button" onClick={() => { setQuantity(''); setNetPrice(''); }} disabled={!touched} className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 disabled:text-gray-400"><RotateCcw className="h-4 w-4" aria-hidden="true" />Clear amounts</button>
  </>;

  const resultPanel = Object.keys(errors).length > 0 ? <p className="text-sm text-red-700">Fix the highlighted fields to see the result.</p>
    : !touched || !result ? <p className="text-sm text-purple-800">Enter a quantity to see the excise tax.</p>
    : <>
      <ResultHeadline label={`Excise tax for ${result.year}`} value={formatPesos(result.total)} />
      <div className="mt-4"><ResultRows rows={[...result.lines.map((l, i) => ({ key: String(i), label: l.label, detail: l.detail, value: formatPesos(l.amount) })), ...(result.lines.length > 1 ? [{ key: 'total', label: 'Total excise tax', value: formatPesos(result.total), strong: true }] : [])]} /></div>
      <ResultNotes notes={result.notes} />
    </>;

  return <div className="space-y-4 sm:space-y-6">
    <CalcLayout title="Excise tax calculator" icon={<Flame className="h-5 w-5 sm:h-6 sm:w-6" />}
      intro="Work out the excise tax on alcohol, tobacco, petroleum, sweetened beverages or automobiles. Excise tax is a tax on certain goods, set per unit (specific tax), as a percentage of the net price (ad valorem tax), or both. The maker or importer pays it before the goods are sold or released."
      inputs={inputs} result={resultPanel}
      footnote="An estimate using BIR’s excise rate tables. Vapor products, mineral products, jewelry and cosmetic procedures are not covered. Check the latest BIR issuance before you file." />
    <div className="rounded-xl bg-white p-4 shadow-lg sm:p-6">
      <h2 className="mb-3 text-base font-semibold text-gray-900">File it with</h2>
      <FormReferences numbers={[groupInfo.form]} />
      <p className="mt-3 text-xs text-gray-500">Importing? Excise tax on imports is paid to the Bureau of Customs. See the <a href="#/tax-calculators/customs" className="text-blue-700 underline">Customs calculator</a>.</p>
    </div>
  </div>;
}
