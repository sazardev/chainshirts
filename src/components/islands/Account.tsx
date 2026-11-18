import { useSignal } from '@preact/signals';
import { formatMoney } from '../../lib/domain/money';
import type { Product } from '../../lib/domain/product';
import { fullTimestamp, relativeTime } from '../../lib/format-date';
import { clientHref } from '../../lib/paths';
import { resetData } from '../../lib/reactive/actions';
import { activeProfile } from '../../lib/store/schema';
import { selectOrders, selectUserComments, selectUserLikes } from '../../lib/store/selectors';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { useStoreState } from './ui/use-store';

export default function Account({ products }: { products: Product[] }) {
  const state = useStoreState();
  const profile = activeProfile(state);
  const likes = selectUserLikes(state, state.activeUserId);
  const comments = selectUserComments(state, state.activeUserId);
  const orders = selectOrders(state, state.activeUserId);
  const confirmingReset = useSignal(false);
  const productById = new Map(products.map((product) => [product.id, product]));

  if (!profile) {
    return (
      <div class="surface-card mx-auto flex max-w-md flex-col items-start gap-3 p-6" role="status">
        <h2 class="text-heading-lg font-semibold text-text">No account yet</h2>
        <p class="text-body-md text-muted">
          Create an account to keep your favourites, reviews and orders in one place.
        </p>
        <a
          href={clientHref('/profile')}
          class="inline-flex min-h-11 items-center rounded-md bg-brand px-4 text-body-md font-semibold text-on-brand hover:bg-brand-hover"
        >
          Create an account
        </a>
      </div>
    );
  }

  return (
    <div class="flex flex-col gap-6">
      <section
        class="surface-card flex flex-wrap items-center gap-4 p-5"
        aria-labelledby="account-profile-heading"
      >
        <span
          class="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-body-md font-bold text-on-brand"
          aria-hidden="true"
        >
          {profile.avatar}
        </span>
        <div class="flex-1">
          <h2 id="account-profile-heading" class="text-heading-lg font-semibold text-text">
            {profile.displayName}
          </h2>
          <p class="text-body-sm text-muted">Member since {fullTimestamp(profile.createdAt)}</p>
        </div>
        <a
          href={clientHref('/profile')}
          class="min-h-11 text-body-md font-semibold text-link hover:underline"
        >
          Switch profile
        </a>
      </section>

      <div class="grid gap-6 lg:grid-cols-2">
        <section class="surface-card p-5" aria-labelledby="account-likes-heading">
          <div class="flex items-center justify-between">
            <h2 id="account-likes-heading" class="text-heading-lg font-semibold text-text">
              Likes
            </h2>
            <Badge tone="critical">{likes.length}</Badge>
          </div>
          {likes.length === 0 ? (
            <Empty text="No likes yet. Tap the heart on any product." />
          ) : (
            <ul class="mt-4 flex flex-col gap-2">
              {likes.map((productId) => {
                const product = productById.get(productId);
                return (
                  <li key={productId}>
                    {product ? (
                      <a
                        href={clientHref(`/products/${product.slug}`)}
                        class="text-body-md text-link hover:underline"
                      >
                        {product.name}
                      </a>
                    ) : (
                      <span class="text-body-md text-muted">
                        Product no longer in the catalog ({productId})
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section class="surface-card p-5" aria-labelledby="account-comments-heading">
          <div class="flex items-center justify-between">
            <h2 id="account-comments-heading" class="text-heading-lg font-semibold text-text">
              Comments
            </h2>
            <Badge>{comments.length}</Badge>
          </div>
          {comments.length === 0 ? (
            <Empty text="No comments yet. Join a product discussion." />
          ) : (
            <ul class="mt-4 flex flex-col gap-3">
              {comments.map((comment) => (
                <li key={comment.id} class="border-b border-border pb-3 last:border-0 last:pb-0">
                  <p class="text-body-md text-text">“{comment.text}”</p>
                  <p class="mt-1 text-body-sm text-muted">
                    {productById.get(comment.productId)?.name ?? 'Archived product'} ·{' '}
                    {relativeTime(comment.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section class="surface-card p-5" aria-labelledby="account-orders-heading">
        <div class="flex items-center justify-between">
          <h2 id="account-orders-heading" class="text-heading-lg font-semibold text-text">
            Order history
          </h2>
          <Badge tone="success">{orders.length}</Badge>
        </div>
        {orders.length === 0 ? (
          <Empty text="No orders yet. Your orders will appear here." />
        ) : (
          <ul class="mt-4 flex flex-col gap-4">
            {orders.map((order) => (
              <li key={order.id} class="border-b border-border pb-4 last:border-0 last:pb-0">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p class="text-body-md font-semibold text-text">{order.id}</p>
                    <p class="text-body-sm text-muted">
                      {fullTimestamp(order.placedAt)} · {order.lines.length} line(s)
                    </p>
                  </div>
                  <div class="text-right">
                    <Badge tone="success">✓ {order.status}</Badge>
                    <p class="mt-1 text-body-md font-bold tabular-nums">
                      {formatMoney(order.totalMinor, order.currency)}
                    </p>
                  </div>
                </div>
                <ul class="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {order.lines.map((line) => (
                    <li key={`${line.productId}-${line.size}`} class="text-body-sm text-muted">
                      {line.name} × {line.quantity}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section class="rounded-lg border border-danger/50 p-5" aria-labelledby="danger-heading">
        <h2 id="danger-heading" class="text-heading-lg font-semibold text-critical">
          Danger zone
        </h2>
        <p class="mt-1 text-body-md text-muted">
          Permanently delete your saved account details, favourites, reviews and order history.
        </p>
        <div class="mt-3">
          <Button tone="critical" onClick={() => (confirmingReset.value = true)}>
            Delete account data
          </Button>
        </div>
        {confirmingReset.value && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-dialog-heading"
            class="surface-card mt-4 max-w-md p-5 shadow-modal"
          >
            <h3 id="reset-dialog-heading" class="text-heading-md font-semibold text-text">
              Reset everything?
            </h3>
            <p class="mt-1 text-body-md text-muted">This action cannot be undone.</p>
            <div class="mt-4 flex gap-2">
              <Button
                tone="critical"
                onClick={() => {
                  resetData();
                  confirmingReset.value = false;
                }}
              >
                Yes, delete
              </Button>
              <Button onClick={() => (confirmingReset.value = false)}>Cancel</Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p class="mt-3 text-body-md text-muted" role="status">
      {text}
    </p>
  );
}
