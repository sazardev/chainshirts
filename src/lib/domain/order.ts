import { type Cart, type CartItem, cartTotalMinor } from './cart';
import type { Currency } from './product';
import { discountFor, findPromo } from './promo';

export type OrderStatus = 'confirmed';

export interface FakeShippingInfo {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface CheckoutInput {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  cardNumber: string;
  promoCode: string;
}

export interface OrderLine {
  productId: string;
  name: string;
  size: CartItem['size'];
  color: CartItem['color'];
  quantity: number;
  unitPriceMinor: number;
  imageSrc: string;
}

export interface Order {
  id: string;
  userId: string;
  lines: OrderLine[];
  subtotalMinor: number;
  discountMinor: number;
  promoCode: string;
  totalMinor: number;
  currency: Currency;
  status: OrderStatus;
  placedAt: string;
  fakeShippingInfo: FakeShippingInfo;
}

export interface OrderDraft {
  id: string;
  userId: string;
  cart: Cart;
  input: CheckoutInput;
  now: string;
}

export function createOrder(draft: OrderDraft): Order {
  const lines: OrderLine[] = draft.cart.items.map((item) => ({
    productId: item.productId,
    name: item.name,
    size: item.size,
    color: item.color,
    quantity: item.quantity,
    unitPriceMinor: item.unitPriceMinor,
    imageSrc: item.image.src,
  }));

  const subtotalMinor = cartTotalMinor(draft.cart);
  const discountMinor = discountFor(subtotalMinor, draft.input.promoCode);

  return {
    id: draft.id,
    userId: draft.userId,
    lines,
    subtotalMinor,
    discountMinor,
    promoCode: draft.input.promoCode.trim().toUpperCase(),
    totalMinor: subtotalMinor - discountMinor,
    currency: 'USD',
    status: 'confirmed',
    placedAt: draft.now,
    fakeShippingInfo: {
      fullName: draft.input.fullName.trim(),
      address: draft.input.address.trim(),
      city: draft.input.city.trim(),
      postalCode: draft.input.postalCode.trim(),
    },
  };
}

export function validateCheckout(input: CheckoutInput): { field: string; message: string }[] {
  const errors: { field: string; message: string }[] = [];
  if (input.fullName.trim().length < 1 || input.fullName.trim().length > 80) {
    errors.push({ field: 'fullName', message: 'Enter a name between 1 and 80 characters.' });
  }
  if (input.address.trim().length < 1 || input.address.trim().length > 160) {
    errors.push({ field: 'address', message: 'Enter an address between 1 and 160 characters.' });
  }
  if (input.city.trim().length < 1 || input.city.trim().length > 80) {
    errors.push({ field: 'city', message: 'Enter a city between 1 and 80 characters.' });
  }
  if (input.postalCode.trim().length < 1 || input.postalCode.trim().length > 16) {
    errors.push({
      field: 'postalCode',
      message: 'Enter a postal code between 1 and 16 characters.',
    });
  }
  const digits = input.cardNumber.replace(/\D/g, '');
  if (!/^\d{16}$/.test(digits) || !passesLuhn(digits)) {
    errors.push({ field: 'cardNumber', message: 'Enter a valid 16-digit card number.' });
  }
  if (input.promoCode.trim().length > 0 && !findPromo(input.promoCode)) {
    errors.push({ field: 'promoCode', message: 'That code is not valid. Try CHAOS15.' });
  }
  return errors;
}

function passesLuhn(digits: string): boolean {
  let sum = 0;
  let double = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let value = Number(digits[index]);
    if (double) {
      value *= 2;
      if (value > 9) value -= 9;
    }
    sum += value;
    double = !double;
  }
  return sum % 10 === 0;
}
