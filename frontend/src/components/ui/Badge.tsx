import type { PaymentStatus, TransactionStatus } from '@/types/api';

interface BadgeProps {
  status: PaymentStatus | TransactionStatus | string;
}

const styles: Record<string, string> = {
  PAID: 'bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200',
  UNPAID: 'bg-gold-100 text-gold-600 ring-1 ring-inset ring-gold-300/60',
  SUCCESS: 'bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200',
  PENDING: 'bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-200',
  FAILED: 'bg-crimson-50 text-crimson-600 ring-1 ring-inset ring-crimson-100',
};

const dotStyles: Record<string, string> = {
  PAID: 'bg-teal-500',
  UNPAID: 'bg-gold-500',
  SUCCESS: 'bg-teal-500',
  PENDING: 'bg-brand-500',
  FAILED: 'bg-crimson-500',
};

export function Badge({ status }: BadgeProps) {
  const cls = styles[status] ?? 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200';
  const dot = dotStyles[status] ?? 'bg-slate-400';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status.replace(/_/g, ' ')}
    </span>
  );
}
