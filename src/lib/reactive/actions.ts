import type { CartItem } from '../domain/cart';
import { errorMessage } from '../domain/errors';
import type { CheckoutInput, Order } from '../domain/order';
import type { Product, ProductColor, ProductSize } from '../domain/product';
import { clientHref } from '../paths';
import {
  addProductToCart,
  changeCartQuantity,
  checkout,
  commentProduct,
  createLocalProfile,
  likeProduct,
  readState,
  removeCartLine,
  removeComment,
  resetLocalData,
  restoreCartLine,
  selectLocalProfile,
  updateComment,
} from '../store';
import { pushToast } from './toasts';

function requireProfile(): boolean {
  if (readState().activeUserId !== null) return true;
  pushToast('Please sign in to save your activity.', 'info');
  return false;
}

function reportFailure(error: Parameters<typeof errorMessage>[0]): void {
  pushToast(errorMessage(error), 'error');
}

export function like(productId: string): void {
  if (!requireProfile()) return;
  const result = likeProduct(productId);
  if (!result.ok) {
    reportFailure(result.error);
    return;
  }
  pushToast(result.value.liked ? 'Added to your likes.' : 'Like removed.', 'success');
}

export function comment(productId: string, text: string): boolean {
  if (!requireProfile()) return false;
  const result = commentProduct(productId, text);
  if (!result.ok) {
    reportFailure(result.error);
    return false;
  }
  pushToast('Your comment was posted.', 'success');
  return true;
}

export function editComment(commentId: string, text: string): boolean {
  if (!requireProfile()) return false;
  const result = updateComment(commentId, text);
  if (!result.ok) {
    reportFailure(result.error);
    return false;
  }
  pushToast('Comment updated.', 'success');
  return true;
}

export function deleteComment(commentId: string): void {
  if (!requireProfile()) return;
  const result = removeComment(commentId);
  if (!result.ok) {
    reportFailure(result.error);
    return;
  }
  pushToast('Comment deleted.', 'success');
}

export function addToCart(
  product: Product,
  size: ProductSize,
  color: ProductColor,
  quantity: number,
): void {
  if (!requireProfile()) return;
  const result = addProductToCart(product, size, color, quantity, product.images[0]);
  if (!result.ok) {
    reportFailure(result.error);
    return;
  }
  pushToast('Added to cart.', 'success', {
    actionLabel: 'View cart',
    onAction: () => navigate('/cart'),
  });
}

export function setQuantity(line: CartItem, quantity: number): void {
  if (!requireProfile()) return;
  if (quantity <= 0) {
    removeLine(line);
    return;
  }
  const result = changeCartQuantity(line.productId, line.size, line.color, quantity);
  if (!result.ok) reportFailure(result.error);
}

export function removeLine(line: CartItem): void {
  if (!requireProfile()) return;
  const result = removeCartLine(line.productId, line.size, line.color);
  if (!result.ok) {
    reportFailure(result.error);
    return;
  }
  pushToast('Removed from cart.', 'success', {
    actionLabel: 'Undo',
    onAction: () => {
      const restored = restoreCartLine(line);
      if (restored.ok) pushToast('Item restored.', 'success');
      else reportFailure(restored.error);
    },
  });
}

export function placeOrder(input: CheckoutInput): Order | null {
  if (!requireProfile()) return null;
  const result = checkout(input);
  if (!result.ok) {
    reportFailure(result.error);
    return null;
  }
  pushToast('Order placed — confirmation ready.', 'success');
  return result.value;
}

export function createProfile(displayName: string): boolean {
  const result = createLocalProfile(displayName);
  if (!result.ok) {
    reportFailure(result.error);
    return false;
  }
  pushToast(`Welcome, ${result.value.displayName}.`, 'success');
  return true;
}

export function selectProfile(profileId: string): void {
  const result = selectLocalProfile(profileId);
  if (!result.ok) {
    reportFailure(result.error);
    return;
  }
  pushToast(`Switched to ${result.value.displayName}.`, 'success');
}

export function resetData(): void {
  const result = resetLocalData();
  if (!result.ok) {
    reportFailure(result.error);
    return;
  }
  pushToast('Your saved data was cleared.', 'success');
}

function navigate(path: string): void {
  if (typeof window !== 'undefined') window.location.assign(clientHref(path));
}
