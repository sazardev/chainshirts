import { type AddToCartInput, addItemToCart, emptyCart } from '../../domain/cart';
import { err, ok, type Result } from '../../domain/errors';
import type { Clock, StorePort } from '../ports';

export function addToCart(
  store: StorePort,
  clock: Clock,
  userId: string | null,
  input: AddToCartInput,
): Result<void> {
  if (userId === null) {
    return err({ code: 'no_profile', message: 'Please sign in to add items to your bag.' });
  }

  const read = store.read();
  if (!read.ok) return err(read.error);

  const state = read.value;
  const now = clock.now();
  const cart = state.carts.find((entry) => entry.userId === userId) ?? emptyCart(userId);
  const updated = addItemToCart(cart, input, now);
  const carts = state.carts.some((entry) => entry.userId === userId)
    ? state.carts.map((entry) => (entry.userId === userId ? updated : entry))
    : [...state.carts, updated];

  const write = store.write({ ...state, carts });
  if (!write.ok) return err(write.error);
  return ok(undefined);
}
