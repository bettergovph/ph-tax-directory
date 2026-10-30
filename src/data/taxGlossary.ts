// Plain-language explanations for the income tax calculator. Written for readers with no tax background:
// short sentences, everyday words, peso examples. Keep the technical wording in incomeTax.ts; this file explains it.

export interface GlossaryTerm {
  id: string;
  term: string;
  simple: string;
  example?: string;
  /** Phrases that point to this term in calculator text. Matched case-insensitively unless `exact`. */
  match: string[];
  exact?: boolean;
}

export const GLOSSARY: GlossaryTerm[] = [
  { id: 'bir', term: 'BIR', simple: 'The Bureau of Internal Revenue. It is the government office that collects income tax in the Philippines.', match: ['BIR'], exact: true },
    { id: 'tax-return', term: 'Tax return', simple: 'A BIR form where you write down how much you earned and work out how much tax you owe. "Filing" a return means handing it in to BIR.', match: ['tax return', 'income tax return', 'annual return'] },
  { id: 'taxable-income', term: 'Taxable income (tax base)', simple: 'The part of your income that tax is counted on. It is what is left after you take out the amounts the law lets you remove.', example: 'If you earned ₱500,000 and may subtract ₱100,000 of allowed costs, your taxable income is ₱400,000.', match: ['taxable income', 'taxable profit', 'tax base', 'taxable base', 'taxable business income', 'taxable company profit'] },
  { id: 'gross-income', term: 'Gross income', simple: 'All the money that came in before most costs are taken out. For a business, it is sales minus returns, discounts and the direct cost of what was sold.', example: 'You sold ₱100,000 of bread that cost ₱60,000 to make. Gross income is ₱40,000.', match: ['gross income'] },
  { id: 'gross-sales', term: 'Gross sales / receipts', simple: 'The total amount your customers paid you, before you take out any costs.', match: ['gross sales', 'gross receipts', 'net sales'] },
  { id: 'net-income', term: 'Net income / net loss', simple: 'What is left after taking out allowed expenses. If expenses are bigger than income, the result is a loss (a negative number).', match: ['net income', 'net loss', 'profit or loss'] },
  { id: 'deduction', term: 'Deduction', simple: 'An amount you are allowed to subtract from your income before tax is worked out. More deductions mean less income to tax.', match: ['deduction', 'deductions', 'deduct'] },
  { id: 'itemized', term: 'Itemized deductions', simple: 'Listing your real business costs one by one, such as rent, salaries and supplies, and subtracting them. You need receipts to prove them.', match: ['itemized'] },
  { id: 'osd', term: 'Optional standard deduction (OSD)', simple: 'Instead of listing every cost, you subtract a flat 40%. No receipts for costs are needed. Individuals take 40% of sales; companies and partnerships take 40% of gross income.', example: '₱1,000,000 of sales − 40% (₱400,000) = ₱600,000 to tax.', match: ['OSD', 'standard deduction', 'standard 40% deduction'] },
  { id: 'graduated', term: 'Graduated tax rates (tax brackets)', simple: 'The tax rate goes up in steps as income goes up. The first ₱250,000 a year is taxed 0%. Higher parts are taxed 15%, 20%, 25%, 30% and up to 35%. Each step’s rate only applies to the part of income inside that step.', example: 'On ₱400,000: the first ₱250,000 is 0%, the next ₱150,000 is 15%, so tax is ₱22,500.', match: ['graduated', 'bracket', 'brackets'] },
  { id: 'marginal', term: 'Marginal rate', simple: 'The rate charged on your last peso of income, which is the highest step you reached.', match: ['marginal rate'] },
  { id: 'effective', term: 'Effective rate', simple: 'Your total tax divided by your income. It is your average tax rate, and is usually lower than your marginal rate.', match: ['effective rate'] },
  { id: 'eight', term: '8% income tax option', simple: 'Self-employed people and professionals whose yearly sales are ₱3 million or less may choose a flat 8% tax instead of graduated rates. It is counted on sales above ₱250,000 and replaces percentage tax. You choose it at the start of the year.', example: 'Sales of ₱1,000,000: 8% × (₱1,000,000 − ₱250,000) = ₱60,000.', match: ['8%', 'elected 8%', '8% option'] },
  { id: 'compensation', term: 'Compensation income', simple: 'Money you get from an employer for working, such as salary, wages, overtime and taxable bonuses.', match: ['compensation income', 'compensation', 'employment income'] },
  { id: 'business', term: 'Business or professional income', simple: 'Money you earn working for yourself, such as from a store, freelancing, or a doctor’s or lawyer’s practice.', match: ['business income', 'business / profession', 'profession', 'self-employed'] },
  { id: 'mixed', term: 'Mixed income', simple: 'When a person has both a salary from an employer and income from their own business or profession in the same year.', match: ['mixed income'] },
  { id: 'thirteenth', term: '13th-month pay and bonuses', simple: 'Extra pay employers give, usually in December. Up to ₱90,000 a year of 13th-month pay and other bonuses together is tax-free.', example: 'Bonuses of ₱110,000: ₱90,000 is tax-free and ₱20,000 is taxed.', match: ['13th-month', '13th month', 'bonuses'] },
  { id: 'de-minimis', term: 'De minimis benefits', simple: 'Small perks from your employer that are tax-free up to BIR limits, such as rice, uniform, medical or laundry allowances.', match: ['de minimis'] },
  { id: 'contributions', term: 'Mandatory contributions', simple: 'Your share of SSS, PhilHealth and Pag-IBIG payments, and union dues, taken out of your pay. These are not taxed.', match: ['SSS', 'PhilHealth', 'Pag-IBIG', 'union dues'], exact: true },
  { id: 'mwe', term: 'Minimum wage earner', simple: 'A worker paid the legal minimum wage. Their minimum wage, and their holiday, overtime, night-shift and hazard pay, are tax-free.', match: ['minimum wage earner', 'minimum wage'] },
  { id: 'dependents', term: 'Dependents (personal exemptions)', simple: 'Before 2018, you could subtract ₱50,000 for yourself and ₱25,000 for each child. The TRAIN law removed these. Instead, everyone’s first ₱250,000 a year is taxed at 0%. Having children no longer lowers income tax.', match: ['dependents', 'dependent', 'personal exemption', 'personal exemptions'] },
  { id: 'nolco', term: 'Net operating loss carry-over (NOLCO)', simple: 'If your business lost money in a year, you can subtract that loss from taxable income in the next 3 years. It cannot be used with the 40% standard deduction or the 8% option.', example: 'You lost ₱100,000 last year and made ₱300,000 this year. You are taxed on ₱200,000.', match: ['NOLCO', 'net operating loss', 'business losses', 'unused losses'] },
  { id: 'withholding', term: 'Withholding tax', simple: 'Tax taken out of a payment before you receive it. The payer sends it to BIR for you. It is like paying part of your tax in advance.', example: 'Your salary is ₱30,000, but ₱1,500 is taken out for tax, so you receive ₱28,500.', match: ['withholding tax', 'withholding', 'withheld'] },
  { id: 'withholding-agent', term: 'Withholding agent', simple: 'The person or company that takes tax out of a payment and sends it to BIR. Employers, and businesses that pay suppliers or landlords, are common examples.', match: ['withholding agent', 'payor', 'payer'] },
  { id: 'creditable', term: 'Creditable withholding tax', simple: 'Tax taken out in advance that you can subtract later from the tax on your own return. Form 2307 (or 2316 for employees) proves it was taken out.', match: ['creditable', 'expanded withholding'] },
  { id: 'final-tax', term: 'Final tax', simple: 'Tax taken out of certain income that fully settles the tax on it. You do not report that income again on your return. Bank interest is a common example.', match: ['final tax', 'final withholding', 'final-tax'] },
  { id: 'credit', term: 'Tax credit', simple: 'Tax you have already paid, or had taken out, that you subtract from the tax you owe.', match: ['tax credit', 'credits', 'credit'] },
  { id: 'liability', term: 'Tax due (tax liability)', simple: 'The total tax you owe for the period, before you subtract what you already paid.', match: ['liability', 'tax due'] },
  { id: 'balance', term: 'Balance payable', simple: 'What you still need to pay after subtracting your tax credits from the tax due.', match: ['balance payable', 'balance'] },
  { id: 'excess', term: 'Excess credits (overpayment)', simple: 'You already paid more than you owe. You can usually use the extra next time, or ask BIR for a refund, but a refund is not automatic.', match: ['excess credits', 'overpayment'] },
  { id: 'carry', term: 'Carry forward (carryover)', simple: 'Using an unused amount from an earlier year to lower this year’s tax.', match: ['carry forward', 'carryover', 'carry-over'] },
  { id: 'rcit', term: 'Regular corporate income tax (RCIT)', simple: 'The normal company tax: 25% of taxable income. Smaller Philippine companies may pay 20% if taxable income is ₱5 million or less and assets (not counting land) are ₱100 million or less.', match: ['RCIT', 'normal company tax', 'company tax', 'corporate income'] },
  { id: 'mcit', term: 'Minimum corporate income tax (MCIT)', simple: 'A minimum tax for companies so that a company showing a tiny profit still pays something. Starting in its 4th year, a company pays whichever is higher: normal company tax or 2% of gross income.', match: ['MCIT', 'minimum company tax', 'minimum corporate'] },
  { id: 'year', term: 'Calendar year / fiscal year', simple: 'A calendar year runs from January to December. A fiscal year is any other 12 months, such as July to June. Companies may choose a fiscal year.', match: ['calendar year', 'fiscal year', 'fiscal', 'tax year', 'taxable year', 'taxable-year'] },
  { id: 'quarter', term: 'Quarter (cumulative)', simple: 'A quarter is 3 months. Cumulative means you add everything from the start of the year up to now.', example: 'For the 2nd quarter, enter January to June totals, not just April to June.', match: ['quarter', 'quarterly', 'cumulative', 'Q1', 'Q2', 'Q3', 'Q4'] },
  { id: 'remittance', term: 'Remittance', simple: 'Sending tax money you collected or withheld to BIR.', match: ['remittance', 'remittances', 'remit', 'remitted'] },
  { id: 'deadline', term: 'Deadline (statutory deadline)', simple: 'The last day the law gives you to file and pay. Filing or paying late can mean paying extra as a penalty.', match: ['deadline', 'statutory'] },
  { id: 'amended', term: 'Amended return', simple: 'A corrected version of a tax return you already filed.', match: ['amended', 'correcting'] },
  { id: 'capital-gains', term: 'Capital gains tax', simple: 'Tax when you sell certain property you did not use for business. For land or a house, it is 6% of the highest of the selling price, zonal value or assessor’s value. For shares not sold on the stock exchange, it is 15% of the profit.', match: ['capital gains', 'capital-gains', 'CGT'] },
  { id: 'capital-asset', term: 'Capital asset', simple: 'Property you own for personal use or as an investment, not for your business. Your family home, or a lot you are keeping, are examples.', match: ['capital asset', 'capital assets'] },
  { id: 'zonal', term: 'Zonal value', simple: 'The value per square metre that BIR sets for land in a certain area.', match: ['zonal value', 'zonal'] },
  { id: 'assessor', term: 'Assessor’s fair market value', simple: 'The value of a property set by the city or municipal assessor’s office.', match: ['assessor', 'fair market value'] },
  { id: 'shares', term: 'Shares (unlisted)', simple: 'Shares are pieces of ownership in a company. Unlisted shares are not bought and sold on the Philippine Stock Exchange.', match: ['shares', 'unlisted'] },
  { id: 'passive', term: 'Passive income', simple: 'Money that comes in without you working for it, such as bank interest, dividends, royalties and prizes.', match: ['passive income', 'passive'] },
  { id: 'interest', term: 'Interest', simple: 'Money a bank or borrower pays you for using your money.', match: ['interest'] },
  { id: 'dividend', term: 'Dividend', simple: 'A share of a company’s profit paid to its owners (shareholders).', match: ['dividend', 'dividends'] },
  { id: 'royalty', term: 'Royalty', simple: 'Payment for letting someone use your creation or property, such as a book, song, invention or brand name.', match: ['royalty', 'royalties'] },
  { id: 'fringe', term: 'Fringe benefit', simple: 'Extra perks an employer gives managers and supervisors besides salary, such as a car or housing. The employer pays the tax on these, not the employee.', match: ['fringe benefit', 'fringe benefits', 'fringe-benefit', 'fringe'] },
  { id: 'gross-up', term: 'Grossed-up value', simple: 'The benefit’s value made bigger so the tax is counted as part of it. For a 35% tax, divide the value by 65%.', example: '₱65,000 car allowance ÷ 65% = ₱100,000 grossed-up value; 35% tax = ₱35,000.', match: ['grossed-up', 'gross-up', 'divisor'] },
  { id: 'rank-file', term: 'Rank-and-file employee', simple: 'A regular worker who is not a manager or supervisor.', match: ['rank and file', 'rank-and-file'] },
  { id: 'substituted', term: 'Substituted filing', simple: 'If you only had one employer for the whole year and the right tax was taken out of your pay, your employer’s Form 2316 counts as your return. You do not need to file Form 1700 yourself.', match: ['substituted filing', 'substituted'] },
  { id: 'resident', term: 'Resident / non-resident', simple: 'A resident lives in the Philippines. A non-resident lives abroad. Where you live affects which income the Philippines can tax.', match: ['resident', 'non-resident', 'nonresident'] },
  { id: 'nranetb', term: 'Non-resident alien not engaged in business (NRANETB)', simple: 'A foreigner who does not live in the Philippines and does not do business here. They usually pay a flat 25% on the whole amount of Philippine income, with no deductions.', match: ['NRANETB', 'non-resident alien', 'alien'] },
  { id: 'ofw', term: 'OFW', simple: 'Overseas Filipino worker. A Filipino working abroad. Their income earned abroad is not taxed in the Philippines.', match: ['OFW'], exact: true },
  { id: 'worldwide', term: 'Worldwide vs Philippine-source income', simple: 'Worldwide income is everything earned anywhere in the world. Philippine-source income is only what was earned from the Philippines. Filipino residents and Philippine companies are taxed on worldwide income; most others only on Philippine-source income.', match: ['worldwide', 'Philippine-source', 'foreign-source', 'foreign sources', 'Philippine sources', 'income-source'] },
  { id: 'gross-basis', term: 'Gross-basis tax', simple: 'Tax on the whole payment, with no costs subtracted first.', match: ['gross-basis', 'gross basis'] },
  { id: 'corporation', term: 'Corporation (company)', simple: 'A business registered as its own “legal person”, separate from its owners. A domestic corporation is set up under Philippine law. A resident foreign corporation is a foreign company doing business here, like a branch. A non-resident foreign corporation is a foreign company that does not do business here but earns income from here.', match: ['corporation', 'corporations', 'domestic corporation', 'foreign corporation', 'foreign corporate'] },
  { id: 'partnership', term: 'Partnership', simple: 'A business owned by two or more partners who share profits. Most partnerships are taxed like companies.', match: ['partnership', 'partnerships'] },
  { id: 'gpp', term: 'General professional partnership (GPP)', simple: 'A partnership of professionals in the same field, such as lawyers, doctors or accountants, formed only to practice that profession. The partnership itself pays no income tax. Each partner pays tax on their share.', match: ['GPP', 'general professional partnership', 'professional partnership', 'professional-partnership'] },
  { id: 'distributive', term: 'Distributive share', simple: 'Each partner’s portion of the partnership’s net income, based on their agreement.', match: ['distributive share', 'distributive shares', 'partners’ shares'] },
  { id: 'cooperative', term: 'Cooperative', simple: 'A group registered with the Cooperative Development Authority (CDA) that its members own and run together, for example a credit or farmers’ cooperative.', match: ['cooperative', 'cooperatives', 'CDA'] },
  { id: 'exempt', term: 'Tax-exempt', simple: 'Not required to pay tax on certain income because a law says so. An exempt group may still need to file a return.', match: ['exempt', 'exemption', 'exemptions', 'tax-free', 'tax relief'] },
  { id: 'nonprofit', term: 'Nonprofit organization', simple: 'A group with no owners that does not keep its profits for anyone, such as a charity, church or foundation.', match: ['nonprofit', 'non-profit', 'nonstock'] },
  { id: 'gocc', term: 'GOCC', simple: 'A government-owned or -controlled corporation, such as a state-run bank or utility.', match: ['GOCC', 'instrumentality'] },
  { id: 'estate', term: 'Estate', simple: 'The money, property and debts left by someone who has died, while the family or courts are still settling them. Income tax on what the estate earns is different from estate tax.', match: ['estate', 'estates'] },
  { id: 'trust', term: 'Trust', simple: 'An arrangement where one person manages money or property for the benefit of someone else.', match: ['trust', 'trusts', 'beneficiaries', 'beneficiary'] },
  { id: 'fiduciary', term: 'Fiduciary', simple: 'The person trusted to handle an estate or trust for others, such as an executor or trustee. “Fiduciary income” is income earned by the estate or trust.', match: ['fiduciary'] },
  { id: 'incentive', term: 'Tax incentive', simple: 'A lower tax that a government agency such as PEZA or BOI approves for a business, to encourage investment. It only covers the approved activity and dates.', match: ['incentive', 'incentives', 'registered activity', 'registered-activity', 'approved activity', 'tax scheme', 'IPA', 'PEZA', 'BOI'] },
  { id: 'ith', term: 'Income tax holiday (ITH)', simple: 'An approved period when a business pays 0% income tax on its covered activity.', match: ['ITH', 'income tax holiday'] },
  { id: 'scit', term: 'Special corporate income tax (SCIT)', simple: 'An approved incentive where a company pays 5% of its gross income earned instead of normal company tax.', match: ['SCIT', '5% company tax'] },
  { id: 'edr', term: 'Enhanced deductions regime (EDR)', simple: 'An approved incentive where a company pays 20% instead of 25%, and may subtract extra costs (like power or training) more than once.', match: ['EDR', 'enhanced deductions'] },
  { id: 'treaty', term: 'Tax treaty', simple: 'An agreement between the Philippines and another country so the same income is not taxed twice. It can lower the tax rate.', match: ['treaty', 'treaties', 'tax agreement'] },
  { id: 'atc', term: 'ATC (alphanumeric tax code)', simple: 'A short code written on BIR forms that tells BIR what kind of income or tax a payment is.', match: ['ATC'], exact: true },
  { id: 'efps', term: 'eFPS', simple: 'BIR’s Electronic Filing and Payment System, a website some taxpayers must use to file and pay online.', match: ['eFPS'], exact: true },
  { id: 'vat', term: 'VAT (value-added tax)', simple: 'A 12% tax added to the price of goods and services. VAT-registered businesses collect it from customers and send it to BIR, after subtracting the VAT they paid on their own purchases.', example: 'You sell an item for ₱1,000 before tax. The customer pays ₱1,120, and ₱120 of that is VAT.', match: ['VAT', 'value-added tax', 'value added tax'], exact: false },
  { id: 'percentage-tax', term: 'Percentage tax', simple: 'A tax on the sales of businesses that are not VAT-registered, usually small ones with sales of ₱3 million a year or less. It is 3% of gross sales. It is not added on top of VAT. Taxpayers who choose the 8% income tax option do not pay it.', example: 'Quarterly sales of ₱200,000 × 3% = ₱6,000 percentage tax.', match: ['percentage tax', 'percentage taxes'] },
  { id: 'output-vat', term: 'Output VAT', simple: 'The VAT you charge your customers on your sales. You owe it to BIR.', match: ['output VAT', 'output tax'] },
  { id: 'input-vat', term: 'Input VAT', simple: 'The VAT you paid on your own purchases for the business. A VAT-registered business can usually subtract it from its output VAT.', example: 'Output VAT ₱12,000 − input VAT ₱5,000 = ₱7,000 VAT to pay.', match: ['input VAT', 'input tax', 'creditable input VAT'] },
  { id: 'vat-payable', term: 'VAT payable', simple: 'Output VAT minus input VAT for the quarter. If input VAT is bigger, the extra can usually be carried over to later quarters.', match: ['VAT payable', 'net VAT'] },
  { id: 'vatable', term: 'VATable sale', simple: 'A sale that carries the regular 12% VAT. Most sales of goods and services by VAT-registered businesses are VATable.', match: ['VATable', 'vatable sale', 'vatable sales'] },
  { id: 'zero-rated', term: 'Zero-rated sale', simple: 'A sale that is taxed at 0% VAT, such as many export sales. No VAT is charged to the buyer, but the seller can still claim the VAT paid on purchases, so it is still a VAT-registered activity.', match: ['zero-rated', 'zero rated'] },
  { id: 'vat-exempt', term: 'VAT-exempt sale', simple: 'A sale the law excludes from VAT. No VAT is charged, and the seller cannot claim input VAT on purchases used for it. Not the same as zero-rated.', match: ['VAT-exempt', 'VAT exempt', 'exempt sale', 'exempt sales'] },
  { id: 'vat-registered', term: 'VAT-registered', simple: 'A business registered with BIR as a VAT taxpayer. It must charge VAT, issue invoices showing it, and file the quarterly VAT return. A business whose sales pass ₱3 million in 12 months must register.', match: ['VAT-registered', 'VAT registered', 'VAT registration', 'VAT taxpayer'] },
  { id: 'vat-threshold', term: '₱3 million threshold', simple: 'The yearly sales limit for small sellers. Above ₱3 million of gross sales or receipts in any 12 months, you must register for VAT. At or below it, you can stay non-VAT and pay percentage tax or use the 8% option, or you may choose to register for VAT.', match: ['₱3 million', '₱3,000,000', 'P3,000,000'] },
  { id: 'vat-inclusive', term: 'VAT-inclusive / VAT-exclusive', simple: 'VAT-exclusive means the price has no VAT yet, so add 12%. VAT-inclusive means the price already contains the VAT, so divide by 1.12 to get the price before VAT.', example: '₱1,120 VAT-inclusive ÷ 1.12 = ₱1,000 before VAT, and ₱120 is VAT.', match: ['VAT-inclusive', 'VAT inclusive', 'VAT-exclusive', 'VAT exclusive'] },
  { id: 'invoice', term: 'Sales invoice', simple: 'The document a seller gives a buyer as proof of sale. For VAT, it shows the price, the VAT charged and the seller’s TIN. A buyer needs a proper invoice to claim input VAT.', match: ['sales invoice', 'invoice', 'invoices'] },
  { id: 'digital-services', term: 'Digital services', simple: 'Services delivered over the internet, such as online marketplaces, search engines, advertising platforms and digital goods. Foreign providers of these to Philippine customers charge 12% VAT.', match: ['digital services', 'digital service provider', 'digital service providers'] },
  { id: 'voluntary-vat', term: 'Voluntary VAT registration', simple: 'A small seller below the ₱3 million limit may choose to register for VAT, for example to claim input VAT. This choice generally has to be kept for a minimum period, so check with your Revenue District Office before opting in.', match: ['voluntary registration', 'voluntary VAT'] },
  { id: 'indirect-tax', term: 'Indirect tax', simple: 'A tax the seller or maker pays to BIR, but which is built into the price, so the buyer ends up paying it. VAT, percentage tax, excise tax and documentary stamp tax are indirect taxes. Income tax is a direct tax.', match: ['indirect tax', 'indirect taxes'] },
  { id: 'excise', term: 'Excise tax', simple: 'A tax on certain goods, such as alcohol, tobacco, fuel, sweetened drinks and cars. The maker or importer pays it before the goods are sold or released, and it is built into the price.', match: ['excise tax', 'excise taxes', 'excise'] },
  { id: 'specific-tax', term: 'Specific tax', simple: 'An excise tax set as a fixed peso amount for each unit, such as per liter, per pack or per stick, no matter what the price is.', example: '₱63 per pack of cigarettes × 1,000 packs = ₱63,000.', match: ['specific tax'] },
  { id: 'ad-valorem', term: 'Ad valorem tax', simple: 'A tax set as a percentage of the price or value of the goods. “Ad valorem” is Latin for “according to value”.', example: '20% of a ₱500 net price is ₱100.', match: ['ad valorem'] },
  { id: 'nrp', term: 'Net retail price (NRP)', simple: 'The retail price of an excisable product with the excise tax and the VAT taken out. Ad valorem excise tax on alcohol and cigars is worked out on this price.', match: ['net retail price', 'NRP'] },
  { id: 'proof-liter', term: 'Proof liter', simple: 'The unit used to measure the volume of distilled spirits by their alcohol strength, so that stronger liquor counts as more.', match: ['proof liter', 'proof liters'] },
  { id: 'dst', term: 'Documentary stamp tax (DST)', simple: 'A tax on the paper itself: loan agreements, deeds of sale, leases, mortgages, insurance policies and share transfers. It is due when the document is made, signed or transferred, and is paid on BIR Form 2000 or 2000-OT.', match: ['documentary stamp tax', 'documentary stamp', 'DST'] },
  { id: 'par-value', term: 'Par value', simple: 'The face value printed on a share of stock. DST on shares is counted on par value, not on the price someone pays for it.', match: ['par value'] },
  { id: 'laws', term: 'Tax Code, RR and RMC', simple: 'The Tax Code (NIRC) is the main tax law. Revenue Regulations (RR) are BIR rules that explain how to follow it. Revenue Memorandum Circulars (RMC) are BIR notices that clarify those rules.', match: ['Tax Code', 'NIRC', 'RR', 'RMC', 'RMO', 'TRAIN', 'CREATE', 'CMEPA'], exact: true },
  { id: 'information-return', term: 'Information return', simple: 'A form that reports information to BIR even when no tax is owed.', match: ['information return', 'information filing', 'information form'] },
  { id: 'reserves', term: 'Accumulated reserves and undivided net savings', simple: 'Money a cooperative has saved up over the years instead of giving it back to members.', match: ['reserves', 'undivided net savings'] },
];

