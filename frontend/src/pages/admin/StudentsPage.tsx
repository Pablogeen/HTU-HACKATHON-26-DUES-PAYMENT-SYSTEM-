import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Select } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import {
  formatProgramme,
  PAYMENT_STATUSES,
  PROGRAMMES,
  type PaymentStatus,
  type Programme,
  type StudentResponse,
} from '@/types/api';
import { fullName, HttpError } from '@/lib/utils';

const PAGE_SIZE = 10;

export function StudentsPage() {
  const { canManageStudents } = useAuth();
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [page, setPage] = useState(0);
  const [programme, setProgramme] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let data: StudentResponse[];
      if (programme && paymentStatus) {
        data = await api.students.byProgrammeAndPaymentStatus(
          programme as Programme,
          paymentStatus,
          page,
          PAGE_SIZE,
        );
      } else if (programme) {
        data = await api.students.byProgramme(programme as Programme, page, PAGE_SIZE);
      } else if (paymentStatus) {
        data = await api.students.byPaymentStatus(paymentStatus, page, PAGE_SIZE);
      } else {
        data = await api.students.getAll(page, PAGE_SIZE);
      }
      setStudents(data);
    } catch (err) {
      setError(err instanceof HttpError ? err.message : 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [page, programme, paymentStatus]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  async function handleDelete(email: string) {
    if (!confirm(`Delete student ${email}?`)) return;
    setActionLoading(email);
    try {
      await api.students.delete(email);
      await loadStudents();
    } catch (err) {
      setError(err instanceof HttpError ? err.message : 'Delete failed');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAssignRole(email: string) {
    setActionLoading(`assign-${email}`);
    try {
      await api.students.assignRole(email);
      await loadStudents();
    } catch (err) {
      setError(err instanceof HttpError ? err.message : 'Assign role failed');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRevokeRole(email: string) {
    setActionLoading(`revoke-${email}`);
    try {
      await api.students.revokeRole(email);
      await loadStudents();
    } catch (err) {
      setError(err instanceof HttpError ? err.message : 'Revoke role failed');
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Students"
        description="Browse and manage registered students"
        action={
          <div className="flex flex-wrap gap-2">
            {canManageStudents && (
              <Link to="/admin/students/register">
                <Button>Register</Button>
              </Link>
            )}
            <Link to="/admin/students/import">
              <Button variant="secondary">Import CSV</Button>
            </Link>
          </div>
        }
      />

      {error && (
        <div className="mb-4">
          <Alert variant="error" onDismiss={() => setError('')}>
            {error}
          </Alert>
        </div>
      )}

      <Card className="mb-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label="Programme"
            value={programme}
            onChange={(e) => {
              setPage(0);
              setProgramme(e.target.value);
            }}
            options={[
              { value: '', label: 'All programmes' },
              ...PROGRAMMES.map((p) => ({ value: p, label: formatProgramme(p) })),
            ]}
          />
          <Select
            label="Payment Status"
            value={paymentStatus}
            onChange={(e) => {
              setPage(0);
              setPaymentStatus(e.target.value);
            }}
            options={[
              { value: '', label: 'All statuses' },
              ...PAYMENT_STATUSES.map((s) => ({ value: s, label: s })),
            ]}
          />
          <div className="flex items-end">
            <Button
              variant="ghost"
              onClick={() => {
                setProgramme('');
                setPaymentStatus('');
                setPage(0);
              }}
            >
              Clear filters
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : students.length === 0 ? (
          <EmptyState title="No students found" description="Try adjusting your filters." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500">
                    <th className="rounded-l-lg py-3 pl-3 pr-4 font-medium">Name</th>
                    <th className="py-3 pr-4 font-medium">Email</th>
                    <th className="py-3 pr-4 font-medium">Programme</th>
                    <th className="py-3 pr-4 font-medium">Level</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    {canManageStudents && <th className="rounded-r-lg py-3 pr-3 font-medium">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.email} className="border-b border-slate-100 transition-colors hover:bg-teal-50/40">
                      <td className="py-3 pl-3 pr-4 font-medium text-brand-900">
                        {fullName(s.firstName, s.lastName, s.middleName)}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{s.email}</td>
                      <td className="py-3 pr-4">{formatProgramme(s.programme)}</td>
                      <td className="py-3 pr-4">{s.level}</td>
                      <td className="py-3 pr-4">
                        <Badge status={s.paymentStatus as PaymentStatus} />
                      </td>
                      {canManageStudents && (
                        <td className="py-3 pr-3">
                          <div className="flex flex-wrap gap-1">
                            <Button
                              variant="ghost"
                              loading={actionLoading === `assign-${s.email}`}
                              onClick={() => handleAssignRole(s.email)}
                            >
                              Assign
                            </Button>
                            <Button
                              variant="ghost"
                              loading={actionLoading === `revoke-${s.email}`}
                              onClick={() => handleRevokeRole(s.email)}
                            >
                              Revoke
                            </Button>
                            <Button
                              variant="danger"
                              loading={actionLoading === s.email}
                              onClick={() => handleDelete(s.email)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              hasMore={students.length === PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>
    </div>
  );
}
