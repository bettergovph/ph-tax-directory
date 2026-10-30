const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { mkdtempSync, rmSync, readFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const output = mkdtempSync(path.join(tmpdir(),'income-tax-return-'));
after(()=>rmSync(output,{recursive:true,force:true}));
execFileSync(process.execPath,[path.join(root,'node_modules/typescript/bin/tsc'),'--outDir',output,'--module','commonjs','--target','ES2020','--skipLibCheck','src/utils/incomeTaxCalculator.ts','src/utils/incomeTaxPeriods.ts','src/data/taxGlossary.ts','src/data/birForms.ts','src/data/taxRates.ts'],{cwd:root});
const {calculateIncomeTaxReturn:calc, filingPeso, graduatedFilingTax}=require(path.join(output,'utils/incomeTaxCalculator.js'));
const {returnForms,mcitApplies,deadlineInfo}=require(path.join(output,'utils/incomeTaxPeriods.js'));
const {GLOSSARY,FORM_PLAIN,PLAIN_CLASSIFICATION,PLAIN_ROUTE,PLAIN_TAXPAYER,PLAIN_PERIOD,splitTerms,termsIn}=require(path.join(output,'data/taxGlossary.js'));
const {INCOME_ROUTES,CLASSIFICATIONS,TAXPAYER_KINDS,PERIOD_LABELS,taxYears,currentTaxYear,availableRoutes,allowedPeriods,periodLabel}=require(path.join(output,'data/incomeTax.js'));
const {incomeFields}=require(path.join(output,'utils/incomeTaxFields.js'));
const {BIR_FORMS,FORM_BY_NUMBER}=require(path.join(output,'data/birForms.js'));
const {TAX_RATES}=require(path.join(output,'data/taxRates.js'));
const input=(overrides={},values={})=>({taxpayer:'individual',classification:'resident-citizen',route:'compensation',period:'annual',year:2026,fiscalMonth:12,month:1,...overrides,values:{...values}});
const ok=(i,tax,balance=tax)=>{const r=calc(i);assert.equal(r.status,'calculated',JSON.stringify(r));assert.equal(r.liability,tax);assert.equal(r.balance,balance);return r;};
const blocked=i=>{const r=calc(i);assert.notEqual(r.status,'calculated',JSON.stringify(r));assert.equal(r.liability,undefined);return r;};

for (const [base,tax] of [[0,0],[250000,0],[250001,0],[250004,1],[400000,22500],[400001,22500],[800000,102500],[800002,102501],[2000000,402500],[2000002,402501],[8000000,2202500],[8000002,2202501]]) {
  test(`whole-peso BIR graduated bracket at ${base}`,()=>assert.equal(graduatedFilingTax(BigInt(base)),BigInt(tax)));
}
test('decimal filing lines round half-up without binary-money arithmetic',()=>{
  assert.equal(filingPeso('100.49'),100n);assert.equal(filingPeso('100.50'),101n);assert.equal(filingPeso('-100.50'),-101n);
  for(const v of ['NaN','Infinity','1e8','1.234','1000000000001']) assert.throws(()=>filingPeso(v));
});
test('annual salary and credits reproduce the planned example',()=>{
  const r=ok(input({}, {compensation:'600000',withheld2316:'60000'}),62500,2500);
  assert.equal(r.statutoryDeadline,'2027-04-15');assert.deepEqual(r.forms,['1700','2316']);
});
test('monthly projection uses 12 months without applying an annual/4 formula',()=>{
  ok(input({period:'projection'},{compensation:'50000'}),62500);assert.equal(calc(input({period:'projection'},{compensation:'50000'})).statutoryDeadline,undefined);
});
test('quarterly graduated business uses cumulative income and cumulative credits',()=>{
  const r=ok(input({route:'business',period:'q2'},{businessTaxable:'600000',priorPayments:'20000',withheld2307:'5000'}),62500,37500);
  assert.equal(r.statutoryDeadline,'2026-08-15');assert.match(r.coveredPeriod,/2026-01-01 to 2026-06-30/);assert.equal(r.forms[0],'1701Q');
});
test('pure 8% Q1 and Q2 apply one cumulative reduction',()=>{
  ok(input({route:'business8',period:'q1'},{sales:'300000',eightElection:'true'}),4000);
  ok(input({route:'business8',period:'q2'},{sales:'700000',eightElection:'true',priorPayments:'4000'}),36000,32000);
});
test('mixed annual 8% receives no business reduction',()=>{
  ok(input({route:'mixed8'},{sales:'700000',compensation:'600000',eightElection:'true'}),118500);
});
test('mixed quarterly ignores stale compensation and its withholding',()=>{
  const r=ok(input({route:'mixed',period:'q3'},{businessTaxable:'600000',compensation:'900000',withheld2316:'99000'}),62500);
  assert.ok(!r.forms.includes('2316'));
});
test('mixed graduated annual combines ordinary income into one bracket calculation',()=>ok(input({route:'mixed'},{businessTaxable:'400000',compensation:'600000'}),152500));
test('individual OSD replaces costs/itemized deductions and uses sales',()=>{
  ok(input({route:'business'},{deductionMethod:'osd',sales:'1000000',otherIncome:'20000',costs:'800000',expenses:'100000'}),66500);
});
test('itemized business base deducts permitted costs and expenses once',()=>ok(input({route:'business'},{deductionMethod:'itemized',sales:'1000000',costs:'300000',expenses:'100000'}),62500));
test('8% gates VAT registration, election and annual threshold',()=>{
  for(const v of [{sales:'400000'},{sales:'400000',eightElection:'true',vatRegistered:'yes'},{sales:'3000001',eightElection:'true'}]) blocked(input({route:'business8'},v));
  ok(input({route:'business8'},{sales:'3000000',eightElection:'true'}),220000);
});
test('annual forms follow deduction method and MS eligibility',()=>{
  assert.equal(returnForms(input({route:'business'},{deductionMethod:'osd'}))[0],'1701A');
  assert.equal(returnForms(input({route:'business'},{deductionMethod:'itemized'}))[0],'1701');
  assert.equal(returnForms(input({route:'business'},{formChoice:'ms',registeredSize:'micro',multipleActivities:'no'}))[0],'1701-MS');
  assert.equal(returnForms(input({route:'business'},{formChoice:'ms',registeredSize:'micro',multipleActivities:'yes'}))[0],'1701');
  assert.equal(returnForms(input({route:'mixed8'},{formChoice:'ms',registeredSize:'small'}))[0],'1701');
});
test('substituted filing removes asserted personal deadline only when confirmed',()=>{
  const r=ok(input({}, {compensation:'600000',substituted:'true',employers:'one',withheld2316:'62500'}),62500,0);
  assert.deepEqual(r.forms,['2316']);assert.equal(r.statutoryDeadline,undefined);
  blocked(input({}, {compensation:'600000',substituted:'true',employers:'multiple'}));
});
test('explicit zero computes; missing and invalid amounts do not',()=>{
  ok(input({}, {compensation:'0'}),0);blocked(input());
  for(const v of ['-1','NaN','Infinity','1.234','1e20']) blocked(input({}, {compensation:v}));
  for(const year of [NaN,2024,2027]) blocked(input({year},{compensation:'1'}));
});
test('Q4 ordinary business/corporate is rejected; Q4 withholding remains valid',()=>{
  blocked(input({route:'business',period:'q4'},{businessTaxable:'100000'}));
  blocked(input({taxpayer:'corporation',classification:'domestic',route:'corporate',period:'q4'},{corporateIncome:'100000',mcitGross:'100000',commenced:'2022'}));
  const r=ok(input({taxpayer:'withholding',route:'payroll',period:'monthly',month:12},{taxWithheld:'1000'}),1000);
  assert.equal(r.statutoryDeadline,'2027-01-15');
});
const corp=(overrides={},values={})=>input({taxpayer:'corporation',classification:'domestic',route:'corporate',...overrides},{corporateIncome:'100000',mcitGross:'2000000',commenced:'2022',...values});
test('quarterly corporate compares RCIT against MCIT, not a sum',()=>ok(corp({period:'q2'},{priorPayments:'10000'}),40000,30000));
test('MCIT start is the fourth following taxable year, and still applies to a loss',()=>{
  assert.equal(mcitApplies(2023,2026),false);assert.equal(mcitApplies(2023,2027),true);
  ok(corp({}, {corporateIncome:'-100000',mcitGross:'1000000',commenced:'2023'}),0);
  ok(corp({}, {corporateIncome:'-100000',mcitGross:'1000000',commenced:'2022'}),20000);
});
test('small corporate rate requires both annual tests; foreign regular rate stays 25%',()=>{
  ok(corp({}, {corporateIncome:'5000000',mcitGross:'5000000',corporateTreatment:'small',assets:'100000000'}),1000000);
  ok(corp({}, {corporateIncome:'5000000',mcitGross:'5000000',corporateTreatment:'small',assets:'100000001'}),1250000);
  ok(corp({classification:'resident-foreign'},{corporateIncome:'1000000',mcitGross:'1000000',corporateTreatment:'small',assets:'1'}),250000);
});
test('quarterly 20% eligibility uses full-year projection without dividing annual threshold',()=>{
  ok(corp({period:'q1'},{corporateIncome:'1000000',mcitGross:'1000000',corporateTreatment:'small',assets:'1000000',annualIncome:'5000000'}),200000);
  ok(corp({period:'q1'},{corporateIncome:'1000000',mcitGross:'1000000',corporateTreatment:'small',assets:'1000000',annualIncome:'5000001'}),250000);
});
test('fiscal dates use the corporate year, including 60-day quarterly deadlines',()=>{
  const r=ok(corp({fiscalMonth:6},{corporateIncome:'1000000',mcitGross:'1000000'}),250000);
  assert.equal(r.coveredPeriod,'2025-07-01 to 2026-06-30');assert.equal(r.statutoryDeadline,'2026-10-15');
  const q=ok(corp({fiscalMonth:6,period:'q1'},{corporateIncome:'1000000',mcitGross:'1000000'}),250000);
  assert.equal(q.statutoryDeadline,'2025-11-29');
});
test('MCIT carryover needs confirmation and cannot be applied when MCIT controls',()=>{
  blocked(corp({}, {corporateIncome:'1000000',mcitGross:'1000000',excessMcit:'10000'}));
  ok(corp({}, {corporateIncome:'1000000',mcitGross:'1000000',excessMcit:'10000',mcitCreditConfirmed:'true'}),240000);
  ok(corp({}, {excessMcit:'10000',mcitCreditConfirmed:'true'}),40000);
});
for(const [route,tax] of [['ith',0],['scit',50000],['edr',200000]]) {
  test(`approved ${route} activity has its own base and rate`,()=>ok(corp({route},{registeredBase:'1000000',approvedRegime:'true'}),tax));
}
test('registered EDR and non-registered regular income are calculated separately',()=>{
  ok(corp({route:'edr'},{registeredBase:'1000000',approvedRegime:'true',otherActivity:'true',otherCorporateIncome:'100000',otherMcitGross:'100000',otherCommenced:'2022'}),225000);
  blocked(corp({route:'edr',year:2025,fiscalMonth:6},{registeredBase:'1000000',approvedRegime:'true'}));
});
test('institutional 10% and >50% unrelated fallback use distinct MCIT base',()=>{
  const base={institutionIncome:'1000000',totalGross:'2000000',unrelatedGross:'1000000',commenced:'2022',qualifiedInstitution:'true'};
  ok(corp({route:'school'},base),100000);
  ok(corp({route:'school'},{...base,unrelatedGross:'1000001',institutionMcitGross:'15000000'}),300000);
  blocked(corp({route:'school'},{...base,unrelatedGross:'1000001'}));
});
test('GPP files 1702-EX at 0% but computes net income for partners',()=>{
  const i=input({taxpayer:'corporation',classification:'gpp',route:'exempt'},{exemptConfirmed:'true',gppGross:'1000000',gppDeductions:'300000'});
  const r=ok(i,0);assert.equal(r.forms[0],'1702-EX');
  assert.equal(r.lines.find(l=>l.label.startsWith('Net income')).amount,700000);
  const osd=ok({...i,values:{exemptConfirmed:'true',gppGross:'1000000',gppDeductionMethod:'osd'}},0);
  assert.equal(osd.lines.find(l=>l.label.startsWith('Net income')).amount,600000);
  blocked({...i,values:{gppGross:'1000000'}});
  assert.deepEqual(availableRoutes('corporation','gpp').map(r=>r.id),['exempt','specialist']);
});
test('cooperatives and exempt organizations can compute tax on taxable income via 1702-MX',()=>{
  for (const classification of ['cooperative','exempt-entity']) {
    assert.ok(availableRoutes('corporation',classification).some(r=>r.id==='corporate'));
    const i=corp({classification},{corporateIncome:'1000000',commenced:'2024',taxableScopeConfirmed:'true'});
    const r=ok(i,250000);assert.equal(r.forms[0],'1702-MX');
    assert.equal(returnForms({...i,period:'q1'})[0],'1702Q');
    blocked({...i,values:{corporateIncome:'1000000',commenced:'2024'}});
    assert.ok(!incomeFields(i).some(f=>f.key==='corporateTreatment'));
    assert.equal(ok(input({taxpayer:'corporation',classification,route:'exempt'},{exemptConfirmed:'true'}),0).forms[0],'1702-EX');
  }
});
test('fiduciary income requires its already determined base to be confirmed',()=>{
  ok(input({taxpayer:'fiduciary',classification:'estate',route:'fiduciary'},{businessTaxable:'600000',fiduciaryBase:'true'}),62500);
  blocked(input({taxpayer:'fiduciary',classification:'trust',route:'fiduciary'},{businessTaxable:'600000'}));
});
test('property uses the highest valuation and a 30-day transaction deadline',()=>{
  const r=ok(input({route:'property',period:'transaction'},{transactionDate:'2026-01-31',sellingPrice:'3000000',zonalValue:'3500000',assessorValue:'3200000',capitalAsset:'true'}),210000);
  assert.equal(r.statutoryDeadline,'2026-03-02');assert.equal(r.forms[0],'1706');
});
test('property exemptions, ordinary assets and installments are not guessed',()=>{
  const v={transactionDate:'2026-01-01',sellingPrice:'1',zonalValue:'1',assessorValue:'1',capitalAsset:'true'};
  blocked(input({route:'property',period:'transaction'},{...v,propertyExemption:'exempt'}));
  blocked(input({route:'property',period:'transaction'},{...v,capitalAsset:'false'}));
  blocked(input({route:'property',period:'transaction'},{...v,installment:'true'}));
});
test('annual shares reconcile gains, losses and transaction payments',()=>{
  const r=ok(input({route:'shares'},{capitalGains:'200000',capitalLosses:'50000',cgtPaid:'30000',sharesCapital:'true'}),22500,-7500);
  assert.equal(r.forms[0],'1707-A');
});
test('transaction shares deduct basis, and losses do not generate negative tax',()=>{
  ok(input({route:'shares',period:'transaction'},{transactionDate:'2026-03-01',proceeds:'100000',basis:'20000',sharesCapital:'true'}),12000);
  ok(input({route:'shares',period:'transaction'},{transactionDate:'2026-03-01',proceeds:'100000',basis:'120000',sharesCapital:'true'}),0);
});
test('foreign issuer and treaty cases stop before assigning a generic result',()=>{
  blocked(input({route:'shares'},{issuer:'foreign',sharesCapital:'true',capitalGains:'1'}));
  blocked(input({route:'shares'},{treaty:'true',sharesCapital:'true',capitalGains:'1'}));
});
const passive=(classification,type='interest',extra={})=>input({classification,route:'passive',period:'transaction'},{transactionDate:'2026-06-01',passiveType:type,paymentBase:'100000',...extra});
for(const [classification,type,extra,tax] of [
  ['resident-citizen','interest',{},20000],['resident-citizen','dividend',{},10000],['nra-engaged','dividend',{},20000],['nra-not-engaged','dividend',{},25000],['resident-citizen','literary',{},10000],['nra-not-engaged','literary',{},25000],['non-resident-citizen','interest',{depositSystem:'expanded'},0],
]) test(`passive ${classification} ${type} ${JSON.stringify(extra)}`,()=>ok(passive(classification,type,extra),tax));
test('corporate intercorporate dividends and NRFC tax sparing are distinct',()=>{
  for(const [classification,extra,tax] of [['domestic',{},0],['resident-foreign',{},0],['nonresident-foreign',{},25000],['nonresident-foreign',{taxSparing:'true'},15000]]) ok({...passive(classification,'dividend',extra),taxpayer:'corporation'},tax);
});
test('small prizes are ordinary; covered small lotto can be exempt',()=>{
  blocked(passive('resident-citizen','prize',{paymentBase:'10000'}));
  ok(passive('resident-citizen','lotto',{paymentBase:'10000'}),0);
  ok(passive('resident-citizen','winnings',{paymentBase:'10000'}),2000);
});
test('branch remittance is only applied to a resident foreign branch',()=>{
  ok({...passive('resident-foreign','branch'),taxpayer:'corporation'},15000);
  blocked({...passive('domestic','branch'),taxpayer:'corporation'});
});
test('grandfathered instruments and historical final-tax periods require review',()=>{
  blocked(passive('resident-citizen','interest',{grandfathered:'true'}));
  blocked({...passive('resident-citizen'),year:2025,values:{transactionDate:'2025-01-01',paymentBase:'1'}});
  blocked(input({taxpayer:'withholding',route:'final',year:2025,period:'q2'},{paymentBase:'100000'}));
});
test('non-resident general gross treatment requires category confirmation',()=>{
  const i=input({classification:'nra-not-engaged',route:'nonresident',period:'transaction'},{transactionDate:'2026-01-01',paymentBase:'100000',generalNonresident:'true'});
  ok(i,25000);blocked({...i,values:{...i.values,generalNonresident:'false'}});
});
test('expanded withholding lower rates depend on recipient, threshold and declaration',()=>{
  const base={paymentBase:'100000',payeeAnnualGross:'1000000',withholdingObligation:'true'};
  const i=input({taxpayer:'withholding',route:'expanded',period:'q2'},base);
  ok(i,10000);ok({...i,values:{...base,lowerDeclaration:'true'}},5000);
  ok({...i,classification:'domestic',values:{...base,payeeAnnualGross:'700000',lowerDeclaration:'true'}},10000);
  ok({...i,classification:'domestic',values:{...base,payeeAnnualGross:'720001',lowerDeclaration:'true'}},15000);
});
test('expanded quarterly reconciliation is quarter-only and credits monthly remittances',()=>{
  const r=ok(input({taxpayer:'withholding',route:'expanded',period:'q4'},{expandedType:'goods',paymentBase:'1000000',priorRemittances:'6000',withholdingObligation:'true'}),10000,4000);
  assert.match(r.coveredPeriod,/2026-10-01 to 2026-12-31/);assert.equal(r.statutoryDeadline,'2027-01-31');assert.equal(r.forms[0],'1601-EQ');
  assert.equal(periodLabel('q2','withholding'),'Q2 · this quarter only');
});
test('0619 monthly forms reject the third month and use eFPS group schedules',()=>{
  const i=input({taxpayer:'withholding',route:'expanded',period:'monthly',month:2},{expandedType:'rent',paymentBase:'100000',withholdingObligation:'true',channel:'efps',efpsGroup:'B'});
  assert.equal(ok(i,5000).statutoryDeadline,'2026-03-14');assert.equal(calc(i).forms[0],'0619-E');
  blocked({...i,month:3});
});
test('final interest uses 1602Q; other covered final payments use 0619-F or 1601-FQ',()=>{
  const r=ok(input({taxpayer:'withholding',route:'final',period:'q3'},{passiveType:'interest',paymentBase:'100000',priorRemittances:'5000'}),20000,15000);
  assert.equal(r.forms[0],'1602Q');
  assert.equal(returnForms(input({taxpayer:'withholding',route:'final',period:'monthly'},{passiveType:'dividend'}))[0],'0619-F');
});
test('fringe-benefit tax uses the gross-up divisor for the recipient class',()=>{
  ok(input({taxpayer:'withholding',route:'fringe',period:'q1'},{benefitValue:'65000',taxableFringe:'true'}),35000);
  ok(input({taxpayer:'withholding',classification:'nra-not-engaged',route:'fringe',period:'q1'},{benefitValue:'75000',taxableFringe:'true'}),25000);
});
test('amended payments and negative balance are separate from deductions',()=>{
  const r=ok(input({}, {compensation:'600000',withheld2316:'60000',amended:'true',amendedPaid:'5000'}),62500,-2500);
  assert.ok(r.notes.some(n=>n.includes('automatic cash refund')));
  ok(input({}, {compensation:'600000',amendedPaid:'5000'}),62500);
});
test('all registered form references resolve to actual official PDFs',()=>{
  assert.equal(BIR_FORMS.length,43);assert.equal(new Set(BIR_FORMS.map(f=>f.formNumber)).size,43);
  for(const form of BIR_FORMS) {assert.match(form.downloadUrl,/^https:\/\/bir-cdn\.bir\.gov\.ph\/.+\.pdf$/);assert.ok(form.role);assert.ok(form.dueDate);for(const related of form.relatedForms||[]) assert.ok(FORM_BY_NUMBER[related]);}
  for(const route of INCOME_ROUTES) for(const number of route.forms) assert.ok(FORM_BY_NUMBER[number]);
  for(const table of TAX_RATES) for(const row of table.rows) for(const number of row.forms) assert.ok(FORM_BY_NUMBER[number]);
});
test('rates and forms have no social-contribution or obsolete IAET schedule',()=>{
  assert.doesNotMatch(JSON.stringify(TAX_RATES),/SSS|PhilHealth|Pag-IBIG|Contributions|1%.*school|foreign corporations \(30%\)/i);
  assert.ok(!FORM_BY_NUMBER['1704']);
  assert.doesNotMatch(readFileSync(path.join(root,'src/components/TaxRates.tsx'),'utf8'),/₱55,000|Contributions|SSS|PhilHealth|Pag-IBIG/);
});
test('all exposed classification/route combinations have valid period and field metadata',()=>{
  for(const [taxpayer,classes] of Object.entries(CLASSIFICATIONS)) for(const classification of classes) for(const route of availableRoutes(taxpayer,classification.value)) {
    const i=input({taxpayer,classification:classification.value,route:route.id});
    const periods=allowedPeriods(i);assert.ok(periods.length);i.period=periods[0];
    assert.equal(new Set(incomeFields(i).map(f=>f.key)).size,incomeFields(i).length);
    for(const form of returnForms(i)) assert.ok(FORM_BY_NUMBER[form]);
  }
});
test('specialist and invalid dates never produce a fabricated amount',()=>{
  assert.equal(blocked(input({route:'specialist'})).status,'needs-review');
  blocked(input({route:'shares',period:'transaction'},{transactionDate:'2026-02-30',proceeds:'1',basis:'0',sharesCapital:'true'}));
  blocked(input({classification:'invented'},{compensation:'1'}));
});

test('foreign-source passive income is not assigned Philippine final-tax rates',()=>{
  blocked(passive('resident-citizen','interest',{incomeSource:'foreign'}));
});
test('NRA graduated route cannot elect the resident individual OSD method',()=>{
  blocked(input({classification:'nra-engaged',route:'business'},{deductionMethod:'osd',sales:'1000000'}));
});
test('taxable domestic partnerships use corporate intercorporate dividend treatment',()=>{
  ok({...passive('partnership','dividend'),taxpayer:'corporation'},0);
});
test('quarterly lottery withholding cannot apply a threshold to an unclassified aggregate',()=>{
  blocked(input({taxpayer:'withholding',route:'final',period:'q1'},{passiveType:'lotto',paymentBase:'100000'}));
  ok(input({taxpayer:'withholding',route:'final',period:'q1'},{passiveType:'lotto',paymentBase:'100000',lottoPaymentsTaxable:'true'}),20000);
});

test('graduated results expose marginal and effective rates plus the bracket formula',()=>{
  const r=ok(input({}, {compensation:'600000'}),62500);
  assert.equal(r.marginalRate,.2);assert.equal(r.effectiveRate,62500/600000);
  assert.ok(r.lines.some(line=>line.detail?.includes('20% × (₱600,000 − ₱400,000)')));
});

test('unknown form query keys cannot resolve inherited object properties',()=>{
  assert.equal(FORM_BY_NUMBER['__proto__'],undefined);
  assert.equal(FORM_BY_NUMBER['constructor'],undefined);
});

test('negative cent values cannot bypass non-negative amount validation through rounding',()=>{
  blocked(input({}, {compensation:'-0.01'}));
  blocked(input({}, {compensation:'600000',withheld2316:'-0.49'}));
});
test('corporate eligibility checks use exact amounts before form-line rounding',()=>{
  ok(corp({}, {corporateIncome:'5000000.01',mcitGross:'5000000',corporateTreatment:'small',assets:'100000000'}),1250000);
  ok(corp({}, {corporateIncome:'5000000',mcitGross:'5000000',corporateTreatment:'small',assets:'100000000.01'}),1250000);
});
test('8% and prize cutoffs use exact cents rather than rounded filing amounts',()=>{
  blocked(input({route:'business8'},{sales:'3000000.01',eightElection:'true'}));
  ok(passive('resident-citizen','prize',{paymentBase:'10000.01'}),2000);
});

test('substituted filing cannot hide an inconsistent withholding balance',()=>{
  blocked(input({}, {compensation:'600000',substituted:'true',employers:'one',withheld2316:'60000'}));
  blocked(input({}, {compensation:'600000',substituted:'true',employers:'one'}));
});

test('every form, taxpayer, classification, income type and period has a plain explanation',()=>{
  for (const form of BIR_FORMS) assert.ok(FORM_PLAIN[form.formNumber]?.what && FORM_PLAIN[form.formNumber]?.who,form.formNumber);
  for (const kind of TAXPAYER_KINDS) assert.ok(PLAIN_TAXPAYER[kind.value],kind.value);
  for (const choice of Object.values(CLASSIFICATIONS).flat()) assert.ok(PLAIN_CLASSIFICATION[choice.value],choice.value);
  for (const route of INCOME_ROUTES) assert.ok(PLAIN_ROUTE[route.id],route.id);
  for (const period of Object.keys(PERIOD_LABELS)) assert.ok(PLAIN_PERIOD[period],period);
  assert.equal(new Set(GLOSSARY.map(t=>t.id)).size,GLOSSARY.length);
});
test('glossary marks whole words once and leaves look-alikes alone',()=>{
  const parts=splitTerms('Use the OSD or itemized deductions; OSD again. Attach Form 2307 and 1701Q, not 1701 2026.');
  const marked=parts.filter(p=>p.term).map(p=>p.text);
  assert.deepEqual(marked,['OSD','itemized','deductions','2307','1701Q','1701']);
  assert.equal(parts.map(p=>p.text).join(''),'Use the OSD or itemized deductions; OSD again. Attach Form 2307 and 1701Q, not 1701 2026.');
  assert.ok(!splitTerms('₱17010 and 12307').some(p=>p.term));
  assert.ok(termsIn(['Minimum company tax (MCIT)']).some(t=>t.id==='mcit'));
});
test('deadlines are readable and move off weekends',()=>{
  assert.deepEqual(deadlineInfo('2027-04-15'),{date:deadlineInfo('2027-04-15').date,iso:'2027-04-15',weekend:undefined});
  const sat=deadlineInfo('2028-04-15');
  assert.equal(sat.iso,'2028-04-17');assert.match(sat.weekend,/Saturday/);
  assert.equal(deadlineInfo('2029-04-15').iso,'2029-04-16');
});
test('tax years follow the current year',()=>{
  assert.deepEqual(taxYears(2028),[2028,2027,2026,2025]);
  assert.equal(taxYears()[0],currentTaxYear());
  const r=calc(input({year:currentTaxYear()},{compensation:'600000'}));
  assert.equal(r.statutoryDeadline,`${currentTaxYear()+1}-04-15`);
  assert.match(r.deadlineRule,new RegExp(`${currentTaxYear()} tax year`));
  blocked(input({year:currentTaxYear()+1},{compensation:'600000'}));
});
test('employee pay helper subtracts tax-free pay and replaces the taxable pay field',()=>{
  const i=input({}, {grossPay:'800000',bonuses:'110000',deMinimis:'10000',contributions:'40000'});
  assert.ok(!incomeFields(i).some(f=>f.key==='compensation'));
  assert.ok(incomeFields(i).filter(f=>f.section).every(f=>f.optional));
  const r=ok(i,Number(graduatedFilingTax(660000n)));
  assert.equal(r.lines.find(l=>l.label==='Taxable pay').amount,660000);
  assert.ok(r.notes.some(n=>n.includes('Dependents are not deductible')));
  blocked(input({}, {grossPay:'100000',contributions:'200000'}));
  assert.ok(incomeFields(input({})).some(f=>f.key==='compensation'));
  assert.ok(!incomeFields(input({period:'projection'})).some(f=>f.key==='grossPay'));
});
test('business NOLCO lowers taxable income only down to zero and not with OSD',()=>{
  const base={taxpayer:'individual',route:'business'};
  ok(input(base,{businessTaxable:'600000',nolco:'200000'}),Number(graduatedFilingTax(400000n)));
  const r=ok(input(base,{businessTaxable:'100000',nolco:'300000'}),0);
  assert.match(r.lines.find(l=>l.label.includes('NOLCO')).detail,/200,000 left/);
  assert.ok(!incomeFields(input(base,{deductionMethod:'osd'})).some(f=>f.key==='nolco'));
  assert.ok(!incomeFields(input({...base,route:'business8'})).some(f=>f.key==='nolco'));
  assert.ok(!incomeFields(input({...base,period:'q1'})).some(f=>f.key==='nolco'));
});
test('corporate OSD and NOLCO',()=>{
  const r=ok(corp({},{corpMethod:'osd',corpGross:'1000000',corporateIncome:'',mcitGross:'0',commenced:'2024'}),150000);
  assert.ok(!incomeFields(corp({},{corpMethod:'osd'})).some(f=>f.key==='corporateIncome'||f.key==='corpNolco'));
  assert.equal(r.lines.find(l=>l.label.startsWith('Optional standard')).amount,400000);
  ok(corp({},{corporateIncome:'1000000',corpNolco:'400000',commenced:'2024'}),150000);
});
