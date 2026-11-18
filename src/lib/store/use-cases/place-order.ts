import { emptyCart } from '../../domain/cart';
import { err, ok, type Result } from '../../domain/errors';
import { type CheckoutInput, createOrder, type Order, validateCheckout } from '../../domain/order';
import type { Clock, IdGenerator, StorePort } from '../ports';

export function placeOrder(
  store: StorePort,
  clock: Clock,
  ids: IdGenerator,
  userId: string | null,
  checkout: CheckoutInput,
): Result<Order> {
  if (userId === null) {
    return err({ code: 'no_profile', message: 'Please sign in to check out.' });
  }
  const read = store.read();
  if (!read.ok) return err(read.error);

  const state = read.value;
  const cart = state.carts.find((entry) => entry.userId === userId) ?? emptyCart(userId);
  if (cart.items.length === 0) {
    return err({
      code: 'empty_cart',
      message: 'Your cart is empty. Add something before checking out.',
    });
  }

  const errors = validateCheckout(checkout);
  const first = errors[0];
  if (first) {
    return err({ code: 'invalid_field', field: first.field, message: first.message });
  }

  const order = createOrder({
    id: ids.next('order'),
    userId,
    cart,
    input: checkout,
    now: clock.now(),
  });
  const write = store.write({
    ...state,
    orders: [...state.orders, order],
    carts: state.carts.map((entry) => (entry.userId === userId ? emptyCart(userId) : entry)),
  });
  if (!write.ok) return err(write.error);
  return ok(order);
}