/** Plain-language explanation of each BIR form, keyed by form number. */
export const FORM_PLAIN: Record<string, { what: string; who: string }> = {
  '1700': { what: 'The yearly income tax return for people who only earn a salary.', who: 'Employees who must file their own return, such as those with two or more employers in the year.' },
  '1701': { what: 'The yearly income tax return for people with their own business or profession, including those who also earn a salary.', who: 'Self-employed people, professionals, people with mixed income, and estates and trusts.' },
  '1701A': { what: 'A shorter yearly return for people with only business or professional income.', who: 'Self-employed people using the 8% option or the 40% standard deduction, with no salary income.' },
  '1701-MS': { what: 'A simpler yearly return for very small and small self-employed taxpayers.', who: 'Micro and small self-employed people who meet BIR’s conditions for this form.' },
  '1701Q': { what: 'The return self-employed people file every quarter to pay income tax during the year.', who: 'Self-employed people, professionals, and estates and trusts. Filed for the 1st, 2nd and 3rd quarters only.' },
  '1702-RT': { what: 'The yearly income tax return for companies paying the normal company tax rate.', who: 'Corporations and taxable partnerships.' },
  '1702-EX': { what: 'The yearly return for groups that do not owe income tax.', who: 'Tax-exempt groups with no taxable income, and general professional partnerships (GPPs).' },
  '1702-MX': { what: 'The yearly company return when some income is taxed at different rates, or some is exempt and some is not.', who: 'Companies with incentives, special rates, or a mix of exempt and taxable income.' },
  '1702Q': { what: 'The return companies file every quarter to pay income tax during the year.', who: 'Corporations and taxable partnerships. Filed for the 1st, 2nd and 3rd quarters only.' },
  '1706': { what: 'The return for paying capital gains tax when you sell land or a building that is a capital asset.', who: 'The seller of the property. Filed within 30 days of the sale.' },
  '1707': { what: 'The return for paying capital gains tax when you sell shares that are not on the stock exchange.', who: 'The seller of the shares. Filed within 30 days of each sale.' },
  '1707-A': { what: 'The yearly summary of all sales of unlisted shares, to fix the total gain or loss for the year.', who: 'People and companies that sold unlisted shares more than once in the year.' },
  '1601-C': { what: 'The monthly form an employer files to send the tax it took out of employees’ salaries to BIR.', who: 'Employers.' },
  '0619-E': { what: 'The monthly form for sending tax taken out of payments to suppliers, professionals or landlords to BIR.', who: 'Businesses that withhold tax on these payments. Used for the first two months of each quarter.' },
  '0619-F': { what: 'The monthly form for sending final tax withheld (for example on dividends or royalties) to BIR.', who: 'Payers who withhold final tax. Used for the first two months of each quarter.' },
  '1601-EQ': { what: 'The quarterly form for creditable tax taken out of payments to suppliers, professionals or landlords.', who: 'Businesses that withhold this tax.' },
  '1601-FQ': { what: 'The quarterly form for final tax withheld on payments such as dividends, royalties or payments to foreigners.', who: 'Payers who withhold final tax.' },
  '1602Q': { what: 'The quarterly form for final tax withheld on interest from bank deposits and similar savings.', who: 'Banks and others that pay interest.' },
  '1603Q': { what: 'The quarterly form for the tax an employer pays on fringe benefits given to managers and supervisors.', who: 'Employers that give fringe benefits.' },
  '1606': { what: 'The form a buyer uses to send tax withheld when buying land or a building that is used in business.', who: 'Buyers who must withhold tax on the purchase.' },
  '2316': { what: 'The certificate your employer gives you showing your pay for the year and the tax taken out.', who: 'Every employee gets one from their employer.' },
  '2307': { what: 'The certificate a payer gives you showing tax it took out of payments to you. You subtract it from your own tax later.', who: 'Suppliers, professionals and landlords who had tax taken out of their payments.' },
  '2306': { what: 'The certificate a payer gives you showing final tax it took out of a payment.', who: 'People and companies whose income had final tax taken out.' },
  '1604-C': { what: 'The yearly report an employer files listing employees’ pay and the tax taken out for the whole year.', who: 'Employers.' },
  '1604-F': { what: 'The yearly report listing final tax withheld, including on fringe benefits.', who: 'Payers who withheld final tax during the year.' },
  '1604-E': { what: 'The yearly report listing tax taken out of payments to suppliers, professionals and landlords, and payments that were tax-free.', who: 'Businesses that withhold creditable tax.' },
  '2200-A': { what: 'The return for excise tax on alcohol products: spirits, wine and beer.', who: 'Makers and producers of alcohol. Filed before the products leave the place of production.' },
  '2200-T': { what: 'The return for excise tax on tobacco, heated tobacco and vapor products, and the inspection fee.', who: 'Makers and producers of tobacco products.' },
  '2200-P': { what: 'The return for excise tax on fuel and other petroleum products.', who: 'Refiners, makers and blenders of petroleum products.' },
  '2200-AN': { what: 'The return for excise tax on cars, and on jewelry, perfume and yachts.', who: 'Makers and assemblers of automobiles and of these non-essential goods.' },
  '2200-S': { what: 'The return for excise tax on sweetened drinks, counted per liter.', who: 'Makers and producers of sweetened beverages.' },
  '2000': { what: 'The monthly return for documentary stamp tax, the tax on documents such as loans, leases, mortgages and insurance policies.', who: 'Whoever makes, signs, issues, accepts or transfers the document. Filed within 5 days after the end of the month.' },
  '2000-OT': { what: 'The return for documentary stamp tax on a one-time sale of land or a building, or a transfer of shares that are not on the stock exchange.', who: 'The seller or transferor. Filed within 5 days after the end of the month of the sale.' },
  '2550Q': { what: 'The quarterly return that shows the VAT you charged on sales and the VAT you can subtract, and the net VAT you must pay.', who: 'VAT-registered businesses. Filed every quarter, even when there were no sales.' },
  '2550-DS': { what: 'The VAT return for foreign companies that sell digital services, such as online platforms, to customers in the Philippines.', who: 'Nonresident digital service providers.' },
  '2551Q': { what: 'The quarterly return for percentage tax, which is a tax on sales for businesses that are not VAT-registered.', who: 'Small sellers with ₱3 million or less in yearly sales who are not VAT-registered, and some businesses taxed by law, such as banks and insurers.' },
  '2552': { what: 'The return for the percentage tax on sales of listed shares and on public offerings of shares.', who: 'Stock brokers and companies that sell shares to the public.' },
  '2553': { what: 'The return for percentage tax that a special law, not the Tax Code, imposes.', who: 'Taxpayers liable for percentage tax under a special law.' },
  '1600-VT': { what: 'The monthly form for sending VAT that was withheld from a payment to BIR.', who: 'Government offices that pay private suppliers, and private payers who pay VAT-subject non-residents.' },
  '1600-PT': { what: 'The monthly form for sending percentage tax that was withheld from a payment to BIR.', who: 'Government offices, and payers whose payees chose to have percentage tax withheld.' },
  '1901': { what: 'The form to register with BIR when you start working for yourself. You also choose your tax types here, such as VAT or percentage tax.', who: 'Self-employed people, professionals, mixed-income earners, estates and trusts.' },
  '1903': { what: 'The form a company registers with at BIR. You also choose its tax types here, such as VAT or percentage tax.', who: 'Corporations, partnerships, cooperatives and government bodies.' },
  '1905': { what: 'The form to change, correct or cancel your BIR registration, for example to add VAT as a tax type or to close a business.', who: 'Any registered taxpayer whose details changed.' },
};

