import { useState } from 'preact/hooks';
import { clientHref } from '../../lib/paths';
import { createProfile, selectProfile } from '../../lib/reactive/actions';
import { activeProfile } from '../../lib/store/schema';
import { Button } from './ui/Button';
import { Field, inputClass } from './ui/Field';
import { useStoreState } from './ui/use-store';

export default function ProfileForm() {
  const state = useStoreState();
  const current = activeProfile(state);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function submit(event: Event) {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length === 0 || trimmed.length > 40) {
      setError('Enter a name of 1–40 characters.');
      return;
    }
    if (createProfile(trimmed)) {
      setName('');
      setError('');
    }
  }

  return (
    <div class="grid gap-6 lg:grid-cols-2">
      <section class="surface-card p-5" aria-labelledby="create-profile-heading">
        <h2 id="create-profile-heading" class="text-heading-lg font-semibold text-text">
          Create an account
        </h2>
        <p class="mt-1 text-body-sm text-muted">
          Your display name appears on your reviews and order history.
        </p>
        <form onSubmit={submit} novalidate class="mt-5 flex flex-col gap-4">
          <Field
            id="displayName"
            label="Display name"
            help="1–40 characters, shown with your comments."
            error={error || undefined}
          >
            <input
              id="displayName"
              type="text"
              maxLength={40}
              autocomplete="nickname"
              value={name}
              aria-invalid={error ? 'true' : undefined}
              aria-describedby={error ? 'displayName-error' : undefined}
              onInput={(event) => setName((event.currentTarget as HTMLInputElement).value)}
              class={inputClass}
            />
          </Field>
          <Button type="submit" variant="primary" fullWidth>
            Create account
          </Button>
        </form>
      </section>

      <section class="surface-card p-5" aria-labelledby="select-profile-heading">
        <h2 id="select-profile-heading" class="text-heading-lg font-semibold text-text">
          Your accounts
        </h2>
        {current && (
          <p class="mt-2 rounded-md bg-success/10 p-3 text-body-md text-text">
            Signed in as: <strong>{current.displayName}</strong>
          </p>
        )}
        <ul class="mt-4 flex flex-col gap-2">
          {state.profiles.map((profile) => (
            <li key={profile.id}>
              <button
                type="button"
                onClick={() => selectProfile(profile.id)}
                aria-pressed={profile.id === state.activeUserId}
                class={`flex min-h-11 w-full items-center justify-between gap-3 rounded-md border px-3 text-left text-body-md ${
                  profile.id === state.activeUserId
                    ? 'border-brand bg-brand/10 text-text'
                    : 'border-border bg-surface text-text hover:bg-surface-hover'
                }`}
              >
                <span class="flex items-center gap-3">
                  <span
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary text-body-sm font-bold"
                    aria-hidden="true"
                  >
                    {profile.avatar}
                  </span>
                  {profile.displayName}
                </span>
                {profile.id === state.activeUserId && <span aria-hidden="true">✓</span>}
              </button>
            </li>
          ))}
        </ul>
        {current && (
          <a
            href={clientHref('/account')}
            class="mt-5 inline-flex min-h-11 items-center text-body-md font-semibold text-link hover:underline"
          >
            Go to your account →
          </a>
        )}
      </section>
    </div>
  );
}
