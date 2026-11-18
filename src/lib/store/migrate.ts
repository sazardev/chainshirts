import { ok, type Result } from '../domain/errors';
import { seedState } from './fake-data';
import { emptyState, type PersistedState, persistedStateSchema, SCHEMA_VERSION } from './schema';

export interface MigrationResult {
  state: PersistedState;
  reseeded: boolean;
  notice?: string | undefined;
}

function reseed(notice: string): Result<MigrationResult> {
  return ok({ state: seedState(emptyState()), reseeded: true, notice });
}

function migrateV1(raw: Record<string, unknown>): Record<string, unknown> {
  const orders = Array.isArray(raw.orders) ? raw.orders : [];
  return {
    schemaVersion: SCHEMA_VERSION,
    activeUserId: typeof raw.activeUserId === 'string' ? raw.activeUserId : null,
    profiles: raw.profiles ?? [],
    likes: raw.likes ?? [],
    comments: raw.comments ?? [],
    carts: raw.carts ?? [],
    orders: orders.map((entry) => {
      const order = entry as Record<string, unknown>;
      const { total, ...rest } = order;
      return {
        ...rest,
        totalMinor: typeof total === 'number' ? total : 0,
        currency: order.currency ?? 'USD',
        status: order.status ?? 'confirmed',
        fakeShippingInfo: order.fakeShippingInfo ?? {
          fullName: 'Valued customer',
          address: '',
          city: '',
          postalCode: '',
        },
      };
    }),
  };
}

export function migrateState(raw: string | null): Result<MigrationResult> {
  if (raw === null) return reseed('Welcome to ChainShirts.');

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return reseed('Your saved data could not be read and has been restored.');
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return reseed('Your saved data was invalid and has been restored.');
  }

  const candidate = parsed as Record<string, unknown>;
  const version = candidate.schemaVersion;

  if (version === SCHEMA_VERSION) {
    const current = persistedStateSchema.safeParse(parsed);
    if (current.success) return ok({ state: current.data, reseeded: false });
    return reseed('Stored data did not match the current schema and has been reset.');
  }

  if (version === 1) {
    const upgraded = persistedStateSchema.safeParse(migrateV1(candidate));
    if (upgraded.success) {
      return ok({
        state: upgraded.data,
        reseeded: false,
        notice: 'Your account was upgraded to the latest version.',
      });
    }
    return reseed('Older account data could not be upgraded and was restored.');
  }

  return reseed('Account data came from an unknown version and was restored.');
}
