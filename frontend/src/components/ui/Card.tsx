import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function Card({ title, description, children, className = '', action }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-[var(--shadow-soft)] ${className}`}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            {title && (
              <h3 className="font-display text-base font-semibold tracking-tight text-brand-900">
                {title}
              </h3>
            )}
            {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  accent?: 'teal' | 'gold' | 'crimson' | 'brand' | 'slate';
  icon?: ReactNode;
  hint?: string;
}

const accentStyles = {
  teal: { bar: 'bg-teal-500', chip: 'bg-teal-50 text-teal-600' },
  gold: { bar: 'bg-gold-500', chip: 'bg-gold-100 text-gold-600' },
  crimson: { bar: 'bg-crimson-500', chip: 'bg-crimson-50 text-crimson-500' },
  brand: { bar: 'bg-brand-500', chip: 'bg-brand-50 text-brand-600' },
  slate: { bar: 'bg-slate-400', chip: 'bg-slate-100 text-slate-500' },
};

export function StatCard({ label, value, accent = 'brand', icon, hint }: StatCardProps) {
  const styles = accentStyles[accent];
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[var(--shadow-soft)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
      <span className={`absolute inset-y-0 left-0 w-1 ${styles.bar}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="font-display mt-1 text-2xl font-bold tracking-tight text-brand-900">
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
        {icon && (
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.chip}`}>
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}
