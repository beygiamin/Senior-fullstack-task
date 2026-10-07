import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import type { AuthUser, UserRole } from '../../../types';
import { tokenStorage } from '../../../lib/storage/tokenStorage';
import { normalizeRoles } from '../utils/normalizeRoles';
import type { AuthResponse } from '../types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (response: AuthResponse) => void;
  logout: () => void;
  isRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(() => tokenStorage.getUser());
  const [token, setToken] = useState<string | null>(() => tokenStorage.getToken());

  const login = useCallback((response: AuthResponse) => {
    const nextUser: AuthUser = {
      id: response.userId,
      username: response.userName,
      roles: normalizeRoles(response.roles),
    };

    tokenStorage.setToken(response.token);
    tokenStorage.setUser(nextUser);
    setToken(response.token);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clearAuth();
    setToken(null);
    setUser(null);
  }, []);

  const isRole = useCallback(
    (role: UserRole) => Boolean(user && user.roles.includes(role)),
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user),
      login,
      logout,
      isRole,
    }),
    [isRole, login, logout, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

