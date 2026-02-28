import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

/**
 * Auth state shape stored in localStorage:
 * {
 *   token: string,
 *   role: 'student' | 'recruiter' | 'admin',
 *   user: { id, name, email, … }
 * }
 */
export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const stored = localStorage.getItem('evolvEd_auth');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((token, role, user) => {
    const authData = { token, role, user };
    localStorage.setItem('evolvEd_auth', JSON.stringify(authData));
    setAuth(authData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('evolvEd_auth');
    setAuth(null);
  }, []);

  const value = {
    auth,
    token: auth?.token ?? null,
    role: auth?.role ?? null,
    user: auth?.user ?? null,
    isAuthenticated: !!auth?.token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
