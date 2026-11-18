import type { Currency, Product, ProductColor, ProductImage, ProductSize } from './product';

export const MAX_QUANTITY = 99;
export const MIN_QUANTITY = 1;

export interface CartItem {
  productId: string;
  name: string;
  size: ProductSize;
  color: ProductColor;
  quantity: number;
  unitPriceMinor: number;
  image: ProductImage;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

export interface AddToCartInput {
  product: Product;
  size: ProductSize;
  color: ProductColor;
  quantity: number;
  image: ProductImage | undefined;
}

export function emptyCart(userId: string): Cart {
  return { userId, items: [], updatedAt: '' };
}

export function lineKey(productId: string, size: ProductSize, color: ProductColor): string {
  return `${productId}::${size}::${color}`;
}

export function cartLineKey(item: CartItem): string {
  return lineKey(item.productId, item.size, item.color);
}

export function cartTotalMinor(cart: Cart): number {
  return cart.items.reduce((total, item) => total + item.quantity * item.unitPriceMinor, 0);
}

export function cartItemCount(cart: Cart): number {
  return cart.items.reduce((count, item) => count + item.quantity, 0);
}

export function cartLineTotalMinor(item: CartItem): number {
  return item.quantity * item.unitPriceMinor;
}

export function addItemToCart(cart: Cart, input: AddToCartInput, now: string): Cart {
  const quantity = clampQuantity(input.quantity);
  const cover = input.image ?? input.product.images[0];
  const image: ProductImage = cover ?? { src: '', alt: input.product.name };
  const item: CartItem = {
    productId: input.product.id,
    name: input.product.name,
    size: input.size,
    color: input.color,
    quantity,
    unitPriceMinor: input.product.priceMinor,
    image,
  };

  const index = cart.items.findIndex((existing) => cartLineKey(existing) === cartLineKey(item));
  let items: CartItem[];
  if (index === -1) {
    items = [...cart.items, item];
  } else {
    items = cart.items.map((existing, position) =>
      position === index
        ? {
            ...existing,
            quantity: clampQuantity(existing.quantity + quantity),
            unitPriceMinor: item.unitPriceMinor,
          }
        : existing,
    );
  }
  return { ...cart, items, updatedAt: now };
}

export function setItemQuantity(
  cart: Cart,
  productId: string,
  size: ProductSize,
  color: ProductColor,
  quantity: number,
  now: string,
): Cart {
  const items =
    quantity <= 0
      ? cart.items.filter((item) => cartLineKey(item) !== lineKey(productId, size, color))
      : cart.items.map((item) =>
          cartLineKey(item) === lineKey(productId, size, color)
            ? { ...item, quantity: clampQuantity(quantity) }
            : item,
        );
  return { ...cart, items, updatedAt: now };
}

export function removeItemFromCart(
  cart: Cart,
  productId: string,
  size: ProductSize,
  color: ProductColor,
  now: string,
): Cart {
  return {
    ...cart,
    items: cart.items.filter((item) => cartLineKey(item) !== lineKey(productId, size, color)),
    updatedAt: now,
  };
}

export function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return MIN_QUANTITY;
  return Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, Math.trunc(quantity)));
}

export function cartCurrency(_cart: Cart): Currency {
  return 'USD';
}
