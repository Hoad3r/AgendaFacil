import { createContext, useContext } from 'react';
import { useSession, signOut as authSignOut } from '@/lib/auth-client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { data: session, isPending: loading } = useSession();

  const user = session?.user ?? null;
  const isAuthenticated = !!user;

  async function logout() {
    await authSignOut();
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
