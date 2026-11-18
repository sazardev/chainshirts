import type { Currency } from './product';

export function formatMoney(
  minorUnits: number,
  currency: Currency = 'USD',
  locale = 'en-US',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(minorUnits / 100);
}

export function formatMoneyCompact(minorUnits: number, currency: Currency = 'USD'): string {
  return formatMoney(minorUnits, currency, 'en-US');
}
