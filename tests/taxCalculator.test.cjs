const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = mkdtempSync(path.join(tmpdir(), 'ph-tax-rules-'));
after(() => rmSync(output, { recursive: true, force: true }));
execFileSync(process.execPath, [
  path.join(root, 'node_modules/typescript/bin/tsc'),
  '--outDir', output, '--module', 'commonjs', '--target', 'ES2020', '--skipLibCheck',
  'src/utils/taxCalculator.ts', 'src/data/taxRules.ts', 'src/types/tax.ts',
], { cwd: root });
const { calculateIncomeTax, calculateTax, calculateVAT } = require(path.join(output, 'utils/taxCalculator.js'));
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-7, `${actual} should equal ${expected}`);

// Expected annual amounts from the BIR 2023-onward schedule, including each boundary.
for (const [income, expected] of [
  [0, 0], [250000, 0], [250000.01, 0.0015], [400000, 22500],
  [400001, 22500.2], [800000, 102500], [800001, 102500.25],
  [2000000, 402500], [2000001, 402500.3], [8000000, 2202500], [8000001, 2202500.35],
]) {
  test(`BIR annual tax for taxable income ${income}`, () => near(calculateIncomeTax(income), expected));
}

test('monthly taxable income projects the same annual tax as annual input', () => {
  assert.deepEqual(calculateTax(50000, 'monthly'), calculateTax(600000, 'annual'));
  near(calculateTax(600000).annualTax, 62500);
  near(calculateTax(600000).monthlyTaxEquivalent, 62500 / 12);
});

test('tax base is the supplied taxable income, with marginal and effective rates distinguished', () => {
  const result = calculateTax(600000);
  assert.equal(result.annualTaxableIncome, 600000);
  assert.equal(result.marginalRate, 0.2);
  near(result.effectiveRate, 62500 / 600000);
  near(result.baseTax + result.taxOnExcess, result.annualTax);
});

test('zero income has zero tax and a finite zero effective rate', () => {
  assert.equal(calculateTax(0).annualTax, 0);
  assert.equal(calculateTax(0).effectiveRate, 0);
});

test('invalid income cannot produce a tax estimate', () => {
  for (const value of [-1, NaN, Infinity, -Infinity]) {
    assert.throws(() => calculateTax(value), RangeError);
    assert.throws(() => calculateIncomeTax(value), RangeError);
  }
});

test('VAT calculations still work after removing the contribution rules', () => {
  near(calculateVAT(100, false).vatAmount, 12);
  near(calculateVAT(112, true).netAmount, 100);
});
