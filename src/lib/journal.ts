import { getImage } from 'astro:assets';
import { type CollectionEntry, getCollection } from 'astro:content';

export interface Article {
  slug: string;
  entry: CollectionEntry<'journal'>;
  title: string;
  description: string;
  cover: string;
  coverAlt: string;
  category: string;
  author: string;
  publishedAt: string;
  readingMinutes: number;
  featured: boolean;
}

export async function getArticles(): Promise<Article[]> {
  const entries = await getCollection('journal');
  const articles = await Promise.all(
    entries.map(async (entry) => {
      const image = await getImage({ src: entry.data.cover, width: 1200, format: 'webp' });
      return {
        slug: entry.id,
        entry,
        title: entry.data.title,
        description: entry.data.description,
        cover: image.src,
        coverAlt: entry.data.coverAlt,
        category: entry.data.category,
        author: entry.data.author,
        publishedAt: entry.data.publishedAt,
        readingMinutes: entry.data.readingMinutes,
        featured: entry.data.featured,
      };
    }),
  );
  return articles.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function formatArticleDate(iso: string): string {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(iso),
  );
}
