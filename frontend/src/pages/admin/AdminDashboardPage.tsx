import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BanknoteIcon, TrendingUp, UserCheck, Users } from 'lucide-react';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Card, StatCard } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { formatCedisWhole } from '@/types/api';
import { HttpError } from '@/lib/utils';
import type { OverallSummaryResponse } from '@/types/api';

export function AdminDashboardPage() {
  const [summary, setSummary] = useState<OverallSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.reports
      .summary()
      .then(setSummary)
      .catch((err) =>
        setError(err instanceof HttpError ? err.message : 'Failed to load summary'),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !summary) {
    return <Alert variant="error">{error || 'Summary unavailable'}</Alert>;
  }

  const collectionRate =
    summary.totalStudents > 0
      ? Math.round((summary.totalPaid / summary.totalStudents) * 100)
      : 0;

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (collectionRate / 100) * circumference;

  return (
    <div>
      <PageHeader
        eyebrow="Executive summary"
        title="Admin Overview"
        description="Department-wide dues collection at a glance"
        action={
          <Link to="/admin/reports">
            <Button variant="secondary">
              View Reports
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Students" value={summary.totalStudents} accent="brand" icon={<Users className="h-5 w-5" />} />
        <StatCard label="Paid" value={summary.totalPaid} accent="teal" icon={<UserCheck className="h-5 w-5" />} />
        <StatCard label="Unpaid" value={summary.totalUnpaid} accent="gold" icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard
          label="Collected"
          value={formatCedisWhole(summary.totalAmountCollectedInCedis)}
          accent="crimson"
          icon={<BanknoteIcon className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Collection Rate" description="Share of students who have settled dues">
          <div className="flex items-center gap-6">
            <svg viewBox="0 0 100 100" className="h-32 w-32 shrink-0 -rotate-90">
              <circle cx="50" cy="50" r={radius} fill="none" stroke="#eef1fb" strokeWidth="10" />
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="#14b8a6"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
              />
            </svg>
            <div>
              <p className="font-display text-4xl font-bold tracking-tight text-brand-900">
                {collectionRate}%
              </p>
              <p className="text-sm text-slate-500">of students have paid</p>
            </div>
          </div>
        </Card>

        <Card title="By Programme" description="Payment progress across programmes">
          <ul className="space-y-3">
            {summary.programmeSummaries.map((p) => {
              const pct = p.totalStudents > 0 ? Math.round((p.totalPaid / p.totalStudents) * 100) : 0;
              return (
                <li key={p.programme} className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="font-medium text-brand-900">{p.programme.replace(/_/g, ' ')}</span>
                    <span className="font-mono-num text-slate-500">
                      {p.totalPaid}/{p.totalStudents}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-gold-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/admin/students">
          <Button>Manage Students</Button>
        </Link>
        <Link to="/admin/transactions">
          <Button variant="secondary">View Transactions</Button>
        </Link>
      </div>
    </div>
  );
}
