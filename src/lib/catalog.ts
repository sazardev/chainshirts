import { getImage } from 'astro:assets';
import { getCollection } from 'astro:content';
import type { Category, Product, ProductCategory, ProductSize } from './domain/product';

const CATEGORY_IDS: ProductCategory[] = [
  't-shirts',
  'hoodies',
  'pants',
  'mice',
  'keyboards',
  'accessories',
  'jackets',
  'shorts',
  'shoes',
  'collectibles',
  'audio',
];

function isProductCategory(value: string): value is ProductCategory {
  return CATEGORY_IDS.includes(value as ProductCategory);
}

async function imageUrl(
  source: Parameters<typeof getImage>[0]['src'],
  width: number,
): Promise<string> {
  const result = await getImage({ src: source, width, format: 'webp' });
  return result.src;
}

export async function getProducts(): Promise<Product[]> {
  const entries = await getCollection('products');
  const products = await Promise.all(
    entries.map(async (entry): Promise<Product> => {
      const { data } = entry;
      if (!isProductCategory(data.category)) {
        throw new Error(`Product ${entry.id} has unknown category "${data.category}"`);
      }
      const images = await Promise.all([
        imageUrl(data.cover, 800),
        ...data.gallery.map((image) => imageUrl(image, 1200)),
      ]);
      const alts = [data.coverAlt, ...data.galleryAlt];
      return {
        id: data.id,
        slug: entry.id,
        name: data.name,
        description: data.description,
        brand: data.brand,
        priceMinor: data.priceMinor,
        compareAtPriceMinor: data.compareAtPriceMinor,
        currency: data.currency,
        category: data.category,
        images: images.map((src, index) => ({ src, alt: alts[index] ?? data.coverAlt })),
        sizes: data.sizes as ProductSize[],
        colors: data.colors as Product['colors'],
        badge:
          data.reviewCount >= 300 ? 'Bestseller' : data.featured ? 'Limited drop' : 'New arrival',
        seedLikeCount: data.seedLikeCount,
        rating: data.rating,
        reviewCount: data.reviewCount,
        featured: data.featured,
        createdAt: data.createdAt,
      };
    }),
  );
  return products.sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt) || a.name.localeCompare(b.name),
  );
}

export async function getCategories(): Promise<Category[]> {
  const entries = await getCollection('categories');
  return Promise.all(
    entries.map(async (entry): Promise<Category> => {
      const { data } = entry;
      const image = data.image
        ? { src: await imageUrl(data.image, 640), alt: `${data.name} category artwork` }
        : null;
      return {
        id: entry.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        accent: data.accent,
        image,
      };
    }),
  );
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((product) => product.featured).slice(0, limit);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((product) => product.category === category);
}

export function categoryLabel(category: ProductCategory): string {
  return category
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
