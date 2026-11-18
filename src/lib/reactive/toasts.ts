export type ToastTone = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  tone: ToastTone;
  actionLabel?: string | undefined;
  onAction?: (() => void) | undefined;
  duration?: number | undefined;
}

export const TOAST_EVENT = 'chainshirts:toast';

let counter = 0;

/** Dispatch a toast through a DOM event so every island bundle sees it. */
export function pushToast(
  message: string,
  tone: ToastTone = 'info',
  options: { actionLabel?: string; onAction?: () => void; duration?: number } = {},
): void {
  if (typeof window === 'undefined') return;
  counter += 1;
  const toast: Toast = {
    id: `toast-${counter}`,
    message,
    tone,
    ...(options.actionLabel ? { actionLabel: options.actionLabel } : {}),
    ...(options.onAction ? { onAction: options.onAction } : {}),
    ...(options.duration ? { duration: options.duration } : {}),
  };
  window.dispatchEvent(new CustomEvent<Toast>(TOAST_EVENT, { detail: toast }));
}

export interface ToastMessage extends Toast {
  duration: number;
}

export function toastDuration(toast: Toast): number {
  if (toast.tone === 'error') return 0;
  const withDuration = toast as ToastMessage;
  return withDuration.duration ?? (toast.actionLabel ? 8000 : 4000);
}
