import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { fullTimestamp, relativeTime } from '../../lib/format-date';
import { comment, deleteComment, editComment } from '../../lib/reactive/actions';
import type { Comment } from '../../lib/store/schema';
import { commentAuthor, selectComments } from '../../lib/store/selectors';
import { Button } from './ui/Button';
import { useStoreState } from './ui/use-store';

export default function Comments({ productId }: { productId: string }) {
  const state = useStoreState();
  const comments = selectComments(state, productId);
  const draft = useSignal('');
  const sending = useSignal(false);
  const inlineError = useSignal('');
  const editingId = useSignal<string | null>(null);
  const editingText = useSignal('');
  const confirmingDelete = useSignal<string | null>(null);

  useEffect(() => {
    document.getElementById('comment-form')?.setAttribute('data-ready', 'true');
  }, []);

  function submit(event: Event) {
    event.preventDefault();
    const text = draft.value.trim();
    if (text.length === 0) {
      inlineError.value = 'Write a comment before sending.';
      return;
    }
    inlineError.value = '';
    sending.value = true;
    const posted = comment(productId, text);
    if (posted) draft.value = '';
    sending.value = false;
  }

  function saveEdit(commentId: string) {
    if (editComment(commentId, editingText.value)) {
      editingId.value = null;
    }
  }

  return (
    <section aria-labelledby="comments-heading" class="mt-12">
      <div class="flex items-baseline justify-between gap-4">
        <h2 id="comments-heading" class="text-heading-xl font-bold text-text">
          Comments
        </h2>
        <BadgeCount count={comments.length} />
      </div>

      <p class="sr-only" role="status" aria-live="polite">
        {comments.length} comment{comments.length === 1 ? '' : 's'} on this product.
      </p>

      {comments.length === 0 ? (
        <div class="surface-card mt-4 flex max-w-sm flex-col items-start gap-2 p-6" role="status">
          <h3 class="text-heading-md font-semibold text-text">No comments yet</h3>
          <p class="text-body-md text-muted">
            Start the discussion — share how this one fits and feels.
          </p>
        </div>
      ) : (
        <ul class="mt-6 flex flex-col gap-6">
          {comments.map((item) => (
            <CommentItem
              key={item.id}
              item={item}
              authorName={commentAuthor(state, item.userId)?.displayName ?? 'ChainShirts member'}
              isOwn={item.userId === state.activeUserId}
              isEditing={editingId.value === item.id}
              editingText={editingText.value}
              isConfirmingDelete={confirmingDelete.value === item.id}
              onStartEdit={() => {
                editingId.value = item.id;
                editingText.value = item.text;
              }}
              onEditingText={(value) => (editingText.value = value)}
              onSaveEdit={() => saveEdit(item.id)}
              onCancelEdit={() => (editingId.value = null)}
              onRequestDelete={() => (confirmingDelete.value = item.id)}
              onConfirmDelete={() => {
                deleteComment(item.id);
                confirmingDelete.value = null;
              }}
              onCancelDelete={() => (confirmingDelete.value = null)}
            />
          ))}
        </ul>
      )}

      <form id="comment-form" onSubmit={submit} class="surface-card mt-8 flex flex-col gap-3 p-5">
        <label for="comment-text" class="text-body-md font-semibold text-text">
          Add a comment
        </label>
        <textarea
          id="comment-text"
          rows={3}
          maxLength={500}
          value={draft.value}
          onInput={(event) => (draft.value = (event.currentTarget as HTMLTextAreaElement).value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              submit(event);
            }
          }}
          aria-describedby={inlineError.value ? 'comment-error' : 'comment-help'}
          aria-invalid={inlineError.value ? 'true' : undefined}
          class="min-h-11 w-full resize-y rounded-md border border-border bg-surface p-3 text-body-md focus:border-focus focus:outline-none"
          placeholder="Share your take on this product…"
        />
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p id="comment-help" class="text-body-sm text-muted">
            {inlineError.value ? (
              <span id="comment-error" class="text-critical">
                {inlineError.value}
              </span>
            ) : (
              `${draft.value.length}/500 · Cmd/Ctrl+Enter to send`
            )}
          </p>
          <Button
            type="submit"
            variant="primary"
            disabled={draft.value.trim().length === 0 || sending.value}
          >
            {sending.value ? 'Sending…' : 'Post comment'}
          </Button>
        </div>
      </form>
    </section>
  );
}

function BadgeCount({ count }: { count: number }) {
  return (
    <span class="rounded-full border border-border bg-surface-secondary px-2 py-0.5 text-body-sm font-semibold text-muted">
      {count}
    </span>
  );
}

interface ItemProps {
  item: Comment;
  authorName: string;
  isOwn: boolean;
  isEditing: boolean;
  editingText: string;
  isConfirmingDelete: boolean;
  onStartEdit: () => void;
  onEditingText: (value: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onRequestDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

function CommentItem(props: ItemProps) {
  const initials = props.authorName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <li class="flex gap-3">
      <span
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-body-sm font-bold text-text"
        aria-hidden="true"
      >
        {initials}
      </span>
      <div class="min-w-0 flex-1 border-b border-border pb-5">
        <div class="flex flex-wrap items-baseline gap-2">
          <span class="text-body-md font-semibold text-text">{props.authorName}</span>
          <time
            datetime={props.item.createdAt}
            title={fullTimestamp(props.item.createdAt)}
            class="text-body-sm text-muted"
          >
            {relativeTime(props.item.createdAt)}
          </time>
          {props.item.editedAt && <span class="text-body-sm text-muted">(edited)</span>}
        </div>

        {props.isEditing ? (
          <div class="mt-2 flex flex-col gap-2">
            <textarea
              rows={3}
              maxLength={500}
              value={props.editingText}
              onInput={(event) =>
                props.onEditingText((event.currentTarget as HTMLTextAreaElement).value)
              }
              class="min-h-11 w-full resize-y rounded-md border border-border bg-surface p-3 text-body-md focus:border-focus focus:outline-none"
              aria-label="Edit comment"
            />
            <div class="flex gap-2">
              <Button variant="primary" onClick={props.onSaveEdit}>
                Save
              </Button>
              <Button onClick={props.onCancelEdit}>Cancel</Button>
            </div>
          </div>
        ) : (
          <p class="mt-1 whitespace-pre-wrap text-body-lg text-text">{props.item.text}</p>
        )}

        {props.isOwn && !props.isEditing && (
          <div class="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={props.onStartEdit}
              class="min-h-11 text-body-sm font-semibold text-link hover:underline"
            >
              Edit
            </button>
            {props.isConfirmingDelete ? (
              <span class="flex items-center gap-2 text-body-sm text-critical">
                Delete this comment?
                <button
                  type="button"
                  onClick={props.onConfirmDelete}
                  class="min-h-11 font-semibold underline"
                >
                  Yes, delete
                </button>
                <button
                  type="button"
                  onClick={props.onCancelDelete}
                  class="min-h-11 font-semibold text-muted underline"
                >
                  Cancel
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={props.onRequestDelete}
                class="min-h-11 text-body-sm font-semibold text-critical hover:underline"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
