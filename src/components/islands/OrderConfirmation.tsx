import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { formatMoney } from '../../lib/domain/money';
import type { Order } from '../../lib/domain/order';
import { sizeLabel } from '../../lib/domain/product';
import { fullTimestamp } from '../../lib/format-date';
import { clientHref } from '../../lib/paths';
import { useStoreState } from './ui/use-store';

export default function OrderConfirmation() {
  const orderId = useSignal<string | null>(null);

  useEffect(() => {
    orderId.value = new URLSearchParams(window.location.search).get('order');
  }, []);

  const state = useStoreState();
  const order: Order | undefined = state.orders.find((entry) => entry.id === orderId.value);

  if (orderId.value === null) {
    return <WaitingState />;
  }

  if (!order) {
    return (
      <div class="surface-card mx-auto flex max-w-md flex-col items-start gap-3 p-6" role="status">
        <h2 class="text-heading-lg font-semibold text-text">Order not found</h2>
        <p class="text-body-md text-muted">This browser has no record of that order id.</p>
        <a
          href={clientHref('/account')}
          class="min-h-11 text-body-md font-semibold text-link hover:underline"
        >
          View order history
        </a>
      </div>
    );
  }

  return (
    <div class="mx-auto max-w-2xl">
      <div class="surface-card canvas-panel p-6 sm:p-8">
        <p class="eyebrow">Order confirmed</p>
        <h1 class="mt-2 text-display font-bold">Thanks, {order.fakeShippingInfo.fullName}.</h1>
        <p class="mt-3 text-body-lg text-accent-text/80">
          Your order is confirmed and is being prepared for dispatch.
        </p>
        <dl class="mt-6 grid gap-4 text-body-md sm:grid-cols-2">
          <div>
            <dt class="text-muted">Order id</dt>
            <dd class="font-semibold tabular-nums">{order.id}</dd>
          </div>
          <div>
            <dt class="text-muted">Placed</dt>
            <dd class="font-semibold">{fullTimestamp(order.placedAt)}</dd>
          </div>
          <div>
            <dt class="text-muted">Ship to</dt>
            <dd class="font-semibold">
              {order.fakeShippingInfo.address}, {order.fakeShippingInfo.city}{' '}
              {order.fakeShippingInfo.postalCode}
            </dd>
          </div>
          <div>
            <dt class="text-muted">Status</dt>
            <dd class="font-semibold text-success">✓ {order.status}</dd>
          </div>
        </dl>
      </div>

      <section aria-labelledby="confirmation-lines-heading" class="surface-card mt-6 p-5">
        <h2 id="confirmation-lines-heading" class="text-heading-lg font-semibold text-text">
          Your items
        </h2>
        <ul class="mt-4 flex flex-col gap-4">
          {order.lines.map((line) => (
            <li
              key={`${line.productId}-${line.size}`}
              class="flex items-center gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
            >
              <img
                src={line.imageSrc}
                alt=""
                width="56"
                height="56"
                class="h-14 w-14 rounded-md object-cover"
              />
              <div class="flex-1">
                <p class="text-body-md font-semibold text-text">{line.name}</p>
                <p class="text-body-sm text-muted">
                  {sizeLabel(line.size)} · {line.color} · Qty {line.quantity}
                </p>
              </div>
              <p class="text-body-md font-semibold tabular-nums">
                {formatMoney(line.quantity * line.unitPriceMinor)}
              </p>
            </li>
          ))}
        </ul>
        <dl class="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-body-md">
          <div class="flex justify-between">
            <dt class="text-muted">Subtotal</dt>
            <dd class="tabular-nums">{formatMoney(order.subtotalMinor, order.currency)}</dd>
          </div>
          {order.discountMinor > 0 && (
            <div class="flex justify-between text-success">
              <dt>{order.promoCode} discount</dt>
              <dd class="tabular-nums">−{formatMoney(order.discountMinor, order.currency)}</dd>
            </div>
          )}
          <div class="flex justify-between border-t border-border pt-2 text-body-lg font-bold">
            <dt>Total</dt>
            <dd class="tabular-nums">{formatMoney(order.totalMinor, order.currency)}</dd>
          </div>
        </dl>
      </section>

      <div class="mt-6 flex flex-wrap gap-3">
        <a
          href={clientHref('/account')}
          class="inline-flex min-h-11 items-center rounded-md bg-brand px-4 text-body-md font-semibold text-on-brand hover:bg-brand-hover"
        >
          View order history
        </a>
        <a
          href={clientHref('/catalog')}
          class="inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 text-body-md font-semibold text-text hover:bg-surface-hover"
        >
          Keep browsing
        </a>
      </div>
    </div>
  );
}

function WaitingState() {
  return (
    <div class="surface-card mx-auto max-w-md p-6" role="status" aria-live="polite">
      <h2 class="text-heading-lg font-semibold text-text">Loading confirmation…</h2>
      <p class="mt-2 text-body-md text-muted">Loading your order…</p>
    </div>
  );
}
