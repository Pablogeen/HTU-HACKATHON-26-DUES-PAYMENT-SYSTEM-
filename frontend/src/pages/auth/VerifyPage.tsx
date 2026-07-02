import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { HttpError } from '@/lib/utils';

export function VerifyPage() {
  const { verify, resendVerification, pendingEmail, isAuthenticated, isAdmin } = useAuth();
  const [email, setEmail] = useState(pendingEmail ?? '');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    if (pendingEmail) setEmail(pendingEmail);
  }, [pendingEmail]);

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verify(email.trim(), token.trim());
    } catch (err) {
      setError(err instanceof HttpError ? err.message : 'Verification failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    setInfo('');
    setResending(true);
    try {
      const message = await resendVerification(email.trim());
      setInfo(message || 'A new OTP has been sent.');
    } catch (err) {
      setError(err instanceof HttpError ? err.message : 'Could not resend OTP.');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 p-4">
      <div className="weave-trace-faint pointer-events-none absolute inset-0 opacity-30" />
      <div className="relative w-full max-w-md animate-fade-up rounded-2xl bg-white p-8 shadow-[var(--shadow-lift)]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-bold text-brand-900">Verify OTP</h1>
          <p className="mt-1 text-sm text-slate-500">Enter the 6-digit code sent to your email</p>
        </div>

        <div className="mb-4 space-y-3">
          {error && <Alert variant="error">{error}</Alert>}
          {info && <Alert variant="success">{info}</Alert>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="OTP Code"
            required
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            className="text-center font-mono-num text-lg tracking-[0.5em]"
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
          />
          <Button type="submit" loading={loading} className="w-full">
            Verify &amp; Sign In
          </Button>
        </form>

        <div className="mt-4 flex flex-col items-center gap-2 text-sm">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || !email}
            className="font-medium text-teal-600 hover:underline disabled:opacity-50"
          >
            {resending ? 'Sending…' : 'Resend OTP'}
          </button>
          <Link to="/login" className="text-slate-500 hover:text-slate-700">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
