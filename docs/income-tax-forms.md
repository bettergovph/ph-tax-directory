# BIR income-tax forms, periods, and filing roles

**Reviewed October 18, 2026.** Companion to the [calculator design](tax-calculator-design.md). Form numbers below link directly to PDFs listed by BIR. These are references, not filing submissions or a statement that every user must file each form.

Statutory dates below are baseline rules. Actual deadlines must consider filing channel, weekends/holidays and applicable BIR extensions. Old PDFs can retain superseded rates and procedures: source the calculation from the applicable current issuance, while retaining the form/version reference.

## Individual and fiduciary returns

| Official form | Intended route | Period and baseline deadline | Selection conditions |
| --- | --- | --- | --- |
| [1700][1700] | Personal compensation/non-business income return | Annual; April 15 following the calendar year | Establish whether self-filing is required; qualified substituted filers and other exempt filers are not automatically assigned a personal return. Link 2316 as supporting evidence. |
| [1701][1701] | Individual business, professional, mixed-income, estate or trust return | Annual; April 15 following the calendar year | General annual route, including relevant mixed/itemized/multiple-activity or multiple-regime cases. |
| [1701A][1701A] | Pure business/professional return under OSD or eligible elected 8% | Annual; April 15 following the calendar year | Exclude mixed income and itemized-deduction cases; test 8% eligibility separately. |
| [1701-MS][1701-MS] | Eligible registered micro/small individual or fiduciary business/mixed-income filer | Annual; April 15 following the calendar year | Test the actual form instructions, not size alone. Two or more activities or multiple regimes/rates route to 1701. [Official instructions][MS-guide]. |
| [1701Q][1701Q] | Applicable individual/fiduciary business income, including mixed filers' business component | Q1 May 15; Q2 August 15; Q3 November 15, in the same year | Cumulative business computation. Compensation is excluded from this return and reconciled annually. No Q4 1701Q. |

