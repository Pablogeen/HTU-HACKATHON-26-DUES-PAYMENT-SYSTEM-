import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';
import { Alert } from '@/components/ui/Alert';
import {
  LEVELS,
  PROGRAMMES,
  QUALIFICATIONS,
  formatProgramme,
  type RegisterRequest,
} from '@/types/api';
import { HttpError } from '@/lib/utils';

const initial: RegisterRequest = {
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  level: 'L100',
  phoneNumber: '',
  academicYear: '',
  programme: 'ICT',
  qualificationType: 'BTECH',
};

export function RegisterStudentPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterRequest>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function update(field: keyof RegisterRequest, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const payload: RegisterRequest = {
        ...form,
        middleName: form.middleName || undefined,
      };
      await api.students.register(payload);
      setSuccess('Student registered successfully.');
      setTimeout(() => navigate('/admin/students'), 1500);
    } catch (err) {
      setError(err instanceof HttpError ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Register Student"
        description="Add a single student manually"
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
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
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
          <div className="sm:col-span-2">
            <Button type="submit" loading={loading}>
              Register Student
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
