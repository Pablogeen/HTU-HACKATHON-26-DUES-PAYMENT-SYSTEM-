import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

interface AlertProps {
  variant?: 'error' | 'success' | 'info';
  children: ReactNode;
  onDismiss?: () => void;
}

const variants = {
  error: {
    box: 'border-crimson-100 bg-crimson-50 text-crimson-700',
    icon: <AlertTriangle className="h-4 w-4 shrink-0" />,
  },
  success: {
    box: 'border-teal-100 bg-teal-50 text-teal-700',
    icon: <CheckCircle2 className="h-4 w-4 shrink-0" />,
  },
  info: {
    box: 'border-brand-100 bg-brand-50 text-brand-700',
    icon: <Info className="h-4 w-4 shrink-0" />,
  },
};

export function Alert({ variant = 'info', children, onDismiss }: AlertProps) {
  const { box, icon } = variants[variant];
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm animate-fade-in ${box}`}
      role="alert"
    >
      <span className="mt-0.5">{icon}</span>
      <div className="flex-1">{children}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 opacity-60 transition hover:opacity-100"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
