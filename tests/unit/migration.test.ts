import { describe, expect, it } from 'vitest';
import { migrateState } from '../../src/lib/store/migrate';
import { emptyState, SCHEMA_VERSION } from '../../src/lib/store/schema';

describe('stored state migration', () => {
  it('seeds a fresh store when nothing is stored', () => {
    const result = migrateState(null);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.reseeded).toBe(true);
      expect(result.value.state.profiles.length).toBeGreaterThan(0);
      expect(result.value.state.comments.length).toBeGreaterThan(0);
    }
  });

  it('validates current-version state without reseeding', () => {
    const current = JSON.stringify(emptyState());
    const result = migrateState(current);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.reseeded).toBe(false);
      expect(result.value.state.schemaVersion).toBe(SCHEMA_VERSION);
    }
  });

  it('upgrades v1 orders and keeps user data', () => {
    const legacy = JSON.stringify({
      schemaVersion: 1,
      activeUserId: 'u-1',
      profiles: [
        { id: 'u-1', displayName: 'Tester', avatar: 'T', createdAt: '2026-01-01T00:00:00.000Z' },
      ],
      likes: [],
      comments: [],
      carts: [],
      orders: [
        {
          id: 'order-1',
          userId: 'u-1',
          lines: [],
          total: 5000,
          placedAt: '2026-01-02T00:00:00.000Z',
        },
      ],
    });
    const result = migrateState(legacy);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.state.orders[0]?.totalMinor).toBe(5000);
      expect(result.value.state.orders[0]?.status).toBe('confirmed');
      expect(result.value.notice).toContain('upgraded');
    }
  });

  it('resets unreadable and unknown-version data instead of crashing', () => {
    for (const raw of ['{not json', JSON.stringify({ schemaVersion: 99 })]) {
      const result = migrateState(raw);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value.reseeded).toBe(true);
    }
  });
});
