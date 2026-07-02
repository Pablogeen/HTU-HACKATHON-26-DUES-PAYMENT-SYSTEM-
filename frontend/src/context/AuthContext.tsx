import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { api, configureApi, setStoredAuth } from '@/api/client';
import {
  clearPendingEmail,
  clearStoredAuth,
  getPendingEmail,
  getStoredAuth,
  setPendingEmail,
} from '@/lib/storage';
import type { Role } from '@/types/api';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  role: Role | null;
  accessToken: string | null;
  pendingEmail: string | null;
  login: (email: string) => Promise<string>;
  verify: (email: string, token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<string>;
  logout: () => Promise<void>;
  hasRole: (...roles: Role[]) => boolean;
  isAdmin: boolean;
  canManageStudents: boolean;
  canViewReports: boolean;
  canPay: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ADMIN_ROLES: Role[] = ['PRESIDENT', 'FINANCIAL_SECRETARY', 'ADMIN'];
const MANAGE_ROLES: Role[] = ['PRESIDENT', 'ADMIN'];
const REPORT_ROLES: Role[] = ['PRESIDENT', 'FINANCIAL_SECRETARY'];
const PAY_ROLES: Role[] = ['STUDENT', 'PRESIDENT', 'FINANCIAL_SECRETARY'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [pendingEmail, setPendingEmailState] = useState<string | null>(getPendingEmail());
  const refreshTokenRef = useRef<string | null>(null);

  const applyAuth = useCallback((access: string, refresh: string, userRole: Role) => {
    setAccessToken(access);
    setRole(userRole);
    refreshTokenRef.current = refresh;
    setStoredAuth({ accessToken: access, refreshToken: refresh, role: userRole });
  }, []);

  const clearAuth = useCallback(() => {
    setAccessToken(null);
    setRole(null);
    refreshTokenRef.current = null;
    clearStoredAuth();
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    const token = refreshTokenRef.current ?? getStoredAuth()?.refreshToken;
    if (!token) return false;

    try {
      const response = await api.auth.refresh({ refreshToken: token });
      applyAuth(response.accessToken, response.refreshToken, response.role);
      return true;
    } catch {
      clearAuth();
      return false;
    }
  }, [applyAuth, clearAuth]);

  useEffect(() => {
    configureApi({
      getAccessToken: () => accessToken ?? getStoredAuth()?.accessToken ?? null,
      onRefresh: refreshSession,
    });
  }, [accessToken, refreshSession]);

  useEffect(() => {
    const stored = getStoredAuth();
    if (stored) {
      setAccessToken(stored.accessToken);
      setRole(stored.role as Role);
      refreshTokenRef.current = stored.refreshToken;
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string) => {
    const message = await api.auth.login({ email });
    setPendingEmail(email);
    setPendingEmailState(email);
    return message;
  }, []);

  const verify = useCallback(
    async (email: string, token: string) => {
      const response = await api.auth.verify({ email, token });
      applyAuth(response.accessToken, response.refreshToken, response.role);
      clearPendingEmail();
      setPendingEmailState(null);
    },
    [applyAuth],
  );

  const resendVerification = useCallback(async (email: string) => {
    return api.auth.resendVerification(email);
  }, []);

  const logout = useCallback(async () => {
    const token = refreshTokenRef.current;
    if (token) {
      try {
        await api.auth.logout({ refreshToken: token });
      } catch {
        // still clear local session
      }
    }
    clearAuth();
    clearPendingEmail();
    setPendingEmailState(null);
  }, [clearAuth]);

  const hasRole = useCallback(
    (...roles: Role[]) => (role ? roles.includes(role) : false),
    [role],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: !!accessToken,
      isLoading,
      role,
      accessToken,
      pendingEmail,
      login,
      verify,
      resendVerification,
      logout,
      hasRole,
      isAdmin: role ? ADMIN_ROLES.includes(role) : false,
      canManageStudents: role ? MANAGE_ROLES.includes(role) : false,
      canViewReports: role ? REPORT_ROLES.includes(role) : false,
      canPay: role ? PAY_ROLES.includes(role) : false,
    }),
    [
      accessToken,
      isLoading,
      role,
      pendingEmail,
      login,
      verify,
      resendVerification,
      logout,
      hasRole,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
