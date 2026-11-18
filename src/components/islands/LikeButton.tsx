import type { Product } from '../../lib/domain/product';
import { like } from '../../lib/reactive/actions';
import { isLiked, selectLikeCount } from '../../lib/store/selectors';
import { useStoreState } from './ui/use-store';

interface Props {
  product: Product;
  compact?: boolean;
}

export default function LikeButton({ product, compact = false }: Props) {
  const state = useStoreState();
  const liked = isLiked(state, state.activeUserId, product.id);
  const count = selectLikeCount(state, product);

  const label = `${liked ? 'Remove from favourites' : 'Add to favourites'}: ${product.name}`;
  const handleClick = () => like(product.id);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={liked}
      aria-label={`${label}, ${count} likes`}
      title={label}
      class={`inline-flex min-h-11 items-center gap-2 rounded-md border px-3 text-body-md font-semibold transition-colors duration-quick ${
        liked
          ? 'border-magenta bg-magenta/10 text-magenta'
          : 'border-border bg-surface text-text hover:bg-surface-hover'
      }`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
      </svg>
      <span aria-hidden="true">{count}</span>
      {!compact && <span class="sr-only">likes</span>}
    </button>
  );
}
