const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = mkdtempSync(path.join(tmpdir(), 'ph-tax-indirect-'));
after(() => rmSync(output, { recursive: true, force: true }));
execFileSync(process.execPath, [
  path.join(root, 'node_modules/typescript/bin/tsc'),
  '--outDir', output, '--module', 'commonjs', '--target', 'ES2020', '--skipLibCheck',
  'src/utils/percentageTax.ts', 'src/utils/excise.ts', 'src/utils/dst.ts', 'src/data/birForms.ts', 'src/data/vat.ts',
], { cwd: root });
const pt = require(path.join(output, 'utils/percentageTax.js'));
const ex = require(path.join(output, 'utils/excise.js'));
const dst = require(path.join(output, 'utils/dst.js'));
const exciseData = require(path.join(output, 'data/excise.js'));
const ptData = require(path.join(output, 'data/percentageTax.js'));
const dstData = require(path.join(output, 'data/dst.js'));
const { FORM_BY_NUMBER } = require(path.join(output, 'data/birForms.js'));
const { VAT_SITUATIONS } = require(path.join(output, 'data/vat.js'));

const pesos = n => BigInt(Math.round(n * 100));

// ---------- percentage tax ----------
const percentage = (receipts, year, quarter, atc = 'PT 010', values = {}) => {
  const { errors, result } = pt.calculatePercentageTax({ year, quarter, lines: [{ atc, receipts }], values });
  assert.deepEqual(errors, {});
  return result;
};
test('percentage tax: 3% general rate', () => assert.equal(percentage('500000', 2026, 3).totalTaxDue, pesos(15000)));
test('percentage tax: CREATE 1% window runs from Q3 2020 to Q2 2023 and no further', () => {
  const tax = (y, q) => percentage('500000', y, q).totalTaxDue;
  assert.equal(tax(2020, 2), pesos(15000));
  assert.equal(tax(2020, 3), pesos(5000));
  assert.equal(tax(2022, 1), pesos(5000));
  assert.equal(tax(2023, 2), pesos(5000));
  assert.equal(tax(2023, 3), pesos(15000));
});
test('percentage tax: the 1% window applies to Sec. 116 only', () => {
  assert.equal(percentage('100000', 2021, 1, 'PT 060').totalTaxDue, pesos(2000));
  assert.equal(percentage('100000', 2021, 1, 'PT 103').totalTaxDue, pesos(7000));
});
test('percentage tax: zero rate, industry rates and half-up rounding', () => {
  assert.equal(percentage('100000', 2026, 1, 'PT 102').totalTaxDue, 0n);
  assert.equal(percentage('100000', 2026, 1, 'PT 150').totalTaxDue, pesos(18000));
  assert.equal(percentage('0.50', 2026, 1).totalTaxDue, 2n); // 1.5 centavos rounds up
});
test('percentage tax: credits, penalties and the total payable', () => {
  const r = percentage('500000', 2026, 3, 'PT 010', { creditableWithheld: '2000', previousPaid: '500', otherCredits: '100', surcharge: '100', interest: '50', compromise: '25' });
  assert.equal(r.lines.find(l => l.item === '18').amount, pesos(2600));
  assert.equal(r.lines.find(l => l.item === '19').amount, pesos(12400));
  assert.equal(r.totalAmountPayable, pesos(12400 + 175));
});
test('percentage tax: overpayment and several lines', () => {
  assert.equal(percentage('10000', 2026, 1, 'PT 010', { creditableWithheld: '1000' }).overpayment, pesos(700));
  const { result } = pt.calculatePercentageTax({ year: 2026, quarter: 1, lines: [{ atc: 'PT 010', receipts: '100000' }, { atc: 'PT 103', receipts: '100000' }], values: {} });
  assert.equal(result.totalTaxDue, pesos(3000 + 7000));
  assert.equal(result.totalReceipts, pesos(200000));
});
test('percentage tax: unknown business or bad amount is an error, not a result', () => {
  const bad = pt.calculatePercentageTax({ year: 2026, quarter: 1, lines: [{ atc: 'PT 999', receipts: '1' }, { atc: 'PT 010', receipts: '-5' }], values: { surcharge: '1.234' } });
  assert.equal(bad.result, undefined);
  assert.deepEqual(Object.keys(bad.errors).sort(), ['line-0', 'line-1', 'surcharge']);
});
test('percentage tax categories have unique codes and sane rates', () => {
  const atcs = ptData.PT_CATEGORIES.map(c => c.atc);
  assert.equal(new Set(atcs).size, atcs.length);
  for (const c of ptData.PT_CATEGORIES) assert.ok(c.bp >= 0n && c.bp <= 3000n, c.atc);
});

