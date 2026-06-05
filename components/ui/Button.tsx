import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

interface ButtonStyleOptions {
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--yellow)] text-black hover:brightness-95',
  secondary: 'bg-[var(--surfaceDark)] text-[var(--text)] border border-[var(--borderSubtle)] hover:border-[var(--borderStrong)]',
  ghost: 'bg-transparent text-[var(--text)] hover:bg-[rgba(255,255,255,0.08)]',
  danger: 'bg-[var(--danger)] text-white hover:brightness-110',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-base',
};

const baseButtonClasses =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focusRing)] disabled:cursor-not-allowed disabled:opacity-60';

export const buttonVariants = ({ className, variant = 'primary', size = 'md' }: ButtonStyleOptions = {}) =>
  cn(baseButtonClasses, variantClasses[variant], sizeClasses[size], className);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      className={buttonVariants({ className, variant, size })}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
          <span>Loading…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
});
