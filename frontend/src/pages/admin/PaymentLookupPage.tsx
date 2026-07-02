import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '@/api/client';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import type { TransactionStatusResponse } from '@/types/api';
import { HttpError } from '@/lib/utils';

export function PaymentLookupPage() {
  const { reference = '' } = useParams();
  const [status, setStatus] = useState<TransactionStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!reference) return;
    api.payments
      .status(reference)
      .then(setStatus)
      .catch((err) =>
        setError(err instanceof HttpError ? err.message : 'Payment not found'),
      )
      .finally(() => setLoading(false));
  }, [reference]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Payment Lookup"
        description={`Reference: ${reference}`}
        action={
          <Link to="/admin/transactions">
            <Button variant="secondary">Back</Button>
          </Link>
        }
      />

      {error && !status ? (
        <Alert variant="error">{error}</Alert>
      ) : status ? (
        <Card title="Payment Details">
          <dl className="space-y-4">
            <div>
              <dt className="text-sm text-slate-500">Reference</dt>
              <dd className="font-mono-num font-medium">{status.reference}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Status</dt>
              <dd className="mt-1">
                <Badge status={status.status} />
              </dd>
            </div>
            {status.paidAt && (
              <div>
                <dt className="text-sm text-slate-500">Paid At</dt>
                <dd className="font-medium">{new Date(status.paidAt).toLocaleString()}</dd>
              </div>
            )}
          </dl>
        </Card>
      ) : null}
    </div>
  );
}
