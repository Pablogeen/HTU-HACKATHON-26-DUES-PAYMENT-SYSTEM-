import { useEffect, useState } from 'react';
import { CheckCircle2, ShieldCheck, Wallet } from 'lucide-react';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { HttpError } from '@/lib/utils';
import type { StudentResponse } from '@/types/api';

export function PayPage() {
  const [student, setStudent] = useState<StudentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.students
      .me()
      .then(setStudent)
      .catch((err) =>
        setError(err instanceof HttpError ? err.message : 'Failed to load profile'),
      )
      .finally(() => setLoading(false));
  }, []);

  async function handlePay() {
    setError('');
    setPaying(true);
    try {
      const response = await api.payments.initialize();
      window.location.href = response.authorizationUrl;
    } catch (err) {
      setError(err instanceof HttpError ? err.message : 'Could not initialize payment.');
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !student) {
    return <Alert variant="error">{error}</Alert>;
  }

  const isPaid = student?.paymentStatus === 'PAID';

  return (
    <div>
      <PageHeader eyebrow="Secure checkout" title="Pay Dues" description="Complete your COMPSSA dues payment via Paystack" />

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Payment" className="lg:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <span className="text-sm text-slate-600">Current status</span>
              {student && <Badge status={student.paymentStatus} />}
            </div>

            {isPaid ? (
              <Alert variant="success">
                Your dues have already been paid. You can view your transactions and download receipts.
              </Alert>
            ) : (
              <>
                <p className="text-sm text-slate-600">
                  You will be redirected to Paystack to complete your payment securely. After payment,
                  your status will update automatically.
                </p>
                <Button onClick={handlePay} loading={paying} variant="gold">
                  <Wallet className="h-4 w-4" />
                  Proceed to Paystack
                </Button>
              </>
            )}
          </div>
        </Card>

        <Card title="Why it's safe" className="bg-brand-900 text-white [&_h3]:text-white">
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-300" />
              <p className="text-sm text-brand-100">
                Payments are processed by Paystack — your card details never touch our servers.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold-300" />
              <p className="text-sm text-brand-100">
                Your status and receipts update automatically the moment payment clears.
              </p>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
