import { signal } from '@preact/signals';

type Theme = 'light' | 'dark';

const current = signal<Theme>(
  typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark'
    ? 'dark'
    : 'light',
);

export default function ThemeToggle() {
  const toggle = () => {
    const next: Theme = current.value === 'dark' ? 'light' : 'dark';
    current.value = next;
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = next;
    }
    try {
      window.localStorage.setItem('chainshirts.theme', next);
    } catch {
      // A missing storage preference only affects the next visit.
    }
  };

  const label = current.value === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border bg-surface text-text transition-colors duration-quick hover:bg-surface-hover"
    >
      {current.value === 'dark' ? (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
        </svg>
      ) : (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      )}
    </button>
  );
}
