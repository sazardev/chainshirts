import { describe, expect, it } from 'vitest';
import { addItemToCart, emptyCart } from '../../src/lib/domain/cart';
import { type CheckoutInput, createOrder, validateCheckout } from '../../src/lib/domain/order';
import type { Product } from '../../src/lib/domain/product';

const product: Product = {
  id: 'p-key-01',
  slug: 'type-65-mechanical',
  name: 'Type-65 Mechanical Keyboard',
  description: 'A keyboard.',
  brand: 'Fang Labs',
  compareAtPriceMinor: 14999,
  priceMinor: 11999,
  currency: 'USD',
  category: 'keyboards',
  images: [{ src: '/key.png', alt: 'Keyboard artwork' }],
  sizes: ['ONE_SIZE'],
  colors: ['obsidian'],
  badge: null,
  seedLikeCount: 1,
  rating: 4.7,
  reviewCount: 210,
  featured: false,
  createdAt: '2026-01-15T10:00:00.000Z',
};

const valid: CheckoutInput = {
  fullName: 'Ada Hunter',
  address: '14 Chain Street',
  city: 'Tokyo',
  postalCode: '100-0001',
  cardNumber: '4111 1111 1111 1111',
  promoCode: '',
};

describe('checkout validation', () => {
  it('accepts a valid demo card and required fields', () => {
    expect(validateCheckout(valid)).toEqual([]);
  });

  it('rejects missing fields and a card that fails Luhn', () => {
    const errors = validateCheckout({ ...valid, fullName: '', cardNumber: '1234 5678 9012 3456' });
    expect(errors.map((error) => error.field)).toEqual(['fullName', 'cardNumber']);
  });
});

describe('order creation', () => {
  it('snapshots lines and total at checkout time', () => {
    const cart = addItemToCart(
      emptyCart('u-1'),
      { product, size: 'ONE_SIZE', color: 'obsidian', quantity: 2, image: product.images[0] },
      NOW,
    );
    const order = createOrder({ id: 'order-1', userId: 'u-1', cart, input: valid, now: NOW });

    expect(order.totalMinor).toBe(23998);
    expect(order.lines[0]).toMatchObject({
      name: product.name,
      quantity: 2,
      unitPriceMinor: 11999,
    });
    expect(order.fakeShippingInfo).toEqual({
      fullName: 'Ada Hunter',
      address: '14 Chain Street',
      city: 'Tokyo',
      postalCode: '100-0001',
    });
    expect(JSON.stringify(order)).not.toContain('4111');
  });
});

const NOW = '2026-02-01T12:00:00.000Z';
