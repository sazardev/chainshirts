import { signal } from '@preact/signals';
import { useEffect } from 'preact/hooks';

const visible = signal(0);
const maxPrice = signal(200);

function cards(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-product-card]'));
}

function apply(sort: string, ceiling: number, saleOnly: boolean) {
  const all = cards();
  const matching = all.filter((card) => {
    const price = Number(card.dataset.price ?? '0');
    const onSale = card.dataset.onsale === 'true';
    return price <= ceiling && (!saleOnly || onSale);
  });

  if (sort === 'price-asc')
    matching.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
  if (sort === 'price-desc')
    matching.sort((a, b) => Number(b.dataset.price) - Number(a.dataset.price));
  if (sort === 'rating')
    matching.sort((a, b) => Number(b.dataset.rating) - Number(a.dataset.rating));

  const parent = all[0]?.parentElement;
  if (parent)
    matching.forEach((card) => {
      parent.appendChild(card);
    });
  all.forEach((card) => {
    card.hidden = !matching.includes(card);
  });
  visible.value = matching.length;
}

export default function CatalogFilters() {
  const sort = signal('relevance');
  const saleOnly = signal(false);

  useEffect(() => {
    apply(sort.value, maxPrice.value, saleOnly.value);
  }, []);

  return (
    <div class="surface-card flex flex-wrap items-end gap-4 p-4">
      <div class="min-w-44 flex-1">
        <label for="catalog-sort" class="text-body-sm font-semibold text-text">
          Sort by
        </label>
        <select
          id="catalog-sort"
          value={sort.value}
          onChange={(event) => {
            sort.value = (event.currentTarget as HTMLSelectElement).value;
            apply(sort.value, maxPrice.value, saleOnly.value);
          }}
          class="mt-1 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-body-md"
        >
          <option value="relevance">Recommended</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="rating">Top rated</option>
        </select>
      </div>

      <div class="min-w-44 flex-1">
        <label for="catalog-max" class="text-body-sm font-semibold text-text">
          Max price
        </label>
        <input
          id="catalog-max"
          type="range"
          min="20"
          max="200"
          step="10"
          value={maxPrice.value}
          onInput={(event) => {
            maxPrice.value = Number((event.currentTarget as HTMLInputElement).value);
            apply(sort.value, maxPrice.value, saleOnly.value);
          }}
          class="mt-3 w-full accent-brand"
        />
        <p class="text-body-sm text-muted">Up to ${maxPrice.value}</p>
      </div>

      <label class="flex min-h-11 cursor-pointer items-center gap-2 text-body-md font-semibold text-text">
        <input
          type="checkbox"
          checked={saleOnly.value}
          onChange={(event) => {
            saleOnly.value = (event.currentTarget as HTMLInputElement).checked;
            apply(sort.value, maxPrice.value, saleOnly.value);
          }}
          class="h-5 w-5 accent-brand"
        />
        On sale only
      </label>

      <p class="ml-auto text-body-sm font-semibold text-muted" role="status" aria-live="polite">
        {visible.value} results
      </p>
    </div>
  );
}
