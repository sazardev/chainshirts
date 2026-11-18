import { useSignal } from '@preact/signals';
import {
  cartLineKey,
  cartLineTotalMinor,
  cartTotalMinor,
  MAX_QUANTITY,
} from '../../lib/domain/cart';
import { formatMoney } from '../../lib/domain/money';
import { sizeLabel } from '../../lib/domain/product';
import { clientHref } from '../../lib/paths';
import { removeLine, setQuantity } from '../../lib/reactive/actions';
import { selectCart } from '../../lib/store/selectors';
import { useStoreState } from './ui/use-store';

export default function CartPage() {
  const state = useStoreState();
  const cart = selectCart(state, state.activeUserId);
  const total = cartTotalMinor(cart);
  const justChanged = useSignal('');

  if (cart.items.length === 0) {
    return (
      <div class="surface-card mx-auto flex max-w-md flex-col items-start gap-3 p-6" role="status">
        <h2 class="text-heading-lg font-semibold text-text">Your cart is empty</h2>
        <p class="text-body-md text-muted">Browse the catalog and add something you like.</p>
        <a
          href={clientHref('/catalog')}
          class="inline-flex min-h-11 items-center rounded-md bg-brand px-4 text-body-md font-semibold text-on-brand hover:bg-brand-hover"
        >
          Browse the catalog
        </a>
      </div>
    );
  }

  return (
    <div class="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <section aria-labelledby="cart-items-heading">
        <h2 id="cart-items-heading" class="text-heading-lg font-semibold text-text">
          Items ({cart.items.length})
        </h2>
        <div class="surface-card mt-4 overflow-x-auto">
          <table class="w-full min-w-[36rem] border-collapse text-left">
            <caption class="sr-only">Cart line items</caption>
            <thead>
              <tr class="border-b border-border text-body-sm text-muted">
                <th scope="col" class="p-4 font-semibold">
                  Product
                </th>
                <th scope="col" class="p-4 font-semibold">
                  Size
                </th>
                <th scope="col" class="p-4 font-semibold">
                  Quantity
                </th>
                <th scope="col" class="p-4 text-right font-semibold">
                  Line total
                </th>
                <th scope="col" class="p-4">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map((item) => {
                const key = cartLineKey(item);
                return (
                  <tr key={key} class="border-b border-border last:border-0">
                    <td class="p-4">
                      <div class="flex items-center gap-3">
                        <img
                          src={item.image.src}
                          alt={item.image.alt}
                          width="56"
                          height="56"
                          class="h-14 w-14 rounded-md object-cover"
                        />
                        <span class="text-body-md font-semibold text-text">{item.name}</span>
                      </div>
                    </td>
                    <td class="p-4 text-body-md text-muted">
                      {sizeLabel(item.size)} · {item.color}
                    </td>
                    <td class="p-4">
                      <div class="inline-flex items-center rounded-md border border-border">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${item.name}`}
                          onClick={() => {
                            setQuantity(item, item.quantity - 1);

                            justChanged.value = `${item.name} quantity updated`;
                          }}
                          class="min-h-11 min-w-11 text-body-lg text-text hover:bg-surface-hover"
                        >
                          −
                        </button>
                        <span
                          class="min-w-8 text-center text-body-md font-semibold"
                          aria-live="polite"
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${item.name}`}
                          disabled={item.quantity >= MAX_QUANTITY}
                          onClick={() => {
                            setQuantity(item, item.quantity + 1);
                            justChanged.value = `${item.name} quantity updated`;
                          }}
                          class="min-h-11 min-w-11 text-body-lg text-text hover:bg-surface-hover disabled:text-disabled"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td class="p-4 text-right text-body-md font-semibold tabular-nums">
                      {formatMoney(cartLineTotalMinor(item))}
                    </td>
                    <td class="p-4 text-right">
                      <button
                        type="button"
                        aria-label={`Remove ${item.name} from cart`}
                        onClick={() => removeLine(item)}
                        class="min-h-11 rounded px-2 text-body-sm font-semibold text-critical hover:bg-danger/10"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p class="mt-2 text-body-sm text-muted" role="status" aria-live="polite">
          {justChanged.value}
        </p>
      </section>

      <aside class="surface-card h-fit p-5" aria-labelledby="cart-summary-heading">
        <h2 id="cart-summary-heading" class="text-heading-lg font-semibold text-text">
          Summary
        </h2>
        <dl class="mt-4 flex flex-col gap-3 text-body-md">
          <div class="flex justify-between">
            <dt class="text-muted">Subtotal</dt>
            <dd class="font-semibold tabular-nums">{formatMoney(total)}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted">Shipping</dt>
            <dd class="font-semibold text-success">Free</dd>
          </div>
          <div class="flex justify-between border-t border-border pt-3 text-body-lg">
            <dt class="font-semibold">Total</dt>
            <dd class="font-bold tabular-nums">{formatMoney(total)}</dd>
          </div>
        </dl>
        <a
          href={clientHref('/checkout')}
          class="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-brand px-4 text-body-md font-semibold text-on-brand shadow-button hover:bg-brand-hover"
        >
          Checkout
        </a>
        <p class="mt-3 text-body-sm text-muted">Taxes calculated at checkout.</p>
      </aside>
    </div>
  );
}
