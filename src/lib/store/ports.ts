import type { Result, StoreError } from '../domain/errors';
import type { PersistedState } from './schema';

export interface Clock {
  now(): string;
}

export interface IdGenerator {
  next(prefix: string): string;
}

export interface StorePort {
  read(): Result<PersistedState, StoreError>;
  write(state: PersistedState): Result<void, StoreError>;
  clear(): Result<void, StoreError>;
}

export const systemClock: Clock = {
  now: () => new Date().toISOString(),
};

export const randomIds: IdGenerator = {
  next(prefix: string): string {
    const stamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 8);
    return `${prefix}-${stamp}-${random}`;
  },
};
