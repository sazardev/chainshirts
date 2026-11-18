import bannerAudio from '../assets/banners/banner-audio.webp';
import bannerCollect from '../assets/banners/banner-collect.webp';
import bannerDrop from '../assets/banners/banner-drop.webp';
import bannerGear from '../assets/banners/banner-gear.webp';
import bannerNew from '../assets/banners/banner-new.webp';
import bannerSale from '../assets/banners/banner-sale.webp';
import type { Product } from './domain/product';

export interface Collection {
  slug: string;
  name: string;
  kicker: string;
  description: string;
  image: { src: string; alt: string };
  productSlugs: string[];
  offer: string;
}

export const collections: Collection[] = [
  {
    slug: 'public-safety',
    name: 'Public Safety',
    kicker: 'Division 01',
    description:
      'Heavyweight layers, sharp cuts and the insignia of the division. Built for the long shift.',
    image: { src: bannerDrop.src, alt: 'Public Safety collection banner' },
    productSlugs: [
      'public-safety-hoodie',
      'ignition-zip-hoodie',
      'devil-hunter-zip',
      'shadow-pullover',
      'chainsaw-pulse-tee',
      'cargo-utility-pants',
    ],
    offer: 'Up to 25% off the division drop',
  },
  {
    slug: 'desk-dominion',
    name: 'Desk Dominion',
    kicker: 'Gear 02',
    description: 'Mechanical boards, precision mice and desk furniture for the night shift.',
    image: { src: bannerGear.src, alt: 'Desk Dominion collection banner' },
    productSlugs: [
      'type-65-mechanical',
      'siren-tkl',
      'mech-keyboard-75',
      'fang-pro-wireless',
      'pulse-gaming-mouse',
      'gaming-headset',
    ],
    offer: 'Free shipping on all gear',
  },
  {
    slug: 'neon-nights',
    name: 'Neon Nights',
    kicker: 'Sale 03',
    description: 'Loud prints, limited colourways and the pieces that never sit still.',
    image: { src: bannerSale.src, alt: 'Neon Nights collection banner' },
    productSlugs: [
      'midnight-flame-tee',
      'neo-tokyo-hoodie',
      'tokyo-graphics-tee',
      'red-signal-tee',
      'crossbody-bag',
      'chain-link-choker',
    ],
    offer: 'Selected styles up to 40% off',
  },
  {
    slug: 'night-runners',
    name: 'Night Runners',
    kicker: 'Footwear 04',
    description: 'Sneakers and boots made for long walks through neon-lit streets.',
    image: { src: bannerNew.src, alt: 'Night Runners collection banner' },
    productSlugs: [
      'concrete-runner',
      'midnight-high-top',
      'chain-sneaker',
      'hunter-boot',
      'neon-court',
      'pulse-slide',
    ],
    offer: 'Free shipping on all footwear',
  },
  {
    slug: 'shelf-legends',
    name: 'Shelf Legends',
    kicker: 'Objects 05',
    description: 'Figures, prints and small objects for the collection shelf.',
    image: { src: bannerCollect.src, alt: 'Shelf Legends collection banner' },
    productSlugs: [
      'fang-figure',
      'devil-mask-replica',
      'holo-card-set',
      'neon-poster-set',
      'figure-case',
      'signed-print',
    ],
    offer: 'Limited quantities, new pieces weekly',
  },
  {
    slug: 'sound-system',
    name: 'Sound System',
    kicker: 'Audio 06',
    description: 'Headphones, speakers and microphones for the desk and everywhere else.',
    image: { src: bannerAudio.src, alt: 'Sound System collection banner' },
    productSlugs: [
      'fang-earbuds',
      'hunter-over-ear',
      'desk-speaker',
      'broadcast-mic',
      'neon-headphones',
      'gaming-bud-pro',
    ],
    offer: 'Up to 20% off audio gear',
  },
];

export function productsForCollection(collection: Collection, products: Product[]): Product[] {
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  return collection.productSlugs
    .map((slug) => bySlug.get(slug))
    .filter((product): product is Product => product !== undefined);
}
