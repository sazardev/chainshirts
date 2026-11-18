export type Currency = 'USD';

export type ProductCategory =
  | 't-shirts'
  | 'hoodies'
  | 'pants'
  | 'mice'
  | 'keyboards'
  | 'accessories'
  | 'jackets'
  | 'shorts'
  | 'shoes'
  | 'collectibles'
  | 'audio';

export type ProductSize =
  | 'XS'
  | 'S'
  | 'M'
  | 'L'
  | 'XL'
  | 'XXL'
  | '28'
  | '30'
  | '32'
  | '34'
  | '36'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12'
  | 'ONE_SIZE';

export type ProductColor =
  | 'obsidian'
  | 'bone'
  | 'blood-red'
  | 'neon-cyan'
  | 'neon-violet'
  | 'steel';

export interface ProductImage {
  src: string;
  alt: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  brand: string;
  priceMinor: number;
  compareAtPriceMinor: number;
  currency: Currency;
  category: ProductCategory;
  images: ProductImage[];
  sizes: ProductSize[];
  colors: ProductColor[];
  seedLikeCount: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
  badge: 'Bestseller' | 'New arrival' | 'Limited drop' | null;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  accent: 'magenta' | 'cyan' | 'violet' | 'red';
  image: ProductImage | null;
}

export function discountPercent(product: Product): number {
  if (product.compareAtPriceMinor <= product.priceMinor) return 0;
  return Math.round((1 - product.priceMinor / product.compareAtPriceMinor) * 100);
}

export function isClothing(product: Product): boolean {
  return product.sizes.some((size) => size !== 'ONE_SIZE');
}

export function sizeLabel(size: ProductSize): string {
  return size === 'ONE_SIZE' ? 'One size' : size;
}

export function colorLabel(color: ProductColor): string {
  return color
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/** Token-backed swatch classes: no raw colour values live in components. */
export const COLOR_SWATCH: Record<ProductColor, string> = {
  obsidian: 'bg-inverse border-border',
  bone: 'bg-surface border-border',
  'blood-red': 'bg-danger border-danger',
  'neon-cyan': 'bg-cyan border-cyan',
  'neon-violet': 'bg-violet border-violet',
  steel: 'bg-muted border-border',
};
