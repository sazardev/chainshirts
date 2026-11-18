import type { Comment, PersistedState, Profile } from './schema';
import { SCHEMA_VERSION } from './schema';

/** Fixed seed and calendar date keep the fictional social layer deterministic. */
const SEED = 20260115;
const SEEDED_AT = '2026-01-15T10:00:00.000Z';

const SEED_PRODUCT_IDS = [
  'p-tee-01',
  'p-tee-02',
  'p-hood-01',
  'p-hood-02',
  'p-pant-01',
  'p-mouse-01',
  'p-key-01',
  'p-key-02',
  'p-acc-01',
];

const FICTIONAL_PROFILES: Profile[] = [
  { id: 'u-velvet', displayName: 'Velvet Fang', avatar: 'VF', createdAt: SEEDED_AT },
  { id: 'u-denji', displayName: 'Denji D.', avatar: 'DD', createdAt: SEEDED_AT },
  { id: 'u-siren', displayName: 'Siren Unit', avatar: 'SU', createdAt: SEEDED_AT },
];

const FALLBACK_PROFILE: Profile = FICTIONAL_PROFILES[0] ?? {
  id: 'u-velvet',
  displayName: 'Velvet Fang',
  avatar: 'VF',
  createdAt: SEEDED_AT,
};
const FALLBACK_PRODUCT_ID: string = SEED_PRODUCT_IDS[0] ?? 'p-tee-01';

const SEED_COMMENT_TEXTS = [
  'The print holds up after a full wash cycle. Genuinely surprised.',
  'Wore this to the convention and got stopped three times.',
  'Fit is boxy in the best way. Size up for the oversleeve look.',
  'The neon detail is sharper in person than in the product art.',
  'My everyday desk upgrade. No regrets.',
  'Fabric feels heavier than the price suggests.',
  'Pairs perfectly with the matching hoodie.',
  'Bought two. The second one is for my brother.',
];

function createRng(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

export function seedState(state: PersistedState): PersistedState {
  if (state.profiles.length > 0) return state;

  const random = createRng(SEED);
  const comments: Comment[] = SEED_COMMENT_TEXTS.map((text, index) => {
    const author = FICTIONAL_PROFILES[index % FICTIONAL_PROFILES.length] ?? FALLBACK_PROFILE;
    const productId = SEED_PRODUCT_IDS[index % SEED_PRODUCT_IDS.length] ?? FALLBACK_PRODUCT_ID;
    const hoursAgo = 2 + Math.floor(random() * 160);
    return {
      id: `c-seed-${index + 1}`,
      productId,
      userId: author.id,
      text,
      createdAt: new Date(Date.parse(SEEDED_AT) - hoursAgo * 3_600_000).toISOString(),
    };
  });

  return {
    ...state,
    schemaVersion: SCHEMA_VERSION,
    profiles: [...FICTIONAL_PROFILES],
    comments,
  };
}

export function seedProfileList(): Profile[] {
  return [...FICTIONAL_PROFILES];
}
