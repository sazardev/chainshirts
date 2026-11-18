import { useEffect, useState } from 'preact/hooks';
import { TOAST_EVENT, type Toast, toastDuration } from '../../lib/reactive/toasts';

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const toneClass =
    toast.tone === 'error'
      ? 'border-danger text-critical'
      : toast.tone === 'success'
        ? 'border-success text-text'
        : 'border-border text-text';

  return (
    <div
      role={toast.tone === 'error' ? 'alert' : 'status'}
      class={`flex items-center gap-3 rounded-lg border bg-surface px-4 py-3 shadow-popover ${toneClass}`}
    >
      <span aria-hidden="true">
        {toast.tone === 'error' ? '✕' : toast.tone === 'success' ? '✓' : 'i'}
      </span>
      <p class="flex-1 text-body-md">{toast.message}</p>
      {toast.actionLabel && toast.onAction && (
        <button
          type="button"
          onClick={() => {
            toast.onAction?.();
            onDismiss(toast.id);
          }}
          class="min-h-11 rounded px-2 text-body-md font-semibold text-link hover:underline"
        >
          {toast.actionLabel}
        </button>
      )}
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss message"
        class="min-h-11 min-w-11 rounded text-muted hover:text-text"
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
}

export default function ToastHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    document.documentElement.dataset.islandsReady = 'true';
    const onToast = (event: Event) => {
      const toast = (event as CustomEvent<Toast>).detail;
      setToasts((current) => [...current, toast].slice(-3));
      const duration = toastDuration(toast);
      if (duration > 0)
        window.setTimeout(
          () => setToasts((current) => current.filter((item) => item.id !== toast.id)),
          duration,
        );
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);

  return (
    <div class="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col gap-2 sm:left-auto sm:right-4 sm:w-sm">
      <div class="pointer-events-auto flex flex-col gap-2" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={(id) => setToasts((current) => current.filter((item) => item.id !== id))}
          />
        ))}
      </div>
    </div>
  );
}
