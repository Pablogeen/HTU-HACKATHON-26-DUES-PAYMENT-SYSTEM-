interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gold';
  loading?: boolean;
}

const variants = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:bg-brand-700 hover:shadow-md active:scale-[0.98] focus-visible:ring-brand-400 disabled:bg-brand-300 disabled:shadow-none',
  secondary:
    'bg-white text-brand-700 border border-slate-200 shadow-sm hover:border-teal-300 hover:text-teal-700 hover:shadow-md active:scale-[0.98] focus-visible:ring-teal-400',
  danger:
    'bg-crimson-500 text-white shadow-sm hover:bg-crimson-600 hover:shadow-md active:scale-[0.98] focus-visible:ring-crimson-500 disabled:bg-crimson-100 disabled:text-crimson-500',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400',
  gold:
    'bg-gold-500 text-brand-900 shadow-sm hover:bg-gold-400 hover:shadow-md active:scale-[0.98] focus-visible:ring-gold-500 disabled:bg-gold-100',
};

export function Button({
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:active:scale-100 ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
