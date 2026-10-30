const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = mkdtempSync(path.join(tmpdir(), 'ph-tax-vat-return-'));
after(() => rmSync(output, { recursive: true, force: true }));
execFileSync(process.execPath, [
  path.join(root, 'node_modules/typescript/bin/tsc'),
  '--outDir', output, '--module', 'commonjs', '--target', 'ES2020', '--skipLibCheck', 'src/utils/vatReturn.ts',
], { cwd: root });
const { calculateVatReturn, parseAmount, vatDueDate, formatPesos, VAT_FIELDS } = require(path.join(output, 'vatReturn.js'));

const run = (values, options) => {
  const { errors, result } = calculateVatReturn(values, options);
  assert.deepEqual(errors, {});
  return result;
};
const line = (result, item) => result.lines.find(l => l.item === item).amount;

test('parseAmount reads pesos to the centavo and rejects anything else', () => {
  assert.deepEqual(parseAmount(''), { centavos: 0n });
  assert.deepEqual(parseAmount('1,234.5'), { centavos: 123450n });
  assert.deepEqual(parseAmount('₱ 10'), { centavos: 1000n });
  for (const bad of ['-5', '1.234', 'abc', '1e5', '1.2.3', 'Infinity']) assert.ok('error' in parseAmount(bad), bad);
  assert.ok('error' in parseAmount('1000000000000.01'));
});

test('simple quarter: output VAT, input VAT and net payable', () => {
  const r = run({ vatableSales: '1000000', domesticPurchases: '500000', carriedOver: '10000' });
  assert.equal(line(r, '31B'), 12000000n);      // 120,000.00
  assert.equal(line(r, '50B'), 6000000n);       // 60,000.00
  assert.equal(line(r, '51B'), 7000000n);       // 70,000.00
  assert.equal(r.netVatPayable, 5000000n);      // 50,000.00
  assert.equal(r.totalAmountPayable, 5000000n);
});

test('zero-rated and exempt sales add to total sales but carry no output VAT', () => {
  const r = run({ vatableSales: '100000', zeroRatedSales: '50000', exemptSales: '25000' });
  assert.equal(r.totalSales, 17500000n);
  assert.equal(r.outputVat, 1200000n);
});

test('VAT-inclusive sales are converted to the net amount first', () => {
  const r = run({ vatableSales: '112000' }, { salesIncludeVat: true });
  assert.equal(r.totalSales, 10000000n);
  assert.equal(r.outputVat, 1200000n);
});

test('output VAT rounds half up to the centavo', () => {
  assert.equal(run({ vatableSales: '0.04' }).outputVat, 0n);   // 0.0048 -> 0.00
  assert.equal(run({ vatableSales: '0.05' }).outputVat, 1n);   // 0.0060 -> 0.01
  assert.equal(run({ vatableSales: '10.41' }).outputVat, 125n); // 1.2492 -> 1.25
});

test('input tax uses 12% unless the user types the invoice amount', () => {
  const auto = run({ domesticPurchases: '1000' });
  assert.equal(auto.purchaseTax.domesticPurchases, 12000n);
  const typed = run({ domesticPurchases: '1000', domesticTax: '100' });
  assert.equal(typed.purchaseTax.domesticPurchases, 10000n);
  const zero = run({ domesticPurchases: '1000', domesticTax: '0' });
  assert.equal(zero.purchaseTax.domesticPurchases, 0n);
});

test('purchases with no input tax and exempt importations add nothing to input VAT', () => {
  const r = run({ noInputPurchases: '5000', exemptImportations: '7000' });
  assert.equal(line(r, '50B'), 0n);
  assert.equal(line(r, '50A'), 1200000n); // still counted as purchases on Item 50A
});

