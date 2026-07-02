import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCedis } from '@/types/api';
import { downloadBlob, HttpError } from '@/lib/utils';
import type { TransactionResponse } from '@/types/api';

export function MyTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingRef, setDownloadingRef] = useState<string | null>(null);

  useEffect(() => {
    api.payments
      .studentTransactions()
      .then(setTransactions)
      .catch((err) =>
        setError(err instanceof HttpError ? err.message : 'Failed to load transactions'),
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleDownload(reference: string) {
    setDownloadingRef(reference);
    try {
      const blob = await api.receipts.download(reference);
      downloadBlob(blob, `receipt-${reference}.pdf`);
    } catch (err) {
      setError(err instanceof HttpError ? err.message : 'Could not download receipt.');
    } finally {
      setDownloadingRef(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="My Transactions" description="Your payment history" />

      {error && (
        <div className="mb-4">
          <Alert variant="error" onDismiss={() => setError('')}>
            {error}
          </Alert>
        </div>
      )}

      <Card>
        {transactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Your payment history will appear here after you pay dues."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500">
                  <th className="rounded-l-lg py-3 pl-3 pr-4 font-medium">Reference</th>
                  <th className="py-3 pr-4 font-medium">Amount</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-4 font-medium">Date</th>
                  <th className="rounded-r-lg py-3 pr-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.reference} className="border-b border-slate-100 transition-colors hover:bg-teal-50/40">
                    <td className="py-3 pl-3 pr-4 font-mono-num text-xs text-brand-700">{tx.reference}</td>
                    <td className="py-3 pr-4 font-mono-num font-medium text-brand-900">{formatCedis(tx.amount)}</td>
                    <td className="py-3 pr-4">
                      <Badge status={tx.status} />
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {tx.paidAt
                        ? new Date(tx.paidAt).toLocaleString()
                        : new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 pr-3">
                      {tx.status === 'SUCCESS' && (
                        <Button
                          variant="ghost"
                          loading={downloadingRef === tx.reference}
                          onClick={() => handleDownload(tx.reference)}
                        >
                          Receipt
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
