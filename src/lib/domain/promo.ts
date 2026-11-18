export interface PromoCode {
  code: string;
  label: string;
  percentOff: number;
}

export const PROMO_CODES: readonly PromoCode[] = [
  { code: 'CHAOS15', label: '15% off your order', percentOff: 15 },
  { code: 'NEON10', label: '10% off your order', percentOff: 10 },
  { code: 'FAN20', label: '20% off your order', percentOff: 20 },
];

export function findPromo(code: string): PromoCode | null {
  const normalized = code.trim().toUpperCase();
  return PROMO_CODES.find((promo) => promo.code === normalized) ?? null;
}

export function discountFor(subtotalMinor: number, code: string): number {
  const promo = findPromo(code);
  if (!promo) return 0;
  return Math.round(subtotalMinor * promo.percentOff) / 100;
}
