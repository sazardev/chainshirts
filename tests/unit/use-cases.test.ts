import { describe, expect, it } from 'vitest';
import { ok, type StoreError } from '../../src/lib/domain/errors';
import type { Product } from '../../src/lib/domain/product';
import { seedState } from '../../src/lib/store/fake-data';
import type { Clock, IdGenerator, StorePort } from '../../src/lib/store/ports';
import { emptyState, type PersistedState } from '../../src/lib/store/schema';
import { selectCart, selectOrders } from '../../src/lib/store/selectors';
import { addComment } from '../../src/lib/store/use-cases/add-comment';
import { addToCart } from '../../src/lib/store/use-cases/add-to-cart';
import { createProfile, selectProfile } from '../../src/lib/store/use-cases/manage-profile';
import { placeOrder } from '../../src/lib/store/use-cases/place-order';
import { toggleLike } from '../../src/lib/store/use-cases/toggle-like';

const clock: Clock = { now: () => '2026-02-01T12:00:00.000Z' };
const ids: IdGenerator = { next: (prefix) => `${prefix}-fixed` };

function fakeStore(): StorePort & { snapshot: () => PersistedState } {
  let state = seedState(emptyState());
  return {
    read: () => ok(state),
    write: (next) => {
      state = next;
      return ok(undefined);
    },
    clear: () => {
      state = emptyState();
      return ok(undefined);
    },
    snapshot: () => state,
  };
}

function withUser(store: StorePort & { snapshot: () => PersistedState }): string {
  const result = createProfile(store, clock, ids, 'Ada Hunter');
  if (!result.ok) throw new Error('fixture failed');
  const selected = selectProfile(store, result.value.id);
  if (!selected.ok) throw new Error('fixture failed');
  return result.value.id;
}

const product: Product = {
  id: 'p-hood-01',
  slug: 'public-safety-hoodie',
  name: 'Public Safety Hoodie',
  description: 'A warm hoodie.',
  brand: 'Neon Division',
  compareAtPriceMinor: 7999,
  priceMinor: 6499,
  currency: 'USD',
  category: 'hoodies',
  images: [{ src: '/hoodie.png', alt: 'Hoodie artwork' }],
  sizes: ['M', 'L'],
  colors: ['obsidian', 'bone'],
  badge: null,
  seedLikeCount: 20,
  rating: 4.5,
  reviewCount: 180,
  featured: true,
  createdAt: '2026-01-15T10:00:00.000Z',
};

const checkout = {
  fullName: 'Ada Hunter',
  address: '14 Chain Street',
  city: 'Tokyo',
  postalCode: '100-0001',
  cardNumber: '4111111111111111',
  promoCode: '',
};

describe('profile-gated actions', () => {
  it('blocks likes, comments and cart writes without a profile', () => {
    const store = fakeStore();
    const results = [
      toggleLike(store, clock, { userId: null, productId: product.id }),
      addComment(store, clock, ids, { userId: null, productId: product.id, text: 'Nice' }),
      addToCart(store, clock, null, {
        product,
        size: 'M',
        color: 'obsidian',
        quantity: 1,
        image: product.images[0],
      }),
    ];
    for (const result of results) {
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe('no_profile');
    }
  });
});

describe('likes and comments', () => {
  it('toggles a like on and off', () => {
    const store = fakeStore();
    const userId = withUser(store);
    expect(toggleLike(store, clock, { userId, productId: product.id }).ok).toBe(true);
    expect(store.snapshot().likes).toHaveLength(1);
    expect(toggleLike(store, clock, { userId, productId: product.id }).ok).toBe(true);
    expect(store.snapshot().likes).toHaveLength(0);
  });

  it('rejects empty comments and stores valid ones with the author', () => {
    const store = fakeStore();
    const userId = withUser(store);
    const empty = addComment(store, clock, ids, { userId, productId: product.id, text: '   ' });
    expect(empty.ok).toBe(false);
    if (!empty.ok) expect(empty.error.code).toBe('invalid_field');

    const valid = addComment(store, clock, ids, {
      userId,
      productId: product.id,
      text: '  Great fit  ',
    });
    expect(valid.ok).toBe(true);
    if (valid.ok) expect(valid.value.text).toBe('Great fit');
    expect(store.snapshot().comments.at(-1)?.userId).toBe(userId);
  });
});

describe('cart and checkout', () => {
  it('adds to cart, then places an order and empties the cart', () => {
    const store = fakeStore();
    const userId = withUser(store);
    expect(
      addToCart(store, clock, userId, {
        product,
        size: 'L',
        color: 'obsidian',
        quantity: 2,
        image: product.images[0],
      }).ok,
    ).toBe(true);
    expect(selectCart(store.snapshot(), userId).items[0]?.quantity).toBe(2);

    const order = placeOrder(store, clock, ids, userId, checkout);
    expect(order.ok).toBe(true);
    if (order.ok) expect(order.value.totalMinor).toBe(12998);
    expect(selectCart(store.snapshot(), userId).items).toHaveLength(0);
    expect(selectOrders(store.snapshot(), userId)).toHaveLength(1);
  });

  it('blocks checkout with an empty cart or invalid data', () => {
    const store = fakeStore();
    const userId = withUser(store);
    const empty = placeOrder(store, clock, ids, userId, checkout);
    expect(empty.ok).toBe(false);
    if (!empty.ok) expect((empty.error as StoreError).code).toBe('empty_cart');

    addToCart(store, clock, userId, {
      product,
      size: 'M',
      color: 'obsidian',
      quantity: 1,
      image: product.images[0],
    });
    const invalid = placeOrder(store, clock, ids, userId, {
      ...checkout,
      cardNumber: '1234567812345678',
    });
    expect(invalid.ok).toBe(false);
    expect(selectOrders(store.snapshot(), userId)).toHaveLength(0);
  });
});
