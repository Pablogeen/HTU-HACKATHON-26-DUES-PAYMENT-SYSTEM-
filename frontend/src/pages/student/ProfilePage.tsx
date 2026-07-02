import { useEffect, useState } from 'react';
import { UserRound } from 'lucide-react';
import { api } from '@/api/client';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { formatProgramme } from '@/types/api';
import { fullName, HttpError } from '@/lib/utils';
import type { StudentResponse } from '@/types/api';

export function ProfilePage() {
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

  const fields = [
    { label: 'Full Name', value: name },
    { label: 'Email', value: student.email },
    { label: 'Phone', value: student.phoneNumber },
    { label: 'Programme', value: formatProgramme(student.programme) },
    { label: 'Level', value: student.level },
    { label: 'Qualification', value: student.qualificationType },
    { label: 'Academic Year', value: student.academicYear },
  ];

  return (
    <div>
      <PageHeader title="My Profile" description="Your registered student information" />

      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[var(--shadow-soft)]">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 text-white">
          <UserRound className="h-8 w-8" />
        </div>
        <div className="min-w-0">
          <p className="font-display truncate text-lg font-bold text-brand-900">{name}</p>
          <p className="truncate text-sm text-slate-500">{student.email}</p>
        </div>
        <div className="ml-auto shrink-0">
          <Badge status={student.paymentStatus} />
        </div>
      </div>

      <Card title="Personal Details">
        <dl className="grid gap-5 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.label}>
              <dt className="text-sm text-slate-500">{f.label}</dt>
              <dd className="mt-0.5 font-medium text-brand-900">{f.value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