The newer MS route does not create a separate “1701-MS-Q” form. Its filing-channel support was updated by [RMC 37-2026](https://bir-cdn.bir.gov.ph/BIR/pdf/RMC%20No.%2037-2026%20Digest.pdf): eBIRForms 7.9.6 supports electronic 1701-MS filing. Do not keep the earlier “manual-only” assumption.

Micro/small status is not the same as eligibility for 8% tax or the small-corporation 20% rate. In the MS instructions, micro means gross sales below ₱3m and small means ₱3m to below ₱20m; use the taxpayer's applicable registered classification and full eligibility conditions. [MS instructions][MS-guide].

## Corporate and other non-individual returns

| Official form | Intended route | Period and baseline deadline | Selection conditions |
| --- | --- | --- | --- |
| [1702-RT][1702-RT] | Corporation/taxable partnership/entity with only regular income-tax treatment | Annual; 15th day of fourth month after taxable-year close | Ordinary RCIT/MCIT branch where applicable; calendar or fiscal year. |
| [1702-EX][1702-EX] | Legally exempt entity with no other taxable income, including applicable GPP information filing | Annual; 15th day of fourth month after taxable-year close | Proof and scope of exemption required. Exempt status alone does not prove all activities are exempt. |
| [1702-MX][1702-MX] | Non-individual with special/preferential treatment or multiple rates | Annual; 15th day of fourth month after taxable-year close | Separate regular, preferential and exempt activities. “Mixed” here is not the individual's compensation/business classification. |
| [1702Q][1702Q] | Applicable taxable corporate/entity quarterly income | First three taxable quarters; within 60 days after each quarter closes | Cumulative tax and applicable MCIT comparison. No Q4 1702Q. Do not apply to every entity indiscriminately: NRFC, GPP and other statutory exceptions require different treatment. |

For a June 30 taxable-year close, the nominal annual due date is October 15, subject to applicable adjustments. Quarterly periods follow that fiscal year; they are not necessarily March/June/September.

## Capital gains returns

| Official form | Intended route | Period and baseline deadline | Calculation linkage |
| --- | --- | --- | --- |
| [1706][1706] | Eligible transfer of Philippine real property classified as a capital asset, including qualifying exempt transactions | Within 30 days following sale/exchange/disposition; permitted installments have receipt-based schedules | Highest applicable consideration/FMVs, seller classification and exemption test. Ordinary assets do not use this CGT calculation. |
| [1707][1707] | Qualifying onerous disposal of unlisted domestic shares | Within 30 days following the transaction; permitted installments require their own schedule | Net gain after allowed basis/costs; transaction CGT. |
| [1707-A][1707-A] | Annual consolidation of covered unlisted-share gains and losses | Individuals: April 15 next year. Corporations: 15th day of fourth month after year close | Annual reconciliation deducts already paid transaction CGT. Not an additional tax on top of the full same gain. |

Current-law foreign-share cases must also be represented in the plan, but the reviewed 2021 forms describe domestic shares. Confirm current BIR filing mechanics before enabling that specific form-completion route; do not silently equate all foreign-share transactions to the legacy form description. [RR 21-2025](https://bir-cdn.bir.gov.ph/BIR/pdf/RR%20No.%2021-2025%20Digest.pdf).

## Withholding-agent returns and supporting certificates

These are distinct from the recipient's personal/corporate annual income-tax return. The UI must identify the **employer/payor/bank** as filer or issuer where relevant.

| Official form | Purpose / responsible party | Period and baseline deadline |
| --- | --- | --- |
| [1601-C][1601-C] | Employer's compensation-tax remittance | Monthly. Non-eFPS baseline: 10th of following month for January–November; December due January 15. eFPS follows group-specific rules. |
| [0619-E][0619-E] | Payor's expanded-withholding monthly remittance | First two months of each calendar quarter; non-eFPS baseline 10th following month; eFPS group rules apply. |
| [0619-F][0619-F] | Payor's final-withholding monthly remittance, where applicable | First two months of each calendar quarter; non-eFPS baseline 10th following month; eFPS group rules apply. |
| [1601-EQ][1601-EQ] | Payor's expanded-withholding quarter reconciliation | Calendar Q1–Q4; last day of the following month. Credit covered earlier remittances once. |
| [1601-FQ][1601-FQ] | Payor's covered final-tax quarter reconciliation, including relevant dividends/royalties/remittances | Calendar Q1–Q4; last day of following month. Select the actual payment category/ATC. |
| [1602Q][1602Q] | Covered bank/financial-institution withholding on deposit interest and similar yields | Quarterly; last day of following month. Do not substitute generic 1601-FQ. |
| [1603Q][1603Q] | Employer's covered final fringe-benefit tax | Quarterly; last day of following month. Requires a separate fringe-benefit eligibility/gross-up calculation. |
| [1606][1606] | Buyer's withholding on covered ordinary-asset real-property transfers | Baseline 10th after transaction month. Supports seller's applicable credit; not capital-asset 1706. |
| [2316][2316] | Employer-issued compensation/withholding evidence | Employee receives by January 31 next year, or last wage-payment date on termination. Certificate; employer's BIR submission is a separate obligation. |
| [2307][2307] | Payor-issued evidence of creditable income tax withheld | For expanded income withholding, within 20 days after quarter close; on request, with the income payment. Income-tax portion can support eligible return credits. |
| [2306][2306] | Payor-issued evidence of final tax withheld | Quarterly statement timing under RR 11-2018 Section 2.58(B); on request with payment. See source conflict below. Final tax is not a generic ordinary-income credit. |
| [1604-C][1604-C] | Employer's annual compensation-withholding information return | January 31 following the calendar year. Information return, not another annual income-tax charge. |
| [1604-F][1604-F] | Payor's annual final-withholding information return | January 31 following the calendar year. |
| [1604-E][1604-E] | Payor's annual expanded/exempt-payment information return | March 1 following the calendar year. |

The BIR remittance catalogue gives eFPS groups A/B/C/D/E as the 15th/14th/13th/12th/11th following month for the relevant monthly forms. Preserve filing and payment distinctions where an applicable issuance makes them different. A generic “10th or 15th” is insufficient.

**2306 source conflict:** the BIR Certificates catalogue still gives an annual January 31 issuance date, while the amended Section 2.58(B) in [RR 11-2018, page 21](https://bir-cdn.bir.gov.ph/local/pdf/Digest%20RR%2011-2018.pdf) specifies quarterly withholding statements within 20 days and expressly names both 2307 and 2306. The design records the regulatory quarterly rule and flags the catalogue discrepancy for confirmation before the production deadline resolver is enabled.

Specialized bank/decedent-account withholding and other special-law remittances need their own statutory review. Do not include estate/donor/transfer tax merely because a remittance form is adjacent to income-tax forms in the catalogue. Related-party/information attachments such as 1709 can be linked when applicable but do not define a separate income-tax rate.

## Corrections and additions to the supplied form list

1. Annual compensation is distinct from monthly payroll remittance. Employees do not choose quarterly 1701Q for salary alone.
2. 1701Q/1702Q cover the first three quarters; quarter calculations use cumulative bases and credits. The annual return reconciles the whole year.
3. 1702Q does not apply to every corporation/partnership without exception. NRFC and exempt/pass-through cases must be classified first.
4. 1701-MS is conditional on size and its activity/regime restrictions; it is not an unconditional replacement for 1701/1701A.
5. Add specialized 1602Q for deposit-interest withholding, 1603Q for fringe benefits, 0619-E/F monthly remittances, and 2306 for final-tax evidence.
6. 2316, 2307 and 2306 are certificates; 1604-C/F/E are annual information returns. Display their purpose and responsible party, not another liability.
7. 2307 for expanded income withholding is due within 20 days after quarter close, or with payment **on the payee's request**. Do not say payment-date issuance is compulsory in every case.
8. Capital-asset property CGT, ordinary-asset property withholding, and listed-share transaction tax must not share one calculation route.

## Evidence and remaining checks

Official catalogues were read in the live browser because their sections load dynamically:

- [BIR Income Tax](https://www.bir.gov.ph/income-tax)
- [BIR income-tax return catalogue](https://www.bir.gov.ph/bir-forms?tab=Income+Tax+Return)
- [BIR payment/remittance catalogue](https://www.bir.gov.ph/bir-forms?tab=Payment%2FRemittance+Forms)
- [BIR certificate catalogue](https://www.bir.gov.ph/bir-forms?tab=Certificates)

Individual form PDFs, current MS guidance and the major quarterly/CGT/withholding PDFs were also opened. Direct form references below are the links published in those catalogues. This is not a guarantee that an old PDF's printed rates or channel instructions remain current.

Before release, verify current ATCs and special-regime mappings, all deadline adjustments, each filing channel, foreign-share mechanics, and certificate timing conflicts. Treat missing evidence as a visible coverage gap rather than a default rate or form.

[1700]: https://bir-cdn.bir.gov.ph/local/pdf/1700%20Jan%202018%20ENCS%20v6.pdf
[1701]: https://bir-cdn.bir.gov.ph/local/pdf/1701%20Jan%202018%20final%20with%20rates.pdf
[1701A]: https://bir-cdn.bir.gov.ph/local/pdf/1701A%20Jan%202018%20v5%20with%20rates.pdf
[1701-MS]: https://bir-cdn.bir.gov.ph/BIR/pdf/1701-MS%20August%202024%20Fillable_01.pdf
[MS-guide]: https://bir-cdn.bir.gov.ph/BIR/pdf/1701-MS%20Guide%20August%202024%20ENCS_Final.pdf
[1701Q]: https://bir-cdn.bir.gov.ph/local/pdf/1701Q%20Jan%202018%20final%20rev2_copy.pdf
[1702-RT]: https://bir-cdn.bir.gov.ph/local/pdf/1702-RT%20Jan%202018%20ENCS%20Final%20v3.pdf
[1702-EX]: https://bir-cdn.bir.gov.ph/local/pdf/1702-EX%20Jan%202018%20ENCS%20v2.pdf
[1702-MX]: https://bir-cdn.bir.gov.ph/local/pdf/1702-MX%20Jan%202018%20ENCS%20Final%20with%20OSDv2.pdf
[1702Q]: https://bir-cdn.bir.gov.ph/local/pdf/1702Q%202018ENCS%20final2.pdf
[1706]: https://bir-cdn.bir.gov.ph/local/pdf/1706%20Jan%202018%20ENCS%20Final%20version.pdf
[1707]: https://bir-cdn.bir.gov.ph/local/pdf/1707%20April%202021%20ENCS.pdf
[1707-A]: https://bir-cdn.bir.gov.ph/local/pdf/1707-A%20April%202021%20ENCS.pdf
[1601-C]: https://bir-cdn.bir.gov.ph/local/pdf/1601C%20final%20Jan%202018%20with%20DPA.pdf
[0619-E]: https://bir-cdn.bir.gov.ph/local/pdf/0619-E%20Jan%202018%20rev%20final.pdf
[0619-F]: https://bir-cdn.bir.gov.ph/local/pdf/0619-F%20Jan%202018%20rev%20final.pdf
[1601-EQ]: https://bir-cdn.bir.gov.ph/local/pdf/1601-EQ%20January%202019%20ENCS%20final.pdf
[1601-FQ]: https://bir-cdn.bir.gov.ph/local/pdf/1601-FQ%202020%20final.pdf
[1602Q]: https://bir-cdn.bir.gov.ph/local/pdf/1602Q%20Jan%202019.pdf
[1603Q]: https://bir-cdn.bir.gov.ph/local/pdf/1603Q%20Jan%202018%20final.pdf
[1606]: https://bir-cdn.bir.gov.ph/local/pdf/1606%20Jan%202018%20ENCS%20Final%20version.pdf
[2306]: https://bir-cdn.bir.gov.ph/local/pdf/2306%20Jan%202018%20ENCS%20v4.pdf
[2307]: https://bir-cdn.bir.gov.ph/local/pdf/2307%20Jan%202018%20ENCS%20v3.pdf
[2316]: https://bir-cdn.bir.gov.ph/local/pdf/2316%20Sep%202021%20ENCS_Final_corrected.pdf
[1604-C]: https://bir-cdn.bir.gov.ph/local/pdf/1604-C%20Jan%202018%20Final.pdf
[1604-F]: https://bir-cdn.bir.gov.ph/local/pdf/1604-F%20Jan%202018%20Final%202.pdf
[1604-E]: https://bir-cdn.bir.gov.ph/local/pdf/1604E%20Jan%202018%20ENCS%20Final2.pdf
