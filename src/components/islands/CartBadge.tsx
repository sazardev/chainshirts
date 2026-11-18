import { cartItemCount } from '../../lib/domain/cart';
import { clientHref } from '../../lib/paths';
import { selectCart } from '../../lib/store/selectors';
import { useStoreState } from './ui/use-store';

export default function CartBadge() {
  const state = useStoreState();
  const count = cartItemCount(selectCart(state, state.activeUserId));

  return (
    <a
      href={clientHref('/cart')}
      class="relative inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-surface px-3 text-body-md font-semibold text-text transition-colors duration-quick hover:bg-surface-hover"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path d="M3 4h2l2.4 11h9.2l2.4-8H6" />
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="17" cy="20" r="1.5" />
      </svg>
      <span>Cart</span>
      <span class="inline-flex min-w-6 items-center justify-center rounded-full bg-brand px-1 text-body-sm font-bold text-on-brand">
        {count}
      </span>
      <span class="sr-only">items in cart</span>
    </a>
  );
}
