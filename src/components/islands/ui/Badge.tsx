import type { ComponentChildren } from 'preact';

export type BadgeTone = 'info' | 'success' | 'warning' | 'critical' | 'neutral';

const TONES: Record<BadgeTone, string> = {
  info: 'bg-surface-secondary text-link border-border',
  success: 'bg-success/15 text-success border-success/40',
  warning: 'bg-warning/15 text-text border-warning/50',
  critical: 'bg-danger/15 text-critical border-danger/40',
  neutral: 'bg-surface-secondary text-muted border-border',
};

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ComponentChildren;
  tone?: BadgeTone;
}) {
  return (
    <span
      class={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-body-sm font-semibold ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
