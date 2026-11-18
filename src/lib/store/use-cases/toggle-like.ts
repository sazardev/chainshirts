import { err, ok, type Result } from '../../domain/errors';
import type { Clock, StorePort } from '../ports';

export interface ToggleLikeInput {
  userId: string | null;
  productId: string;
}

export function toggleLike(
  store: StorePort,
  clock: Clock,
  input: ToggleLikeInput,
): Result<{ liked: boolean }> {
  if (input.userId === null) {
    return err({ code: 'no_profile', message: 'Please sign in to save your favourites.' });
  }

  const read = store.read();
  if (!read.ok) return err(read.error);

  const state = read.value;
  const existing = state.likes.find(
    (like) => like.userId === input.userId && like.productId === input.productId,
  );
  const likes = existing
    ? state.likes.filter((like) => like !== existing)
    : [
        ...state.likes,
        { userId: input.userId, productId: input.productId, createdAt: clock.now() },
      ];

  const write = store.write({ ...state, likes });
  if (!write.ok) return err(write.error);
  return ok({ liked: existing === undefined });
}
