import { useState } from 'preact/hooks';
import { pushToast } from '../../lib/reactive/toasts';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  function submit(event: Event) {
    event.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    try {
      window.localStorage.setItem('chainshirts.newsletter', value);
    } catch {
      // The confirmation still works when storage is unavailable.
    }
    setEmail('');
    pushToast('You are on the list. Watch your inbox for the next drop.', 'success');
  }

  return (
    <form onSubmit={submit} novalidate class="flex w-full max-w-md flex-col gap-2 sm:flex-row">
      <label for="newsletter-email" class="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        autocomplete="email"
        placeholder="Email address"
        value={email}
        onInput={(event) => setEmail((event.currentTarget as HTMLInputElement).value)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? 'newsletter-error' : undefined}
        class="min-h-12 flex-1 rounded-md border border-white/25 bg-white/10 px-4 text-body-md text-white placeholder:text-white/60 focus:border-white focus:outline-none"
      />
      <button
        type="submit"
        class="min-h-12 shrink-0 rounded-md bg-brand px-6 text-sm font-bold text-on-brand transition-colors duration-quick hover:bg-brand-hover"
      >
        Join the list
      </button>
      {error && (
        <p id="newsletter-error" class="text-body-sm text-critical" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
