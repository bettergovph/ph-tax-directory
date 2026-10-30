// Shared peso helpers for the indirect-tax calculators. All amounts are bigint centavos so that
// rates apply without binary floating-point error.

export const MAX_CENTAVOS = 100_000_000_000_000n; // ₱1 trillion per line, same limit as the income tax calculator

/** Integer division of n by d, rounding half up. Both must be non-negative. */
export const half = (n: bigint, d: bigint) => (n * 2n + d) / (2n * d);
/** Smallest whole number of `unit` that covers `n`: "per ₱1,000 or fractional part thereof". */
export const ceilDiv = (n: bigint, unit: bigint) => (n + unit - 1n) / unit;

/** Parse a peso amount typed by the user. Blank is zero. Returns an error message for anything else invalid. */
export function parseAmount(text: string | undefined): { centavos: bigint } | { error: string } {
  const raw = (text ?? '').replace(/[,₱\s]/g, '');
  if (raw === '') return { centavos: 0n };
  if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) return { error: 'Enter an amount of zero or more, with at most two decimals.' };
  const [whole, decimals = ''] = raw.split('.');
  const centavos = BigInt(whole) * 100n + BigInt(decimals.padEnd(2, '0'));
  if (centavos > MAX_CENTAVOS) return { error: 'Amount is above the supported ₱1 trillion limit.' };
  return { centavos };
}

/** Parse a quantity such as litres, packs or years, to two decimals. Returns hundredths. Blank is zero. */
export function parseQuantity(text: string | undefined): { hundredths: bigint } | { error: string } {
  const raw = (text ?? '').replace(/[,\s]/g, '');
  if (raw === '') return { hundredths: 0n };
  if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) return { error: 'Enter a number of zero or more, with at most two decimals.' };
  const [whole, decimals = ''] = raw.split('.');
  const hundredths = BigInt(whole) * 100n + BigInt(decimals.padEnd(2, '0'));
  if (hundredths > 1_000_000_000_000_000n) return { error: 'Quantity is too large.' };
  return { hundredths };
}

export function formatPesos(centavos: bigint): string {
  const negative = centavos < 0n;
  const abs = negative ? -centavos : centavos;
  const text = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(Number(abs) / 100);
  return negative ? `(${text})` : text;
}
