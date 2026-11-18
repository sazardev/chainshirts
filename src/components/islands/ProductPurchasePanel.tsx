import { useSignal } from '@preact/signals';
import { formatMoney } from '../../lib/domain/money';
import type { Product, ProductColor, ProductSize } from '../../lib/domain/product';
import { COLOR_SWATCH, colorLabel, sizeLabel } from '../../lib/domain/product';
import { addToCart } from '../../lib/reactive/actions';
import { Button } from './ui/Button';
import { Field, inputClass } from './ui/Field';

export default function ProductPurchasePanel({ product }: { product: Product }) {
  const defaultSize = product.sizes[0] ?? 'ONE_SIZE';
  const selectedSize = useSignal<ProductSize>(defaultSize);
  const selectedColor = useSignal<ProductColor>(product.colors[0] ?? 'obsidian');
  const quantity = useSignal(1);
  const quantityError = useSignal('');

  function submit(event: Event) {
    event.preventDefault();
    const amount = Number(quantity.value);
    if (!Number.isInteger(amount) || amount < 1 || amount > 99) {
      quantityError.value = 'Choose a quantity between 1 and 99.';
      return;
    }
    quantityError.value = '';
    addToCart(product, selectedSize.value, selectedColor.value, amount);
  }

  return (
    <form onSubmit={submit} class="flex flex-col gap-5">
      <div>
        <p class="text-body-sm text-muted">{formatMoney(product.priceMinor, product.currency)}</p>
        <h1 class="mt-1 text-display font-bold leading-tight text-text">{product.name}</h1>
      </div>

      <fieldset>
        <legend class="text-body-md font-semibold text-text">Size</legend>
        <div class="mt-2 flex flex-wrap gap-2">
          {product.sizes.map((size) => (
            <label
              key={size}
              class={`inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md border px-3 text-body-md font-semibold ${
                selectedSize.value === size
                  ? 'border-brand bg-brand text-on-brand'
                  : 'border-border bg-surface text-text hover:bg-surface-hover'
              }`}
            >
              <input
                type="radio"
                name="size"
                value={size}
                checked={selectedSize.value === size}
                onChange={() => (selectedSize.value = size)}
                class="sr-only"
              />
              {sizeLabel(size)}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend class="text-body-md font-semibold text-text">
          Colour · <span class="font-normal text-muted">{colorLabel(selectedColor.value)}</span>
        </legend>
        <div class="mt-2 flex flex-wrap gap-2">
          {product.colors.map((color) => (
            <label
              key={color}
              title={colorLabel(color)}
              class={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-2 p-1 ${
                selectedColor.value === color ? 'border-brand' : 'border-transparent'
              }`}
            >
              <input
                type="radio"
                name="color"
                value={color}
                checked={selectedColor.value === color}
                onChange={() => (selectedColor.value = color)}
                class="sr-only"
                aria-label={colorLabel(color)}
              />
              <span
                class={`h-full w-full rounded-full border ${COLOR_SWATCH[color]}`}
                aria-hidden="true"
              />
            </label>
          ))}
        </div>
      </fieldset>

      <Field id="quantity" label="Quantity" error={quantityError.value || undefined}>
        <input
          id="quantity"
          type="number"
          min="1"
          max="99"
          value={quantity.value}
          onInput={(event) =>
            (quantity.value = Number((event.currentTarget as HTMLInputElement).value))
          }
          aria-invalid={quantityError.value ? 'true' : undefined}
          aria-describedby={quantityError.value ? 'quantity-error' : undefined}
          class={inputClass}
        />
      </Field>

      <div class="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary">
          Add to cart
        </Button>
      </div>

      <p class="text-body-sm text-muted">Free shipping on orders over $75 · 30-day returns.</p>
    </form>
  );
}
