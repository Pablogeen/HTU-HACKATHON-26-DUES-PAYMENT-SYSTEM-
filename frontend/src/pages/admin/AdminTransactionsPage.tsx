import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCedis } from '@/types/api';
import type { TransactionResponse } from '@/types/api';
import { HttpError } from '@/lib/utils';

const PAGE_SIZE = 10;

export function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.payments
      .all(page, PAGE_SIZE)
      .then(setTransactions)
      .catch((err) =>
        setError(err instanceof HttpError ? err.message : 'Failed to load transactions'),
      )
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <PageHeader title="All Transactions" description="Department-wide payment records" />

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState title="No transactions found" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500">
                    <th className="rounded-l-lg py-3 pl-3 pr-4 font-medium">Reference</th>
                    <th className="py-3 pr-4 font-medium">Student</th>
                    <th className="py-3 pr-4 font-medium">Amount</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="rounded-r-lg py-3 pr-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.reference} className="border-b border-slate-100 transition-colors hover:bg-teal-50/40">
                      <td className="py-3 pl-3 pr-4">
                        <Link
                          to={`/admin/payments/${tx.reference}`}
                          className="font-mono-num text-xs text-teal-700 hover:underline"
                        >
                          {tx.reference}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{tx.studentEmail}</td>
                      <td className="py-3 pr-4 font-mono-num font-medium text-brand-900">{formatCedis(tx.amount)}</td>
                      <td className="py-3 pr-4">
                        <Badge status={tx.status} />
                      </td>
                      <td className="py-3 pr-3 text-slate-600">
                        {tx.paidAt
                          ? new Date(tx.paidAt).toLocaleString()
                          : new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              hasMore={transactions.length === PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>
    </div>
  );
}
