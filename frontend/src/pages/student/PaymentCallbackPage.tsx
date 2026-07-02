import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { downloadBlob, HttpError } from '@/lib/utils';
import type { StudentResponse } from '@/types/api';

export function PaymentCallbackPage() {
  const [params] = useSearchParams();
  const reference = params.get('reference') ?? params.get('trxref') ?? '';
  const [student, setStudent] = useState<StudentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.students
      .me()
      .then(setStudent)
      .catch((err) =>
        setError(err instanceof HttpError ? err.message : 'Failed to verify payment status'),
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleDownload() {
    if (!reference) return;
    setDownloading(true);
    try {
      const blob = await api.receipts.download(reference);
      downloadBlob(blob, `receipt-${reference}.pdf`);
    } catch (err) {
      setError(err instanceof HttpError ? err.message : 'Could not download receipt.');
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-slate-500">Verifying your payment…</p>
      </div>
    );
  }

  const isPaid = student?.paymentStatus === 'PAID';

  return (
    <div>
      <PageHeader title="Payment Result" description="Your payment processing status" />

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <Card title={isPaid ? 'Payment Successful' : 'Payment Pending'}>
        <div className="space-y-4">
          {reference && (
            <p className="text-sm text-slate-600">
              Reference: <span className="font-mono-num font-medium">{reference}</span>
            </p>
          )}
          {student && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Status:</span>
              <Badge status={student.paymentStatus} />
            </div>
          )}

          {isPaid ? (
            <>
              <Alert variant="success">
                Your dues payment was successful. Thank you!
              </Alert>
              {reference && (
                <Button onClick={handleDownload} loading={downloading} variant="secondary">
                  Download Receipt
                </Button>
              )}
            </>
          ) : (
            <Alert variant="info">
              Payment is being processed. If you completed payment, refresh in a moment or check
              your transactions.
            </Alert>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/dashboard">
              <Button variant="secondary">Go to Dashboard</Button>
            </Link>
            <Link to="/transactions">
              <Button variant="ghost">View Transactions</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