// ---------- excise ----------
const excise = (productId, year, quantity, netPrice = '', vehicle) => {
  const { errors, result } = ex.calculateExcise({ productId, year, quantity, netPrice, vehicle });
  assert.deepEqual(errors, {});
  return result;
};
test('excise: the yearly-increase rule reproduces BIR’s published figures', () => {
  const rate = (start, pct, year) => ex.exciseRate({ kind: 'table', byYear: { [start[0]]: BigInt(start[1]) }, lastYear: start[0], annualPct: BigInt(pct) }, year).centavos;
  assert.equal(rate([2022, 5618], 6, 2023), 5955n);  // wine 56.18 -> 59.55
  assert.equal(rate([2022, 5618], 6, 2024), 6312n);  // -> 63.12
  assert.equal(rate([2023, 3250], 5, 2024), 3413n);  // heated tobacco 32.50 -> 34.13
  assert.equal(rate([2023, 738], 5, 2024), 775n);    // cigars 7.38 -> 7.75
  assert.equal(rate([2023, 6000], 5, 2024), 6300n);  // cigarettes 60 -> 63
});
test('excise: years after BIR’s table are computed and flagged', () => {
  const spirits = exciseData.EXCISE_PRODUCTS.find(p => p.id === 'spirits').specific;
  assert.deepEqual(ex.exciseRate(spirits, 2024), { centavos: 6600n, computed: false });
  assert.deepEqual(ex.exciseRate(spirits, 2025), { centavos: 6996n, computed: true });
  assert.deepEqual(ex.exciseRate(spirits, 2026), { centavos: 7416n, computed: true });
  const cigarettes = exciseData.EXCISE_PRODUCTS.find(p => p.id === 'cigarettes').specific;
  assert.equal(ex.exciseRate(cigarettes, 2026).centavos, 6946n);
  assert.equal(excise('cigarettes', 2026, '1').computedRate, true);
  assert.equal(excise('cigarettes', 2024, '1').computedRate, false);
});
test('excise: published-year specific rates', () => {
  assert.equal(excise('cigarettes', 2024, '1000').total, pesos(63000));
  assert.equal(excise('wine', 2024, '100').total, pesos(6312));
  assert.equal(excise('beer', 2022, '1000').total, pesos(39000));
  assert.equal(excise('heated', 2024, '10').total, pesos(341.3));
});
test('excise: spirits pay specific and ad valorem together', () => {
  const r = excise('spirits', 2024, '100', '200');
  assert.deepEqual(r.lines.map(l => l.amount), [pesos(6600), pesos(4400)]);
  assert.equal(r.total, pesos(11000));
});
test('excise: cigars pay 20% ad valorem plus a specific amount per stick', () => {
  const r = excise('cigars', 2024, '100', '50');
  assert.equal(r.total, pesos(775) + pesos(1000));
});
test('excise: petroleum, sweetened beverages', () => {
  assert.equal(excise('gasoline', 2026, '1000').total, pesos(10000));
  assert.equal(excise('diesel', 2026, '1000').total, pesos(6000));
  assert.equal(excise('lpg', 2026, '11').total, pesos(33));
  assert.equal(excise('ssb', 2026, '500').total, pesos(3000));
  assert.equal(excise('ssb-hfcs', 2026, '500').total, pesos(6000));
  assert.equal(excise('ssb-exempt', 2026, '500').total, 0n);
});
test('excise: automobiles use the rate of the price bracket on the whole price', () => {
  const car = (price, vehicle) => excise('auto', 2026, '1', price, vehicle).total;
  assert.equal(car('500000'), pesos(20000));
  assert.equal(car('600000'), pesos(24000));      // up to ₱600,000 is 4%
  assert.equal(car('600000.01'), pesos(60000));   // just above is 10%
  assert.equal(car('1200000'), pesos(240000));
  assert.equal(car('4000000'), pesos(800000));
  assert.equal(car('4000000.01'), 200000001n); // 2,000,000.005 rounds half up
  assert.equal(car('1200000', 'hybrid'), pesos(120000));
  assert.equal(car('1200000', 'exempt'), 0n);
  assert.equal(excise('auto', 2026, '2', '500000').total, pesos(40000));
});
test('excise: bad input is an error', () => {
  assert.ok(ex.calculateExcise({ productId: 'spirits', year: 2019, quantity: '1', netPrice: '1' }).errors.year);
  assert.ok(ex.calculateExcise({ productId: 'spirits', year: 2024, quantity: '-1', netPrice: '1' }).errors.quantity);
  assert.ok(ex.calculateExcise({ productId: 'spirits', year: 2024, quantity: '1', netPrice: '1.234' }).errors.netPrice);
  assert.ok(ex.calculateExcise({ productId: 'nope', year: 2024, quantity: '1', netPrice: '1' }).errors.productId);
});
test('excise: every product has a unit and a known return form', () => {
  const forms = new Set(exciseData.EXCISE_GROUPS.map(g => g.form));
  for (const p of exciseData.EXCISE_PRODUCTS) {
    assert.ok(p.unit && p.label, p.id);
    assert.ok(exciseData.EXCISE_GROUPS.some(g => g.id === p.group), p.id);
    assert.ok(p.exempt || p.specific || p.adValoremBp, p.id);
  }
  for (const form of forms) assert.ok(FORM_BY_NUMBER[form], `form ${form} missing from birForms.ts`);
});

