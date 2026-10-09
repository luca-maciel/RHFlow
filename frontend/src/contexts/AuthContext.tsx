import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type { ReactNode } from "react";

import { authService } from "../services/authService";

import type {
  AuthUser,
  LoginCredentials,
} from "../services/authService";

interface AuthContextType {
  user: AuthUser | null;

  isAuthenticated: boolean;

  loading: boolean;

  initializing: boolean;

  login: (
    credentials: LoginCredentials
  ) => Promise<void>;

  logout: () => void;

  hasPermission: (
    permission: string
  ) => boolean;
}

const AuthContext =
  createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [
    isAuthenticated,
    setIsAuthenticated,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [
    initializing,
    setInitializing,
  ] = useState(true);

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = useCallback(() => {
    authService.logout();

    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // ==========================================================
  // LOGIN
  // ==========================================================

  const login = async (
    credentials: LoginCredentials
  ) => {
    setLoading(true);

    try {
      await authService.login(credentials);

      const authenticatedUser =
        await authService.me();

      setUser(authenticatedUser);
      setIsAuthenticated(true);
    } catch (error) {
      authService.logout();

      setUser(null);
      setIsAuthenticated(false);

      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // PERMISSÕES
  // ==========================================================

  const hasPermission = (
    permission: string
  ): boolean => {
    return (
      user?.permissoes.includes(
        permission
      ) ?? false
    );
  };

  // ==========================================================
  // RECUPERAR SESSÃO
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const token = authService.getToken();

      if (!token) {
        if (!cancelled) {
          setUser(null);
          setIsAuthenticated(false);
          setInitializing(false);
        }

        return;
      }

      try {
        const authenticatedUser =
          await authService.me();

        if (!cancelled) {
          setUser(authenticatedUser);
          setIsAuthenticated(true);
        }
      } catch {
        authService.logout();

        if (!cancelled) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================================
  // LOGOUT AUTOMÁTICO EM 401
  // ==========================================================

  useEffect(() => {
    const handleLogoutEvent = () => {
      logout();
    };

    window.addEventListener(
      "rhflow:logout",
      handleLogoutEvent
    );

    return () => {
      window.removeEventListener(
        "rhflow:logout",
        handleLogoutEvent
      );
    };
  }, [logout]);

  // ==========================================================
  // SINCRONIZAR SESSÃO AO VOLTAR PARA ABA
  // ==========================================================

  useEffect(() => {
    const syncSession = () => {
      const token =
        authService.getToken();

      if (!token) {
        logout();
      }
    };

    window.addEventListener(
      "focus",
      syncSession
    );

    return () => {
      window.removeEventListener(
        "focus",
        syncSession
      );
    };
  }, [logout]);

  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        initializing,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ==========================================================
// HOOK
// ==========================================================

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth deve ser utilizado dentro de AuthProvider"
    );
  }

  return context;
}