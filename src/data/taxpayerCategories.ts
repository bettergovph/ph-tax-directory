import { CLASSIFICATIONS, TAXPAYER_KINDS } from './incomeTax';
import { TaxpayerKind } from '../types/incomeTax';
const descriptions:Record<TaxpayerKind,string> = {
  individual:'Citizenship and residence determine income-source scope. Then choose compensation, business, mixed income or investment income.',
  corporation:'Separate domestic and foreign entities, regular tax, approved incentives, legally exempt activities and pass-through arrangements.',
  fiduciary:'Income earned by an estate or trust is distinct from estate transfer tax. Taxable distributions, deductions and fiduciary elections must be established.',
  withholding:'Employers and payors remit other recipients’ income taxes. These remittances are separate from their own annual tax liability.',
};
export const TAXPAYER_CATEGORIES = TAXPAYER_KINDS.map(kind=>({id:kind.value as TaxpayerKind,name:kind.label,description:descriptions[kind.value as TaxpayerKind],classifications:CLASSIFICATIONS[kind.value as TaxpayerKind]}));
export const CLASSIFICATION_NOTES:Record<string,string> = {
  'resident-citizen':'Generally taxable on applicable Philippine and foreign-source income. Final-tax and exempt income remain separate from ordinary income.',
  'non-resident-citizen':'Generally taxable only on Philippine-source income. Establish non-resident / OFW status under the law; citizenship alone is not enough.',
  'resident-alien':'Generally Philippine-source income only. Determine the source of the services or income; a foreign payor alone does not establish foreign-source income.',
  'nra-engaged':'Philippine-source ordinary income generally follows the applicable graduated rules; final-income categories and deduction eligibility can differ.',
  'nra-not-engaged':'General Philippine-source gross-basis treatment differs from graduated tax. Capital gains, treaties and specific categories require separate rules.',
  domestic:'Domestic corporate income generally has worldwide scope. The 20% domestic rate needs both the annual income and qualifying-assets tests; MCIT uses a different base.',
  'resident-foreign':'Regular tax generally applies to Philippine-source taxable income. Branch remittance and passive final taxes are separate calculations.',
  'nonresident-foreign':'Philippine-source receipts generally use category-specific final withholding. Do not automatically assign regular corporate quarterly returns.',
  partnership:'Taxable partnerships and associations follow the applicable corporate treatment; a GPP is a different classification.',
  gocc:'Determine whether a statutory exemption or regular-tax treatment applies. Do not assume every government entity is exempt.',
  gpp:'An eligible general professional partnership is not taxed as an ordinary taxable partnership. Annual information reporting and partners’ distributive shares remain relevant.',
  'exempt-entity':'Legal exemption must cover the relevant activities. Other taxable income can require a different return and tax calculation.',
  'special-entity':'Examples include international carriers, specialized banking, specified foreign lessors and special-law entities. Verify the specific statute, ATC, base and treaty before using a rate.',
  estate:'Taxable income during settlement is assessed separately from estate tax on transferring property at death. Use a verified fiduciary taxable base.',
  trust:'Taxation depends on the trust, distributions and applicable elections. This calculator accepts an already established taxable fiduciary base.',
  'complex-trust':'Exempt, revocable, grantor and other complex trust arrangements require their specific rules; no generic tax estimate is produced.',
};
