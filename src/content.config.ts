import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const sizeSchema = z.enum([
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '28',
  '30',
  '32',
  '34',
  '36',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  'ONE_SIZE',
]);
const accentSchema = z.enum(['magenta', 'cyan', 'violet', 'red']);
const colorSchema = z.enum(['obsidian', 'bone', 'blood-red', 'neon-cyan', 'neon-violet', 'steel']);

const categories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/categories' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      slug: z.string(),
      description: z.string(),
      accent: accentSchema,
      image: image().optional(),
    }),
});

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: ({ image }) =>
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      brand: z.string(),
      priceMinor: z.number().int().positive(),
      compareAtPriceMinor: z.number().int().positive(),
      currency: z.literal('USD'),
      category: z.string(),
      cover: image(),
      coverAlt: z.string(),
      gallery: z.array(image()).default([]),
      galleryAlt: z.array(z.string()).default([]),
      sizes: z.array(sizeSchema),
      colors: z.array(colorSchema).default(['obsidian']),
      seedLikeCount: z.number().int().nonnegative(),
      rating: z.number().min(0).max(5),
      reviewCount: z.number().int().nonnegative(),
      featured: z.boolean().default(false),
      createdAt: z.string(),
    }),
});

const journal = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/journal' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      cover: image(),
      coverAlt: z.string(),
      category: z.string(),
      author: z.string(),
      publishedAt: z.string(),
      readingMinutes: z.number().int().positive(),
      featured: z.boolean().default(false),
    }),
});

export const collections = { categories, products, journal };
