import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-4 overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 p-4 text-center">
      <div className="weave-trace-faint pointer-events-none absolute inset-0 opacity-25" />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-teal-300">
          <Compass className="h-8 w-8" />
        </span>
        <h1 className="font-display text-7xl font-bold text-white">404</h1>
        <p className="text-lg text-brand-100">This page wandered off the map.</p>
        <Link to="/">
          <Button variant="gold">Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
