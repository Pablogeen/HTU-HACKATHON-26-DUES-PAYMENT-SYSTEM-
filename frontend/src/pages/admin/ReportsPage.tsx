import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Card, StatCard } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  formatCedisWhole,
  formatProgramme,
  PROGRAMMES,
  type OverallSummaryResponse,
  type Programme,
  type ProgrammeDetailSummaryResponse,
  type TransactionReportResponse,
} from '@/types/api';
import { downloadBlob, HttpError } from '@/lib/utils';

export function ReportsPage() {
  const [summary, setSummary] = useState<OverallSummaryResponse | null>(null);
  const [programmeDetails, setProgrammeDetails] = useState<
    Record<string, ProgrammeDetailSummaryResponse>
  >({});
  const [transactions, setTransactions] = useState<TransactionReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [summaryData, txData, ...programmeData] = await Promise.all([
          api.reports.summary(),
          api.reports.transactionHistory(),
          ...PROGRAMMES.map((p) => api.reports.programmeSummary(p)),
        ]);
        setSummary(summaryData);
        setTransactions(txData);
        const details: Record<string, ProgrammeDetailSummaryResponse> = {};
        PROGRAMMES.forEach((p, i) => {
          details[p] = programmeData[i];
        });
        setProgrammeDetails(details);
      } catch (err) {
        setError(err instanceof HttpError ? err.message : 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function download(
    key: string,
    fn: () => Promise<Blob>,
    filename: string,
  ) {
    setDownloading(key);
    try {
      const blob = await fn();
      downloadBlob(blob, filename);
    } catch (err) {
      setError(err instanceof HttpError ? err.message : 'Download failed');
    } finally {
      setDownloading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !summary) {
    return <Alert variant="error">{error}</Alert>;
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Financial summaries and transaction history"
        action={
          <Button
            variant="secondary"
            loading={downloading === 'overall'}
            onClick={() =>
              download('overall', () => api.reports.downloadSummary(), 'overall-summary-report.pdf')
            }
          >
            Download Overall PDF
          </Button>
        }
      />

      {error && (
        <div className="mb-4">
          <Alert variant="error" onDismiss={() => setError('')}>
            {error}
          </Alert>
        </div>
      )}

      {summary && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Students" value={summary.totalStudents} />
          <StatCard label="Paid" value={summary.totalPaid} accent="teal" />
          <StatCard label="Unpaid" value={summary.totalUnpaid} accent="gold" />
          <StatCard
            label="Collected"
            value={formatCedisWhole(summary.totalAmountCollectedInCedis)}
            accent="slate"
          />
        </div>
      )}

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {PROGRAMMES.map((p) => {
          const detail = programmeDetails[p];
          if (!detail) return null;
          return (
            <Card
              key={p}
              title={formatProgramme(p)}
              action={
                <Button
                  variant="ghost"
                  loading={downloading === p}
                  onClick={() =>
                    download(
                      p,
                      () => api.reports.downloadProgrammeSummary(p as Programme),
                      `${p.toLowerCase()}-summary-report.pdf`,
                    )
                  }
                >
                  PDF
                </Button>
              }
            >
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-slate-500">Students</dt>
                  <dd className="font-semibold">{detail.totalStudents}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Paid</dt>
                  <dd className="font-semibold text-teal-600">{detail.totalPaid}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Unpaid</dt>
                  <dd className="font-semibold text-gold-600">{detail.totalUnpaid}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Collected</dt>
                  <dd className="font-semibold">
                    {formatCedisWhole(detail.totalAmountCollectedInCedis)}
                  </dd>
                </div>
              </dl>
            </Card>
          );
        })}
      </div>

      <Card
        title="Transaction History"
        action={
          <Button
            variant="ghost"
            loading={downloading === 'tx'}
            onClick={() =>
              download(
                'tx',
                () => api.reports.downloadTransactionHistory(),
                'transaction-history-report.pdf',
              )
            }
          >
            Download PDF
          </Button>
        }
      >
        {transactions.length === 0 ? (
          <EmptyState title="No transactions" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Student</th>
                  <th className="pb-3 pr-4 font-medium">Programme</th>
                  <th className="pb-3 pr-4 font-medium">Level</th>
                  <th className="pb-3 pr-4 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Paid At</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.reference} className="border-b border-slate-100">
                    <td className="py-3 pr-4">
                      <div className="font-medium">{tx.studentName}</div>
                      <div className="text-xs text-slate-500">{tx.email}</div>
                    </td>
                    <td className="py-3 pr-4">{tx.programme}</td>
                    <td className="py-3 pr-4">{tx.level}</td>
                    <td className="py-3 pr-4">{formatCedisWhole(tx.amountInCedis)}</td>
                    <td className="py-3 text-slate-600">
                      {tx.paidAt ? new Date(tx.paidAt).toLocaleString() : '—'}
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
