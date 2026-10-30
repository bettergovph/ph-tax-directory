const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = mkdtempSync(path.join(tmpdir(), 'ph-tax-vat-'));
after(() => rmSync(output, { recursive: true, force: true }));
execFileSync(process.execPath, [
  path.join(root, 'node_modules/typescript/bin/tsc'),
  '--outDir', output, '--module', 'commonjs', '--target', 'ES2020', '--skipLibCheck',
  'src/data/birForms.ts', 'src/data/vat.ts', 'src/data/faqs.ts', 'src/data/taxGlossary.ts',
], { cwd: root });
const { FORM_BY_NUMBER, BIR_FORMS } = require(path.join(output, 'data/birForms.js'));
const { VAT_SITUATIONS, VAT_SOURCES } = require(path.join(output, 'data/vat.js'));
const { FAQS } = require(path.join(output, 'data/faqs.js'));
const { GLOSSARY, FORM_PLAIN, splitTerms } = require(path.join(output, 'data/taxGlossary.js'));

test('every form named by a VAT situation exists with an official PDF', () => {
  for (const form of VAT_SITUATIONS.flatMap(s => s.forms)) {
    assert.ok(FORM_BY_NUMBER[form], `BIR form ${form} is missing from birForms.ts`);
    assert.match(FORM_BY_NUMBER[form].downloadUrl, /^https:\/\/bir-cdn\.bir\.gov\.ph\//);
  }
});

test('every VAT situation source exists', () => {
  for (const id of VAT_SITUATIONS.flatMap(s => s.sources)) assert.ok(VAT_SOURCES[id], `source ${id} is missing`);
});

test('every form linked from a VAT FAQ resolves in the forms library', () => {
  for (const faq of FAQS.filter(f => f.taxType === 'vat')) for (const form of faq.relatedForms ?? []) assert.ok(FORM_BY_NUMBER[form], `FAQ ${faq.id} links to unknown form ${form}`);
});

test('every VAT form has plain-language copy and related forms that exist', () => {
  for (const form of BIR_FORMS.filter(f => f.category === 'vat')) assert.ok(FORM_PLAIN[form.formNumber], `${form.formNumber} has no FORM_PLAIN entry`);
  for (const form of BIR_FORMS) for (const rel of form.relatedForms ?? []) assert.ok(FORM_BY_NUMBER[rel], `${form.formNumber} relates to unknown form ${rel}`);
});

test('glossary ids are unique and VAT terms are recognised in text', () => {
  const ids = GLOSSARY.map(t => t.id);
  assert.equal(new Set(ids).size, ids.length);
  const found = splitTerms('Output VAT less input VAT on zero-rated and VAT-exempt sales').flatMap(p => p.term ? [p.term.id] : []);
  for (const id of ['output-vat', 'input-vat', 'zero-rated', 'vat-exempt']) assert.ok(found.includes(id), `${id} not matched`);
});

test('there are VAT FAQs with Filipino translations', () => {
  const vat = FAQS.filter(f => f.taxType === 'vat');
  assert.ok(vat.length >= 10);
  for (const faq of vat) assert.ok(faq.questionFil && faq.answerFil, `${faq.id} lacks a Filipino translation`);
});
