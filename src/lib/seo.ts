import type { Product } from './domain/product';
import { SITE_NAME, SITE_URL } from './site';

export function organizationSchema() {
  return {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/og-image.png`,
  };
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

export function productSchema(product: Product) {
  const url = `${SITE_URL}/products/${product.slug}`;
  return {
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.name,
    description: product.description,
    image: product.images.map((image) => new URL(image.src, SITE_URL).toString()),
    brand: { '@type': 'Brand', name: product.brand },
    sku: product.id,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: product.currency,
      price: (product.priceMinor / 100).toFixed(2),
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };
}

export function itemListSchema(products: Product[]) {
  return {
    '@type': 'ItemList',
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/products/${product.slug}`,
      name: product.name,
    })),
  };
}
