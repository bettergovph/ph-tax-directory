# Income-tax update: local review

Updated October 18, 2026. This is a local code change, not a production deployment.

## Review the four sections

- [Income Tax Calculator](http://localhost:5173/#/tax-calculators/income)
- [Taxpayer Categories](http://localhost:5173/#/taxpayer-categories)
- [Forms Library](http://localhost:5173/#/forms-library)
- [Tax Rates & Tables](http://localhost:5173/#/tax-rates)

The legacy compensation URL still opens the income-tax workflow.

## Delivered

- Shared classification, income-route, source and BIR-form references across the four sections.
- Individual resident/non-resident citizen and alien classifications; domestic/resident foreign/non-resident foreign entities; taxable partnerships/GOCCs; GPP/exempt entities; fiduciaries; and employer/payor roles.
- Annual compensation, separate monthly projections, cumulative Q1–Q3 business/corporate computations, corporate fiscal-year dates, transaction capital gains and quarter-only withholding reconciliation.
- Graduated, eligible elected 8%, individual OSD/itemized or precomputed tax bases, annual mixed-income consolidation, credits, prior cash payments and amendments.
- Corporate RCIT/MCIT comparison, domestic 20% eligibility gates, commencement-year logic, verified MCIT carryover input, approved ITH/SCIT/EDR calculations, and separate non-registered regular activity.
- School/nonprofit-hospital qualification and unrelated-business fallback, and precomputed fiduciary taxable bases.
- GPPs file 1702-EX at 0% but compute net income (itemized or 40% OSD) for partners' distributive shares (NIRC Sec. 26; 1702-EX ATC IC 021). Cooperatives and Sec. 30 exempt organizations are separate classifications; with taxable income (e.g. cooperative non-member income above the ₱10M reserve threshold) they use the regular corporate route and 1702-MX, because 1702-EX is only for entities with no other taxable income.
- Optional, collapsed-by-default input sections: employee gross-to-taxable pay (13th-month/bonuses up to ₱90,000, de minimis, SSS/PhilHealth/Pag-IBIG/union dues, minimum-wage-earner exempt pay), annual NOLCO for itemized business and corporate returns, and corporate 40% OSD on gross income. Statutory contributions are subtracted as tax-free pay; they are never calculated or shown as a tax. Dependents are not deductible (TRAIN removed personal and additional exemptions), and the app says so.
- Plain-language layer: "In simple words" explanations for every taxpayer type, classification, income type, period and BIR form; tappable glossary terms in help text, notes and breakdowns; and a "Tax words explained" panel (src/data/taxGlossary.ts).
- Qualifying real-property CGT, domestic unlisted-share transaction and annual gain/loss reconciliation, selected recipient-specific passive taxes, general non-resident gross-basis treatment, selected expanded withholding, actual payroll-tax remittance, and covered fringe-benefit gross-up.
- 26 BIR form PDFs with filing/issuing role, eligibility, deadline rule, related forms, official references and review date. The library supports search, filters and shareable form-detail URLs.
- Eight income-tax rate tables with correct bases, conditions, current example and linked form details. All social-contribution schedules were removed from this section.
- Whole-peso filing-line arithmetic uses BigInt and half-up rounding; eligibility cutoffs retain exact cents before filing-line rounding. The legacy continuous tax helper remains covered separately for VAT/compensation regression compatibility.

## Suggested review examples

1. Compensation: annual taxable income ₱600,000, 2316 withholding ₱60,000 → ₱62,500 liability and ₱2,500 balance.
2. Graduated business Q2: cumulative taxable income ₱600,000, earlier cash payments ₱20,000, cumulative 2307 credits ₱5,000 → ₱37,500 balance, form 1701Q.
3. Pure 8% business Q2: cumulative sales ₱700,000, valid non-VAT election, earlier cash payment ₱4,000 → ₱36,000 cumulative liability and ₱32,000 balance.
4. Regular domestic corporation Q2: taxable income ₱100,000, first taxable year 2022, MCIT gross income ₱2m, prior cash payment ₱10,000 → RCIT ₱25,000 versus MCIT ₱40,000; balance ₱30,000.
5. Annual unlisted shares: gains ₱200,000, permitted losses ₱50,000, transaction CGT paid ₱30,000 → ₱22,500 liability and ₱7,500 excess payment.
6. Search the Forms Library for `1701-MS`; inspect its restrictions and official PDF link.
7. Open Rates & Tables on mobile; the page should fit the viewport while wide tables scroll inside their own containers.

## Verification

Final automated run: **101 tests passed**, with build, TypeScript and lint passing. Browser console checks reported no errors.

- Automated tests cover bracket boundaries, whole-peso rounding, cumulative quarters, mixed-income separation, 8% gates, form eligibility, credits and amendments, fiscal dates, RCIT/MCIT, incentives, exemptions, capital gains, passive-income classifications, withholding, unsupported-case guards and registry consistency.
- Browser checks cover compensation, graduated and 8% quarterly results; corporate MCIT; conditional periods; classification-to-calculator links; form search/detail/PDF targets; contribution removal; and 390px mobile layouts.
- Run `npm test`, `npm run lint`, `npm run build`, and `npx tsc --noEmit -p tsconfig.app.json` to repeat code checks.

## Boundaries visible in the product

- Enabled tax years run from 2025 to the current calendar year, so the year list and deadlines update each year without code changes. Deadlines falling on a weekend move to the next working day; holidays are not checked. Final-tax computations use the enabled post-July-2025 treatment; historical/split periods and grandfathered instruments require review.
- Treaty/special exemptions, installment gain recognition, foreign-share filing mechanics, specialist statutory entities and complex fiduciary arrangements are represented but do not receive a generic numerical estimate.
- Incentive qualification, income allocation, fiduciary deductions, permitted capital losses and available MCIT carryovers must already be established where the input explicitly requires that confirmation. The app does not determine legal approval from a registration label.
- Corporate taxable bases are entered after allowable deductions; the app does not prepare a full tax reconciliation from accounting ledgers. Special foreign-tax credit limitations, spouse-joint filings, all possible withholding ATCs and every statutory relief are not modeled.
- Deadline displays are **statutory baselines** adjusted only for weekends, without holiday, extension or taxpayer-specific adjustments. The Form 2306 catalogue/regulation timing discrepancy is disclosed in its library entry.
- No return is submitted and no payment is initiated. An excess credit is not represented as an automatically approved cash refund.

The [design specification](tax-calculator-design.md) and [official forms reference](income-tax-forms.md) retain the underlying rationale and source links.
