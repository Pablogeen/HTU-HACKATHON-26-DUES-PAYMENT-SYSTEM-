import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { VerifyPage } from '@/pages/auth/VerifyPage';
import { DashboardPage } from '@/pages/student/DashboardPage';
import { ProfilePage } from '@/pages/student/ProfilePage';
import { PayPage } from '@/pages/student/PayPage';
import { PaymentCallbackPage } from '@/pages/student/PaymentCallbackPage';
import { MyTransactionsPage } from '@/pages/student/MyTransactionsPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { StudentsPage } from '@/pages/admin/StudentsPage';
import { RegisterStudentPage } from '@/pages/admin/RegisterStudentPage';
import { EditStudentPage } from '@/pages/admin/EditStudentPage';
import { ImportStudentsPage } from '@/pages/admin/ImportStudentsPage';
import { ReportsPage } from '@/pages/admin/ReportsPage';
import { AdminTransactionsPage } from '@/pages/admin/AdminTransactionsPage';
import { PaymentLookupPage } from '@/pages/admin/PaymentLookupPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { useAuth } from '@/context/AuthContext';

function HomeRedirect() {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify" element={<VerifyPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<HomeRedirect />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route element={<ProtectedRoute roles={['STUDENT', 'PRESIDENT', 'FINANCIAL_SECRETARY']} />}>
            <Route path="pay" element={<PayPage />} />
            <Route path="payment/callback" element={<PaymentCallbackPage />} />
            <Route path="transactions" element={<MyTransactionsPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={['PRESIDENT', 'FINANCIAL_SECRETARY', 'ADMIN']} />}>
            <Route path="admin" element={<AdminDashboardPage />} />
            <Route path="admin/students" element={<StudentsPage />} />
            <Route path="admin/transactions" element={<AdminTransactionsPage />} />
            <Route path="admin/payments/:reference" element={<PaymentLookupPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={['PRESIDENT', 'ADMIN']} />}>
            <Route path="admin/students/register" element={<RegisterStudentPage />} />
            <Route path="admin/students/:email/edit" element={<EditStudentPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={['PRESIDENT', 'FINANCIAL_SECRETARY', 'ADMIN']} />}>
            <Route path="admin/students/import" element={<ImportStudentsPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={['PRESIDENT', 'FINANCIAL_SECRETARY']} />}>
            <Route path="admin/reports" element={<ReportsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
