import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Wallet,
  Receipt,
  Users,
  UserPlus,
  UploadCloud,
  BarChart3,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatRole } from '@/types/api';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { role, isAdmin, canPay, canViewReports, canManageStudents, logout } = useAuth();

  const studentLinks: NavItem[] = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/profile', label: 'My Profile', icon: User },
    ...(canPay ? [{ to: '/pay', label: 'Pay Dues', icon: Wallet }] : []),
    ...(canPay ? [{ to: '/transactions', label: 'My Transactions', icon: Receipt }] : []),
  ];

  const adminLinks: NavItem[] = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/students', label: 'Students', icon: Users },
    ...(canManageStudents
      ? [{ to: '/admin/students/register', label: 'Register Student', icon: UserPlus }]
      : []),
    { to: '/admin/students/import', label: 'Import CSV', icon: UploadCloud },
    ...(canViewReports ? [{ to: '/admin/reports', label: 'Reports', icon: BarChart3 }] : []),
    { to: '/admin/transactions', label: 'Transactions', icon: Receipt },
    ...(canPay ? [{ to: '/pay', label: 'Pay Dues', icon: Wallet }] : []),
    ...(canPay ? [{ to: '/transactions', label: 'My Transactions', icon: Receipt }] : []),
    { to: '/profile', label: 'My Profile', icon: User },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-brand-800 to-brand-900">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 text-sm font-bold text-brand-900 shadow-[0_0_0_3px_rgba(244,180,0,0.15)]">
            C
          </div>
          <div>
            <p className="font-display text-sm font-bold leading-tight text-white">COMPSSA Dues</p>
            <p className="text-xs text-brand-200">Ho Technical University</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/10 text-white shadow-[inset_2px_0_0_0_theme(colors.gold.400)]'
                    : 'text-brand-100/80 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0 text-teal-300 group-hover:text-teal-200" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="weave-trace-faint h-2 w-full" />

      <div className="border-t border-white/10 p-4">
        {role && (
          <p className="mb-3 truncate text-xs text-brand-200">
            Role: <span className="font-medium text-white">{formatRole(role)}</span>
          </p>
        )}
        <button
          type="button"
          onClick={() => logout()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/10"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
