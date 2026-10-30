// VAT topic data: sources, filing situations and the forms that go with them. Mirrors incomeTax.ts.
// Form numbers must exist in birForms.ts; tests/vat.test.cjs checks that.

export const VAT_REVIEWED_DATE = 'October 30, 2026';
export const VAT_SOURCES = {
  bir: { label: 'BIR · Value-Added Tax', url: 'https://www.bir.gov.ph/value-addedtax' },
  forms: { label: 'BIR · VAT and percentage tax forms', url: 'https://www.bir.gov.ph/bir-forms?tab=VAT%2FPercentage+Tax+Returns' },
  guide2550q: { label: '2550Q official guidelines', url: 'https://bir-cdn.bir.gov.ph/BIR/pdf/2550Q%20guidelines%20April%202024_final.pdf' },
  guide2551q: { label: '2551Q official guidelines', url: 'https://bir-cdn.bir.gov.ph/local/pdf/2551Q_%20Jan%202018%20Guide.pdf' },
  guide2550ds: { label: '2550-DS official guidelines · digital services', url: 'https://bir-cdn.bir.gov.ph/BIR/pdf/Final_2550-DS%20Guidelines_01.21.2025.pdf' },
  guide1600vt: { label: '1600-VT official guidelines', url: 'https://bir-cdn.bir.gov.ph/local/pdf/BIR%20Form%20No.%201600-VT%202018%20Guidelines.pdf' },
};

export interface VatSituation {
  id: string;
  title: string;
  who: string;
  forms: string[];
  deadline: string;
  note?: string;
  sources: (keyof typeof VAT_SOURCES)[];
}

export const VAT_SITUATIONS: VatSituation[] = [
  { id: 'vat-registered', title: 'I am VAT-registered and sell goods or services', who: 'Businesses registered as VAT taxpayers, or required to be.', forms: ['2550Q'], deadline: '25th day after the end of each taxable quarter', note: 'File even if there were no sales, until the VAT registration is cancelled.', sources: ['guide2550q', 'bir'] },
  { id: 'non-vat', title: 'I am not VAT-registered (sales of ₱3 million or less)', who: 'Small sellers who pay percentage tax instead of VAT.', forms: ['2551Q'], deadline: '25 days after the end of each taxable quarter', note: 'If you chose the 8% income tax option, it replaces percentage tax. See the Income Tax calculator.', sources: ['guide2551q', 'forms'] },
  { id: 'register', title: 'I am starting a business or my sales passed ₱3 million', who: 'New businesses, and sellers who need to become VAT-registered.', forms: ['1901', '1903', '1905'], deadline: 'Register before starting. Use 1905 to add or change tax types later.', note: '1901 is for individuals, estates and trusts. 1903 is for corporations, partnerships and cooperatives.', sources: ['forms'] },
  { id: 'withholding', title: 'I pay a supplier and must withhold VAT', who: 'Government offices paying private suppliers, and private payers paying non-residents who are subject to VAT.', forms: ['1600-VT', '1600-PT'], deadline: '10th day of the month after the month of withholding', note: '1600-VT is for VAT withheld. 1600-PT is for percentage tax withheld.', sources: ['guide1600vt', 'forms'] },
  { id: 'digital', title: 'I am a foreign provider of digital services to Philippine customers', who: 'Nonresident digital service providers.', forms: ['2550-DS'], deadline: 'See the official guidelines', sources: ['guide2550ds', 'bir'] },
  { id: 'special', title: 'I pay percentage tax on shares or under a special law', who: 'Stock brokers, issuers of shares, and taxpayers under special laws.', forms: ['2552', '2553'], deadline: '2552: within 5 banking days of collection or 30 days from listing. 2553: the due date in the special law.', sources: ['forms'] },
];
