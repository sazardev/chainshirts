import { type Cart, emptyCart } from '../domain/cart';
import type { Order } from '../domain/order';
import type { Product } from '../domain/product';
import type { Comment, PersistedState, Profile } from './schema';

export function selectCart(state: PersistedState, userId: string | null): Cart {
  if (userId === null) return emptyCart('');
  return state.carts.find((cart) => cart.userId === userId) ?? emptyCart(userId);
}

export function selectOrders(state: PersistedState, userId: string | null): Order[] {
  if (userId === null) return [];
  return state.orders
    .filter((order) => order.userId === userId)
    .slice()
    .sort((a, b) => b.placedAt.localeCompare(a.placedAt));
}

export function selectLikeCount(
  state: PersistedState,
  product: Pick<Product, 'id' | 'seedLikeCount'>,
): number {
  return product.seedLikeCount + state.likes.filter((like) => like.productId === product.id).length;
}

export function isLiked(state: PersistedState, userId: string | null, productId: string): boolean {
  if (userId === null) return false;
  return state.likes.some((like) => like.userId === userId && like.productId === productId);
}

export function selectComments(state: PersistedState, productId: string): Comment[] {
  return state.comments
    .filter((comment) => comment.productId === productId)
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function commentAuthor(state: PersistedState, userId: string): Profile | null {
  return state.profiles.find((profile) => profile.id === userId) ?? null;
}

export function selectUserComments(state: PersistedState, userId: string | null): Comment[] {
  if (userId === null) return [];
  return state.comments
    .filter((comment) => comment.userId === userId)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function selectUserLikes(state: PersistedState, userId: string | null): string[] {
  if (userId === null) return [];
  return state.likes.filter((like) => like.userId === userId).map((like) => like.productId);
}
