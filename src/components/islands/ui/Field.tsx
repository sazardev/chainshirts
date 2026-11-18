import type { ComponentChildren } from 'preact';

interface FieldProps {
  id: string;
  label: string;
  help?: string | undefined;
  error?: string | undefined;
  optional?: boolean;
  children: ComponentChildren;
}

const inputClass =
  'mt-1 min-h-11 w-full rounded-md border border-border bg-surface px-3 py-2 text-body-md text-text placeholder:text-disabled focus:border-focus focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2';

export function Field({ id, label, help, error, optional = false, children }: FieldProps) {
  return (
    <div class="flex flex-col">
      <label for={id} class="text-body-md font-semibold text-text">
        {label} {optional && <span class="font-normal text-muted">(optional)</span>}
      </label>
      {help && <p class="mt-1 text-body-sm text-muted">{help}</p>}
      {children}
      {error && (
        <p
          id={`${id}-error`}
          class="mt-1 flex items-center gap-1 text-body-sm text-critical"
          aria-live="polite"
        >
          <span aria-hidden="true">✕</span> {error}
        </p>
      )}
    </div>
  );
}

export { inputClass };
