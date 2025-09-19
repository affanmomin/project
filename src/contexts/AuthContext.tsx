import React, { createContext, useContext, useMemo } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface Session {
  user: User;
  token: string;
  expiresAt: Date;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authValue = useMemo(() => {
    // For now, provide minimal auth state everywhere
    return {
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      refreshSession: () => {},
    };
  }, []);

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}