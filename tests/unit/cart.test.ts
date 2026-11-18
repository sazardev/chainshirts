import { describe, expect, it } from 'vitest';
import {
  addItemToCart,
  cartLineKey,
  cartTotalMinor,
  clampQuantity,
  emptyCart,
  removeItemFromCart,
  setItemQuantity,
} from '../../src/lib/domain/cart';
import type { Product } from '../../src/lib/domain/product';

const product: Product = {
  id: 'p-tee-01',
  slug: 'chainsaw-pulse-tee',
  name: 'Chainsaw Pulse Tee',
  description: 'A loud tee.',
  brand: 'Public Safety Co.',
  compareAtPriceMinor: 3499,
  priceMinor: 2499,
  currency: 'USD',
  category: 't-shirts',
  images: [{ src: '/art.png', alt: 'Artwork' }],
  sizes: ['S', 'M', 'L'],
  colors: ['obsidian', 'bone'],
  badge: null,
  seedLikeCount: 10,
  rating: 4.6,
  reviewCount: 120,
  featured: true,
  createdAt: '2026-01-15T10:00:00.000Z',
};

const NOW = '2026-02-01T12:00:00.000Z';

describe('cart rules', () => {
  it('adds a line, then increments the same product and size', () => {
    const first = addItemToCart(
      emptyCart('u-1'),
      { product, size: 'M', color: 'obsidian', quantity: 1, image: product.images[0] },
      NOW,
    );
    const second = addItemToCart(
      first,
      { product, size: 'M', color: 'obsidian', quantity: 2, image: product.images[0] },
      NOW,
    );

    const line = second.items[0];
    expect(second.items).toHaveLength(1);
    expect(line?.quantity).toBe(3);
    expect(line ? cartLineKey(line) : '').toBe('p-tee-01::M::obsidian');
    expect(cartTotalMinor(second)).toBe(7497);
  });

  it('keeps different sizes as separate lines', () => {
    const first = addItemToCart(
      emptyCart('u-1'),
      { product, size: 'M', color: 'obsidian', quantity: 1, image: product.images[0] },
      NOW,
    );
    const second = addItemToCart(
      first,
      { product, size: 'L', color: 'obsidian', quantity: 1, image: product.images[0] },
      NOW,
    );
    expect(second.items).toHaveLength(2);
  });

  it('removes a line when quantity reaches zero and clamps high quantities', () => {
    const cart = addItemToCart(
      emptyCart('u-1'),
      { product, size: 'S', color: 'obsidian', quantity: 2, image: product.images[0] },
      NOW,
    );
    const clamped = setItemQuantity(cart, product.id, 'S', 'obsidian', 500, NOW);
    expect(clamped.items[0]?.quantity).toBe(99);

    const removed = setItemQuantity(cart, product.id, 'S', 'obsidian', 0, NOW);
    expect(removed.items).toHaveLength(0);

    const explicitlyRemoved = removeItemFromCart(cart, product.id, 'S', 'obsidian', NOW);
    expect(explicitlyRemoved.items).toHaveLength(0);
  });

  it('clamps invalid quantities to the valid range', () => {
    expect(clampQuantity(-4)).toBe(1);
    expect(clampQuantity(Number.NaN)).toBe(1);
    expect(clampQuantity(3.9)).toBe(3);
  });
});
