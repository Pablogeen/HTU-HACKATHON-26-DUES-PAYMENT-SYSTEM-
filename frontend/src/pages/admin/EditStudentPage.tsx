import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  LEVELS,
  PROGRAMMES,
  QUALIFICATIONS,
  formatProgramme,
  type UpdateStudentRequest,
} from '@/types/api';
import { HttpError } from '@/lib/utils';

export function EditStudentPage() {
  const { email: encodedEmail } = useParams<{ email: string }>();
  const email = encodedEmail ? decodeURIComponent(encodedEmail) : '';
  const navigate = useNavigate();

  const [form, setForm] = useState<UpdateStudentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!email) return;
    api.students
      .getByEmail(email)
      .then((student) =>
        setForm({
          firstName: student.firstName,
          middleName: student.middleName ?? '',
          lastName: student.lastName,
          level: student.level,
          phoneNumber: student.phoneNumber,
          academicYear: student.academicYear,
          qualificationType: student.qualificationType,
          programme: student.programme,
        }),
      )
      .catch((err) =>
        setError(err instanceof HttpError ? err.message : 'Failed to load student'),
      )
      .finally(() => setLoading(false));
  }, [email]);

  function update(field: keyof UpdateStudentRequest, value: string) {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !email) return;
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const payload: UpdateStudentRequest = {
        ...form,
        middleName: form.middleName || undefined,
      };
      await api.students.update(email, payload);
      setSuccess('Student details updated successfully.');
      setTimeout(() => navigate('/admin/students'), 1200);
    } catch (err) {
      setError(err instanceof HttpError ? err.message : 'Update failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Edit Student"
        description={email || 'Update a student\u2019s registered details'}
        action={
          <Link to="/admin/students">
            <Button variant="secondary">Back to list</Button>
          </Link>
        }
      />

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}
      {success && (
        <div className="mb-4">
          <Alert variant="success">{success}</Alert>
        </div>
      )}

      <Card title="Student Details">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : !form ? (
          <p className="text-sm text-slate-500">Student not found.</p>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First Name"
              required
              value={form.firstName}
              onChange={(e) => update('firstName', e.target.value)}
            />
            <Input
              label="Middle Name"
              value={form.middleName ?? ''}
              onChange={(e) => update('middleName', e.target.value)}
            />
            <Input
              label="Last Name"
              required
              value={form.lastName}
              onChange={(e) => update('lastName', e.target.value)}
            />
            <Input label="Email" value={email} disabled />
            <Input
              label="Phone Number"
              required
              value={form.phoneNumber}
              onChange={(e) => update('phoneNumber', e.target.value)}
            />
            <Input
              label="Academic Year"
              required
              placeholder="2024/2025"
              value={form.academicYear}
              onChange={(e) => update('academicYear', e.target.value)}
            />
            <Select
              label="Level"
              value={form.level}
              onChange={(e) => update('level', e.target.value)}
              options={LEVELS.map((l) => ({ value: l, label: l }))}
            />
            <Select
              label="Programme"
              value={form.programme}
              onChange={(e) => update('programme', e.target.value)}
              options={PROGRAMMES.map((p) => ({ value: p, label: formatProgramme(p) }))}
            />
            <Select
              label="Qualification"
              value={form.qualificationType}
              onChange={(e) => update('qualificationType', e.target.value)}
              options={QUALIFICATIONS.map((q) => ({ value: q, label: q }))}
            />
            <div className="sm:col-span-2 flex gap-3">
              <Button type="submit" loading={saving}>
                Save Changes
              </Button>
              <Link to="/admin/students">
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
