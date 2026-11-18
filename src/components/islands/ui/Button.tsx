import type { ComponentChildren } from 'preact';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'plain';
export type ButtonTone = 'default' | 'critical';

interface ButtonProps {
  children: ComponentChildren;
  variant?: ButtonVariant;
  tone?: ButtonTone;
  type?: 'button' | 'submit';
  disabled?: boolean;
  fullWidth?: boolean;
  title?: string;
  ariaLabel?: string;
  ariaPressed?: boolean;
  class?: string;
  onClick?: (event: MouseEvent) => void;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-on-brand border border-brand shadow-button hover:bg-brand-hover min-h-11',
  secondary: 'bg-surface text-text border border-border hover:bg-surface-hover min-h-11',
  tertiary: 'bg-transparent text-link border border-transparent hover:bg-surface-hover min-h-11',
  plain: 'bg-transparent text-text border border-transparent hover:bg-surface-hover min-h-10',
};

export function Button({
  children,
  variant = 'secondary',
  tone = 'default',
  type = 'button',
  disabled = false,
  fullWidth = false,
  title,
  ariaLabel,
  ariaPressed,
  class: className = '',
  onClick,
}: ButtonProps) {
  const toneClass =
    tone === 'critical' ? 'border-danger text-danger hover:bg-danger hover:text-on-brand' : '';
  return (
    <button
      type={type}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      onClick={onClick}
      class={`inline-flex items-center justify-center gap-2 rounded-md px-4 text-body-md font-semibold transition-colors duration-quick disabled:cursor-not-allowed disabled:text-disabled ${VARIANTS[variant]} ${toneClass} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