export const PLAIN_TAXPAYER: Record<string, string> = {
  individual: 'A single person paying tax on their own income.',
  corporation: 'A business or group, such as a company, partnership or cooperative, paying tax as one unit.',
  fiduciary: 'Income earned by property left by someone who died (an estate), or managed for someone else (a trust).',
  withholding: 'You are paying other people, like employees or suppliers, and must take out tax and send it to BIR for them.',
};

export const PLAIN_CLASSIFICATION: Record<string, string> = {
  'resident-citizen': 'A Filipino living in the Philippines. Taxed on income from anywhere in the world.',
  'non-resident-citizen': 'A Filipino living and working abroad, such as an OFW. Only income from the Philippines is taxed here.',
  'resident-alien': 'A foreigner living in the Philippines. Only income from the Philippines is taxed here.',
  'nra-engaged': 'A foreigner who does not live here but does business or works here. Only income from the Philippines is taxed here.',
  'nra-not-engaged': 'A foreigner who does not live or do business here, but receives income from the Philippines. Usually taxed a flat 25% on the whole amount.',
  domestic: 'A company set up under Philippine law. Taxed on income from anywhere in the world.',
  'resident-foreign': 'A foreign company doing business in the Philippines, such as a branch. Taxed on its Philippine income.',
  'nonresident-foreign': 'A foreign company that does not do business here but earns income from the Philippines.',
  partnership: 'A business owned by partners, or a similar association. Taxed like a company.',
  gocc: 'A company owned or controlled by the government that is not exempt from income tax.',
  gpp: 'Professionals in the same field (such as lawyers or doctors) practicing together. The partnership pays no income tax; each partner pays on their share.',
  cooperative: 'A member-owned group registered with the CDA. Often exempt, but some income can be taxed.',
  'exempt-entity': 'A nonprofit group, such as a charity, church or foundation, that the law frees from income tax on its main work.',
  'special-entity': 'A business covered by its own special tax law. It needs expert help.',
  estate: 'Property left by someone who died, earning income while it is being settled.',
  trust: 'Money or property managed by one person for someone else, which earns income.',
  'complex-trust': 'A trust with special or exempt rules. It needs expert help.',
};

