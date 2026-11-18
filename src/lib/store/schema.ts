import { z } from 'zod';
import type { Cart } from '../domain/cart';
import type { Order } from '../domain/order';

export const SCHEMA_VERSION = 2;
export const STORAGE_KEY = 'chainshirts.store.v2';

export interface Profile {
  id: string;
  displayName: string;
  avatar: string;
  createdAt: string;
}

export interface Like {
  userId: string;
  productId: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  productId: string;
  userId: string;
  text: string;
  createdAt: string;
  editedAt?: string | undefined;
}

export interface PersistedState {
  schemaVersion: number;
  activeUserId: string | null;
  profiles: Profile[];
  likes: Like[];
  comments: Comment[];
  carts: Cart[];
  orders: Order[];
}

const profileSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  avatar: z.string(),
  createdAt: z.string(),
});

const likeSchema = z.object({
  userId: z.string(),
  productId: z.string(),
  createdAt: z.string(),
});

const commentSchema = z.object({
  id: z.string(),
  productId: z.string(),
  userId: z.string(),
  text: z.string(),
  createdAt: z.string(),
  editedAt: z.string().optional(),
});

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
const colorSchema = z.enum(['obsidian', 'bone', 'blood-red', 'neon-cyan', 'neon-violet', 'steel']);

const cartSchema = z.object({
  userId: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      size: sizeSchema,
      color: colorSchema.default('obsidian'),
      quantity: z.number(),
      unitPriceMinor: z.number(),
      image: z.object({ src: z.string(), alt: z.string() }),
    }),
  ),
  updatedAt: z.string(),
});

const orderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  lines: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      size: sizeSchema,
      color: colorSchema.default('obsidian'),
      quantity: z.number(),
      unitPriceMinor: z.number(),
      imageSrc: z.string(),
    }),
  ),
  subtotalMinor: z.number().default(0),
  discountMinor: z.number().default(0),
  promoCode: z.string().default(''),
  totalMinor: z.number(),
  currency: z.literal('USD'),
  status: z.literal('confirmed'),
  placedAt: z.string(),
  fakeShippingInfo: z.object({
    fullName: z.string(),
    address: z.string(),
    city: z.string(),
    postalCode: z.string(),
  }),
});

export const persistedStateSchema = z.object({
  schemaVersion: z.number(),
  activeUserId: z.string().nullable(),
  profiles: z.array(profileSchema),
  likes: z.array(likeSchema),
  comments: z.array(commentSchema),
  carts: z.array(cartSchema),
  orders: z.array(orderSchema),
});

export function emptyState(): PersistedState {
  return {
    schemaVersion: SCHEMA_VERSION,
    activeUserId: null,
    profiles: [],
    likes: [],
    comments: [],
    carts: [],
    orders: [],
  };
}

export function activeProfile(state: PersistedState): Profile | null {
  if (state.activeUserId === null) return null;
  return state.profiles.find((profile) => profile.id === state.activeUserId) ?? null;
}
