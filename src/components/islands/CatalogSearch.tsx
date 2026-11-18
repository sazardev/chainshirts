import { signal } from '@preact/signals';
import { useEffect } from 'preact/hooks';

const matches = signal(0);
let timer: number | undefined;

export default function CatalogSearch() {
  const query = signal('');

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get('q') ?? '';
    query.value = initial;
    apply(initial);
  }, []);

  function apply(value: string) {
    const needle = value.trim().toLowerCase();
    let visible = 0;
    const cards = document.querySelectorAll<HTMLElement>('[data-product-card]');
    cards.forEach((card) => {
      const name = (card.dataset.productName ?? '').toLowerCase();
      const show = needle.length === 0 || name.includes(needle);
      card.hidden = !show;
      if (show) visible += 1;
    });
    matches.value = visible;

    const url = new URL(window.location.href);
    if (needle.length === 0) url.searchParams.delete('q');
    else url.searchParams.set('q', value.trim());
    window.history.replaceState(null, '', url.pathname + url.search);
  }

  function onInput(event: Event) {
    const value = (event.currentTarget as HTMLInputElement).value;
    query.value = value;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => apply(value), 250);
  }

  return (
    <search class="w-full max-w-md">
      <label for="catalog-search" class="text-body-md font-semibold text-text">
        Search products
      </label>
      <div class="relative mt-1">
        <span
          class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          aria-hidden="true"
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
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
        </span>
        <input
          id="catalog-search"
          type="search"
          value={query.value}
          onInput={onInput}
          placeholder="Search the catalog"
          autocomplete="off"
          class="min-h-11 w-full rounded-md border border-border bg-surface pl-10 pr-10 text-body-md focus:border-focus focus:outline-none"
        />
        {query.value.length > 0 && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              query.value = '';
              apply('');
            }}
            class="absolute right-2 top-1/2 min-h-11 min-w-11 -translate-y-1/2 rounded text-muted hover:text-text"
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>
      <p class="mt-1 text-body-sm text-muted" aria-live="polite">
        {matches.value} product{matches.value === 1 ? '' : 's'} shown
      </p>
    </search>
  );
}
