import {
  type AddToCartInput,
  type Cart,
  type CartItem,
  cartLineKey,
  emptyCart,
} from '../domain/cart';
import type { Result, StoreError } from '../domain/errors';
import type { CheckoutInput, Order } from '../domain/order';
import type { Product, ProductColor, ProductSize } from '../domain/product';
import { seedState } from './fake-data';
import { LocalStorageStore } from './local-storage-adapter';
import { type Clock, type IdGenerator, randomIds, type StorePort, systemClock } from './ports';
import { emptyState, type PersistedState, type Profile } from './schema';
import { addComment } from './use-cases/add-comment';
import { addToCart } from './use-cases/add-to-cart';
import { deleteComment, editComment } from './use-cases/manage-comment';
import { createProfile, selectProfile } from './use-cases/manage-profile';
import { placeOrder } from './use-cases/place-order';
import { toggleLike } from './use-cases/toggle-like';
import { removeFromCart, setCartQuantity } from './use-cases/update-cart';

/** Composition root: the only place concrete adapters and dependencies are wired. */
const store: StorePort = new LocalStorageStore();
const clock: Clock = systemClock;
const ids: IdGenerator = randomIds;

export function readState(): PersistedState {
  const result = store.read();
  return result.ok ? result.value : emptyState();
}

export function readStateResult(): Result<PersistedState, StoreError> {
  return store.read();
}

export function getCart(userId: string | null): Cart {
  const state = readState();
  return state.carts.find((cart) => cart.userId === userId) ?? emptyCart(userId ?? '');
}

export function getOrders(userId: string | null): Order[] {
  const state = readState();
  return state.orders.filter((order) => order.userId === userId);
}

export function likeProduct(productId: string): Result<{ liked: boolean }> {
  return toggleLike(store, clock, { userId: readState().activeUserId, productId });
}

export function commentProduct(productId: string, text: string) {
  return addComment(store, clock, ids, { userId: readState().activeUserId, productId, text });
}

export function updateComment(commentId: string, text: string) {
  return editComment(store, clock, readState().activeUserId, commentId, text);
}

export function removeComment(commentId: string) {
  return deleteComment(store, readState().activeUserId, commentId);
}

export function addProductToCart(
  product: Product,
  size: ProductSize,
  color: ProductColor,
  quantity: number,
  image: AddToCartInput['image'],
) {
  return addToCart(store, clock, readState().activeUserId, {
    product,
    size,
    color,
    quantity,
    image,
  });
}

export function changeCartQuantity(
  productId: string,
  size: ProductSize,
  color: ProductColor,
  quantity: number,
): Result<void> {
  return setCartQuantity(store, clock, {
    userId: readState().activeUserId,
    productId,
    size,
    color,
    quantity,
  });
}

export function removeCartLine(
  productId: string,
  size: ProductSize,
  color: ProductColor,
): Result<void> {
  return removeFromCart(store, clock, { userId: readState().activeUserId, productId, size, color });
}

export function restoreCartLine(item: CartItem): Result<void> {
  const state = readState();
  const userId = state.activeUserId;
  if (userId === null)
    return { ok: false, error: { code: 'no_profile', message: 'Create a profile first.' } };

  const cart = state.carts.find((entry) => entry.userId === userId) ?? emptyCart(userId);
  const existing = cart.items.find((entry) => cartLineKey(entry) === cartLineKey(item));
  const items = existing
    ? cart.items.map((entry) =>
        cartLineKey(entry) === cartLineKey(item)
          ? { ...entry, quantity: Math.min(99, entry.quantity + item.quantity) }
          : entry,
      )
    : [...cart.items, item];
  const updated = { ...cart, items, updatedAt: clock.now() };
  const hasCart = state.carts.some((entry) => entry.userId === userId);
  const carts = hasCart
    ? state.carts.map((entry) => (entry.userId === userId ? updated : entry))
    : [...state.carts, updated];
  return store.write({ ...state, carts });
}

export function checkout(input: CheckoutInput): Result<Order> {
  return placeOrder(store, clock, ids, readState().activeUserId, input);
}

export function createLocalProfile(displayName: string): Result<Profile> {
  return createProfile(store, clock, ids, displayName);
}

export function selectLocalProfile(profileId: string): Result<Profile> {
  return selectProfile(store, profileId);
}

export function resetLocalData(): Result<void> {
  const cleared = store.clear();
  if (!cleared.ok) return cleared;
  return store.write(seedState(emptyState()));
}
