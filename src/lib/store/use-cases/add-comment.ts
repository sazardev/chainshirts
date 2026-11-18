import { err, ok, type Result } from '../../domain/errors';
import type { Clock, IdGenerator, StorePort } from '../ports';
import type { Comment } from '../schema';

export const MAX_COMMENT_LENGTH = 500;

export interface AddCommentInput {
  userId: string | null;
  productId: string;
  text: string;
}

export function addComment(
  store: StorePort,
  clock: Clock,
  ids: IdGenerator,
  input: AddCommentInput,
): Result<Comment> {
  if (input.userId === null) {
    return err({ code: 'no_profile', message: 'Please sign in to join the conversation.' });
  }
  const text = input.text.trim();
  if (text.length === 0 || text.length > MAX_COMMENT_LENGTH) {
    return err({
      code: 'invalid_field',
      field: 'text',
      message: 'Write a comment of 1–500 characters.',
    });
  }

  const read = store.read();
  if (!read.ok) return err(read.error);

  const comment: Comment = {
    id: ids.next('c'),
    productId: input.productId,
    userId: input.userId,
    text,
    createdAt: clock.now(),
  };
  const write = store.write({ ...read.value, comments: [...read.value.comments, comment] });
  if (!write.ok) return err(write.error);
  return ok(comment);
}
