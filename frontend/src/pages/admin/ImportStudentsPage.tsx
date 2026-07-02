import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Alert } from '@/components/ui/Alert';
import type { ImportSummary } from '@/types/api';
import { HttpError } from '@/lib/utils';

export function ImportStudentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setError('');
    setSummary(null);
    setLoading(true);
    try {
      const result = await api.students.import(file);
      setSummary(result);
    } catch (err) {
      setError(err instanceof HttpError ? err.message : 'Import failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Import Students"
        description="Upload a CSV file to bulk-register students"
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

      <Card title="CSV Upload">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">CSV File</label>
            <input
              type="file"
              accept=".csv"
              required
              className="mt-1.5 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-teal-700 hover:file:bg-teal-100"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <Button type="submit" loading={loading} disabled={!file}>
            Upload & Import
          </Button>
        </form>
      </Card>

      {summary && (
        <Card title="Import Results" className="mt-6">
          <dl className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-slate-500">Total Rows</dt>
              <dd className="font-display text-xl font-bold text-brand-900">{summary.totalRows}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Imported</dt>
              <dd className="font-display text-xl font-bold text-teal-600">{summary.successCount}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Skipped</dt>
              <dd className="font-display text-xl font-bold text-gold-600">{summary.skippedCount}</dd>
            </div>
          </dl>
          {summary.skippedReasons?.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-slate-700">Skipped reasons:</p>
              <ul className="max-h-48 space-y-1 overflow-y-auto text-sm text-slate-600">
                {summary.skippedReasons.map((reason, i) => (
                  <li key={i} className="rounded bg-slate-50 px-2 py-1">
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