test('Schedule 2: exempt-sales share of shared input tax, plus direct input tax', () => {
  // 200,000 exempt of 1,000,000 total sales: 20% of 50,000 shared = 10,000, plus 5,000 direct = 15,000
  const r = run({ vatableSales: '800000', exemptSales: '200000', exemptSharedInput: '50000', exemptDirectInput: '5000', domesticPurchases: '1000000' });
  assert.equal(line(r, '53B'), 1500000n);
  assert.equal(line(r, '60B'), 12000000n - 1500000n); // 120,000 input - 15,000
  assert.equal(r.netVatPayable, 9600000n - 10500000n);  // 96,000 output - 105,000 input
  assert.equal(r.excessInput, 900000n);
});

test('no total sales means no ratable exempt share and no division by zero', () => {
  const r = run({ exemptSharedInput: '50000' });
  assert.equal(line(r, '53B'), 0n);
});

test('excess input tax is reported and not payable', () => {
  const r = run({ vatableSales: '10000', domesticPurchases: '100000' });
  assert.equal(r.netVatPayable, 120000n - 1200000n);
  assert.equal(r.excessInput, 1080000n);
  assert.ok(r.totalAmountPayable < 0n);
});

test('deductions follow Items 57 to 60, including Item 58 added per the form', () => {
  const r = run({
    vatableSales: '1000000', domesticPurchases: '500000',
    deferredForNext: '1000', refundClaimed: '2000', unpaidPayables: '3000', otherDeductions: '4000', settledUnpaid: '500',
  });
  assert.equal(line(r, '59B'), 1050000n); // 1000+2000+3000+4000 = 10,000 (57) + 500 (58) = 10,500
  assert.equal(line(r, '60B'), 6000000n - 1050000n);
});

test('Part II: credits, penalties and total payable', () => {
  const r = run({ vatableSales: '1000000', domesticPurchases: '500000', carriedOver: '10000', creditableWithheld: '5000', advanceVat: '1000', previousPaid: '200', otherCredits: '300', surcharge: '100', interest: '50', compromise: '25' });
  assert.equal(line(r, '20'), 650000n);
  assert.equal(line(r, '21'), 5000000n - 650000n);
  assert.equal(line(r, '25'), 17500n);
  assert.equal(r.totalAmountPayable, 4350000n + 17500n);
});

test('excess credits are flagged when credits exceed tax', () => {
  const r = run({ vatableSales: '10000', creditableWithheld: '5000' });
  assert.equal(r.totalAmountPayable, 120000n - 500000n);
  assert.equal(r.excessCredits, 380000n);
});

test('invalid fields return a message per field and no result', () => {
  const { errors, result } = calculateVatReturn({ vatableSales: '-1', domesticTax: '1.234', zeroRatedSales: '5' });
  assert.equal(result, undefined);
  assert.deepEqual(Object.keys(errors).sort(), ['domesticTax', 'vatableSales']);
});

test('exact at the ₱1 trillion limit, where plain floating point would lose centavos', () => {
  const r = run({ vatableSales: '1000000000000' });
  assert.equal(r.outputVat, 12000000000000n); // 12% of 100,000,000,000,000 centavos
  assert.equal(formatPesos(r.outputVat), '₱120,000,000,000.00');
});

test('blank form is all zero', () => {
  const r = run({});
  assert.equal(r.totalAmountPayable, 0n);
  assert.ok(r.lines.every(l => l.amount === 0n));
});

test('due date is the 25th day after the quarter closes', () => {
  const d = (y, q) => vatDueDate(y, q).toDateString();
  assert.equal(d(2026, 1), 'Sat Apr 25 2026');
  assert.equal(d(2026, 2), 'Sat Jul 25 2026');
  assert.equal(d(2026, 3), 'Sun Oct 25 2026');
  assert.equal(d(2026, 4), 'Mon Jan 25 2027');
});

test('every field has a unique key and a form item', () => {
  assert.equal(new Set(VAT_FIELDS.map(f => f.key)).size, VAT_FIELDS.length);
  for (const f of VAT_FIELDS) assert.ok(f.item && f.label);
});
