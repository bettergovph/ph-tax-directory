const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = mkdtempSync(path.join(tmpdir(), 'ph-tax-faq-calc-'));
after(() => rmSync(output, { recursive: true, force: true }));
execFileSync(process.execPath, [
  path.join(root, 'node_modules/typescript/bin/tsc'),
  '--outDir', output, '--module', 'commonjs', '--target', 'ES2020', '--skipLibCheck', 'src/data/faqCalculators.ts', 'src/data/faqs.ts',
], { cwd: root });
const { FAQ_CALCULATORS, faqCalculators } = require(path.join(output, 'data/faqCalculators.js'));
const { FAQS } = require(path.join(output, 'data/faqs.js'));

test('every calculator link points at a calculator page', () => {
  for (const [id, { label, href }] of Object.entries(FAQ_CALCULATORS)) {
    assert.ok(label, id);
    assert.match(href, /^#\/tax-calculators\/(income|indirect)/, id);
  }
});

test('FAQs only name known calculators, and each tax topic links its own', () => {
  for (const faq of FAQS) for (const c of faqCalculators(faq)) assert.ok(FAQ_CALCULATORS[c], `${faq.id} names unknown calculator ${c}`);
  for (const topic of ['vat', 'percentage', 'excise', 'dst']) {
    const faqs = FAQS.filter(f => f.taxType === topic);
    assert.ok(faqs.length > 0);
    for (const faq of faqs) assert.ok(faqCalculators(faq).includes(topic) || faq.calculators, `${faq.id} has no ${topic} link`);
  }
  assert.deepEqual(faqCalculators(FAQS.find(f => f.id === 'vat-vs-percentage-tax')), ['vat', 'percentage']);
  assert.deepEqual(faqCalculators(FAQS.find(f => f.id === 'dst-loan')), ['dst']);
  assert.deepEqual(faqCalculators(FAQS.find(f => f.id === 'what-is-tin')), []);
});

test('every FAQ related form exists in the forms library', () => {
  const src = require('node:fs').readFileSync(path.join(root, 'src/data/birForms.ts'), 'utf8');
  const forms = new Set([...src.matchAll(/"formNumber": "([^"]+)"/g)].map(m => m[1]));
  for (const faq of FAQS) {
    for (const form of faq.relatedForms ?? []) assert.ok(forms.has(form), `${faq.id}: unknown form ${form}`);
  }
});