export const PLAIN_ROUTE: Record<string, string> = {
  compensation: 'You earn a salary from an employer.',
  ordinary: 'Other regular income that is not salary and not from a business.',
  business: 'You run a business or practice a profession, and pay tax at the step-by-step (graduated) rates.',
  business8: 'You run a business or practice a profession and chose the flat 8% tax on sales.',
  mixed: 'You earn a salary and also have a business, paying graduated rates on both.',
  mixed8: 'You earn a salary and also have a business, and chose 8% for the business part.',
  fiduciary: 'Income earned by an estate or trust.',
  corporate: 'A company’s normal income tax: 25% (or 20% for qualifying smaller companies) of taxable income.',
  ith: 'An approved incentive where covered business activity pays 0% income tax for a time.',
  scit: 'An approved incentive where the company pays 5% of gross income earned.',
  edr: 'An approved incentive with a 20% rate and extra deductions.',
  school: 'A private school or nonprofit hospital that may pay a lower 10% rate.',
  exempt: 'The group does not owe income tax. A GPP still works out its net income for the partners.',
  property: 'You sold land or a building you did not use for business.',
  shares: 'You sold shares in a company that are not traded on the stock exchange.',
  passive: 'Income like bank interest, dividends, royalties or prizes, where tax is usually already taken out.',
  nonresident: 'Income from the Philippines paid to a foreigner or foreign company that is not here.',
  payroll: 'You are an employer sending the tax taken out of your employees’ salaries to BIR.',
  expanded: 'You are a business sending the tax taken out of payments to suppliers, professionals or landlords to BIR.',
  final: 'You are sending final tax you took out of payments such as interest, dividends or royalties to BIR.',
  fringe: 'You are an employer paying tax on extra perks given to managers and supervisors.',
  specialist: 'A special case covered by its own law or a tax treaty. It needs expert help.',
};

