import { err, ok, type Result, type StoreError } from '../domain/errors';
import { migrateState } from './migrate';
import type { StorePort } from './ports';
import { type PersistedState, STORAGE_KEY } from './schema';

export const STATE_EVENT = 'chainshirts:state';

function storage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export class LocalStorageStore implements StorePort {
  private fallback: string | null = null;
  private unavailable = false;

  read(): Result<PersistedState, StoreError> {
    let raw: string | null = this.fallback;
    const local = storage();
    if (local) {
      try {
        raw = local.getItem(STORAGE_KEY);
      } catch {
        this.unavailable = true;
        return err({
          code: 'storage_unavailable',
          message: 'We could not save your changes. Please try again.',
        });
      }
    } else {
      this.unavailable = true;
    }

    const migration = migrateState(raw);
    if (!migration.ok) return err(migration.error);

    if (migration.value.reseeded || raw === null) {
      const saved = this.write(migration.value.state);
      if (!saved.ok) return err(saved.error);
    }
    return ok(migration.value.state);
  }

  write(state: PersistedState): Result<void, StoreError> {
    let serialized: string;
    try {
      serialized = JSON.stringify(state);
    } catch {
      return err({ code: 'storage_full', message: 'The store could not save your changes.' });
    }

    this.fallback = serialized;
    const local = storage();
    if (local) {
      try {
        local.setItem(STORAGE_KEY, serialized);
        this.unavailable = false;
      } catch {
        return err({
          code: 'storage_full',
          message: 'We could not save your changes. Please try again.',
        });
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(STATE_EVENT));
    }
    return ok(undefined);
  }

  clear(): Result<void, StoreError> {
    this.fallback = null;
    const local = storage();
    if (local) {
      try {
        local.removeItem(STORAGE_KEY);
      } catch {
        return err({
          code: 'storage_unavailable',
          message: 'We could not access your saved data.',
        });
      }
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(STATE_EVENT));
    }
    return ok(undefined);
  }

  get isUnavailable(): boolean {
    return this.unavailable;
  }
}