// ---------- documentary stamp tax ----------
const stamp = (instrument, values, date = '2026-03-15') => {
  const { errors, result } = dst.calculateDst({ instrument, date, values });
  assert.deepEqual(errors, {});
  return result;
};
test('DST: loans are 75% of 1%, prorated by days under a year', () => {
  assert.equal(stamp('loan', { amount: '1000000' }).total, pesos(7500));
  assert.equal(stamp('loan', { amount: '1000000', term: 'days', days: '90' }).total, pesos(1849.32));
  assert.ok(dst.calculateDst({ instrument: 'loan', date: '2026-03-15', values: { amount: '1000000', term: 'days', days: '365' } }).errors.days); // a full year is taxed in full
});
test('DST: a loan with its security pays one tax, the higher of the two, or the mortgage rate if in one document', () => {
  assert.equal(stamp('loan', { amount: '1000000', security: 'separate' }).total, pesos(7500));
  assert.equal(stamp('loan', { amount: '1000000', security: 'single' }).total, pesos(4020));
});
test('DST: loans and share issues before July 1, 2025 are out of range', () => {
  assert.ok(dst.calculateDst({ instrument: 'loan', date: '2025-06-30', values: { amount: '1000' } }).errors.date);
  assert.ok(!dst.calculateDst({ instrument: 'loan', date: '2025-07-01', values: { amount: '1000' } }).errors.date);
  assert.ok(dst.calculateDst({ instrument: 'shares-issue', date: '2025-06-30', values: { base: '1000' } }).errors.date);
  assert.ok(!dst.calculateDst({ instrument: 'mortgage', date: '2020-01-01', values: { amount: '1000' } }).errors.date);
});
test('DST: mortgages are ₱40 on the first ₱5,000, then ₱20 per ₱5,000 or part', () => {
  assert.equal(stamp('mortgage', { amount: '5000' }).total, pesos(40));
  assert.equal(stamp('mortgage', { amount: '5000.01' }).total, pesos(60));
  assert.equal(stamp('mortgage', { amount: '1000000' }).total, pesos(4020));
  assert.equal(stamp('mortgage', { amount: '0' }).total, 0n);
});
test('DST: deeds of sale are ₱15 per ₱1,000 or part, on the higher of price and fair market value', () => {
  assert.equal(stamp('real-property', { price: '2000000', fmv: '2500000' }).total, pesos(37500));
  assert.equal(stamp('real-property', { price: '2000000', fmv: '2500000', government: 'yes' }).total, pesos(30000));
  assert.equal(stamp('real-property', { price: '1000.01', fmv: '0' }).total, pesos(30));
  assert.equal(stamp('real-property', { price: '3000000', fmv: '2000000' }).form, '2000-OT');
});
test('DST: leases are counted for each year of the term', () => {
  assert.equal(stamp('lease', { rent: '120000', years: '5' }).total, pesos(1210));
  assert.equal(stamp('lease', { rent: '2000', years: '1' }).total, pesos(6));
  assert.equal(stamp('lease', { rent: '2000.01', years: '1' }).total, pesos(8));
});
test('DST: shares', () => {
  assert.equal(stamp('shares-issue', { base: '1000000' }, '2025-07-01').total, pesos(7500));
  assert.equal(stamp('shares-transfer', { par: 'yes', parValue: '100000' }).total, pesos(750));
  assert.equal(stamp('shares-transfer', { par: 'yes', parValue: '100001' }).total, pesos(751.5));
  assert.equal(stamp('shares-transfer', { par: 'no', original: '7500' }).total, pesos(3750));
});
test('DST: insurance', () => {
  const life = amt => stamp('life-insurance', { insured: amt }).total;
  assert.equal(life('100000'), 0n);
  assert.equal(life('100000.01'), pesos(20));
  assert.equal(life('300000'), pesos(20));
  assert.equal(life('300000.01'), pesos(50));
  assert.equal(life('750000'), pesos(100));
  assert.equal(life('1000000'), pesos(150));
  assert.equal(life('1000000.01'), pesos(200));
  assert.equal(stamp('property-insurance', { premium: '10000' }).total, pesos(1250));
  assert.equal(stamp('property-insurance', { premium: '10.01' }).total, pesos(1.5));
});
test('DST: due date is the 5th of the month after the document month', () => {
  assert.equal(stamp('mortgage', { amount: '5000' }, '2026-03-15').dueDate.toDateString(), 'Sun Apr 05 2026');
  assert.equal(stamp('mortgage', { amount: '5000' }, '2026-12-20').dueDate.toDateString(), 'Tue Jan 05 2027');
});
test('DST: bad input is an error', () => {
  assert.ok(dst.calculateDst({ instrument: 'mortgage', date: 'soon', values: { amount: '1' } }).errors.date);
  assert.ok(dst.calculateDst({ instrument: 'mortgage', date: '2026-02-30', values: { amount: '1' } }).errors.date);
  assert.ok(dst.calculateDst({ instrument: 'lease', date: '2026-01-01', values: { rent: '1000', years: '0' } }).errors.years);
  assert.ok(dst.calculateDst({ instrument: 'loan', date: '2026-01-01', values: { amount: '1', term: 'days', days: '400' } }).errors.days);
  assert.ok(dst.calculateDst({ instrument: 'mortgage', date: '2026-01-01', values: { amount: '-1' } }).errors.amount);
});
test('DST: every instrument has fields, a known form, and is covered by a return', () => {
  for (const i of dstData.DST_INSTRUMENTS) {
    assert.ok(dst.DST_FIELDS[i.id].length, i.id);
    assert.ok(['2000', '2000-OT'].includes(i.form), i.id);
    assert.ok(FORM_BY_NUMBER[i.form], `form ${i.form} missing from birForms.ts`);
  }
});

// ---------- guides: every form and source named by any situation exists ----------
test('every form and source named in an indirect-tax guide resolves', () => {
  const guides = [
    [ptData.PT_SITUATIONS, ptData.PT_SOURCES], [exciseData.EXCISE_SITUATIONS, exciseData.EXCISE_SOURCES], [dstData.DST_SITUATIONS, dstData.DST_SOURCES],
  ];
  for (const [situations, sources] of guides) for (const s of situations) {
    for (const f of s.forms) assert.ok(FORM_BY_NUMBER[f], `${s.id}: form ${f} missing from birForms.ts`);
    for (const id of s.sources) assert.ok(sources[id], `${s.id}: source ${id} missing`);
    assert.ok(s.title && s.who && s.deadline, s.id);
  }
  assert.ok(VAT_SITUATIONS.length);
});
