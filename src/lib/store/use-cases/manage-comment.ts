import { err, ok, type Result } from '../../domain/errors';
import type { Clock, StorePort } from '../ports';
import type { Comment } from '../schema';
import { MAX_COMMENT_LENGTH } from './add-comment';

export function editComment(
  store: StorePort,
  clock: Clock,
  userId: string | null,
  commentId: string,
  text: string,
): Result<Comment> {
  if (userId === null) return err({ code: 'no_profile', message: 'Create a profile first.' });
  const trimmed = text.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_COMMENT_LENGTH) {
    return err({
      code: 'invalid_field',
      field: 'text',
      message: 'Write a comment of 1–500 characters.',
    });
  }

  const read = store.read();
  if (!read.ok) return err(read.error);
  const existing = read.value.comments.find((comment) => comment.id === commentId);
  if (!existing) return err({ code: 'not_found', message: 'That comment no longer exists.' });
  if (existing.userId !== userId) {
    return err({ code: 'not_found', message: 'You can only edit your own comments.' });
  }

  const updated: Comment = { ...existing, text: trimmed, editedAt: clock.now() };
  const write = store.write({
    ...read.value,
    comments: read.value.comments.map((comment) => (comment.id === commentId ? updated : comment)),
  });
  if (!write.ok) return err(write.error);
  return ok(updated);
}

export function deleteComment(
  store: StorePort,
  userId: string | null,
  commentId: string,
): Result<void> {
  if (userId === null) return err({ code: 'no_profile', message: 'Create a profile first.' });
  const read = store.read();
  if (!read.ok) return err(read.error);
  const existing = read.value.comments.find((comment) => comment.id === commentId);
  if (!existing) return err({ code: 'not_found', message: 'That comment no longer exists.' });
  if (existing.userId !== userId) {
    return err({ code: 'not_found', message: 'You can only delete your own comments.' });
  }

  const write = store.write({
    ...read.value,
    comments: read.value.comments.filter((comment) => comment.id !== commentId),
  });
  if (!write.ok) return err(write.error);
  return ok(undefined);
}
