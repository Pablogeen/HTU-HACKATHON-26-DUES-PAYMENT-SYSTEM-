import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ShieldCheck, Sparkles, Wallet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { HttpError } from '@/lib/utils';

export function LoginPage() {
  const { login, isAuthenticated, isAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const message = await login(email.trim());
      setSuccess(message || 'OTP sent to your email.');
    } catch (err) {
      setError(err instanceof HttpError ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F7F8FC]">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 p-12 text-white lg:flex">
        <div className="weave-trace-faint pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 text-base font-bold text-brand-900">
            C
          </div>
          <div>
            <p className="font-display text-lg font-bold">COMPSSA Dues</p>
            <p className="text-sm text-brand-200">Ho Technical University</p>
          </div>
        </div>

        <div className="relative z-10 max-w-md animate-fade-up">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-teal-200">
            <Sparkles className="h-3.5 w-3.5" />
            Class of association, secured
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight">
            One portal for every due, receipt, and record.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-brand-100">
            Sign in with your student email to check your payment status, settle your dues through
            Paystack, and keep every receipt in one place.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-400/15 text-teal-300">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <p className="text-sm text-brand-100">
                Passwordless sign-in — a one-time code is all you need.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-400/15 text-gold-300">
                <Wallet className="h-4 w-4" />
              </span>
              <p className="text-sm text-brand-100">
                Pay securely via Paystack, tracked automatically to your profile.
              </p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-brand-300">
          &copy; {new Date().getFullYear()} COMPSSA — Computer Science Students&rsquo; Association
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center p-4 lg:w-1/2">
        <div className="w-full max-w-md animate-fade-up rounded-2xl bg-white p-8 shadow-[var(--shadow-lift)] sm:p-10">
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-700 to-brand-900 text-xl font-bold text-white">
              C
            </div>
            <h1 className="font-display text-2xl font-bold text-brand-900">COMPSSA Dues</h1>
          </div>

          <div className="mb-8 hidden text-left lg:block">
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">
              Welcome back
            </p>
            <h2 className="font-display mt-1 text-2xl font-bold text-brand-900">Sign in</h2>
            <p className="mt-1 text-sm text-slate-500">Use your student email to continue</p>
          </div>

          <div className="mb-4 space-y-3">
            {error && <Alert variant="error">{error}</Alert>}
            {success && (
              <Alert variant="success">
                {success}{' '}
                <Link to="/verify" className="font-semibold underline">
                  Enter OTP
                </Link>
              </Alert>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              required
              autoComplete="email"
              placeholder="student@htu.edu.gh"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" loading={loading} className="w-full">
              Send OTP
            </Button>
          </form>

          {success && (
            <p className="mt-4 text-center text-sm text-slate-500">
              Already have a code?{' '}
              <Link to="/verify" className="font-medium text-teal-600 hover:underline">
                Verify OTP
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
