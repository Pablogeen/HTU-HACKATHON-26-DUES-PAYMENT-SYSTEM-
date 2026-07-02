import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, GraduationCap, Layers } from 'lucide-react';
import { api } from '@/api/client';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, StatCard } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/context/AuthContext';
import { formatProgramme } from '@/types/api';
import { fullName, HttpError } from '@/lib/utils';
import type { StudentResponse } from '@/types/api';

function StatusRing({ paid }: { paid: boolean }) {
  const pct = paid ? 100 : 35;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  return (
    <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
      <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke={paid ? '#22c7b3' : '#f4b400'}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
      />
    </svg>
  );
}

export function DashboardPage() {
  const { canPay } = useAuth();
  const [student, setStudent] = useState<StudentResponse | null>(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !student) {
    return <Alert variant="error">{error || 'Profile not found'}</Alert>;
  }

  const name = fullName(student.firstName, student.lastName, student.middleName);
  const isPaid = student.paymentStatus === 'PAID';

  return (
    <div>
      {/* Hero */}
      <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 p-6 text-white shadow-[var(--shadow-lift)] animate-fade-up sm:p-8">
        <div className="weave-trace-faint pointer-events-none absolute inset-0 opacity-25" />
        <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-200">
              Welcome back
            </p>
            <h1 className="font-display mt-1 text-3xl font-bold tracking-tight">
              {student.firstName}
            </h1>
            <p className="mt-2 max-w-md text-sm text-brand-100">
              Here&rsquo;s where your COMPSSA dues stand for {student.academicYear}.
            </p>
            {canPay && !isPaid && (
              <Link to="/pay" className="mt-5 inline-block">
                <Button variant="gold">
                  Pay Dues
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-4 self-center rounded-xl bg-white/5 p-4">
            <StatusRing paid={isPaid} />
            <div>
              <p className="font-display text-lg font-bold">{isPaid ? 'Paid' : 'Unpaid'}</p>
              <p className="text-xs text-brand-200">Payment status</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Payment Status"
          value={student.paymentStatus}
          accent={isPaid ? 'teal' : 'gold'}
          icon={<Layers className="h-5 w-5" />}
        />
        <StatCard
          label="Programme"
          value={formatProgramme(student.programme)}
          accent="brand"
          icon={<GraduationCap className="h-5 w-5" />}
        />
        <StatCard
          label="Level"
          value={student.level}
          accent="slate"
          icon={<CalendarDays className="h-5 w-5" />}
        />
      </div>

      <Card title="Quick Info" description="A snapshot of your registered details">
        <dl className="grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">Full Name</dt>
            <dd className="mt-0.5 font-medium text-brand-900">{name}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Email</dt>
            <dd className="mt-0.5 font-medium text-brand-900">{student.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Academic Year</dt>
            <dd className="mt-0.5 font-medium text-brand-900">{student.academicYear}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Status</dt>
            <dd className="mt-1">
              <Badge status={student.paymentStatus} />
            </dd>
          </div>
        </dl>

        {canPay && !isPaid && (
          <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-xl border border-gold-300/60 bg-gold-100/50 p-4 sm:flex-row sm:items-center">
            <p className="text-sm text-gold-600">
              You have outstanding dues. Pay now to complete your registration.
            </p>
            <Link to="/pay" className="shrink-0">
              <Button variant="gold">Pay Dues</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