export const PLAIN_PERIOD: Record<string, string> = {
  annual: 'The whole year.',
  q1: 'January to March (or the first 3 months of a fiscal year).',
  q2: 'Running total for the first 6 months.',
  q3: 'Running total for the first 9 months.',
  q4: 'The last 3 months of the year.',
  monthly: 'One month.',
  transaction: 'One sale or one payment.',
  projection: 'A guess of the year’s tax based on one month’s pay.',
};

const formTerms: GlossaryTerm[] = Object.entries(FORM_PLAIN).map(([number, plain]) => ({ id: `form-${number}`, term: `BIR Form ${number}`, simple: `${plain.what} ${plain.who}`, match: [number], exact: true }));
const ALL_TERMS = [...GLOSSARY, ...formTerms];
const lookup = new Map<string, GlossaryTerm>();
for (const term of ALL_TERMS) for (const phrase of term.match) lookup.set(term.exact ? phrase : phrase.toLowerCase(), term);
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const pattern = new RegExp([...new Set(ALL_TERMS.flatMap(t => t.match))].sort((a, b) => b.length - a.length).map(escape).join('|'), 'gi');
const wordChar = /[\p{L}\p{N}₱]/u;

export type TextPart = { text: string; term?: GlossaryTerm };
/** Split text into plain parts and glossary-term parts. Each term is marked once per text, at its first appearance. */
export function splitTerms(text: string, skip: Set<string> = new Set()): TextPart[] {
  const parts: TextPart[] = [];
  const seen = new Set(skip);
  let last = 0;
  pattern.lastIndex = 0;
  for (let m = pattern.exec(text); m; m = pattern.exec(text)) {
    const word = m[0];
    const before = text[m.index - 1] ?? '';
    const after = text[m.index + word.length] ?? '';
    const term = lookup.get(word) ?? lookup.get(word.toLowerCase());
    const bounded = !wordChar.test(before) && !wordChar.test(after) && after !== '-' && !(before === '-' && /^\d/.test(word));
    if (!term || !bounded || seen.has(term.id) || (term.exact && !term.match.includes(word))) { pattern.lastIndex = m.index + 1; continue; }
    seen.add(term.id);
    if (m.index > last) parts.push({ text: text.slice(last, m.index) });
    parts.push({ text: word, term });
    last = m.index + word.length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}
/** Glossary terms that appear in any of the given texts, in glossary order. */
export function termsIn(texts: string[]): GlossaryTerm[] {
  const found = new Set(texts.flatMap(text => splitTerms(text).flatMap(part => part.term ? [part.term.id] : [])));
  return ALL_TERMS.filter(term => found.has(term.id));
}
