import { emptyCart, removeItemFromCart, setItemQuantity } from '../../domain/cart';
import { err, ok, type Result } from '../../domain/errors';
import type { ProductColor, ProductSize } from '../../domain/product';
import type { Clock, StorePort } from '../ports';

export interface CartLineInput {
  userId: string | null;
  productId: string;
  size: ProductSize;
  color: ProductColor;
}

function updateCart(
  store: StorePort,
  clock: Clock,
  input: CartLineInput,
  mutation: (cart: ReturnType<typeof emptyCart>, now: string) => ReturnType<typeof emptyCart>,
): Result<void> {
  if (input.userId === null) {
    return err({ code: 'no_profile', message: 'Please sign in to update your bag.' });
  }
  const read = store.read();
  if (!read.ok) return err(read.error);

  const state = read.value;
  const now = clock.now();
  const cart =
    state.carts.find((entry) => entry.userId === input.userId) ?? emptyCart(input.userId);
  const updated = mutation(cart, now);
  const carts = state.carts.map((entry) => (entry.userId === input.userId ? updated : entry));
  if (!state.carts.some((entry) => entry.userId === input.userId)) carts.push(updated);

  const write = store.write({ ...state, carts });
  if (!write.ok) return err(write.error);
  return ok(undefined);
}

export function setCartQuantity(
  store: StorePort,
  clock: Clock,
  input: CartLineInput & { quantity: number },
): Result<void> {
  return updateCart(store, clock, input, (cart, now) =>
    setItemQuantity(cart, input.productId, input.size, input.color, input.quantity, now),
  );
}

export function removeFromCart(store: StorePort, clock: Clock, input: CartLineInput): Result<void> {
  return updateCart(store, clock, input, (cart, now) =>
    removeItemFromCart(cart, input.productId, input.size, input.color, now),
  );
}
