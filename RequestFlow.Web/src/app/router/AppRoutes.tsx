import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppConfig } from '../providers/appConfigContext';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { SignupPage } from '../../features/auth/pages/SignupPage';
import { CreateRequestPage } from '../../features/requests/pages/CreateRequestPage';
import { RequestsPage } from '../../features/requests/pages/RequestsPage';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/requests" replace />;
  }

  return <>{children}</>;
}

function AppLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, logout } = useAuth();
  const { roleLabels } = useAppConfig();

  return (
    <>
      {isAuthenticated ? (
        <header className="app-header">
          <div>
            <p className="eyebrow">RequestFlow</p>
            <h2>فضای تایید</h2>
          </div>

          <div className="header-user">
            <div className="user-chip-group">
              <Badge variant="outline">{user?.username ?? 'کاربر'}</Badge>
              {user?.roles.length ? (
                user.roles.map((role) => (
                  <Badge key={role} variant="secondary">
                    {roleLabels[role] ?? role}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline">بدون نقش</Badge>
              )}
            </div>
            <Button type="button" variant="outline" onClick={logout}>
              خروج
            </Button>
          </div>
        </header>
      ) : null}

      <div className="page-shell">{children}</div>
    </>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <AppLayout>
              <LoginPage />
            </AppLayout>
          </PublicRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicRoute>
            <AppLayout>
              <SignupPage />
            </AppLayout>
          </PublicRoute>
        }
      />

      <Route
        path="/requests"
        element={
          <ProtectedRoute>
            <AppLayout>
              <RequestsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/requests/new"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CreateRequestPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/requests" replace />} />
      <Route path="*" element={<Navigate to="/requests" replace />} />
    </Routes>
  );
}
