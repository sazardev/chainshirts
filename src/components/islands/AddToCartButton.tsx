import type { Product } from '../../lib/domain/product';
import { isClothing } from '../../lib/domain/product';
import { clientHref } from '../../lib/paths';
import { addToCart } from '../../lib/reactive/actions';
import { Button } from './ui/Button';

export default function AddToCartButton({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  if (isClothing(product)) {
    return (
      <a
        href={clientHref(`/products/${product.slug}`)}
        class="inline-flex min-h-11 items-center justify-center rounded-md bg-brand px-4 text-body-md font-semibold text-on-brand shadow-button transition-colors duration-quick hover:bg-brand-hover"
      >
        Choose size
      </a>
    );
  }

  return (
    <Button
      variant="primary"
      onClick={() => addToCart(product, 'ONE_SIZE', product.colors[0] ?? 'obsidian', 1)}
      fullWidth={compact}
    >
      Add to cart
    </Button>
  );
}
