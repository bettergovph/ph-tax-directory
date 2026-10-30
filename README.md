# Philippines Tax Directory

A comprehensive tax directory and calculator for the Philippines, featuring modern UI, multiple tax types, forms library, filing calendar, and more.

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ph-tax-calculator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Features

### 🧮 Tax Calculators
- **Income Tax Calculator**: Classification-dependent annual, cumulative quarterly and transaction calculations for individuals, entities and withholding agents. Includes credits, RCIT/MCIT, eligible 8% and approved incentive treatments, capital gains, selected final taxes, official BIR form links and statutory deadline references. No contribution or take-home-pay calculations.
- **VAT Calculator**: Calculate 12% VAT for both inclusive and exclusive amounts

### 📋 Tax Directory Sections
- **Taxpayer Categories**: Understanding different taxpayer types and their obligations
- **Forms Library**: Access to BIR forms and filing guides
- **Filing Calendar**: Tax deadlines and important reminders
- **Tax Rates & Tables**: Current tax rates and brackets
- **FAQs**: Frequently asked questions about Philippine taxation

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run lint` - Run ESLint to check code quality
- `npm test` - Run calculation, eligibility, period, form-routing and regression tests
- `npm run preview` - Preview production build locally

Review the [implementation notes](docs/implementation-review.md) for supported periods, verification and remaining specialist-case boundaries.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Disclaimer

This platform is intended for general informational and educational purposes only. It does not provide official tax, legal, or financial advice and should not be relied upon as a substitute for guidance from the Bureau of Internal Revenue (BIR) or a licensed professional. For advice specific to your situation, please consult the appropriate government agency or a qualified tax advisor.

## License

This project is part of [BetterGov.ph](https://www.bettergov.ph/)

## Related Links

- [Bureau of Internal Revenue (BIR)](https://www.bir.gov.ph/)
- [BetterGov.ph](https://www.bettergov.ph/)
- [SSS Official Website](https://www.sss.gov.ph/)
- [PhilHealth Official Website](https://www.philhealth.gov.ph/)
- [Pag-IBIG Fund Official Website](https://www.pagibigfund.gov.ph/)
